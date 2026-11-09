import { createApp, type AppOptions } from './app.js'
import { openDatabase } from './db.js'
import { seed } from './seed.js'

export const render = async (node: unknown) =>
  String(await (node as { toString(): string | Promise<string> }).toString())

export const createTestApp = (options?: AppOptions) => {
  const db = openDatabase(':memory:')
  seed(db)
  return { db, app: createApp(db, options) }
}

type App = ReturnType<typeof createApp>

/** Submit a urlencoded form; array values become repeated fields. */
export const postForm = (app: App, path: string, fields: Record<string, string | string[]>) => {
  const body = new URLSearchParams()
  for (const [key, value] of Object.entries(fields)) {
    for (const v of Array.isArray(value) ? value : [value]) body.append(key, v)
  }
  return app.request(path, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body,
  })
}

/** Fixed "now" for deterministic booking tests. */
export const NOW = new Date('2026-11-09T12:00:00Z')
