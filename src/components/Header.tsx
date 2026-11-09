import { Nav } from './Nav.js'

type HeaderProps = {
  path: string
}

export const Header = ({ path }: HeaderProps) => (
  <header class="site-header">
    <a class="site-name" href="/">AgentClinic</a>
    <Nav path={path} />
  </header>
)
