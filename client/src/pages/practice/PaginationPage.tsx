import { useCallback, useEffect, useRef, useState } from 'react'
import { api, type Product } from '../../api/client'

interface ListResponse {
  items: Product[]
  total: number
  page: number
  pages: number
}

/**
 * 🟡 /practice/pagination — классическая пагинация и infinite scroll.
 */
export function PaginationPage() {
  const [mode, setMode] = useState<'paged' | 'infinite'>('paged')

  return (
    <div className="page">
      <h1>🟡 Пагинация и infinite scroll</h1>
      <p className="muted">
        Две реализации списка из 64 товаров: постраничная (по 8) и бесконечная лента (подгрузка по
        IntersectionObserver).
      </p>
      <div className="tabs__list" role="tablist" aria-label="Режим списка">
        <button
          type="button"
          role="tab"
          aria-selected={mode === 'paged'}
          className="tabs__tab"
          onClick={() => setMode('paged')}
          data-testid="mode-paged"
        >
          Пагинация
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === 'infinite'}
          className="tabs__tab"
          onClick={() => setMode('infinite')}
          data-testid="mode-infinite"
        >
          Infinite scroll
        </button>
      </div>
      {mode === 'paged' ? <PagedList /> : <InfiniteList />}
    </div>
  )
}

function PagedList() {
  const [data, setData] = useState<ListResponse | null>(null)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    api
      .get<ListResponse>(`/api/products?page=${page}&pageSize=8`)
      .then(setData)
      .finally(() => setLoading(false))
  }, [page])

  return (
    <section aria-label="Постраничный список" data-testid="paged-list">
      {loading || !data ? (
        <p className="muted">Загрузка…</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {data.items.map((p) => (
            <li
              key={p.id}
              className="card"
              style={{ marginBottom: '0.5rem' }}
              data-testid="paged-item"
            >
              {p.name} — {(p.priceCents / 100).toLocaleString('ru-RU')} ₽
            </li>
          ))}
        </ul>
      )}
      <nav className="pagination" aria-label="Страницы">
        {data
          ? Array.from({ length: data.pages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                type="button"
                aria-current={p === page ? 'page' : undefined}
                onClick={() => setPage(p)}
                data-testid={`pg-${p}`}
              >
                {p}
              </button>
            ))
          : null}
      </nav>
    </section>
  )
}

function InfiniteList() {
  const [items, setItems] = useState<Product[]>([])
  const [page, setPage] = useState(0)
  const [finished, setFinished] = useState(false)
  const [loading, setLoading] = useState(false)
  const sentinelRef = useRef<HTMLLIElement>(null)

  const loadMore = useCallback(() => {
    setLoading(true)
    const nextPage = page + 1
    api
      .get<ListResponse>(`/api/products?page=${nextPage}&pageSize=8`)
      .then((data) => {
        setItems((prev) => [...prev, ...data.items])
        setPage(nextPage)
        if (data.page >= data.pages) setFinished(true)
      })
      .finally(() => setLoading(false))
  }, [page])

  useEffect(() => {
    if (page === 0) loadMore()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (finished || loading) return
    const node = sentinelRef.current
    if (!node) return
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) loadMore()
    })
    observer.observe(node)
    return () => observer.disconnect()
  }, [finished, loading, loadMore])

  return (
    <section aria-label="Бесконечная лента" data-testid="infinite-list">
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {items.map((p) => (
          <li
            key={p.id}
            className="card"
            style={{ marginBottom: '0.5rem' }}
            data-testid="infinite-item"
          >
            {p.name} — {(p.priceCents / 100).toLocaleString('ru-RU')} ₽
          </li>
        ))}
        {!finished ? (
          <li
            ref={sentinelRef}
            className="muted"
            style={{ padding: '0.75rem', textAlign: 'center' }}
            data-testid="infinite-sentinel"
          >
            {loading ? 'Загрузка…' : '· · ·'}
          </li>
        ) : null}
      </ul>
      {finished ? (
        <p className="muted" role="status" data-testid="infinite-finished">
          Все 64 товара загружены ✅
        </p>
      ) : null}
    </section>
  )
}
