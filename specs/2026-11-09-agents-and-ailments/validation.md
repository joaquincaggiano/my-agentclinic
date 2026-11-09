# Validation — Phase 2: Agents & Ailments

The implementation is successful and mergeable when every item below passes.

## Automated

- [x] `npm install` completes cleanly (including native `better-sqlite3` build).
- [x] `npm run typecheck` exits 0 with no `any` escapes in `src/`.
- [x] `npm test` passes, covering:
  - [x] Migrations create `agents`, `ailments`, `agent_ailments`; re-running is a no-op; invalid status and dangling FKs are rejected.
  - [x] Seeding populates agents and ailments, links each agent to at least one ailment, and is idempotent.
  - [x] `GET /agents` → 200 `text/html`, lists every seeded agent with model type and status, linking to `/agents/:id`.
  - [x] `GET /agents/:id` → 200 with name, model type, status and that agent's ailments; unknown or non-numeric id → 404.
  - [x] `GET /ailments` → 200, lists every seeded ailment.
  - [x] Every page includes the nav (Home, Agents, Ailments) with the current page marked `aria-current="page"`, and the viewport meta tag.
  - [x] `/styles.css` defines CSS custom properties and contains `min-width` media queries.
- [x] `npm run build` succeeds and `npm start` serves the app (migrations found at runtime).

## Manual

- [x] `npm run dev` on a fresh checkout creates `data/agentclinic.db`, migrates and seeds it; restarting does not duplicate data.
- [x] Browse Home → Agents → an agent profile → Ailments via the nav; links work and the active link is highlighted.
- [x] Responsive at 320px, 768px and 1280px: no horizontal scrollbar, nav usable (tap targets ≥ 44×44px), lists/profile readable, content capped and centred on wide screens.
- [x] Seed data reads as fictional and on-theme.

## Merge criteria

- [x] Only in-scope changes: DB/migrations/seed, repositories, nav, three pages, stylesheet, tests, docs/changelog, and this spec directory.
- [x] `data/`, `node_modules/` and `dist/` are not committed.
