import { describe, expect, it } from 'vitest'
import { createApp } from './app.js'
import { openDatabase } from './db.js'
import { createTestApp } from './testing.js'
import { listAgents, getAgent } from './repositories/agents.js'
import { listAilments } from './repositories/ailments.js'

const { app, db } = createTestApp()
const get = async (p: string) => {
  const res = await app.request(p)
  return { res, body: await res.text() }
}

describe('GET /agents', () => {
  it('lists every agent with a profile link', async () => {
    const { res, body } = await get('/agents')
    expect(res.status).toBe(200)
    expect(res.headers.get('content-type')).toContain('text/html')
    for (const a of listAgents(db)) {
      expect(body).toContain(`href="/agents/${a.id}"`)
      expect(body).toContain(a.name)
      expect(body).toContain(a.model_type)
    }
  })
})

describe('GET /agents/:id', () => {
  it('shows the profile with presenting complaints', async () => {
    const agent = getAgent(db, listAgents(db)[0].id)!
    const { res, body } = await get(`/agents/${agent.id}`)
    expect(res.status).toBe(200)
    expect(body).toContain(agent.name)
    expect(body).toContain(agent.model_type)
    expect(agent.ailments.length).toBeGreaterThan(0)
    for (const al of agent.ailments) expect(body).toContain(al.name)
  })

  it('404s for unknown and non-numeric ids', async () => {
    expect((await get('/agents/9999')).res.status).toBe(404)
    expect((await get('/agents/abc')).res.status).toBe(404)
  })
})

describe('GET /ailments', () => {
  it('lists every ailment', async () => {
    const { res, body } = await get('/ailments')
    expect(res.status).toBe(200)
    for (const a of listAilments(db)) expect(body).toContain(a.name)
  })
})

describe('navigation', () => {
  it.each([
    ['/', 'Home'],
    ['/agents', 'Agents'],
    ['/agents/1', 'Agents'],
    ['/ailments', 'Ailments'],
  ])('%s marks %s as current', async (path, label) => {
    const { body } = await get(path)
    for (const l of ['Home', 'Agents', 'Ailments']) expect(body).toContain(`>${l}</a>`)
    expect(body.match(/aria-current="page"/g)).toHaveLength(1)
    expect(body).toMatch(new RegExp(`aria-current="page">${label}</a>`))
    expect(body).toContain('name="viewport"')
  })
})

describe('stylesheet', () => {
  it('defines custom properties', async () => {
    const css = (await get('/styles.css')).body
    expect(css).toMatch(/:root\s*{[^}]*--color-/)
  })
})

describe('page structure', () => {
  it.each(['/', '/agents', '/agents/1', '/ailments'])('%s has exactly one h1', async (path) => {
    const { body } = await get(path)
    expect(body.match(/<h1[ >]/g)).toHaveLength(1)
  })

  it('renders the status badge with a kebab-case class', async () => {
    const { body } = await get('/agents')
    expect(body).toContain('badge-in-session')
    expect(body).not.toContain('badge-in_session')
  })

  it('escapes agent names', async () => {
    db.prepare("INSERT INTO agents (name, model_type) VALUES ('<script>alert(1)</script>', 'm')").run()
    const { body } = await get('/agents')
    expect(body).not.toContain('<script>alert(1)</script>')
    expect(body).toContain('&lt;script&gt;')
  })
})

describe('empty states', () => {
  it('shows messages when there is no data', async () => {
    const db = openDatabase(':memory:')
    const empty = createApp(db)
    expect(await (await empty.request('/agents')).text()).toContain('No agents have checked in yet.')
    expect(await (await empty.request('/ailments')).text()).toContain('No ailments recorded.')
  })
})

describe('static assets independent of cwd', () => {
  it('serves the stylesheet', async () => {
    expect((await get('/styles.css')).res.status).toBe(200)
  })
})
