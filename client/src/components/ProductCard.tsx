import { Link } from 'react-router-dom'
import type { Product } from '../api/client'
import { useCart } from '../contexts/CartContext'
import { useI18n } from '../i18n'
import { Price, ProductImage, Stars } from './ui'

export function ProductCard({ product }: { product: Product }) {
  const { t } = useI18n()
  const { add } = useCart()
  const out = product.stock === 0

  return (
    <article className="card" data-testid="product-card">
      <Link to={`/product/${product.id}`} style={{ color: 'inherit' }}>
        <ProductImage hue={product.hue} name={product.name} />
      </Link>
      <h3 style={{ fontSize: '0.95rem', margin: '0.6rem 0 0.25rem' }}>
        <Link to={`/product/${product.id}`} style={{ color: 'inherit' }}>
          {product.name}
        </Link>
      </h3>
      <div className="row" style={{ justifyContent: 'space-between', marginBottom: '0.5rem' }}>
        <Price cents={product.priceCents} />
        <Stars rating={product.rating} />
      </div>
      <div className="row" style={{ justifyContent: 'space-between' }}>
        {out ? (
          <span className="badge badge--danger">{t('catalog.outOfStock')}</span>
        ) : (
          <span className="badge badge--success">
            {t('product.inStock')} · {product.stock}
          </span>
        )}
        <button
          type="button"
          className="btn btn--primary btn--sm"
          disabled={out}
          onClick={() => void add(product.id, 1)}
          data-testid="add-to-cart"
        >
          {t('catalog.addToCart')}
        </button>
      </div>
    </article>
  )
}
