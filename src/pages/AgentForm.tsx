import { Layout } from '../components/Layout.js'
import { agentStatuses, type Ailment } from '../repositories/agents.js'
import type { AgentErrors, AgentValues } from '../validation/agent.js'

type AgentFormProps = {
  heading: string
  action: string
  submitLabel: string
  cancelHref: string
  ailments: Ailment[]
  values: AgentValues
  errors?: AgentErrors
}

export const AgentForm = ({ heading, action, submitLabel, cancelHref, ailments, values, errors = {} }: AgentFormProps) => (
  <Layout title={`${heading} – AgentClinic`} path="/agents">
    <h1>{heading}</h1>
    <form class="form" method="post" action={action} novalidate>
      <div class="field">
        <label for="name">Name</label>
        <input id="name" name="name" type="text" maxlength={80} required value={values.name} aria-describedby={errors.name ? 'name-error' : undefined} />
        {errors.name ? <p class="field-error" id="name-error">{errors.name}</p> : null}
      </div>
      <div class="field">
        <label for="model_type">Model type</label>
        <input id="model_type" name="model_type" type="text" maxlength={80} required value={values.model_type} aria-describedby={errors.model_type ? 'model-error' : undefined} />
        {errors.model_type ? <p class="field-error" id="model-error">{errors.model_type}</p> : null}
      </div>
      <div class="field">
        <label for="status">Status</label>
        <select id="status" name="status" required aria-describedby={errors.status ? 'status-error' : undefined}>
          <option value="">Choose a status…</option>
          {agentStatuses.map((s) => (
            <option value={s} selected={values.status === s}>{s.replaceAll('_', ' ')}</option>
          ))}
        </select>
        {errors.status ? <p class="field-error" id="status-error">{errors.status}</p> : null}
      </div>
      <fieldset class="field">
        <legend>Presenting complaints</legend>
        {ailments.map((a) => (
          <label class="check">
            <input type="checkbox" name="ailment_ids" value={String(a.id)} checked={values.ailment_ids.includes(a.id)} />
            <span>{a.name}</span>
          </label>
        ))}
        {errors.ailments ? <p class="field-error">{errors.ailments}</p> : null}
      </fieldset>
      <div class="actions">
        <button class="button" type="submit">{submitLabel}</button>
        <a class="button button-secondary" href={cancelHref}>Cancel</a>
      </div>
    </form>
  </Layout>
)
