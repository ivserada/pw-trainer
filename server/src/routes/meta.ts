import type { FastifyInstance } from 'fastify'
import { openapi } from '../openapi.js'

const DOCS_HTML = `<!doctype html>
<html lang="ru">
<head>
<meta charset="utf-8" />
<title>Playwright Practice Shop — API docs</title>
<style>
  body { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; max-width: 960px; margin: 2rem auto; padding: 0 1rem; color: #1c1917; }
  h1 { font-size: 1.4rem; } h2 { margin-top: 2rem; font-size: 1.1rem; }
  .op { display: flex; gap: .75rem; align-items: baseline; padding: .3rem 0; border-bottom: 1px solid #e7e5e4; }
  .m { font-weight: 700; width: 4rem; } .get { color: #047857; } .post { color: #b45309; }
  .patch { color: #6d28d9; } .delete { color: #b91c1c; }
  code { background: #f5f5f4; padding: .1rem .35rem; border-radius: 4px; }
  .s { color: #78716c; font-size: .85rem; }
</style>
</head>
<body>
<h1>Playwright Practice Shop API</h1>
<p>OpenAPI 3.0 JSON: <a href="/api/openapi.json">/api/openapi.json</a></p>
<div id="app">Загрузка…</div>
<script>
fetch('/api/openapi.json').then(r => r.json()).then(spec => {
  const app = document.getElementById('app')
  const byTag = {}
  for (const [path, methods] of Object.entries(spec.paths)) {
    for (const [method, op] of Object.entries(methods)) {
      const tag = (op.tags || ['default'])[0]
      byTag[tag] = byTag[tag] || []
      byTag[tag].push({ method, path, summary: op.summary })
    }
  }
  app.innerHTML = Object.entries(byTag).map(([tag, ops]) =>
    '<h2>#' + tag + '</h2>' + ops.map(o =>
      '<div class="op"><span class="m ' + o.method + '">' + o.method.toUpperCase() +
      '</span><code>' + o.path + '</code><span class="s">' + (o.summary || '') + '</span></div>'
    ).join('')
  ).join('')
})
</script>
</body>
</html>`

export function registerMetaRoutes(app: FastifyInstance): void {
  app.get('/api/health', async () => ({ ok: true, now: new Date().toISOString() }))
  app.get('/api/openapi.json', async () => openapi)
  app.get('/api/docs', async (_req, reply) =>
    reply.type('text/html; charset=utf-8').send(DOCS_HTML),
  )
}
