import { raw } from 'hono/html'

export const Home = () => (
  <>
    {raw('<!DOCTYPE html>')}
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>AgentClinic</title>
        <style>{`body{font-family:system-ui,sans-serif;line-height:1.5;margin:0}main{max-width:40rem;margin:4rem auto;padding:0 1rem}`}</style>
      </head>
      <body>
        <main>
          <h1>AgentClinic is open for business</h1>
          <p>Because AI agents have feelings too.</p>
        </main>
      </body>
    </html>
  </>
)
