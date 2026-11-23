import { expect, test } from '../fixtures'

test.describe('🟡 Автокомплит', () => {
  test('debounce: подсказки появляются после ввода', async ({ page }) => {
    await page.goto('/practice/autocomplete')
    const input = page.getByTestId('ac-input')
    await input.fill('на')
    await expect(page.getByTestId('ac-loading')).toBeVisible()
    await expect(page.getByTestId('ac-listbox')).toBeVisible({ timeout: 3000 })
    await expect(page.getByTestId('ac-option-0')).toContainText('Наушники')
    await input.fill('словокоторогонетвкаталоге')
    await expect(page.getByTestId('ac-empty')).toBeVisible()
  })

  test('выбор опции фиксируется', async ({ page }) => {
    await page.goto('/practice/autocomplete')
    await page.getByTestId('ac-input').fill('науш')
    await page.getByTestId('ac-option-0').click()
    await expect(page.getByTestId('ac-selected')).toContainText('Наушники')
  })
})

test.describe('🟡 Пагинация и фильтры', () => {
  test('query-параметры фильтров', async ({ page }) => {
    await page.goto('/catalog')
    await page.getByTestId('filter-category').selectOption({ label: 'Книги' })
    await page.getByTestId('filter-sort').selectOption({ label: 'Сначала дешевле' })
    await page.getByTestId('filters-apply').click()
    await expect(page).toHaveURL(/category=books/)
    await expect(page).toHaveURL(/sort=price_asc/)
    await expect(page.getByTestId('catalog-total')).toContainText('Найдено товаров:')
  })

  test('пагинация меняет страницу и список', async ({ page }) => {
    await page.goto('/catalog')
    const firstPageFirstCard = await page.getByTestId('product-card').first().textContent()
    await page.getByTestId('page-2').click()
    await expect(page.getByTestId('page-2')).toHaveAttribute('aria-current', 'page')
    const secondPageFirstCard = await page.getByTestId('product-card').first().textContent()
    expect(secondPageFirstCard).not.toEqual(firstPageFirstCard)
  })

  test('infinite scroll догружает все товары', async ({ page, api }) => {
    // Зафиксируем ожидание относительно текущего total (CRUD-тесты могут добавлять товары).
    const res = await api.get('/api/products?pageSize=1')
    const { total } = (await res.json()) as { total: number }
    await page.goto('/practice/pagination')
    await page.getByTestId('mode-infinite').click()
    await page.getByTestId('infinite-sentinel').scrollIntoViewIfNeeded()
    await expect(page.getByTestId('infinite-finished')).toBeVisible({ timeout: 15_000 })
    await expect(page.getByTestId('infinite-item')).toHaveCount(total, { timeout: 15_000 })
  })
})

test.describe('🟡 Таблицы', () => {
  test('сортировка по цене: aria-sort и порядок', async ({ page }) => {
    await page.goto('/practice/tables')
    const priceHeader = page.getByRole('columnheader', { name: /Цена/ })
    await priceHeader.locator('button').click()
    await expect(priceHeader).toHaveAttribute('aria-sort', 'ascending')
    // Только строки-продукты (вложенные таблицы-отзывы исключены через row-p*).
    // CRUD-тест может удалить один товар — минимум 19 вместо 20.
    const prices = await page
      .getByTestId(/^row-p\d+$/)
      .locator('td:nth-child(3)')
      .allTextContents()
    const nums = prices.map((t) => Number(t.replace(/[^\d]/g, '')))
    expect(nums.length).toBeGreaterThanOrEqual(19)
    expect(nums).toEqual([...nums].sort((a, b) => a - b))
  })

  test('inline-edit: переименование строки', async ({ page }) => {
    await page.goto('/practice/tables')
    await page.getByTestId('edit-p1').click()
    await page.getByTestId('edit-input-p1').fill('Переименовано E2E')
    await page.getByTestId('save-p1').click()
    await expect(page.getByTestId('row-p1')).toContainText('Переименовано E2E')
  })

  test('выбор строк: счётчик выбранных', async ({ page }) => {
    await page.goto('/practice/tables')
    await page.getByTestId('select-p1').check()
    await page.getByTestId('select-p2').check()
    await expect(page.getByTestId('selection-info')).toContainText('Выбрано строк: 2')
    await page.getByTestId('select-all').check()
    await expect(page.getByTestId('selection-info')).toContainText('Выбрано строк: 20')
  })
})

