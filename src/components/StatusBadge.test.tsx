import { describe, expect, it } from 'vitest'
import { render } from '../testing.js'
import { StatusBadge, statusLabel } from './StatusBadge.js'

describe('StatusBadge', () => {
  it('humanises the label and uses a kebab-case class', async () => {
    const html = await render(<StatusBadge status="in_session" />)
    expect(html).toBe('<span class="badge badge-in-session">in session</span>')
  })

  it.each([
    ['waiting', 'waiting'],
    ['recovering', 'recovering'],
    ['in_session', 'in session'],
  ] as const)('labels %s as "%s"', (status, label) => {
    expect(statusLabel(status)).toBe(label)
  })
})
