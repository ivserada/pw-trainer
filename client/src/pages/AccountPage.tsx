import { useEffect, useState, type FormEvent } from 'react'
import { Link, Navigate, useLocation } from 'react-router-dom'
import { api, type Order, type User } from '../api/client'
import { useAuth } from '../contexts/AuthContext'
import { useI18n } from '../i18n'
import { Price, Spinner, useToast } from '../components/ui'

const STATUS_LABEL: Record<Order['status'], string> = {
  new: 'Новый',
  paid: 'Оплачен',
  shipped: 'Отправлен',
  delivered: 'Доставлен',
  cancelled: 'Отменён',
}

function Avatar({ user, size = 72 }: { user: User; size?: number }) {
  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      role="img"
      aria-label={`Аватар: ${user.name}`}
      data-testid="user-avatar"
      style={{ borderRadius: '50%', display: 'block', flex: 'none' }}
    >
      <rect width="100" height="100" fill={`hsl(${user.avatarHue} 50% 80%)`} />
      <text
        x="50"
        y="62"
        textAnchor="middle"
        fontSize="42"
        fontWeight="700"
        fill={`hsl(${user.avatarHue} 55% 30%)`}
        fontFamily="ui-monospace, Menlo, monospace"
      >
        {user.name.trim().charAt(0).toUpperCase() || '?'}
      </text>
    </svg>
  )
}

export function AccountPage() {
  const { t } = useI18n()
  const toast = useToast()
  const { user, loading, refresh } = useAuth()
  const location = useLocation()
  const [orders, setOrders] = useState<Order[] | null>(null)
  const [name, setName] = useState('')
  const [hue, setHue] = useState(210)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (user) {
      setName(user.name)
      setHue(user.avatarHue)
    }
  }, [user])

  useEffect(() => {
    if (!user) return
    api
      .get<Order[]>('/api/orders')
      .then(setOrders)
      .catch(() => setOrders([]))
  }, [user])

  if (loading) {
    return (
      <div className="page">
        <Spinner label={t('common.loading')} />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />
  }

  const saveProfile = async (e: FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      await api.patch('/api/users/me', { name: name.trim(), avatarHue: hue })
      await refresh()
      toast('success', 'Профиль обновлён')
    } catch {
      toast('error', 'Не удалось сохранить профиль')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="page">
      <h1>{t('account.title')}</h1>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '1.5rem',
          alignItems: 'start',
        }}
      >
        <section className="card card--pad-lg" aria-label={t('account.profile')}>
          <h2>{t('account.profile')}</h2>
          <form onSubmit={(e) => void saveProfile(e)} data-testid="profile-form">
            <div className="row" style={{ marginBottom: '1rem' }}>
              <Avatar user={{ ...user, avatarHue: hue, name }} />
              <div>
                <p style={{ margin: 0, fontWeight: 700 }} data-testid="account-name">
                  {user.name}
                </p>
                <p className="muted mono" style={{ margin: 0 }}>
                  {user.email}
                </p>
                <span className="badge">{user.role}</span>{' '}
                {user.otpEnabled ? (
                  <span className="badge badge--success">{t('account.2fa')} ✓</span>
                ) : (
                  <span className="badge badge--warning">2FA выкл.</span>
                )}
              </div>
            </div>
            <div className="field">
              <label htmlFor="acc-name">{t('auth.name')}</label>
              <input
                id="acc-name"
                className="input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                data-testid="acc-name"
              />
            </div>
            <div className="field">
              <label htmlFor="acc-hue">Оттенок аватара: {hue}°</label>
              <input
                id="acc-hue"
                type="range"
                min={0}
                max={359}
                value={hue}
                onChange={(e) => setHue(Number(e.target.value))}
                data-testid="acc-hue"
              />
            </div>
            <button type="submit" className="btn btn--primary" disabled={saving}>
              {t('common.save')}
            </button>
          </form>
          {(user.role === 'admin' || user.role === 'manager') && (
            <p style={{ marginTop: '1rem' }}>
              <Link to="/admin" className="btn btn--outline btn--sm">
                {t('nav.admin')} →
              </Link>
            </p>
          )}
        </section>

        <section className="card card--pad-lg" aria-label={t('account.orders')}>
          <h2>{t('account.orders')}</h2>
          {orders === null ? (
            <Spinner label={t('common.loading')} />
          ) : orders.length === 0 ? (
            <p className="muted">{t('account.noOrders')}</p>
          ) : (
            <div className="table-wrap">
              <table className="table" data-testid="orders-table">
                <thead>
                  <tr>
                    <th scope="col">№</th>
                    <th scope="col">Дата</th>
                    <th scope="col">Статус</th>
                    <th scope="col">{t('common.total')}</th>
                    <th scope="col">{t('account.invoice')}</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((o) => (
                    <tr key={o.id} data-testid={`order-row-${o.id}`}>
                      <td className="mono">{o.number}</td>
                      <td className="mono">{o.createdAt.slice(0, 10)}</td>
                      <td>
                        <span
                          className={`badge ${
                            o.status === 'delivered'
                              ? 'badge--success'
                              : o.status === 'cancelled'
                                ? 'badge--danger'
                                : ''
                          }`}
                        >
                          {STATUS_LABEL[o.status]}
                        </span>
                      </td>
                      <td>
                        <Price cents={o.totalCents} />
                      </td>
                      <td>
                        <a
                          className="btn btn--outline btn--sm"
                          href={`/api/orders/${o.id}/invoice`}
                          download
                          data-testid={`invoice-${o.id}`}
                        >
                          ⬇ PDF
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
