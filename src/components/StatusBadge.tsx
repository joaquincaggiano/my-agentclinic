import type { AgentStatus } from '../repositories/agents.js'

type StatusBadgeProps = {
  status: AgentStatus
}

export const statusLabel = (status: AgentStatus) => status.replaceAll('_', ' ')

export const StatusBadge = ({ status }: StatusBadgeProps) => (
  <span class={`badge badge-${status.replaceAll('_', '-')}`}>{statusLabel(status)}</span>
)
