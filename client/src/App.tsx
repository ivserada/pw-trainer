import { Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { AccountPage } from './pages/AccountPage'
import { AdminPage } from './pages/AdminPage'
import { CatalogPage } from './pages/CatalogPage'
import { ChaosPage } from './pages/practice/ChaosPage'
import { CheckoutPage } from './pages/CheckoutPage'
import { HomePage } from './pages/HomePage'
import { CartPage } from './pages/CartPage'
import { LoginPage } from './pages/LoginPage'
import { NotFoundPage } from './pages/NotFoundPage'
import { PracticePage } from './pages/PracticePage'
import { ProductPage } from './pages/ProductPage'
import { RegisterPage } from './pages/RegisterPage'
import { A11yPage } from './pages/practice/A11yPage'
import { AutocompletePage } from './pages/practice/AutocompletePage'
import { CanvasPage } from './pages/practice/CanvasPage'
import { ComponentsPage } from './pages/practice/ComponentsPage'
import { DevicePage } from './pages/practice/DevicePage'
import { DndPage } from './pages/practice/DndPage'
import { DynamicPage } from './pages/practice/DynamicPage'
import { ErrorsPage } from './pages/practice/ErrorsPage'
import { FormsPage } from './pages/practice/FormsPage'
import { HotkeysPage } from './pages/practice/HotkeysPage'
import { IframesPage } from './pages/practice/IframesPage'
import { LinksPage } from './pages/practice/LinksPage'
import { OtpPage } from './pages/practice/OtpPage'
import { OverlaysPage } from './pages/practice/OverlaysPage'
import { PaginationPage } from './pages/practice/PaginationPage'
import { PaymentFramePage } from './pages/practice/PaymentFramePage'
import { RealtimePage } from './pages/practice/RealtimePage'
import { ScreenshotPage } from './pages/practice/ScreenshotPage'
import { ShadowPage } from './pages/practice/ShadowPage'
import { TablesPage } from './pages/practice/TablesPage'
import { TimersPage } from './pages/practice/TimersPage'
import { UploadPage } from './pages/practice/UploadPage'
import { WindowsPage } from './pages/practice/WindowsPage'

export function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/catalog" element={<CatalogPage />} />
        <Route path="/product/:id" element={<ProductPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/account" element={<AccountPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/practice" element={<PracticePage />} />
        <Route path="/practice/chaos" element={<ChaosPage />} />
        <Route path="/practice/forms" element={<FormsPage />} />
        <Route path="/practice/links" element={<LinksPage />} />
        <Route path="/practice/autocomplete" element={<AutocompletePage />} />
        <Route path="/practice/pagination" element={<PaginationPage />} />
        <Route path="/practice/tables" element={<TablesPage />} />
        <Route path="/practice/overlays" element={<OverlaysPage />} />
        <Route path="/practice/dynamic" element={<DynamicPage />} />
        <Route path="/practice/windows" element={<WindowsPage />} />
        <Route path="/practice/iframes" element={<IframesPage />} />
        <Route path="/practice/shadow" element={<ShadowPage />} />
        <Route path="/practice/dnd" element={<DndPage />} />
        <Route path="/practice/canvas" element={<CanvasPage />} />
        <Route path="/practice/realtime" element={<RealtimePage />} />
        <Route path="/practice/errors" element={<ErrorsPage />} />
        <Route path="/practice/components" element={<ComponentsPage />} />
        <Route path="/practice/hotkeys" element={<HotkeysPage />} />
        <Route path="/practice/a11y" element={<A11yPage />} />
        <Route path="/practice/screenshot" element={<ScreenshotPage />} />
        <Route path="/practice/device" element={<DevicePage />} />
        <Route path="/practice/otp" element={<OtpPage />} />
        <Route path="/practice/timers" element={<TimersPage />} />
        <Route path="/practice/upload" element={<UploadPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
      <Route path="/practice/payment-frame" element={<PaymentFramePage />} />
    </Routes>
  )
}
