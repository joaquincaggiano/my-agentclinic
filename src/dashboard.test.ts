import { describe, expect, it } from 'vitest'
import { listAppointments } from './repositories/appointments.js'
import { createTestApp, NOW, postForm } from './testing.js'

const setup = () => createTestApp({ now: () => NOW })
const book = (app: ReturnType<typeof setup>['app'], agent: number, therapist: number, when: string) =>
  postForm(app, `/agents/${agent}/appointments`, { therapist_id: String(therapist), scheduled_at: when })

const tile = (body: string, label: string) => {
  const m = new RegExp(`<span class="tile-value">(\\d+)</span><span class="tile-label">${label}</span>`).exec(body)
  return m ? Number(m[1]) : undefined
}

describe('GET /dashboard', () => {
  it('shows summary counts and tables', async () => {
    const { app } = setup()
    const body = await (await app.request('/dashboard')).text()
    expect(tile(body, 'Agents')).toBe(5)
    expect(tile(body, 'Open appointments')).toBe(0)
    expect(tile(body, 'Ailments in flight')).toBe(0)
    expect(body).toContain('No appointments yet.')
    expect(body).toContain('Aria')
    expect(body).toContain('Prompt fatigue')
    expect(body).toContain('class="table-scroll"')
  })

  it('updates counts after booking, completing and cancelling', async () => {
    const { app, db } = setup()
    await book(app, 1, 1, '2026-11-20T10:00')
    await book(app, 3, 2, '2026-11-21T10:00')
    let body = await (await app.request('/dashboard')).text()
    expect(tile(body, 'Open appointments')).toBe(2)
    expect(tile(body, 'Ailments in flight')).toBe(4)
    expect(body).toContain('2026-11-20 10:00 UTC')

    const [first, second] = listAppointments(db)
    expect((await postForm(app, `/appointments/${first.id}/status`, { status: 'completed' })).headers.get('location')).toBe('/dashboard')
    expect((await postForm(app, `/appointments/${second.id}/status`, { status: 'cancelled' })).status).toBe(303)
    body = await (await app.request('/dashboard')).text()
    expect(tile(body, 'Open appointments')).toBe(0)
    expect(tile(body, 'Ailments in flight')).toBe(0)
    expect(body).toContain('badge-completed')
    expect(body).toContain('badge-cancelled')
    expect(body).not.toContain('>Complete</button>')
  })

  it('offers actions only for scheduled appointments', async () => {
    const { app } = setup()
    await book(app, 1, 1, '2026-11-20T10:00')
    const body = await (await app.request('/dashboard')).text()
    expect(body).toContain('>Complete</button>')
    expect(body).toContain('>Cancel</button>')
  })
})

describe('POST /appointments/:id/status', () => {
  it('rejects transitions from a non-scheduled state', async () => {
    const { app, db } = setup()
    await book(app, 1, 1, '2026-11-20T10:00')
    const [ap] = listAppointments(db)
    await postForm(app, `/appointments/${ap.id}/status`, { status: 'completed' })
    const res = await postForm(app, `/appointments/${ap.id}/status`, { status: 'cancelled' })
    expect(res.status).toBe(409)
    expect(listAppointments(db)[0].status).toBe('completed')
  })

  it('rejects unknown statuses and ids', async () => {
    const { app } = setup()
    await book(app, 1, 1, '2026-11-20T10:00')
    expect((await postForm(app, '/appointments/1/status', { status: 'scheduled' })).status).toBe(400)
    expect((await postForm(app, '/appointments/1/status', {})).status).toBe(400)
    expect((await postForm(app, '/appointments/999/status', { status: 'completed' })).status).toBe(404)
    expect((await postForm(app, '/appointments/abc/status', { status: 'completed' })).status).toBe(404)
  })
})
