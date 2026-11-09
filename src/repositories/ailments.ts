import type { Db } from '../db.js'
import type { Ailment } from './agents.js'
import { listTherapiesForAilment, type Therapy } from './therapies.js'

export type AilmentWithTherapies = Ailment & { therapies: Therapy[] }

export const listAilments = (db: Db): Ailment[] =>
  db.prepare('SELECT id, name, description FROM ailments ORDER BY name').all() as Ailment[]

export const listAilmentsWithTherapies = (db: Db): AilmentWithTherapies[] =>
  listAilments(db).map((a) => ({ ...a, therapies: listTherapiesForAilment(db, a.id) }))
