import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ApiError, api, type Order } from '../api/client'
import { useAuth } from '../contexts/AuthContext'
import { useCart } from '../contexts/CartContext'
import { useI18n } from '../i18n'
import { maskCard, maskExpiry, maskPhone, maskedSetter } from '../lib/mask'
import { Price, Spinner } from '../components/ui'

interface FormState {
  name: string
  email: string
  phone: string
  address: string
  payment: 'card' | 'cash'
  cardNumber: string
  cardExpiry: string
  cardCvv: string
}

type Errors = Partial<Record<keyof FormState, string>>

const STEPS = ['checkout.step1', 'checkout.step2', 'checkout.step3'] as const

export function CheckoutPage() {
  const { t } = useI18n()
  const { user } = useAuth()
  const { cart, refresh } = useCart()
  const [step, setStep] = useState(0)
  const [values, setValues] = useState<FormState>({
    name: user?.name ?? '',
    email: user?.email ?? '',
    phone: '',
    address: '',
    payment: 'card',
    cardNumber: '',
    cardExpiry: '',
    cardCvv: '',
  })
  const [errors, setErrors] = useState<Errors>({})
  const [placing, setPlacing] = useState(false)
  const [order, setOrder] = useState<Order | null>(null)
  const [fatal, setFatal] = useState<string | null>(null)

  const set = (key: keyof FormState) => (e: { target: { value: string } }) =>
    setValues((v) => ({ ...v, [key]: e.target.value }))

  const setVal = (key: keyof FormState) => (value: string) =>
    setValues((v) => ({ ...v, [key]: value }))

  const validateStep = (s: number): Errors => {
    const next: Errors = {}
    if (s === 0) {
      if (values.name.trim().length < 2) next.name = 'Укажите имя'
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) next.email = 'Некорректный email'
      if (values.phone.replace(/\D/g, '').length !== 11) next.phone = 'Введите телефон полностью'
    }
    if (s === 1) {
      if (values.address.trim().length < 5) next.address = 'Укажите адрес доставки'
      if (values.payment === 'card') {
        if (values.cardNumber.replace(/\D/g, '').length !== 16) next.cardNumber = '16 цифр'
        if (!/^\d{2}\/\d{2}$/.test(values.cardExpiry)) next.cardExpiry = 'ММ/ГГ'
        if (!/^\d{3,4}$/.test(values.cardCvv)) next.cardCvv = '3–4 цифры'
      }
    }
    return next
  }

  const next = () => {
    const issues = validateStep(step)
    setErrors(issues)
    if (Object.keys(issues).length === 0) setStep((s) => Math.min(2, s + 1))
  }

  const confirm = async () => {
    setPlacing(true)
    setFatal(null)
    try {
      const created = await api.post<Order>('/api/orders', {
        email: values.email,
        phone: values.phone,
        address: values.address,
        payment: values.payment,
        name: values.name,
      })
      setOrder(created)
      await refresh()
    } catch (e) {
      setFatal(e instanceof ApiError ? (e.data.message as string) : 'Ошибка оформления')
    } finally {
      setPlacing(false)
    }
  }

  const summaryItems = useMemo(() => cart?.items ?? [], [cart])

  if (order) {
    return (
      <div className="page page--narrow">
        <div className="card card--pad-lg" data-testid="checkout-success">
          <h1>✅ {t('checkout.success')}</h1>
          <p>
            {t('checkout.successText')}:{' '}
            <strong className="mono" data-testid="order-number">
              {order.number}
            </strong>
          </p>
          <p className="muted">
            Сумма: <Price cents={order.totalCents} />
          </p>
          <div className="row">
            <Link to="/account" className="btn btn--primary">
              {t('nav.account')}
            </Link>
            <Link to="/catalog" className="btn btn--ghost">
              {t('cart.continue')}
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (!cart) {
    return (
      <div className="page">
        <Spinner label={t('common.loading')} />
      </div>
    )
  }

  if (cart.items.length === 0) {
    return (
      <div className="page page--narrow">
        <div className="card card--pad-lg" data-testid="checkout-empty">
          <h1>{t('nav.checkout')}</h1>
          <p className="muted">{t('checkout.empty')}</p>
          <Link to="/catalog" className="btn btn--primary">
            {t('cart.continue')}
          </Link>
        </div>
      </div>
    )
  }

  const aria = (v?: string) => (v ? 'true' : undefined)
  const err = (v?: string) =>
    v ? (
      <span className="error-text" role="alert">
        {v}
      </span>
    ) : null

  return (
    <div className="page page--narrow">
      <h1>{t('nav.checkout')}</h1>

      <nav aria-label="Шаги оформления" data-testid="checkout-steps">
        <ol className="row" style={{ listStyle: 'none', padding: 0, gap: '0.5rem' }}>
          {STEPS.map((key, i) => (
            <li key={key}>
              <span
                className={i === step ? 'badge' : 'badge faint'}
                aria-current={i === step ? 'step' : undefined}
                data-testid={`step-${i + 1}`}
              >
                {i + 1}. {t(key)}
              </span>
            </li>
          ))}
        </ol>
      </nav>

      {fatal ? (
        <p role="alert" className="error-text" data-testid="checkout-error">
          {fatal}
        </p>
      ) : null}

      <div className="card card--pad-lg">
        {step === 0 ? (
          <div data-testid="step-panel-1">
            <div className="field">
              <label htmlFor="co-name">{t('auth.name')}</label>
              <input
                id="co-name"
                className="input"
                value={values.name}
                onChange={set('name')}
                aria-invalid={aria(errors.name)}
                data-testid="co-name"
              />
              {err(errors.name)}
            </div>
            <div className="field">
              <label htmlFor="co-email">{t('auth.email')}</label>
              <input
                id="co-email"
                type="email"
                className="input"
                value={values.email}
                onChange={set('email')}
                aria-invalid={aria(errors.email)}
                data-testid="co-email"
              />
              {err(errors.email)}
            </div>
            <div className="field">
              <label htmlFor="co-phone">{t('checkout.phone')}</label>
              <input
                id="co-phone"
                type="tel"
                className="input mono"
                placeholder="+7 (900) 000-00-00"
                value={values.phone}
                onChange={maskedSetter(maskPhone, setVal('phone'))}
                aria-invalid={aria(errors.phone)}
                data-testid="co-phone"
              />
              {err(errors.phone)}
              <span className="hint">Маска: +7 (___) ___-__-__</span>
            </div>
          </div>
        ) : null}

        {step === 1 ? (
          <div data-testid="step-panel-2">
            <div className="field">
              <label htmlFor="co-address">{t('checkout.address')}</label>
              <textarea
                id="co-address"
                className="textarea"
                rows={2}
                value={values.address}
                onChange={set('address')}
                aria-invalid={aria(errors.address)}
                data-testid="co-address"
              />
              {err(errors.address)}
            </div>
            <fieldset style={{ border: 'none', padding: 0, margin: '0 0 1rem' }}>
              <legend style={{ fontWeight: 600, fontSize: '0.88rem', marginBottom: '0.4rem' }}>
                {t('checkout.payment')}
              </legend>
              <div className="radio-row">
                <input
                  id="co-pay-card"
                  type="radio"
                  name="payment"
                  checked={values.payment === 'card'}
                  onChange={() => setValues((v) => ({ ...v, payment: 'card' }))}
                  data-testid="co-pay-card"
                />
                <label htmlFor="co-pay-card">{t('checkout.paymentCard')}</label>
              </div>
              <div className="radio-row">
                <input
                  id="co-pay-cash"
                  type="radio"
                  name="payment"
                  checked={values.payment === 'cash'}
                  onChange={() => setValues((v) => ({ ...v, payment: 'cash' }))}
                  data-testid="co-pay-cash"
                />
                <label htmlFor="co-pay-cash">{t('checkout.paymentCash')}</label>
              </div>
            </fieldset>
            {values.payment === 'card' ? (
              <div className="row" style={{ alignItems: 'flex-start' }} data-testid="card-fields">
                <div className="field" style={{ flex: 2, minWidth: '180px' }}>
                  <label htmlFor="co-card">{t('checkout.cardNumber')}</label>
                  <input
                    id="co-card"
                    className="input mono"
                    placeholder="0000 0000 0000 0000"
                    inputMode="numeric"
                    value={values.cardNumber}
                    onChange={maskedSetter(maskCard, setVal('cardNumber'))}
                    aria-invalid={aria(errors.cardNumber)}
                    data-testid="co-card"
                  />
                  {err(errors.cardNumber)}
                </div>
                <div className="field" style={{ minWidth: '100px' }}>
                  <label htmlFor="co-exp">{t('checkout.cardExpiry')}</label>
                  <input
                    id="co-exp"
                    className="input mono"
                    placeholder="ММ/ГГ"
                    inputMode="numeric"
                    value={values.cardExpiry}
                    onChange={maskedSetter(maskExpiry, setVal('cardExpiry'))}
                    aria-invalid={aria(errors.cardExpiry)}
                    data-testid="co-exp"
                  />
                  {err(errors.cardExpiry)}
                </div>
                <div className="field" style={{ minWidth: '80px' }}>
                  <label htmlFor="co-cvv">{t('checkout.cardCvv')}</label>
                  <input
                    id="co-cvv"
                    type="password"
                    className="input mono"
                    placeholder="123"
                    inputMode="numeric"
                    maxLength={4}
                    value={values.cardCvv}
                    onChange={(e) =>
                      setValues((v) => ({ ...v, cardCvv: e.target.value.replace(/\D/g, '') }))
                    }
                    aria-invalid={aria(errors.cardCvv)}
                    data-testid="co-cvv"
                  />
                  {err(errors.cardCvv)}
                </div>
              </div>
            ) : null}
          </div>
        ) : null}

        {step === 2 ? (
          <div data-testid="step-panel-3">
            <dl style={{ margin: 0 }}>
              <div className="row" style={{ justifyContent: 'space-between' }}>
                <dt className="muted">{t('auth.name')}</dt>
                <dd data-testid="confirm-name">{values.name}</dd>
              </div>
              <div className="row" style={{ justifyContent: 'space-between' }}>
                <dt className="muted">{t('auth.email')}</dt>
                <dd data-testid="confirm-email">{values.email}</dd>
              </div>
              <div className="row" style={{ justifyContent: 'space-between' }}>
                <dt className="muted">{t('checkout.phone')}</dt>
                <dd data-testid="confirm-phone">{values.phone}</dd>
              </div>
              <div className="row" style={{ justifyContent: 'space-between' }}>
                <dt className="muted">{t('checkout.address')}</dt>
                <dd data-testid="confirm-address">{values.address}</dd>
              </div>
              <div className="row" style={{ justifyContent: 'space-between' }}>
                <dt className="muted">{t('checkout.payment')}</dt>
                <dd data-testid="confirm-payment">
                  {values.payment === 'card'
                    ? t('checkout.paymentCard')
                    : t('checkout.paymentCash')}
                </dd>
              </div>
            </dl>
            <hr
              style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '1rem 0' }}
            />
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {summaryItems.map((it) => (
                <li
                  key={it.productId}
                  className="row"
                  style={{ justifyContent: 'space-between', marginBottom: '0.3rem' }}
                >
                  <span>
                    {it.product?.name} × {it.qty}
                  </span>
                  <Price cents={(it.product?.priceCents ?? 0) * it.qty} />
                </li>
              ))}
            </ul>
            <hr
              style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '1rem 0' }}
            />
            <div className="row" style={{ justifyContent: 'space-between', fontWeight: 700 }}>
              <span>{t('common.total')}</span>
              <Price cents={cart.totalCents} />
            </div>
          </div>
        ) : null}

        <div className="row" style={{ marginTop: '1.5rem' }}>
          {step > 0 ? (
            <button type="button" className="btn btn--outline" onClick={() => setStep(step - 1)}>
              ← {t('checkout.back')}
            </button>
          ) : null}
          {step < 2 ? (
            <button type="button" className="btn btn--primary" onClick={next} data-testid="co-next">
              {t('checkout.next')} →
            </button>
          ) : (
            <button
              type="button"
              className="btn btn--primary"
              disabled={placing}
              onClick={() => void confirm()}
              data-testid="co-confirm"
            >
              {placing ? '…' : `✓ ${t('checkout.confirm')}`}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
