import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { TASK_SECTIONS, type Level } from '../data/tasks'
import { useI18n } from '../i18n'

const PROGRESS_KEY = 'practice:done'

function readProgress(): Record<string, boolean> {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw)
    if (parsed && typeof parsed === 'object') return parsed as Record<string, boolean>
    return {}
  } catch {
    return {}
  }
}

function writeProgress(tasks: Record<string, boolean>): void {
  try {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(tasks))
  } catch {
    /* localStorage может быть недоступен (private mode) — прогресс просто не сохранится */
  }
}

const LEVEL_CLASS: Record<Level, string> = {
  '🟢': 'level-chip--green',
  '🟡': 'level-chip--yellow',
  '🔴': 'level-chip--red',
}

export function PracticePage() {
  const { lang, t } = useI18n()
  const [done, setDone] = useState<Record<string, boolean>>(() => readProgress())
  const [filter, setFilter] = useState<'all' | Level>('all')

  useEffect(() => {
    const onReset = () => {
      try {
        localStorage.removeItem(PROGRESS_KEY)
      } catch {
        /* ignore */
      }
      setDone({})
    }
    window.addEventListener('pw:reset', onReset)
    return () => window.removeEventListener('pw:reset', onReset)
  }, [])

  const toggle = (id: string) => {
    setDone((prev) => {
      const next = { ...prev, [id]: !prev[id] }
      writeProgress(next)
      return next
    })
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
            <h2 style={{ fontSize: '1rem', marginTop: 0 }}>{t('practice.sections')}</h2>
            <nav aria-label={t('practice.navLabel')}>
              {TASK_SECTIONS.map((s) => (
                <a key={s.id} href={`#section-${s.id}`}>
                  {s.title[lang]}
                </a>
              ))}
              <a href="/practice/chaos">{t('practice.chaosLink')}</a>
            </nav>
            <hr
              style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '0.75rem 0' }}
            />
            <p className="muted" style={{ margin: 0, fontSize: '0.85rem' }}>
              {t('practice.progress')}{' '}
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
          <h1>{t('practice.title')}</h1>
          <p className="muted">{t('practice.intro', { total })}</p>

          <div
            className="row"
            role="group"
            aria-label={t('practice.filterLabel')}
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
                {f === 'all' ? t('practice.filterAll') : t('practice.filterLevel', { emoji: f })}
              </button>
            ))}
          </div>

          {visibleSections.map((section) => (
            <section key={section.id} id={`section-${section.id}`} style={{ marginBottom: '2rem' }}>
              <h2>{section.title[lang]}</h2>
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
                          aria-label={t('practice.levelAria', { level: task.level })}
                        >
                          {task.level}
                        </span>
                        <span
                          style={
                            isDone ? { textDecoration: 'line-through', opacity: 0.65 } : undefined
                          }
                        >
                          {task.title[lang]}
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
                            onChange={() => toggle(task.id)}
                            data-testid={`done-${task.id}`}
                          />
                          {`✅ ${t('practice.done')}`}
                        </label>
                      </span>
                    </div>
                    <details className="spoiler">
                      <summary>{t('practice.hint')} {task.hint[lang]}</summary>
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
