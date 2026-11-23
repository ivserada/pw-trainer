import { expect, test } from '../fixtures'

test.describe('🔴 Realtime', () => {
  test('WebSocket-чат: доставка сообщения', async ({ page }) => {
    await page.goto('/practice/realtime')
    await expect(page.getByTestId('ws-status')).toHaveText('online')
    await page.getByTestId('chat-author').fill('Тестер')
    await page.getByTestId('chat-text').fill('сообщение из автотеста')
    await page.getByTestId('chat-send').click()
    await expect(page.getByTestId('chat-log')).toContainText('сообщение из автотеста')
  })

  test('SSE-лента: статус live и события загружены', async ({ page }) => {
    await page.goto('/practice/realtime')
    await expect(page.getByTestId('feed-status')).toHaveText('live')
    await expect(page.getByTestId('feed-event').first()).toBeVisible()
  })

  test('live-остатки обновляются (SSE)', async ({ page }) => {
    await page.goto('/practice/realtime')
    await expect(page.getByTestId('stock-updates')).not.toHaveText('обновлений: 0')
  })
})

test.describe('🔴 Iframe', () => {
  test('платёжный iframe: оплата и postMessage', async ({ page }) => {
    await page.goto('/practice/iframes')
    const frame = page.frameLocator('[data-testid="frame-payment"]')
    await frame.getByTestId('pay-card').fill('4242424242424242')
    await frame.getByTestId('pay-exp').fill('1228')
    await frame.getByTestId('pay-submit').click()
    await expect(frame.getByTestId('paid-message')).toBeVisible()
    await expect(page.getByTestId('payment-result')).toContainText('Оплата подтверждена')
  })

  test('srcdoc-iframe со вложенным iframe: 2 уровня', async ({ page }) => {
    await page.goto('/practice/iframes')
    const inner = page.frameLocator('[data-testid="frame-srcdoc"]').frameLocator('iframe')
    await expect(inner.getByRole('link', { name: 'Раздел «Альфа»' })).toBeVisible()
  })

  test('обычный iframe: карточка товара внутри', async ({ page }) => {
    await page.goto('/practice/iframes')
    const frame = page.frameLocator('[data-testid="frame-product"]')
    await expect(frame.getByTestId('product-name')).toBeVisible()
  })
})

test.describe('🔴 Shadow DOM', () => {
  test('open shadow: Playwright пробивает автоматически', async ({ page }) => {
    await page.goto('/practice/shadow')
    const counter = page.locator('lit-open-counter')
    await counter.getByRole('button').click()
    await expect(counter.getByRole('button')).toContainText('open Shadow: 1')
  })

  test('события composed пробивают границу shadow', async ({ page }) => {
    await page.goto('/practice/shadow')
    // Диспатчим событие напрямую из light DOM: элемент со slot="title" — стабильная
    // точка входа (Lit переставляет его внутрь h3, но он остаётся в light DOM).
    await page.evaluate(() => {
      const el = document.querySelector('lit-closed-panel [slot="title"]')
      el?.dispatchEvent(new CustomEvent('panel-action', { bubbles: true, composed: true }))
    })
    await expect(page.getByTestId('event-log')).toContainText('panel-action')
    await page.locator('vanilla-shadow-card').getByRole('button').click()
    await expect(page.getByTestId('event-log')).toContainText('vanilla-click')
  })
})

test.describe('🔴 Drag & Drop и Canvas', () => {
  test('HTML5 drag&drop: карточка переходит в «Готово»', async ({ page }) => {
    await page.goto('/practice/dnd')
    await page.getByTestId('dnd-card-t1').dragTo(page.getByTestId('column-done'))
    await expect(page.getByTestId('column-done')).toContainText('Написать локаторы')
    await expect(page.getByTestId('column-new')).not.toContainText('Написать локаторы')
  })

  test('pointer drag: ползунок в зону «Б»', async ({ page }) => {
    await page.goto('/practice/dnd')
    const track = await page.getByTestId('pointer-track').boundingBox()
    const knob = await page.getByTestId('pointer-knob').boundingBox()
    if (!track || !knob) throw new Error('no boxes')
    await page.mouse.move(knob.x + knob.width / 2, knob.y + knob.height / 2)
    await page.mouse.down()
    await page.mouse.move(track.x + track.width - 40, knob.y + knob.height / 2, { steps: 12 })
    await page.mouse.up()
    await expect(page.getByTestId('pointer-result')).toContainText('Зона «Б»')
  })

  test('canvas: рисование увеличивает счётчик штрихов', async ({ page }) => {
    await page.goto('/practice/canvas')
    const canvas = await page.getByTestId('drawing-canvas').boundingBox()
    if (!canvas) throw new Error('no canvas')
    const startX = canvas.x + 30
    const startY = canvas.y + 30
    await page.mouse.move(startX, startY)
    await page.mouse.down()
    await page.mouse.move(startX + 80, startY + 40, { steps: 8 })
    await page.mouse.up()
    await expect(page.getByTestId('stroke-count')).toHaveText('Линий: 1')
  })

  test('SVG: клик по столбцу обновляет подпись', async ({ page }) => {
    await page.goto('/practice/canvas')
    await page.locator('[data-bar="Пт"]').click()
    await expect(page.getByTestId('svg-picked')).toContainText('23 заказов')
  })
})

