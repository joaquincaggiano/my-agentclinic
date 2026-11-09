# AgentClinic

## Input from stakeholders

- Mary in engineering wants a reliable site with a popular stack based on TypeScript, giving agents and staff a dashboard for easy access.
- Susan in product has a set of features about agents and their ailments, therapies, and booking appointments.
- Steve in marketing wants an attractive site that works well with a modern browser.

## Getting started

Requires Node.js 20+.

```bash
npm install        # install dependencies
npm run dev        # dev server with reload at http://localhost:3000 (override with PORT=4000)
npm run build      # compile to dist/
npm start          # run the compiled build
npm test           # run Vitest tests
npm run typecheck  # tsc --noEmit
npm run check:responsive  # builds, then checks every page at 320/768/1280px in headless Chrome (CHROME_PATH to override)
```

## Data

AgentClinic uses SQLite (`better-sqlite3`). On startup it creates `data/agentclinic.db` (override with `DATABASE_PATH`), applies the SQL files in `migrations/` and seeds fictional agents and ailments if the tables are empty. Delete `data/` to reset.

## Routes

- `/` home
- `/agents` list of agents; `/agents/new` create an agent
- `/agents/:id` agent profile with presenting complaints, recommended therapies and the booking form; `/agents/:id/edit` edit an agent
- `POST /agents/:id/appointments` book an appointment; `/appointments/:id` confirmation
- `POST /appointments/:id/status` complete or cancel a scheduled appointment (from the dashboard)
- `/ailments` list of ailments with recommended therapies
- `/therapies` therapies catalog
- `/dashboard` staff dashboard: counts, appointments, agents, ailments
- Unknown routes render a friendly 404; unexpected errors render a generic 500

## Known limitations

- No authentication: the dashboard and forms are open (a demo/MVP trade-off).
- No CSRF protection yet; forms are validated and escaped server-side, and SQL is parameterized.
- Appointment times are entered and displayed in UTC.
