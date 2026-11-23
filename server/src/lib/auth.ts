import { createHmac, randomBytes } from 'node:crypto'
import { SignJWT, jwtVerify } from 'jose'
import { config } from '../config.js'
import { getDB } from '../store.js'
import type { Role, User } from '../types.js'

const secret = new TextEncoder().encode(config.jwtSecret)

export interface AccessPayload {
  sub: string
  role: Role
  name: string
  email: string
}

export interface AuthContext {
  user: User
}

declare module 'fastify' {
  interface FastifyRequest {
    auth: AuthContext | null
  }
}

export async function signAccessToken(user: User): Promise<string> {
  return new SignJWT({ role: user.role, name: user.name, email: user.email })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime(`${config.accessTokenTtlSec}s`)
    .sign(secret)
}

export async function verifyAccessToken(token: string): Promise<AccessPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret)
    if (!payload.sub) return null
    return {
      sub: payload.sub,
      role: (payload.role as Role) ?? 'customer',
      name: (payload.name as string) ?? '',
      email: (payload.email as string) ?? '',
    }
  } catch {
    return null
  }
}

export function createRefreshToken(userId: string): string {
  const token = randomBytes(32).toString('hex')
  getDB().refreshTokens.set(token, {
    userId,
    expires: Date.now() + config.refreshTokenTtlMs,
  })
  return token
}

export function rotateRefreshToken(token: string): { userId: string; token: string } | null {
  const db = getDB()
  const entry = db.refreshTokens.get(token)
  if (!entry) return null
  db.refreshTokens.delete(token)
  if (entry.expires < Date.now()) return null
  return { userId: entry.userId, token: createRefreshToken(entry.userId) }
}

export function revokeRefreshToken(token: string | undefined): void {
  if (token) getDB().refreshTokens.delete(token)
}

/* ---------- OTP (тестовый 2FA) ---------- */

function otpFor(userId: string, window: number): string {
  const hmac = createHmac('sha256', config.jwtSecret)
  hmac.update(`${userId}:${window}`)
  return String(parseInt(hmac.digest('hex').slice(0, 8), 16) % 1000000).padStart(6, '0')
}

export function currentOtp(user: User): { otp: string; validForSec: number } {
  const nowWindow = Math.floor(Date.now() / (config.otpWindowSec * 1000))
  return {
    otp: otpFor(user.id, nowWindow),
    validForSec: config.otpWindowSec - Math.floor((Date.now() / 1000) % config.otpWindowSec),
  }
}

export function verifyOtp(user: User, code: string): boolean {
  const nowWindow = Math.floor(Date.now() / (config.otpWindowSec * 1000))
  return otpFor(user.id, nowWindow) === code || otpFor(user.id, nowWindow - 1) === code
}

/** Короткоживущий токен промежуточной сессии OTP. */
export async function signOtpSession(userId: string): Promise<string> {
  return new SignJWT({ kind: 'otp' })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(userId)
    .setExpirationTime('5m')
    .sign(secret)
}

export async function verifyOtpSession(token: string): Promise<string | null> {
  try {
    const { payload } = await jwtVerify(token, secret)
    if (payload.kind !== 'otp' || !payload.sub) return null
    return payload.sub
  } catch {
    return null
  }
}
