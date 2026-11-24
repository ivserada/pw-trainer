export type Role = 'customer' | 'manager' | 'admin'

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

export interface User {
  id: string
  email: string
  name: string
  role: Role
  passwordHash: string
  avatarHue: number
  otpEnabled: boolean
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
}

export interface Cart {
  sessionId: string
  userId: string | null
  items: CartItem[]
  promoCode: string | null
}

export type OrderStatus = 'new' | 'paid' | 'shipped' | 'delivered' | 'cancelled'

export interface OrderItem {
  productId: string
  name: string
  priceCents: number
  qty: number
}

export interface Order {
  id: string
  number: string
  userId: string | null
  email: string
  phone: string
  address: string
  payment: 'card' | 'cash'
  status: OrderStatus
  items: OrderItem[]
  promoCode: string | null
  discountCents: number
  totalCents: number
  createdAt: string
}

export interface ChatMessage {
  id: string
  author: string
  text: string
  at: string
}

export interface FeedEvent {
  id: string
  kind: 'order' | 'review' | 'stock' | 'system'
  text: string
  at: string
}

export interface StoredFile {
  id: string
  filename: string
  mime: string
  size: number
  data: Buffer
  uploadedAt: string
}

export interface PromoCode {
  code: string
  percent: number
}

export interface ChaosFlags {
  /** 0 = выкл; каждый API-запрос задерживается на случайное 0..N мс */
  apiDelayMs: number
  /** 0..1 — доля запросов, отвечающих 500 */
  apiErrorRate: number
  /** элементы исчезают через N мс после появления (0 = выкл) */
  vanishMs: number
  /** кнопки «убегают» от курсора */
  movingButtons: boolean
  /** интервал принудительного re-render страницы, мс (0 = выкл) */
  rerenderMs: number
  /** картинки грузятся с искусственной задержкой */
  slowImages: boolean
}

export const DEFAULT_FLAGS: ChaosFlags = {
  apiDelayMs: 0,
  apiErrorRate: 0,
  vanishMs: 0,
  movingButtons: false,
  rerenderMs: 0,
  slowImages: false,
}

export interface DB {
  products: Product[]
  categories: Category[]
  users: User[]
  reviews: Review[]
  orders: Order[]
  carts: Map<string, Cart>
  chat: ChatMessage[]
  events: FeedEvent[]
  files: Map<string, StoredFile>
  promoCodes: PromoCode[]
  flags: ChaosFlags
  refreshTokens: Map<string, { userId: string; expires: number }>
  orderSeq: number
}
