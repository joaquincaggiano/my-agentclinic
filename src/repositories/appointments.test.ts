import { describe, expect, it } from 'vitest'
import { openDatabase } from '../db.js'
import { seed } from '../seed.js'
import { createAppointment, getAppointment, isSlotTaken, listAppointments, setAppointmentStatus } from './appointments.js'
import { getDashboardCounts } from './dashboard.js'
import { listTherapists } from './therapists.js'

const setup = () => {
  const db = openDatabase(':memory:')
  seed(db)
  return db
}
const at = (day: number, hour = 9) => `2026-12-${String(day).padStart(2, '0')}T${String(hour).padStart(2, '0')}:00:00.000Z`

describe('appointments repository', () => {
  it('creates and reads an appointment with names', () => {
    const db = setup()
    const therapist = listTherapists(db)[0]
    const id = createAppointment(db, { agentId: 1, therapistId: therapist.id, scheduledAt: at(1) })
    expect(typeof id).toBe('number')
    expect(getAppointment(db, id as number)).toMatchObject({ agent_id: 1, therapist_name: therapist.name, status: 'scheduled' })
  })

  it('rejects double booking an open slot but allows it after cancelling', () => {
    const db = setup()
    const t = listTherapists(db)[0].id
    const first = createAppointment(db, { agentId: 1, therapistId: t, scheduledAt: at(1) }) as number
    expect(isSlotTaken(db, t, at(1))).toBe(true)
    expect(createAppointment(db, { agentId: 2, therapistId: t, scheduledAt: at(1) })).toBe('slot_taken')
    setAppointmentStatus(db, first, 'cancelled')
    expect(isSlotTaken(db, t, at(1))).toBe(false)
    expect(typeof createAppointment(db, { agentId: 2, therapistId: t, scheduledAt: at(1) })).toBe('number')
  })

  it('allows different therapists at the same time', () => {
    const db = setup()
    const [a, b] = listTherapists(db)
    expect(typeof createAppointment(db, { agentId: 1, therapistId: a.id, scheduledAt: at(1) })).toBe('number')
    expect(typeof createAppointment(db, { agentId: 2, therapistId: b.id, scheduledAt: at(1) })).toBe('number')
  })

  it('only transitions scheduled appointments', () => {
    const db = setup()
    const t = listTherapists(db)[0].id
    const id = createAppointment(db, { agentId: 1, therapistId: t, scheduledAt: at(1) }) as number
    expect(setAppointmentStatus(db, id, 'completed')).toBe('ok')
    expect(setAppointmentStatus(db, id, 'cancelled')).toBe('invalid_transition')
    expect(setAppointmentStatus(db, 9999, 'completed')).toBe('not_found')
    expect(getAppointment(db, id)?.status).toBe('completed')
  })

  it('lists open appointments first, soonest first', () => {
    const db = setup()
    const t = listTherapists(db)[0].id
    const late = createAppointment(db, { agentId: 1, therapistId: t, scheduledAt: at(9) }) as number
    const soon = createAppointment(db, { agentId: 2, therapistId: t, scheduledAt: at(2) }) as number
    const done = createAppointment(db, { agentId: 3, therapistId: t, scheduledAt: at(1) }) as number
    setAppointmentStatus(db, done, 'completed')
    expect(listAppointments(db).map((a) => a.id)).toEqual([soon, late, done])
  })

  it('rejects unknown agents or therapists via foreign keys', () => {
    const db = setup()
    expect(() => createAppointment(db, { agentId: 999, therapistId: 1, scheduledAt: at(1) })).toThrow()
    expect(() => createAppointment(db, { agentId: 1, therapistId: 999, scheduledAt: at(1) })).toThrow()
  })
})

describe('dashboard counts', () => {
  it('counts agents, open appointments and ailments in flight', () => {
    const db = setup()
    expect(getDashboardCounts(db)).toEqual({ agents: 5, openAppointments: 0, ailmentsInFlight: 0 })
    const t = listTherapists(db)[0].id
    // Aria (id 1) has 2 ailments; Cleo (id 3) has 3, one shared with Aria.
    const a = createAppointment(db, { agentId: 1, therapistId: t, scheduledAt: at(1) }) as number
    expect(getDashboardCounts(db)).toEqual({ agents: 5, openAppointments: 1, ailmentsInFlight: 2 })
    const c = createAppointment(db, { agentId: 3, therapistId: t, scheduledAt: at(2) }) as number
    expect(getDashboardCounts(db)).toEqual({ agents: 5, openAppointments: 2, ailmentsInFlight: 4 })
    setAppointmentStatus(db, a, 'completed')
    setAppointmentStatus(db, c, 'cancelled')
    expect(getDashboardCounts(db)).toEqual({ agents: 5, openAppointments: 0, ailmentsInFlight: 0 })
  })
})