test.describe('🔴 Ошибки и сеть', () => {
  test('page.route перехватывает 500 и подменяет ответ', async ({ page }) => {
    await page.route('**/api/demo/errors/500', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ ok: true, mocked: true }),
      }),
    )
    await page.goto('/practice/errors')
    await page.getByTestId('err-500').click()
    await expect(page.getByTestId('error-result')).toContainText('HTTP 200')
    await expect(page.getByTestId('error-result')).toContainText('mocked')
  })

  test('медленный ответ: ждём poll', async ({ page }) => {
    await page.goto('/practice/errors')
    await page.getByTestId('err-slow').click()
    await expect(page.getByTestId('error-result')).toContainText('HTTP 200', { timeout: 6000 })
  })

  test('аборт запроса через route.abort → network error', async ({ page }) => {
    await page.route('**/api/demo/errors/404', (route) => route.abort())
    await page.goto('/practice/errors')
    await page.getByTestId('err-404').click()
    await expect(page.getByTestId('error-result')).toContainText('Failed to fetch')
  })
})

test.describe('🔴 Кастомные компоненты', () => {
  test('кастомный select', async ({ page }) => {
    await page.goto('/practice/components')
    await page.getByTestId('cs-trigger').click()
    await expect(page.getByTestId('cs-trigger')).toHaveAttribute('aria-expanded', 'true')
    await page.getByTestId('cs-option-Новосибирск').click()
    await expect(page.getByTestId('cs-value')).toContainText('Новосибирск')
  })

  test('мультиселект: теги и удаление', async ({ page }) => {
    await page.goto('/practice/components')
    await expect(page.getByTestId('tag-ci')).toHaveAttribute('aria-pressed', 'false')
    await page.getByTestId('tag-ci').click()
    await expect(page.getByTestId('tag-ci')).toHaveAttribute('aria-pressed', 'true')
    await page.getByTestId('remove-tag-ci').click()
    await expect(page.getByTestId('tag-ci')).toHaveAttribute('aria-pressed', 'false')
  })

  test('дерево: раскрытие узла', async ({ page }) => {
    await page.goto('/practice/components')
    // aria-expanded на li[role=treeitem], а кнопка внутри него.
    const treeitem = page.getByRole('treeitem', { name: /Книги/ })
    const toggle = treeitem.getByTestId('tree-books')
    await expect(treeitem).toHaveAttribute('aria-expanded', 'false')
    await toggle.click()
    await expect(treeitem).toHaveAttribute('aria-expanded', 'true')
  })

  test('datepicker: выбор даты', async ({ page }) => {
    await page.goto('/practice/components')
    await page.getByTestId('dp-trigger').click()
    await page.getByTestId('dp-day-15').click()
    await expect(page.getByTestId('dp-value')).toContainText('2026-12-15')
  })

  test('двойной клик и long press', async ({ page }) => {
    await page.goto('/practice/components')
    await page.getByTestId('dbl-target').dblclick()
    await expect(page.getByTestId('dbl-target')).toContainText('режим: on')

    const knob = page.getByTestId('lp-target')
    const box = await knob.boundingBox()
    if (!box) throw new Error('no box')
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
    await page.mouse.down()
    await page.waitForTimeout(650)
    await page.mouse.up()
    await expect(page.getByTestId('lp-count')).toContainText('1')
  })

  test('контекстное меню по правому клику', async ({ page }) => {
    await page.goto('/practice/components')
    await page.getByTestId('context-zone').click({ button: 'right' })
    await expect(page.getByTestId('context-menu')).toBeVisible()
    await page.getByTestId('ctx-copy').click()
    await expect(page.getByTestId('context-action')).toContainText('copy')
  })
})

test.describe('🔴 Горячие клавиши и буфер', () => {
  test('Ctrl+K открывает палитру, Enter запускает', async ({ page }) => {
    await page.goto('/practice/hotkeys')
    await page.keyboard.press('Control+K')
    await expect(page.getByTestId('command-palette')).toBeVisible()
    await page.getByTestId('palette-input').fill('корз')
    await page.keyboard.press('Enter')
    await expect(page.getByRole('region', { name: 'Уведомления' })).toContainText(
      'Палитра: Открыть корзину',
    )
  })

  test('copy/paste: clipboard permission', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write'])
    await page.goto('/practice/hotkeys')
    await page.getByTestId('copy-button').click()
    await page.getByTestId('paste-button').click()
    await expect(page.getByTestId('paste-state')).toContainText('playwright: keyboard is fun')
  })
})
