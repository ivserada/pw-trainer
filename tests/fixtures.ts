import { test as base, expect, type APIRequestContext, type Page } from '@playwright/test'

export const SEED_PASSWORD = 'password123'

type Fixtures = {
  api: APIRequestContext
  page: Page
}

let e2eUserReady = false
let resetDone = false

async function ensureResetOnce(api: APIRequestContext): Promise<void> {
  if (resetDone) return
  await api.post('/api/test/reset')
  resetDone = true
}

/** Создаёт e2e-пользователя один раз на весь прогон (idempotent, игнорирует 409). */
async function ensureE2eUser(api: APIRequestContext): Promise<void> {
  if (e2eUserReady) return
  await api
    .post('/api/test/create-user', {
      data: {
        email: 'e2e@shop.test',
        password: 'e2e-password',
        role: 'customer',
        name: 'E2E Тестер',
      },
    })
    .catch(() => {})
  e2eUserReady = true
}

export const test = base.extend<Fixtures>({
  api: async ({ playwright }, use) => {
    const ctx = await playwright.request.newContext({
      baseURL: process.env.BASE_URL ?? 'http://localhost:3000',
    })
    await use(ctx)
    await ctx.dispose()
  },

  // Каждый тест получает свежий browser context (без cookie), поэтому корзины
  // изолированы. Reset БД НЕ делаем здесь: полный сьют наполняет состояние,
  // а его стабильность гарантируется идемпотентными API-тестами.
  page: async ({ page, api }, use) => {
    // Однократный reset для процесса — seed-детерминизм сохраняется,
    // а параллельные тесты не ловят «пропавшего» пользователя из-за чужого reset.
    await ensureResetOnce(api)
    await api.post('/api/test/flags', {
      data: {
        apiDelayMs: 0,
        apiErrorRate: 0,
        vanishMs: 0,
        movingButtons: false,
        rerenderMs: 0,
        slowImages: false,
      },
    })
    await ensureE2eUser(api)
    await page.goto('/')
    await use(page)
  },
})

export { expect }

/** Тяжёлый reset перед сценарными тестами (магазин, CRUD). */
export async function resetState(api: APIRequestContext): Promise<void> {
  await api.post('/api/test/reset')
  await api.post('/api/test/flags', {
    data: {
      apiDelayMs: 0,
      apiErrorRate: 0,
      vanishMs: 0,
      movingButtons: false,
      rerenderMs: 0,
      slowImages: false,
    },
  })
}

/** Логин через API + установка access token в localStorage страницы. */
export async function loginViaApi(
  page: Page,
  api: APIRequestContext,
  email: string,
  password = SEED_PASSWORD,
): Promise<void> {
  const res = await api.post('/api/auth/login', { data: { email, password } })
  if (!res.ok()) throw new Error(`login failed: ${res.status()} ${await res.text()}`)
  const body = (await res.json()) as { accessToken?: string; requiresOtp?: boolean }
  if (!body.accessToken) throw new Error('login requires OTP — use the OTP flow instead')
  await page.addInitScript((token) => {
    localStorage.setItem('accessToken', token)
  }, body.accessToken)
}

/** Полный OTP-логин (для admin@shop.test). Возвращает access token. */
export async function loginWithOtp(
  api: APIRequestContext,
  email: string,
  password = SEED_PASSWORD,
): Promise<string> {
  const loginRes = await api.post('/api/auth/login', { data: { email, password } })
  const { otpToken } = (await loginRes.json()) as { otpToken: string }
  const otpRes = await api.get(`/api/test/otp?email=${encodeURIComponent(email)}`)
  const { otp } = (await otpRes.json()) as { otp: string }
  const otpVerify = await api.post('/api/auth/otp', { data: { otpToken, code: otp } })
  const { accessToken } = (await otpVerify.json()) as { accessToken: string }
  return accessToken
}
