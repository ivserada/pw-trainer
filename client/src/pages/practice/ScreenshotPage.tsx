/**
 * 🔴 /practice/screenshot — статичная сцена для toHaveScreenshot.
 * Элементы с data-mask (время, live-данные) предназначены для маскирования.
 */
export function ScreenshotPage() {
  return (
    <div className="page page--narrow" data-testid="screenshot-page">
      <h1>🔴 Скриншоты</h1>
      <p className="muted">
        Сцена для <code>toHaveScreenshot()</code>. Блоки с <code>data-mask</code> содержат
        изменчивые данные — маскируйте их через <code>page.locator('[data-mask]')</code> или{' '}
        <code>mask: [array]</code>.
      </p>

      <div className="card card--pad-lg" data-testid="screenshot-scene">
        <div className="row" style={{ justifyContent: 'space-between', marginBottom: '1rem' }}>
          <h2 style={{ margin: 0 }}>Сцена «Карточка заказа»</h2>
          <span className="badge badge--success">Оплачен</span>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '0.75rem',
          }}
        >
          <div style={{ border: '1px solid var(--border)', borderRadius: 8, padding: '0.75rem' }}>
            <p className="muted" style={{ margin: 0, fontSize: '0.8rem' }}>
              Заказ
            </p>
            <p className="mono" style={{ margin: 0, fontWeight: 700 }}>
              ORD-2026-001
            </p>
          </div>
          <div
            style={{ border: '1px solid var(--border)', borderRadius: 8, padding: '0.75rem' }}
            data-mask="true"
          >
            <p className="muted" style={{ margin: 0, fontSize: '0.8rem' }}>
              Время рендера
            </p>
            <p className="mono" style={{ margin: 0, fontWeight: 700 }} data-testid="scene-time">
              {new Date().toLocaleTimeString('ru-RU')}
            </p>
          </div>
          <div style={{ border: '1px solid var(--border)', borderRadius: 8, padding: '0.75rem' }}>
            <p className="muted" style={{ margin: 0, fontSize: '0.8rem' }}>
              Сумма
            </p>
            <p style={{ margin: 0, fontWeight: 700 }}>12 500 ₽</p>
          </div>
        </div>

        <div className="table-wrap" style={{ marginTop: '1rem' }}>
          <table className="table">
            <thead>
              <tr>
                <th scope="col">Товар</th>
                <th scope="col">Цена</th>
                <th scope="col">Кол-во</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Kvant Наушники v5</td>
                <td>782 ₽</td>
                <td>1</td>
              </tr>
              <tr>
                <td>Terra Клавиатура v5</td>
                <td>300 ₽</td>
                <td>2</td>
              </tr>
              <tr>
                <td>Nimbus Колонка v1</td>
                <td>248 ₽</td>
                <td>1</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div
          data-mask="true"
          style={{
            marginTop: '1rem',
            height: '10px',
            borderRadius: 999,
            background: 'linear-gradient(90deg,#7c3aed,#38bdf8)',
            position: 'relative',
          }}
          aria-hidden="true"
          data-testid="scene-gradient"
        />
      </div>
    </div>
  )
}
