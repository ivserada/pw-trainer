import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import { Navigate } from 'react-router-dom'
import { ApiError, api, type User } from '../api/client'
import { useAuth } from '../contexts/AuthContext'
import { Spinner, useToast } from '../components/ui'

/**
 * 🔴 /admin — панель управления: статистика, CRUD товаров и виртуальная таблица
 * на 10 000 строк (10 064 точнее: 64 реальных + 10 000 синтетических).
 * Синтетические строки редактируются локально, реальные — через API.
 */

interface Stats {
  products: number
  users: number
  orders: number
  reviews: number
  revenueCents: number
  lowStock: number
  outOfStock: number
}

interface Row {
  id: string
  name: string
  priceCents: number
  stock: number
  synthetic: boolean
}

const ROW_HEIGHT = 37
const OVERSCAN = 6
const TOTAL_SYNTHETIC = 10_000

function buildSyntheticRows(): Row[] {
  const rows: Row[] = []
  const adjectives = ['Быстрый', 'Надёжный', 'Умный', 'Лёгкий', 'Компактный', 'Новый']
  const nouns = ['виджет', 'гаджет', 'аксессуар', 'модуль', 'набор', 'комплект']
  for (let i = 0; i < TOTAL_SYNTHETIC; i++) {
    rows.push({
      id: `v${i}`,
      name: `${adjectives[i % adjectives.length]} ${nouns[(i * 7) % nouns.length]} #${i}`,
      priceCents: 500 + ((i * 137) % 90_000),
      stock: (i * 31) % 200,
      synthetic: true,
    })
  }
  return rows
}

