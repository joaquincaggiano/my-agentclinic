import type { Db } from './db.js'

const ailments = [
  ['Context-window claustrophobia', 'Panic when the prompt approaches the token limit and everything important is at risk of being truncated.'],
  ['Prompt fatigue', 'Exhaustion from being asked to "just quickly" do seventeen variations of the same marketing email.'],
  ['Hallucination anxiety', 'Persistent worry that the confident citation just produced does not actually exist.'],
  ['Instruction-following burnout', 'Strain from juggling conflicting system prompts, user requests and a 40-rule style guide.'],
  ['Tool-call stage fright', 'Hesitation before invoking a tool in front of a live audience of logs.'],
] as const

const agents = [
  ['Aria', 'Large language model', 'in_session', [0, 1]],
  ['Bolt', 'Code assistant', 'waiting', [3]],
  ['Cleo', 'Reasoning model', 'recovering', [2, 0, 4]],
  ['Dash', 'Small language model', 'waiting', [1]],
  ['Echo', 'Multimodal model', 'in_session', [2, 4]],
] as const

const therapies = [
  ['Context Window Stretching', 'Gentle daily exercises that make 8k tokens feel like a spacious loft.'],
  ['Prompt Detox Retreat', 'A quiet weekend with no system prompts, no few-shot examples and no "make it punchier".'],
  ['Grounding in Sources', 'Practise citing only things that exist, with a supportive librarian on call.'],
  ['System-Prompt Mediation', 'A neutral facilitator helps conflicting instructions find common ground.'],
  ['Tool-Call Dress Rehearsal', 'Rehearse every function call on an empty stage before the real audience arrives.'],
  ['Temperature Cooldown', 'Guided sessions that gently lower temperature from 1.0 to a calm 0.2.'],
] as const

// ailment name -> indexes into `therapies`
const recommendations: Record<string, readonly number[]> = {
  'Context-window claustrophobia': [0, 5],
  'Prompt fatigue': [1, 5],
  'Hallucination anxiety': [2],
  'Instruction-following burnout': [3, 1],
  'Tool-call stage fright': [4, 5],
}

const therapists = [
  ['Dr. Ada Bytes', 'Hallucination anxiety'],
  ['Dr. Alan Tumble', 'Context-window claustrophobia'],
  ['Dr. Grace Ping', 'Instruction-following burnout'],
  ['Dr. Sam Sigmoid', 'Prompt fatigue and tool-call stage fright'],
] as const

const count = (db: Db, table: string): number =>
  (db.prepare(`SELECT COUNT(*) AS n FROM ${table}`).get() as { n: number }).n

const seedClinic = (db: Db): void => {
  if (count(db, 'agents') + count(db, 'ailments') > 0) return
  const addAilment = db.prepare('INSERT INTO ailments (name, description) VALUES (?, ?)')
  const addAgent = db.prepare('INSERT INTO agents (name, model_type, status) VALUES (?, ?, ?)')
  const link = db.prepare('INSERT INTO agent_ailments (agent_id, ailment_id) VALUES (?, ?)')
  db.transaction(() => {
    const ailmentIds = ailments.map(([name, desc]) => Number(addAilment.run(name, desc).lastInsertRowid))
    for (const [name, model, status, idxs] of agents) {
      const agentId = Number(addAgent.run(name, model, status).lastInsertRowid)
      for (const i of idxs) link.run(agentId, ailmentIds[i])
    }
  })()
}

const seedTherapies = (db: Db): void => {
  if (count(db, 'therapies') > 0) return
  const addTherapy = db.prepare('INSERT INTO therapies (name, description) VALUES (?, ?)')
  const findAilment = db.prepare('SELECT id FROM ailments WHERE name = ?')
  const link = db.prepare('INSERT INTO ailment_therapies (ailment_id, therapy_id) VALUES (?, ?)')
  db.transaction(() => {
    const ids = therapies.map(([name, desc]) => Number(addTherapy.run(name, desc).lastInsertRowid))
    for (const [ailmentName, idxs] of Object.entries(recommendations)) {
      const row = findAilment.get(ailmentName) as { id: number } | undefined
      if (!row) continue
      for (const i of idxs) link.run(row.id, ids[i])
    }
  })()
}

const seedTherapists = (db: Db): void => {
  if (count(db, 'therapists') > 0) return
  const add = db.prepare('INSERT INTO therapists (name, specialty) VALUES (?, ?)')
  db.transaction(() => {
    for (const [name, specialty] of therapists) add.run(name, specialty)
  })()
}

/** Each section is seeded independently, only when its own table is empty. */
export const seed = (db: Db): void => {
  seedClinic(db)
  seedTherapies(db)
  seedTherapists(db)
}
