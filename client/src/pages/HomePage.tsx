import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api, type Product } from '../api/client'
import { useI18n } from '../i18n'
import { Price, ProductImage, Spinner, Stars } from '../components/ui'

export function HomePage() {
  const { t } = useI18n()
  const [featured, setFeatured] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api
      .get<{ items: Product[] }>('/api/products?featured=1&pageSize=8')
      .then((data) => setFeatured(data.items))
      .catch(() => setFeatured([]))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="page">
      <section className="card card--pad-lg" style={{ marginBottom: '1.5rem' }}>
        <h1>{t('home.hero.title')}</h1>
        <p className="muted" style={{ maxWidth: '46rem' }}>
          {t('home.hero.subtitle')}
        </p>
        <div className="row">
          <Link to="/practice" className="btn btn--primary">
            {t('home.hero.cta')} →
          </Link>
          <Link to="/catalog" className="btn btn--outline">
            {t('home.hero.catalog')}
          </Link>
        </div>
        <div className="row" style={{ marginTop: '1.25rem' }}>
          <span className="badge">64 {t('home.stats.products')}</span>
          <span className="badge badge--success">40+ {t('home.stats.tasks')}</span>
          <span className="badge badge--warning">3 {t('home.stats.users')}</span>
        </div>
      </section>

      <div
        className="grid"
        style={{
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          marginBottom: '2rem',
        }}
      >
        <div className="card">
          <h3>🎯 {t('home.features.locators')}</h3>
          <p className="muted">{t('home.features.locators.text')}</p>
        </div>
        <div className="card">
          <h3>🌐 {t('home.features.network')}</h3>
          <p className="muted">{t('home.features.network.text')}</p>
        </div>
        <div className="card">
          <h3>🌀 {t('home.features.chaos')}</h3>
          <p className="muted">{t('home.features.chaos.text')}</p>
        </div>
      </div>

      <h2>{t('home.featured')}</h2>
      {loading ? (
        <Spinner label={t('common.loading')} />
      ) : (
        <div className="grid">
          {featured.map((p) => (
            <Link
              key={p.id}
              to={`/product/${p.id}`}
              className="card"
              style={{ color: 'inherit', display: 'block' }}
              data-testid="featured-card"
            >
              <ProductImage hue={p.hue} name={p.name} />
              <h3 style={{ marginTop: '0.6rem', fontSize: '0.95rem' }}>{p.name}</h3>
              <div className="row" style={{ justifyContent: 'space-between' }}>
                <Price cents={p.priceCents} />
                <Stars rating={p.rating} />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
