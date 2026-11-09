/** Format an ISO timestamp for display, always in UTC, e.g. `2026-11-12 14:30 UTC`. */
export const formatDateTime = (iso: string): string => `${iso.slice(0, 10)} ${iso.slice(11, 16)} UTC`
