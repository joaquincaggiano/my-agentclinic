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
```

## Data

AgentClinic uses SQLite (`better-sqlite3`). On startup it creates `data/agentclinic.db` (override with `DATABASE_PATH`), applies the SQL files in `migrations/` and seeds fictional agents and ailments if the tables are empty. Delete `data/` to reset.

## Routes

- `/` home
- `/agents` list of agents
- `/agents/:id` agent profile with presenting complaints
- `/ailments` list of ailments
