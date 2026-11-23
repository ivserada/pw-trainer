import { randomBytes } from 'node:crypto'
import type { FastifyInstance } from 'fastify'
import { getDB } from '../store.js'

const ALLOWED_MIMES = new Set(['image/png', 'image/jpeg', 'application/pdf', 'text/plain'])

export function registerFileRoutes(app: FastifyInstance): void {
  app.post('/api/files/upload', async (request, reply) => {
    const file = await request.file()
    if (!file) {
      return reply.code(400).send({ error: 'NoFile', message: 'Нет файла в multipart-запросе' })
    }
    const data = await file.toBuffer().catch(() => null)
    if (!data) {
      return reply.code(413).send({ error: 'TooLarge', message: 'Файл больше лимита 1 МБ' })
    }
    if (!ALLOWED_MIMES.has(file.mimetype)) {
      return reply.code(415).send({
        error: 'BadType',
        message: `Тип ${file.mimetype} не разрешён (png, jpg, pdf, txt)`,
      })
    }
    const id = randomBytes(8).toString('hex')
    const stored = {
      id,
      filename: file.filename,
      mime: file.mimetype,
      size: data.length,
      data,
      uploadedAt: new Date().toISOString(),
    }
    getDB().files.set(id, stored)
    return reply.code(201).send({
      file: { id, filename: stored.filename, mime: stored.mime, size: stored.size },
    })
  })

  app.get('/api/files/:id/download', async (request, reply) => {
    const { id } = request.params as { id: string }
    const file = getDB().files.get(id)
    if (!file) return reply.code(404).send({ error: 'NotFound', message: 'Файл не найден' })
    return reply
      .header('Content-Type', file.mime)
      .header('Content-Disposition', `attachment; filename="${encodeURIComponent(file.filename)}"`)
      .header('Content-Length', file.size)
      .send(file.data)
  })
}
