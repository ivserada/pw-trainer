import { useRef, useState, type DragEvent, type PointerEvent as ReactPointerEvent } from 'react'

/**
 * 🔴 /practice/dnd — HTML5 drag&drop (канбан) и pointer-based перетаскивание.
 */
interface Card {
  id: string
  title: string
  col: 'new' | 'progress' | 'done'
}

const INITIAL: Card[] = [
  { id: 't1', title: 'Написать локаторы', col: 'new' },
  { id: 't2', title: 'Настроить CI', col: 'new' },
  { id: 't3', title: 'Покрыть тестами корзину', col: 'progress' },
  { id: 't4', title: 'Починить флаки', col: 'progress' },
  { id: 't5', title: 'Обновить README', col: 'done' },
]

const COLUMNS: { id: Card['col']; label: string }[] = [
  { id: 'new', label: 'Новые' },
  { id: 'progress', label: 'В работе' },
  { id: 'done', label: 'Готово' },
]

export function DndPage() {
  const [cards, setCards] = useState<Card[]>(INITIAL)
  const draggedId = useRef<string | null>(null)

  const onDrop = (col: Card['col']) => (e: DragEvent) => {
    e.preventDefault()
    const id = e.dataTransfer.getData('text/plain') || draggedId.current
    if (!id) return
    setCards((prev) => prev.map((c) => (c.id === id ? { ...c, col } : c)))
    draggedId.current = null
  }

  const allowDrop = (e: DragEvent) => e.preventDefault()

  /* ---------- Pointer-based drag ---------- */
  const [pointerPos, setPointerPos] = useState(20)
  const [pointerZone, setPointerZone] = useState<'left' | 'right' | null>(null)
  const dragState = useRef<{ startX: number; startPos: number; width: number } | null>(null)
  const trackRef = useRef<HTMLDivElement>(null)

  const onPointerDown = (e: ReactPointerEvent<HTMLButtonElement>) => {
    const track = trackRef.current
    if (!track) return
    dragState.current = { startX: e.clientX, startPos: pointerPos, width: track.clientWidth }
    e.currentTarget.setPointerCapture(e.pointerId)
  }
  const onPointerMove = (e: ReactPointerEvent<HTMLButtonElement>) => {
    const s = dragState.current
    const track = trackRef.current
    if (!s || !track) return
    const knobWidth = 56
    const next = Math.min(s.width - knobWidth, Math.max(0, s.startPos + (e.clientX - s.startX)))
    setPointerPos(next)
  }
  const onPointerUp = () => {
    const track = trackRef.current
    if (track && dragState.current) {
      const knobWidth = 56
      setPointerZone(pointerPos + knobWidth / 2 < track.clientWidth / 2 ? 'left' : 'right')
    }
    dragState.current = null
  }

  return (
    <div className="page">
      <h1>🔴 Drag & Drop</h1>
      <p className="muted">
        Слева — классический HTML5 DnD (dataTransfer), справа — перетаскивание указателем (pointer
        events).
      </p>

      <section data-testid="html5-dnd">
        <h2>HTML5 канбан</h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1rem',
          }}
        >
          {COLUMNS.map((col) => (
            <div
              key={col.id}
              onDrop={onDrop(col.id)}
              onDragOver={allowDrop}
              className="card"
              style={{ minHeight: '220px', background: 'var(--bg-sunken)' }}
              data-testid={`column-${col.id}`}
            >
              <h3 style={{ marginTop: 0 }}>
                {col.label}{' '}
                <span className="badge">{cards.filter((c) => c.col === col.id).length}</span>
              </h3>
              {cards
                .filter((c) => c.col === col.id)
                .map((c) => (
                  <div
                    key={c.id}
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData('text/plain', c.id)
                      draggedId.current = c.id
                    }}
                    className="card"
                    style={{ padding: '0.6rem 0.8rem', marginBottom: '0.5rem', cursor: 'grab' }}
                    data-testid={`dnd-card-${c.id}`}
                  >
                    {c.title}
                  </div>
                ))}
            </div>
          ))}
        </div>
      </section>

      <section style={{ marginTop: '2rem' }} data-testid="pointer-dnd">
        <h2>Pointer-based drag</h2>
        <p className="muted">Потяните ползунок в левую или правую зону и отпустите.</p>
        <div
          ref={trackRef}
          style={{
            position: 'relative',
            height: '72px',
            borderRadius: '10px',
            border: '1px solid var(--border-strong)',
            background: 'var(--bg-sunken)',
            display: 'flex',
          }}
          data-testid="pointer-track"
        >
          <div
            style={{ flex: 1, display: 'grid', placeItems: 'center', color: 'var(--text-muted)' }}
            data-testid="zone-left"
          >
            Зона «А»
            {pointerZone === 'left' ? <span className="badge badge--success"> ✓</span> : null}
          </div>
          <div
            style={{ flex: 1, display: 'grid', placeItems: 'center', color: 'var(--text-muted)' }}
            data-testid="zone-right"
          >
            Зона «Б»
            {pointerZone === 'right' ? <span className="badge badge--success"> ✓</span> : null}
          </div>
          <button
            type="button"
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            style={{
              position: 'absolute',
              top: '8px',
              left: `${pointerPos}px`,
              width: '56px',
              height: '56px',
              borderRadius: '8px',
              border: 'none',
              background: 'var(--accent)',
              color: 'var(--accent-contrast)',
              fontWeight: 700,
              cursor: 'grab',
              touchAction: 'none',
            }}
            data-testid="pointer-knob"
          >
            Тяни
          </button>
        </div>
        <p aria-live="polite" data-testid="pointer-result">
          Результат:{' '}
          <strong>{pointerZone ? `Зона «${pointerZone === 'left' ? 'А' : 'Б'}»` : '—'}</strong>
        </p>
      </section>
    </div>
  )
}
