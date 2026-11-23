import { NavLink, Link, Outlet } from 'react-router-dom'
import { api } from '../api/client'
import { useAuth } from '../contexts/AuthContext'
import { useCart } from '../contexts/CartContext'
import { useI18n } from '../i18n'
import { useTheme, useToast } from './ui'

export function Layout() {
  const { t, lang, setLang } = useI18n()
  const { theme, setTheme } = useTheme()
  const toast = useToast()
  const { user, logout } = useAuth()
  const { count } = useCart()

  const onReset = async () => {
    try {
      await api.post('/api/test/reset')
      window.dispatchEvent(new Event('pw:reset'))
      toast('success', t('reset.done'))
      window.location.reload()
    } catch {
      toast('error', 'Reset failed')
    }
  }

  return (
    <div>
      <a href="#main" className="skip-link">
        Перейти к содержимому
      </a>
      <header className="header">
        <div className="header__inner">
          <Link to="/" className="logo">
            <span className="logo__mark" aria-hidden>
              &gt;_
            </span>
            <span>Playwright Practice Shop</span>
          </Link>
          <nav className="nav" aria-label="Основная навигация">
            <NavLink to="/" end>
              {t('nav.home')}
            </NavLink>
            <NavLink to="/catalog">{t('nav.catalog')}</NavLink>
            <NavLink to="/practice">{t('nav.practice')}</NavLink>
            {user?.role === 'admin' || user?.role === 'manager' ? (
              <NavLink to="/admin">{t('nav.admin')}</NavLink>
            ) : null}
          </nav>
          <div className="header__spacer" />
          <div className="header__actions">
            <button
              type="button"
              className="btn btn--ghost btn--sm"
              onClick={() => setLang(lang === 'ru' ? 'en' : 'ru')}
              aria-label="Switch language"
              data-testid="lang-toggle"
            >
              {t('lang.switch')}
            </button>
            <button
              type="button"
              className="btn btn--ghost btn--sm"
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              aria-label={theme === 'light' ? t('theme.toDark') : t('theme.toLight')}
              title={theme === 'light' ? t('theme.toDark') : t('theme.toLight')}
              data-testid="theme-toggle"
            >
              {theme === 'light' ? '🌙' : '☀️'}
            </button>
            <NavLink
              to="/cart"
              className="btn btn--outline btn--sm cart-link"
              data-testid="cart-link"
            >
              🛒 {t('nav.cart')}
              {count > 0 ? (
                <span className="cart-count" data-testid="cart-count">
                  {count}
                </span>
              ) : null}
            </NavLink>
            {user ? (
              <>
                <NavLink to="/account" className="btn btn--ghost btn--sm">
                  {user.name}
                </NavLink>
                <button
                  type="button"
                  className="btn btn--ghost btn--sm"
                  onClick={() => void logout()}
                  data-testid="logout-button"
                >
                  {t('nav.logout')}
                </button>
              </>
            ) : (
              <NavLink to="/login" className="btn btn--ghost btn--sm" data-testid="login-link">
                {t('nav.login')}
              </NavLink>
            )}
          </div>
        </div>
      </header>
      <main id="main">
        <Outlet />
      </main>
      <footer className="footer">
        <div className="footer__inner">
          <span>{t('footer.tagline')}</span>
          <span className="mono">{t('footer.credentials')}</span>
          <span className="row">
            <a href="/api/docs" target="_blank" rel="noreferrer">
              {t('footer.docs')} ↗
            </a>
            <button
              type="button"
              className="btn btn--outline btn--sm"
              onClick={() => void onReset()}
              data-testid="reset-button"
            >
              {t('reset.button')}
            </button>
          </span>
        </div>
      </footer>
    </div>
  )
}
