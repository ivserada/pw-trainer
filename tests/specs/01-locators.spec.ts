import { expect, test } from '../fixtures'

test.describe('🧭 Локаторы: базовые стратегии', () => {
  test('getByRole: заголовок первого уровня на главной', async ({ page }) => {
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(/Тренажёр автотестов/)
  })

  test('getByTestId: 12 карточек на странице каталога', async ({ page }) => {
    await page.goto('/catalog')
    await expect(page.getByTestId('product-card')).toHaveCount(12)
  })

  test('getByRole radio: выбор варианта «Океан»', async ({ page }) => {
    await page.goto('/product/p1')
    const ocean = page.getByRole('radio', { name: 'Океан' })
    await ocean.check()
    await expect(ocean).toBeChecked()
    await expect(page.getByRole('radio', { name: 'Графит' })).not.toBeChecked()
  })

  test('getByLabel + getByPlaceholder: поля формы', async ({ page }) => {
    await page.goto('/practice/forms')
    await page.getByLabel('Имя пользователя (text, min 3)').fill('tester')
    await page.getByPlaceholder('you@example.com').fill('a@b.co')
    await expect(page.getByLabel('Имя пользователя (text, min 3)')).toHaveValue('tester')
  })

  test('getByText и getByAltText', async ({ page }) => {
    await page.goto('/catalog')
    await expect(page.getByText(/Найдено товаров: \d+/)).toBeVisible()
    await page.getByTestId('product-card').first().getByRole('img').waitFor()
    // SVG с alt/aria-label доступен через getByAltText.
    const altCount = await page.getByTestId('product-card').first().getByAltText(/.+/).count()
    expect(altCount).toBeGreaterThanOrEqual(1)
  })

  test('getByTitle: переключатель темы', async ({ page }) => {
    await expect(page.getByTitle('Тёмная тема')).toBeVisible()
  })

  test('filter/hasNotText: карточки в наличии', async ({ page }) => {
    await page.goto('/catalog')
    const available = page.getByTestId('product-card').filter({ hasNotText: 'Нет в наличии' })
    expect(await available.count()).toBeGreaterThan(0)
  })

  test('and/or: комбинированные локаторы', async ({ page }) => {
    await page.goto('/practice/forms')
    // and(): email внутри конкретной формы — без required (formnovalidate).
    const emailInForm = page
      .getByTestId('all-types-form')
      .locator('input[type="email"]')
      .and(page.locator('input'))
    await expect(emailInForm).toHaveCount(1)

    // or(): кнопки покупки (p2 — не удаляется CRUD-тестом).
    await page.goto('/product/p2')
    const buyButtons = page
      .getByRole('button', { name: 'В корзину' })
      .or(page.getByRole('button', { name: 'Купить сейчас' }))
    await expect(buyButtons).toHaveCount(2)
  })

  test('strict mode: три «Подробнее» требуют уточнения', async ({ page }) => {
    await page.goto('/practice/links')
    const links = page.getByRole('link', { name: 'Подробнее' })
    await expect(links).toHaveCount(3)
    await expect(links.nth(1)).toHaveAttribute('href', '/product/p2')
    await links.first().click()
    await expect(page).toHaveURL(/product\/p1/)
  })

  test('скрытый дубль не попадает в getByRole', async ({ page }) => {
    await page.goto('/practice/links')
    await expect(page.getByTestId('hidden-duplicate')).toBeHidden()
    // getByRole пропускает display:none — строго один видимый.
    await expect(page.getByRole('link', { name: 'Документация API ↗' })).toHaveCount(1)
  })
})
