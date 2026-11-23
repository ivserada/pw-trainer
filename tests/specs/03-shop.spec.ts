import { expect, test, loginViaApi } from '../fixtures'
import { CatalogPage } from '../pages/CatalogPage'
import { CartPage } from '../pages/CartPage'

test.describe('🛒 Сценарии магазина', () => {
  test('добавление в корзину обновляет счётчик в шапке', async ({ page }) => {
    const catalog = new CatalogPage(page)
    await catalog.goto()
    await catalog.addToCart(0)
    await expect(page.getByTestId('cart-count')).toHaveText('1')
    await catalog.addToCart(1)
    await expect(page.getByTestId('cart-count')).toHaveText('2')
  })

  test('промокод SALE10 даёт скидку 10%', async ({ page }) => {
    const catalog = new CatalogPage(page)
    await catalog.goto()
    await catalog.addToCart(0)

    const cart = new CartPage(page)
    await cart.goto()
    await expect(cart.rows).toHaveCount(1)
    await cart.applyPromo('SALE10')
    // Строка скидки считается сервером и появляется после ответа API.
    const discountRow = cart.summary.locator('div', { hasText: 'Скидка' }).last()
    await expect(discountRow).not.toContainText('−0 ₽')
    await expect(cart.summary).toContainText('Активен: SALE10 (−10%)')
  })

  test('неверный промокод → сообщение об ошибке', async ({ page }) => {
    const catalog = new CatalogPage(page)
    await catalog.goto()
    await catalog.addToCart(0)
    const cart = new CartPage(page)
    await cart.goto()
    await cart.applyPromo('NOPE42')
    await expect(page.getByRole('status')).toContainText('Промокод NOPE42 не найден')
  })

  test('мульти-степ чекаут: маски, шаги, номер заказа', async ({ page }) => {
    const catalog = new CatalogPage(page)
    await catalog.goto()
    await catalog.addToCart(0)

    await page.goto('/checkout')
    await page.getByTestId('co-name').fill('Тест Тестов')
    await page.getByTestId('co-email').fill('buyer@example.com')
    await page.getByTestId('co-phone').fill('79001234567')
    // маска форматирует ввод
    await expect(page.getByTestId('co-phone')).toHaveValue('+7 (900) 123-45-67')
    await page.getByTestId('co-next').click()

    await page.getByTestId('co-address').fill('г. Тестовск, ул. Проверочная, д. 5')
    await page.getByTestId('co-card').fill('4242424242424242')
    await expect(page.getByTestId('co-card')).toHaveValue('4242 4242 4242 4242')
    await page.getByTestId('co-exp').fill('1228')
    await expect(page.getByTestId('co-exp')).toHaveValue('12/28')
    await page.getByTestId('co-cvv').fill('123')
    await page.getByTestId('co-next').click()

    await expect(page.getByTestId('confirm-email')).toHaveText('buyer@example.com')
    await page.getByTestId('co-confirm').click()

    await expect(page.getByTestId('checkout-success')).toBeVisible()
    await expect(page.getByTestId('order-number')).toContainText('ORD-2026-')
  })

  test('валидация шага контактов: пустой телефон', async ({ page }) => {
    const catalog = new CatalogPage(page)
    await catalog.goto()
    await catalog.addToCart(0)
    await page.goto('/checkout')
    await page.getByTestId('co-name').fill('Тест Тестов')
    await page.getByTestId('co-email').fill('buyer@example.com')
    await page.getByTestId('co-phone').fill('123')
    await page.getByTestId('co-next').click()
    await expect(page.getByTestId('co-phone')).toHaveAttribute('aria-invalid', 'true')
    await expect(page.getByRole('alert')).toContainText('телефон полностью')
  })

  test('скачивание счёта: событие download, валидный PDF', async ({ page, api }) => {
    await loginViaApi(page, api, 'customer@shop.test')
    await page.goto('/account')
    const downloadPromise = page.waitForEvent('download')
    await page.getByTestId('invoice-o1').click()
    const download = await downloadPromise
    expect(download.suggestedFilename()).toMatch(/invoice-ORD-2026-001\.pdf/)
  })

  test('карточка товара: вкладки и отзыв', async ({ page }) => {
    await page.goto('/product/p2') // p1 может быть удалён CRUD-тестом
    const reviewsTab = page.getByRole('tab', { name: /Отзывы/ })
    await reviewsTab.click()
    await expect(reviewsTab).toHaveAttribute('aria-selected', 'true')

    const marker = `Авто-${Date.now()}`
    await page.getByTestId('review-author').fill('Авто Тестер')
    await page.getByTestId('review-text').fill(marker)
    await page.getByTestId('review-submit').click()
    await expect(page.getByTestId('review-success')).toBeVisible()
    await expect(page.getByTestId('reviews-list')).toContainText(marker)
  })

  test('личный кабинет: редактирование профиля', async ({ page, api }) => {
    await loginViaApi(page, api, 'customer@shop.test')
    await page.goto('/account')
    await page.getByTestId('acc-name').fill('Иван Обновлённый')
    await page.getByTestId('acc-hue').fill('120')
    await page.getByTestId('profile-form').locator('button[type="submit"]').click()
    await expect(page.getByTestId('account-name')).toHaveText('Иван Обновлённый')

    const meRes = await api.get('/api/auth/me', {
      headers: {
        Authorization: `Bearer ${await page.evaluate(() => localStorage.getItem('accessToken'))}`,
      },
    })
    const me = (await meRes.json()) as { name: string; avatarHue: number }
    expect(me.name).toBe('Иван Обновлённый')
    expect(me.avatarHue).toBe(120)
  })
})
