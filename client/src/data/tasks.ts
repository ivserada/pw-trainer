import type { Localized } from '../i18n'

export type Level = '🟢' | '🟡' | '🔴'

export interface PracticeTask {
  id: string
  level: Level
  title: Localized<string>
  path: string
  hint: Localized<string>
  spoiler: string
}

export interface TaskSection {
  id: string
  title: Localized<string>
  tasks: PracticeTask[]
}

export const TASK_SECTIONS: TaskSection[] = [
  {
    id: 'locators',
    title: { ru: '🧭 Локаторы', en: '🧭 Locators' },
    tasks: [
      {
        id: 'loc-01',
        level: '🟢',
        title: {
          ru: 'Заголовок главной страницы',
          en: 'Home page heading',
        },
        path: '/',
        hint: { ru: 'getByRole', en: 'getByRole' },
        spoiler: `page.getByRole('heading', { level: 1 })`,
      },
      {
        id: 'loc-02',
        level: '🟢',
        title: {
          ru: 'Карточки товаров в каталоге (их 12 на странице)',
          en: 'Product cards in the catalog (12 per page)',
        },
        path: '/catalog',
        hint: { ru: 'getByTestId', en: 'getByTestId' },
        spoiler: `page.getByTestId('product-card') // count() === 12`,
      },
      {
        id: 'loc-03',
        level: '🟢',
        title: {
          ru: 'Radio «Океан» на карточке товара',
          en: 'The "Океан" radio on the product card',
        },
        path: '/product/p1',
        hint: { ru: 'getByRole radio + checked', en: 'getByRole radio + checked' },
        spoiler: `page.getByRole('radio', { name: 'Океан' }).check()\nexpect(page.getByRole('radio', { name: 'Океан' })).toBeChecked()`,
      },
      {
        id: 'loc-04',
        level: '🟢',
        title: {
          ru: 'Поле «Имя пользователя» на странице форм',
          en: 'The "Имя пользователя" field on the forms page',
        },
        path: '/practice/forms',
        hint: { ru: 'getByLabel', en: 'getByLabel' },
        spoiler: `page.getByLabel('Имя пользователя (text, min 3)')`,
      },
      {
        id: 'loc-05',
        level: '🟢',
        title: {
          ru: 'Поле email по placeholder',
          en: 'Email field by placeholder',
        },
        path: '/practice/forms',
        hint: { ru: 'getByPlaceholder', en: 'getByPlaceholder' },
        spoiler: `page.getByPlaceholder('you@example.com')`,
      },
      {
        id: 'loc-06',
        level: '🟢',
        title: {
          ru: 'Текст «Найдено товаров»',
          en: 'The "Найдено товаров" text',
        },
        path: '/catalog',
        hint: { ru: 'getByText', en: 'getByText' },
        spoiler: `page.getByText(/Найдено товаров/)`,
      },
      {
        id: 'loc-07',
        level: '🟢',
        title: { ru: 'Изображение товара', en: 'Product image' },
        path: '/product/p1',
        hint: { ru: 'getByAltText', en: 'getByAltText' },
        spoiler: `page.getByAltText(/Наушники/) // role="img" aria-label`,
      },
      {
        id: 'loc-08',
        level: '🟢',
        title: {
          ru: 'Кнопка переключения темы по title',
          en: 'Theme toggle button by title',
        },
        path: '/',
        hint: { ru: 'getByTitle', en: 'getByTitle' },
        spoiler: `page.getByTitle('Тёмная тема')`,
      },
      {
        id: 'loc-09',
        level: '🟢',
        title: {
          ru: 'Отфильтровать карточки: только в наличии',
          en: 'Filter cards: in stock only',
        },
        path: '/catalog',
        hint: { ru: 'filter', en: 'filter' },
        spoiler: `page.getByTestId('product-card').filter({ hasNotText: 'Нет в наличии' })`,
      },
      {
        id: 'loc-10',
        level: '🟢',
        title: {
          ru: 'Элемент одновременно email и required',
          en: 'Element that is both email and required',
        },
        path: '/practice/forms',
        hint: { ru: 'and()', en: 'and()' },
        spoiler: `page.locator('input[type="email"]').and(page.locator('[required]'))`,
      },
      {
        id: 'loc-11',
        level: '🟢',
        title: {
          ru: 'Кнопка «В корзину» ИЛИ «Купить сейчас»',
          en: 'The "В корзину" OR "Купить сейчас" button',
        },
        path: '/product/p1',
        hint: { ru: 'or()', en: 'or()' },
        spoiler: `page.getByRole('button', { name: 'В корзину' })\n  .or(page.getByRole('button', { name: 'Купить сейчас' }))`,
      },
      {
        id: 'loc-12',
        level: '🟢',
        title: { ru: 'Третья карточка каталога', en: 'Third catalog card' },
        path: '/catalog',
        hint: { ru: 'nth()', en: 'nth()' },
        spoiler: `page.getByTestId('product-card').nth(2)`,
      },
      {
        id: 'loc-13',
        level: '🟢',
        title: {
          ru: 'Строка таблицы без «v5» в названии',
          en: 'Table row without "v5" in the name',
        },
        path: '/practice/tables',
        hint: { ru: 'hasNot', en: 'hasNot' },
        spoiler: `page.getByTestId(/^row-/).filter({ hasNotText: 'v5' }).first()`,
      },
      {
        id: 'loc-14',
        level: '🟢',
        title: {
          ru: 'Три одинаковые «Подробнее»: strict mode падает',
          en: 'Three identical "Подробнее" links: strict mode fails',
        },
        path: '/practice/links',
        hint: { ru: 'first() / nth()', en: 'first() / nth()' },
        spoiler: `// page.getByRole('link', { name: 'Подробнее' }) — упадёт strict mode\npage.getByRole('link', { name: 'Подробнее' }).nth(1)\n// или first(), last()`,
      },
      {
        id: 'loc-15',
        level: '🟢',
        title: { ru: 'Скрытый дубль ссылки', en: 'Hidden duplicate link' },
        path: '/practice/links',
        hint: { ru: 'filter visible', en: 'filter visible' },
        spoiler: `page.getByTestId('hidden-duplicate') // display:none\n// getByRole автоматически игнорирует hidden-элементы`,
      },
    ],
  },
  {
    id: 'forms-auth',
    title: { ru: '📝 Формы и авторизация', en: '📝 Forms & auth' },
    tasks: [
      {
        id: 'auth-01',
        level: '🟢',
        title: {
          ru: 'Регистрация: успешный сценарий',
          en: 'Registration: happy path',
        },
        path: '/register',
        hint: { ru: 'заполнить все поля', en: 'fill all fields' },
        spoiler: `заполните reg-name/reg-email/reg-password/reg-confirm → ожидайте переход на /account`,
      },
      {
        id: 'auth-02',
        level: '🟢',
        title: {
          ru: 'Регистрация: короткое имя → aria-invalid',
          en: 'Registration: short name → aria-invalid',
        },
        path: '/register',
        hint: {
          ru: 'toHaveAttribute aria-invalid',
          en: 'toHaveAttribute aria-invalid',
        },
        spoiler: `await page.getByTestId('reg-name').fill('а')\nawait page.getByTestId('register-form').locator('button[type=submit]').click()\nexpect(page.getByTestId('reg-name')).toHaveAttribute('aria-invalid', 'true')`,
      },
      {
        id: 'auth-03',
        level: '🟢',
        title: {
          ru: 'Логин: неверный пароль → role=alert',
          en: 'Login: wrong password → role=alert',
        },
        path: '/login',
        hint: { ru: 'getByRole alert', en: 'getByRole alert' },
        spoiler: `expect(page.getByRole('alert')).toContainText('Неверный email или пароль')`,
      },
      {
        id: 'auth-04',
        level: '🟢',
        title: {
          ru: 'Логин customer: имя в шапке',
          en: 'Customer login: name in the header',
        },
        path: '/login',
        hint: { ru: 'storageState', en: 'storageState' },
        spoiler: `customer@shop.test / password123 → в шапке «Иван Покупатель»`,
      },
      {
        id: 'auth-05',
        level: '🔴',
        title: {
          ru: '2FA: вход admin по коду из /api/test/otp',
          en: '2FA: admin login via code from /api/test/otp',
        },
        path: '/practice/otp',
        hint: { ru: 'apiRequestContext + OTP', en: 'apiRequestContext + OTP' },
        spoiler: `const { otp } = await request.get('/api/test/otp?email=admin@shop.test').then(r => r.json())`,
      },
      {
        id: 'auth-06',
        level: '🟢',
        title: {
          ru: 'Ловушка disabled: промокод применяется только после reset',
          en: 'Disabled trap: promo applies only after reset',
        },
        path: '/cart',
        hint: { ru: 'toBeEnabled / waitFor', en: 'toBeEnabled / waitFor' },
        spoiler: `добавьте товар, примените SALE10 — кнопка «Перейти к оформлению» станет активной`,
      },
    ],
  },
  {
    id: 'shop',
    title: { ru: '🛒 Сценарии магазина', en: '🛒 Shop scenarios' },
    tasks: [
      {
        id: 'shop-01',
        level: '🟢',
        title: {
          ru: 'Добавить товар: счётчик в шапке',
          en: 'Add to cart: header counter',
        },
        path: '/catalog',
        hint: { ru: 'cart-count', en: 'cart-count' },
        spoiler: `await page.getByTestId('add-to-cart').first().click()\nexpect(page.getByTestId('cart-count')).toHaveText('1')`,
      },
      {
        id: 'shop-02',
        level: '🟡',
        title: { ru: 'Промокод SALE10: скидка 10%', en: 'Promo SALE10: 10% off' },
        path: '/cart',
        hint: { ru: 'promo-form', en: 'promo-form' },
        spoiler: `page.getByTestId('promo-input').fill('SALE10')\n// проверьте строку «Скидка» в cart-summary`,
      },
      {
        id: 'shop-03',
        level: '🟡',
        title: {
          ru: 'Полный чекаут до номера заказа',
          en: 'Full checkout to order number',
        },
        path: '/checkout',
        hint: { ru: 'co-* testId', en: 'co-* testId' },
        spoiler: `co-name → co-email → co-phone (маска!) → co-next → co-address → co-confirm\nexpect(page.getByTestId('order-number')).toContainText('ORD-')`,
      },
      {
        id: 'shop-04',
        level: '🟡',
        title: { ru: 'Скачать счёт: событие download', en: 'Download invoice: download event' },
        path: '/account',
        hint: { ru: 'waitForEvent download', en: 'waitForEvent download' },
        spoiler: `const dl = page.waitForEvent('download')\npage.getByTestId('invoice-o1').click()\nexpect((await dl).suggestedFilename()).toMatch(/invoice/)`,
      },
      {
        id: 'shop-05',
        level: '🟢',
        title: {
          ru: 'Маска телефона форматирует ввод',
          en: 'Phone mask formats input',
        },
        path: '/checkout',
        hint: { ru: 'toHaveValue', en: 'toHaveValue' },
        spoiler: `fill('79001234567') → toHaveValue('+7 (900) 123-45-67')`,
      },
      {
        id: 'shop-06',
        level: '🟢',
        title: { ru: 'Вкладки карточки: role=tab', en: 'Card tabs: role=tab' },
        path: '/product/p1',
        hint: { ru: 'getByRole tab', en: 'getByRole tab' },
        spoiler: `page.getByRole('tab', { name: /Отзывы/ }).click()\nexpect(page.getByRole('tab', { name: /Отзывы/ })).toHaveAttribute('aria-selected', 'true')`,
      },
      {
        id: 'shop-07',
        level: '🟢',
        title: {
          ru: 'Счётчик количества: плюс/минус',
          en: 'Quantity counter: plus/minus',
        },
        path: '/product/p1',
        hint: { ru: 'qty-input', en: 'qty-input' },
        spoiler: `qty-plus → qty-input имеет значение 2`,
      },
      {
        id: 'shop-08',
        level: '🟡',
        title: {
          ru: 'Оставить отзыв: отображается в списке',
          en: 'Leave a review: shows up in the list',
        },
        path: '/product/p1',
        hint: { ru: 'review-form', en: 'review-form' },
        spoiler: `вкладка Отзывы → review-author/review-text → review-submit`,
      },
      {
        id: 'shop-09',
        level: '🟢',
        title: {
          ru: 'Хлебные крошки: первый пункт «Главная»',
          en: 'Breadcrumbs: first item is “Home”',
        },
        path: '/product/p1',
        hint: { ru: 'nav[aria-label]', en: 'nav[aria-label]' },
        spoiler: `page.getByRole('navigation', { name: 'Хлебные крошки' }).getByRole('link').first()`,
      },
    ],
  },
  {
    id: 'mid',
    title: { ru: '🟡 Средний уровень', en: '🟡 Intermediate level' },
    tasks: [
      {
        id: 'mid-01',
        level: '🟡',
        title: {
          ru: 'Автокомплит: debounce и выбор опции',
          en: 'Autocomplete: debounce and option pick',
        },
        path: '/practice/autocomplete',
        hint: {
          ru: 'waitForResponse или expect.poll',
          en: 'waitForResponse or expect.poll',
        },
        spoiler: `fill('науш') → дождитесь ac-listbox → ac-option-0`,
      },
      {
        id: 'mid-02',
        level: '🟡',
        title: {
          ru: 'Фильтры каталога → query-параметры',
          en: 'Catalog filters → query params',
        },
        path: '/catalog',
        hint: { ru: 'toHaveURL', en: 'toHaveURL' },
        spoiler: `примените фильтр → expect(page).toHaveURL(/category=/)`,
      },
      {
        id: 'mid-03',
        level: '🟡',
        title: {
          ru: 'Пагинация: вторая страница другая',
          en: 'Pagination: page 2 is different',
        },
        path: '/catalog',
        hint: { ru: 'page-2', en: 'page-2' },
        spoiler: `page.getByTestId('page-2').click() — первый товар изменится`,
      },
      {
        id: 'mid-04',
        level: '🟡',
        title: {
          ru: 'Infinite scroll: «Все 64 товара загружены»',
          en: 'Infinite scroll: “All 64 items loaded”',
        },
        path: '/practice/pagination',
        hint: { ru: 'scrollIntoViewIfNeeded', en: 'scrollIntoViewIfNeeded' },
        spoiler: `клик mode-infinite → скроллите sentinel до infinite-finished`,
      },
      {
        id: 'mid-05',
        level: '🟡',
        title: { ru: 'Таблица: сортировка по цене', en: 'Table: sort by price' },
        path: '/practice/tables',
        hint: { ru: 'aria-sort', en: 'aria-sort' },
        spoiler: `клик по заголовку «Цена» → th получает aria-sort="ascending"`,
      },
      {
        id: 'mid-06',
        level: '🟡',
        title: { ru: 'Таблица: inline-edit имени', en: 'Table: inline name edit' },
        path: '/practice/tables',
        hint: { ru: 'edit-* testId', en: 'edit-* testId' },
        spoiler: `edit-p1 → edit-input-p1 → новое имя → save-p1`,
      },
      {
        id: 'mid-07',
        level: '🟡',
        title: { ru: 'Таблица: выбор строк', en: 'Table: row selection' },
        path: '/practice/tables',
        hint: { ru: 'selection-info', en: 'selection-info' },
        spoiler: `select-all → «Выбрано строк: 20»`,
      },
      {
        id: 'mid-08',
        level: '🟡',
        title: {
          ru: 'Модалка: открыть и закрыть по Esc',
          en: 'Modal: open and close with Esc',
        },
        path: '/practice/overlays',
        hint: { ru: 'keyboard.press Escape', en: 'keyboard.press Escape' },
        spoiler: `open-modal → диалог видим → press Escape → скрыт`,
      },
      {
        id: 'mid-09',
        level: '🟡',
        title: { ru: 'Drawer: действие из панели', en: 'Drawer: action from the panel' },
        path: '/practice/overlays',
        hint: { ru: 'drawer-action', en: 'drawer-action' },
        spoiler: `open-drawer → drawer-action → toast в регионе уведомлений`,
      },
      {
        id: 'mid-10',
        level: '🟡',
        title: {
          ru: 'Нативные alert/confirm/prompt',
          en: 'Native alert/confirm/prompt',
        },
        path: '/practice/overlays',
        hint: { ru: "page.on('dialog')", en: "page.on('dialog')" },
        spoiler: `page.once('dialog', d => d.accept()) перед кликом`,
      },
      {
        id: 'mid-11',
        level: '🟡',
        title: {
          ru: 'Скелетон при медленной загрузке',
          en: 'Skeleton on slow load',
        },
        path: '/practice/dynamic',
        hint: { ru: 'skeleton testId', en: 'skeleton testId' },
        spoiler: `load-slow → data-testid="skeleton" виден ~1.2 с`,
      },
      {
        id: 'mid-12',
        level: '🟡',
        title: {
          ru: 'Динамические id/классы: клик по тексту',
          en: 'Dynamic ids/classes: click by text',
        },
        path: '/practice/dynamic',
        hint: {
          ru: 'НЕ использовать css/id',
          en: 'Do NOT use css/id selectors',
        },
        spoiler: `page.getByRole('button', { name: 'Форсировать re-render' })`,
      },
      {
        id: 'mid-13',
        level: '🟡',
        title: { ru: 'Новое окно: popup-контекст', en: 'New window: popup context' },
        path: '/practice/windows',
        hint: { ru: `waitForEvent('popup')`, en: `waitForEvent('popup')` },
        spoiler: `const popup = page.context().waitForEvent('page') // или page.waitForEvent('popup')`,
      },
      {
        id: 'mid-14',
        level: '🟡',
        title: {
          ru: 'Отложенный popup через 1.5 с',
          en: 'Delayed popup after 1.5 s',
        },
        path: '/practice/windows',
        hint: {
          ru: 'waitForEvent c таймаутом',
          en: 'waitForEvent with a timeout',
        },
        spoiler: `const popupPromise = page.waitForEvent('popup')\npage.getByTestId('open-delayed-popup').click()\nconst popup = await popupPromise`,
      },
      {
        id: 'mid-15',
        level: '🟡',
        title: {
          ru: 'RU/EN переключатель меняет шапку',
          en: 'RU/EN toggle changes the header',
        },
        path: '/',
        hint: { ru: 'lang-toggle', en: 'lang-toggle' },
        spoiler: `lang-toggle → «Home» вместо «Главная»`,
      },
      {
        id: 'mid-16',
        level: '🟡',
        title: {
          ru: 'Тёмная тема: data-theme="dark"',
          en: 'Dark theme: data-theme="dark"',
        },
        path: '/',
        hint: {
          ru: 'toHaveAttribute на html',
          en: 'toHaveAttribute on html',
        },
        spoiler: `theme-toggle → expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')`,
      },
      {
        id: 'mid-17',
        level: '🟡',
        title: {
          ru: 'Вложенные таблицы: поиск внутри',
          en: 'Nested tables: search inside',
        },
        path: '/practice/tables',
        hint: {
          ru: 'getByTestId(nested-...)',
          en: 'getByTestId(nested-...)',
        },
        spoiler: `nested-table-electronics — вторая таблица внутри строки`,
      },
    ],
  },
  {
    id: 'advanced',
    title: { ru: '🔴 Сложный уровень', en: '🔴 Advanced level' },
    tasks: [
      {
        id: 'adv-01',
        level: '🔴',
        title: {
          ru: 'WebSocket-чат: отправка сообщения',
          en: 'WebSocket chat: send a message',
        },
        path: '/practice/realtime',
        hint: { ru: 'ws-status online', en: 'ws-status online' },
        spoiler: `chat-text + chat-send → сообщение в chat-log`,
      },
      {
        id: 'adv-02',
        level: '🔴',
        title: { ru: 'SSE-лента: статус live', en: 'SSE feed: live status' },
        path: '/practice/realtime',
        hint: { ru: 'feed-status', en: 'feed-status' },
        spoiler: `expect(page.getByTestId('feed-status')).toHaveText('live')`,
      },
      {
        id: 'adv-03',
        level: '🔴',
        title: {
          ru: 'Live-остатки меняются каждые 2 с',
          en: 'Live stock levels change every 2 s',
        },
        path: '/practice/realtime',
        hint: { ru: 'expect.poll', en: 'expect.poll' },
        spoiler: `expect.poll(async () => text(stock-updates)).not.toBe('обновлений: 1')`,
      },
      {
        id: 'adv-04',
        level: '🔴',
        title: { ru: 'Платёжная форма в iframe', en: 'Payment form in an iframe' },
        path: '/practice/iframes',
        hint: { ru: 'frameLocator', en: 'frameLocator' },
        spoiler: `page.frameLocator('[data-testid="frame-payment"]').getByTestId('pay-card')`,
      },
      {
        id: 'adv-05',
        level: '🔴',
        title: {
          ru: 'srcdoc-iframe: 2 уровня вложенности',
          en: 'srcdoc iframe: 2 nesting levels',
        },
        path: '/practice/iframes',
        hint: { ru: 'frame → frame', en: 'frame → frame' },
        spoiler: `frameLocator('[data-testid="frame-srcdoc"]').frameLocator('iframe').getByRole('link', { name: 'Раздел «Альфа»' })`,
      },
      {
        id: 'adv-06',
        level: '🔴',
        title: { ru: 'Open Shadow: клик внутри', en: 'Open Shadow: click inside' },
        path: '/practice/shadow',
        hint: {
          ru: 'пирсинг локаторов',
          en: 'locator piercing',
        },
        spoiler: `page.locator('lit-open-counter').getByRole('button').click() // Playwright пробивает shadow автоматически`,
      },
      {
        id: 'adv-07',
        level: '🔴',
        title: {
          ru: 'Closed Shadow: только события и слоты',
          en: 'Closed Shadow: only events and slots',
        },
        path: '/practice/shadow',
        hint: { ru: 'событие panel-action', en: 'panel-action event' },
        spoiler: `кнопка недоступна → клик по слоту/заголовку или ждите событие`,
      },
      {
        id: 'adv-08',
        level: '🔴',
        title: {
          ru: 'HTML5 DnD: карточка в «Готово»',
          en: 'HTML5 DnD: card into “Done”',
        },
        path: '/practice/dnd',
        hint: { ru: 'dragTo', en: 'dragTo' },
        spoiler: `page.getByTestId('dnd-card-t1').dragTo(page.getByTestId('column-done'))`,
      },
      {
        id: 'adv-09',
        level: '🔴',
        title: {
          ru: 'Pointer drag: ползунок в зону «Б»',
          en: 'Pointer drag: slider into zone “B”',
        },
        path: '/practice/dnd',
        hint: { ru: 'mouse down/move/up', en: 'mouse down/move/up' },
        spoiler: `hover(knob) → mouse.down() → mouse.move(…, steps) → mouse.up()`,
      },
      {
        id: 'adv-10',
        level: '🔴',
        title: {
          ru: 'Canvas: рисование меняет счётчик',
          en: 'Canvas: drawing changes the counter',
        },
        path: '/practice/canvas',
        hint: { ru: 'mouse путь', en: 'mouse path' },
        spoiler: `drawing-canvas: down/move/up → stroke-count увеличился`,
      },
      {
        id: 'adv-11',
        level: '🔴',
        title: {
          ru: 'SVG: клик по столбцу «Пт»',
          en: 'SVG: click the “Fri” bar',
        },
        path: '/practice/canvas',
        hint: { ru: '[data-bar]', en: '[data-bar]' },
        spoiler: `page.locator('[data-bar="Пт"]').click() → svg-picked`,
      },
      {
        id: 'adv-12',
        level: '🔴',
        title: {
          ru: 'Ошибки: page.route подменяет 500',
          en: 'Errors: page.route fakes a 500',
        },
        path: '/practice/errors',
        hint: { ru: 'route.fulfill', en: 'route.fulfill' },
        spoiler: `page.route('**/api/demo/errors/500', r => r.fulfill({ status: 200, body: '{}' }))`,
      },
      {
        id: 'adv-13',
        level: '🔴',
        title: {
          ru: 'Медленный ответ: expect.poll',
          en: 'Slow response: expect.poll',
        },
        path: '/practice/errors',
        hint: { ru: 'err-slow', en: 'err-slow' },
        spoiler: `клик err-slow → poll до появления результата (~3 с)`,
      },
      {
        id: 'adv-14',
        level: '🔴',
        title: { ru: 'Кастомный select: город', en: 'Custom select: city' },
        path: '/practice/components',
        hint: {
          ru: 'aria-expanded + option',
          en: 'aria-expanded + option',
        },
        spoiler: `cs-trigger → cs-option-Новосибирск → cs-value`,
      },
      {
        id: 'adv-15',
        level: '🔴',
        title: { ru: 'Мультиселект: теги и ✕', en: 'Multiselect: tags and ✕' },
        path: '/practice/components',
        hint: { ru: 'remove-tag-*', en: 'remove-tag-*' },
        spoiler: `remove-tag-playwright → тег исчез из tag-chips`,
      },
      {
        id: 'adv-16',
        level: '🔴',
        title: {
          ru: 'Дерево: раскрыть узел',
          en: 'Tree: expand a node',
        },
        path: '/practice/components',
        hint: { ru: 'aria-expanded', en: 'aria-expanded' },
        spoiler: `tree-books → aria-expanded="true", появились дочерние li`,
      },
      {
        id: 'adv-17',
        level: '🔴',
        title: { ru: 'Datepicker: 15 декабря', en: 'Datepicker: December 15' },
        path: '/practice/components',
        hint: { ru: 'dp-day-15', en: 'dp-day-15' },
        spoiler: `dp-trigger → dp-day-15 → dp-value: 2026-12-15`,
      },
      {
        id: 'adv-18',
        level: '🔴',
        title: {
          ru: 'Contenteditable: ввод и сохранение',
          en: 'Contenteditable: input and save',
        },
        path: '/practice/components',
        hint: { ru: 'editable-block', en: 'editable-block' },
        spoiler: `fill() работает с contentEditable в Playwright`,
      },
      {
        id: 'adv-19',
        level: '🔴',
        title: {
          ru: 'Аккордеон: aria-expanded',
          en: 'Accordion: aria-expanded',
        },
        path: '/practice/components',
        hint: { ru: 'acc-*', en: 'acc-*' },
        spoiler: `acc-a2 → aria-expanded="true" + acc-panel-a2 виден`,
      },
      {
        id: 'adv-20',
        level: '🔴',
        title: {
          ru: 'Контекстное меню: правый клик',
          en: 'Context menu: right click',
        },
        path: '/practice/components',
        hint: { ru: 'click button right', en: 'click button right' },
        spoiler: `click({ button: 'right' }) → ctx-copy → context-action`,
      },
      {
        id: 'adv-21',
        level: '🔴',
        title: {
          ru: 'Double click переключает режим',
          en: 'Double click toggles the mode',
        },
        path: '/practice/components',
        hint: { ru: 'dblclick()', en: 'dblclick()' },
        spoiler: `page.getByTestId('dbl-target').dblclick() → «режим: on»`,
      },
      {
        id: 'adv-22',
        level: '🔴',
        title: { ru: 'Long press 500 мс', en: 'Long press 500 ms' },
        path: '/practice/components',
        hint: {
          ru: 'down/up с паузой',
          en: 'down/up with a pause',
        },
        spoiler: `mouse.down(); waitForTimeout(600); mouse.up()`,
      },
      {
        id: 'adv-23',
        level: '🔴',
        title: {
          ru: 'Ctrl+K палитра: Enter запускает',
          en: 'Ctrl+K palette: Enter launches',
        },
        path: '/practice/hotkeys',
        hint: { ru: 'keyboard Ctrl+K', en: 'keyboard Ctrl+K' },
        spoiler: `keyboard.press('Control+K') → palette-input → Enter`,
      },
      {
        id: 'adv-24',
        level: '🔴',
        title: { ru: 'Clipboard: copy/paste', en: 'Clipboard: copy/paste' },
        path: '/practice/hotkeys',
        hint: {
          ru: 'grantPermissions clipboard',
          en: 'grantPermissions clipboard',
        },
        spoiler: `context.grantPermissions(['clipboard-read','clipboard-write'])`,
      },
      {
        id: 'adv-25',
        level: '🔴',
        title: { ru: 'Таймеры: page.clock', en: 'Timers: page.clock' },
        path: '/practice/timers',
        hint: {
          ru: 'clock.install + fastForward',
          en: 'clock.install + fastForward',
        },
        spoiler: `page.clock.install(); …; page.clock.fastForward(10_000)`,
      },
      {
        id: 'adv-26',
        level: '🔴',
        title: { ru: 'Upload: txt-файл', en: 'Upload: txt file' },
        path: '/practice/upload',
        hint: { ru: 'setInputFiles', en: 'setInputFiles' },
        spoiler: `page.getByTestId('file-input').setInputFiles({ name: 't.txt', mimeType: 'text/plain', buffer })`,
      },
      {
        id: 'adv-27',
        level: '🔴',
        title: {
          ru: 'Upload: файл >1 МБ отклоняется',
          en: 'Upload: file >1 MB is rejected',
        },
        path: '/practice/upload',
        hint: { ru: 'role=alert', en: 'role=alert' },
        spoiler: `буфер 1.1 МБ → upload-error «больше лимита»`,
      },
      {
        id: 'adv-28',
        level: '🔴',
        title: {
          ru: 'Геолокация: эмуляция',
          en: 'Geolocation: emulation',
        },
        path: '/practice/device',
        hint: {
          ru: 'context.setGeolocation',
          en: 'context.setGeolocation',
        },
        spoiler: `context.setGeolocation({ latitude: 55.75, longitude: 37.62 }) + grantPermissions`,
      },
      {
        id: 'adv-29',
        level: '🔴',
        title: {
          ru: 'Админка: виртуальная таблица, конец списка',
          en: 'Admin: virtual table, end of list',
        },
        path: '/admin',
        hint: { ru: 'vt-scroll scroll', en: 'vt-scroll scroll' },
        spoiler: `scrollIntoViewIfNeeded строки vt-row-v9999 — отрендерится окно`,
      },
      {
        id: 'adv-30',
        level: '🔴',
        title: {
          ru: 'Админка: CRUD через UI',
          en: 'Admin: CRUD through the UI',
        },
        path: '/admin',
        hint: { ru: 'create-product-form', en: 'create-product-form' },
        spoiler: `войдите manager@ → np-name/np-price/np-stock → np-create`,
      },
      {
        id: 'adv-31',
        level: '🔴',
        title: {
          ru: 'axe: нарушения на /practice/a11y',
          en: 'axe: violations on /practice/a11y',
        },
        path: '/practice/a11y',
        hint: { ru: '@axe-core/playwright', en: '@axe-core/playwright' },
        spoiler: `const { violations } = await new AxeBuilder({ page }).analyze() // violations.length > 0`,
      },
      {
        id: 'adv-32',
        level: '🔴',
        title: {
          ru: 'Скриншот: маскирование [data-mask]',
          en: 'Screenshot: masking [data-mask]',
        },
        path: '/practice/screenshot',
        hint: {
          ru: 'toHaveScreenshot mask',
          en: 'toHaveScreenshot mask',
        },
        spoiler: `toHaveScreenshot({ mask: [page.locator('[data-mask]')] })`,
      },
    ],
  },
  {
    id: 'chaos',
    title: { ru: '🌀 Chaos-режим', en: '🌀 Chaos mode' },
    tasks: [
      {
        id: 'chaos-01',
        level: '🔴',
        title: {
          ru: 'Включить задержки API (500 мс) и пережить каталог',
          en: 'Enable API delays (500 ms) and survive the catalog',
        },
        path: '/practice/chaos',
        hint: { ru: 'POST /api/test/flags', en: 'POST /api/test/flags' },
        spoiler: `{ apiDelayMs: 500 } → каталог всё ещё догружает список`,
      },
      {
        id: 'chaos-02',
        level: '🔴',
        title: {
          ru: 'Случайные 500: ретраи в тесте',
          en: 'Random 500s: retries in the test',
        },
        path: '/practice/chaos',
        hint: { ru: 'apiErrorRate: 0.5', en: 'apiErrorRate: 0.5' },
        spoiler: `page.route с retry или poll с перезапросом`,
      },
      {
        id: 'chaos-03',
        level: '🔴',
        title: {
          ru: 'Исчезающие кнопки (vanishMs)',
          en: 'Vanishing buttons (vanishMs)',
        },
        path: '/practice/chaos',
        hint: {
          ru: 'ловить момент появления',
          en: 'catch the moment of appearance',
        },
        spoiler: `vanishMs: 1500 → кликнуть data-chaos="vanish" до исчезновения`,
      },
      {
        id: 'chaos-04',
        level: '🔴',
        title: {
          ru: 'Убегающие кнопки (movingButtons)',
          en: 'Escaping buttons (movingButtons)',
        },
        path: '/practice/chaos',
        hint: {
          ru: 'dispatchEvent вместо hover',
          en: 'dispatchEvent instead of hover',
        },
        spoiler: `el.dispatchEvent('click') или force: true`,
      },
      {
        id: 'chaos-05',
        level: '🔴',
        title: {
          ru: 'Re-render во время клика',
          en: 'Re-render during the click',
        },
        path: '/practice/chaos',
        hint: { ru: 'rerenderMs: 400', en: 'rerenderMs: 400' },
        spoiler: `auto-waiting Playwright перепробует клик — тест всё равно зелёный`,
      },
      {
        id: 'chaos-06',
        level: '🔴',
        title: {
          ru: 'Медленные картинки (slowImages)',
          en: 'Slow images (slowImages)',
        },
        path: '/catalog',
        hint: { ru: 'image-skeleton', en: 'image-skeleton' },
        spoiler: `slowImages: true → skeleton виден ~900 мс`,
      },
    ],
  },
]
