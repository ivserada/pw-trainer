/**
 * 🔴 /practice/a11y — страница с НАМЕРЕННЫМИ нарушениями доступности.
 * Не используйте её как образец. Проверяйте через @axe-core/playwright.
 */
export function A11yPage() {
  return (
    <div className="page page--narrow" data-testid="a11y-page">
      <h1 style={{ color: '#b91c1c' }}>🔴 A11y: страница-антипример</h1>
      <p style={{ color: '#777' }}>
        Эта страница намеренно нарушает правила доступности: у полей нет label, контраст низкий, у
        изображений нет alt, tabindex разъехался. Прогоните axe и посмотрите на отчёт.
      </p>

      <div className="card card--pad-lg">
        <h3 style={{ marginTop: 0 }}>Форма без подписей</h3>
        <input
          type="text"
          placeholder="Имя"
          style={{ width: '100%', marginBottom: '0.5rem', padding: '0.4rem' }}
          data-testid="a11y-name"
        />
        <input
          type="email"
          placeholder="Email"
          style={{ width: '100%', marginBottom: '0.5rem', padding: '0.4rem' }}
          data-testid="a11y-email"
        />
        <div
          role="button"
          style={{
            background: '#7c3aed',
            color: '#fff',
            padding: '0.4rem 1rem',
            display: 'inline-block',
            cursor: 'pointer',
          }}
          data-testid="a11y-fake-button"
        >
          Отправить (div role=button, не фокусируемый)
        </div>
      </div>

      <div className="card card--pad-lg" style={{ marginTop: '1rem' }}>
        <h3 style={{ marginTop: 0 }}>Контраст и изображения</h3>
        <p style={{ color: '#d0d0d0' }}>Этот текст светло-серым на белом — контраст около 1.7:1.</p>
        <img src="/api/docs" width="120" height="60" data-testid="a11y-img-noalt" />
        <p id="a11y-dup">Элемент с дублирующимся id ниже:</p>
        <span id="a11y-dup" style={{ color: '#bbb' }}>
          Дубликат id a11y-dup
        </span>
      </div>

      <div className="card card--pad-lg" style={{ marginTop: '1rem' }}>
        <h4 style={{ marginTop: 0 }}>Скачки заголовков (h4 после h1)</h4>
        <p style={{ color: '#ccc' }}>И ещё один низкоконтрастный абзац.</p>
        <a href="#" style={{ color: '#c4b5fd' }}>
          Пустая ссылка (#)
        </a>
        <div aria-expanded="true" style={{ marginTop: '0.5rem', color: '#999' }}>
          aria-expanded на div без роли — бессмысленный атрибут
        </div>
        <input
          type="text"
          tabIndex={5}
          placeholder="tabIndex=5 вне порядка"
          style={{ marginTop: '0.5rem', padding: '0.4rem' }}
          data-testid="a11y-tabindex"
        />
      </div>
    </div>
  )
}
