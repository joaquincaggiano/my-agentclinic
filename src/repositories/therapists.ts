import type { Db } from '../db.js'

export type Therapist = { id: number; name: string; specialty: string }

export const listTherapists = (db: Db): Therapist[] =>
  db.prepare('SELECT id, name, specialty FROM therapists ORDER BY name').all() as Therapist[]

export const therapistExists = (db: Db, id: number): boolean =>
  db.prepare('SELECT 1 FROM therapists WHERE id = ?').get(id) !== undefined
