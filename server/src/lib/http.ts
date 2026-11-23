import { randomBytes } from 'node:crypto'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { verifyAccessToken } from './auth.js'
import { getDB } from '../store.js'
import type { Role, User } from '../types.js'

export const SESSION_COOKIE = 'sid'

/** Возвращает session id из cookie, при необходимости выставляя новую cookie. */
export function getSessionId(request: FastifyRequest, reply: FastifyReply): string {
  const existing = request.cookies[SESSION_COOKIE]
  if (existing && /^[a-f0-9]{32}$/.test(existing)) return existing
  const sid = randomBytes(16).toString('hex')
  reply.setCookie(SESSION_COOKIE, sid, {
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30,
  })
  return sid
}

function extractToken(request: FastifyRequest): string | null {
  const header = request.headers.authorization
  if (header?.startsWith('Bearer ')) return header.slice(7)
  return null
}

/** preHandler: требует валидный Bearer token, кладёт пользователя в request.auth. */
export async function requireAuth(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  const token = extractToken(request)
  const payload = token ? await verifyAccessToken(token) : null
  const user = payload ? getDB().users.find((u) => u.id === payload.sub) : null
  if (!user) {
    await reply.code(401).send({ error: 'Unauthorized', message: 'Нужен access token' })
    return
  }
  request.auth = { user }
}

/** preHandler: требует роль (admin ⊃ manager ⊃ customer). */
export function requireRole(...roles: Role[]) {
  return async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    await requireAuth(request, reply)
    if (reply.sent) return
    const user = request.auth!.user
    const allowed = roles.some((role) => canRole(user.role, role))
    if (!allowed) {
      await reply
        .code(403)
        .send({ error: 'Forbidden', message: `Нужна роль: ${roles.join(' или ')}` })
    }
  }
}

export function canRole(actual: Role, required: Role): boolean {
  const rank: Record<Role, number> = { customer: 0, manager: 1, admin: 2 }
  return rank[actual] >= rank[required]
}

export function publicUser(user: User) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    otpEnabled: user.otpEnabled,
    avatarHue: user.avatarHue,
  }
}
