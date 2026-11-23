import { seedDatabase } from './seed.js'
import type { Cart, DB } from './types.js'

let db: DB = seedDatabase()

export function getDB(): DB {
  return db
}

export function resetDB(): DB {
  db = seedDatabase()
  return db
}

export function getOrCreateCart(db: DB, sessionId: string): Cart {
  let cart = db.carts.get(sessionId)
  if (!cart) {
    cart = { sessionId, userId: null, items: [], promoCode: null }
    db.carts.set(sessionId, cart)
  }
  return cart
}
