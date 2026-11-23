import { expect, type Page } from '@playwright/test'

export class AdminPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/admin')
    await expect(this.page.getByTestId('vt-scroll')).toBeVisible()
  }

  async createProduct(name: string, price: string, stock: string) {
    await this.page.getByTestId('np-name').fill(name)
    await this.page.getByTestId('np-price').fill(price)
    await this.page.getByTestId('np-stock').fill(stock)
    await this.page.getByTestId('np-create').click()
  }

  async scrollVirtualTableToEnd() {
    await this.page.getByTestId('vt-scroll').evaluate((el) => {
      el.scrollTop = el.scrollHeight
    })
  }
}
