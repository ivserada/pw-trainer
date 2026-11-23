import { existsSync } from 'node:fs'
import fastifyCookie from '@fastify/cookie'
import fastifyCors from '@fastify/cors'
import fastifyMultipart from '@fastify/multipart'
import fastifyStatic from '@fastify/static'
import fastifyWebsocket from '@fastify/websocket'
import Fastify from 'fastify'
import { config } from './config.js'
import { ValidationError } from './lib/validate.js'
import { registerChaosHook } from './lib/chaos.js'
import { registerAuthRoutes } from './routes/auth.js'
import { registerCartRoutes } from './routes/cart.js'
import { registerDemoRoutes } from './routes/demo.js'
import { registerFileRoutes } from './routes/files.js'
import { registerMetaRoutes } from './routes/meta.js'
import { registerOrderRoutes } from './routes/orders.js'
import { registerPracticeRoutes } from './routes/practice.js'
import { registerProductRoutes } from './routes/products.js'
import { registerRealtimeRoutes } from './routes/realtime.js'
import { registerTestRoutes } from './routes/test.js'
import { registerUserRoutes } from './routes/users.js'

export async function buildApp() {
  const app = Fastify({ logger: false })

  await app.register(fastifyCors, { origin: true, credentials: true })
  await app.register(fastifyCookie)
  await app.register(fastifyMultipart, {
    limits: { fileSize: 1024 * 1024, files: 1 },
  })
  await app.register(fastifyWebsocket)

  app.decorateRequest('auth', null)
  app.setErrorHandler((error, _request, reply) => {
    if (error instanceof ValidationError) {
      return reply.code(400).send({ error: 'ValidationError', issues: error.issues })
    }
    if (error.statusCode) {
      return reply.code(error.statusCode).send({ error: error.name, message: error.message })
    }
    app.log.error(error)
    return reply.code(500).send({ error: 'InternalError', message: 'Внутренняя ошибка сервера' })
  })

  registerChaosHook(app)
  registerMetaRoutes(app)
  registerTestRoutes(app)
  registerProductRoutes(app)
  registerCartRoutes(app)
  registerAuthRoutes(app)
  registerOrderRoutes(app)
  registerUserRoutes(app)
  registerDemoRoutes(app)
  registerPracticeRoutes(app)
  registerFileRoutes(app)
  registerRealtimeRoutes(app)

  // В production (и в e2e) сервер отдаёт собранный клиент из client/dist.
  if (config.isProduction && existsSync(config.clientDist)) {
    await app.register(fastifyStatic, { root: config.clientDist })
    app.setNotFoundHandler((request, reply) => {
      if (
        request.method === 'GET' &&
        !request.url.startsWith('/api') &&
        !request.url.startsWith('/ws')
      ) {
        return reply.sendFile('index.html')
      }
      return reply.code(404).send({ error: 'NotFound', message: 'Маршрут не найден' })
    })
  }

  return app
}
