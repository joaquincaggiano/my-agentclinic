import { describe, expect, it } from 'vitest'
import { Footer } from './Footer.js'
import { Header } from './Header.js'
import { Layout } from './Layout.js'
import { Main } from './Main.js'

const render = async (node: unknown) => String(await (node as { toString(): string | Promise<string> }).toString())

describe('Header', () => {
  it('links the site name to the home page', async () => {
    const html = await render(<Header />)
    expect(html).toContain('<header class="site-header">')
    expect(html).toContain('<a class="site-name" href="/">AgentClinic</a>')
  })
})

describe('Main', () => {
  it('wraps its children in a main element', async () => {
    const html = await render(<Main><p>hello</p></Main>)
    expect(html).toBe('<main class="site-main"><p>hello</p></main>')
  })
})

describe('Footer', () => {
  it('renders the tagline', async () => {
    const html = await render(<Footer />)
    expect(html).toContain('<footer class="site-footer">')
    expect(html).toContain('Because AI agents have feelings too.')
  })
})

describe('Layout', () => {
  it('renders a complete HTML document', async () => {
    const html = await render(<Layout title="Test Page"><p>content</p></Layout>)
    expect(html).toMatch(/^<!DOCTYPE html>/)
    expect(html).toContain('<html lang="en">')
    expect(html).toContain('<meta charset="utf-8"/>')
    expect(html).toContain('name="viewport"')
    expect(html).toContain('<title>Test Page</title>')
    expect(html).toContain('<link rel="stylesheet" href="/styles.css"/>')
  })

  it('places header, main and footer in order, with children inside main', async () => {
    const html = await render(<Layout title="T"><p>content</p></Layout>)
    const header = html.indexOf('<header')
    const main = html.indexOf('<main')
    const footer = html.indexOf('<footer')
    expect(header).toBeGreaterThan(-1)
    expect(main).toBeGreaterThan(header)
    expect(footer).toBeGreaterThan(main)
    expect(html).toMatch(/<main[^>]*><p>content<\/p><\/main>/)
  })

  it('escapes the title', async () => {
    const html = await render(<Layout title="<script>x</script>" />)
    expect(html).not.toContain('<title><script>')
    expect(html).toContain('&lt;script&gt;')
  })
})
