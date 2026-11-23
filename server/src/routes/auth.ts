import type { FastifyInstance, FastifyReply } from 'fastify'
import { REFRESH_COOKIE, config } from '../config.js'
import {
  createRefreshToken,
  revokeRefreshToken,
  rotateRefreshToken,
  signAccessToken,
  signOtpSession,
  verifyOtp,
  verifyOtpSession,
} from '../lib/auth.js'
import { publicUser, requireAuth } from '../lib/http.js'
import { hashPassword, verifyPassword } from '../lib/password.js'
import { z } from '../lib/validate.js'
import { getDB } from '../store.js'
import type { User } from '../types.js'

const registerSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.email(),
  password: z.string().min(6).max(72),
})

const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(1).max(72),
})

const otpSchema = z.object({
  otpToken: z.string().min(10),
  code: z.string().min(4).max(8),
})

function setRefreshCookie(reply: FastifyReply, token: string): void {
  reply.setCookie(REFRESH_COOKIE, token, {
    path: '/api/auth',
    httpOnly: true,
    sameSite: 'lax',
    secure: false, // локальный тренажёр без TLS
    maxAge: Math.floor(config.refreshTokenTtlMs / 1000),
  })
}

function issueTokens(user: User) {
  return { accessTokenPromise: signAccessToken(user), refreshToken: createRefreshToken(user.id) }
}

export function registerAuthRoutes(app: FastifyInstance): void {
  app.post('/api/auth/register', async (request, reply) => {
    const db = getDB()
    const body = registerSchema.parse(request.body)
    const email = body.email.toLowerCase()
    if (db.users.some((u) => u.email.toLowerCase() === email)) {
      return reply
        .code(409)
        .send({ error: 'Conflict', message: 'Пользователь с таким email уже существует' })
    }
    const user: User = {
      id: `u-${Date.now()}`,
      email,
      name: body.name,
      role: 'customer',
      passwordHash: hashPassword(body.password),
      avatarHue: Math.floor(Math.random() * 360),
      otpEnabled: false,
    }
    db.users.push(user)
    const { accessTokenPromise, refreshToken } = issueTokens(user)
    setRefreshCookie(reply, refreshToken)
    return reply.code(201).send({ user: publicUser(user), accessToken: await accessTokenPromise })
  })

  app.post('/api/auth/login', async (request, reply) => {
    const db = getDB()
    const body = loginSchema.parse(request.body)
    const user = db.users.find((u) => u.email.toLowerCase() === body.email.toLowerCase())
    if (!user || !verifyPassword(body.password, user.passwordHash)) {
      return reply
        .code(401)
        .send({ error: 'InvalidCredentials', message: 'Неверный email или пароль' })
    }
    if (user.otpEnabled) {
      return { requiresOtp: true, otpToken: await signOtpSession(user.id) }
    }
    const { accessTokenPromise, refreshToken } = issueTokens(user)
    setRefreshCookie(reply, refreshToken)
    return { user: publicUser(user), accessToken: await accessTokenPromise }
  })

  app.post('/api/auth/otp', async (request, reply) => {
    const db = getDB()
    const body = otpSchema.parse(request.body)
    const userId = await verifyOtpSession(body.otpToken)
    const user = userId ? db.users.find((u) => u.id === userId) : undefined
    if (!user) {
      return reply.code(401).send({ error: 'InvalidOtpToken', message: 'Сессия OTP истекла' })
    }
    if (!verifyOtp(user, body.code)) {
      return reply.code(401).send({ error: 'InvalidOtp', message: 'Неверный код подтверждения' })
    }
    const { accessTokenPromise, refreshToken } = issueTokens(user)
    setRefreshCookie(reply, refreshToken)
    return { user: publicUser(user), accessToken: await accessTokenPromise }
  })

  app.post('/api/auth/refresh', async (request, reply) => {
    const token = request.cookies[REFRESH_COOKIE]
    if (!token) {
      return reply.code(401).send({ error: 'NoRefreshToken', message: 'Нет refresh cookie' })
    }
    const rotated = rotateRefreshToken(token)
    if (!rotated) {
      return reply
        .code(401)
        .send({ error: 'InvalidRefreshToken', message: 'Refresh token недействителен' })
    }
    const user = getDB().users.find((u) => u.id === rotated.userId)
    if (!user) {
      return reply.code(401).send({ error: 'InvalidRefreshToken', message: 'Пользователь удалён' })
    }
    setRefreshCookie(reply, rotated.token)
    return { accessToken: await signAccessToken(user) }
  })

  app.post('/api/auth/logout', async (request, reply) => {
    revokeRefreshToken(request.cookies[REFRESH_COOKIE])
    reply.clearCookie(REFRESH_COOKIE, { path: '/api/auth' })
    return reply.code(204).send()
  })

  app.get('/api/auth/me', { preHandler: requireAuth }, async (request) =>
    publicUser(request.auth!.user),
  )
}
