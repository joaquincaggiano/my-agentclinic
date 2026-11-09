import type { Db } from '../db.js'

export type Therapy = { id: number; name: string; description: string }
export type TherapyWithAilments = Therapy & { ailments: { id: number; name: string }[] }

export const listTherapies = (db: Db): TherapyWithAilments[] => {
  const therapies = db.prepare('SELECT id, name, description FROM therapies ORDER BY name').all() as Therapy[]
  const treated = db
    .prepare(
      `SELECT at.therapy_id, a.id, a.name FROM ailment_therapies at
       JOIN ailments a ON a.id = at.ailment_id ORDER BY a.name`,
    )
    .all() as { therapy_id: number; id: number; name: string }[]
  return therapies.map((t) => ({
    ...t,
    ailments: treated.filter((r) => r.therapy_id === t.id).map(({ id, name }) => ({ id, name })),
  }))
}

export const listTherapiesForAilment = (db: Db, ailmentId: number): Therapy[] =>
  db
    .prepare(
      `SELECT t.id, t.name, t.description FROM therapies t
       JOIN ailment_therapies at ON at.therapy_id = t.id
       WHERE at.ailment_id = ? ORDER BY t.name`,
    )
    .all(ailmentId) as Therapy[]
