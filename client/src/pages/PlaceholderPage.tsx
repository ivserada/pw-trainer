import { useI18n } from '../i18n'

export function PlaceholderPage({ title }: { title?: string }) {
  const { t } = useI18n()
  return (
    <div className="page page--narrow">
      <div className="card card--pad-lg">
        <h1>{title ?? t('placeholder.title')}</h1>
        <p className="muted">Этот раздел появится на следующем этапе сборки.</p>
      </div>
    </div>
  )
}
