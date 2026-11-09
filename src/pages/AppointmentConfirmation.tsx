import { Layout } from '../components/Layout.js'
import { formatDateTime } from '../format.js'
import type { Appointment } from '../repositories/appointments.js'

type AppointmentConfirmationProps = {
  appointment: Appointment
}

export const AppointmentConfirmation = ({ appointment }: AppointmentConfirmationProps) => (
  <Layout title="Appointment confirmed – AgentClinic" path="/agents">
    <h1>Appointment confirmed</h1>
    <dl class="profile">
      <dt>Agent</dt>
      <dd><a href={`/agents/${appointment.agent_id}`}>{appointment.agent_name}</a></dd>
      <dt>Therapist</dt>
      <dd>{appointment.therapist_name}</dd>
      <dt>When</dt>
      <dd>{formatDateTime(appointment.scheduled_at)}</dd>
      <dt>Status</dt>
      <dd><span class={`badge badge-${appointment.status}`}>{appointment.status}</span></dd>
    </dl>
    <p><a class="back-link" href="/dashboard">View the staff dashboard</a></p>
    <p><a class="back-link" href="/agents">← All agents</a></p>
  </Layout>
)
