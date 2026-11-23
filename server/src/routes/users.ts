import type { FastifyInstance } from 'fastify'
import { publicUser, requireAuth, requireRole } from '../lib/http.js'
import { z } from '../lib/validate.js'
import { getDB } from '../store.js'

const patchMeSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  avatarHue: z.number().min(0).max(359).optional(),
})

const adminProductSchema = z.object({
  name: z.string().min(2).max(120),
  categoryId: z.string().min(1),
  priceCents: z.number().integer().min(1),
  stock: z.number().integer().min(0),
  description: z.string().max(500).optional(),
  hue: z.number().min(0).max(359).optional(),
})

const adminProductPatchSchema = z.object({
  name: z.string().min(2).max(120).optional(),
  priceCents: z.number().integer().min(1).optional(),
  stock: z.number().integer().min(0).optional(),
  description: z.string().max(500).optional(),
  hue: z.number().min(0).max(359).optional(),
  featured: z.boolean().optional(),
})

export function registerUserRoutes(app: FastifyInstance): void {
  app.patch('/api/users/me', { preHandler: requireAuth }, async (request) => {
    const { user } = request.auth!
    const body = patchMeSchema.parse(request.body)
    if (body.name !== undefined) user.name = body.name
    if (body.avatarHue !== undefined) user.avatarHue = body.avatarHue
    return publicUser(user)
  })

  app.get('/api/admin/users', { preHandler: requireRole('admin') }, async () =>
    getDB().users.map(publicUser),
  )

  app.get('/api/admin/stats', { preHandler: requireRole('manager') }, async () => {
    const db = getDB()
    const revenue = db.orders
      .filter((o) => o.status !== 'cancelled')
      .reduce((sum, o) => sum + o.totalCents, 0)
    return {
      products: db.products.length,
      users: db.users.length,
      orders: db.orders.length,
      reviews: db.reviews.length,
      revenueCents: revenue,
      lowStock: db.products.filter((p) => p.stock > 0 && p.stock < 10).length,
      outOfStock: db.products.filter((p) => p.stock === 0).length,
    }
  })

  app.post(
    '/api/admin/products',
    { preHandler: requireRole('manager') },
    async (request, reply) => {
      const db = getDB()
      const body = adminProductSchema.parse(request.body)
      if (!db.categories.some((c) => c.id === body.categoryId)) {
        return reply.code(400).send({ error: 'BadCategory', message: 'Категория не найдена' })
      }
      const seq = db.products.length + 1
      const product = {
        id: `p${seq}`,
        slug: `custom-${seq}`,
        name: body.name,
        categoryId: body.categoryId,
        priceCents: body.priceCents,
        rating: 0,
        stock: body.stock,
        hue: body.hue ?? Math.floor(Math.random() * 360),
        description: body.description ?? '',
        featured: false,
      }
      db.products.push(product)
      return reply.code(201).send(product)
    },
  )

  app.patch(
    '/api/admin/products/:id',
    { preHandler: requireRole('manager') },
    async (request, reply) => {
      const db = getDB()
      const { id } = request.params as { id: string }
      const product = db.products.find((p) => p.id === id)
      if (!product) return reply.code(404).send({ error: 'NotFound', message: 'Товар не найден' })
      const body = adminProductPatchSchema.parse(request.body)
      Object.assign(product, body)
      return product
    },
  )

  app.delete(
    '/api/admin/products/:id',
    { preHandler: requireRole('manager') },
    async (request, reply) => {
      const db = getDB()
      const { id } = request.params as { id: string }
      const index = db.products.findIndex((p) => p.id === id)
      if (index === -1)
        return reply.code(404).send({ error: 'NotFound', message: 'Товар не найден' })
      const [removed] = db.products.splice(index, 1)
      return { ok: true, removed: removed.id }
    },
  )
}
