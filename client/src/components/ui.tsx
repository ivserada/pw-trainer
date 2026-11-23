import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { useChaos } from '../contexts/ChaosContext'

/* ---------- Toast ---------- */

type ToastKind = 'info' | 'success' | 'error'
interface ToastItem {
  id: number
  kind: ToastKind
  text: string
}

const ToastContext = createContext<(kind: ToastKind, text: string) => void>(() => {})

export function useToast(): (kind: ToastKind, text: string) => void {
  return useContext(ToastContext)
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([])
  const seq = useRef(0)

  const push = useCallback((kind: ToastKind, text: string) => {
    seq.current += 1
    const id = seq.current
    setItems((prev) => [...prev.slice(-3), { id, kind, text }])
    setTimeout(() => setItems((prev) => prev.filter((t) => t.id !== id)), 4000)
  }, [])

  return (
    <ToastContext.Provider value={push}>
      {children}
      <div className="toast-region" role="region" aria-label="Уведомления">
        {items.map((t) => (
          <div
            key={t.id}
            className={`toast${t.kind === 'success' ? ' toast--success' : ''}${
              t.kind === 'error' ? ' toast--error' : ''
            }`}
            role="status"
          >
            {t.text}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

/* ---------- Theme ---------- */

type Theme = 'light' | 'dark'

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('theme')
    if (saved === 'light' || saved === 'dark') return saved
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  })
  useEffect(() => {
    document.documentElement.dataset.theme = theme
    localStorage.setItem('theme', theme)
  }, [theme])
  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>
}

const ThemeContext = createContext<{ theme: Theme; setTheme: (t: Theme) => void }>({
  theme: 'light',
  setTheme: () => {},
})

export function useTheme() {
  return useContext(ThemeContext)
}

/* ---------- Мелкие компоненты ---------- */

export function Spinner({ label }: { label?: string }) {
  return (
    <span role="status" className="muted" style={{ display: 'inline-flex', gap: '0.5rem' }}>
      <span
        aria-hidden
        style={{ display: 'inline-block', animation: 'shimmer 1s linear infinite' }}
      >
        ⏳
      </span>
      {label}
    </span>
  )
}

export function Price({ cents, className }: { cents: number; className?: string }) {
  const formatted = new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0,
  }).format(cents / 100)
  return (
    <span className={className} data-price-cents={cents}>
      {formatted}
    </span>
  )
}

/** Детерминированный SVG-плейсхолдер товара — офлайн, без картинок. */
export function ProductImage({
  hue,
  name,
  size = 160,
}: {
  hue: number
  name: string
  size?: number
}) {
  const chaos = useChaos()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (!chaos?.slowImages) {
      setReady(true)
      return
    }
    setReady(false)
    const t = setTimeout(() => setReady(true), 900)
    return () => clearTimeout(t)
  }, [chaos?.slowImages])

  if (!ready) {
    return (
      <div
        className="skeleton"
        data-testid="image-skeleton"
        style={{ width: '100%', aspectRatio: '1 / 1', borderRadius: 'var(--radius-sm)' }}
      />
    )
  }

  const initial = name.trim().charAt(0).toUpperCase() || '?'
  const bg = `hsl(${hue} 45% 88%)`
  const fg = `hsl(${hue} 55% 32%)`
  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      role="img"
      aria-label={name}
      {...({ alt: name } as object)}
      data-testid="product-image"
      style={{ display: 'block', width: '100%', height: 'auto', background: bg }}
    >
      <rect width="100" height="100" fill={bg} />
      <circle cx="50" cy="46" r="24" fill="none" stroke={fg} strokeWidth="2.5" opacity="0.55" />
      <text
        x="50"
        y="56"
        textAnchor="middle"
        fontFamily="ui-monospace, Menlo, monospace"
        fontSize="30"
        fontWeight="700"
        fill={fg}
      >
        {initial}
      </text>
      <rect x="8" y="8" width="20" height="4" rx="2" fill={fg} opacity="0.35" />
    </svg>
  )
}

export function Stars({ rating }: { rating: number }) {
  return (
    <span title={`Рейтинг ${rating} из 5`} aria-label={`Рейтинг ${rating} из 5`}>
      {'★'.repeat(Math.round(rating))}
      <span style={{ opacity: 0.35 }}>{'★'.repeat(5 - Math.round(rating))}</span>{' '}
      <span className="muted mono">{rating.toFixed(1)}</span>
    </span>
  )
}
