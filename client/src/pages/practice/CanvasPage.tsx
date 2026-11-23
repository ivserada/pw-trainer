import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'

/**
 * 🔴 /practice/canvas — рисование на canvas и интерактивный SVG.
 */
const BARS = [
  { label: 'Пн', value: 12 },
  { label: 'Вт', value: 19 },
  { label: 'Ср', value: 8 },
  { label: 'Чт', value: 15 },
  { label: 'Пт', value: 23 },
  { label: 'Сб', value: 17 },
]

export function CanvasPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const drawing = useRef(false)
  const [color, setColor] = useState('#7c3aed')
  const [strokes, setStrokes] = useState(0)
  const [picked, setPicked] = useState<string | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.strokeStyle = '#a8a29e'
    ctx.strokeRect(0.5, 0.5, canvas.width - 1, canvas.height - 1)
  }, [])

  const pos = (e: ReactPointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current!
    const rect = canvas.getBoundingClientRect()
    return {
      x: ((e.clientX - rect.left) / rect.width) * canvas.width,
      y: ((e.clientY - rect.top) / rect.height) * canvas.height,
    }
  }

  const start = (e: ReactPointerEvent<HTMLCanvasElement>) => {
    drawing.current = true
    const ctx = canvasRef.current?.getContext('2d')
    if (!ctx) return
    const { x, y } = pos(e)
    ctx.strokeStyle = color
    ctx.lineWidth = 3
    ctx.lineCap = 'round'
    ctx.beginPath()
    ctx.moveTo(x, y)
  }
  const move = (e: ReactPointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current) return
    const ctx = canvasRef.current?.getContext('2d')
    if (!ctx) return
    const { x, y } = pos(e)
    ctx.lineTo(x, y)
    ctx.stroke()
  }
  const stop = () => {
    if (drawing.current) setStrokes((n) => n + 1)
    drawing.current = false
  }

  const clear = () => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.strokeStyle = '#a8a29e'
    ctx.strokeRect(0.5, 0.5, canvas.width - 1, canvas.height - 1)
    setStrokes(0)
  }

  return (
    <div className="page page--narrow">
      <h1>🔴 Canvas и SVG</h1>
      <p className="muted">
        Canvas не имеет DOM-узлов внутри — взаимодействие только через координаты указателя. SVG,
        наоборот, полностью инспектируем.
      </p>

      <section className="card card--pad-lg" data-testid="canvas-section">
        <h2>Canvas: рисовалка</h2>
        <div className="row" style={{ marginBottom: '0.6rem' }}>
          <label htmlFor="pen-color" className="muted">
            Цвет пера
          </label>
          <input
            id="pen-color"
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            data-testid="pen-color"
          />
          <button
            type="button"
            className="btn btn--outline btn--sm"
            onClick={clear}
            data-testid="canvas-clear"
          >
            Очистить
          </button>
          <span className="badge" data-testid="stroke-count">
            Линий: {strokes}
          </span>
        </div>
        <canvas
          ref={canvasRef}
          width={520}
          height={260}
          role="img"
          aria-label="Холст для рисования"
          style={{
            width: '100%',
            height: 'auto',
            borderRadius: 8,
            touchAction: 'none',
            cursor: 'crosshair',
          }}
          onPointerDown={start}
          onPointerMove={move}
          onPointerUp={stop}
          onPointerLeave={stop}
          data-testid="drawing-canvas"
        />
      </section>

      <section
        className="card card--pad-lg"
        style={{ marginTop: '1rem' }}
        data-testid="svg-section"
      >
        <h2>SVG: график продаж</h2>
        <svg
          viewBox="0 0 360 180"
          width="360"
          height="180"
          role="img"
          aria-label="Столбчатая диаграмма продаж по дням"
          data-testid="sales-chart"
        >
          {BARS.map((b, i) => {
            const height = b.value * 6
            const x = 20 + i * 55
            return (
              <g key={b.label}>
                <rect
                  x={x}
                  y={160 - height}
                  width="34"
                  height={height}
                  rx="4"
                  fill={picked === b.label ? '#7c3aed' : '#c4b5fd'}
                  data-bar={b.label}
                  style={{ cursor: 'pointer' }}
                  onClick={() => setPicked(b.label)}
                />
                <text x={x + 17} y={175} textAnchor="middle" fontSize="11" fill="currentColor">
                  {b.label}
                </text>
                <text
                  x={x + 17}
                  y={152 - height}
                  textAnchor="middle"
                  fontSize="11"
                  fill="currentColor"
                >
                  {b.value}
                </text>
              </g>
            )
          })}
        </svg>
        <p aria-live="polite" data-testid="svg-picked">
          {picked ? (
            <>
              Выбран день <strong>{picked}</strong>: {BARS.find((b) => b.label === picked)?.value}{' '}
              заказов
            </>
          ) : (
            <span className="muted">Кликните по столбцу</span>
          )}
        </p>
      </section>
    </div>
  )
}
