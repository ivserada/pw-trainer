import { useState, type FormEvent } from 'react'
import { ApiError, api, setToken } from '../../api/client'
import { useAuth } from '../../contexts/AuthContext'

/**
 * 🔴 /practice/otp — двухфакторная авторизация. Код для тестов выдаёт
 * GET /api/test/otp?email=admin@shop.test.
 */
export function OtpPage() {
  const { refresh } = useAuth()
  const [email, setEmail] = useState('admin@shop.test')
  const [password, setPassword] = useState('password123')
  const [otpToken, setOtpToken] = useState<string | null>(null)
  const [code, setCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState<{ name: string; role: string } | null>(null)
  const [busy, setBusy] = useState(false)

  const step1 = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setBusy(true)
    try {
      const res = await api.post<{ requiresOtp?: boolean; otpToken?: string }>('/api/auth/login', {
        email,
        password,
      })
      if (res.requiresOtp) setOtpToken(res.otpToken ?? null)
      else setError('У этого пользователя не включён 2FA. Войдите под admin@shop.test.')
    } catch (err) {
      setError(err instanceof ApiError ? (err.data.message as string) : 'Ошибка входа')
    } finally {
      setBusy(false)
    }
  }

  const fetchTestOtp = async () => {
    const res = await api.get<{ otp: string }>(`/api/test/otp?email=${encodeURIComponent(email)}`)
    setCode(res.otp)
  }

  const step2 = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setBusy(true)
    try {
      const res = await api.post<{ user: { name: string; role: string }; accessToken: string }>(
        '/api/auth/otp',
        {
          otpToken,
          code,
        },
      )
      setToken(res.accessToken)
      await refresh()
      setDone({ name: res.user.name, role: res.user.role })
    } catch (err) {
      setError(err instanceof ApiError ? (err.data.message as string) : 'Неверный код')
    } finally {
      setBusy(false)
    }
  }

  if (done) {
    return (
      <div className="page page--narrow">
        <div className="card card--pad-lg" data-testid="otp-success">
          <h1>✅ 2FA пройдена</h1>
          <p>
            Пользователь: <strong>{done.name}</strong>, роль:{' '}
            <span className="badge">{done.role}</span>
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="page page--narrow">
      <h1>🔴 2FA / OTP</h1>
      <p className="muted">
        У пользователя <code>admin@shop.test</code> включена двухфакторная авторизация. В тестах код
        берите из <code>GET /api/test/otp?email=admin@shop.test</code>.
      </p>

      {error ? (
        <p role="alert" className="error-text" data-testid="otp-page-error">
          {error}
        </p>
      ) : null}

      {!otpToken ? (
        <form
          className="card card--pad-lg"
          onSubmit={(e) => void step1(e)}
          data-testid="otp-step1-form"
        >
          <div className="field">
            <label htmlFor="otp-email">Email</label>
            <input
              id="otp-email"
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              data-testid="otp-email"
            />
          </div>
          <div className="field">
            <label htmlFor="otp-password">Пароль</label>
            <input
              id="otp-password"
              type="password"
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              data-testid="otp-password"
            />
          </div>
          <button type="submit" className="btn btn--primary" disabled={busy}>
            Войти
          </button>
        </form>
      ) : (
        <form
          className="card card--pad-lg"
          onSubmit={(e) => void step2(e)}
          data-testid="otp-step2-form"
        >
          <div className="field">
            <label htmlFor="otp-code">Код подтверждения</label>
            <input
              id="otp-code"
              className="input mono"
              inputMode="numeric"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              data-testid="otp-code-input"
            />
          </div>
          <div className="row">
            <button type="submit" className="btn btn--primary" disabled={busy || code.length !== 6}>
              Подтвердить
            </button>
            <button
              type="button"
              className="btn btn--outline"
              onClick={() => void fetchTestOtp()}
              data-testid="otp-fetch-test"
            >
              Подставить код из /api/test/otp
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
