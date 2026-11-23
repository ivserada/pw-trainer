import { useEffect, useRef, useState } from 'react'

/**
 * 🔴 /practice/realtime — WebSocket-чат, SSE-лента, live-остатки.
 */
interface ChatMessage {
  id: string
  author: string
  text: string
  at: string
}

interface FeedEvent {
  id: string
  kind: string
  text: string
  at: string
}

export function RealtimePage() {
  return (
    <div className="page">
      <h1>🔴 Realtime: WebSocket и SSE</h1>
      <p className="muted">
        Чат работает через <code>/ws/chat</code>, лента и остатки — через SSE (
        <code>/api/feed</code>, <code>/api/stocks/stream</code>).
      </p>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '1.5rem',
          alignItems: 'start',
        }}
      >
        <ChatPanel />
        <FeedPanel />
        <StockPanel />
      </div>
    </div>
  )
}

function ChatPanel() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [author, setAuthor] = useState('')
  const [text, setText] = useState('')
  const [connected, setConnected] = useState(false)
  const wsRef = useRef<WebSocket | null>(null)

  useEffect(() => {
    const ws = new WebSocket(
      `${location.protocol === 'https:' ? 'wss' : 'ws'}://${location.host}/ws/chat`,
    )
    wsRef.current = ws
    ws.onopen = () => setConnected(true)
    ws.onclose = () => setConnected(false)
    ws.onmessage = (e) => {
      const data = JSON.parse(e.data as string) as
        { type: 'history'; messages: ChatMessage[] } | { type: 'message'; message: ChatMessage }
      if (data.type === 'history') setMessages(data.messages)
      else setMessages((prev) => [...prev.slice(-49), data.message])
    }
    return () => ws.close()
  }, [])

  const send = () => {
    if (!text.trim()) return
    wsRef.current?.send(JSON.stringify({ author: author || 'Гость', text }))
    setText('')
  }

  return (
    <section className="card card--pad-lg" aria-label="Чат" data-testid="chat-panel">
      <h2>
        Чат (WebSocket){' '}
        <span
          className={`badge ${connected ? 'badge--success' : 'badge--danger'}`}
          data-testid="ws-status"
        >
          {connected ? 'online' : 'offline'}
        </span>
      </h2>
      <div
        role="log"
        aria-label="Сообщения чата"
        style={{
          height: '260px',
          overflowY: 'auto',
          border: '1px solid var(--border)',
          borderRadius: 8,
          padding: '0.6rem',
          marginBottom: '0.75rem',
        }}
        data-testid="chat-log"
      >
        {messages.map((m) => (
          <p key={m.id} style={{ margin: '0 0 0.4rem' }} data-testid="chat-message">
            <strong>{m.author}:</strong> {m.text}
          </p>
        ))}
      </div>
      <div className="field">
        <label htmlFor="chat-author">Имя</label>
        <input
          id="chat-author"
          className="input"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          placeholder="Гость"
          data-testid="chat-author"
        />
      </div>
      <div className="field">
        <label htmlFor="chat-text">Сообщение</label>
        <input
          id="chat-text"
          className="input"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && send()}
          data-testid="chat-text"
        />
      </div>
      <button
        type="button"
        className="btn btn--primary"
        onClick={send}
        disabled={!connected}
        data-testid="chat-send"
      >
        Отправить
      </button>
    </section>
  )
}

function FeedPanel() {
  const [events, setEvents] = useState<FeedEvent[]>([])
  const [live, setLive] = useState(false)

  useEffect(() => {
    const source = new EventSource('/api/feed')
    source.onopen = () => setLive(true)
    source.onerror = () => setLive(false)
    source.addEventListener('message', (e) => {
      const event = JSON.parse(e.data as string) as FeedEvent
      setEvents((prev) => [...prev.slice(-14), event])
    })
    return () => source.close()
  }, [])

  return (
    <section className="card card--pad-lg" aria-label="Лента событий" data-testid="feed-panel">
      <h2>
        Лента (SSE){' '}
        <span
          className={`badge ${live ? 'badge--success' : 'badge--danger'}`}
          data-testid="feed-status"
        >
          {live ? 'live' : 'off'}
        </span>
      </h2>
      <p className="muted" style={{ marginTop: 0 }}>
        Оформите заказ в другой вкладке — событие появится здесь.
      </p>
      <ul style={{ listStyle: 'none', padding: 0, minHeight: '220px' }} data-testid="feed-list">
        {[...events].reverse().map((e) => (
          <li
            key={e.id}
            style={{ padding: '0.3rem 0', borderBottom: '1px solid var(--border)' }}
            data-testid="feed-event"
          >
            <span className="badge">{e.kind}</span> {e.text}
            <span className="faint mono" style={{ marginLeft: '0.4rem' }}>
              {e.at.slice(11, 19)}
            </span>
          </li>
        ))}
      </ul>
    </section>
  )
}

function StockPanel() {
  const [productId, setProductId] = useState('p1')
  const [stock, setStock] = useState<number | null>(null)
  const [updates, setUpdates] = useState(0)

  useEffect(() => {
    setStock(null)
    const source = new EventSource(`/api/stocks/stream?productId=${productId}`)
    const onStock = (e: MessageEvent) => {
      const data = JSON.parse(e.data as string) as { stock: number }
      setStock(data.stock)
      setUpdates((n) => n + 1)
    }
    source.addEventListener('stock', onStock as EventListener)
    return () => source.close()
  }, [productId])

  return (
    <section className="card card--pad-lg" aria-label="Live-остатки" data-testid="stock-panel">
      <h2>Остатки (SSE)</h2>
      <div className="field">
        <label htmlFor="stock-product">Товар</label>
        <select
          id="stock-product"
          className="select"
          value={productId}
          onChange={(e) => setProductId(e.target.value)}
          data-testid="stock-product"
        >
          {['p1', 'p2', 'p3', 'p4'].map((id) => (
            <option key={id} value={id}>
              {id}
            </option>
          ))}
        </select>
      </div>
      <p
        style={{ fontSize: '2.2rem', fontWeight: 800, margin: '0.5rem 0' }}
        data-testid="stock-value"
        aria-live="polite"
      >
        {stock ?? '—'}
      </p>
      <p className="muted mono" data-testid="stock-updates">
        обновлений: {updates}
      </p>
    </section>
  )
}
