import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { useSearchParams } from 'react-router-dom'
import { api, type Category, type Product } from '../api/client'
import { ProductCard } from '../components/ProductCard'
import { Spinner } from '../components/ui'
import { useI18n } from '../i18n'

interface ListResponse {
  items: Product[]
  total: number
  page: number
  pages: number
  pageSize: number
}

export function CatalogPage() {
  const { t } = useI18n()
  const [searchParams, setSearchParams] = useSearchParams()
  const [categories, setCategories] = useState<Category[]>([])
  const [data, setData] = useState<ListResponse | null>(null)
  const [loading, setLoading] = useState(true)

  const queryString = searchParams.toString()

  useEffect(() => {
    api
      .get<Category[]>('/api/categories')
      .then(setCategories)
      .catch(() => setCategories([]))
  }, [])

  useEffect(() => {
    setLoading(true)
    api
      .get<ListResponse>(`/api/products?${queryString}`)
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false))
  }, [queryString])

  const filters = useMemo(
    () => ({
      q: searchParams.get('q') ?? '',
      category: searchParams.get('category') ?? '',
      sort: searchParams.get('sort') ?? '',
      minPrice: searchParams.get('minPrice') ?? '',
      maxPrice: searchParams.get('maxPrice') ?? '',
      inStock: searchParams.get('inStock') === '1',
      page: Number(searchParams.get('page') ?? '1') || 1,
    }),
    [searchParams],
  )

  function applyFromForm(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const next = new URLSearchParams()
    for (const key of ['q', 'category', 'sort', 'minPrice', 'maxPrice']) {
      const v = String(fd.get(key) ?? '').trim()
      if (v) next.set(key, v)
    }
    if (fd.get('inStock') === 'on') next.set('inStock', '1')
    setSearchParams(next)
  }

  function gotoPage(page: number) {
    const next = new URLSearchParams(searchParams)
    next.set('page', String(page))
    setSearchParams(next)
  }

  function resetFilters() {
    setSearchParams({})
  }

  const pageNumbers = useMemo(() => {
    if (!data) return []
    const total = data.pages
    const current = data.page
    const window = 2
    const set = new Set<number>()
    for (let p = 1; p <= total; p++) {
      if (p === 1 || p === total || Math.abs(p - current) <= window) set.add(p)
    }
    return [...set].sort((a, b) => a - b)
  }, [data])

  return (
    <div className="page">
      <h1>{t('catalog.title')}</h1>
      <div className="catalog-layout">
        <aside className="card" aria-label={t('catalog.filters')}>
          <form onSubmit={applyFromForm} data-testid="filters-form">
            <div className="field">
              <label htmlFor="f-q">{t('catalog.search')}</label>
              <input
                id="f-q"
                name="q"
                type="search"
                className="input"
                defaultValue={filters.q}
                placeholder={t('catalog.search')}
                data-testid="filter-q"
              />
            </div>
            <div className="field">
              <label htmlFor="f-category">{t('catalog.category')}</label>
              <select
                id="f-category"
                name="category"
                className="select"
                defaultValue={filters.category}
                data-testid="filter-category"
              >
                <option value="">{t('catalog.allCategories')}</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.slug}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="f-sort">{t('catalog.sort')}</label>
              <select
                id="f-sort"
                name="sort"
                className="select"
                defaultValue={filters.sort}
                data-testid="filter-sort"
              >
                <option value="">{t('catalog.sort.default')}</option>
                <option value="price_asc">{t('catalog.sort.price_asc')}</option>
                <option value="price_desc">{t('catalog.sort.price_desc')}</option>
                <option value="rating">{t('catalog.sort.rating')}</option>
                <option value="name">{t('catalog.sort.name')}</option>
              </select>
            </div>
            <div className="field">
              <label htmlFor="f-min">{t('catalog.priceFrom')}</label>
              <input
                id="f-min"
                name="minPrice"
                type="number"
                min="0"
                className="input"
                defaultValue={filters.minPrice}
                data-testid="filter-min-price"
              />
            </div>
            <div className="field">
              <label htmlFor="f-max">{t('catalog.priceTo')}</label>
              <input
                id="f-max"
                name="maxPrice"
                type="number"
                min="0"
                className="input"
                defaultValue={filters.maxPrice}
                data-testid="filter-max-price"
              />
            </div>
            <div className="checkbox-row">
              <input
                id="f-instock"
                name="inStock"
                type="checkbox"
                defaultChecked={filters.inStock}
                data-testid="filter-instock"
              />
              <label htmlFor="f-instock">{t('catalog.inStockOnly')}</label>
            </div>
            <div className="row" style={{ marginTop: '1rem' }}>
              <button type="submit" className="btn btn--primary" data-testid="filters-apply">
                {t('catalog.apply')}
              </button>
              <button type="button" className="btn btn--ghost" onClick={resetFilters}>
                {t('catalog.reset')}
              </button>
            </div>
          </form>
        </aside>

        <section aria-live="polite">
          {loading ? (
            <Spinner label={t('common.loading')} />
          ) : !data ? (
            <p className="muted">{t('catalog.empty')}</p>
          ) : (
            <>
              <p className="muted" data-testid="catalog-total">
                {t('catalog.results')}: {data.total}
              </p>
              {data.items.length === 0 ? (
                <p className="muted">{t('catalog.empty')}</p>
              ) : (
                <div className="grid">
                  {data.items.map((p) => (
                    <ProductCard key={p.id} product={p} />
                  ))}
                </div>
              )}
              {data.pages > 1 ? (
                <nav className="pagination" aria-label="Страницы каталога">
                  <button
                    type="button"
                    disabled={data.page <= 1}
                    onClick={() => gotoPage(data.page - 1)}
                    data-testid="page-prev"
                  >
                    ←
                  </button>
                  {pageNumbers.map((p, i) => {
                    const prev = pageNumbers[i - 1]
                    return (
                      <span key={p} className="row" style={{ gap: '0.35rem' }}>
                        {prev !== undefined && p - prev > 1 ? (
                          <span className="faint" aria-hidden>
                            …
                          </span>
                        ) : null}
                        <button
                          type="button"
                          aria-current={p === data.page ? 'page' : undefined}
                          onClick={() => gotoPage(p)}
                          data-testid={`page-${p}`}
                        >
                          {p}
                        </button>
                      </span>
                    )
                  })}
                  <button
                    type="button"
                    disabled={data.page >= data.pages}
                    onClick={() => gotoPage(data.page + 1)}
                    data-testid="page-next"
                  >
                    →
                  </button>
                </nav>
              ) : null}
            </>
          )}
        </section>
      </div>
    </div>
  )
}
