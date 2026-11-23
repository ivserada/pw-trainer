import { useEffect, useRef, useState } from 'react'
import { useToast } from '../../components/ui'

/**
 * 🔴 /practice/hotkeys — Ctrl+K палитра, copy/paste, tab-порядок.
 */
const ACTIONS = [
  { id: 'go-catalog', label: 'Перейти в каталог', hint: 'Ctrl+K → catalog' },
  { id: 'go-cart', label: 'Открыть корзину', hint: 'Ctrl+K → cart' },
  { id: 'go-practice', label: 'Открыть практику', hint: 'Ctrl+K → practice' },
  { id: 'reset-data', label: 'Сбросить данные (демо)', hint: 'Ctrl+K → reset' },
  { id: 'toggle-theme', label: 'Переключить тему (демо)', hint: 'Ctrl+K → theme' },
]

export function HotkeysPage() {
  const toast = useToast()
  const [paletteOpen, setPaletteOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [copied, setCopied] = useState('')
  const [pasted, setPasted] = useState('')
  const [focusLog, setFocusLog] = useState<string[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setPaletteOpen((o) => !o)
        setQuery('')
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  useEffect(() => {
    if (paletteOpen) inputRef.current?.focus()
  }, [paletteOpen])

  useEffect(() => {
    const onFocus = (e: FocusEvent) => {
      const label = (e.target as HTMLElement)?.dataset?.focusName
      if (label) setFocusLog((prev) => [...prev.slice(-4), label])
    }
    document.addEventListener('focusin', onFocus)
    return () => document.removeEventListener('focusin', onFocus)
  }, [])

  const runAction = (id: string, label: string) => {
    setPaletteOpen(false)
    toast('success', `Палитра: ${label}`)
  }

  const filtered = ACTIONS.filter(
    (a) =>
      a.label.toLowerCase().includes(query.toLowerCase()) || a.id.includes(query.toLowerCase()),
  )

  const copyText = async () => {
    const text = 'playwright: keyboard is fun'
    await navigator.clipboard.writeText(text)
    setCopied(text)
  }

  return (
    <div className="page page--narrow">
      <h1>🔴 Горячие клавиши</h1>
      <p className="muted">
        Нажмите <kbd>Ctrl</kbd>+<kbd>K</kbd> (или <kbd>⌘</kbd>+<kbd>K</kbd>) — откроется палитра
        команд.
      </p>

      <section className="card card--pad-lg stack" data-testid="hotkeys-palette-demo">
        <h2>Ctrl+K палитра</h2>
        <button
          type="button"
          className="btn btn--outline"
          onClick={() => setPaletteOpen(true)}
          data-testid="open-palette"
        >
          Открыть палитру (эмуляция Ctrl+K)
        </button>
      </section>

      <section
        className="card card--pad-lg stack"
        style={{ marginTop: '1rem' }}
        data-testid="copypaste-section"
      >
        <h2>Копирование и вставка</h2>
        <div className="row">
          <button
            type="button"
            className="btn btn--outline"
            onClick={() => void copyText()}
            data-testid="copy-button"
          >
            Скопировать строку в буфер
          </button>
          <button
            type="button"
            className="btn btn--outline"
            onClick={async () => {
              try {
                setPasted(await navigator.clipboard.readText())
              } catch {
                setPasted('(доступ к буферу запрещён — выдайте permission)')
              }
            }}
            data-testid="paste-button"
          >
            Вставить из буфера
          </button>
        </div>
        <p className="mono muted" data-testid="copy-state">
          скопировано: {copied || '—'}
        </p>
        <p className="mono muted" data-testid="paste-state">
          вставлено: {pasted || '—'}
        </p>
      </section>

      <section
        className="card card--pad-lg stack"
        style={{ marginTop: '1rem' }}
        data-testid="taborder-section"
      >
        <h2>Tab-порядок</h2>
        <p className="muted" style={{ marginTop: 0 }}>
          Пройдитесь по Tab и смотрите на лог фокуса:
        </p>
        <div className="row">
          <button
            type="button"
            className="btn btn--outline"
            data-focus-name="alpha"
            data-testid="tab-alpha"
          >
            Alpha
          </button>
          <button
            type="button"
            className="btn btn--outline"
            data-focus-name="beta"
            data-testid="tab-beta"
          >
            Beta
          </button>
          <a
            href="#tab-end"
            className="btn btn--outline"
            data-focus-name="gamma"
            data-testid="tab-gamma"
          >
            Gamma (ссылка)
          </a>
          <input
            className="input"
            style={{ width: '9rem' }}
            placeholder="Delta (input)"
            data-focus-name="delta"
            data-testid="tab-delta"
          />
        </div>
        <p className="mono muted" data-testid="focus-log">
          фокус: {focusLog.length ? focusLog.join(' → ') : '—'}
        </p>
        <span id="tab-end" />
      </section>

      {paletteOpen ? (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgb(0 0 0 / 0.45)',
            zIndex: 80,
            display: 'grid',
            placeItems: 'start center',
            paddingTop: '12vh',
          }}
          onClick={() => setPaletteOpen(false)}
          data-testid="palette-overlay"
        >
          <div
            role="dialog"
            aria-label="Палитра команд"
            className="card"
            style={{ width: 'min(92vw, 440px)', padding: '0.6rem' }}
            onClick={(e) => e.stopPropagation()}
            data-testid="command-palette"
          >
            <input
              ref={inputRef}
              className="input"
              placeholder="Введите команду… (Esc — закрыть)"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Escape') setPaletteOpen(false)
                if (e.key === 'Enter' && filtered[0]) runAction(filtered[0].id, filtered[0].label)
              }}
              aria-label="Поиск команды"
              data-testid="palette-input"
            />
            <ul
              role="listbox"
              aria-label="Команды"
              style={{ listStyle: 'none', padding: 0, margin: '0.5rem 0 0' }}
            >
              {filtered.map((a) => (
                <li key={a.id} role="option" aria-selected={false}>
                  <button
                    type="button"
                    className="btn btn--ghost"
                    style={{ width: '100%', justifyContent: 'space-between' }}
                    onClick={() => runAction(a.id, a.label)}
                    data-testid={`palette-${a.id}`}
                  >
                    <span>{a.label}</span>
                    <span className="faint mono" style={{ fontSize: '0.75rem' }}>
                      {a.hint}
                    </span>
                  </button>
                </li>
              ))}
              {filtered.length === 0 ? (
                <li className="muted" style={{ padding: '0.5rem' }} data-testid="palette-empty">
                  Нет такой команды
                </li>
              ) : null}
            </ul>
          </div>
        </div>
      ) : null}
    </div>
  )
}
