import type { Db } from '../db.js'

export type AppointmentStatus = 'scheduled' | 'completed' | 'cancelled'
export type Appointment = {
  id: number
  agent_id: number
  agent_name: string
  therapist_id: number
  therapist_name: string
  scheduled_at: string
  status: AppointmentStatus
}

export type NewAppointment = { agentId: number; therapistId: number; scheduledAt: string }
export type StatusChange = 'ok' | 'not_found' | 'invalid_transition'

const select = `SELECT ap.id, ap.agent_id, ag.name AS agent_name, ap.therapist_id, th.name AS therapist_name,
  ap.scheduled_at, ap.status
  FROM appointments ap
  JOIN agents ag ON ag.id = ap.agent_id
  JOIN therapists th ON th.id = ap.therapist_id`

export const isSlotTaken = (db: Db, therapistId: number, scheduledAt: string): boolean =>
  db
    .prepare("SELECT 1 FROM appointments WHERE therapist_id = ? AND scheduled_at = ? AND status = 'scheduled'")
    .get(therapistId, scheduledAt) !== undefined

/** Returns the new id, or `'slot_taken'` if the therapist is already booked at that time. */
export const createAppointment = (db: Db, input: NewAppointment): number | 'slot_taken' => {
  try {
    return Number(
      db
        .prepare('INSERT INTO appointments (agent_id, therapist_id, scheduled_at) VALUES (?, ?, ?)')
        .run(input.agentId, input.therapistId, input.scheduledAt).lastInsertRowid,
    )
  } catch (err) {
    if ((err as { code?: string }).code === 'SQLITE_CONSTRAINT_UNIQUE') return 'slot_taken'
    throw err
  }
}

export const getAppointment = (db: Db, id: number): Appointment | undefined =>
  db.prepare(`${select} WHERE ap.id = ?`).get(id) as Appointment | undefined

/** Open (scheduled) appointments first, soonest first; then the rest, most recent first. */
export const listAppointments = (db: Db): Appointment[] =>
  db
    .prepare(
      `${select} ORDER BY (ap.status = 'scheduled') DESC,
        CASE WHEN ap.status = 'scheduled' THEN ap.scheduled_at END ASC,
        ap.scheduled_at DESC`,
    )
    .all() as Appointment[]

export const setAppointmentStatus = (db: Db, id: number, status: 'completed' | 'cancelled'): StatusChange => {
  const result = db.prepare("UPDATE appointments SET status = ? WHERE id = ? AND status = 'scheduled'").run(status, id)
  if (result.changes === 1) return 'ok'
  return getAppointment(db, id) ? 'invalid_transition' : 'not_found'
}
