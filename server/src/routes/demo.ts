import type { FastifyInstance } from 'fastify'
import { requireAuth, requireRole } from '../lib/http.js'

/** Демонстрационные эндпоинты для тренировки page.route, ожиданий и обработки ошибок. */
export function registerDemoRoutes(app: FastifyInstance): void {
  app.get('/api/demo/errors/:code', async (request, reply) => {
    const { code } = request.params as { code: string }
    switch (code) {
      case '401':
        return reply.code(401).send({ error: 'Unauthorized', message: 'Нужна авторизация' })
      case '403':
        return reply.code(403).send({ error: 'Forbidden', message: 'Нет прав на ресурс' })
      case '404':
        return reply.code(404).send({ error: 'NotFound', message: 'Ресурс не найден' })
      case '500':
        return reply.code(500).send({ error: 'InternalError', message: 'Сервер упал (намеренно)' })
      default:
        return reply.code(400).send({ error: 'BadRequest', message: 'Используйте 401|403|404|500' })
    }
  })

  // Требующие авторизации/роли варианты — для тренировки 401/403 "по-настоящему"
  app.get('/api/demo/protected', { preHandler: requireAuth }, async (request) => ({
    ok: true,
    user: request.auth!.user.email,
  }))
  app.get('/api/demo/admin-only', { preHandler: requireRole('admin') }, async () => ({
    ok: true,
    secret: 'admin data',
  }))

  app.get('/api/demo/slow', async (request) => {
    const { ms } = request.query as { ms?: string }
    const delay = Math.min(Number(ms ?? 2000) || 2000, 10_000)
    await new Promise((r) => setTimeout(r, delay))
    return { ok: true, ms: delay }
  })

  app.get('/api/demo/empty', async () => ({ items: [] }))
}
