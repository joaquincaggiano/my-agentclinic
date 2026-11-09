import { describe, expect, it } from 'vitest'
import { getAppointment, listAppointments } from './repositories/appointments.js'
import { createTestApp, NOW, postForm } from './testing.js'

const setup = () => createTestApp({ now: () => NOW })
const FUTURE = '2026-11-20T10:30'

describe('agent profile booking form', () => {
  it('shows the form with a therapist for each option', async () => {
    const { app } = setup()
    const body = await (await app.request('/agents/1')).text()
    expect(body).toContain('action="/agents/1/appointments"')
    expect(body).toContain('name="therapist_id"')
    expect(body).toContain('type="datetime-local"')
    expect(body).toContain('Dr. Ada Bytes')
    expect(body).toContain('Recommended:')
  })
})

describe('POST /agents/:id/appointments', () => {
  it('books and redirects to the confirmation page', async () => {
    const { app, db } = setup()
    const res = await postForm(app, '/agents/1/appointments', { therapist_id: '1', scheduled_at: FUTURE })
    expect(res.status).toBe(303)
    const location = res.headers.get('location')!
    expect(location).toMatch(/^\/appointments\/\d+$/)

    const page = await app.request(location)
    expect(page.status).toBe(200)
    const body = await page.text()
    expect(body).toContain('Appointment confirmed')
    expect(body).toContain('Aria')
    expect(body).toContain('Dr. Ada Bytes')
    expect(body).toContain('2026-11-20 10:30 UTC')
    expect(body).toContain('scheduled')
    expect(listAppointments(db)).toHaveLength(1)
  })

  it.each([
    ['missing fields', {}, ['Choose a therapist.', 'Choose a date and time.']],
    ['past time', { therapist_id: '1', scheduled_at: '2026-11-01T10:00' }, ['Choose a time in the future.']],
    ['malformed time', { therapist_id: '1', scheduled_at: 'nope' }, ['Enter a valid date and time.']],
    ['unknown therapist', { therapist_id: '999', scheduled_at: FUTURE }, ['Choose a therapist from the list.']],
    ['non-numeric therapist', { therapist_id: 'abc', scheduled_at: FUTURE }, ['Choose a therapist.']],
  ])('re-renders with errors for %s', async (_name, fields, messages) => {
    const { app, db } = setup()
    const res = await postForm(app, '/agents/1/appointments', fields)
    expect(res.status).toBe(422)
    const body = await res.text()
    for (const m of messages) expect(body).toContain(m)
    expect(body).toContain('<h1>Aria</h1>')
    expect(listAppointments(db)).toHaveLength(0)
  })

  it('preserves submitted values on error', async () => {
    const { app } = setup()
    const body = await (await postForm(app, '/agents/1/appointments', { therapist_id: '2', scheduled_at: '2026-11-01T10:00' })).text()
    expect(body).toMatch(/<option value="2" selected/)
    expect(body).toContain('value="2026-11-01T10:00"')
  })

  it('rejects double booking the same therapist and time', async () => {
    const { app, db } = setup()
    expect((await postForm(app, '/agents/1/appointments', { therapist_id: '1', scheduled_at: FUTURE })).status).toBe(303)
    const res = await postForm(app, '/agents/2/appointments', { therapist_id: '1', scheduled_at: FUTURE })
    expect(res.status).toBe(422)
    expect(await res.text()).toContain('already booked')
    expect(listAppointments(db)).toHaveLength(1)
  })

  it('escapes echoed input', async () => {
    const { app } = setup()
    const body = await (await postForm(app, '/agents/1/appointments', { therapist_id: '1', scheduled_at: '"><script>alert(1)</script>' })).text()
    expect(body).not.toContain('<script>alert(1)</script>')
  })

  it('404s for an unknown or invalid agent', async () => {
    const { app } = setup()
    expect((await postForm(app, '/agents/999/appointments', { therapist_id: '1', scheduled_at: FUTURE })).status).toBe(404)
    expect((await postForm(app, '/agents/abc/appointments', { therapist_id: '1', scheduled_at: FUTURE })).status).toBe(404)
  })

  it('rejects oversized bodies', async () => {
    const { app } = setup()
    const res = await postForm(app, '/agents/1/appointments', { therapist_id: '1', scheduled_at: 'x'.repeat(20_000) })
    expect(res.status).toBe(413)
  })
})

describe('GET /appointments/:id', () => {
  it('404s for unknown and invalid ids', async () => {
    const { app } = setup()
    expect((await app.request('/appointments/999')).status).toBe(404)
    expect((await app.request('/appointments/abc')).status).toBe(404)
  })

  it('shows an existing appointment', async () => {
    const { app, db } = setup()
    await postForm(app, '/agents/3/appointments', { therapist_id: '2', scheduled_at: FUTURE })
    const [ap] = listAppointments(db)
    expect(getAppointment(db, ap.id)).toBeDefined()
    expect(await (await app.request(`/appointments/${ap.id}`)).text()).toContain('Cleo')
  })
})
