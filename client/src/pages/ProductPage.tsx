import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { api, type Product, type Review } from '../api/client'
import { useAuth } from '../contexts/AuthContext'
import { useCart } from '../contexts/CartContext'
import { useI18n } from '../i18n'
import { Price, ProductImage, Spinner, Stars, useToast } from '../components/ui'

type ProductDetail = Product & {
  category: { id: string; name: string } | null
  reviewCount: number
}

const VARIANTS = [
  { id: 'graphite', label: 'Графит' },
  { id: 'ivory', label: 'Слоновая кость' },
  { id: 'ocean', label: 'Океан' },
]

export function ProductPage() {
  const { id } = useParams<{ id: string }>()
  const { t } = useI18n()
  const toast = useToast()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { add } = useCart()

  const [product, setProduct] = useState<ProductDetail | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [tab, setTab] = useState<'description' | 'specs' | 'reviews'>('description')
  const [variant, setVariant] = useState('graphite')
  const [warranty, setWarranty] = useState('none')
  const [qty, setQty] = useState(1)
  const [reviews, setReviews] = useState<Review[] | null>(null)
  const [reviewSuccess, setReviewSuccess] = useState(false)

  useEffect(() => {
    setProduct(null)
    setError(null)
    setTab('description')
    setReviews(null)
    api
      .get<ProductDetail>(`/api/products/${id}`)
      .then(setProduct)
      .catch((e) => setError(e instanceof Error ? e.message : 'Ошибка загрузки'))
  }, [id])

  useEffect(() => {
    if (tab !== 'reviews' || reviews !== null || !product) return
    api
      .get<Review[]>(`/api/products/${product.id}/reviews`)
      .then(setReviews)
      .catch(() => setReviews([]))
  }, [tab, reviews, product])

  if (error) {
    return (
      <div className="page page--narrow">
        <div className="card card--pad-lg" data-testid="product-error">
          <h1>Ошибка</h1>
          <p className="muted">{error}</p>
          <Link to="/catalog" className="btn btn--primary">
            {t('nav.catalog')}
          </Link>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="page">
        <Spinner label={t('common.loading')} />
      </div>
    )
  }

  const out = product.stock === 0

  const submitReview = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    await api.post(`/api/products/${product.id}/reviews`, {
      author: String(fd.get('author') ?? ''),
      rating: Number(fd.get('rating') ?? 5),
      text: String(fd.get('text') ?? ''),
    })
    setReviewSuccess(true)
    setReviews(null)
    const updated = await api.get<ProductDetail>(`/api/products/${product.id}`)
    setProduct(updated)
    toast('success', t('product.reviewForm.success'))
  }

  return (
    <div className="page">
      <nav aria-label={t('product.breadcrumb')}>
        <ol className="breadcrumbs">
          <li>
            <Link to="/">{t('nav.home')}</Link>
          </li>
          <li>
            <Link to="/catalog">{t('nav.catalog')}</Link>
          </li>
          {product.category ? (
            <li>
              <Link to={`/catalog?category=${product.category.id.replace('c-', '')}`}>
                {product.category.name}
              </Link>
            </li>
          ) : null}
          <li aria-current="page">{product.name}</li>
        </ol>
      </nav>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1.5rem',
          alignItems: 'start',
        }}
      >
        <div className="card" data-testid="product-gallery">
          <ProductImage hue={product.hue} name={product.name} size={320} />
        </div>

        <div>
          <h1 data-testid="product-name">{product.name}</h1>
          <p className="row" style={{ gap: '1rem' }}>
            <Price cents={product.priceCents} className="mono" />
            <Stars rating={product.rating} />
            <button
              type="button"
              className="btn btn--ghost btn--sm"
              onClick={() => setTab('reviews')}
            >
              {product.reviewCount} {t('product.reviews.count')}
            </button>
          </p>
          <p>
            {out ? (
              <span className="badge badge--danger" data-testid="stock-badge">
                {t('product.outOfStock')}
              </span>
            ) : (
              <span className="badge badge--success" data-testid="stock-badge">
                {t('product.inStock')}: {product.stock} {t('product.left')}
              </span>
            )}
          </p>

          <fieldset style={{ border: 'none', padding: 0, margin: '0 0 1rem' }}>
            <legend style={{ fontWeight: 600, fontSize: '0.88rem', marginBottom: '0.4rem' }}>
              {t('product.variant')}
            </legend>
            <div className="row" role="radiogroup" aria-label={t('product.variant')}>
              {VARIANTS.map((v) => (
                <label key={v.id} className="radio-row" style={{ marginBottom: 0 }}>
                  <input
                    type="radio"
                    name="variant"
                    value={v.id}
                    checked={variant === v.id}
                    onChange={() => setVariant(v.id)}
                    data-testid={`variant-${v.id}`}
                  />
                  {v.label}
                </label>
              ))}
            </div>
          </fieldset>

          <div className="field" style={{ maxWidth: '260px' }}>
            <label htmlFor="warranty">{t('product.warranty')}</label>
            <select
              id="warranty"
              className="select"
              value={warranty}
              onChange={(e) => setWarranty(e.target.value)}
              data-testid="warranty-select"
            >
              <option value="none">{t('product.warranty.none')}</option>
              <option value="6">{t('product.warranty.6')}</option>
              <option value="12">{t('product.warranty.12')}</option>
              <option value="24">{t('product.warranty.24')}</option>
            </select>
          </div>

          <div className="row" style={{ marginBottom: '1rem' }}>
            <div className="row" style={{ gap: '0.4rem' }}>
              <button
                type="button"
                className="btn btn--outline btn--sm"
                aria-label="Уменьшить количество"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                data-testid="qty-minus"
              >
                −
              </button>
              <input
                type="number"
                className="input"
                style={{ width: '4.2rem', textAlign: 'center' }}
                min={1}
                max={99}
                value={qty}
                onChange={(e) => setQty(Math.max(1, Number(e.target.value) || 1))}
                aria-label={t('common.quantity')}
                data-testid="qty-input"
              />
              <button
                type="button"
                className="btn btn--outline btn--sm"
                aria-label="Увеличить количество"
                onClick={() => setQty((q) => Math.min(99, q + 1))}
                data-testid="qty-plus"
              >
                +
              </button>
            </div>
            <button
              type="button"
              className="btn btn--primary"
              disabled={out}
              onClick={() => void add(product.id, qty)}
              data-testid="add-to-cart"
            >
              {t('product.addToCart')}
            </button>
            <button
              type="button"
              className="btn btn--outline"
              disabled={out}
              onClick={() => {
                void add(product.id, qty).then(() => navigate('/cart'))
              }}
              data-testid="buy-now"
            >
              {t('product.buyNow')}
            </button>
          </div>
          <p className="faint mono">
            {t('product.sku')}: {product.id.toUpperCase()}
          </p>
        </div>
      </div>

      <section style={{ marginTop: '2rem' }}>
        <div className="tabs__list" role="tablist" aria-label="Информация о товаре">
          {(
            [
              ['description', t('product.tab.description')],
              ['specs', t('product.tab.specs')],
              ['reviews', `${t('product.tab.reviews')} (${product.reviewCount})`],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              role="tab"
              id={`tab-${key}`}
              aria-selected={tab === key}
              aria-controls={`panel-${key}`}
              className="tabs__tab"
              onClick={() => setTab(key)}
            >
              {label}
            </button>
          ))}
        </div>

        {tab === 'description' ? (
          <div role="tabpanel" id="panel-description" aria-labelledby="tab-description">
            <p data-testid="product-description">{product.description}</p>
            <p className="muted">
              {t('product.category')}: {product.category?.name ?? '—'}
            </p>
          </div>
        ) : null}

        {tab === 'specs' ? (
          <div role="tabpanel" id="panel-specs" aria-labelledby="tab-specs">
            <div className="table-wrap" style={{ maxWidth: '480px' }}>
              <table className="table">
                <tbody>
                  <tr>
                    <th scope="row">Артикул</th>
                    <td>{product.id.toUpperCase()}</td>
                  </tr>
                  <tr>
                    <th scope="row">Цвет</th>
                    <td>{VARIANTS.find((v) => v.id === variant)?.label}</td>
                  </tr>
                  <tr>
                    <th scope="row">Гарантия</th>
                    <td>{warranty === 'none' ? t('product.warranty.none') : `${warranty} мес.`}</td>
                  </tr>
                  <tr>
                    <th scope="row">Остаток</th>
                    <td>{product.stock} шт.</td>
                  </tr>
                  <tr>
                    <th scope="row">Рейтинг</th>
                    <td>{product.rating.toFixed(1)} / 5</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        ) : null}

        {tab === 'reviews' ? (
          <div role="tabpanel" id="panel-reviews" aria-labelledby="tab-reviews">
            {reviews === null ? (
              <Spinner label={t('common.loading')} />
            ) : reviews.length === 0 ? (
              <p className="muted">Отзывов пока нет — будьте первым!</p>
            ) : (
              <ul style={{ listStyle: 'none', padding: 0 }} data-testid="reviews-list">
                {reviews.map((r) => (
                  <li key={r.id} className="card" style={{ marginBottom: '0.6rem' }}>
                    <div className="row" style={{ justifyContent: 'space-between' }}>
                      <strong>{r.author}</strong>
                      <span className="muted mono">{r.createdAt.slice(0, 10)}</span>
                    </div>
                    <Stars rating={r.rating} />
                    <p style={{ margin: '0.25rem 0 0' }}>{r.text}</p>
                  </li>
                ))}
              </ul>
            )}

            <div className="card" style={{ maxWidth: '480px', marginTop: '1rem' }}>
              <h3>{t('product.reviewForm.title')}</h3>
              {reviewSuccess ? (
                <p className="badge badge--success" role="status" data-testid="review-success">
                  {t('product.reviewForm.success')}
                </p>
              ) : null}
              <form onSubmit={(e) => void submitReview(e)} data-testid="review-form">
                <div className="field">
                  <label htmlFor="review-author">{t('product.reviewForm.name')}</label>
                  <input
                    id="review-author"
                    name="author"
                    className="input"
                    required
                    defaultValue={user?.name ?? ''}
                    data-testid="review-author"
                  />
                </div>
                <div className="field">
                  <label htmlFor="review-rating">{t('product.reviewForm.rating')}</label>
                  <select
                    id="review-rating"
                    name="rating"
                    className="select"
                    defaultValue="5"
                    data-testid="review-rating"
                  >
                    {[5, 4, 3, 2, 1].map((n) => (
                      <option key={n} value={n}>
                        {n} ★
                      </option>
                    ))}
                  </select>
                </div>
                <div className="field">
                  <label htmlFor="review-text">{t('product.reviewForm.text')}</label>
                  <textarea
                    id="review-text"
                    name="text"
                    className="textarea"
                    rows={3}
                    required
                    data-testid="review-text"
                  />
                </div>
                <button type="submit" className="btn btn--primary" data-testid="review-submit">
                  {t('product.reviewForm.submit')}
                </button>
              </form>
            </div>
          </div>
        ) : null}
      </section>
    </div>
  )
}
