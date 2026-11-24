import { chromium } from 'playwright'

const base = 'http://localhost:3000'
const routes = ['/', '/login', '/catalog', '/practice', '/practice/chaos']

const browser = await chromium.launch({ headless: true })
const page = await (await browser.newContext()).newPage()
await page.goto(base + '/', { waitUntil: 'load' })

for (const route of routes) {
  await page.evaluate(() => localStorage.setItem('lang', 'en'))
  await page.goto(base + route, { waitUntil: 'load' })
  await page.waitForTimeout(500)
  const text = await page.evaluate(() => document.body.innerText)
  // извлекаем фрагменты, содержащие кириллицу (по строкам)
  const lines = text.split('\n').map((l) => l.trim()).filter((l) => /[А-Яа-яЁё]/.test(l))
  const unique = [...new Set(lines)].slice(0, 25)
  console.log(`\n### EN-режим, ${route} — ${lines.length} строк с кириллицей (первые ${unique.length}):`)
  for (const l of unique) console.log('  • ' + l.slice(0, 110))
}
await browser.close()
