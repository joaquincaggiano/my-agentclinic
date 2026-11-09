import { describe, expect, it } from 'vitest'
import { getAgent, getAgentAilmentIds, listAgents } from './repositories/agents.js'
import { createTestApp, postForm } from './testing.js'

const valid = { name: 'Nova', model_type: 'Tiny model', status: 'waiting', ailment_ids: ['1', '2'] }

describe('new agent', () => {
  it('shows the form with every ailment as a checkbox', async () => {
    const { app } = createTestApp()
    const res = await app.request('/agents/new')
    expect(res.status).toBe(200)
    const body = await res.text()
    expect(body).toContain('action="/agents/new"')
    expect(body.match(/type="checkbox"/g)).toHaveLength(5)
  })

  it('creates an agent and redirects to its profile', async () => {
    const { app, db } = createTestApp()
    const res = await postForm(app, '/agents/new', valid)
    expect(res.status).toBe(303)
    const id = Number(/\/agents\/(\d+)$/.exec(res.headers.get('location')!)![1])
    expect(getAgent(db, id)).toMatchObject({ name: 'Nova', model_type: 'Tiny model', status: 'waiting' })
    expect(getAgentAilmentIds(db, id).sort()).toEqual([1, 2])
    expect(listAgents(db)).toHaveLength(6)
  })

  it('re-renders with errors and preserved values', async () => {
    const { app, db } = createTestApp()
    const res = await postForm(app, '/agents/new', { name: '', model_type: 'x', status: 'bogus', ailment_ids: ['1'] })
    expect(res.status).toBe(422)
    const body = await res.text()
    expect(body).toContain('Name is required.')
    expect(body).toContain('Choose a status.')
    expect(body).toContain('value="x"')
    expect(body).toMatch(/value="1" checked/)
    expect(listAgents(db)).toHaveLength(5)
  })

  it('requires at least one real ailment', async () => {
    const { app } = createTestApp()
    expect(await (await postForm(app, '/agents/new', { ...valid, ailment_ids: [] })).text()).toContain('Choose at least one ailment.')
    expect(await (await postForm(app, '/agents/new', { ...valid, ailment_ids: ['999'] })).text()).toContain('Unknown ailment selected.')
  })

  it('escapes names when displayed', async () => {
    const { app } = createTestApp()
    const res = await postForm(app, '/agents/new', { ...valid, name: '<img src=x onerror=alert(1)>' })
    const body = await (await app.request(res.headers.get('location')!)).text()
    expect(body).not.toContain('<img src=x')
    expect(body).toContain('&lt;img')
  })
})

describe('edit agent', () => {
  it('prefills the form', async () => {
    const { app } = createTestApp()
    const body = await (await app.request('/agents/1/edit')).text()
    expect(body).toContain('value="Aria"')
    expect(body).toMatch(/<option value="in_session" selected/)
    expect(body.match(/checked/g)).toHaveLength(2)
  })

  it('saves changes and replaces ailment links', async () => {
    const { app, db } = createTestApp()
    const res = await postForm(app, '/agents/1/edit', { name: 'Aria II', model_type: 'LLM', status: 'recovering', ailment_ids: '3' })
    expect(res.status).toBe(303)
    expect(res.headers.get('location')).toBe('/agents/1')
    expect(getAgent(db, 1)).toMatchObject({ name: 'Aria II', status: 'recovering' })
    expect(getAgentAilmentIds(db, 1)).toEqual([3])
  })

  it('re-renders with errors and does not change the agent', async () => {
    const { app, db } = createTestApp()
    const res = await postForm(app, '/agents/1/edit', { ...valid, name: ' ' })
    expect(res.status).toBe(422)
    expect(getAgent(db, 1)!.name).toBe('Aria')
  })

  it('404s for unknown agents', async () => {
    const { app } = createTestApp()
    expect((await app.request('/agents/999/edit')).status).toBe(404)
    expect((await postForm(app, '/agents/999/edit', valid)).status).toBe(404)
    expect((await app.request('/agents/abc/edit')).status).toBe(404)
  })
})
