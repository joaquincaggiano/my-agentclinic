import { raw } from 'hono/html'
import type { Child } from 'hono/jsx'
import { Header } from './Header.js'
import { Main } from './Main.js'
import { Footer } from './Footer.js'

type LayoutProps = {
  title: string
  path: string
  children?: Child
}

export const Layout = ({ title, path, children }: LayoutProps) => (
  <>
    {raw('<!DOCTYPE html>')}
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>{title}</title>
        <link rel="stylesheet" href="/styles.css" />
      </head>
      <body>
        <Header path={path} />
        <Main>{children}</Main>
        <Footer />
      </body>
    </html>
  </>
)
