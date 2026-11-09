import type { Db } from '../db.js'
import { listTherapiesForAilment, type Therapy } from './therapies.js'

export type AgentStatus = 'waiting' | 'in_session' | 'recovering'
export const agentStatuses: readonly AgentStatus[] = ['waiting', 'in_session', 'recovering']
export type Agent = { id: number; name: string; model_type: string; status: AgentStatus }
export type Ailment = { id: number; name: string; description: string }
export type AgentWithAilments = Agent & { ailments: (Ailment & { therapies: Therapy[] })[] }

export type AgentInput = { name: string; model_type: string; status: AgentStatus; ailmentIds: number[] }

export const listAgents = (db: Db): Agent[] =>
  db.prepare('SELECT id, name, model_type, status FROM agents ORDER BY name').all() as Agent[]

export const getAgent = (db: Db, id: number): AgentWithAilments | undefined => {
  const agent = db.prepare('SELECT id, name, model_type, status FROM agents WHERE id = ?').get(id) as Agent | undefined
  if (!agent) return undefined
  const ailments = db
    .prepare(
      `SELECT a.id, a.name, a.description FROM ailments a
       JOIN agent_ailments aa ON aa.ailment_id = a.id
       WHERE aa.agent_id = ? ORDER BY a.name`,
    )
    .all(id) as Ailment[]
  return { ...agent, ailments: ailments.map((a) => ({ ...a, therapies: listTherapiesForAilment(db, a.id) })) }
}

export const getAgentAilmentIds = (db: Db, id: number): number[] =>
  (db.prepare('SELECT ailment_id FROM agent_ailments WHERE agent_id = ?').all(id) as { ailment_id: number }[]).map(
    (r) => r.ailment_id,
  )

const replaceLinks = (db: Db, agentId: number, ailmentIds: number[]): void => {
  db.prepare('DELETE FROM agent_ailments WHERE agent_id = ?').run(agentId)
  const link = db.prepare('INSERT INTO agent_ailments (agent_id, ailment_id) VALUES (?, ?)')
  for (const ailmentId of ailmentIds) link.run(agentId, ailmentId)
}

export const createAgent = (db: Db, input: AgentInput): number =>
  db.transaction(() => {
    const id = Number(
      db.prepare('INSERT INTO agents (name, model_type, status) VALUES (?, ?, ?)').run(input.name, input.model_type, input.status)
        .lastInsertRowid,
    )
    replaceLinks(db, id, input.ailmentIds)
    return id
  })()

/** Returns false when the agent does not exist. */
export const updateAgent = (db: Db, id: number, input: AgentInput): boolean =>
  db.transaction(() => {
    const result = db
      .prepare('UPDATE agents SET name = ?, model_type = ?, status = ? WHERE id = ?')
      .run(input.name, input.model_type, input.status, id)
    if (result.changes === 0) return false
    replaceLinks(db, id, input.ailmentIds)
    return true
  })()
