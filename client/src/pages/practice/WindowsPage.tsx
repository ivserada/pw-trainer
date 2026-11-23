/**
 * 🟡 /practice/windows — popup-окна, target=_blank и отложенный popup.
 */
export function WindowsPage() {
  const openPopup = () => {
    window.open('/product/p7', '_blank', 'width=640,height=520,menubar=no,toolbar=no')
  }

  const openDelayedPopup = () => {
    setTimeout(() => {
      window.open('/catalog', '_blank', 'width=640,height=520')
    }, 1500)
  }

  return (
    <div className="page page--narrow">
      <h1>🟡 Новые окна и popup</h1>
      <p className="muted">
        Работа с несколькими контекстами (page → popup). Отложенное окно откроется через 1.5 секунды
        — используйте <code>waitForEvent('popup')</code>.
      </p>

      <section className="card card--pad-lg stack" data-testid="windows-section">
        <button
          type="button"
          className="btn btn--primary"
          onClick={openPopup}
          data-testid="open-popup"
        >
          Открыть popup с товаром p7
        </button>
        <button
          type="button"
          className="btn btn--outline"
          onClick={openDelayedPopup}
          data-testid="open-delayed-popup"
        >
          Открыть popup через 1.5 с
        </button>
        <a
          href="/catalog"
          target="_blank"
          rel="noreferrer"
          className="btn btn--outline"
          data-testid="link-blank-catalog"
        >
          Каталог в новой вкладке (target=_blank)
        </a>
        <a
          href="/api/docs"
          target="_blank"
          rel="noreferrer"
          className="btn btn--outline"
          data-testid="link-blank-docs"
        >
          API docs в новой вкладке
        </a>
      </section>
    </div>
  )
}
