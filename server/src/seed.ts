import { hashPasswordDeterministic } from './lib/password.js'
import { makeRng } from './lib/prng.js'
import type { Category, DB, FeedEvent, Order, OrderItem, Product, Review, User } from './types.js'
import { DEFAULT_FLAGS } from './types.js'

export const SEED_PASSWORD = 'password123'

const CATEGORIES: Category[] = [
  { id: 'c-electronics', slug: 'electronics', name: 'Электроника' },
  { id: 'c-books', slug: 'books', name: 'Книги' },
  { id: 'c-clothing', slug: 'clothing', name: 'Одежда' },
  { id: 'c-home', slug: 'home', name: 'Дом и сад' },
  { id: 'c-sport', slug: 'sport', name: 'Спорт' },
]

const MAKERS = ['Aurora', 'Volt', 'Nimbus', 'Polar', 'Kvant', 'Briz', 'Terra', 'Lumen']
const NOUNS: Record<string, string[]> = {
  electronics: [
    'Наушники',
    'Клавиатура',
    'Мышь',
    'Колонка',
    'Монитор',
    'Хаб USB',
    'Веб-камера',
    'Кабель Type-C',
    'Пауэрбанк',
    'Зарядное устройство',
    'Микрофон',
    'Кронштейн',
  ],
  books: [
    'Гарри Поттер и ...',
    'Тень ветра',
    'Мастер и Маргарита',
    'Автостопом по галактике',
    'Цветы для Элджернона',
    'Хроники Нарнии',
    'Понедельник начинается в субботу',
    'Дюна',
    '451 градус по Фаренгейту',
    'Сто лет одиночества',
    'Игра Эндера',
    'Атлант расправил плечи',
  ],
  clothing: [
    'Футболка',
    'Худи',
    'Джинсы',
    'Куртка',
    'Кроссовки',
    'Рюкзак',
    'Кепка',
    'Носки (3 пары)',
    'Свитер',
    'Шорты',
    'Перчатки',
    'Ремень',
  ],
  home: [
    'Кружка',
    'Настольная лампа',
    'Плед',
    'Набор кастрюль',
    'Ваза',
    'Ковёр',
    'Подушка',
    'Увлажнитель воздуха',
    'Набор полотенец',
    'Свеча ароматическая',
    'Органайзер',
    'Кофейник',
    'Доска разделочная',
    'Штора',
  ],
  sport: [
    'Гантели (пара)',
    'Коврик для йоги',
    'Скакалка',
    'Эспандер',
    'Фитнес-браслет',
    'Бутылка для воды',
    'Мяч футбольный',
    'Ролики',
    'Тренажёр кистевой',
    'Обруч',
    'Лыжи',
    'Палатка',
    'Фонарик налобный',
    'Термос',
  ],
}

const DESCRIPTIONS = [
  'Надёжная вещь на каждый день. Проверено временем и тренажёром Playwright.',
  'Компактная модель с продуманными деталями. Подходит для дома и офиса.',
  'Хит продаж в своей категории. Качество подтверждено отзывами покупателей.',
  'Практичный выбор по честной цене. Доставка по всей стране.',
  'Эргономика, стиль и долговечность в одном флаконе.',
]

const REVIEW_TEXTS = [
  'Отличная покупка, всё работает как часы.',
  'Соотношение цена/качество на высоте.',
  'Брал в подарок — понравилось всем.',
  'Доставили быстро, упаковка целая.',
  'Ожидал большего, но за эти деньги нормально.',
  'Пользуюсь месяц, полёт отличный.',
]

const FIRST_NAMES = ['Иван', 'Мария', 'Пётр', 'Ольга', 'Сергей', 'Анна', 'Дмитрий', 'Елена']

const STATUSES: Order['status'][] = [
  'new',
  'paid',
  'paid',
  'shipped',
  'shipped',
  'delivered',
  'delivered',
  'delivered',
  'cancelled',
]

function buildProducts(): Product[] {
  const rng = makeRng(42)
  const products: Product[] = []
  let seq = 1
  for (const cat of CATEGORIES) {
    const nouns = NOUNS[cat.slug]
    const count = cat.slug === 'home' || cat.slug === 'sport' ? 14 : 12 // 12+12+12+14+14 = 64
    for (let i = 0; i < count; i++) {
      const maker = rng.pick(MAKERS)
      const noun = nouns[i % nouns.length]
      const variant = rng.int(1, 9)
      const priceCents = rng.int(99, 899) * 100 + rng.pick([0, 50, 90])
      products.push({
        id: `p${seq}`,
        slug: `${cat.slug}-${seq}`,
        name: `${maker} ${noun} ${cat.slug === 'books' ? `том ${variant}` : `v${variant}`}`,
        categoryId: cat.id,
        priceCents,
        rating: Math.round(rng.int(32, 50)) / 10,
        stock: rng.int(0, 120),
        hue: rng.int(0, 359),
        description: rng.pick(DESCRIPTIONS),
        featured: products.length < 8,
      })
      seq++
    }
  }
  return products
}

