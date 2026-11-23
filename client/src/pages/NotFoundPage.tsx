import { Link } from 'react-router-dom'
import { useI18n } from '../i18n'

export function NotFoundPage() {
  const { t } = useI18n()
  return (
    <div className="page page--narrow">
      <div className="card card--pad-lg" data-testid="not-found">
        <h1>404</h1>
        <p className="muted">{t('notfound.text')}</p>
        <Link to="/" className="btn btn--primary">
          {t('nav.home')}
        </Link>
      </div>
    </div>
  )
}
