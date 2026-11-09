# Plan — Phase 2: Agents & Ailments

## 1. Dependencies and housekeeping
1. Add runtime dep `better-sqlite3`; dev dep `@types/better-sqlite3`.
2. Add `data/` to `.gitignore`.
3. Make sure `tsconfig.build.json` / build output still work with the new files and that `migrations/` is available at runtime.

## 2. Database and migrations
1. Create `migrations/001_create_tables.sql` with `agents`, `ailments`, `agent_ailments` (FKs, `CHECK` on status).
2. Create `src/paths.ts` (project root from `import.meta.url`) and `src/db.ts`: `openDatabase()` opens the DB (path from `DATABASE_PATH` or `<root>/data/agentclinic.db`, `:memory:` supported), enables `foreign_keys` and runs pending migrations tracked in `schema_migrations`. Seeding stays separate.
3. Write `src/db.test.ts`: migrations create the tables, re-running is a no-op, FK and status constraints reject bad data, deletes cascade, and a file-backed DB survives reopening.

## 3. Seed data
1. Create `src/seed.ts`: insert a handful of agents (varied model types and statuses) and ailments (e.g. context-window claustrophobia, prompt fatigue, hallucination anxiety), plus agent↔ailment links, only when tables are empty.
2. Ensure every agent has at least one ailment and at least one agent has several.
3. Write `src/seed.test.ts`: seeding populates data, running twice does not duplicate.

## 4. Repositories
1. Create `src/repositories/agents.ts`: `listAgents(db)`, `getAgent(db, id)` (with its ailments).
2. Create `src/repositories/ailments.ts`: `listAilments(db)`.
3. Define typed row/result types; cover with tests on an in-memory DB.

## 5. App wiring
1. Refactor `src/app.tsx` to export `createApp(db)`; keep a default app for the server built in `src/index.ts` (open DB, migrate, seed, serve).
2. Add `src/testing.ts` (`createTestApp()` with an in-memory seeded DB, `render()` helper), excluded from `tsconfig.build.json`, and update existing tests to use it.

## 6. Navigation and layout
1. Create `src/components/Nav.tsx` (Home, Agents, Ailments; `aria-current` on the active link) and render it from `Header`.
2. Pass the required `path` prop from `Layout` to `Header`/`Nav`.
3. Test the nav in `Nav.test.tsx`, `Layout.test.tsx` (path reaches the nav) and `pages.test.ts`.
4. Create `src/components/StatusBadge.tsx` shared by the agent pages.

## 7. Pages and routes
1. `src/pages/Agents.tsx` + `GET /agents`: list with name, model type, status, link to profile.
2. `src/pages/AgentProfile.tsx` + `GET /agents/:id`: name, model type, status, presenting complaints; 404 for unknown/invalid id.
3. `src/pages/Ailments.tsx` + `GET /ailments`: name and description for each ailment.
4. Write route tests via `app.request()` for all three routes, including the 404 case and complaints appearing on a profile.

## 8. Styles
1. Extend `public/styles.css`: custom properties, reset, typography, nav, cards/lists, status badges, mobile-first with `min-width` queries, no horizontal overflow.
2. Add tests asserting the stylesheet defines custom properties and uses `min-width` media queries.

## 9. Docs and final checks
1. Update README with DB location, auto-migrate/seed behavior and new routes.
2. Update `CHANGELOG.md` per the repo's changelog skill.
3. Run `npm run typecheck`, `npm test`, `npm run build`, then the manual checks in `validation.md`.
