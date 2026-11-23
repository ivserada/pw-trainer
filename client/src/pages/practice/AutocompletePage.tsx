import { useEffect, useRef, useState } from 'react'
import { api, type Product } from '../../api/client'

/**
 * 🟡 /practice/autocomplete — поиск с debounce 300 мс и выпадающим списком.
 */
export function AutocompletePage() {
  const [query, setQuery] = useState('')
  const [items, setItems] = useState<Product[]>([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [selected, setSelected] = useState<Product | null>(null)
  const boxRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const q = query.trim()
    if (q.length < 2) {
      setItems([])
      setOpen(false)
      setLoading(false)
      return
    }
    setLoading(true)
    const timer = setTimeout(() => {
      api
        .get<{ items: Product[] }>(`/api/products?q=${encodeURIComponent(q)}&pageSize=6`)
        .then((data) => {
          setItems(data.items)
          setOpen(true)
          setLoading(false)
        })
        .catch(() => setLoading(false))
    }, 300)
    return () => clearTimeout(timer)
  }, [query])

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!boxRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('click', onClick)
    return () => document.removeEventListener('click', onClick)
  }, [])

  return (
    <div className="page page--narrow">
      <h1>🟡 Автокомплит поиска</h1>
      <p className="muted">
        Запросы к <code>/api/products?q=</code> уходят с debounce 300 мс. Введите минимум 2 символа,
        например «науш» или «лампа».
      </p>

      <div ref={boxRef} style={{ position: 'relative' }} data-testid="autocomplete">
        <div className="field">
          <label htmlFor="ac-input">Поиск товара</label>
          <input
            id="ac-input"
            type="search"
            className="input"
            role="combobox"
            aria-expanded={open}
            aria-controls="ac-listbox"
            aria-autocomplete="list"
            placeholder="Начните вводить название…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => items.length > 0 && setOpen(true)}
            data-testid="ac-input"
          />
        </div>

        {loading ? (
          <p className="muted" role="status" data-testid="ac-loading">
            Ищем…
          </p>
        ) : null}

        {open ? (
          <ul
            id="ac-listbox"
            role="listbox"
            aria-label="Подсказки поиска"
            className="card"
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              zIndex: 30,
              margin: '-0.5rem 0 0',
              padding: '0.4rem',
              listStyle: 'none',
              maxHeight: '280px',
              overflowY: 'auto',
            }}
            data-testid="ac-listbox"
          >
            {items.length === 0 ? (
              <li className="muted" style={{ padding: '0.5rem' }} data-testid="ac-empty">
                Ничего не найдено
              </li>
            ) : (
              items.map((p, i) => (
                <li key={p.id} role="option" aria-selected={selected?.id === p.id}>
                  <button
                    type="button"
                    className="btn btn--ghost"
                    style={{ width: '100%', justifyContent: 'flex-start' }}
                    onClick={() => {
                      setSelected(p)
                      setQuery(p.name)
                      setOpen(false)
                    }}
                    data-testid={`ac-option-${i}`}
                  >
                    {p.name} — {(p.priceCents / 100).toLocaleString('ru-RU')} ₽
                  </button>
                </li>
              ))
            )}
          </ul>
        ) : null}
      </div>

      {selected ? (
        <div
          className="card card--pad-lg"
          role="status"
          style={{ marginTop: '1rem' }}
          data-testid="ac-selected"
        >
          <h2>Выбрано</h2>
          <p>
            <strong>{selected.name}</strong>
          </p>
          <p className="muted mono">id: {selected.id}</p>
        </div>
      ) : null}
    </div>
  )
}
