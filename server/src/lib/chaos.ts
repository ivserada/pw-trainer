import type { FastifyInstance } from 'fastify'
import { getDB } from '../store.js'

const SKIP_PREFIXES = ['/api/test', '/api/docs', '/api/openapi.json', '/api/health', '/ws']

/** Применяет chaos-флаги к REST-запросам: случайная задержка и/или случайный 500. */
export function registerChaosHook(app: FastifyInstance): void {
  app.addHook('onRequest', async (request, reply) => {
    if (request.method === 'OPTIONS') return
    const url = request.raw.url ?? ''
    if (!url.startsWith('/api')) return
    if (SKIP_PREFIXES.some((p) => url.startsWith(p))) return
    if (url.startsWith('/api/feed') || url.startsWith('/api/stocks')) return // SSE не трогаем

    const { flags } = getDB()
    if (flags.apiDelayMs > 0) {
      await new Promise((r) => setTimeout(r, Math.floor(Math.random() * flags.apiDelayMs)))
    }
    if (flags.apiErrorRate > 0 && Math.random() < flags.apiErrorRate) {
      await reply.code(500).send({ error: 'ChaosError', message: 'Случайная 500 от chaos-режима' })
    }
  })
}
