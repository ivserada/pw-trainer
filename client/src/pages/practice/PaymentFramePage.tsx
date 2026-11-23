import { useState, type FormEvent } from 'react'
import { maskCard, maskExpiry, maskedSetter } from '../../lib/mask'

/** Отдельная страница для iframe: «платёжный шлюз». */
export function PaymentFramePage() {
  const [card, setCard] = useState('')
  const [expiry, setExpiry] = useState('')
  const [paid, setPaid] = useState(false)

  const submit = (e: FormEvent) => {
    e.preventDefault()
    setPaid(true)
    window.parent?.postMessage({ type: 'payment-success', amount: 12500 }, '*')
  }

  if (paid) {
    return (
      <div style={{ fontFamily: 'system-ui', padding: '1rem' }}>
        <p role="status" data-testid="paid-message" style={{ color: '#047857', fontWeight: 600 }}>
          ✅ Оплата прошла успешно
        </p>
      </div>
    )
  }

  return (
    <div style={{ fontFamily: 'system-ui', padding: '1rem' }}>
      <h3 style={{ marginTop: 0 }}>Оплата заказа</h3>
      <form onSubmit={submit} data-testid="payment-form">
        <p>
          <label
            htmlFor="pay-card"
            style={{ display: 'block', fontSize: '0.85rem', marginBottom: 4 }}
          >
            Номер карты
          </label>
          <input
            id="pay-card"
            inputMode="numeric"
            placeholder="0000 0000 0000 0000"
            value={card}
            onChange={maskedSetter(maskCard, setCard)}
            required
            style={{ width: '100%', padding: '0.45rem', fontFamily: 'monospace' }}
            data-testid="pay-card"
          />
        </p>
        <p>
          <label
            htmlFor="pay-exp"
            style={{ display: 'block', fontSize: '0.85rem', marginBottom: 4 }}
          >
            Срок действия
          </label>
          <input
            id="pay-exp"
            inputMode="numeric"
            placeholder="ММ/ГГ"
            value={expiry}
            onChange={maskedSetter(maskExpiry, setExpiry)}
            required
            style={{ padding: '0.45rem', fontFamily: 'monospace' }}
            data-testid="pay-exp"
          />
        </p>
        <button
          type="submit"
          disabled={card.replace(/\D/g, '').length !== 16 || !/^\d{2}\/\d{2}$/.test(expiry)}
          style={{
            padding: '0.5rem 1rem',
            borderRadius: 6,
            border: 'none',
            background: '#7c3aed',
            color: '#fff',
            fontWeight: 600,
            cursor: 'pointer',
          }}
          data-testid="pay-submit"
        >
          Оплатить 125 ₽
        </button>
      </form>
    </div>
  )
}
