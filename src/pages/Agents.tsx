import { Layout } from '../components/Layout.js'
import { StatusBadge } from '../components/StatusBadge.js'
import type { Agent } from '../repositories/agents.js'

type AgentsProps = {
  agents: Agent[]
}

export const Agents = ({ agents }: AgentsProps) => (
  <Layout title="Agents – AgentClinic" path="/agents">
    <h1>Agents</h1>
    {agents.length === 0 ? <p class="empty">No agents have checked in yet.</p> : null}
    <ul class="card-list">
      {agents.map((a) => (
        <li class="card">
          <h2><a href={`/agents/${a.id}`}>{a.name}</a></h2>
          <p class="meta">{a.model_type}</p>
          <p><StatusBadge status={a.status} /></p>
        </li>
      ))}
    </ul>
  </Layout>
)
