import { Hono } from 'hono'
import { serveStatic } from '@hono/node-server/serve-static'
import { Home } from './pages/Home.js'

const app = new Hono()

app.use('/styles.css', serveStatic({ path: './public/styles.css' }))

app.get('/', (c) => c.html(<Home />))

export default app
