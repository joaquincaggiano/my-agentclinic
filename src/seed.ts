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

export const seed = (db: Db): void => {
  const { n } = db.prepare('SELECT (SELECT COUNT(*) FROM agents) + (SELECT COUNT(*) FROM ailments) AS n').get() as { n: number }
  if (n > 0) return
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
