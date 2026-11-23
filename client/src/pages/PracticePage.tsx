import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api/client'
import { TASK_SECTIONS, type Level } from '../data/tasks'

const LEVEL_CLASS: Record<Level, string> = {
  '🟢': 'level-chip--green',
  '🟡': 'level-chip--yellow',
  '🔴': 'level-chip--red',
}

export function PracticePage() {
  const [done, setDone] = useState<Record<string, boolean>>({})
  const [filter, setFilter] = useState<'all' | Level>('all')

  useEffect(() => {
    api
      .get<{ doneCount: number; tasks: Record<string, boolean> }>('/api/practice/progress')
      .then((p) => setDone(p.tasks))
      .catch(() => {})
  }, [])

  const toggle = async (id: string) => {
    const next = !done[id]
    setDone((prev) => ({ ...prev, [id]: next }))
    try {
      const res = await api.post<{ tasks: Record<string, boolean> }>('/api/practice/progress', {
        id,
        done: next,
      })
      setDone(res.tasks)
    } catch {
      setDone((prev) => ({ ...prev, [id]: !next }))
    }
  }

  const total = useMemo(() => TASK_SECTIONS.reduce((sum, s) => sum + s.tasks.length, 0), [])
  const doneCount = Object.values(done).filter(Boolean).length
  const visibleSections = useMemo(
    () =>
      TASK_SECTIONS.map((s) => ({
        ...s,
        tasks: filter === 'all' ? s.tasks : s.tasks.filter((t) => t.level === filter),
      })).filter((s) => s.tasks.length > 0),
    [filter],
  )

  return (
    <div className="page">
      <div className="practice-layout">
        <aside className="practice-side">
          <div className="card" style={{ padding: '0.9rem' }}>
            <h2 style={{ fontSize: '1rem', marginTop: 0 }}>Разделы</h2>
            <nav aria-label="Разделы практики">
              {TASK_SECTIONS.map((s) => (
                <a key={s.id} href={`#section-${s.id}`}>
                  {s.title}
                </a>
              ))}
              <a href="/practice/chaos">🌀 Chaos-режим</a>
            </nav>
            <hr
              style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '0.75rem 0' }}
            />
            <p className="muted" style={{ margin: 0, fontSize: '0.85rem' }}>
              Прогресс:{' '}
              <strong data-testid="progress-count">
                {doneCount}/{total}
              </strong>
            </p>
            <div
              role="progressbar"
              aria-valuenow={doneCount}
              aria-valuemin={0}
              aria-valuemax={total}
              style={{
                height: '8px',
                background: 'var(--bg-sunken)',
                borderRadius: 999,
                marginTop: '0.4rem',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  width: `${total ? Math.round((doneCount / total) * 100) : 0}%`,
                  height: '100%',
                  background: 'var(--accent)',
                  transition: 'width 0.2s ease',
                }}
              />
            </div>
          </div>
        </aside>

        <div>
          <h1>Практика</h1>
          <p className="muted">
            {total} заданий с подсказками-спойлерами. Отмечайте выполненное — прогресс хранится на
            сервере (<code>GET /api/practice/progress</code>). Сброс данных кнопкой «Сбросить
            данные» обнуляет и прогресс.
          </p>

          <div
            className="row"
            role="group"
            aria-label="Фильтр по уровню"
            style={{ marginBottom: '1rem' }}
          >
            {(['all', '🟢', '🟡', '🔴'] as const).map((f) => (
              <button
                key={f}
                type="button"
                className={`btn btn--sm ${filter === f ? 'btn--primary' : 'btn--outline'}`}
                aria-pressed={filter === f}
                onClick={() => setFilter(f)}
                data-testid={`filter-${f === 'all' ? 'all' : f}`}
              >
                {f === 'all' ? 'Все' : `${f} уровень`}
              </button>
            ))}
          </div>

          {visibleSections.map((section) => (
            <section key={section.id} id={`section-${section.id}`} style={{ marginBottom: '2rem' }}>
              <h2>{section.title}</h2>
              {section.tasks.map((task) => {
                const isDone = Boolean(done[task.id])
                return (
                  <article
                    key={task.id}
                    className="card"
                    style={{ marginBottom: '0.6rem', padding: '0.8rem 1rem' }}
                    data-testid={`task-${task.id}`}
                  >
                    <div className="row" style={{ justifyContent: 'space-between' }}>
                      <span className="row" style={{ gap: '0.5rem' }}>
                        <span
                          className={`level-chip ${LEVEL_CLASS[task.level]}`}
                          aria-label={`Уровень ${task.level}`}
                        >
                          {task.level}
                        </span>
                        <span
                          style={
                            isDone ? { textDecoration: 'line-through', opacity: 0.65 } : undefined
                          }
                        >
                          {task.title}
                        </span>
                      </span>
                      <span className="row" style={{ gap: '0.6rem' }}>
                        <Link to={task.path} style={{ fontSize: '0.84rem', whiteSpace: 'nowrap' }}>
                          {task.path} →
                        </Link>
                        <label
                          className="row"
                          style={{ gap: '0.3rem', fontSize: '0.84rem', cursor: 'pointer' }}
                        >
                          <input
                            type="checkbox"
                            checked={isDone}
                            onChange={() => void toggle(task.id)}
                            data-testid={`done-${task.id}`}
                          />
                          ✅ выполнено
                        </label>
                      </span>
                    </div>
                    <details className="spoiler">
                      <summary>Подсказка: {task.hint}</summary>
                      <pre
                        className="mono"
                        style={{ margin: '0.5rem 0 0', whiteSpace: 'pre-wrap', fontSize: '0.8rem' }}
                      >
                        {task.spoiler}
                      </pre>
                    </details>
                  </article>
                )
              })}
            </section>
          ))}
        </div>
      </div>
    </div>
  )
}
