import type { FastifyInstance } from 'fastify'
import { canRole, getSessionId, publicUser, requireAuth, requireRole } from '../lib/http.js'
import { buildInvoicePdf } from '../lib/pdf.js'
import { z } from '../lib/validate.js'
import { getDB, getOrCreateCart } from '../store.js'
import type { Order } from '../types.js'

const checkoutSchema = z.object({
  email: z.email(),
  phone: z.string().min(6).max(30),
  address: z.string().min(5).max(300),
  payment: z.enum(['card', 'cash'] as const),
  name: z.string().max(100).optional(),
})

function canSeeOrder(order: Order, userId: string | null, role: string): boolean {
  if (order.userId && order.userId === userId) return true
  return role === 'admin' || role === 'manager'
}

function pushEvent(kind: 'order', text: string): void {
  const db = getDB()
  db.events.push({
    id: `e-${Date.now()}-${db.events.length}`,
    kind,
    text,
    at: new Date().toISOString(),
  })
  notifyFeedListeners()
}

/** SSE-лента: список активных соединений (заполняется в routes/realtime.ts). */
const feedListeners = new Set<
  (event: { id: string; kind: string; text: string; at: string }) => void
>()
export function addFeedListener(
  fn: (e: { id: string; kind: string; text: string; at: string }) => void,
): () => void {
  feedListeners.add(fn)
  return () => feedListeners.delete(fn)
}
function notifyFeedListeners(): void {
  const last = getDB().events[getDB().events.length - 1]
  if (!last) return
  for (const fn of feedListeners) fn(last)
}

export function registerOrderRoutes(app: FastifyInstance): void {
  app.get('/api/orders', { preHandler: requireAuth }, async (request) => {
    const { user } = request.auth!
    const orders = getDB()
      .orders.filter((o) => canSeeOrder(o, user.id, user.role))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    return orders
  })

  app.post('/api/orders', async (request, reply) => {
    const sid = getSessionId(request, reply)
    const db = getDB()
    const body = checkoutSchema.parse(request.body)
    const cart = getOrCreateCart(db, sid)
    if (cart.items.length === 0) {
      return reply.code(400).send({ error: 'EmptyCart', message: 'Корзина пуста' })
    }
    const items = cart.items
      .map((it) => {
        const product = db.products.find((p) => p.id === it.productId)
        return product ? { product, qty: it.qty } : null
      })
      .filter((x): x is NonNullable<typeof x> => x !== null)
    const outOfStock = items.find(({ product, qty }) => product.stock < qty)
    if (outOfStock) {
      return reply.code(409).send({
        error: 'OutOfStock',
        message: `Недостаточно остатков: ${outOfStock.product.name}`,
      })
    }
    const subtotalCents = items.reduce((sum, { product, qty }) => sum + product.priceCents * qty, 0)
    const promo = cart.promoCode ? db.promoCodes.find((p) => p.code === cart.promoCode) : undefined
    const discountCents = promo ? Math.round((subtotalCents * promo.percent) / 100) : 0
    const tokenUserId = (request.headers.authorization ?? '').startsWith('Bearer ')
      ? (request.auth?.user.id ?? null)
      : null
    const order: Order = {
      id: `o${db.orderSeq}`,
      number: `ORD-2026-${String(db.orderSeq).padStart(3, '0')}`,
      userId: tokenUserId,
      email: body.email,
      phone: body.phone,
      address: body.address,
      payment: body.payment,
      status: 'new',
      items: items.map(({ product, qty }) => ({
        productId: product.id,
        name: product.name,
        priceCents: product.priceCents,
        qty,
      })),
      promoCode: promo?.code ?? null,
      discountCents,
      totalCents: subtotalCents - discountCents,
      createdAt: new Date().toISOString(),
    }
    db.orderSeq += 1
    for (const { product, qty } of items) {
      product.stock = Math.max(0, product.stock - qty)
    }
    db.orders.push(order)
    cart.items = []
    cart.promoCode = null
    pushEvent('order', `Заказ ${order.number} оформлен на ${order.totalCents / 100} ₽`)
    return reply.code(201).send(order)
  })

  app.get('/api/orders/:id', { preHandler: requireAuth }, async (request, reply) => {
    const { user } = request.auth!
    const { id } = request.params as { id: string }
    const order = getDB().orders.find((o) => o.id === id || o.number === id)
    if (!order) return reply.code(404).send({ error: 'NotFound', message: 'Заказ не найден' })
    if (!canSeeOrder(order, user.id, user.role)) {
      return reply.code(403).send({ error: 'Forbidden', message: 'Это чужой заказ' })
    }
    return order
  })

  app.get('/api/orders/:id/invoice', async (request, reply) => {
    const { id } = request.params as { id: string }
    const order = getDB().orders.find((o) => o.id === id || o.number === id)
    if (!order) return reply.code(404).send({ error: 'NotFound', message: 'Заказ не найден' })
    const lines = [
      `Заказ: ${order.number}`,
      `Дата: ${order.createdAt.slice(0, 10)}`,
      `Покупатель: ${order.email}`,
      `Телефон: ${order.phone}`,
      `Адрес: ${order.address}`,
      '--------------------------------------',
      ...order.items.map(
        (it) => `${it.name}  x${it.qty}  —  ${((it.priceCents * it.qty) / 100).toFixed(2)} RUB`,
      ),
      '--------------------------------------',
      `Скидка: ${(order.discountCents / 100).toFixed(2)} RUB`,
      `ИТОГО: ${(order.totalCents / 100).toFixed(2)} RUB`,
    ]
    const pdf = buildInvoicePdf({ title: `Счёт ${order.number}`, lines })
    return reply
      .header('Content-Type', 'application/pdf')
      .header('Content-Disposition', `attachment; filename="invoice-${order.number}.pdf"`)
      .send(pdf)
  })
}

export { publicUser, requireRole, canRole }
