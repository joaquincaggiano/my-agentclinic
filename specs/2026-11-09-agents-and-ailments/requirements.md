# Requirements — Phase 2: Agents & Ailments

## Scope

In scope (from `specs/roadmap.md`, Phase 2 — full phase):

- Site navigation (header nav) in the shared `Layout`; all routes render inside it
- Basic CSS: custom properties, reset, typography — mobile-first and responsive
- SQLite database with plain-SQL migrations for `agents`, `ailments` and an `agent_ailments` join table
- Seed data: a handful of fictional agents and ailments (e.g. "context-window claustrophobia", "prompt fatigue")
- `/agents` list page, `/agents/:id` profile page (name, model type, current status, presenting complaints), `/ailments` list page
- Agents linked to one or more ailments (many-to-many)

Out of scope: therapies, appointments, dashboard, error pages (beyond a plain 404 for an unknown agent), forms, auth.

## Decisions

- **Database:** SQLite via `better-sqlite3` (per `tech-stack.md`); no ORM. File at `data/agentclinic.db` (git-ignored); tests use an in-memory database (`:memory:`).
- **Schema:** `agents(id, name, model_type, status)`, `ailments(id, name, description)`, `agent_ailments(agent_id, ailment_id)` with a composite primary key and foreign keys (`ON DELETE CASCADE`). Agent `status` is a small fixed set (e.g. `waiting`, `in_session`, `recovering`) enforced by a `CHECK` constraint.
- **Migrations:** numbered plain SQL files in `migrations/` (e.g. `001_create_tables.sql`), applied automatically at startup in order and tracked in a `schema_migrations` table so each runs once.
- **Seeding:** a seed module inserts fictional data only when the tables are empty (idempotent), run at startup after migrations.
- **DB access:** `src/db.ts` exports `openDatabase(path?)`, which opens the DB and runs migrations (path from `DATABASE_PATH`, default `data/agentclinic.db`, `:memory:` supported); seeding is a separate `seed(db)` called from `src/index.ts`. `createApp(db)` receives the database so tests can inject an in-memory one. `src/testing.ts` (`createTestApp()`, `render()`) is a shared test helper, excluded from the production build.
- **Paths:** the migrations folder, the default DB file and `public/` are resolved from the project root via `import.meta.url` (`src/paths.ts`), so the app works from any working directory. Query helpers live in `src/repositories/` (plain functions, typed rows).
- **Routes:** `GET /agents`, `GET /agents/:id`, `GET /ailments`. Unknown or non-numeric agent id returns 404.
- **Pages:** Hono JSX components in `src/pages/` (`Agents.tsx`, `AgentProfile.tsx`, `Ailments.tsx`), rendered inside `Layout`. List pages link agents to their profiles; profiles list complaints; ailments list shows names and descriptions.
- **Props:** each component declares its props as a named TypeScript type above it. `path` is a required prop on `Layout`, `Header` and `Nav`.
- **Status badge:** a shared `StatusBadge` component renders agent status (`badge-in-session` style classes); list and profile pages show an empty-state message when there is no data.
- **Navigation:** a `Nav` component (own file) rendered by `Header`, linking Home, Agents, Ailments. Mobile-first: usable and wrapping/stacking at 320px, touch targets (nav and in-page links) at least 44px tall; visible `:focus-visible` outline. Current page marked with `aria-current="page"`.
- **CSS:** stays plain CSS in `public/styles.css`: custom properties for colors/spacing/type, a small reset, fluid type, mobile-first `min-width` queries, no horizontal scroll, tables/lists reflow or scroll within their own container.
- **Testing:** Vitest per `tech-stack.md`; routes via `app.request()`; DB tests against in-memory SQLite.

## Context

- Phase 1 is complete: Hono app in `src/app.tsx`, server in `src/index.ts`, layout components in `src/components/`, stylesheet `public/styles.css`, tests alongside code.
- Mission: whimsical, tightly-scoped teaching/demo project; seed data should be funny but plausible.
- Roadmap phases 2–5 were combined into this single phase; Phase 3+ (therapies, appointments, dashboard) will build on these tables.
- Branch: `phase-2-agents-and-ailments`.
