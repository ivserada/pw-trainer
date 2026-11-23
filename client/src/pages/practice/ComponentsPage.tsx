import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
} from 'react'
import { api, type Category, type Product } from '../../api/client'
import { useToast } from '../../components/ui'

/**
 * 🔴 /practice/components — кастомные компоненты: select, мультиселект с тегами,
 * дерево, datepicker, contenteditable, аккордеон, tooltip, контекстное меню,
 * double click, long press.
 */
export function ComponentsPage() {
  return (
    <div className="page">
      <h1>🔴 Кастомные компоненты</h1>
      <p className="muted">
        Компоненты, которые нельзя «просто взять» нативными: свои select/мультиселект, дерево,
        datepicker, contenteditable, аккордеон, tooltip, контекстное меню, dblclick и long press.
      </p>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '1rem',
          alignItems: 'start',
        }}
      >
        <CustomSelectDemo />
        <MultiSelectDemo />
        <TreeDemo />
        <DatepickerDemo />
        <ContenteditableDemo />
        <AccordionDemo />
        <TooltipDemo />
        <ContextMenuDemo />
        <DblclickDemo />
        <LongPressDemo />
      </div>
    </div>
  )
}

/* ---------- Кастомный select ---------- */
const CITIES = ['Москва', 'Санкт-Петербург', 'Новосибирск', 'Екатеринбург', 'Казань']

