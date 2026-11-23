import { expect, test, loginWithOtp } from '../fixtures'

test.describe('🔴 Устройства и окружение', () => {
  test('геолокация эмулируется', async ({ page, context }) => {
    await context.grantPermissions(['geolocation'])
    await context.setGeolocation({ latitude: 55.7558, longitude: 37.6173 })
    await page.goto('/practice/device')
    await page.getByTestId('geo-button').click()
    await expect(page.getByTestId('geo-result')).toContainText('55.75')
    await expect(page.getByTestId('geo-result')).toContainText('37.61')
  })

  test('вьюпорт и брейкпоинт', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 640 })
    await page.goto('/practice/device')
    await expect(page.getByTestId('viewport-size')).toHaveText('360×640')
    await expect(page.getByTestId('breakpoint')).toContainText('mobile')
    await page.setViewportSize({ width: 1280, height: 800 })
    await expect(page.getByTestId('breakpoint')).toContainText('desktop')
  })

  test('offline эмуляция', async ({ page, context }) => {
    await page.goto('/practice/device')
    await context.setOffline(true)
    await expect(page.getByTestId('online-status')).toHaveText('offline')
    await context.setOffline(false)
    await expect(page.getByTestId('online-status')).toHaveText('online')
  })
})

test.describe('🔴 Таймеры (page.clock)', () => {
  test('clock.fastForward: обратный отсчёт исчерпывается', async ({ page }) => {
    await page.clock.install()
    await page.goto('/practice/timers')
    await expect(page.getByTestId('resend-timer')).toBeVisible()
    // fastForward малыми шагами: каждый вызов «тикает» setTimeout-цепочку React.
    for (let i = 0; i < 10; i++) {
      await page.clock.fastForward(1500)
    }
    await expect(page.getByTestId('resend-button')).toBeVisible()
  })

  test('setTimeout-сообщение появляется только после форварда', async ({ page }) => {
    await page.clock.install()
    await page.goto('/practice/timers')
    await page.getByTestId('schedule-timeout').click()
    await expect(page.getByTestId('timeout-message')).toHaveText('—')
    await page.clock.fastForward(2500)
    await expect(page.getByTestId('timeout-message')).toContainText('setTimeout(2000)')
  })
})

test.describe('🔴 Файлы', () => {
  test('upload txt-файла и скачивание', async ({ page }) => {
    await page.goto('/practice/upload')
    await page.getByTestId('file-input').setInputFiles({
      name: 'report.txt',
      mimeType: 'text/plain',
      buffer: Buffer.from('отчёт об автотестах'),
    })
    await page.getByTestId('upload-button').click()
    await expect(page.getByTestId('uploaded-list')).toContainText('report.txt')

    const downloadPromise = page.waitForEvent('download')
    await page
      .getByRole('link', { name: /Скачать/ })
      .first()
      .click()
    const download = await downloadPromise
    expect(download.suggestedFilename()).toBe('report.txt')
  })

  test('файл больше 1 МБ отклоняется с role=alert', async ({ page }) => {
    await page.goto('/practice/upload')
    await page.getByTestId('file-input').setInputFiles({
      name: 'big.png',
      mimeType: 'image/png',
      buffer: Buffer.alloc(1.1 * 1024 * 1024, 1),
    })
    await page.getByTestId('upload-button').click()
    await expect(page.getByRole('alert')).toContainText('больше лимита')
  })
})

test.describe('🔴 Админка', () => {
  test('виртуальная таблица: скролл рендерит окно, конец списка доступен', async ({
    page,
    api,
  }) => {
    const token = await loginWithOtp(api, 'admin@shop.test')
    await page.addInitScript((t) => localStorage.setItem('accessToken', t), token)
    await page.goto('/admin')
    await expect(page.getByTestId('vt-info')).toContainText('строк: 10 064')
    // Первая синтетика всегда в начале (сортировка по умолчанию по цене v0=500).
    await expect(page.getByTestId('vt-row-v0')).toBeVisible()
    await page.getByTestId('vt-scroll').evaluate((el) => {
      el.scrollTop = el.scrollHeight
    })
    await expect(page.getByTestId('vt-row-v9999')).toBeVisible()
  })

  test('CRUD: создание товара через форму', async ({ page, api }) => {
    const res = await api.post('/api/auth/login', {
      data: { email: 'manager@shop.test', password: 'password123' },
    })
    const { accessToken } = (await res.json()) as { accessToken: string }
    await page.addInitScript((t) => localStorage.setItem('accessToken', t), accessToken)
    await page.goto('/admin')

    await page.getByTestId('np-name').fill('E2E Товар Автотест')
    await page.getByTestId('np-price').fill('999.90')
    await page.getByTestId('np-stock').fill('42')
    await page.getByTestId('np-create').click()

    const productsRes = await api.get('/api/products?q=E2E')
    const products = (await productsRes.json()) as { items: { name: string }[] }
    expect(products.items.some((p) => p.name === 'E2E Товар Автотест')).toBe(true)
  })

  test('customer не попадает в админку (403 на API)', async ({ page, api }) => {
    const res = await api.post('/api/auth/login', {
      data: { email: 'customer@shop.test', password: 'password123' },
    })
    const { accessToken } = (await res.json()) as { accessToken: string }
    const forbidden = await api.get('/api/admin/users', {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
    expect(forbidden.status()).toBe(403)
    await page.addInitScript((t) => localStorage.setItem('accessToken', t), accessToken)
    await page.goto('/admin')
    await expect(page).toHaveURL(/login/)
  })
})
