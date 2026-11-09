import type { Therapist } from '../repositories/therapists.js'
import type { BookingErrors, BookingValues } from '../validation/booking.js'

type BookingFormProps = {
  agentId: number
  therapists: Therapist[]
  values?: BookingValues
  errors?: BookingErrors
}

export const BookingForm = ({ agentId, therapists, values, errors = {} }: BookingFormProps) => (
  <form class="form" method="post" action={`/agents/${agentId}/appointments`} novalidate>
    <h2 class="section-title" id="book">Book an appointment</h2>
    {errors.form ? <p class="field-error" role="alert">{errors.form}</p> : null}
    <div class="field">
      <label for="therapist_id">Therapist</label>
      <select id="therapist_id" name="therapist_id" required aria-describedby={errors.therapist ? 'therapist-error' : undefined}>
        <option value="">Choose a therapist…</option>
        {therapists.map((t) => (
          <option value={String(t.id)} selected={values?.therapist_id === String(t.id)}>
            {t.name} — {t.specialty}
          </option>
        ))}
      </select>
      {errors.therapist ? <p class="field-error" id="therapist-error">{errors.therapist}</p> : null}
    </div>
    <div class="field">
      <label for="scheduled_at">Date and time (UTC)</label>
      <input
        id="scheduled_at"
        name="scheduled_at"
        type="datetime-local"
        required
        value={values?.scheduled_at ?? ''}
        aria-describedby={errors.scheduled_at ? 'scheduled-error' : undefined}
      />
      {errors.scheduled_at ? <p class="field-error" id="scheduled-error">{errors.scheduled_at}</p> : null}
    </div>
    <button class="button" type="submit">Book appointment</button>
  </form>
)
