import { cleanText, parseDateTimeLocal, parseId } from './fields.js'

export type BookingErrors = { therapist?: string; scheduled_at?: string; form?: string }
export type BookingValues = { therapist_id: string; scheduled_at: string }
export type BookingResult = {
  values: BookingValues
  errors: BookingErrors
  data?: { therapistId: number; scheduledAt: string }
}

export const validateBooking = (input: Record<string, unknown>, now: Date): BookingResult => {
  const values: BookingValues = {
    therapist_id: cleanText(input.therapist_id).slice(0, 20),
    scheduled_at: cleanText(input.scheduled_at).slice(0, 40),
  }
  const errors: BookingErrors = {}

  const therapistId = parseId(values.therapist_id)
  if (therapistId === undefined) errors.therapist = 'Choose a therapist.'

  let scheduledAt: string | undefined
  if (values.scheduled_at === '') {
    errors.scheduled_at = 'Choose a date and time.'
  } else {
    scheduledAt = parseDateTimeLocal(values.scheduled_at)
    if (scheduledAt === undefined) errors.scheduled_at = 'Enter a valid date and time.'
    else if (new Date(scheduledAt).getTime() <= now.getTime()) errors.scheduled_at = 'Choose a time in the future.'
  }

  if (Object.keys(errors).length > 0 || therapistId === undefined || scheduledAt === undefined) {
    return { values, errors }
  }
  return { values, errors, data: { therapistId, scheduledAt } }
}
