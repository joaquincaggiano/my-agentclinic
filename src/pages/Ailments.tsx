import { Layout } from '../components/Layout.js'
import type { AilmentWithTherapies } from '../repositories/ailments.js'

type AilmentsProps = {
  ailments: AilmentWithTherapies[]
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
          {a.therapies.length > 0 ? (
            <p class="meta">Recommended: {a.therapies.map((t) => t.name).join(', ')}</p>
          ) : null}
        </li>
      ))}
    </ul>
  </Layout>
)
