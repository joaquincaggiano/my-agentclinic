import { describe, expect, it } from 'vitest'
import { openDatabase } from './db.js'
import { seed } from './seed.js'

const count = (db: ReturnType<typeof openDatabase>, sql: string) => (db.prepare(sql).get() as { n: number }).n

describe('seed', () => {
  it('populates agents, ailments and links', () => {
    const db = openDatabase(':memory:')
    seed(db)
    expect(count(db, 'SELECT COUNT(*) AS n FROM agents')).toBeGreaterThanOrEqual(3)
    expect(count(db, 'SELECT COUNT(*) AS n FROM ailments')).toBeGreaterThanOrEqual(3)
    expect(count(db, 'SELECT COUNT(*) AS n FROM agents WHERE id NOT IN (SELECT agent_id FROM agent_ailments)')).toBe(0)
    expect(count(db, 'SELECT COUNT(*) AS n FROM (SELECT agent_id FROM agent_ailments GROUP BY agent_id HAVING COUNT(*) > 1)')).toBeGreaterThan(0)
  })

  it('does nothing when the database already has data', () => {
    const db = openDatabase(':memory:')
    db.prepare("INSERT INTO ailments (name, description) VALUES ('custom', 'mine')").run()
    seed(db)
    expect(count(db, 'SELECT COUNT(*) AS n FROM agents')).toBe(0)
    expect(count(db, 'SELECT COUNT(*) AS n FROM ailments')).toBe(1)
  })

  it('is idempotent', () => {
    const db = openDatabase(':memory:')
    seed(db)
    const before = count(db, 'SELECT COUNT(*) AS n FROM agents')
    seed(db)
    expect(count(db, 'SELECT COUNT(*) AS n FROM agents')).toBe(before)
  })

  it('maps every ailment to at least one therapy and seeds therapists', () => {
    const db = openDatabase(':memory:')
    seed(db)
    expect(count(db, 'SELECT COUNT(*) AS n FROM ailments WHERE id NOT IN (SELECT ailment_id FROM ailment_therapies)')).toBe(0)
    expect(count(db, 'SELECT COUNT(*) AS n FROM therapies')).toBeGreaterThanOrEqual(3)
    expect(count(db, 'SELECT COUNT(*) AS n FROM therapists')).toBeGreaterThanOrEqual(3)
    expect(count(db, 'SELECT COUNT(*) AS n FROM (SELECT therapy_id FROM ailment_therapies GROUP BY therapy_id HAVING COUNT(*) > 1)')).toBeGreaterThan(0)
  })

  it('adds therapies and therapists to a database that only has Phase 2 data', () => {
    const db = openDatabase(':memory:')
    seed(db)
    db.exec('DELETE FROM therapies; DELETE FROM therapists;')
    seed(db)
    expect(count(db, 'SELECT COUNT(*) AS n FROM therapies')).toBeGreaterThan(0)
    expect(count(db, 'SELECT COUNT(*) AS n FROM ailment_therapies')).toBeGreaterThan(0)
    expect(count(db, 'SELECT COUNT(*) AS n FROM therapists')).toBeGreaterThan(0)
    expect(count(db, 'SELECT COUNT(*) AS n FROM agents')).toBe(5)
  })

  it('does not duplicate therapies when run twice', () => {
    const db = openDatabase(':memory:')
    seed(db)
    const before = count(db, 'SELECT COUNT(*) AS n FROM ailment_therapies')
    seed(db)
    expect(count(db, 'SELECT COUNT(*) AS n FROM ailment_therapies')).toBe(before)
  })
})
