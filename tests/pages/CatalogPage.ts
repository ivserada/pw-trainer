import { expect, type Locator, type Page } from '@playwright/test'

export class CatalogPage {
  readonly cards: Locator
  readonly applyButton: Locator

  constructor(private page: Page) {
    this.cards = page.getByTestId('product-card')
    this.applyButton = page.getByTestId('filters-apply')
  }

  async goto() {
    await this.page.goto('/catalog')
    await expect(this.cards.first()).toBeVisible()
  }

  async filterCategory(categoryName: string) {
    await this.page.getByTestId('filter-category').selectOption({ label: categoryName })
    await this.applyButton.click()
  }

  async sortBy(label: string) {
    await this.page.getByTestId('filter-sort').selectOption({ label })
    await this.applyButton.click()
  }

  async gotoPage(n: number) {
    await this.page.getByTestId(`page-${n}`).click()
  }

  async addToCart(nth = 0) {
    await this.cards.nth(nth).getByTestId('add-to-cart').click()
  }
}
