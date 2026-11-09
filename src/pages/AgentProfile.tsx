import { BookingForm } from '../components/BookingForm.js'
import { Layout } from '../components/Layout.js'
import { StatusBadge } from '../components/StatusBadge.js'
import type { AgentWithAilments } from '../repositories/agents.js'
import type { Therapist } from '../repositories/therapists.js'
import type { BookingErrors, BookingValues } from '../validation/booking.js'

type AgentProfileProps = {
  agent: AgentWithAilments
  therapists: Therapist[]
  form?: { values: BookingValues; errors: BookingErrors }
}

export const AgentProfile = ({ agent, therapists, form }: AgentProfileProps) => (
  <Layout title={`${agent.name} – AgentClinic`} path="/agents">
    <h1>{agent.name}</h1>
    <dl class="profile">
      <dt>Model type</dt>
      <dd>{agent.model_type}</dd>
      <dt>Status</dt>
      <dd><StatusBadge status={agent.status} /></dd>
    </dl>
    <p><a class="back-link" href={`/agents/${agent.id}/edit`}>Edit agent</a></p>
    <h2 class="section-title">Presenting complaints</h2>
    {agent.ailments.length === 0 ? <p class="empty">No presenting complaints.</p> : null}
    <ul class="card-list">
      {agent.ailments.map((al) => (
        <li class="card">
          <h3>{al.name}</h3>
          <p>{al.description}</p>
          {al.therapies.length > 0 ? (
            <p class="meta">Recommended: {al.therapies.map((t) => t.name).join(', ')}</p>
          ) : null}
        </li>
      ))}
    </ul>
    <BookingForm agentId={agent.id} therapists={therapists} values={form?.values} errors={form?.errors} />
    <p><a class="back-link" href="/agents">← All agents</a></p>
  </Layout>
)
