import { Layout } from '../components/Layout.js'
import { StatusBadge } from '../components/StatusBadge.js'
import { formatDateTime } from '../format.js'
import type { Agent, Ailment } from '../repositories/agents.js'
import type { Appointment } from '../repositories/appointments.js'
import type { DashboardCounts } from '../repositories/dashboard.js'

type DashboardProps = {
  counts: DashboardCounts
  appointments: Appointment[]
  agents: Agent[]
  ailments: Ailment[]
}

export const Dashboard = ({ counts, appointments, agents, ailments }: DashboardProps) => (
  <Layout title="Dashboard – AgentClinic" path="/dashboard">
    <h1>Staff dashboard</h1>
    <ul class="tiles">
      <li class="tile"><span class="tile-value">{counts.agents}</span><span class="tile-label">Agents</span></li>
      <li class="tile"><span class="tile-value">{counts.openAppointments}</span><span class="tile-label">Open appointments</span></li>
      <li class="tile"><span class="tile-value">{counts.ailmentsInFlight}</span><span class="tile-label">Ailments in flight</span></li>
    </ul>

    <h2 class="section-title">Appointments</h2>
    {appointments.length === 0 ? <p class="empty">No appointments yet.</p> : (
      <div class="table-scroll">
        <table>
          <thead>
            <tr><th>Agent</th><th>Therapist</th><th>When</th><th>Status</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {appointments.map((ap) => (
              <tr>
                <td><a href={`/agents/${ap.agent_id}`}>{ap.agent_name}</a></td>
                <td>{ap.therapist_name}</td>
                <td>{formatDateTime(ap.scheduled_at)}</td>
                <td><span class={`badge badge-${ap.status}`}>{ap.status}</span></td>
                <td>
                  {ap.status === 'scheduled' ? (
                    <div class="actions">
                      <form method="post" action={`/appointments/${ap.id}/status`}>
                        <input type="hidden" name="status" value="completed" />
                        <button class="button button-small" type="submit">Complete</button>
                      </form>
                      <form method="post" action={`/appointments/${ap.id}/status`}>
                        <input type="hidden" name="status" value="cancelled" />
                        <button class="button button-small button-secondary" type="submit">Cancel</button>
                      </form>
                    </div>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}

    <h2 class="section-title">Agents</h2>
    <p><a class="back-link" href="/agents/new">New agent</a></p>
    <div class="table-scroll">
      <table>
        <thead><tr><th>Name</th><th>Model type</th><th>Status</th><th>Actions</th></tr></thead>
        <tbody>
          {agents.map((a) => (
            <tr>
              <td><a href={`/agents/${a.id}`}>{a.name}</a></td>
              <td>{a.model_type}</td>
              <td><StatusBadge status={a.status} /></td>
              <td><a class="table-link" href={`/agents/${a.id}/edit`}>Edit</a></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    <h2 class="section-title">Ailments</h2>
    <div class="table-scroll">
      <table>
        <thead><tr><th>Name</th><th>Description</th></tr></thead>
        <tbody>
          {ailments.map((a) => (
            <tr><td>{a.name}</td><td>{a.description}</td></tr>
          ))}
        </tbody>
      </table>
    </div>
  </Layout>
)
