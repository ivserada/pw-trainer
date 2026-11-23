import { expect, test } from '../fixtures'

test.describe('📸 Скриншоты', () => {
  test('страница стабильна, data-mask маскируется', async ({ page }) => {
    await page.goto('/practice/screenshot')
    await expect(page.getByTestId('screenshot-scene')).toHaveScreenshot('order-card.png', {
      mask: [page.locator('[data-mask]')],
      maxDiffPixelRatio: 0.01,
    })
  })

  test('полная страница главной (без live-частей)', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveScreenshot('home.png', {
      mask: [page.locator('[data-testid="cart-count"]')],
      maxDiffPixelRatio: 0.01,
    })
  })
})

test.describe('♿ Доступность', () => {
  test('axe на главной: нет критичных нарушений', async ({ page }) => {
    const { AxeBuilder } = await import('@axe-core/playwright')
    await page.goto('/')
    const { violations } = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze()
    const critical = violations.filter((v) => v.impact === 'critical' || v.impact === 'serious')
    expect(critical).toEqual([])
  })

  test('axe на /practice/a11y: нарушения есть (это антипример)', async ({ page }) => {
    const { AxeBuilder } = await import('@axe-core/playwright')
    await page.goto('/practice/a11y')
    const { violations } = await new AxeBuilder({ page }).withTags(['wcag2a']).analyze()
    // На странице-антипримере точно есть нарушения label и color-contrast.
    const ids = violations.map((v) => v.id)
    expect(ids).toContain('label')
    expect(ids.length).toBeGreaterThan(2)
  })
})
