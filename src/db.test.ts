import { describe, expect, it } from 'vitest'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { migrate, openDatabase } from './db.js'

const tables = (db: ReturnType<typeof openDatabase>) =>
  db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all().map((r) => (r as { name: string }).name)

describe('migrations', () => {
  it('creates the tables', () => {
    const t = tables(openDatabase(':memory:'))
    expect(t).toEqual(expect.arrayContaining(['agents', 'ailments', 'agent_ailments', 'schema_migrations']))
  })

  it('is a no-op when re-run', () => {
    const db = openDatabase(':memory:')
    migrate(db)
    expect(db.prepare('SELECT COUNT(*) AS n FROM schema_migrations').get()).toEqual({ n: 1 })
  })

  it('rejects an invalid status', () => {
    const db = openDatabase(':memory:')
    expect(() => db.prepare("INSERT INTO agents (name, model_type, status) VALUES ('x','y','bogus')").run()).toThrow()
  })

  it('rejects dangling links', () => {
    const db = openDatabase(':memory:')
    expect(() => db.prepare('INSERT INTO agent_ailments (agent_id, ailment_id) VALUES (99, 99)').run()).toThrow()
  })

  it('cascades deletes to the link table', () => {
    const db = openDatabase(':memory:')
    db.prepare("INSERT INTO agents (id, name, model_type) VALUES (1, 'a', 'm')").run()
    db.prepare("INSERT INTO ailments (id, name, description) VALUES (1, 'n', 'd')").run()
    db.prepare('INSERT INTO agent_ailments (agent_id, ailment_id) VALUES (1, 1)').run()
    db.prepare('DELETE FROM agents WHERE id = 1').run()
    expect(db.prepare('SELECT COUNT(*) AS n FROM agent_ailments').get()).toEqual({ n: 0 })
  })

  it('creates a file-backed database (and its folder) and survives reopening', () => {
    const dir = mkdtempSync(join(tmpdir(), 'agentclinic-'))
    try {
      const path = join(dir, 'nested', 'test.db')
      const first = openDatabase(path)
      first.prepare("INSERT INTO ailments (name, description) VALUES ('n', 'd')").run()
      first.close()
      const second = openDatabase(path)
      expect(second.prepare('SELECT COUNT(*) AS n FROM schema_migrations').get()).toEqual({ n: 1 })
      expect(second.prepare('SELECT COUNT(*) AS n FROM ailments').get()).toEqual({ n: 1 })
      second.close()
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
  })
})
