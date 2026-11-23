import { expect, type Page } from '@playwright/test'

export class LoginPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/login')
  }

  async login(email: string, password: string) {
    await this.page.getByTestId('login-email').fill(email)
    await this.page.getByTestId('login-password').fill(password)
    await this.page.getByTestId('login-form').locator('button[type="submit"]').click()
  }

  async expectError(message: string) {
    await expect(this.page.getByRole('alert')).toContainText(message)
    await expect(this.page.getByTestId('login-email')).toHaveAttribute('aria-invalid', 'true')
  }
}
