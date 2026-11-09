import { Layout } from '../components/Layout.js'
import type { Ailment } from '../repositories/agents.js'

type AilmentsProps = {
  ailments: Ailment[]
}

export const Ailments = ({ ailments }: AilmentsProps) => (
  <Layout title="Ailments – AgentClinic" path="/ailments">
    <h1>Ailments</h1>
    {ailments.length === 0 ? <p class="empty">No ailments recorded.</p> : null}
    <ul class="card-list">
      {ailments.map((a) => (
        <li class="card">
          <h2>{a.name}</h2>
          <p>{a.description}</p>
        </li>
      ))}
    </ul>
  </Layout>
)
