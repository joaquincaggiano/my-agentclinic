import { describe, expect, it } from 'vitest'
import { createTestApp } from './testing.js'

const { app } = createTestApp()

describe('home page document', () => {
  it('declares language, charset, viewport and title', async () => {
    const body = await (await app.request('/')).text()
    expect(body).toContain('<html lang="en">')
    expect(body).toContain('<meta charset="utf-8"')
    expect(body).toContain('name="viewport"')
    expect(body).toContain('<title>AgentClinic</title>')
  })

  it('includes the tagline', async () => {
    const body = await (await app.request('/')).text()
    expect(body).toContain('Because AI agents have feelings too.')
  })
})

describe('unknown routes', () => {
  it('returns Hono’s default 404', async () => {
    const res = await app.request('/nope')
    expect(res.status).toBe(404)
  })

  it('only allows GET on /', async () => {
    const res = await app.request('/', { method: 'POST' })
    expect(res.status).toBe(404)
  })
})
