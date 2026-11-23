import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import { z } from '../lib/validate.js'
import { config } from '../config.js'
import { hashPassword } from '../lib/password.js'
import { currentOtp } from '../lib/auth.js'
import { getDB, resetDB } from '../store.js'
import { DEFAULT_FLAGS, type Role } from '../types.js'

function guard(request: FastifyRequest, reply: FastifyReply): boolean {
  if (config.testApiEnabled) return true
  void reply.code(404).send({ error: 'NotFound', message: 'Тестовые эндпоинты отключены' })
  return false
}

const flagsSchema = z.object({
  apiDelayMs: z.number().min(0).max(10000).optional(),
  apiErrorRate: z.number().min(0).max(1).optional(),
  vanishMs: z.number().min(0).optional(),
  movingButtons: z.boolean().optional(),
  rerenderMs: z.number().min(0).optional(),
  slowImages: z.boolean().optional(),
})

const createUserSchema = z.object({
  email: z.email(),
  password: z.string().min(6),
  role: z.enum(['customer', 'manager', 'admin'] as const).optional(),
  name: z.string().min(1).max(100).optional(),
  otpEnabled: z.boolean().optional(),
})

export function registerTestRoutes(app: FastifyInstance): void {
  app.post('/api/test/reset', async (request, reply) => {
    if (!guard(request, reply)) return
    resetDB()
    return { ok: true }
  })

  app.post('/api/test/seed', async (request, reply) => {
    if (!guard(request, reply)) return
    resetDB()
    return { ok: true }
  })

  app.get('/api/test/flags', async (request, reply) => {
    if (!guard(request, reply)) return
    return getDB().flags
  })

  app.post('/api/test/flags', async (request, reply) => {
    if (!guard(request, reply)) return
    const body = flagsSchema.parse(request.body ?? {})
    const db = getDB()
    db.flags = { ...DEFAULT_FLAGS, ...body }
    return db.flags
  })

  app.get('/api/test/otp', async (request, reply) => {
    if (!guard(request, reply)) return
    const { email } = request.query as { email?: string }
    const user = getDB().users.find((u) => u.email === email)
    if (!user) return reply.code(404).send({ error: 'NotFound', message: 'Пользователь не найден' })
    return { email: user.email, ...currentOtp(user) }
  })

  app.post('/api/test/create-user', async (request, reply) => {
    if (!guard(request, reply)) return
    const body = createUserSchema.parse(request.body)
    const db = getDB()
    if (db.users.some((u) => u.email === body.email)) {
      return reply.code(409).send({ error: 'Conflict', message: 'Email уже занят' })
    }
    const id = `u-test-${db.users.length + 1}`
    const user = {
      id,
      email: body.email,
      name: body.name ?? body.email.split('@')[0],
      role: (body.role ?? 'customer') as Role,
      passwordHash: hashPassword(body.password),
      avatarHue: Math.floor(Math.random() * 360),
      otpEnabled: body.otpEnabled ?? false,
    }
    db.users.push(user)
    return reply.code(201).send({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        otpEnabled: user.otpEnabled,
      },
    })
  })
}
