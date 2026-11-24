import { chromium } from 'playwright'

const base = 'http://localhost:3000'
const routes = [
  '/',
  '/catalog',
  '/product/p1',
  '/cart',
  '/checkout',
  '/login',
  '/register',
  '/account',
  '/admin',
  '/practice',
  '/practice/chaos',
  '/practice/forms',
  '/practice/links',
  '/practice/autocomplete',
  '/practice/pagination',
  '/practice/tables',
  '/practice/overlays',
  '/practice/dynamic',
  '/practice/windows',
  '/practice/iframes',
  '/practice/shadow',
  '/practice/dnd',
  '/practice/canvas',
  '/practice/realtime',
  '/practice/errors',
  '/practice/components',
  '/practice/hotkeys',
  '/practice/a11y',
  '/practice/screenshot',
  '/practice/device',
  '/practice/otp',
  '/practice/timers',
  '/practice/upload',
  '/practice/payment-frame',
  '/some-unknown-route',
]

const browser = await chromium.launch({ headless: true })
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } })
const page = await ctx.newPage()
const pageErrors = []
page.on('pageerror', (e) => pageErrors.push(e.message))

async function snapshot() {
  return page.evaluate(() => ({
    htmlLang: document.documentElement.lang,
    text: document.body.innerText,
  }))
}

await page.goto(base + '/', { waitUntil: 'load' })

for (const route of routes) {
  let res
  try {
    await page.evaluate(() => localStorage.setItem('lang', 'ru'))
    await page.goto(base + route, { waitUntil: 'load', timeout: 15000 })
    await page.waitForTimeout(600)
    const ru = await snapshot()

    await page.evaluate(() => localStorage.setItem('lang', 'en'))
    await page.reload({ waitUntil: 'load', timeout: 15000 })
    await page.waitForTimeout(600)
    const en = await snapshot()

    const ruCyr = (ru.text.match(/[А-Яа-яЁё]/g) || []).length
    const enCyr = (en.text.match(/[А-Яа-яЁё]/g) || []).length
    const changed = ru.text !== en.text
    let status
    if (!changed) status = ruCyr < 5 ? 'NEUTRAL' : '❌ НЕ ЛОКАЛИЗОВАНА (текст не меняется)'
    else if (enCyr > 20) status = '⚠️ ЧАСТИЧНО (в EN остался кириллица)'
    else status = '✅ локализована'
    res = { status, ruCyr, enCyr, htmlLang: `${ru.htmlLang}→${en.htmlLang}` }
    // вернуть RU для следующих страниц
    await page.evaluate(() => localStorage.setItem('lang', 'ru'))
  } catch (e) {
    res = { status: `❌ ОШИБКА: ${String(e.message || e).slice(0, 60)}` }
  }
  console.log(`${route.padEnd(28)} ${res.htmlLang ?? '-'.padEnd(6)}  RU-кир:${String(res.ruCyr ?? '-').padStart(4)}  EN-кир:${String(res.enCyr ?? '-').padStart(4)}  ${res.status}`)
}

await browser.close()
if (pageErrors.length) console.log('\nPAGE ERRORS:', pageErrors.slice(0, 3))
