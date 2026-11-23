import { useEffect, useState } from 'react'

/**
 * 🔴 /practice/iframes — вложенные iframe (включая srcdoc) и «платёжная» форма в iframe.
 */
export function IframesPage() {
  const [paymentResult, setPaymentResult] = useState<string | null>(null)

  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (e.data?.type === 'payment-success') {
        setPaymentResult(`Оплата подтверждена: ${e.data.amount ?? ''} ₽`)
      }
    }
    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [])

  return (
    <div className="page">
      <h1>🔴 Iframe</h1>
      <p className="muted">
        Три сценария: обычный iframe с вложенным iframe, <code>srcdoc</code> с iframe внутри и
        платёжная форма, которая шлёт результат через <code>postMessage</code>.
      </p>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '1.5rem',
          alignItems: 'start',
        }}
      >
        <section className="card card--pad-lg" data-testid="iframe-nested-section">
          <h2>Обычный iframe → страница</h2>
          <iframe
            title="Карточка товара"
            src="/product/p1"
            style={{
              width: '100%',
              height: '360px',
              border: '1px solid var(--border)',
              borderRadius: 8,
            }}
            data-testid="frame-product"
          />
        </section>

        <section className="card card--pad-lg" data-testid="iframe-srcdoc-section">
          <h2>srcdoc с вложенным iframe (2 уровня)</h2>
          <iframe
            title="srcdoc контейнер"
            srcDoc={`<!doctype html><html><body style="font-family:system-ui;margin:0;padding:8px">
<h3 style="margin:0 0 6px">Уровень 1: srcdoc</h3>
<iframe title="Вложенный список" src="/practice/links" style="width:100%;height:230px;border:1px solid #bbb;border-radius:6px"></iframe>
</body></html>`}
            style={{
              width: '100%',
              height: '360px',
              border: '1px solid var(--border)',
              borderRadius: 8,
            }}
            data-testid="frame-srcdoc"
          />
        </section>

        <section className="card card--pad-lg" data-testid="iframe-payment-section">
          <h2>Платёжная форма в iframe</h2>
          <iframe
            title="Платёжная форма"
            src="/practice/payment-frame"
            style={{
              width: '100%',
              height: '360px',
              border: '1px solid var(--border)',
              borderRadius: 8,
            }}
            data-testid="frame-payment"
          />
          <p aria-live="polite" data-testid="payment-result" style={{ marginTop: '0.75rem' }}>
            {paymentResult ?? <span className="muted">Ожидание оплаты…</span>}
          </p>
        </section>
      </div>
    </div>
  )
}
