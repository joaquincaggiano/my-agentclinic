/** Remove control characters and surrounding whitespace from form text. */
export const cleanText = (value: unknown): string =>
  typeof value === 'string' ? value.replace(/[\u0000-\u001F\u007F]/g, '').trim() : ''

/** Parse a positive integer id from form/URL input; anything else is `undefined`. */
export const parseId = (value: unknown): number | undefined => {
  if (typeof value !== 'string' || !/^\d{1,9}$/.test(value.trim())) return undefined
  const n = Number(value.trim())
  return n > 0 ? n : undefined
}

export const parseEnum = <T extends string>(value: unknown, allowed: readonly T[]): T | undefined =>
  typeof value === 'string' && (allowed as readonly string[]).includes(value) ? (value as T) : undefined

/** Form fields with the same name arrive as a string or a string[]. */
export const toArray = (value: unknown): unknown[] => (Array.isArray(value) ? value : value === undefined ? [] : [value])

const DATETIME_LOCAL = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?$/

/** Parse a `datetime-local` value as UTC. Returns an ISO string or `undefined` if invalid. */
export const parseDateTimeLocal = (value: unknown): string | undefined => {
  if (typeof value !== 'string') return undefined
  const m = DATETIME_LOCAL.exec(value.trim())
  if (!m) return undefined
  const [y, mo, d, h, mi, s] = m.slice(1).map((p) => (p === undefined ? 0 : Number(p)))
  const date = new Date(Date.UTC(y, mo - 1, d, h, mi, s))
  const roundTrips =
    date.getUTCFullYear() === y &&
    date.getUTCMonth() === mo - 1 &&
    date.getUTCDate() === d &&
    date.getUTCHours() === h &&
    date.getUTCMinutes() === mi
  return roundTrips ? date.toISOString() : undefined
}
