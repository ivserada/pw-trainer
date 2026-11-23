import type { FastifyInstance } from 'fastify'
import { z } from '../lib/validate.js'
import { getDB } from '../store.js'

const progressSchema = z.object({
  id: z.string().min(2).max(80),
  done: z.boolean(),
})

export function registerPracticeRoutes(app: FastifyInstance): void {
  app.get('/api/practice/progress', async () => {
    const db = getDB()
    const entries = Object.entries(db.practice).filter(([, done]) => done)
    return {
      doneCount: entries.length,
      tasks: Object.fromEntries(entries),
    }
  })

  app.post('/api/practice/progress', async (request) => {
    const db = getDB()
    const body = progressSchema.parse(request.body)
    db.practice[body.id] = body.done
    const entries = Object.entries(db.practice).filter(([, done]) => done)
    return {
      doneCount: entries.length,
      tasks: Object.fromEntries(entries),
    }
  })
}
