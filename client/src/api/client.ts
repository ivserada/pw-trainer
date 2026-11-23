export class ApiError extends Error {
  constructor(
    public status: number,
    public data: Record<string, unknown>,
  ) {
    super((data.message as string) || `HTTP ${status}`)
    this.name = 'ApiError'
  }
}

const TOKEN_KEY = 'accessToken'

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}
export function setToken(token: string | null): void {
  if (token) localStorage.setItem(TOKEN_KEY, token)
  else localStorage.removeItem(TOKEN_KEY)
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE'
  body?: unknown
  formData?: FormData
  headers?: Record<string, string>
  /** Пропустить авто-refresh при 401 (чтобы не зациклиться). */
  skipAuthRetry?: boolean
}

async function rawRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = { ...(options.headers ?? {}) }
  const token = getToken()
  if (token) headers['Authorization'] = `Bearer ${token}`
  let body: BodyInit | undefined
  if (options.formData) {
    body = options.formData
  } else if (options.body !== undefined) {
    headers['Content-Type'] = 'application/json'
    body = JSON.stringify(options.body)
  }
  const res = await fetch(path, {
    method: options.method ?? 'GET',
    headers,
    body,
    credentials: 'same-origin',
  })
  if (res.status === 401 && !options.skipAuthRetry && token) {
    const refreshed = await tryRefresh()
    if (refreshed) {
      return rawRequest<T>(path, { ...options, skipAuthRetry: true })
    }
    setToken(null)
  }
  const text = await res.text()
  const data = text ? JSON.parse(text) : {}
  if (!res.ok) throw new ApiError(res.status, data as Record<string, unknown>)
  return data as T
}

async function tryRefresh(): Promise<boolean> {
  try {
    const res = await fetch('/api/auth/refresh', { method: 'POST', credentials: 'same-origin' })
    if (!res.ok) return false
    const data = (await res.json()) as { accessToken?: string }
    if (data.accessToken) {
      setToken(data.accessToken)
      return true
    }
    return false
  } catch {
    return false
  }
}

export const api = {
  get: <T>(path: string) => rawRequest<T>(path),
  post: <T>(path: string, body?: unknown) => rawRequest<T>(path, { method: 'POST', body }),
  postForm: <T>(path: string, formData: FormData) =>
    rawRequest<T>(path, { method: 'POST', formData }),
  patch: <T>(path: string, body?: unknown) => rawRequest<T>(path, { method: 'PATCH', body }),
  del: <T>(path: string) => rawRequest<T>(path, { method: 'DELETE' }),
}

/* ---------- Сущности ---------- */

export interface Category {
  id: string
  slug: string
  name: string
}
export interface Product {
  id: string
  slug: string
  name: string
  categoryId: string
  priceCents: number
  rating: number
  stock: number
  hue: number
  description: string
  featured: boolean
}
export interface Review {
  id: string
  productId: string
  author: string
  rating: number
  text: string
  createdAt: string
}
export interface CartItem {
  productId: string
  qty: number
  product?: Product
}
export interface Cart {
  items: CartItem[]
  promoCode: string | null
  discountPercent: number
  subtotalCents: number
  discountCents: number
  totalCents: number
}
export type OrderStatus = 'new' | 'paid' | 'shipped' | 'delivered' | 'cancelled'
export interface Order {
  id: string
  number: string
  userId: string | null
  email: string
  phone: string
  address: string
  payment: 'card' | 'cash'
  status: OrderStatus
  items: { productId: string; name: string; priceCents: number; qty: number }[]
  promoCode: string | null
  discountCents: number
  totalCents: number
  createdAt: string
}
export interface User {
  id: string
  email: string
  name: string
  role: 'customer' | 'manager' | 'admin'
  otpEnabled: boolean
  avatarHue: number
}
export interface FeedEvent {
  id: string
  kind: 'order' | 'review' | 'stock' | 'system'
  text: string
  at: string
}
export interface ChaosFlags {
  apiDelayMs: number
  apiErrorRate: number
  vanishMs: number
  movingButtons: boolean
  rerenderMs: number
  slowImages: boolean
}
