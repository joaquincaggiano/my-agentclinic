import type { Db } from '../db.js'

export type AgentStatus = 'waiting' | 'in_session' | 'recovering'
export type Agent = { id: number; name: string; model_type: string; status: AgentStatus }
export type Ailment = { id: number; name: string; description: string }
export type AgentWithAilments = Agent & { ailments: Ailment[] }

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
  return { ...agent, ailments }
}
