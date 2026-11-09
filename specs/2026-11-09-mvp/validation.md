# Validation — MVP

The implementation is successful and mergeable when every item below passes.

## Automated

- [x] `npm ci` completes cleanly on a fresh clone.
- [x] `npm run typecheck` exits 0 with no `any` escapes in `src/`.
- [x] `npm run build` succeeds and `npm start` serves the app from `dist/` from any working directory.
- [x] `npm test` passes, covering:
  - [x] Migrations `002`/`003` apply once and are idempotent; FK, `CHECK` and uniqueness constraints reject bad data; deletes cascade where specified.
  - [x] Seed populates therapies, therapists and ailment → therapy mappings; every ailment has at least one therapy; seeding twice does not duplicate.
  - [x] `GET /therapies` lists every therapy with the ailments it treats; `/ailments` and agent profiles show recommended therapies.
  - [x] Booking: valid POST → `303` to a confirmation page showing agent, therapist, time and status; invalid input (missing/past/malformed datetime, unknown therapist, oversized values) → `422` with inline errors and preserved values; double booking the same therapist slot is rejected; unknown agent → 404.
  - [x] Validation helpers are unit-tested, including HTML/SQL-looking input; stored text renders escaped.
  - [x] `GET /dashboard` shows correct counts (agents, open appointments, ailments in flight) before and after booking/completing/cancelling; completing or cancelling a non-`scheduled` appointment is rejected.
  - [x] Agent create/edit: validation errors, ailment link replacement, redirect on success, unknown id → 404.
  - [x] Custom 404 (unknown route, agent, appointment) and 500 pages render inside the layout; the 500 leaks no error message or stack.
  - [x] Every page includes the nav with the current section marked `aria-current="page"`, the viewport meta, and exactly one `<h1>`.
- [x] `npm run check:responsive` (needs Chrome) reports no horizontal overflow and no block-level links/buttons/inputs under 44px at 320px, 768px and 1280px on every GET page (including `/appointments/:id`, `/agents/new`, `/agents/:id/edit` and the 404 page).

## Manual (demo walkthrough)

Verification notes for the MVP: the walkthrough was exercised with `curl` against a database upgraded from Phase 2, and the visual/responsive items by `check:responsive` and the tests above. A human visual pass in a real browser is still recommended before a demo.

- [x] On a fresh `data/` directory (or a database created in Phase 2, which is upgraded in place), `npm run dev` creates, migrates and seeds the database; a restart does not duplicate data.
- [x] Walk the story: Agents → an agent profile → see complaints and recommended therapies → book an appointment → confirmation page → Dashboard shows the new appointment and updated counts.
- [x] On the dashboard, complete one appointment and cancel another; counts and table update.
- [x] Create a new agent with two ailments, edit its status, and see both on its profile.
- [x] Submit the booking form empty and with a past date: errors are clear and entered values survive.
- [x] Visit `/nope` and `/agents/999`: friendly 404 with navigation.
- [x] Visual check at 320px, 768px and 1280px: forms are usable, dashboard tables scroll inside their container, nothing overflows the page.
- [x] Copy and seed data read as whimsical and on-mission.

## Merge criteria

- [x] Only in-scope changes: therapies, therapists, appointments, booking, dashboard, agent management, error pages, input validation, styles, tests, the responsive check script, docs, this spec directory.
- [x] Known limitations documented in the README: no authentication/CSRF protection, UTC-only times.
- [x] Open questions are recorded in `requirements.md` rather than left implicit.
- [x] `specs/roadmap.md` marks Phases 3–5 complete and notes the Phase 7 items pulled in.
- [ ] `CHANGELOG.md` updated via `/changelog` (run by the user after committing).
- [x] `data/`, `node_modules/` and `dist/` are not committed.
