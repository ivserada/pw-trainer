import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { ApiError } from '../api/client'
import { useCart } from '../contexts/CartContext'
import { useI18n } from '../i18n'
import { Price, ProductImage, Spinner } from '../components/ui'

export function CartPage() {
  const { t } = useI18n()
  const { cart, setQty, remove, applyPromo } = useCart()
  const [promo, setPromo] = useState('')
  const [promoMsg, setPromoMsg] = useState<{ ok: boolean; text: string } | null>(null)
  const [busy, setBusy] = useState(false)

  const onPromo = async (e: FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setPromoMsg(null)
    try {
      await applyPromo(promo)
      setPromoMsg({ ok: true, text: t('cart.promoApplied') })
    } catch (err) {
      setPromoMsg({
        ok: false,
        text: err instanceof ApiError ? (err.data.message as string) : t('cart.promoInvalid'),
      })
    } finally {
      setBusy(false)
    }
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
        <div className="card card--pad-lg" data-testid="cart-empty">
          <h1>{t('cart.title')}</h1>
          <p className="muted">{t('cart.empty')}</p>
          <Link to="/catalog" className="btn btn--primary">
            {t('cart.continue')}
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="page">
      <h1>{t('cart.title')}</h1>
      <div className="table-wrap">
        <table className="table" data-testid="cart-table">
          <thead>
            <tr>
              <th scope="col">{t('cart.colProduct')}</th>
              <th scope="col">{t('cart.colPrice')}</th>
              <th scope="col">{t('cart.colQty')}</th>
              <th scope="col">{t('cart.colTotal')}</th>
              <th scope="col">{t('cart.colActions')}</th>
            </tr>
          </thead>
          <tbody>
            {cart.items.map((it) => (
              <tr key={it.productId} data-testid="cart-row">
                <td>
                  <div className="row" style={{ gap: '0.6rem' }}>
                    <div style={{ width: '52px', flex: 'none' }}>
                      <ProductImage hue={it.product!.hue} name={it.product!.name} size={52} />
                    </div>
                    <Link to={`/product/${it.productId}`}>{it.product!.name}</Link>
                  </div>
                </td>
                <td>
                  <Price cents={it.product!.priceCents} />
                </td>
                <td>
                  <input
                    type="number"
                    className="input"
                    style={{ width: '4.2rem' }}
                    min={0}
                    max={99}
                    defaultValue={it.qty}
                    aria-label={`${t('cart.colQty')}: ${it.product!.name}`}
                    onBlur={(e) => {
                      const q = Number(e.target.value)
                      if (q !== it.qty) void setQty(it.productId, q)
                    }}
                    data-testid={`qty-${it.productId}`}
                  />
                </td>
                <td>
                  <Price cents={it.product!.priceCents * it.qty} />
                </td>
                <td>
                  <button
                    type="button"
                    className="btn btn--ghost btn--sm"
                    onClick={() => void remove(it.productId)}
                    data-testid={`remove-${it.productId}`}
                  >
                    🗑 {t('common.delete')}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1.5rem',
          marginTop: '1.5rem',
          alignItems: 'start',
        }}
      >
        <form className="card" onSubmit={(e) => void onPromo(e)} data-testid="promo-form">
          <div className="field">
            <label htmlFor="promo-input">Промокод</label>
            <input
              id="promo-input"
              className="input"
              placeholder={t('cart.promoPlaceholder')}
              value={promo}
              onChange={(e) => setPromo(e.target.value)}
              aria-invalid={promoMsg && !promoMsg.ok ? 'true' : undefined}
              data-testid="promo-input"
            />
            {promoMsg ? (
              <span className={promoMsg.ok ? 'badge badge--success' : 'error-text'} role="status">
                {promoMsg.text}
              </span>
            ) : null}
          </div>
          <button type="submit" className="btn btn--outline" disabled={busy}>
            {t('cart.promoApply')}
          </button>
          {cart.promoCode ? (
            <p className="muted mono" style={{ marginTop: '0.5rem' }}>
              Активен: {cart.promoCode} (−{cart.discountPercent}%)
            </p>
          ) : null}
        </form>

        <div className="card" data-testid="cart-summary">
          <div className="row" style={{ justifyContent: 'space-between' }}>
            <span className="muted">{t('cart.subtotal')}</span>
            <Price cents={cart.subtotalCents} />
          </div>
          <div className="row" style={{ justifyContent: 'space-between' }}>
            <span className="muted">{t('cart.discount')}</span>
            <span style={{ color: 'var(--success)' }}>
              −<Price cents={cart.discountCents} />
            </span>
          </div>
          <hr style={{ border: 'none', borderTop: '1px solid var(--border)' }} />
          <div
            className="row"
            style={{ justifyContent: 'space-between', fontSize: '1.15rem', fontWeight: 700 }}
          >
            <span>{t('common.total')}</span>
            <Price cents={cart.totalCents} />
          </div>
          <div className="row" style={{ marginTop: '1rem' }}>
            <Link to="/checkout" className="btn btn--primary" data-testid="go-checkout">
              {t('cart.checkout')} →
            </Link>
            <Link to="/catalog" className="btn btn--ghost">
              {t('cart.continue')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
