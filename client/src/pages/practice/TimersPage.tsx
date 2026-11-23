import { useEffect, useState } from 'react'

/**
 * 🔴 /practice/timers — таймеры и обратный отсчёт (учебная площадка для page.clock).
 */
export function TimersPage() {
  const [now, setNow] = useState(() => new Date())
  const [resendLeft, setResendLeft] = useState(10)
  const [timeoutMsg, setTimeoutMsg] = useState<string | null>(null)

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    if (resendLeft <= 0) return
    const t = setTimeout(() => setResendLeft((s) => s - 1), 1000)
    return () => clearTimeout(t)
  }, [resendLeft])

  const scheduleMessage = () => {
    setTimeoutMsg(null)
    setTimeout(() => setTimeoutMsg('⏰ Сообщение по setTimeout(2000)'), 2000)
  }

  const midnight = new Date(now)
  midnight.setHours(24, 0, 0, 0)
  const secondsLeft = Math.max(0, Math.floor((midnight.getTime() - now.getTime()) / 1000))
  const hh = String(Math.floor(secondsLeft / 3600)).padStart(2, '0')
  const mm = String(Math.floor((secondsLeft % 3600) / 60)).padStart(2, '0')
  const ss = String(secondsLeft % 60).padStart(2, '0')

  return (
    <div className="page page--narrow">
      <h1>🔴 Таймеры и обратный отсчёт</h1>
      <p className="muted">
        Часы на <code>setInterval(1000)</code>, обратный отсчёт на <code>setTimeout</code>. В
        Playwright используйте <code>page.clock.install()</code> и <code>clock.fastForward()</code>.
      </p>

      <div className="card card--pad-lg stack" data-testid="timers-demo">
        <h2>Часы</h2>
        <p
          className="mono"
          style={{ fontSize: '1.6rem', margin: 0, fontWeight: 700 }}
          data-testid="clock"
        >
          {now.toLocaleTimeString('ru-RU')}
        </p>
        <p className="muted" style={{ margin: 0 }} data-testid="clock-date">
          {now.toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' })}
        </p>
      </div>

      <div
        className="card card--pad-lg stack"
        style={{ marginTop: '1rem' }}
        data-testid="countdown-demo"
      >
        <h2>До полуночи</h2>
        <p
          className="mono"
          style={{ fontSize: '1.8rem', margin: 0, fontWeight: 800, color: 'var(--accent)' }}
          data-testid="midnight-countdown"
        >
          {hh}:{mm}:{ss}
        </p>
      </div>

      <div
        className="card card--pad-lg stack"
        style={{ marginTop: '1rem' }}
        data-testid="resend-demo"
      >
        <h2>Код отправлен повторно</h2>
        {resendLeft > 0 ? (
          <p style={{ margin: 0 }} data-testid="resend-timer">
            Отправить снова можно через <strong>{resendLeft}</strong> с
          </p>
        ) : (
          <button
            type="button"
            className="btn btn--primary"
            onClick={() => setResendLeft(10)}
            data-testid="resend-button"
          >
            Отправить код ещё раз
          </button>
        )}
      </div>

      <div
        className="card card--pad-lg stack"
        style={{ marginTop: '1rem' }}
        data-testid="timeout-demo"
      >
        <h2>setTimeout</h2>
        <button
          type="button"
          className="btn btn--outline"
          onClick={scheduleMessage}
          data-testid="schedule-timeout"
        >
          Показать сообщение через 2 с
        </button>
        <p aria-live="polite" className="muted" style={{ margin: 0 }} data-testid="timeout-message">
          {timeoutMsg ?? '—'}
        </p>
      </div>
    </div>
  )
}