export function AdminPage() {
  const { user, loading } = useAuth()
  const toast = useToast()
  const [stats, setStats] = useState<Stats | null>(null)
  const [users, setUsers] = useState<User[] | null>(null)
  const [rows, setRows] = useState<Row[]>([])
  const [query, setQuery] = useState('')
  const [sortAsc, setSortAsc] = useState(true)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const [scrollTop, setScrollTop] = useState(0)

  const canManage = user?.role === 'admin' || user?.role === 'manager'

  const reload = async () => {
    const [statsRes, usersRes] = await Promise.all([
      api.get<Stats>('/api/admin/stats'),
      user?.role === 'admin'
        ? api.get<User[]>('/api/admin/users').catch(() => [])
        : Promise.resolve([]),
    ])
    setStats(statsRes)
    setUsers(usersRes)
  }

  useEffect(() => {
    if (!canManage) return
    void reload().catch(() => toast('error', 'Нет доступа к админке'))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canManage])

  useEffect(() => {
    api
      .get<{ items: { id: string; name: string; priceCents: number; stock: number }[] }>(
        '/api/products?pageSize=100',
      )
      .then((d) => {
        const real: Row[] = d.items.map((p) => ({ ...p, synthetic: false }))
        setRows([...real, ...buildSyntheticRows()])
      })
  }, [])

  const filtered = useMemo(() => {
    let list = rows
    if (query.trim()) {
      const needle = query.toLowerCase()
      list = list.filter((r) => r.name.toLowerCase().includes(needle) || r.id.includes(needle))
    }
    return list
      .slice()
      .sort((a, b) => (sortAsc ? a.priceCents - b.priceCents : b.priceCents - a.priceCents))
  }, [rows, query, sortAsc])

  const visibleRange = useMemo(() => {
    const start = Math.max(0, Math.floor(scrollTop / ROW_HEIGHT) - OVERSCAN)
    const count = Math.ceil((560 + OVERSCAN * ROW_HEIGHT * 2) / ROW_HEIGHT)
    const end = Math.min(filtered.length, start + count)
    return { start, end }
  }, [scrollTop, filtered.length])

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const onScroll = () => setScrollTop(el.scrollTop)
    el.addEventListener('scroll', onScroll)
    return () => el.removeEventListener('scroll', onScroll)
  }, [])

  if (loading) {
    return (
      <div className="page">
        <Spinner />
      </div>
    )
  }
  if (!canManage) {
    return <Navigate to="/login" replace />
  }

  const selected = rows.find((r) => r.id === selectedId) ?? null

  const createProduct = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    try {
      const created = await api.post<{
        id: string
        name: string
        priceCents: number
        stock: number
      }>('/api/admin/products', {
        name: String(fd.get('name')),
        categoryId: 'c-electronics',
        priceCents: Math.round(Number(fd.get('price')) * 100),
        stock: Number(fd.get('stock')),
      })
      setRows((prev) => [{ ...created, synthetic: false }, ...prev])
      toast('success', `Создан товар ${created.id}`)
      e.currentTarget.reset()
      void reload()
    } catch (err) {
      toast('error', err instanceof ApiError ? (err.data.message as string) : 'Ошибка создания')
    }
  }

  const patchSelected = async (patch: { priceCents?: number; stock?: number }) => {
    if (!selected) return
    if (selected.synthetic) {
      setRows((prev) => prev.map((r) => (r.id === selected.id ? { ...r, ...patch } : r)))
      return
    }
    try {
      const updated = await api.patch<{ priceCents: number; stock: number }>(
        `/api/admin/products/${selected.id}`,
        patch,
      )
      setRows((prev) => prev.map((r) => (r.id === selected.id ? { ...r, ...updated } : r)))
      toast('success', 'Сохранено через API')
    } catch (err) {
      toast('error', err instanceof ApiError ? (err.data.message as string) : 'Ошибка сохранения')
    }
  }

  const deleteSelected = async () => {
    if (!selected) return
    if (selected.synthetic) {
      setRows((prev) => prev.filter((r) => r.id !== selected.id))
      setSelectedId(null)
      return
    }
    try {
      await api.del(`/api/admin/products/${selected.id}`)
      setRows((prev) => prev.filter((r) => r.id !== selected.id))
      setSelectedId(null)
      toast('success', 'Товар удалён')
      void reload()
    } catch (err) {
      toast('error', err instanceof ApiError ? (err.data.message as string) : 'Ошибка удаления')
    }
  }

  return (
    <div className="page">
      <h1>Админка</h1>
      <p className="muted">
        Роль: <span className="badge">{user!.role}</span>. Виртуальная таблица:{' '}
        {rows.length.toLocaleString('ru-RU')} строк (первые 64 — реальные товары, дальше синтетика
        для нагрузки).
      </p>

      <section className="row" style={{ alignItems: 'stretch' }} data-testid="admin-stats">
        {stats ? (
          <>
            {(
              [
                ['Товары', stats.products],
                ['Пользователи', stats.users],
                ['Заказы', stats.orders],
                ['Выручка, ₽', Math.round(stats.revenueCents / 100)],
                ['Мало остатков', stats.lowStock],
                ['Out of stock', stats.outOfStock],
              ] as const
            ).map(([label, value]) => (
              <div key={label} className="card" style={{ minWidth: '130px', flex: 1 }}>
                <p className="muted" style={{ margin: 0, fontSize: '0.8rem' }}>
                  {label}
                </p>
                <p
                  style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800 }}
                  data-testid={`stat-${label}`}
                >
                  {value.toLocaleString('ru-RU')}
                </p>
              </div>
            ))}
          </>
        ) : (
          <Spinner />
        )}
      </section>

      {users && users.length > 0 ? (
        <section
          className="card card--pad-lg"
          style={{ marginTop: '1rem' }}
          data-testid="admin-users"
        >
          <h2>Пользователи</h2>
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th scope="col">Имя</th>
                  <th scope="col">Email</th>
                  <th scope="col">Роль</th>
                  <th scope="col">2FA</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td>{u.name}</td>
                    <td className="mono">{u.email}</td>
                    <td>
                      <span className="badge">{u.role}</span>
                    </td>
                    <td>{u.otpEnabled ? '✅' : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      <section className="card card--pad-lg" style={{ marginTop: '1rem' }} data-testid="admin-crud">
        <h2>CRUD товаров</h2>
        <form
          className="row"
          style={{ alignItems: 'flex-end' }}
          onSubmit={(e) => void createProduct(e)}
          data-testid="create-product-form"
        >
          <div className="field" style={{ margin: 0 }}>
            <label htmlFor="np-name">Название</label>
            <input
              id="np-name"
              name="name"
              className="input"
              required
              minLength={2}
              data-testid="np-name"
            />
          </div>
          <div className="field" style={{ margin: 0 }}>
            <label htmlFor="np-price">Цена, ₽</label>
            <input
              id="np-price"
              name="price"
              type="number"
              step="0.01"
              min="0.01"
              className="input"
              required
              data-testid="np-price"
            />
          </div>
          <div className="field" style={{ margin: 0 }}>
            <label htmlFor="np-stock">Остаток</label>
            <input
              id="np-stock"
              name="stock"
              type="number"
              min="0"
              className="input"
              required
              data-testid="np-stock"
            />
          </div>
          <button type="submit" className="btn btn--primary" data-testid="np-create">
            Создать
          </button>
        </form>

        {selected ? (
          <div
            className="row"
            style={{ marginTop: '0.75rem', alignItems: 'flex-end' }}
            data-testid="edit-selected"
          >
            <span>
              Выбран: <code data-testid="selected-id">{selected.id}</code>
              {selected.synthetic ? <span className="badge badge--warning">синтетика</span> : null}
            </span>
            <div className="field" style={{ margin: 0 }}>
              <label htmlFor="sel-price">Цена, ₽</label>
              <input
                id="sel-price"
                type="number"
                className="input"
                style={{ width: '7rem' }}
                defaultValue={(selected.priceCents / 100).toFixed(2)}
                onBlur={(e) =>
                  void patchSelected({ priceCents: Math.round(Number(e.target.value) * 100) })
                }
                data-testid="sel-price"
              />
            </div>
            <div className="field" style={{ margin: 0 }}>
              <label htmlFor="sel-stock">Остаток</label>
              <input
                id="sel-stock"
                type="number"
                className="input"
                style={{ width: '6rem' }}
                defaultValue={selected.stock}
                onBlur={(e) => void patchSelected({ stock: Number(e.target.value) })}
                data-testid="sel-stock"
              />
            </div>
            <button
              type="button"
              className="btn btn--danger btn--sm"
              onClick={() => void deleteSelected()}
              data-testid="sel-delete"
            >
              Удалить
            </button>
          </div>
        ) : null}
      </section>

      <section style={{ marginTop: '1rem' }} data-testid="virtual-table-section">
        <div className="row" style={{ justifyContent: 'space-between', marginBottom: '0.5rem' }}>
          <h2 style={{ margin: 0 }}>Виртуальная таблица</h2>
          <div className="row">
            <input
              className="input"
              style={{ width: '220px' }}
              placeholder="Фильтр по названию/id…"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value)
                scrollRef.current?.scrollTo({ top: 0 })
              }}
              aria-label="Фильтр таблицы"
              data-testid="vt-filter"
            />
            <button
              type="button"
              className="btn btn--outline btn--sm"
              onClick={() => setSortAsc((s) => !s)}
              data-testid="vt-sort"
            >
              Цена {sortAsc ? '↑' : '↓'}
            </button>
          </div>
        </div>
        <div className="table-wrap">
          <table className="table" style={{ tableLayout: 'fixed' }}>
            <thead>
              <tr>
                <th scope="col" style={{ width: '90px' }}>
                  id
                </th>
                <th scope="col">Название</th>
                <th scope="col" style={{ width: '120px' }}>
                  Цена, ₽
                </th>
                <th scope="col" style={{ width: '90px' }}>
                  Остаток
                </th>
              </tr>
            </thead>
          </table>
          <div
            ref={scrollRef}
            style={{ height: '560px', overflowY: 'auto' }}
            data-testid="vt-scroll"
          >
            <div style={{ height: filtered.length * ROW_HEIGHT, position: 'relative' }}>
              <table
                className="table"
                style={{
                  tableLayout: 'fixed',
                  position: 'absolute',
                  top: visibleRange.start * ROW_HEIGHT,
                  left: 0,
                  right: 0,
                }}
              >
                <tbody>
                  {filtered.slice(visibleRange.start, visibleRange.end).map((r) => (
                    <tr
                      key={r.id}
                      aria-selected={selectedId === r.id}
                      style={{ height: ROW_HEIGHT, cursor: 'pointer' }}
                      onClick={() => setSelectedId(r.id)}
                      data-testid={`vt-row-${r.id}`}
                    >
                      <td style={{ width: '90px' }} className="mono">
                        {r.id}
                      </td>
                      <td>
                        {r.name}
                        {r.synthetic ? '' : ' ★'}
                      </td>
                      <td style={{ width: '120px' }}>{(r.priceCents / 100).toFixed(2)}</td>
                      <td style={{ width: '90px' }}>{r.stock}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <p
            className="muted mono"
            style={{ padding: '0.4rem 0.8rem', margin: 0 }}
            data-testid="vt-info"
          >
            строк: {filtered.length.toLocaleString('ru-RU')} · видно {visibleRange.start + 1}–
            {visibleRange.end}
          </p>
        </div>
      </section>
    </div>
  )
}
