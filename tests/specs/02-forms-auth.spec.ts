import { expect, test } from '../fixtures'

test.describe('📝 Регистрация и валидация', () => {
  test('успешная регистрация ведёт в личный кабинет', async ({ page }) => {
    await page.goto('/register')
    await page.getByTestId('reg-name').fill('Новый Тестер')
    await page.getByTestId('reg-email').fill('newuser@example.com')
    await page.getByTestId('reg-password').fill('secret123')
    await page.getByTestId('reg-confirm').fill('secret123')
    await page.getByTestId('register-form').locator('button[type="submit"]').click()
    await expect(page).toHaveURL(/\/account/)
    await expect(page.getByTestId('account-name')).toHaveText('Новый Тестер')
  })

  test('короткое имя → aria-invalid и текст ошибки', async ({ page }) => {
    await page.goto('/register')
    await page.getByTestId('reg-name').fill('а')
    await page.getByTestId('reg-email').fill('newuser@example.com')
    await page.getByTestId('reg-password').fill('secret123')
    await page.getByTestId('reg-confirm').fill('secret123')
    await page.getByTestId('register-form').locator('button[type="submit"]').click()
    await expect(page.getByTestId('reg-name')).toHaveAttribute('aria-invalid', 'true')
    await expect(page.getByTestId('reg-name-error')).toContainText('не короче 2 символов')
  })

  test('несовпадение паролей', async ({ page }) => {
    await page.goto('/register')
    await page.getByTestId('reg-name').fill('Тест Тестов')
    await page.getByTestId('reg-email').fill('t@example.com')
    await page.getByTestId('reg-password').fill('secret123')
    await page.getByTestId('reg-confirm').fill('secret124')
    await page.getByTestId('register-form').locator('button[type="submit"]').click()
    await expect(page.getByTestId('reg-confirm')).toHaveAttribute('aria-invalid', 'true')
    await expect(page.getByTestId('reg-confirm-error')).toHaveText('Пароли не совпадают')
  })
})

test.describe('🔐 Логин', () => {
  test('неверный пароль → role=alert и aria-invalid', async ({ page }) => {
    await page.goto('/login')
    await page.getByTestId('login-email').fill('customer@shop.test')
    await page.getByTestId('login-password').fill('wrong-pass')
    await page.getByTestId('login-form').locator('button[type="submit"]').click()
    await expect(page.getByRole('alert')).toContainText('Неверный email или пароль')
    await expect(page.getByTestId('login-email')).toHaveAttribute('aria-invalid', 'true')
  })

  test('валидный логин customer: имя в шапке, выход', async ({ page }) => {
    await page.goto('/login')
    await page.getByTestId('login-email').fill('customer@shop.test')
    await page.getByTestId('login-password').fill('password123')
    await page.getByTestId('login-form').locator('button[type="submit"]').click()
    await expect(page).toHaveURL(/\/account/)
    await expect(page.getByRole('link', { name: 'Иван Покупатель' })).toBeVisible()
    await page.getByTestId('logout-button').click()
    await expect(page.getByTestId('login-link')).toBeVisible()
  })
})

test.describe('🔑 2FA (OTP)', () => {
  test('полный цикл 2FA для admin с кодом из /api/test/otp', async ({ page, api }) => {
    await page.goto('/practice/otp')
    await page.getByTestId('otp-step1-form').locator('button[type="submit"]').click()
    await expect(page.getByTestId('otp-code-input')).toBeVisible()

    const otpRes = await api.get('/api/test/otp?email=admin@shop.test')
    const { otp } = (await otpRes.json()) as { otp: string }
    await page.getByTestId('otp-code-input').fill(otp)
    await page.getByTestId('otp-step2-form').locator('button[type="submit"]').click()

    await expect(page.getByTestId('otp-success')).toContainText('2FA пройдена')
    await expect(page.getByTestId('otp-success')).toContainText('admin')
  })

  test('неверный OTP-код отклоняется', async ({ page }) => {
    await page.goto('/practice/otp')
    await page.getByTestId('otp-step1-form').locator('button[type="submit"]').click()
    await page.getByTestId('otp-code-input').fill('000000')
    await page.getByTestId('otp-step2-form').locator('button[type="submit"]').click()
    await expect(page.getByTestId('otp-page-error')).toContainText('Неверный код')
  })
})
