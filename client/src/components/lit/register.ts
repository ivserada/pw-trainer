import { LitElement, html } from 'lit'

/**
 * Lit-компоненты с Shadow DOM (open и closed) + slots.
 * Используются на /practice/shadow.
 */

function defineOnce(name: string, ctor: CustomElementConstructor): void {
  if (!customElements.get(name)) customElements.define(name, ctor)
}

class LitOpenCounter extends LitElement {
  static properties = { count: { state: true } }
  // useDefineForClassFields: true в tsconfig — поле объявляем через declare,
  // иначе классовое поле «затенит» реактивный акцессор Lit.
  declare private count: number

  constructor() {
    super()
    this.count = 0
  }

  render() {
    return html`
      <button
        part="counter-button"
        @click=${() => {
          this.count += 1
          this.dispatchEvent(
            new CustomEvent('counter-change', {
              detail: { count: this.count },
              bubbles: true,
              composed: true,
            }),
          )
        }}
      >
        Счётчик внутри open Shadow: ${this.count}
      </button>
      <span part="counter-value" style="margin-left:.5rem">${this.count}</span>
    `
  }
}
defineOnce('lit-open-counter', LitOpenCounter)

class LitClosedPanel extends LitElement {
  // Закрытый Shadow DOM: содержимое недоступно извне (в том числе из Playwright).
  createRenderRoot(): HTMLElement | ShadowRoot {
    return this.attachShadow({ mode: 'closed' })
  }

  render() {
    return html`
      <style>
        :host {
          display: block;
          border: 1px dashed #999;
          border-radius: 8px;
          padding: 1rem;
        }
        button {
          font: inherit;
          padding: 0.4rem 0.9rem;
          border-radius: 6px;
          border: 1px solid #666;
          background: #f5f5f5;
          cursor: pointer;
        }
      </style>
      <h3 style="margin:0 0 .5rem"><slot name="title">Панель</slot></h3>
      <p style="margin:0 0 .5rem">Этот текст внутри <strong>closed</strong> Shadow DOM.</p>
      <button
        @click=${() => this.dispatchEvent(new CustomEvent('panel-action', { bubbles: true, composed: true }))}
      >
        Кнопка из closed-панели
      </button>
      <p style="margin:.5rem 0 0;font-size:.85em;opacity:.7"><slot></slot></p>
    `
  }
}
defineOnce('lit-closed-panel', LitClosedPanel)

class VanillaShadowCard extends HTMLElement {
  constructor() {
    super()
    const root = this.attachShadow({ mode: 'open' })
    root.innerHTML = `
      <style>
        .card { border: 1px solid #bbb; border-radius: 8px; padding: 1rem; font-family: system-ui; }
        .title { font-weight: 700; margin: 0 0 .4rem; }
        button { padding: .35rem .8rem; border-radius: 6px; border: 1px solid #555; background: #fff; cursor: pointer; }
      </style>
      <div class="card">
        <p class="title"></p>
        <slot name="body">(слот body пуст)</slot>
        <p><button type="button">Vanilla-кнопка в open Shadow</button></p>
      </div>
    `
    const titleSlot = root.querySelector('.title')
    if (titleSlot) titleSlot.textContent = this.getAttribute('heading') ?? 'Vanilla Shadow Card'
    const button = root.querySelector('button')
    button?.addEventListener('click', () => {
      this.dispatchEvent(new CustomEvent('vanilla-click', { bubbles: true, composed: true }))
    })
  }
}
defineOnce('vanilla-shadow-card', VanillaShadowCard)

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace React {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace JSX {
      interface IntrinsicElements {
        'lit-open-counter': Record<string, never>
        'lit-closed-panel': React.PropsWithChildren<{ className?: string }>
        'vanilla-shadow-card': React.PropsWithChildren<{ heading?: string; className?: string }>
      }
    }
  }
}
