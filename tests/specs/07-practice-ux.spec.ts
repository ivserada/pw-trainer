import { expect, test } from '../fixtures'

test.describe('📋 Практика и сервисные эндпоинты', () => {
  test('хаб практики: список заданий и прогресс', async ({ page }) => {
    await page.goto('/practice')
    await expect(page.getByTestId('progress-count')).toHaveText('0/85')
    await expect(page.getByTestId('task-loc-01')).toBeVisible()
    await expect(page.getByTestId('task-chaos-06')).toBeVisible()

    await page.getByTestId('done-loc-01').check()
    await expect(page.getByTestId('progress-count')).toHaveText('1/85')
    const progress = await page.request.get('/api/practice/progress')
    const body = (await progress.json()) as { doneCount: number }
    expect(body.doneCount).toBe(1)
  })

  test('спойлер раскрывает рекомендуемый локатор', async ({ page }) => {
    await page.goto('/practice')
    const task = page.getByTestId('task-loc-01')
    await task.getByText('Подсказка').click()
    await expect(task.locator('pre')).toContainText('getByRole')
  })

  test('health и openapi отдаются', async ({ api }) => {
    const health = await api.get('/api/health')
    expect(health.ok()).toBe(true)
    const spec = await api.get('/api/openapi.json')
    const json = (await spec.json()) as { openapi: string; paths: Record<string, unknown> }
    expect(json.openapi).toMatch(/^3\./)
    expect(Object.keys(json.paths).length).toBeGreaterThan(20)
  })

  test('reset: состояние возвращается к seed', async ({ page, api }) => {
    await page.goto('/practice')
    await page.getByTestId('done-loc-01').check()
    await expect(page.getByTestId('progress-count')).toHaveText('1/85')
    await api.post('/api/test/reset')
    await page.reload()
    await expect(page.getByTestId('progress-count')).toHaveText('0/85')
  })
})

test.describe('🌀 Chaos-флаги', () => {
  test('флаги применяются и сбрасываются', async ({ page, api }) => {
    await api.post('/api/test/flags', { data: { apiDelayMs: 400, movingButtons: true } })
    const flags = (await (await api.get('/api/test/flags')).json()) as { apiDelayMs: number }
    expect(flags.apiDelayMs).toBe(400)

    await page.goto('/practice/chaos')
    await expect(page.getByTestId('flag-apiDelayMs')).toHaveValue('400')

    await page.getByText('Всё выключить').click()
    await page.waitForTimeout(300)
    const cleared = (await (await api.get('/api/test/flags')).json()) as { apiDelayMs: number }
    expect(cleared.apiDelayMs).toBe(0)
  })
})
