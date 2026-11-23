import type { FastifyInstance } from 'fastify'
import { z } from '../lib/validate.js'
import { getDB } from '../store.js'

const listQuerySchema = z.object({
  q: z.string().max(100).optional(),
  category: z.string().max(60).optional(),
  sort: z.enum(['price_asc', 'price_desc', 'rating', 'name']).optional(),
  minPrice: z.number().min(0).optional(),
  maxPrice: z.number().min(0).optional(),
  inStock: z.boolean().optional(),
  featured: z.boolean().optional(),
  page: z.number().integer().min(1).default(1),
  pageSize: z.number().integer().min(1).max(100).default(12),
})

type ListQuery = ReturnType<typeof listQuerySchema.parse>

function filterProducts(query: ListQuery) {
  const db = getDB()
  let items = db.products.slice()
  if (query.q) {
    const needle = query.q.toLowerCase()
    items = items.filter((p) => p.name.toLowerCase().includes(needle))
  }
  if (query.category) {
    const cat =
      db.categories.find((c) => c.id === query.category || c.slug === query.category) ?? null
    items = cat ? items.filter((p) => p.categoryId === cat.id) : []
  }
  if (query.minPrice !== undefined) {
    const cents = Math.round(query.minPrice * 100)
    items = items.filter((p) => p.priceCents >= cents)
  }
  if (query.maxPrice !== undefined) {
    const cents = Math.round(query.maxPrice * 100)
    items = items.filter((p) => p.priceCents <= cents)
  }
  if (query.inStock) items = items.filter((p) => p.stock > 0)
  if (query.featured) items = items.filter((p) => p.featured)
  switch (query.sort) {
    case 'price_asc':
      items.sort((a, b) => a.priceCents - b.priceCents)
      break
    case 'price_desc':
      items.sort((a, b) => b.priceCents - a.priceCents)
      break
    case 'rating':
      items.sort((a, b) => b.rating - a.rating)
      break
    case 'name':
      items.sort((a, b) => a.name.localeCompare(b.name, 'ru'))
      break
  }
  return items
}

const reviewSchema = z.object({
  author: z.string().min(2).max(60),
  rating: z.number().integer().min(1).max(5),
  text: z.string().min(4).max(500),
})

export function registerProductRoutes(app: FastifyInstance): void {
  app.get('/api/categories', async () => getDB().categories)

  app.get('/api/products', async (request, reply) => {
    let query: ListQuery
    try {
      query = listQuerySchema.parse(request.query)
    } catch {
      return reply.code(400).send({ error: 'BadQuery', message: 'Невалидные query-параметры' })
    }
    const all = filterProducts(query)
    const total = all.length
    const pages = Math.max(1, Math.ceil(total / query.pageSize))
    const page = Math.min(query.page, pages)
    const items = all.slice((page - 1) * query.pageSize, page * query.pageSize)
    return { items, total, page, pages, pageSize: query.pageSize }
  })

  app.get('/api/products/:id', async (request, reply) => {
    const { id } = request.params as { id: string }
    const product = getDB().products.find((p) => p.id === id || p.slug === id)
    if (!product) {
      return reply.code(404).send({ error: 'NotFound', message: `Товар ${id} не найден` })
    }
    const category = getDB().categories.find((c) => c.id === product.categoryId) ?? null
    const reviewCount = getDB().reviews.filter((r) => r.productId === product.id).length
    return { ...product, category, reviewCount }
  })

  app.get('/api/products/:id/reviews', async (request, reply) => {
    const { id } = request.params as { id: string }
    if (!getDB().products.some((p) => p.id === id)) {
      return reply.code(404).send({ error: 'NotFound', message: 'Товар не найден' })
    }
    return getDB()
      .reviews.filter((r) => r.productId === id)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  })

  app.post('/api/products/:id/reviews', async (request, reply) => {
    const { id } = request.params as { id: string }
    const db = getDB()
    if (!db.products.some((p) => p.id === id)) {
      return reply.code(404).send({ error: 'NotFound', message: 'Товар не найден' })
    }
    const body = reviewSchema.parse(request.body)
    const review = {
      id: `r-${Date.now()}`,
      productId: id,
      author: body.author,
      rating: body.rating,
      text: body.text,
      createdAt: new Date().toISOString(),
    }
    db.reviews.push(review)
    db.events.push({
      id: `e-${Date.now()}`,
      kind: 'review',
      text: `Новый отзыв на «${db.products.find((p) => p.id === id)!.name}»`,
      at: review.createdAt,
    })
    return reply.code(201).send(review)
  })
}
