import { serve } from '@hono/node-server'
import { createApp } from './app.js'
import { openDatabase } from './db.js'
import { seed } from './seed.js'

const db = openDatabase()
seed(db)
const app = createApp(db)

const port = Number(process.env.PORT ?? 3000)

serve({ fetch: app.fetch, port }, (info) => {
  console.log(`AgentClinic listening on http://localhost:${info.port}`)
})
