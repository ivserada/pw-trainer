# Playwright Practice Shop

Учебный интернет-магазин для тренировки автотестов на Playwright: от базовых локаторов
до WebSocket, Shadow DOM и chaos-режима. Всё работает локально — без CDN и аналитики,
с детерминированным seed-данными.

## Быстрый старт

```bash
# Вариант 1: Node (>= 20)
npm install
npm run dev          # client на http://localhost:3000, api на :3100

# Вариант 2: Docker
docker compose up    # всё на http://localhost:3000
```

Откройте http://localhost:3000 — и начинайте с раздела «Практика».

## Seed-данные

| Роль     | Email              | Пароль      | Примечание         |
| -------- | ------------------ | ----------- | ------------------ |
| customer | customer@shop.test | password123 | обычный покупатель |
| manager  | manager@shop.test  | password123 | доступ к админке   |
| admin    | admin@shop.test    | password123 | включена 2FA (OTP) |

- 64 товара в 5 категориях, 10 заказов, отзывы.
- Промокоды: `SALE10` (−10%), `PW20` (−20%).
- Кнопка **«Сбросить данные»** в подвале (или `POST /api/test/reset`) возвращает всё к seed.

## Страницы и уровни

Каждая учебная страница отмечена уровнем. Полный список — на `/practice` (85 заданий
с подсказками-спойлерами).

| Уровень | Что тренируем                                                                                                                               | Где                                                                                                             |
| ------- | ------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| 🟢      | базовые локаторы, формы, ссылки, корзина                                                                                                    | каталог, карточка, `/practice/forms`, `/practice/links`                                                         |
| 🟡      | дебаунс, фильтры+query, пагинация, таблицы, оверлеи, окна                                                                                   | `/practice/autocomplete`, `/practice/pagination`, `/practice/tables`, `/practice/overlays`, `/practice/windows` |
| 🔴      | iframe, Shadow DOM, DnD, canvas, WebSocket/SSE, ошибки API, компоненты, hotkeys, a11y, скриншоты, устройства, 2FA, таймеры, upload, админка | `/practice/*`, `/admin`                                                                                         |

## Тестовое API

Эндпоинты ниже доступны вне production (или при `ENABLE_TEST_API=true`):

| Метод    | Путь                    | Назначение                                     |
| -------- | ----------------------- | ---------------------------------------------- |
| POST     | `/api/test/reset`       | сброс к seed                                   |
| POST     | `/api/test/seed`        | пересидирование                                |
| GET/POST | `/api/test/flags`       | chaos-флаги                                    |
| GET      | `/api/test/otp?email=…` | текущий OTP для 2FA                            |
| POST     | `/api/test/create-user` | создать пользователя `{email, password, role}` |

Прогресс практики: `GET/POST /api/practice/progress`. OpenAPI: `/api/docs`.

## Chaos-режим

`/practice/chaos` или `POST /api/test/flags`:

```json
{
  "apiDelayMs": 500, // случайная задержка 0..N мс на каждый запрос
  "apiErrorRate": 0.3, // доля случайных 500
  "vanishMs": 1500, // data-chaos="vanish" элементы исчезают через N мс
  "movingButtons": true, // кнопки «убегают» от курсора
  "rerenderMs": 400, // принудительный re-render каждые N мс
  "slowImages": true // картинки грузятся ~900 мс
}
```

В обычном режиме всё выключено — флаги `0/false`.

## Разработка

```bash
npm run dev        # client :3000 + api :3100 (HMR)
npm run build      # typecheck сервера + production-сборка клиента
npm run lint       # ESLint
npm run typecheck  # tsc по всем workspaces
npm run test:e2e   # Playwright (нужен build клиента)
```

## Структура

```
client/   React + Vite + TypeScript (SPA)
server/   Node.js + Fastify, in-memory БД, JWT + httpOnly refresh cookie
tests/    Playwright: фикстуры (reset/flags per-test), page objects, спеки
```

## Деплой

### Render.com (рекомендуется, бесплатный тариф)

Репозиторий содержит `render.yaml` — Render подхватит конфигурацию автоматически.

1. Запушьте репозиторий на GitHub.
2. Зарегистрируйтесь на [render.com](https://render.com) через GitHub.
3. **New → Web Service → Connect repository** (выберите `pw-trainer`).
4. Render сам определит `render.yaml`: runtime `Docker`, healthcheck `/api/health`,
   env-переменные подставятся из файла. Менять ничего не нужно → **Deploy**.
5. Через 2–4 минуты (сборка Docker-образа) сервис доступен по адресу
   `https://pw-trainer.onrender.com`.

Нюансы бесплатного тарифа:
- Сервис «засыпает» после 15 минут без трафика; первый запрос будит его (~30–60 с).
  Лечится бесплатным монитором вроде UptimeRobot, пингующим `/api/health` раз в 5 минут.
- WebSocket (чат) и SSE работают из коробки.
- 750 часов/мес — хватает на непрерывную работу одного инстанса.

E2E-тесты можно гонять против задеплоенного инстанса:

```bash
BASE_URL=https://pw-trainer.onrender.com npx playwright test --project=chromium
# tests/playwright.config.ts: reuseExistingServer поднимет локальный сервер,
# если BASE_URL не отвечает — для деплоя он отвечает, webServer не стартует
```

### Fly.io (альтернатива без «сна», ~бесплатно)

```bash
fly launch --name pw-trainer --region waw   # сгенерирует fly.toml
fly deploy
```

Требуется карта для верификации (~$5 кредитов/мес, приложению хватает).

### VPS (Oracle Free Tier и т.п.)

```bash
git clone <repo> && cd pw-trainer
docker compose up -d   # за nginx/Caddy с HTTPS по вкусу
```

## CI

GitHub Actions (`.github/workflows/ci.yml`): lint → typecheck → build → e2e (chromium)
с артефактом отчёта. Локально `docker compose up` поднимает полную платформу одной командой.
