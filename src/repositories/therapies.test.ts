import { describe, expect, it } from 'vitest'
import { openDatabase } from '../db.js'
import { seed } from '../seed.js'
import { createAgent, getAgent, getAgentAilmentIds, listAgents, updateAgent } from './agents.js'
import { listAilmentsWithTherapies } from './ailments.js'
import { listTherapies, listTherapiesForAilment } from './therapies.js'

const setup = () => {
  const db = openDatabase(':memory:')
  seed(db)
  return db
}

describe('therapies repository', () => {
  it('lists therapies ordered by name with the ailments they treat', () => {
    const therapies = listTherapies(setup())
    const names = therapies.map((t) => t.name)
    expect(names).toEqual([...names].sort())
    const cooldown = therapies.find((t) => t.name === 'Temperature Cooldown')!
    expect(cooldown.ailments.map((a) => a.name)).toEqual(['Context-window claustrophobia', 'Prompt fatigue', 'Tool-call stage fright'])
  })

  it('returns recommended therapies per ailment', () => {
    const db = setup()
    const halluc = listAilmentsWithTherapies(db).find((a) => a.name === 'Hallucination anxiety')!
    expect(halluc.therapies.map((t) => t.name)).toEqual(['Grounding in Sources'])
    expect(listTherapiesForAilment(db, 9999)).toEqual([])
  })

  it('includes therapies on an agent profile', () => {
    const db = setup()
    const bolt = listAgents(db).find((a) => a.name === 'Bolt')!
    const burnout = getAgent(db, bolt.id)!.ailments[0]
    expect(burnout.therapies.map((t) => t.name)).toEqual(['Prompt Detox Retreat', 'System-Prompt Mediation'])
  })
})

describe('agent writes', () => {
  it('creates an agent with its ailment links', () => {
    const db = setup()
    const id = createAgent(db, { name: 'Nova', model_type: 'LLM', status: 'waiting', ailmentIds: [1, 2] })
    expect(getAgentAilmentIds(db, id).sort()).toEqual([1, 2])
    expect(getAgent(db, id)).toMatchObject({ name: 'Nova', status: 'waiting' })
  })

  it('updates an agent and replaces its links', () => {
    const db = setup()
    const id = createAgent(db, { name: 'Nova', model_type: 'LLM', status: 'waiting', ailmentIds: [1, 2] })
    expect(updateAgent(db, id, { name: 'Nova 2', model_type: 'SLM', status: 'recovering', ailmentIds: [3] })).toBe(true)
    expect(getAgentAilmentIds(db, id)).toEqual([3])
    expect(getAgent(db, id)).toMatchObject({ name: 'Nova 2', model_type: 'SLM', status: 'recovering' })
  })

  it('returns false for an unknown agent and leaves links alone', () => {
    const db = setup()
    expect(updateAgent(db, 999, { name: 'x', model_type: 'y', status: 'waiting', ailmentIds: [1] })).toBe(false)
  })

  it('rolls back a create with an invalid ailment link', () => {
    const db = setup()
    const before = listAgents(db).length
    expect(() => createAgent(db, { name: 'Bad', model_type: 'x', status: 'waiting', ailmentIds: [999] })).toThrow()
    expect(listAgents(db).length).toBe(before)
  })
})
