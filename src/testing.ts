import { createApp } from './app.js'
import { openDatabase } from './db.js'
import { seed } from './seed.js'

export const render = async (node: unknown) =>
  String(await (node as { toString(): string | Promise<string> }).toString())

export const createTestApp = () => {
  const db = openDatabase(':memory:')
  seed(db)
  return { db, app: createApp(db) }
}
