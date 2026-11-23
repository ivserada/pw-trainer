import { fileURLToPath } from 'node:url'

const defaultClientDist = fileURLToPath(new URL('../../client/dist', import.meta.url))
const clientDist = process.env.CLIENT_DIST
  ? fileURLToPath(new URL(`file://${process.env.CLIENT_DIST.replace(/\/$/, '')}/`))
  : defaultClientDist

export const config = {
  port: Number(process.env.PORT ?? 3100),
  host: process.env.HOST ?? '0.0.0.0',
  jwtSecret: process.env.JWT_SECRET ?? 'pw-trainer-dev-secret-change-me',
  accessTokenTtlSec: 15 * 60,
  refreshTokenTtlMs: 7 * 24 * 60 * 60 * 1000,
  otpWindowSec: 30,
  isProduction: process.env.NODE_ENV === 'production',
  /** Тестовые эндпоинты доступны вне production или при явном флаге (docker-compose ставит true). */
  testApiEnabled: process.env.NODE_ENV !== 'production' || process.env.ENABLE_TEST_API === 'true',
  clientDist,
}

export const REFRESH_COOKIE = 'refresh_token'
