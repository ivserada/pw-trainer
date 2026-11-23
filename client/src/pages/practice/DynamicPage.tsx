import { useEffect, useState } from 'react'
import { api, type Product } from '../../api/client'

/**
 * 🟡 /practice/dynamic — skeleton-загрузка, медленный ответ и «нестабильные»
 * динамические id/классы (как у CSS-in-JS).
 */
export function DynamicPage() {
  const [items, setItems] = useState<Product[] | null>(null)
  const [slowItems, setSlowItems] = useState<Product[] | null>(null)
  const [slowLoading, setSlowLoading] = useState(false)
  const [tick, setTick] = useState(0)

  // Динамические id/классы меняются на каждый рендер — как в CSS-in-JS библиотеках.
  // Тесты должны опираться на стабильные role/текст, а не на классы.
  const dynId = `id-${Date.now() % 100000}-${tick}`
  const dynClass = `css-${((tick * 7919) % 46656).toString(36)}x${((tick * 31) % 1296).toString(36)}`

  useEffect(() => {
    api.get<{ items: Product[] }>('/api/products?pageSize=4').then((d) => setItems(d.items))
  }, [])

  useEffect(() => {
    const t = setInterval(() => setTick((n) => n + 1), 5000)
    return () => clearInterval(t)
  }, [])

  const loadSlow = () => {
    setSlowLoading(true)
    setSlowItems(null)
    // Детерминированная задержка — гарантированный skeleton на 1.2 с.
    api
      .get<{ items: Product[] }>('/api/products?pageSize=3')
      .then(async (d) => {
        await new Promise((r) => setTimeout(r, 1200))
        setSlowItems(d.items)
      })
      .finally(() => setSlowLoading(false))
  }

  return (
    <div className="page page--narrow">
      <h1>🟡 Динамический контент</h1>
      <p className="muted">
        Skeleton вместо спиннера, задержанная загрузка и элементы с меняющимися <code>id</code> и
        классами.
      </p>

      <section className="card card--pad-lg" data-testid="dynamic-ids-demo">
        <h2>Нестабильные атрибуты</h2>
        <p className="muted">
          Элемент ниже получает новые id/class каждые 5 секунд. Не используйте их в локаторах!
        </p>
        <p id={dynId} className={dynClass} data-testid="dyn-counter">
          Счётчик рендеров: <strong>{tick}</strong>
        </p>
        <button
          type="button"
          className="btn btn--outline btn--sm"
          onClick={() => setTick((n) => n + 1)}
          data-testid="dyn-bump"
        >
          Форсировать re-render
        </button>
      </section>

      <section
        className="card card--pad-lg"
        style={{ marginTop: '1rem' }}
        data-testid="skeleton-section"
      >
        <h2>Skeleton: быстрая загрузка</h2>
        {items === null ? (
          <SkeletonCards />
        ) : (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {items.map((p) => (
              <li
                key={p.id}
                style={{ padding: '0.35rem 0', borderBottom: '1px solid var(--border)' }}
              >
                {p.name}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section
        className="card card--pad-lg"
        style={{ marginTop: '1rem' }}
        data-testid="slow-section"
      >
        <h2>Skeleton: гарантированная задержка 1.2 с</h2>
        <button
          type="button"
          className="btn btn--primary"
          onClick={loadSlow}
          disabled={slowLoading}
          data-testid="load-slow"
        >
          {slowLoading ? 'Грузим…' : 'Загрузить с задержкой'}
        </button>
        <div style={{ marginTop: '1rem' }}>
          {slowLoading ? <SkeletonCards /> : null}
          {slowItems ? (
            <ul style={{ listStyle: 'none', padding: 0 }} data-testid="slow-list">
              {slowItems.map((p) => (
                <li
                  key={p.id}
                  style={{ padding: '0.35rem 0', borderBottom: '1px solid var(--border)' }}
                >
                  {p.name} — {(p.priceCents / 100).toLocaleString('ru-RU')} ₽
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </section>
    </div>
  )
}

function SkeletonCards() {
  return (
    <div aria-label="Загрузка" data-testid="skeleton">
      {[0, 1, 2].map((i) => (
        <div key={i} style={{ marginBottom: '0.8rem' }}>
          <div
            className="skeleton"
            style={{ width: '60%', height: '1rem', marginBottom: '0.4rem' }}
          />
          <div className="skeleton" style={{ width: '35%', height: '0.8rem' }} />
        </div>
      ))}
    </div>
  )
}
