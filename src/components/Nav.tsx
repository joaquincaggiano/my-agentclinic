const links = [
  { href: '/', label: 'Home' },
  { href: '/agents', label: 'Agents' },
  { href: '/ailments', label: 'Ailments' },
  { href: '/therapies', label: 'Therapies' },
  { href: '/dashboard', label: 'Dashboard' },
]

const isActive = (href: string, path: string) =>
  href === '/' ? path === '/' : path === href || path.startsWith(`${href}/`)

type NavProps = {
  path: string
}

export const Nav = ({ path }: NavProps) => (
  <nav class="site-nav" aria-label="Main">
    <ul>
      {links.map((l) => (
        <li>
          <a href={l.href} aria-current={isActive(l.href, path) ? 'page' : undefined}>{l.label}</a>
        </li>
      ))}
    </ul>
  </nav>
)
