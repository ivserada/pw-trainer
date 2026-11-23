import type { FastifyInstance } from 'fastify'
import { getSessionId } from '../lib/http.js'
import { z } from '../lib/validate.js'
import { getDB, getOrCreateCart } from '../store.js'
import type { Cart } from '../types.js'

export function cartView(cart: Cart) {
  const db = getDB()
  const items = cart.items
    .map((it) => {
      const product = db.products.find((p) => p.id === it.productId)
      if (!product) return null
      return {
        productId: it.productId,
        qty: it.qty,
        product: {
          id: product.id,
          name: product.name,
          priceCents: product.priceCents,
          hue: product.hue,
          stock: product.stock,
        },
      }
    })
    .filter((x): x is NonNullable<typeof x> => x !== null)
  const subtotalCents = items.reduce((sum, it) => sum + it.product.priceCents * it.qty, 0)
  const promo = cart.promoCode ? db.promoCodes.find((p) => p.code === cart.promoCode) : undefined
  const discountCents = promo ? Math.round((subtotalCents * promo.percent) / 100) : 0
  return {
    items,
    promoCode: cart.promoCode,
    discountPercent: promo?.percent ?? 0,
    subtotalCents,
    discountCents,
    totalCents: subtotalCents - discountCents,
  }
}

const addSchema = z.object({
  productId: z.string().min(1),
  qty: z.number().integer().min(1).max(99).default(1),
})

const qtySchema = z.object({
  qty: z.number().integer().min(0).max(99),
})

const promoSchema = z.object({
  code: z.string().max(30),
})

export function registerCartRoutes(app: FastifyInstance): void {
  app.get('/api/cart', async (request, reply) => {
    const sid = getSessionId(request, reply)
    const cart = getOrCreateCart(getDB(), sid)
    return cartView(cart)
  })

  app.post('/api/cart', async (request, reply) => {
    const sid = getSessionId(request, reply)
    const db = getDB()
    const body = addSchema.parse(request.body)
    const product = db.products.find((p) => p.id === body.productId)
    if (!product) {
      return reply.code(404).send({ error: 'NotFound', message: 'Товар не найден' })
    }
    const cart = getOrCreateCart(db, sid)
    const existing = cart.items.find((it) => it.productId === body.productId)
    if (existing) existing.qty = Math.min(99, existing.qty + body.qty)
    else cart.items.push({ productId: body.productId, qty: body.qty })
    return cartView(cart)
  })

  app.patch('/api/cart/:productId', async (request, reply) => {
    const sid = getSessionId(request, reply)
    const { productId } = request.params as { productId: string }
    const body = qtySchema.parse(request.body)
    const cart = getOrCreateCart(getDB(), sid)
    if (body.qty === 0) {
      cart.items = cart.items.filter((it) => it.productId !== productId)
    } else {
      const existing = cart.items.find((it) => it.productId === productId)
      if (!existing) {
        return reply.code(404).send({ error: 'NotFound', message: 'Позиции нет в корзине' })
      }
      existing.qty = body.qty
    }
    return cartView(cart)
  })

  app.delete('/api/cart/:productId', async (request, reply) => {
    const sid = getSessionId(request, reply)
    const { productId } = request.params as { productId: string }
    const cart = getOrCreateCart(getDB(), sid)
    cart.items = cart.items.filter((it) => it.productId !== productId)
    return cartView(cart)
  })

  app.post('/api/cart/promo', async (request, reply) => {
    const sid = getSessionId(request, reply)
    const db = getDB()
    const body = promoSchema.parse(request.body)
    const cart = getOrCreateCart(db, sid)
    const code = body.code.trim().toUpperCase()
    if (!code) {
      cart.promoCode = null
      return cartView(cart)
    }
    const promo = db.promoCodes.find((p) => p.code === code)
    if (!promo) {
      return reply.code(400).send({ error: 'InvalidPromo', message: `Промокод ${code} не найден` })
    }
    cart.promoCode = promo.code
    return cartView(cart)
  })
}
