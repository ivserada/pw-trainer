import { chromium } from 'playwright'
const base = 'http://localhost:3000'
const routes = [
  '/',
  '/catalog',
  '/product/p1',
  '/login',
  '/account',
  '/admin',
  '/practice',
  '/practice/chaos',
  '/practice/forms',
  '/practice/links',
  '/practice/tables',
  '/practice/components',
  '/practice/overlays',
  '/practice/dynamic',
  '/practice/errors',
  '/practice/hotkeys',
  '/practice/a11y',
  '/practice/screenshot',
  '/practice/device',
  '/practice/otp',
  '/practice/timers',
  '/practice/upload',
  '/practice/pagination',
  '/practice/realtime',
  '/practice/iframes',
  '/practice/shadow',
  '/practice/dnd',
  '/practice/canvas',
  '/practice/autocomplete',
  '/practice/windows',
  '/practice/payment-frame',
]
const browser = await chromium.launch({ headless: true })
const page = await (await browser.newContext()).newPage()
await page.goto(base + '/', { waitUntil: 'load' })
const CYR = /[А-Яа-яЁё]/
for (const r of routes) {
  await page.evaluate(() => localStorage.setItem('lang', 'en'))
  await page.goto(base + r, { waitUntil: 'load' })
  await page.waitForTimeout(500)
  const text = await page.evaluate(() => document.body.innerText)
  const lines = [...new Set(text.split('\n').map((l) => l.trim()).filter((l) => CYR.test(l)))]
  console.log('\n' + r + ' [' + lines.length + ']')
  for (const l of lines.slice(0, 18)) console.log('  • ' + l.slice(0, 100))
}
await browser.close()
