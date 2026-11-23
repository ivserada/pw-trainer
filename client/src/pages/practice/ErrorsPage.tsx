import { useState } from 'react'

/**
 * 🔴 /practice/errors — кнопки, вызывающие ошибки API и медленные ответы.
 * Для тренировки page.route, expect.poll, ожиданий.
 */
export function ErrorsPage() {
  const [result, setResult] = useState<{
    label: string
    ok: boolean
    status: number
    body: string
  } | null>(null)
  const [pending, setPending] = useState<string | null>(null)

  const call = async (label: string, url: string) => {
    setPending(label)
    setResult(null)
    const started = Date.now()
    try {
      const res = await fetch(url)
      const body = await res.text()
      setResult({ label, ok: res.ok, status: res.status, body: body.slice(0, 120) })
    } catch (e) {
      setResult({
        label,
        ok: false,
        status: 0,
        body: e instanceof Error ? e.message : 'network error',
      })
    } finally {
      setPending(null)
      void started
    }
  }

  const buttons: { label: string; url: string; testId: string }[] = [
    { label: 'GET 401', url: '/api/demo/errors/401', testId: 'err-401' },
    { label: 'GET 403', url: '/api/demo/errors/403', testId: 'err-403' },
    { label: 'GET 404', url: '/api/demo/errors/404', testId: 'err-404' },
    { label: 'GET 500', url: '/api/demo/errors/500', testId: 'err-500' },
    { label: 'Slow 3 с', url: '/api/demo/slow?ms=3000', testId: 'err-slow' },
    { label: 'Пустой список', url: '/api/demo/empty', testId: 'err-empty' },
    { label: 'Protected (нужен Bearer)', url: '/api/demo/protected', testId: 'err-protected' },
    { label: 'Admin only', url: '/api/demo/admin-only', testId: 'err-admin' },
  ]

  return (
    <div className="page page--narrow">
      <h1>🔴 Ошибки API</h1>
      <p className="muted">
        Каждая кнопка — реальный запрос. Потренируйтесь перехватывать их через{' '}
        <code>page.route</code> и обрабатывать ожидания.
      </p>

      <div className="card card--pad-lg stack" data-testid="errors-grid">
        {buttons.map((b) => (
          <button
            key={b.testId}
            type="button"
            className="btn btn--outline"
            disabled={pending !== null}
            onClick={() => void call(b.label, b.url)}
            data-testid={b.testId}
          >
            {pending === b.label ? 'Запрос…' : b.label}
          </button>
        ))}
      </div>

      <div
        className="card card--pad-lg"
        style={{ marginTop: '1rem' }}
        aria-live="polite"
        data-testid="error-result"
      >
        {result ? (
          <>
            <p>
              <span className={`badge ${result.ok ? 'badge--success' : 'badge--danger'}`}>
                HTTP {result.status}
              </span>{' '}
              <strong>{result.label}</strong>
            </p>
            <pre className="mono" style={{ whiteSpace: 'pre-wrap', margin: 0, fontSize: '0.8rem' }}>
              {result.body}
            </pre>
          </>
        ) : (
          <p className="muted" style={{ margin: 0 }}>
            Результат появится здесь
          </p>
        )}
      </div>
    </div>
  )
}
