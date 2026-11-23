import { useEffect, type ReactNode } from 'react'
import { useI18n } from '../i18n'

/** Модальное окно: role="dialog" aria-modal. Закрытие: Esc, крестик, оверлей. */
export function Modal({
  open,
  onClose,
  title,
  children,
  testId,
}: {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
  testId?: string
}) {
  const { t } = useI18n()
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgb(0 0 0 / 0.45)',
        display: 'grid',
        placeItems: 'center',
        zIndex: 60,
      }}
      onClick={onClose}
      data-testid={`${testId ?? 'modal'}-overlay`}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        style={{
          background: 'var(--bg-raised)',
          borderRadius: 'var(--radius)',
          boxShadow: 'var(--shadow)',
          maxWidth: 'min(92vw, 480px)',
          width: '100%',
          padding: '1.25rem',
          position: 'relative',
        }}
        onClick={(e) => e.stopPropagation()}
        data-testid={testId ?? 'modal'}
      >
        <div className="row" style={{ justifyContent: 'space-between', marginBottom: '0.75rem' }}>
          <h2 style={{ margin: 0 }}>{title}</h2>
          <button
            type="button"
            className="btn btn--ghost btn--sm"
            onClick={onClose}
            aria-label={t('common.close')}
            data-testid="modal-close"
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

/** Drawer (боковая панель): role="dialog". */
export function Drawer({
  open,
  onClose,
  title,
  children,
  testId,
}: {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
  testId?: string
}) {
  const { t } = useI18n()
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null
  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgb(0 0 0 / 0.45)', zIndex: 60 }}
      onClick={onClose}
      data-testid={`${testId ?? 'drawer'}-overlay`}
    >
      <aside
        role="dialog"
        aria-label={title}
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          bottom: 0,
          width: 'min(88vw, 380px)',
          background: 'var(--bg-raised)',
          boxShadow: 'var(--shadow)',
          padding: '1.25rem',
          overflowY: 'auto',
        }}
        onClick={(e) => e.stopPropagation()}
        data-testid={testId ?? 'drawer'}
      >
        <div className="row" style={{ justifyContent: 'space-between', marginBottom: '0.75rem' }}>
          <h2 style={{ margin: 0 }}>{title}</h2>
          <button
            type="button"
            className="btn btn--ghost btn--sm"
            onClick={onClose}
            aria-label={t('common.close')}
            data-testid="drawer-close"
          >
            ✕
          </button>
        </div>
        {children}
      </aside>
    </div>
  )
}
