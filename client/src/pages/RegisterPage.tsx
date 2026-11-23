import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ApiError, api, setToken } from '../api/client'
import { useAuth } from '../contexts/AuthContext'
import { useI18n } from '../i18n'

interface Errors {
  name?: string
  email?: string
  password?: string
  confirm?: string
  form?: string
}

export function RegisterPage() {
  const { t } = useI18n()
  const { refresh } = useAuth()
  const navigate = useNavigate()
  const [values, setValues] = useState({ name: '', email: '', password: '', confirm: '' })
  const [errors, setErrors] = useState<Errors>({})
  const [busy, setBusy] = useState(false)

  const set = (key: keyof typeof values) => (e: { target: { value: string } }) =>
    setValues((v) => ({ ...v, [key]: e.target.value }))

  const validate = (): Errors => {
    const next: Errors = {}
    if (values.name.trim().length < 2) next.name = 'Имя должно быть не короче 2 символов'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) next.email = 'Введите корректный email'
    if (values.password.length < 6) next.password = 'Пароль должен быть не короче 6 символов'
    if (values.confirm !== values.password) next.confirm = 'Пароли не совпадают'
    return next
  }

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const next = validate()
    setErrors(next)
    if (Object.keys(next).length > 0) return
    setBusy(true)
    try {
      const res = await api.post<{ user: unknown; accessToken: string }>('/api/auth/register', {
        name: values.name.trim(),
        email: values.email.trim(),
        password: values.password,
      })
      setToken(res.accessToken)
      await refresh()
      navigate('/account', { replace: true })
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setErrors({ email: t('auth.errorExists') })
      } else if (err instanceof ApiError && err.status === 400) {
        const issues = err.data.issues as string[] | undefined
        setErrors({ form: issues?.join(' ') ?? 'Проверьте поля формы' })
      } else {
        setErrors({ form: err instanceof Error ? err.message : 'Ошибка регистрации' })
      }
    } finally {
      setBusy(false)
    }
  }

  const aria = (has?: string) => (has ? 'true' : undefined)

  return (
    <div className="page page--narrow">
      <div className="card card--pad-lg" data-testid="register-form-wrap">
        <h1>{t('auth.registerTitle')}</h1>
        {errors.form ? (
          <p role="alert" className="error-text" data-testid="register-error">
            {errors.form}
          </p>
        ) : null}
        <form onSubmit={(e) => void onSubmit(e)} data-testid="register-form" noValidate>
          <div className="field">
            <label htmlFor="reg-name">{t('auth.name')}</label>
            <input
              id="reg-name"
              className="input"
              autoComplete="name"
              value={values.name}
              onChange={set('name')}
              aria-invalid={aria(errors.name)}
              data-testid="reg-name"
            />
            {errors.name ? (
              <span className="error-text" data-testid="reg-name-error">
                {errors.name}
              </span>
            ) : null}
          </div>
          <div className="field">
            <label htmlFor="reg-email">{t('auth.email')}</label>
            <input
              id="reg-email"
              type="email"
              className="input"
              autoComplete="email"
              value={values.email}
              onChange={set('email')}
              aria-invalid={aria(errors.email)}
              data-testid="reg-email"
            />
            {errors.email ? (
              <span className="error-text" data-testid="reg-email-error">
                {errors.email}
              </span>
            ) : null}
          </div>
          <div className="field">
            <label htmlFor="reg-password">{t('auth.password')}</label>
            <input
              id="reg-password"
              type="password"
              className="input"
              autoComplete="new-password"
              value={values.password}
              onChange={set('password')}
              aria-invalid={aria(errors.password)}
              data-testid="reg-password"
            />
            {errors.password ? (
              <span className="error-text" data-testid="reg-password-error">
                {errors.password}
              </span>
            ) : null}
          </div>
          <div className="field">
            <label htmlFor="reg-confirm">{t('auth.confirmPassword')}</label>
            <input
              id="reg-confirm"
              type="password"
              className="input"
              autoComplete="new-password"
              value={values.confirm}
              onChange={set('confirm')}
              aria-invalid={aria(errors.confirm)}
              data-testid="reg-confirm"
            />
            {errors.confirm ? (
              <span className="error-text" data-testid="reg-confirm-error">
                {errors.confirm}
              </span>
            ) : null}
          </div>
          <div className="row">
            <button type="submit" className="btn btn--primary" disabled={busy}>
              {t('auth.submitRegister')}
            </button>
            <Link to="/login">{t('auth.haveAccount')}</Link>
          </div>
        </form>
      </div>
    </div>
  )
}
