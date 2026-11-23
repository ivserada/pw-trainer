import { useEffect, useState } from 'react'
import '../../components/lit/register'

/**
 * 🔴 /practice/shadow — Shadow DOM open (vanilla + Lit) и closed (Lit), slots.
 */
export function ShadowPage() {
  const [log, setLog] = useState<string[]>([])

  useEffect(() => {
    const add = (text: string) => setLog((prev) => [...prev.slice(-5), text])
    const onCounter = (e: Event) =>
      add(`counter-change: ${(e as CustomEvent<{ count: number }>).detail.count}`)
    const onPanel = () => add('panel-action из closed-панели')
    const onVanilla = () => add('vanilla-click из open-карточки')
    const el = document.getElementById('shadow-demos')!
    el.addEventListener('counter-change', onCounter)
    el.addEventListener('panel-action', onPanel)
    el.addEventListener('vanilla-click', onVanilla)
    return () => {
      el.removeEventListener('counter-change', onCounter)
      el.removeEventListener('panel-action', onPanel)
      el.removeEventListener('vanilla-click', onVanilla)
    }
  }, [])

  return (
    <div className="page page--narrow">
      <h1>🔴 Shadow DOM</h1>
      <p className="muted">
        Open Shadow (vanilla и Lit) пробивается через <code>locator.shadowRoot()</code>/пирсинг,
        closed — нет: с ним работают только события и light DOM (slots).
      </p>

      <div id="shadow-demos" className="stack">
        <section className="card card--pad-lg" data-testid="shadow-open-lit">
          <h2>Lit, open shadow</h2>
          <lit-open-counter />
          <p className="muted" style={{ marginTop: '0.5rem' }}>
            Внутри: <code>button</code> и <code>span</code>, оба в open Shadow.
          </p>
        </section>

        <section className="card card--pad-lg" data-testid="shadow-closed-lit">
          <h2>Lit, closed shadow</h2>
          <lit-closed-panel>
            <span slot="title">Закрытая панель</span>
            Light DOM контент, попадающий в дефолтный слот.
          </lit-closed-panel>
        </section>

        <section className="card card--pad-lg" data-testid="shadow-open-vanilla">
          <h2>Vanilla web component, open shadow</h2>
          <vanilla-shadow-card heading="Карточка vanilla">
            <span slot="body">
              Контент из light DOM в слоте <code>body</code>.
            </span>
          </vanilla-shadow-card>
        </section>

        <section className="card card--pad-lg" data-testid="shadow-log">
          <h2>Лог событий</h2>
          <p className="muted" style={{ marginTop: 0 }}>
            События с <code>composed: true</code> пробиваются сквозь Shadow границу:
          </p>
          <ul data-testid="event-log" style={{ minHeight: '1.5rem' }}>
            {log.map((l, i) => (
              <li key={i} className="mono" style={{ fontSize: '0.85rem' }}>
                {l}
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  )
}
