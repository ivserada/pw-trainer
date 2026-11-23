import { Fragment, useEffect, useMemo, useState } from 'react'
import { api, type Category, type Product } from '../../api/client'

/**
 * 🟡 /practice/tables — сортировка по заголовкам, inline-edit, выбор строк,
 * вложенные таблицы.
 */
type SortKey = 'name' | 'priceCents' | 'stock' | 'rating'

export function TablesPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [sortKey, setSortKey] = useState<SortKey>('name')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')
  const [editing, setEditing] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const [categories, setCategories] = useState<Category[]>([])

  useEffect(() => {
    api
      .get<{ items: Product[] }>('/api/products?pageSize=20')
      .then((d) => setProducts(d.items))
      .finally(() => setLoading(false))
    api.get<Category[]>('/api/categories').then(setCategories)
  }, [])

  const sorted = useMemo(() => {
    const list = products.slice()
    list.sort((a, b) => {
      const va = a[sortKey]
      const vb = b[sortKey]
      const cmp =
        typeof va === 'string'
          ? va.localeCompare(vb as string, 'ru')
          : (va as number) - (vb as number)
      return sortDir === 'asc' ? cmp : -cmp
    })
    return list
  }, [products, sortKey, sortDir])

  const toggleSort = (key: SortKey) => {
    if (key === sortKey) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleAll = () => {
    setSelected((prev) =>
      prev.size === sorted.length ? new Set() : new Set(sorted.map((p) => p.id)),
    )
  }

  const saveEdit = (id: string) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, name: editName.trim() || p.name } : p)),
    )
    setEditing(null)
  }

  const toggleExpand = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const sortIndicator = (key: SortKey) => (sortKey === key ? (sortDir === 'asc' ? ' ▲' : ' ▼') : '')

  return (
    <div className="page">
      <h1>🟡 Таблицы</h1>
      <p className="muted">
        Клик по заголовку сортирует, карандаш включает inline-редактирование имени, чекбоксы
        выбирают строки, стрелка раскрывает вложенную таблицу отзывов.
      </p>

      <p aria-live="polite" data-testid="selection-info">
        Выбрано строк: <strong>{selected.size}</strong>
      </p>

      {loading ? (
        <p className="muted">Загрузка…</p>
      ) : (
        <div className="table-wrap">
          <table className="table" data-testid="sortable-table">
            <thead>
              <tr>
                <th scope="col">
                  <input
                    type="checkbox"
                    aria-label="Выбрать все строки"
                    checked={selected.size === sorted.length && sorted.length > 0}
                    onChange={toggleAll}
                    data-testid="select-all"
                  />
                </th>
                <th
                  scope="col"
                  aria-sort={
                    sortKey === 'name'
                      ? sortDir === 'asc'
                        ? 'ascending'
                        : 'descending'
                      : undefined
                  }
                >
                  <button
                    type="button"
                    className="btn btn--ghost btn--sm"
                    onClick={() => toggleSort('name')}
                  >
                    Название{sortIndicator('name')}
                  </button>
                </th>
                <th
                  scope="col"
                  aria-sort={
                    sortKey === 'priceCents'
                      ? sortDir === 'asc'
                        ? 'ascending'
                        : 'descending'
                      : undefined
                  }
                >
                  <button
                    type="button"
                    className="btn btn--ghost btn--sm"
                    onClick={() => toggleSort('priceCents')}
                  >
                    Цена{sortIndicator('priceCents')}
                  </button>
                </th>
                <th
                  scope="col"
                  aria-sort={
                    sortKey === 'stock'
                      ? sortDir === 'asc'
                        ? 'ascending'
                        : 'descending'
                      : undefined
                  }
                >
                  <button
                    type="button"
                    className="btn btn--ghost btn--sm"
                    onClick={() => toggleSort('stock')}
                  >
                    Остаток{sortIndicator('stock')}
                  </button>
                </th>
                <th
                  scope="col"
                  aria-sort={
                    sortKey === 'rating'
                      ? sortDir === 'asc'
                        ? 'ascending'
                        : 'descending'
                      : undefined
                  }
                >
                  <button
                    type="button"
                    className="btn btn--ghost btn--sm"
                    onClick={() => toggleSort('rating')}
                  >
                    Рейтинг{sortIndicator('rating')}
                  </button>
                </th>
                <th scope="col">Действия</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((p) => (
                <Fragment key={p.id}>
                  <tr aria-selected={selected.has(p.id)} data-testid={`row-${p.id}`}>
                    <td>
                      <input
                        type="checkbox"
                        aria-label={`Выбрать ${p.name}`}
                        checked={selected.has(p.id)}
                        onChange={() => toggleSelect(p.id)}
                        data-testid={`select-${p.id}`}
                      />
                    </td>
                    <td>
                      {editing === p.id ? (
                        <span className="row" style={{ gap: '0.35rem' }}>
                          <input
                            className="input"
                            style={{ width: '14rem', padding: '0.2rem 0.5rem' }}
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            aria-label="Новое название"
                            data-testid={`edit-input-${p.id}`}
                          />
                          <button
                            type="button"
                            className="btn btn--primary btn--sm"
                            onClick={() => saveEdit(p.id)}
                            data-testid={`save-${p.id}`}
                          >
                            ✓
                          </button>
                        </span>
                      ) : (
                        p.name
                      )}
                    </td>
                    <td>{(p.priceCents / 100).toLocaleString('ru-RU')} ₽</td>
                    <td>{p.stock}</td>
                    <td>{p.rating.toFixed(1)}</td>
                    <td>
                      <span className="row" style={{ gap: '0.3rem' }}>
                        <button
                          type="button"
                          className="btn btn--ghost btn--sm"
                          aria-label={`Редактировать ${p.name}`}
                          onClick={() => {
                            setEditing(p.id)
                            setEditName(p.name)
                          }}
                          data-testid={`edit-${p.id}`}
                        >
                          ✏️
                        </button>
                        <button
                          type="button"
                          className="btn btn--ghost btn--sm"
                          aria-expanded={expanded.has(p.id)}
                          onClick={() => toggleExpand(p.id)}
                          data-testid={`expand-${p.id}`}
                        >
                          {expanded.has(p.id) ? '▲' : '▼'}
                        </button>
                      </span>
                    </td>
                  </tr>
                  {expanded.has(p.id) ? (
                    <tr key={`${p.id}-nested`} data-testid={`nested-${p.id}`}>
                      <td colSpan={6} style={{ background: 'var(--bg-sunken)' }}>
                        <NestedReviews productId={p.id} />
                      </td>
                    </tr>
                  ) : null}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <section style={{ marginTop: '2rem' }} data-testid="category-tree-table">
        <h2>Вложенная таблица: категории → товары</h2>
        <p className="muted">Демо без интерактива — для тренировки локаторов вложенных таблиц.</p>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th scope="col">Категория</th>
                <th scope="col">Топ товары</th>
              </tr>
            </thead>
            <tbody>
              {categories.slice(0, 3).map((c) => (
                <tr key={c.id}>
                  <td>{c.name}</td>
                  <td>
                    <table className="table" data-testid={`nested-table-${c.slug}`}>
                      <tbody>
                        {products
                          .filter((p) => p.categoryId === c.id)
                          .slice(0, 3)
                          .map((p) => (
                            <tr key={p.id}>
                              <td>{p.name}</td>
                              <td>{(p.priceCents / 100).toLocaleString('ru-RU')} ₽</td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}

function NestedReviews({ productId }: { productId: string }) {
  const [reviews, setReviews] = useState<
    { id: string; author: string; rating: number; text: string }[] | null
  >(null)
  useEffect(() => {
    api
      .get<{ id: string; author: string; rating: number; text: string }[]>(
        `/api/products/${productId}/reviews`,
      )
      .then(setReviews)
      .catch(() => setReviews([]))
  }, [productId])
  if (reviews === null) return <p className="muted">Загрузка отзывов…</p>
  if (reviews.length === 0) return <p className="muted">Отзывов нет</p>
  return (
    <table className="table" data-testid={`reviews-${productId}`}>
      <thead>
        <tr>
          <th scope="col">Автор</th>
          <th scope="col">Оценка</th>
          <th scope="col">Текст</th>
        </tr>
      </thead>
      <tbody>
        {reviews.slice(0, 3).map((r) => (
          <tr key={r.id}>
            <td>{r.author}</td>
            <td>{'★'.repeat(r.rating)}</td>
            <td>{r.text}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
