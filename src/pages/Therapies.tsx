import { Layout } from '../components/Layout.js'
import type { TherapyWithAilments } from '../repositories/therapies.js'

type TherapiesProps = {
  therapies: TherapyWithAilments[]
}

export const Therapies = ({ therapies }: TherapiesProps) => (
  <Layout title="Therapies – AgentClinic" path="/therapies">
    <h1>Therapies</h1>
    {therapies.length === 0 ? <p class="empty">No therapies available yet.</p> : null}
    <ul class="card-list">
      {therapies.map((t) => (
        <li class="card">
          <h2>{t.name}</h2>
          <p>{t.description}</p>
          {t.ailments.length > 0 ? (
            <p class="meta">Treats: {t.ailments.map((a) => a.name).join(', ')}</p>
          ) : null}
        </li>
      ))}
    </ul>
  </Layout>
)
