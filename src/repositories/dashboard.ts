import type { Db } from '../db.js'

export type DashboardCounts = { agents: number; openAppointments: number; ailmentsInFlight: number }

const one = (db: Db, sql: string): number => (db.prepare(sql).get() as { n: number }).n

export const getDashboardCounts = (db: Db): DashboardCounts => ({
  agents: one(db, 'SELECT COUNT(*) AS n FROM agents'),
  openAppointments: one(db, "SELECT COUNT(*) AS n FROM appointments WHERE status = 'scheduled'"),
  // Distinct ailments of agents that have at least one open appointment.
  ailmentsInFlight: one(
    db,
    `SELECT COUNT(DISTINCT aa.ailment_id) AS n FROM agent_ailments aa
     JOIN appointments ap ON ap.agent_id = aa.agent_id AND ap.status = 'scheduled'`,
  ),
})
