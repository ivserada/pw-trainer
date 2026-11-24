export const openapi = {
  openapi: '3.0.3',
  info: {
    title: 'Playwright Practice Shop API',
    version: '1.0.0',
    description:
      'REST API учебного магазина. Детерминированный seed, тестовые эндпоинты для сброса состояния. Аутентификация: Bearer access token + httpOnly refresh cookie.',
  },
  tags: [
    { name: 'meta' },
    { name: 'products' },
    { name: 'reviews' },
    { name: 'cart' },
    { name: 'orders' },
    { name: 'auth' },
    { name: 'users' },
    { name: 'realtime' },
    { name: 'files' },
    { name: 'demo' },
    { name: 'test' },
  ],
  components: {
    securitySchemes: {
      bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
    },
    schemas: {
      Product: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'p1' },
          slug: { type: 'string' },
          name: { type: 'string' },
          categoryId: { type: 'string' },
          priceCents: { type: 'integer' },
          rating: { type: 'number' },
          stock: { type: 'integer' },
          hue: { type: 'integer' },
          description: { type: 'string' },
          featured: { type: 'boolean' },
        },
      },
      Cart: {
        type: 'object',
        properties: {
          items: {
            type: 'array',
            items: {
              type: 'object',
              properties: { productId: { type: 'string' }, qty: { type: 'integer' } },
            },
          },
          promoCode: { type: ['string', 'null'] },
          subtotalCents: { type: 'integer' },
          discountCents: { type: 'integer' },
          totalCents: { type: 'integer' },
        },
      },
      Order: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          number: { type: 'string', example: 'ORD-2026-011' },
          status: { type: 'string', enum: ['new', 'paid', 'shipped', 'delivered', 'cancelled'] },
          items: { type: 'array', items: { $ref: '#/components/schemas/OrderItem' } },
          totalCents: { type: 'integer' },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      OrderItem: {
        type: 'object',
        properties: {
          productId: { type: 'string' },
          name: { type: 'string' },
          priceCents: { type: 'integer' },
          qty: { type: 'integer' },
        },
      },
      User: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          email: { type: 'string' },
          name: { type: 'string' },
          role: { type: 'string', enum: ['customer', 'manager', 'admin'] },
          otpEnabled: { type: 'boolean' },
        },
      },
      Error: {
        type: 'object',
        properties: { error: { type: 'string' }, message: { type: 'string' } },
      },
    },
  },
  paths: {
    '/api/health': {
      get: {
        tags: ['meta'],
        summary: 'Проверка живости сервера',
        responses: { 200: { description: 'ok' } },
      },
    },
    '/api/products': {
      get: {
        tags: ['products'],
        summary: 'Список товаров (q, category, sort, minPrice, maxPrice, inStock, page, pageSize)',
        parameters: [
          { name: 'q', in: 'query', schema: { type: 'string' } },
          { name: 'category', in: 'query', schema: { type: 'string' } },
          {
            name: 'sort',
            in: 'query',
            schema: { type: 'string', enum: ['price_asc', 'price_desc', 'rating', 'name'] },
          },
          { name: 'minPrice', in: 'query', schema: { type: 'integer' } },
          { name: 'maxPrice', in: 'query', schema: { type: 'integer' } },
          { name: 'inStock', in: 'query', schema: { type: 'boolean' } },
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'pageSize', in: 'query', schema: { type: 'integer', default: 12 } },
        ],
        responses: { 200: { description: '{ items, total, page, pages }' } },
      },
    },
    '/api/products/{id}': {
      get: {
        tags: ['products'],
        summary: 'Карточка товара',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Product' }, 404: { description: 'не найден' } },
      },
    },
    '/api/categories': {
      get: {
        tags: ['products'],
        summary: 'Список категорий',
        responses: { 200: { description: 'Category[]' } },
      },
    },
    '/api/products/{id}/reviews': {
      get: {
        tags: ['reviews'],
        summary: 'Отзывы о товаре',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Review[]' } },
      },
      post: {
        tags: ['reviews'],
        summary: 'Добавить отзыв',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  author: { type: 'string' },
                  rating: { type: 'integer' },
                  text: { type: 'string' },
                },
                required: ['author', 'rating', 'text'],
              },
            },
          },
        },
        responses: { 201: { description: 'Review' } },
      },
    },
    '/api/cart': {
      get: {
        tags: ['cart'],
        summary: 'Корзина текущей сессии (cookie sid)',
        responses: { 200: { description: 'Cart' } },
      },
      post: {
        tags: ['cart'],
        summary: 'Добавить позицию { productId, qty }',
        responses: { 200: { description: 'Cart' }, 404: { description: 'товар не найден' } },
      },
    },
    '/api/cart/{productId}': {
      patch: {
        tags: ['cart'],
        summary: 'Изменить количество { qty }',
        parameters: [{ name: 'productId', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Cart' } },
      },
      delete: {
        tags: ['cart'],
        summary: 'Удалить позицию',
        parameters: [{ name: 'productId', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Cart' } },
      },
    },
    '/api/cart/promo': {
      post: {
        tags: ['cart'],
        summary: 'Применить промокод { code } (SALE10, PW20)',
        responses: { 200: { description: 'Cart' }, 400: { description: 'неверный код' } },
      },
    },
    '/api/orders': {
      get: {
        tags: ['orders'],
        summary: 'Мои заказы (Bearer)',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'Order[]' }, 401: { description: 'нет токена' } },
      },
      post: {
        tags: ['orders'],
        summary: 'Оформить заказ из текущей корзины',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  email: { type: 'string' },
                  phone: { type: 'string' },
                  address: { type: 'string' },
                  payment: { type: 'string', enum: ['card', 'cash'] },
                },
                required: ['email', 'phone', 'address', 'payment'],
              },
            },
          },
        },
        responses: { 201: { description: 'Order' }, 409: { description: 'нет остатков' } },
      },
    },
    '/api/orders/{id}': {
      get: {
        tags: ['orders'],
        summary: 'Заказ по id (владелец или admin/manager)',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'Order' },
          403: { description: 'чужой заказ' },
          404: { description: 'не найден' },
        },
      },
    },
    '/api/orders/{id}/invoice': {
      get: {
        tags: ['orders'],
        summary: 'Скачать счёт (PDF)',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'application/pdf' } },
      },
    },
    '/api/auth/register': {
      post: {
        tags: ['auth'],
        summary: 'Регистрация { name, email, password }',
        responses: {
          201: { description: '{ user, accessToken }' },
          400: { description: 'валидация' },
        },
      },
    },
    '/api/auth/login': {
      post: {
        tags: ['auth'],
        summary: 'Логин { email, password }; для OTP-пользователей вернёт requiresOtp',
        responses: {
          200: { description: '{ user, accessToken } или { requiresOtp, otpToken }' },
          401: { description: 'неверный пароль' },
        },
      },
    },
    '/api/auth/otp': {
      post: {
        tags: ['auth'],
        summary: 'Подтвердить OTP { otpToken, code }',
        responses: {
          200: { description: '{ user, accessToken }' },
          401: { description: 'неверный код' },
        },
      },
    },
    '/api/auth/refresh': {
      post: {
        tags: ['auth'],
        summary: 'Обновить access token по httpOnly cookie',
        responses: { 200: { description: '{ accessToken }' }, 401: { description: 'нет cookie' } },
      },
    },
    '/api/auth/logout': {
      post: {
        tags: ['auth'],
        summary: 'Отозвать refresh token',
        responses: { 204: { description: 'ok' } },
      },
    },
    '/api/auth/me': {
      get: {
        tags: ['auth'],
        summary: 'Текущий пользователь (Bearer)',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'User' }, 401: { description: 'нет токена' } },
      },
    },
    '/api/users/me': {
      patch: {
        tags: ['users'],
        summary: 'Обновить профиль { name?, avatarHue? } (Bearer)',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'User' } },
      },
    },
    '/api/admin/users': {
      get: {
        tags: ['users'],
        summary: 'Список пользователей (admin)',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'User[]' }, 403: { description: 'нужна роль admin' } },
      },
    },
    '/api/admin/products': {
      post: {
        tags: ['products'],
        summary: 'Создать товар (admin/manager)',
        security: [{ bearerAuth: [] }],
        responses: { 201: { description: 'Product' }, 403: { description: 'недостаточно прав' } },
      },
    },
    '/api/admin/products/{id}': {
      patch: {
        tags: ['products'],
        summary: 'Обновить товар (admin/manager)',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'Product' }, 404: { description: 'не найден' } },
      },
      delete: {
        tags: ['products'],
        summary: 'Удалить товар (admin/manager)',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        security: [{ bearerAuth: [] }],
        responses: { 204: { description: 'ok' } },
      },
    },
    '/api/admin/stats': {
      get: {
        tags: ['users'],
        summary: 'Сводная статистика (admin/manager)',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'stats' } },
      },
    },
    '/api/feed': {
      get: {
        tags: ['realtime'],
        summary: 'SSE-лента событий заказов',
        responses: { 200: { description: 'text/event-stream' } },
      },
    },
    '/api/stocks/stream': {
      get: {
        tags: ['realtime'],
        summary: 'SSE live-остатков товара ?productId=',
        parameters: [{ name: 'productId', in: 'query', schema: { type: 'string', default: 'p1' } }],
        responses: { 200: { description: 'text/event-stream' } },
      },
    },
    '/ws/chat': {
      get: {
        tags: ['realtime'],
        summary: 'WebSocket-чат поддержки',
        responses: { 101: { description: 'Switching Protocols' } },
      },
    },
    '/api/files/upload': {
      post: {
        tags: ['files'],
        summary: 'Загрузка файла (multipart, max 1MB: png/jpg/pdf/txt)',
        responses: { 201: { description: '{ file }' }, 413: { description: 'слишком большой' } },
      },
    },
    '/api/files/{id}/download': {
      get: {
        tags: ['files'],
        summary: 'Скачать загруженный файл',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'attachment' }, 404: { description: 'не найден' } },
      },
    },
    '/api/demo/errors/{code}': {
      get: {
        tags: ['demo'],
        summary: 'Демо-ошибки: 401 | 403 | 404 | 500',
        parameters: [{ name: 'code', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'никогда' } },
      },
    },
    '/api/demo/slow': {
      get: {
        tags: ['demo'],
        summary: 'Медленный ответ ?ms= (детерминированная задержка)',
        parameters: [{ name: 'ms', in: 'query', schema: { type: 'integer', default: 2000 } }],
        responses: { 200: { description: '{ ok, ms }' } },
      },
    },
    '/api/demo/empty': {
      get: {
        tags: ['demo'],
        summary: 'Пустой список',
        responses: { 200: { description: '{ items: [] }' } },
      },
    },
    '/api/test/reset': {
      post: {
        tags: ['test'],
        summary: 'Сбросить БД к seed (только не в production)',
        responses: { 200: { description: '{ ok }' } },
      },
    },
    '/api/test/seed': {
      post: {
        tags: ['test'],
        summary: 'Пересидировать БД с произвольным seed',
        responses: { 200: { description: '{ ok }' } },
      },
    },
    '/api/test/flags': {
      get: {
        tags: ['test'],
        summary: 'Текущие chaos-флаги',
        responses: { 200: { description: 'ChaosFlags' } },
      },
      post: {
        tags: ['test'],
        summary: 'Установить chaos-флаги',
        responses: { 200: { description: 'ChaosFlags' } },
      },
    },
    '/api/test/otp': {
      get: {
        tags: ['test'],
        summary: 'Получить текущий OTP для 2FA-пользователя ?email=',
        parameters: [{ name: 'email', in: 'query', schema: { type: 'string' } }],
        responses: { 200: { description: '{ otp, validForSec }' } },
      },
    },
    '/api/test/create-user': {
      post: {
        tags: ['test'],
        summary: 'Создать пользователя { email, password, role, name? }',
        responses: { 201: { description: '{ user }' } },
      },
    },
  },
} as const
