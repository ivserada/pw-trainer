import { expect, type Locator, type Page } from '@playwright/test'

export class CartPage {
  readonly rows: Locator
  readonly promoInput: Locator
  readonly promoForm: Locator
  readonly summary: Locator

  constructor(private page: Page) {
    this.rows = page.getByTestId('cart-row')
    this.promoInput = page.getByTestId('promo-input')
    this.promoForm = page.getByTestId('promo-form')
    this.summary = page.getByTestId('cart-summary')
  }

  async goto() {
    await this.page.goto('/cart')
  }

  async applyPromo(code: string) {
    await this.promoInput.fill(code)
    await this.promoForm.locator('button[type="submit"]').click()
  }

  async expectDiscount(percent: number) {
    await expect(this.summary).toContainText(`Активен: ${percent === 10 ? 'SALE10' : 'PW20'}`)
  }
}
