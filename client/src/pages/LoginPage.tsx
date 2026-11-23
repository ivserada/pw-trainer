import { useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { ApiError } from '../api/client'
import { useAuth } from '../contexts/AuthContext'
import { useI18n } from '../i18n'

export function LoginPage() {
  const { t } = useI18n()
  const { login, completeOtp } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<{ email?: boolean; password?: boolean }>({})
  const [otpToken, setOtpToken] = useState<string | null>(null)
  const [otp, setOtp] = useState('')
  const [otpError, setOtpError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const from = (location.state as { from?: string } | null)?.from ?? '/account'

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setFieldErrors({})
    setBusy(true)
    try {
      const result = await login(email, password)
      if (result.requiresOtp) {
        setOtpToken(result.otpToken ?? null)
      } else {
        navigate(from, { replace: true })
      }
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setError(t('auth.errorCredentials'))
        setFieldErrors({ email: true, password: true })
      } else {
        setError(err instanceof Error ? err.message : 'Ошибка входа')
      }
    } finally {
      setBusy(false)
    }
  }

  const onOtp = async (e: FormEvent) => {
    e.preventDefault()
    setOtpError(null)
    setBusy(true)
    try {
      await completeOtp(otpToken!, otp)
      navigate(from, { replace: true })
    } catch (err) {
      setOtpError(err instanceof ApiError ? (err.data.message as string) : 'Ошибка проверки кода')
    } finally {
      setBusy(false)
    }
  }

  if (otpToken) {
    return (
      <div className="page page--narrow">
        <div className="card card--pad-lg" data-testid="otp-step">
          <h1>{t('auth.otpTitle')}</h1>
          <p className="muted">{t('auth.otpText')}</p>
          {otpError ? (
            <p role="alert" className="error-text" data-testid="otp-error">
              {otpError}
            </p>
          ) : null}
          <form onSubmit={(e) => void onOtp(e)}>
            <div className="field">
              <label htmlFor="otp-code">{t('auth.otpCode')}</label>
              <input
                id="otp-code"
                className="input mono"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                aria-invalid={otpError ? 'true' : undefined}
                data-testid="otp-code"
              />
            </div>
            <button type="submit" className="btn btn--primary" disabled={busy || otp.length !== 6}>
              {t('auth.otpSubmit')}
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="page page--narrow">
      <div className="card card--pad-lg" data-testid="login-form-wrap">
        <h1>{t('auth.loginTitle')}</h1>
        {error ? (
          <p role="alert" className="error-text" data-testid="login-error">
            {error}
          </p>
        ) : null}
        <form onSubmit={(e) => void onSubmit(e)} data-testid="login-form" noValidate>
          <div className="field">
            <label htmlFor="login-email">{t('auth.email')}</label>
            <input
              id="login-email"
              name="email"
              type="email"
              className="input"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-invalid={fieldErrors.email ? 'true' : undefined}
              data-testid="login-email"
            />
          </div>
          <div className="field">
            <label htmlFor="login-password">{t('auth.password')}</label>
            <input
              id="login-password"
              name="password"
              type="password"
              className="input"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              aria-invalid={fieldErrors.password ? 'true' : undefined}
              data-testid="login-password"
            />
          </div>
          <div className="row">
            <button type="submit" className="btn btn--primary" disabled={busy}>
              {t('auth.submitLogin')}
            </button>
            <Link to="/register">{t('auth.noAccount')}</Link>
          </div>
        </form>
        <details className="spoiler" style={{ marginTop: '1rem' }}>
          <summary>Тестовые учётные данные</summary>
          <p className="mono" style={{ margin: '0.5rem 0 0' }}>
            customer@shop.test / password123
            <br />
            manager@shop.test / password123
            <br />
            admin@shop.test / password123 (включён 2FA)
          </p>
        </details>
      </div>
    </div>
  )
}