function CustomSelectDemo() {
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState<string | null>(null)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('click', close)
    return () => document.removeEventListener('click', close)
  }, [])

  const onKey = (e: ReactKeyboardEvent) => {
    if (e.key === 'Escape') setOpen(false)
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      setOpen((o) => !o)
    }
  }

  return (
    <section className="card card--pad-lg" data-testid="custom-select-section">
      <h2>Кастомный select</h2>
      <div ref={ref} style={{ position: 'relative' }}>
        <button
          type="button"
          className="btn btn--outline"
          aria-haspopup="listbox"
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
          onKeyDown={onKey}
          data-testid="cs-trigger"
        >
          {value ?? 'Выберите город'} ▾
        </button>
        {open ? (
          <ul
            role="listbox"
            aria-label="Города"
            className="card"
            style={{
              position: 'absolute',
              zIndex: 20,
              listStyle: 'none',
              padding: '0.35rem',
              margin: '0.35rem 0 0',
              minWidth: '220px',
            }}
            data-testid="cs-listbox"
          >
            {CITIES.map((c) => (
              <li key={c} role="option" aria-selected={value === c}>
                <button
                  type="button"
                  className="btn btn--ghost"
                  style={{ width: '100%', justifyContent: 'flex-start' }}
                  onClick={() => {
                    setValue(c)
                    setOpen(false)
                  }}
                  data-testid={`cs-option-${c}`}
                >
                  {c}
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
      <p className="muted mono" data-testid="cs-value">
        value: {value ?? 'null'}
      </p>
    </section>
  )
}

/* ---------- Мультиселект с тегами ---------- */
const TAG_OPTIONS = ['playwright', 'typescript', 'ci', 'docker', 'api', 'a11y']

function MultiSelectDemo() {
  const [tags, setTags] = useState<string[]>(['playwright'])

  const toggle = (t: string) =>
    setTags((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]))

  return (
    <section className="card card--pad-lg" data-testid="multiselect-section">
      <h2>Мультиселект с тегами</h2>
      <div className="row" role="group" aria-label="Теги навыков">
        {TAG_OPTIONS.map((t) => (
          <button
            key={t}
            type="button"
            className={`btn btn--sm ${tags.includes(t) ? 'btn--primary' : 'btn--outline'}`}
            aria-pressed={tags.includes(t)}
            onClick={() => toggle(t)}
            data-testid={`tag-${t}`}
          >
            {t}
          </button>
        ))}
      </div>
      <div
        className="row"
        style={{ marginTop: '0.75rem' }}
        aria-live="polite"
        data-testid="tag-chips"
      >
        {tags.length === 0 ? (
          <span className="muted">Тегов нет</span>
        ) : (
          tags.map((t) => (
            <span key={t} className="badge" style={{ gap: '0.4rem' }}>
              {t}
              <button
                type="button"
                aria-label={`Убрать тег ${t}`}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'inherit',
                  padding: 0,
                }}
                onClick={() => toggle(t)}
                data-testid={`remove-tag-${t}`}
              >
                ✕
              </button>
            </span>
          ))
        )}
      </div>
    </section>
  )
}

/* ---------- Дерево ---------- */
function TreeDemo() {
  const [data, setData] = useState<{
    categories: Category[]
    byCat: Record<string, Product[]>
  } | null>(null)
  const [open, setOpen] = useState<Set<string>>(new Set())

  useEffect(() => {
    Promise.all([
      api.get<Category[]>('/api/categories'),
      api.get<{ items: Product[] }>('/api/products?pageSize=100'),
    ]).then(([categories, products]) => {
      const byCat: Record<string, Product[]> = {}
      for (const c of categories)
        byCat[c.id] = products.items.filter((p) => p.categoryId === c.id).slice(0, 4)
      setData({ categories, byCat })
    })
  }, [])

  const toggle = (id: string) =>
    setOpen((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  return (
    <section className="card card--pad-lg" data-testid="tree-section">
      <h2>Дерево</h2>
      {!data ? (
        <p className="muted">Загрузка…</p>
      ) : (
        <ul role="tree" aria-label="Категории и товары" style={{ listStyle: 'none', padding: 0 }}>
          {data.categories.map((c) => (
            <li
              key={c.id}
              role="treeitem"
              aria-expanded={open.has(c.id)}
              style={{ padding: '0.15rem 0' }}
            >
              <button
                type="button"
                className="btn btn--ghost btn--sm"
                onClick={() => toggle(c.id)}
                data-testid={`tree-${c.slug}`}
              >
                {open.has(c.id) ? '▾' : '▸'} {c.name}
              </button>
              {open.has(c.id) ? (
                <ul role="group" style={{ listStyle: 'none', paddingLeft: '1.5rem' }}>
                  {data.byCat[c.id].map((p) => (
                    <li key={p.id} role="treeitem" style={{ padding: '0.1rem 0' }}>
                      {p.name}
                    </li>
                  ))}
                </ul>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

/* ---------- Datepicker ---------- */
function DatepickerDemo() {
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState<string | null>(null)
  // Детерминированный месяц: декабрь 2026. 1 декабря 2026 — вторник.
  const days = Array.from({ length: 31 }, (_, i) => i + 1)
  const offset = 2

  return (
    <section className="card card--pad-lg" data-testid="datepicker-section">
      <h2>Datepicker</h2>
      <div style={{ position: 'relative', display: 'inline-block' }}>
        <button
          type="button"
          className="btn btn--outline"
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
          data-testid="dp-trigger"
        >
          📅 {selected ?? 'Выберите дату'}
        </button>
        {open ? (
          <div
            role="dialog"
            aria-label="Календарь декабрь 2026"
            className="card"
            style={{ position: 'absolute', zIndex: 20, marginTop: '0.35rem', width: '260px' }}
            data-testid="dp-calendar"
          >
            <p style={{ margin: '0 0 0.4rem', textAlign: 'center', fontWeight: 700 }}>
              Декабрь 2026
            </p>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(7, 1fr)',
                gap: 2,
                textAlign: 'center',
                fontSize: '0.75rem',
                color: 'var(--text-muted)',
              }}
            >
              {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map((d) => (
                <span key={d}>{d}</span>
              ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2 }}>
              {Array.from({ length: offset }).map((_, i) => (
                <span key={i} />
              ))}
              {days.map((d) => (
                <button
                  key={d}
                  type="button"
                  className="btn btn--ghost btn--sm"
                  style={{ padding: '0.15rem' }}
                  onClick={() => {
                    setSelected(`2026-12-${String(d).padStart(2, '0')}`)
                    setOpen(false)
                  }}
                  data-testid={`dp-day-${d}`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>
        ) : null}
      </div>
      <p className="muted mono" data-testid="dp-value">
        selected: {selected ?? 'null'}
      </p>
    </section>
  )
}

/* ---------- Contenteditable ---------- */
function ContenteditableDemo() {
  const toast = useToast()
  const ref = useRef<HTMLDivElement>(null)

  return (
    <section className="card card--pad-lg" data-testid="contenteditable-section">
      <h2>Contenteditable</h2>
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        role="textbox"
        aria-multiline="true"
        aria-label="Редактируемый блок"
        className="card"
        style={{ minHeight: '72px', outline: 'none' }}
        data-testid="editable-block"
      >
        Редактируйте этот текст прямо здесь.
      </div>
      <div className="row" style={{ marginTop: '0.5rem' }}>
        <button
          type="button"
          className="btn btn--outline btn--sm"
          onClick={() => {
            document.execCommand('bold')
            ref.current?.focus()
          }}
          data-testid="ce-bold"
        >
          Жирный
        </button>
        <button
          type="button"
          className="btn btn--primary btn--sm"
          onClick={() => {
            toast('info', `Сохранено: ${ref.current?.textContent?.slice(0, 60) ?? ''}`)
          }}
          data-testid="ce-save"
        >
          Сохранить
        </button>
      </div>
    </section>
  )
}

/* ---------- Аккордеон ---------- */
function AccordionDemo() {
  const [open, setOpen] = useState<string | null>('a1')
  const items = [
    {
      id: 'a1',
      title: 'Что такое Playwright?',
      body: 'Фреймворк end-to-end тестирования от Microsoft.',
    },
    {
      id: 'a2',
      title: 'Зачем этот тренажёр?',
      body: 'Чтобы отточить локаторы, сеть и ожидания на детерминированных данных.',
    },
    { id: 'a3', title: 'Что дальше?', body: 'Chaos-режим, CI, скриншот-тесты.' },
  ]
  return (
    <section className="card card--pad-lg" data-testid="accordion-section">
      <h2>Аккордеон</h2>
      {items.map((item) => (
        <div key={item.id} style={{ borderBottom: '1px solid var(--border)' }}>
          <button
            type="button"
            className="btn btn--ghost"
            aria-expanded={open === item.id}
            aria-controls={`acc-panel-${item.id}`}
            style={{ width: '100%', justifyContent: 'space-between', padding: '0.6rem 0.2rem' }}
            onClick={() => setOpen(open === item.id ? null : item.id)}
            data-testid={`acc-${item.id}`}
          >
            <span>{item.title}</span>
            <span aria-hidden>{open === item.id ? '−' : '+'}</span>
          </button>
          {open === item.id ? (
            <p
              id={`acc-panel-${item.id}`}
              role="region"
              style={{ margin: '0 0 0.6rem', padding: '0 0.2rem' }}
              data-testid={`acc-panel-${item.id}`}
            >
              {item.body}
            </p>
          ) : null}
        </div>
      ))}
    </section>
  )
}

/* ---------- Tooltip ---------- */
function TooltipDemo() {
  return (
    <section className="card card--pad-lg" data-testid="tooltip-section">
      <h2>Tooltip</h2>
      <p className="muted" style={{ marginTop: 0 }}>
        Наведите курсор или сфокусируйтесь:
      </p>
      <div className="row">
        <span style={{ position: 'relative', display: 'inline-block' }} className="tooltip-host">
          <button
            type="button"
            className="btn btn--outline"
            aria-describedby="tip-save"
            data-testid="tooltip-target"
          >
            💾 Кнопка с подсказкой
          </button>
          <span
            id="tip-save"
            role="tooltip"
            style={{
              position: 'absolute',
              bottom: 'calc(100% + 6px)',
              left: 0,
              background: 'var(--text)',
              color: 'var(--bg)',
              padding: '0.25rem 0.6rem',
              borderRadius: 6,
              fontSize: '0.78rem',
              whiteSpace: 'nowrap',
            }}
            data-testid="tooltip-body"
          >
            Подсказка: данные сохранятся локально
          </span>
        </span>
      </div>
    </section>
  )
}

/* ---------- Контекстное меню ---------- */
function ContextMenuDemo() {
  const [menu, setMenu] = useState<{ x: number; y: number } | null>(null)
  const [action, setAction] = useState<string | null>(null)

  const onContext = (e: ReactMouseEvent) => {
    e.preventDefault()
    setMenu({ x: e.clientX, y: e.clientY })
  }

  useEffect(() => {
    const close = () => setMenu(null)
    document.addEventListener('click', close)
    return () => document.removeEventListener('click', close)
  }, [])

  const run = (a: string) => () => {
    setAction(a)
    setMenu(null)
  }

  return (
    <section className="card card--pad-lg" data-testid="contextmenu-section">
      <h2>Контекстное меню</h2>
      <div
        onContextMenu={onContext}
        style={{
          border: '2px dashed var(--border-strong)',
          borderRadius: 8,
          padding: '1.5rem',
          textAlign: 'center',
          color: 'var(--text-muted)',
        }}
        data-testid="context-zone"
      >
        Правый клик по этой зоне
      </div>
      <p aria-live="polite" className="muted mono" data-testid="context-action">
        действие: {action ?? '—'}
      </p>
      {menu ? (
        <ul
          role="menu"
          aria-label="Контекстное меню"
          className="card"
          style={{
            position: 'fixed',
            left: menu.x,
            top: menu.y,
            zIndex: 70,
            listStyle: 'none',
            padding: '0.35rem',
            margin: 0,
            minWidth: '180px',
          }}
          data-testid="context-menu"
        >
          {[
            ['copy', 'Копировать'],
            ['paste', 'Вставить'],
            ['delete', 'Удалить'],
          ].map(([id, label]) => (
            <li key={id} role="none">
              <button
                type="button"
                role="menuitem"
                className="btn btn--ghost"
                style={{ width: '100%', justifyContent: 'flex-start' }}
                onClick={run(id)}
                data-testid={`ctx-${id}`}
              >
                {label}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  )
}

/* ---------- Double click ---------- */
function DblclickDemo() {
  const [count, setCount] = useState(0)
  const [mode, setMode] = useState<'off' | 'on'>('off')
  return (
    <section className="card card--pad-lg" data-testid="dblclick-section">
      <h2>Double click</h2>
      <button
        type="button"
        className={`btn ${mode === 'on' ? 'btn--primary' : 'btn--outline'}`}
        onDoubleClick={() => {
          setMode((m) => (m === 'on' ? 'off' : 'on'))
          setCount((c) => c + 1)
        }}
        data-testid="dbl-target"
      >
        Двойной клик по мне (режим: {mode})
      </button>
      <p className="muted mono" data-testid="dbl-count">
        переключений: {count}
      </p>
    </section>
  )
}

/* ---------- Long press ---------- */
function LongPressDemo() {
  const [progress, setProgress] = useState(0)
  const [done, setDone] = useState(0)
  const timer = useRef<ReturnType<typeof setInterval> | null>(null)

  const start = () => {
    setProgress(0)
    timer.current = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          if (timer.current) clearInterval(timer.current)
          setDone((d) => d + 1)
          return 100
        }
        return p + 10
      })
    }, 50)
  }
  const stop = () => {
    if (timer.current) clearInterval(timer.current)
    setProgress(0)
  }

  return (
    <section className="card card--pad-lg" data-testid="longpress-section">
      <h2>Long press (500 мс)</h2>
      <button
        type="button"
        className="btn btn--outline"
        style={{ minWidth: '200px' }}
        onPointerDown={start}
        onPointerUp={stop}
        onPointerLeave={stop}
        data-testid="lp-target"
      >
        {progress > 0 ? `… ${progress}%` : 'Зажмите меня'}
      </button>
      <p className="muted mono" data-testid="lp-count">
        выполнено long press: {done}
      </p>
    </section>
  )
}
