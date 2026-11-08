import { describe, expect, it } from 'vitest'
import app from './app.js'

describe('GET /', () => {
  it('serves the home page', async () => {
    const res = await app.request('/')
    expect(res.status).toBe(200)
    expect(res.headers.get('content-type')).toContain('text/html')
    const body = await res.text()
    expect(body).toMatch(/^<!DOCTYPE html>/)
    expect(body).toContain('<h1>AgentClinic is open for business</h1>')
  })

  it('renders inside the shared layout', async () => {
    const body = await (await app.request('/')).text()
    expect(body).toContain('<header')
    expect(body).toContain('<main')
    expect(body).toContain('<footer')
    expect(body).toContain('<link rel="stylesheet" href="/styles.css"')
  })
})

describe('GET /styles.css', () => {
  it('serves the stylesheet', async () => {
    const res = await app.request('/styles.css')
    expect(res.status).toBe(200)
    expect(res.headers.get('content-type')).toContain('text/css')
  })
})
