import { useEffect, useState } from 'react'
import { api, type ChaosFlags } from '../../api/client'

const DEFAULT_FLAGS: ChaosFlags = {
  apiDelayMs: 0,
  apiErrorRate: 0,
  vanishMs: 0,
  movingButtons: false,
  rerenderMs: 0,
  slowImages: false,
}

const FLAG_META: { key: keyof ChaosFlags; label: string; description: string }[] = [
  {
    key: 'apiDelayMs',
    label: 'Задержка API, мс',
    description: 'Каждый REST-запрос задерживается на случайное 0..N мс',
  },
  {
    key: 'apiErrorRate',
    label: 'Доля случайных 500',
    description: '0–1: часть запросов отвечает 500 (по умолчанию 0)',
  },
  {
    key: 'vanishMs',
    label: 'Исчезновение, мс',
    description: 'Элементы data-chaos="vanish" скрываются через N мс',
  },
  {
    key: 'movingButtons',
    label: 'Убегающие кнопки',
    description: 'Кнопки смещаются при наведении курсора',
  },
  {
    key: 'rerenderMs',
    label: 'Re-render, мс',
    description: 'Принудительный ре-рендер страницы каждые N мс',
  },
  { key: 'slowImages', label: 'Медленные картинки', description: 'SVG-товары грузятся ~900 мс' },
]

export function ChaosPage() {
  const [flags, setFlags] = useState<ChaosFlags>(DEFAULT_FLAGS)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    api
      .get<ChaosFlags>('/api/test/flags')
      .then(setFlags)
      .catch(() => {})
  }, [])

  const save = async () => {
    const clean: ChaosFlags = {
      ...flags,
      apiErrorRate: Math.min(1, Math.max(0, flags.apiErrorRate)),
    }
    const applied = await api.post<ChaosFlags>('/api/test/flags', clean)
    setFlags(applied)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const reset = async () => {
    const applied = await api.post<ChaosFlags>('/api/test/flags', DEFAULT_FLAGS)
    setFlags(applied)
  }

  const setNum = (key: keyof ChaosFlags) => (e: { target: { value: string } }) =>
    setFlags((f) => ({ ...f, [key]: Number(e.target.value) || 0 }))

  return (
    <div className="page page--narrow">
      <h1>🌀 Chaos-режим</h1>
      <p className="muted">
        Обычный режим полностью детерминирован: ни задержек, ни рандома. Вся нестабильность — только
        здесь, флагами. Те же флаги можно выставить через <code>POST /api/test/flags</code>.
      </p>

      <div className="card card--pad-lg" data-testid="chaos-controls">
        {FLAG_META.map(({ key, label, description }) => {
          if (key === 'movingButtons' || key === 'slowImages') {
            return (
              <div key={key} className="checkbox-row" style={{ marginBottom: '0.9rem' }}>
                <input
                  id={`flag-${key}`}
                  type="checkbox"
                  checked={Boolean(flags[key])}
                  onChange={(e) => setFlags((f) => ({ ...f, [key]: e.target.checked }))}
                  data-testid={`flag-${key}`}
                />
                <label htmlFor={`flag-${key}`}>
                  <strong>{label}</strong>
                  <span className="hint" style={{ display: 'block' }}>
                    {description}
                  </span>
                </label>
              </div>
            )
          }
          return (
            <div key={key} className="field">
              <label htmlFor={`flag-${key}`}>
                {label} <span className="faint">(сейчас: {flags[key]})</span>
              </label>
              <input
                id={`flag-${key}`}
                type="number"
                className="input"
                min={0}
                step={key === 'apiErrorRate' ? 0.1 : 100}
                value={flags[key]}
                onChange={setNum(key)}
                data-testid={`flag-${key}`}
              />
              <span className="hint">{description}</span>
            </div>
          )
        })}
        <div className="row">
          <button
            type="button"
            className="btn btn--primary"
            onClick={() => void save()}
            data-testid="flags-save"
          >
            Применить флаги
          </button>
          <button type="button" className="btn btn--outline" onClick={() => void reset()}>
            Всё выключить
          </button>
          {saved ? (
            <span className="badge badge--success" role="status">
              сохранено ✅
            </span>
          ) : null}
        </div>
      </div>

      <section
        className="card card--pad-lg"
        style={{ marginTop: '1rem' }}
        data-testid="chaos-playground"
      >
        <h2>Полигон</h2>
        <p className="muted">
          Кнопки ниже помечены <code>data-chaos="vanish"</code> — при включённом vanishMs они
          исчезнут. Обычные кнопки начнут убегать при movingButtons.
        </p>
        <div className="row">
          <button
            type="button"
            className="btn btn--outline"
            data-chaos="vanish"
            data-testid="chaos-vanish-1"
          >
            Исчезну через vanishMs (1)
          </button>
          <button
            type="button"
            className="btn btn--outline"
            data-chaos="vanish"
            data-testid="chaos-vanish-2"
          >
            Исчезну (2)
          </button>
          <button type="button" className="btn btn--primary" data-testid="chaos-normal">
            Обычная кнопка
          </button>
          <button type="button" className="btn btn--outline" data-testid="chaos-normal-2">
            И ещё одна
          </button>
        </div>
        <p className="hint" style={{ marginTop: '1rem' }}>
          API из консоли:{' '}
          <code>curl -X POST localhost:3000/api/test/flags -d {'{"apiDelayMs":500}'}</code>
        </p>
      </section>
    </div>
  )
}
