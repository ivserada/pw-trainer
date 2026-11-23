import { buildApp } from './app.js'
import { config } from './config.js'

const app = await buildApp()

try {
  await app.listen({ port: config.port, host: config.host })
  console.log(
    `[server] Playwright Practice Shop на http://localhost:${config.port} ` +
      `(env: ${config.isProduction ? 'production' : 'development'}, ` +
      `test-api: ${config.testApiEnabled ? 'on' : 'off'}, ` +
      `client-dist: ${config.clientDist})`,
  )
} catch (err) {
  console.error(err)
  process.exit(1)
}
