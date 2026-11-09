import { describe, expect, it } from 'vitest'
import { openDatabase } from '../db.js'
import { seed } from '../seed.js'
import { getAgent, listAgents } from './agents.js'
import { listAilments } from './ailments.js'

const setup = () => {
  const db = openDatabase(':memory:')
  seed(db)
  return db
}

describe('agents repository', () => {
  it('lists agents ordered by name', () => {
    const names = listAgents(setup()).map((a) => a.name)
    expect(names).toEqual([...names].sort())
    expect(names.length).toBeGreaterThan(0)
  })

  it('returns an agent with its ailments, ordered by name', () => {
    const db = setup()
    const agent = getAgent(db, listAgents(db)[0].id)!
    expect(agent.ailments.length).toBeGreaterThan(0)
    const names = agent.ailments.map((a) => a.name)
    expect(names).toEqual([...names].sort())
  })

  it('returns exactly the ailments linked to the agent', () => {
    const db = setup()
    const aria = listAgents(db).find((a) => a.name === 'Aria')!
    expect(getAgent(db, aria.id)!.ailments.map((a) => a.name)).toEqual(['Context-window claustrophobia', 'Prompt fatigue'])
    const bolt = listAgents(db).find((a) => a.name === 'Bolt')!
    expect(getAgent(db, bolt.id)!.ailments.map((a) => a.name)).toEqual(['Instruction-following burnout'])
  })

  it('returns undefined for an unknown id', () => {
    expect(getAgent(setup(), 9999)).toBeUndefined()
  })
})

describe('ailments repository', () => {
  it('lists ailments ordered by name', () => {
    const names = listAilments(setup()).map((a) => a.name)
    expect(names).toEqual([...names].sort())
    expect(names.length).toBeGreaterThan(0)
  })
})
