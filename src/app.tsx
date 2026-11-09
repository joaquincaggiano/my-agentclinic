import { relative } from 'node:path'
import { Hono } from 'hono'
import { serveStatic } from '@hono/node-server/serve-static'
import type { Db } from './db.js'
import { projectRoot } from './paths.js'
import { getAgent, listAgents } from './repositories/agents.js'
import { listAilments } from './repositories/ailments.js'
import { Home } from './pages/Home.js'
import { Agents } from './pages/Agents.js'
import { AgentProfile } from './pages/AgentProfile.js'
import { Ailments } from './pages/Ailments.js'

export const createApp = (db: Db) => {
  const app = new Hono()

  app.use('/styles.css', serveStatic({ root: relative(process.cwd(), `${projectRoot}public`) || '.' }))

  app.get('/', (c) => c.html(<Home />))
  app.get('/agents', (c) => c.html(<Agents agents={listAgents(db)} />))
  app.get('/agents/:id', (c) => {
    const raw = c.req.param('id')
    const agent = /^\d+$/.test(raw) ? getAgent(db, Number(raw)) : undefined
    return agent ? c.html(<AgentProfile agent={agent} />) : c.notFound()
  })
  app.get('/ailments', (c) => c.html(<Ailments ailments={listAilments(db)} />))

  return app
}
