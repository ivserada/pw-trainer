import type { FastifyInstance } from 'fastify'
import { addFeedListener } from './orders.js'
import { getDB } from '../store.js'

const chatClients = new Set<{ send: (data: string) => void }>()

export function registerRealtimeRoutes(app: FastifyInstance): void {
  /* ---------- WebSocket-чат ---------- */
  app.get('/ws/chat', { websocket: true }, (socket) => {
    const client = {
      send: (data: string) => {
        try {
          socket.send(data)
        } catch {
          /* соединение закрыто */
        }
      },
    }
    chatClients.add(client)
    client.send(JSON.stringify({ type: 'history', messages: getDB().chat.slice(-20) }))
    socket.on('message', (raw: Buffer) => {
      let parsed: { author?: string; text?: string }
      try {
        parsed = JSON.parse(raw.toString())
      } catch {
        return
      }
      const author = String(parsed.author ?? '').slice(0, 60) || 'Аноним'
      const text = String(parsed.text ?? '').slice(0, 500)
      if (!text) return
      const message = {
        id: `m-${Date.now()}-${Math.floor(Math.random() * 1e4)}`,
        author,
        text,
        at: new Date().toISOString(),
      }
      getDB().chat.push(message)
      const payload = JSON.stringify({ type: 'message', message })
      for (const c of chatClients) c.send(payload)
    })
    socket.on('close', () => chatClients.delete(client))
  })

  /* ---------- SSE-лента событий ---------- */
  app.get('/api/feed', (request, reply) => {
    reply.raw.writeHead(200, {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    })
    reply.raw.write(': connected\n\n')
    for (const event of getDB().events.slice(-15)) {
      reply.raw.write(`event: message\ndata: ${JSON.stringify(event)}\n\n`)
    }
    const unsubscribe = addFeedListener((event) => {
      reply.raw.write(`event: message\ndata: ${JSON.stringify(event)}\n\n`)
    })
    const heartbeat = setInterval(() => reply.raw.write(': ping\n\n'), 15_000)
    request.raw.on('close', () => {
      clearInterval(heartbeat)
      unsubscribe()
    })
  })

  /* ---------- SSE live-остатков ---------- */
  app.get('/api/stocks/stream', (request, reply) => {
    const { productId } = request.query as { productId?: string }
    const product = getDB().products.find((p) => p.id === productId) ?? getDB().products[0]
    reply.raw.writeHead(200, {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    })
    reply.raw.write(': connected\n\n')
    const send = (stock: number) => {
      reply.raw.write(
        `event: stock\ndata: ${JSON.stringify({ productId: product.id, stock, at: new Date().toISOString() })}\n\n`,
      )
    }
    send(product.stock)
    const timer = setInterval(() => {
      // live-демо: остаток «дышит». Reset вернёт seed-значение.
      const delta = Math.floor(Math.random() * 7) - 3
      product.stock = Math.max(0, Math.min(150, product.stock + delta))
      send(product.stock)
    }, 2000)
    request.raw.on('close', () => clearInterval(timer))
  })
}
