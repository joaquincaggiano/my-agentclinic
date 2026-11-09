# Plan — MVP

## 1. Therapies data
1. Add `migrations/002_create_therapies.sql`: `therapies`, `ailment_therapies`.
2. Extend `seed()` with ~6 whimsical therapies and ailment → therapy mappings (every ailment has at least one therapy; some therapies serve several ailments). Seed stays idempotent.
3. Add `src/repositories/therapies.ts` (`listTherapies` with the ailments each treats, `listTherapiesForAilment`) and extend `listAilments`/`getAgent` to include recommended therapies.
4. Tests: migration, seed mapping integrity, repository results.

## 2. Therapies pages
1. `src/pages/Therapies.tsx` + `GET /therapies` (name, description, ailments treated).
2. Show recommended therapies on `/ailments` cards and on the agent profile (per complaint).
3. Add Therapies to `Nav`; update nav tests.
4. Route tests for the new page and the new sections.

## 3. Therapists and appointments data
1. Add `migrations/003_create_appointments.sql`: `therapists`, `appointments` (FKs, status `CHECK`, unique `(therapist_id, scheduled_at)` for scheduled slots).
2. Seed ~4 therapists with specialties. Seeding is split into three independently guarded sections (clinic, therapies, therapists) so a Phase 2 database upgrades cleanly.
3. `src/repositories/therapists.ts` (`listTherapists`, `therapistExists`), `src/repositories/appointments.ts` (`isSlotTaken`, `createAppointment` returning the id or `'slot_taken'`, `getAppointment`, `listAppointments` — open first, then history — and `setAppointmentStatus`), and `src/repositories/dashboard.ts` (`getDashboardCounts`).
4. Tests: constraints, double booking rejected, status transitions.

## 4. Validation helpers
1. `src/validation/fields.ts`: `cleanText`, `parseId`, `parseEnum`, `toArray`, `parseDateTimeLocal` (UTC).
2. `validateBooking(input, now)` and `validateAgent(input, validAilmentIds)`, each returning `{ values, errors, data? }` (`data` present only when valid).
3. Unit tests for each helper and for booking validation edge cases (empty, past, malformed, unknown ids, oversized input, HTML in text).

## 5. Appointment booking
1. Add the booking form to `AgentProfile` (therapist select, `datetime-local`, submit) with error/preserved-value support.
2. `POST /agents/:id/appointments`: parse form body, validate, check therapist exists and slot is free, create, `303` to `/appointments/:id`; invalid → `422` re-render; unknown agent → 404. Cap POST bodies at 16 KB (`413`).
3. `src/pages/AppointmentConfirmation.tsx` + `GET /appointments/:id`.
4. Route tests: happy path, each validation error, double booking, confirmation content, 404s.

## 6. Error pages
1. `src/pages/ErrorPage.tsx` (generic) with `NotFound.tsx` and `ServerError.tsx` wrappers, inside `Layout`.
2. Wire `app.notFound` and `app.onError` (logs, generic 500) in `createApp`; unknown-agent and unknown-appointment 404s use them; reuse `ErrorPage` for 400/409/413.
3. Update existing 404 tests; add a test that forces a handler error and asserts a generic 500 with no stack/message leaked.

## 7. Staff dashboard
1. `src/repositories/dashboard.ts`: counts (agents, open appointments, ailments in flight).
2. `src/pages/Dashboard.tsx` + `GET /dashboard`: summary tiles and tables (upcoming appointments, agents, ailments), each table in a scroll container.
3. Appointment actions: `POST /appointments/:id/status` (complete/cancel, only from `scheduled`; `400` bad status, `404` unknown, `409` invalid transition) with `303` back to the dashboard.
4. Add Dashboard to `Nav`.
5. Tests: counts against seeded and modified data, action transitions, invalid transition → 4xx.

## 8. Agent management
1. `GET/POST /agents/new` and `GET/POST /agents/:id/edit` with name, model type, status and ailment checkboxes; validation + error re-render; redirect to the profile on success.
2. Add a "New agent" link on the dashboard and "Edit" links on the dashboard and agent profile.
3. Repository functions `createAgent`, `updateAgent` (transactional, replaces ailment links) and `getAgentAilmentIds`.
4. Tests: create, edit, validation errors, link replacement, unknown agent 404.

## 9. Styles and responsiveness
1. Extend `public/styles.css` (new `--color-surface` and `--color-danger` tokens): form controls (≥44px targets, labels, error styling, focus), summary tiles, scrollable table container, buttons — mobile-first, no horizontal page overflow.
2. Add `scripts/check-responsive.mjs` (`npm run check:responsive`, which builds first): serves the built app on a temporary database, books one appointment, loads every GET page (including the 404) in headless Chrome at 320/768/1280px, and fails on horizontal overflow or block-level links/buttons/inputs under 44px high.

## 10. Docs and wrap-up
1. Update README (routes, dashboard, forms, known limitations, responsive check) and `CHANGELOG.md` via `/changelog` after committing.
2. Mark Phases 3–5 complete in `specs/roadmap.md` and note the Phase 7 items pulled in (404/500, input validation).
3. Run `npm run typecheck`, `npm test`, `npm run build`, `npm run check:responsive`, then the manual walkthrough in `validation.md`; tick the checklist.
