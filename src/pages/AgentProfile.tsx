import { Layout } from '../components/Layout.js'
import type { AgentWithAilments } from '../repositories/agents.js'
import { StatusBadge } from '../components/StatusBadge.js'

type AgentProfileProps = {
  agent: AgentWithAilments
}

export const AgentProfile = ({ agent }: AgentProfileProps) => (
  <Layout title={`${agent.name} – AgentClinic`} path="/agents">
    <h1>{agent.name}</h1>
    <dl class="profile">
      <dt>Model type</dt>
      <dd>{agent.model_type}</dd>
      <dt>Status</dt>
      <dd><StatusBadge status={agent.status} /></dd>
    </dl>
    <h2 class="section-title">Presenting complaints</h2>
    {agent.ailments.length === 0 ? <p class="empty">No presenting complaints.</p> : null}
    <ul class="card-list">
      {agent.ailments.map((al) => (
        <li class="card">
          <h3>{al.name}</h3>
          <p>{al.description}</p>
        </li>
      ))}
    </ul>
    <p><a class="back-link" href="/agents">← All agents</a></p>
  </Layout>
)
