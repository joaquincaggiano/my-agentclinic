import type { Db } from '../db.js'
import type { Ailment } from './agents.js'

export const listAilments = (db: Db): Ailment[] =>
  db.prepare('SELECT id, name, description FROM ailments ORDER BY name').all() as Ailment[]
