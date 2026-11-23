import { useEffect, useState } from 'react'
import { useTheme } from '../../components/ui'

/**
 * 🔴 /practice/device — геолокация, permissions, тема, reduced-motion, размеры.
 */
export function DevicePage() {
  const { theme, setTheme } = useTheme()
  const [geo, setGeo] = useState<string>('не запрашивалась')
  const [permissions, setPermissions] = useState<{ name: string; state: string }[]>([])
  const [viewport, setViewport] = useState({ width: 0, height: 0 })
  const [online, setOnline] = useState(navigator.onLine)
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  useEffect(() => {
    const update = () => setViewport({ width: window.innerWidth, height: window.innerHeight })
    update()
    window.addEventListener('resize', update)
    const onOnline = () => setOnline(true)
    const onOffline = () => setOnline(false)
    window.addEventListener('online', onOnline)
    window.addEventListener('offline', onOffline)
    return () => {
      window.removeEventListener('resize', update)
      window.removeEventListener('online', onOnline)
      window.removeEventListener('offline', onOffline)
    }
  }, [])

  const requestGeo = () => {
    setGeo('запрос…')
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        setGeo(
          `широта ${pos.coords.latitude.toFixed(5)}, долгота ${pos.coords.longitude.toFixed(5)}`,
        ),
      (err) => setGeo(`ошибка: ${err.message}`),
      { timeout: 5000 },
    )
  }

  const queryPermissions = async () => {
    const names = ['geolocation', 'notifications', 'clipboard-read', 'persistent-storage'] as const
    const results = await Promise.all(
      names.map(async (name) => {
        try {
          const status = await navigator.permissions.query({ name: name as PermissionName })
          return { name, state: status.state }
        } catch {
          return { name, state: 'unsupported' }
        }
      }),
    )
    setPermissions(results)
  }

  const breakpoint =
    viewport.width < 768
      ? 'mobile (<768)'
      : viewport.width < 1280
        ? 'tablet (<1280)'
        : 'desktop (≥1280)'

  return (
    <div className="page page--narrow">
      <h1>🔴 Устройство и окружение</h1>
      <p className="muted">
        Геолокация, permissions API, тема, reduced-motion и параметры вьюпорта. В Playwright всё это
        эмулируется через context options.
      </p>

      <div className="card card--pad-lg stack" data-testid="device-info">
        <h2>Окружение</h2>
        <p style={{ margin: 0 }}>
          Тема:{' '}
          <button
            type="button"
            className="btn btn--outline btn--sm"
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            data-testid="device-theme-toggle"
          >
            {theme === 'light' ? '☀️ light' : '🌙 dark'} (переключить)
          </button>
        </p>
        <p style={{ margin: 0 }}>
          Вьюпорт:{' '}
          <strong className="mono" data-testid="viewport-size">
            {viewport.width}×{viewport.height}
          </strong>{' '}
          → <span data-testid="breakpoint">{breakpoint}</span>
        </p>
        <p style={{ margin: 0 }}>
          Reduced motion: <strong data-testid="reduced-motion">{reduced ? 'да' : 'нет'}</strong>
        </p>
        <p style={{ margin: 0 }}>
          Сеть: <strong data-testid="online-status">{online ? 'online' : 'offline'}</strong>
        </p>
      </div>

      <div
        className="card card--pad-lg stack"
        style={{ marginTop: '1rem' }}
        data-testid="geo-section"
      >
        <h2>Геолокация</h2>
        <button
          type="button"
          className="btn btn--primary"
          onClick={requestGeo}
          data-testid="geo-button"
        >
          Запросить геолокацию
        </button>
        <p aria-live="polite" className="mono" data-testid="geo-result">
          {geo}
        </p>
        <p className="hint">
          В тестах: <code>context.setGeolocation({'{ latitude, longitude }'})</code> +{' '}
          <code>grantPermissions(['geolocation'])</code>
        </p>
      </div>

      <div
        className="card card--pad-lg stack"
        style={{ marginTop: '1rem' }}
        data-testid="permissions-section"
      >
        <h2>Permissions API</h2>
        <button
          type="button"
          className="btn btn--outline"
          onClick={() => void queryPermissions()}
          data-testid="perm-button"
        >
          Опросить permissions
        </button>
        <ul style={{ listStyle: 'none', padding: 0 }} data-testid="perm-list">
          {permissions.map((p) => (
            <li
              key={p.name}
              className="row"
              style={{ justifyContent: 'space-between', padding: '0.2rem 0' }}
            >
              <code>{p.name}</code>
              <span className="badge">{p.state}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
