import { describe, expect, it } from 'vitest'
import { render } from '../testing.js'
import { Nav } from './Nav.js'


describe('Nav', () => {
  it('links to Home, Agents and Ailments', async () => {
    const html = await render(<Nav path="/" />)
    expect(html).toContain('href="/"')
    expect(html).toContain('href="/agents"')
    expect(html).toContain('href="/ailments"')
  })

  it.each([
    ['/', 'Home'],
    ['/agents', 'Agents'],
    ['/agents/3', 'Agents'],
    ['/ailments', 'Ailments'],
  ])('marks only the right link current for %s', async (path, label) => {
    const html = await render(<Nav path={path} />)
    expect(html.match(/aria-current="page"/g)).toHaveLength(1)
    expect(html).toContain(`aria-current="page">${label}</a>`)
  })

  it('marks nothing current on an unrelated path', async () => {
    expect(await render(<Nav path="/elsewhere" />)).not.toContain('aria-current')
  })
})
