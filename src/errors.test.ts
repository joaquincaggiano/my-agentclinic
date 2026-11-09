import { afterEach, describe, expect, it, vi } from 'vitest'
import { createApp } from './app.js'
import { openDatabase } from './db.js'
import { seed } from './seed.js'
import { createTestApp } from './testing.js'

afterEach(() => vi.restoreAllMocks())

describe('404 page', () => {
  it.each(['/nope', '/agents/999', '/agents/abc', '/appointments/999', '/agents/999/edit'])('%s renders the friendly page', async (path) => {
    const { app } = createTestApp()
    const res = await app.request(path)
    expect(res.status).toBe(404)
    const body = await res.text()
    expect(body).toContain('<h1>Page not found</h1>')
    expect(body).toContain('class="site-nav"')
    expect(body).toContain('name="viewport"')
  })
})

describe('500 page', () => {
  it('shows a generic message and leaks no details', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    const db = openDatabase(':memory:')
    seed(db)
    const app = createApp(db)
    db.exec('DROP TABLE agent_ailments')
    const res = await app.request('/agents/1')
    expect(res.status).toBe(500)
    const body = await res.text()
    expect(body).toContain('<h1>Something went wrong</h1>')
    expect(body).not.toContain('agent_ailments')
    expect(body).not.toMatch(/SqliteError|no such table|at .*\.ts/)
    expect(console.error).toHaveBeenCalled()
  })
})
