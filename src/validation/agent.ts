import { agentStatuses, type AgentInput } from '../repositories/agents.js'
import { cleanText, parseEnum, parseId, toArray } from './fields.js'

export const MAX_NAME = 80

export type AgentErrors = { name?: string; model_type?: string; status?: string; ailments?: string }
export type AgentValues = { name: string; model_type: string; status: string; ailment_ids: number[] }
export type AgentResult = { values: AgentValues; errors: AgentErrors; data?: AgentInput }

const requiredText = (raw: unknown, label: string): { value: string; error?: string } => {
  const value = cleanText(raw)
  if (value === '') return { value, error: `${label} is required.` }
  if (value.length > MAX_NAME) return { value: value.slice(0, MAX_NAME), error: `${label} must be ${MAX_NAME} characters or fewer.` }
  return { value }
}

export const validateAgent = (input: Record<string, unknown>, validAilmentIds: ReadonlySet<number>): AgentResult => {
  const errors: AgentErrors = {}
  const name = requiredText(input.name, 'Name')
  const model = requiredText(input.model_type, 'Model type')
  if (name.error) errors.name = name.error
  if (model.error) errors.model_type = model.error

  const status = parseEnum(cleanText(input.status), agentStatuses)
  if (status === undefined) errors.status = 'Choose a status.'

  const parsed = toArray(input.ailment_ids).map(parseId)
  const ailmentIds = [...new Set(parsed.filter((id): id is number => id !== undefined))]
  if (parsed.some((id) => id === undefined || !validAilmentIds.has(id))) errors.ailments = 'Unknown ailment selected.'
  else if (ailmentIds.length === 0) errors.ailments = 'Choose at least one ailment.'

  const values: AgentValues = {
    name: name.value,
    model_type: model.value,
    status: cleanText(input.status),
    ailment_ids: ailmentIds,
  }
  if (Object.keys(errors).length > 0 || status === undefined) return { values, errors }
  return { values, errors, data: { name: name.value, model_type: model.value, status, ailmentIds } }
}