function buildUsers(): User[] {
  return [
    {
      id: 'u1',
      email: 'customer@shop.test',
      name: 'Иван Покупатель',
      role: 'customer',
      passwordHash: hashPasswordDeterministic(SEED_PASSWORD, 'seed-salt-customer'),
      avatarHue: 210,
      otpEnabled: false,
    },
    {
      id: 'u2',
      email: 'manager@shop.test',
      name: 'Марина Менеджер',
      role: 'manager',
      passwordHash: hashPasswordDeterministic(SEED_PASSWORD, 'seed-salt-manager'),
      avatarHue: 150,
      otpEnabled: false,
    },
    {
      id: 'u3',
      email: 'admin@shop.test',
      name: 'Алексей Админ',
      role: 'admin',
      passwordHash: hashPasswordDeterministic(SEED_PASSWORD, 'seed-salt-admin'),
      avatarHue: 20,
      otpEnabled: true,
    },
  ]
}

function buildReviews(products: Product[]): Review[] {
  const rng = makeRng(1337)
  const reviews: Review[] = []
  let seq = 1
  for (const product of products.slice(0, 16)) {
    const count = rng.int(2, 4)
    for (let i = 0; i < count; i++) {
      reviews.push({
        id: `r${seq++}`,
        productId: product.id,
        author: rng.pick(FIRST_NAMES),
        rating: rng.int(3, 5),
        text: rng.pick(REVIEW_TEXTS),
        createdAt: `2026-10-${String(rng.int(1, 28)).padStart(2, '0')}T${String(
          rng.int(8, 20),
        ).padStart(2, '0')}:15:00.000Z`,
      })
    }
  }
  return reviews
}

function buildOrders(products: Product[], users: User[]): { orders: Order[]; events: FeedEvent[] } {
  const rng = makeRng(2026)
  const orders: Order[] = []
  const events: FeedEvent[] = []
  let seq = 1
  for (let i = 0; i < 10; i++) {
    const user = users[i % users.length]
    const itemCount = rng.int(1, 3)
    const items: OrderItem[] = []
    for (let j = 0; j < itemCount; j++) {
      const product = rng.pick(products)
      if (items.some((it) => it.productId === product.id)) continue
      items.push({
        productId: product.id,
        name: product.name,
        priceCents: product.priceCents,
        qty: rng.int(1, 2),
      })
    }
    const subtotal = items.reduce((sum, it) => sum + it.priceCents * it.qty, 0)
    const discountCents = i === 4 ? Math.round(subtotal * 0.1) : 0
    const createdAt = `2026-11-${String(rng.int(1, 22)).padStart(2, '0')}T${String(
      rng.int(8, 20),
    ).padStart(2, '0')}:30:00.000Z`
    const order: Order = {
      id: `o${seq}`,
      number: `ORD-2026-${String(seq).padStart(3, '0')}`,
      userId: user.id,
      email: user.email,
      phone: '+7 (900) 123-45-67',
      address: `г. Тестовск, ул. Автоматизаторов, д. ${rng.int(1, 99)}, кв. ${rng.int(1, 100)}`,
      payment: rng.chance(0.7) ? 'card' : 'cash',
      status: STATUSES[i % STATUSES.length],
      items,
      promoCode: i === 4 ? 'SALE10' : null,
      discountCents,
      totalCents: subtotal - discountCents,
      createdAt,
    }
    orders.push(order)
    events.push({
      id: `e${seq}`,
      kind: 'order',
      text: `Заказ ${order.number} — ${order.status}`,
      at: createdAt,
    })
    seq++
  }
  events.push({
    id: 'e-seed-1',
    kind: 'system',
    text: 'Сервер инициализирован детерминированным seed',
    at: '2026-11-01T09:00:00.000Z',
  })
  return { orders, events }
}

export function seedDatabase(): DB {
  const products = buildProducts()
  const users = buildUsers()
  const reviews = buildReviews(products)
  const { orders, events } = buildOrders(products, users)
  return {
    products,
    categories: CATEGORIES,
    users,
    reviews,
    orders,
    carts: new Map(),
    chat: [
      {
        id: 'm1',
        author: 'Марина Менеджер',
        text: 'Добро пожаловать в чат поддержки!',
        at: '2026-11-20T10:00:00.000Z',
      },
      {
        id: 'm2',
        author: 'Иван Покупатель',
        text: 'Спасибо! Каталог впечатляет.',
        at: '2026-11-20T10:01:00.000Z',
      },
    ],
    events,
    files: new Map(),
    promoCodes: [
      { code: 'SALE10', percent: 10 },
      { code: 'PW20', percent: 20 },
    ],
    flags: { ...DEFAULT_FLAGS },
    practice: {},
    refreshTokens: new Map(),
    orderSeq: 11,
  }
}
