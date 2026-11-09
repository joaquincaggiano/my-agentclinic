import { describe, expect, it } from 'vitest'
import { validateAgent } from './agent.js'
import { validateBooking } from './booking.js'
import { cleanText, parseDateTimeLocal, parseEnum, parseId, toArray } from './fields.js'

const now = new Date('2026-11-09T12:00:00Z')

describe('field helpers', () => {
  it('cleanText trims and strips control characters', () => {
    expect(cleanText('  hi\u0000 there\n ')).toBe('hi there')
    expect(cleanText(undefined)).toBe('')
    expect(cleanText(['a'])).toBe('')
  })

  it.each([['1', 1], [' 42 ', 42], ['0', undefined], ['-1', undefined], ['1.5', undefined], ['abc', undefined], ['1e3', undefined], ['9999999999', undefined], [undefined, undefined]])(
    'parseId(%j) -> %j',
    (input, expected) => expect(parseId(input)).toBe(expected),
  )

  it('parseEnum only accepts listed values', () => {
    expect(parseEnum('a', ['a', 'b'] as const)).toBe('a')
    expect(parseEnum('c', ['a', 'b'] as const)).toBeUndefined()
    expect(parseEnum(1, ['a', 'b'] as const)).toBeUndefined()
  })

  it('toArray normalises form values', () => {
    expect(toArray(undefined)).toEqual([])
    expect(toArray('a')).toEqual(['a'])
    expect(toArray(['a', 'b'])).toEqual(['a', 'b'])
  })

  it('parseDateTimeLocal returns UTC ISO strings and rejects invalid dates', () => {
    expect(parseDateTimeLocal('2026-11-12T14:30')).toBe('2026-11-12T14:30:00.000Z')
    expect(parseDateTimeLocal('2026-11-12T14:30:15')).toBe('2026-11-12T14:30:15.000Z')
    expect(parseDateTimeLocal('2026-02-31T10:00')).toBeUndefined()
    expect(parseDateTimeLocal('2026-11-12 14:30')).toBeUndefined()
    expect(parseDateTimeLocal('2026-11-12T25:00')).toBeUndefined()
    expect(parseDateTimeLocal('tomorrow')).toBeUndefined()
    expect(parseDateTimeLocal(undefined)).toBeUndefined()
  })
})

describe('validateBooking', () => {
  it('accepts a future slot', () => {
    const r = validateBooking({ therapist_id: '2', scheduled_at: '2026-11-10T09:00' }, now)
    expect(r.errors).toEqual({})
    expect(r.data).toEqual({ therapistId: 2, scheduledAt: '2026-11-10T09:00:00.000Z' })
  })

  it('requires both fields', () => {
    const r = validateBooking({}, now)
    expect(r.errors.therapist).toBeDefined()
    expect(r.errors.scheduled_at).toBe('Choose a date and time.')
    expect(r.data).toBeUndefined()
  })

  it('rejects past, equal-to-now and malformed times', () => {
    expect(validateBooking({ therapist_id: '1', scheduled_at: '2026-11-09T11:59' }, now).errors.scheduled_at).toMatch(/future/)
    expect(validateBooking({ therapist_id: '1', scheduled_at: '2026-11-09T12:00' }, now).errors.scheduled_at).toMatch(/future/)
    expect(validateBooking({ therapist_id: '1', scheduled_at: 'soon' }, now).errors.scheduled_at).toMatch(/valid/)
  })

  it('rejects a non-numeric therapist and keeps HTML out of values as plain text', () => {
    const r = validateBooking({ therapist_id: "1; DROP TABLE agents", scheduled_at: '<b>x</b>' }, now)
    expect(r.errors.therapist).toBeDefined()
    expect(r.errors.scheduled_at).toBeDefined()
    expect(r.values.scheduled_at.length).toBeLessThanOrEqual(40)
  })

  it('truncates oversized input in echoed values', () => {
    const r = validateBooking({ therapist_id: '9'.repeat(500), scheduled_at: 'x'.repeat(500) }, now)
    expect(r.values.therapist_id.length).toBeLessThanOrEqual(20)
    expect(r.values.scheduled_at.length).toBeLessThanOrEqual(40)
  })
})

describe('validateAgent', () => {
  const valid = new Set([1, 2, 3])

  it('accepts valid input and de-duplicates ailments', () => {
    const r = validateAgent({ name: ' Nova ', model_type: 'LLM', status: 'waiting', ailment_ids: ['1', '1', '2'] }, valid)
    expect(r.errors).toEqual({})
    expect(r.data).toEqual({ name: 'Nova', model_type: 'LLM', status: 'waiting', ailmentIds: [1, 2] })
  })

  it('accepts a single ailment given as a plain string', () => {
    expect(validateAgent({ name: 'a', model_type: 'b', status: 'waiting', ailment_ids: '3' }, valid).data?.ailmentIds).toEqual([3])
  })

  it('reports every problem', () => {
    const r = validateAgent({ name: '', model_type: ' ', status: 'bogus' }, valid)
    expect(Object.keys(r.errors).sort()).toEqual(['ailments', 'model_type', 'name', 'status'])
    expect(r.data).toBeUndefined()
  })

  it('rejects over-long names and unknown ailments', () => {
    const r = validateAgent({ name: 'x'.repeat(81), model_type: 'm', status: 'waiting', ailment_ids: ['99'] }, valid)
    expect(r.errors.name).toMatch(/80/)
    expect(r.errors.ailments).toMatch(/Unknown/)
    expect(r.values.name.length).toBe(80)
  })
})