test.describe('🟡 Оверлеи', () => {
  test('модалка: открыть, сабмит, Esc', async ({ page }) => {
    await page.goto('/practice/overlays')
    await page.getByTestId('open-modal').click()
    const dialog = page.getByRole('dialog', { name: 'Пример модального окна' })
    await expect(dialog).toBeVisible()
    await dialog.getByTestId('modal-name').fill('из модалки')
    await page.keyboard.press('Escape')
    await expect(dialog).toBeHidden()
  })

  test('drawer: действие показывает toast', async ({ page }) => {
    await page.goto('/practice/overlays')
    await page.getByTestId('open-drawer').click()
    await page.getByTestId('drawer-action').click()
    await expect(page.getByRole('region', { name: 'Уведомления' })).toContainText(
      'Действие из drawer',
    )
  })

  test('нативные диалоги через page.on', async ({ page }) => {
    await page.goto('/practice/overlays')
    page.once('dialog', (d) => void d.accept('Плейврайт'))
    await page.getByTestId('native-prompt').click()
    await expect(page.getByTestId('native-result')).toContainText('prompt: Плейврайт')

    page.once('dialog', (d) => void d.dismiss())
    await page.getByTestId('native-confirm').click()
    await expect(page.getByTestId('native-result')).toContainText('confirm: Отмена')
  })
})

test.describe('🟡 Окна', () => {
  test('popup по клику', async ({ page }) => {
    await page.goto('/practice/windows')
    const popupPromise = page.waitForEvent('popup')
    await page.getByTestId('open-popup').click()
    const popup = await popupPromise
    await popup.waitForLoadState()
    await expect(popup).toHaveURL(/product\/p7/)
    await popup.close()
  })

  test('отложенный popup через 1.5 с', async ({ page }) => {
    await page.goto('/practice/windows')
    const popupPromise = page.waitForEvent('popup')
    await page.getByTestId('open-delayed-popup').click()
    const popup = await popupPromise
    await popup.waitForLoadState()
    await expect(popup).toHaveURL(/catalog/)
  })
})

test.describe('🟡 Динамический контент', () => {
  test('скелетон при гарантированной задержке', async ({ page }) => {
    await page.goto('/practice/dynamic')
    await page.getByTestId('load-slow').click()
    await expect(page.getByTestId('skeleton')).toBeVisible()
    await expect(page.getByTestId('slow-list')).toBeVisible({ timeout: 5000 })
  })

  test('динамические id: локатор по тексту работает', async ({ page }) => {
    await page.goto('/practice/dynamic')
    const before = await page.getByTestId('dyn-counter').getAttribute('id')
    await page.getByTestId('dyn-bump').click()
    const after = await page.getByTestId('dyn-counter').getAttribute('id')
    expect(after).not.toEqual(before)
    await expect(page.getByRole('button', { name: /Форсировать re-render/ })).toBeVisible()
  })
})

test.describe('🟡 Локализация и темы', () => {
  test('RU→EN переключает навигацию', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('navigation', { name: 'Основная навигация' })).toContainText(
      'Главная',
    )
    await page.getByTestId('lang-toggle').click()
    await expect(page.getByRole('navigation', { name: 'Основная навигация' })).toContainText('Home')
    await expect(page.getByRole('navigation', { name: 'Основная навигация' })).toContainText(
      'Catalog',
    )
    await page.getByTestId('lang-toggle').click() // вернуть RU для следующих тестов
  })

  test('тёмная тема выставляет data-theme', async ({ page }) => {
    await page.getByTestId('theme-toggle').click()
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
    await page.getByTestId('theme-toggle').click()
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light')
  })
})
