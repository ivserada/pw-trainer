/**
 * 🟢 /practice/links — target=_blank, якоря, breadcrumbs, ловушки для локаторов.
 */
export function LinksPage() {
  return (
    <div className="page page--narrow">
      <h1>🟢 Ссылки</h1>
      <p className="muted">
        Разные виды ссылок: внешние окна, якоря, скачивание, хлебные крошки — и несколько ловушек
        для <code>getByRole('link')</code>.
      </p>

      <section className="card card--pad-lg stack" data-testid="links-external">
        <h2>Новые окна и скачивание</h2>
        <p>
          <a href="/api/docs" target="_blank" rel="noreferrer" data-testid="link-api-docs">
            Документация API (откроется в новой вкладке) ↗
          </a>
        </p>
        <p>
          <a href="/product/p1" target="_blank" rel="noreferrer" data-testid="link-product-blank">
            Карточка товара p1 в новой вкладке ↗
          </a>
        </p>
        <p>
          <a href="/api/orders/o1/invoice" download data-testid="link-invoice-download">
            Скачать счёт заказа ORD-2026-001 (PDF)
          </a>
        </p>
        <p>
          <a href="mailto:support@shop.test" data-testid="link-mailto">
            Написать в поддержку (mailto)
          </a>
        </p>
      </section>

      <section
        className="card card--pad-lg stack"
        style={{ marginTop: '1rem' }}
        data-testid="links-anchors"
      >
        <h2>Якоря</h2>
        <nav aria-label="Содержание страницы">
          <ul className="row" style={{ listStyle: 'none', padding: 0 }}>
            <li>
              <a href="#section-alpha">Раздел «Альфа»</a>
            </li>
            <li>
              <a href="#section-beta">Раздел «Бета»</a>
            </li>
            <li>
              <a href="#section-gamma">Раздел «Гамма»</a>
            </li>
          </ul>
        </nav>
        <article id="section-alpha" tabIndex={-1} style={{ scrollMarginTop: '5rem' }}>
          <h3>Альфа</h3>
          <p className="muted">
            Первый якорный раздел. Переход должен менять URL на #section-alpha.
          </p>
        </article>
        <article id="section-beta" tabIndex={-1} style={{ scrollMarginTop: '5rem' }}>
          <h3>Бета</h3>
          <p className="muted">Второй якорный раздел с фокусируемой заголовочной зоной.</p>
        </article>
        <article id="section-gamma" tabIndex={-1} style={{ scrollMarginTop: '5rem' }}>
          <h3>Гамма</h3>
          <p className="muted">Третий якорный раздел.</p>
        </article>
      </section>

      <section
        className="card card--pad-lg stack"
        style={{ marginTop: '1rem' }}
        data-testid="links-breadcrumbs"
      >
        <h2>Хлебные крошки</h2>
        <nav aria-label="Хлебные крошки (демо)">
          <ol className="breadcrumbs">
            <li>
              <a href="/">Главная</a>
            </li>
            <li>
              <a href="/catalog">Каталог</a>
            </li>
            <li>
              <a href="/catalog?category=electronics">Электроника</a>
            </li>
            <li aria-current="page">Наушники</li>
          </ol>
        </nav>
      </section>

      <section
        className="card card--pad-lg stack"
        style={{ marginTop: '1rem' }}
        data-testid="links-traps"
      >
        <h2>Ловушки ⚠️</h2>
        <div>
          <p>Три ссылки с одинаковым текстом «Подробнее»:</p>
          <ul>
            <li>
              <a href="/product/p1">Подробнее</a>
            </li>
            <li>
              <a href="/product/p2">Подробнее</a>
            </li>
            <li>
              <a href="/product/p3">Подробнее</a>
            </li>
          </ul>
        </div>
        <div>
          <p>
            Ссылка-дубль, скрытая через <code>display: none</code> (strict mode нарушится, если не
            фильтровать по видимости):
          </p>
          <a href="/product/p9" style={{ display: 'none' }} data-testid="hidden-duplicate">
            Документация API ↗
          </a>
          <a href="/api/docs" target="_blank" rel="noreferrer">
            Документация API ↗
          </a>
        </div>
        <div>
          <p>Изображение-ссылка (работает getByAltText):</p>
          <a href="/catalog" aria-label="Каталог товаров">
            <svg viewBox="0 0 40 40" width="40" height="40" role="img" aria-label="Иконка витрины">
              <rect width="40" height="40" rx="8" fill="#7c3aed" />
              <path
                d="M10 26l5-10 5 7 4-5 6 8"
                stroke="#fff"
                strokeWidth="2.5"
                fill="none"
                strokeLinecap="round"
              />
            </svg>
          </a>
        </div>
      </section>
    </div>
  )
}
