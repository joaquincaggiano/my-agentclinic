# Requirements — MVP (Phases 3–5 + error pages)

## Scope

Phases 1–2 are complete. The MVP finishes the core of `specs/roadmap.md` so a conference-booth demo can run end to end: *find an agent → see its ailments → see recommended therapies → book an appointment → see it on the staff dashboard*.

In scope:

- **Phase 3 — Therapies catalog:** `therapies` table + seed data, `/therapies` list page, ailment → recommended therapies mapping (shown on `/ailments`, agent profiles and `/therapies`).
- **Phase 4 — Appointment booking:** `therapists` and `appointments` tables, booking form on the agent profile, validation, confirmation page.
- **Phase 5 — Staff dashboard:** `/dashboard` with summary counts and table views; staff can create/edit agents, link ailments, and complete/cancel appointments.
- **From Phase 7, only the minimum for a safe demo:** custom 404 and 500 pages, and server-side input validation/sanitization on every form.
- Navigation updated with the new pages; every page stays responsive (mobile-first, per `tech-stack.md`).

Out of scope (stay on the roadmap or "later"): Phase 6 accessibility audit, logging middleware, auth, email notifications, therapist profile pages, reporting, rescheduling, editing/deleting ailments and therapies.

## Decisions

- **Seeding:** `seed()` seeds three sections independently — clinic (agents, ailments, links), therapies (therapies + recommendations, matched to ailments by name) and therapists — each only when its own table is empty. This lets a database created in Phase 2 pick up the new data on upgrade without duplicating anything.
- **Data model** (new migrations `002_create_therapies.sql`, `003_create_appointments.sql`, applied by the existing runner):
  - `therapies(id, name, description)`
  - `ailment_therapies(ailment_id, therapy_id)` — many-to-many, composite PK, `ON DELETE CASCADE`
  - `therapists(id, name, specialty)` — small seeded table; `specialty` is free text, not linked to ailments; no management UI; the booking form lists every therapist
  - `appointments(id, agent_id, therapist_id, scheduled_at, status, created_at)` — FKs to agents/therapists (appointments cascade-delete with their agent); `scheduled_at` stored as ISO-8601 UTC text; `status` `CHECK` in `scheduled | completed | cancelled`; `created_at` is recorded but not displayed; a partial unique index on `(therapist_id, scheduled_at) WHERE status = 'scheduled'` enforces one open appointment per therapist per slot
- **"Open appointment"** means `status = 'scheduled'`. **"Ailments in flight"** means distinct ailments linked to agents that have at least one open appointment.
- **Booking flow:** the form lives on `/agents/:id` (therapist `<select>` + `datetime-local` input) and posts to `POST /agents/:id/appointments`.
  - Valid → `303` redirect to `GET /appointments/:id` (confirmation page, nav highlights Agents).
  - Invalid → `422` with the profile re-rendered, inline error messages and the submitted values preserved.
  - Rules: agent and therapist must exist; datetime is required, parseable and strictly in the future; no double booking of the same therapist at the same `scheduled_at` while the earlier appointment is still `scheduled` (checked up front and again via the unique index to handle races).
  - Not restricted (open questions below): the same agent booked with different therapists at the same time, minimum/maximum lead time, matching therapist specialty to the agent's ailments.
  - Booking and status changes do **not** change the agent's own `status`.
- **Staff management** (no auth in the MVP; the dashboard is open, noted as a known limitation):
  - Appointments: `POST /appointments/:id/status` to mark `completed` or `cancelled`, only from `scheduled` (a future appointment may be completed). Unknown status → `400`, unknown id → `404`, non-`scheduled` appointment → `409`; success → `303` to `/dashboard`.
  - Agents: create (`GET/POST /agents/new`) and edit (`GET/POST /agents/:id/edit`) with name (≤80 chars), model type (≤80), status and ailment checkboxes; at least one existing ailment is required. Links: "New agent" on the dashboard only; "Edit" on the dashboard and on the agent profile. No delete.
  - Ailments, therapies and therapists are read-only in the UI.
- **Dashboard:** `GET /dashboard` shows three summary counts (agents, open appointments, ailments in flight) plus tables for upcoming appointments, agents and ailments. Tables scroll inside their own container on small screens.
- **Forms:** plain HTML forms with POST + redirect (PRG); no client-side JavaScript; `novalidate` so the server's messages are always shown. "Sanitization" here means: control characters stripped and text trimmed, length limits, enum/numeric-id whitelisting, parameterized SQL, and output escaped by Hono JSX (HTML is not stripped, it is escaped). POST bodies are capped at 16 KB (`413`). CSRF protection is deferred with auth.
- **Status codes:** `200` pages, `303` after successful POSTs, `400` bad status value, `404` unknown route/record, `409` invalid appointment transition, `413` oversized body, `422` validation failure (form re-rendered), `500` unexpected error.
- **Error pages:** a generic `ErrorPage` (title + message) with thin `NotFound` and `ServerError` wrappers, all rendered inside `Layout` with the nav. `app.notFound` → 404; `app.onError` logs the error server-side and renders a generic 500 without leaking details. The same `ErrorPage` is used for the 400/409/413 responses. Replaces the plain-text 404s from Phases 1–2 (existing tests updated).
- **Navigation:** Home, Agents, Ailments, Therapies, Dashboard. Appointments are reached via the dashboard and agent profiles. `Nav` highlights the current section (including nested paths).
- **Code structure (unchanged conventions):** Hono JSX pages in `src/pages/`, shared pieces in `src/components/`, SQL helpers in `src/repositories/`, validation helpers in `src/validation/`, props declared as named types, one exported component per file. `createApp(db)` stays the composition root; `src/testing.ts` stays the shared test helper.
- **Dates/time:** the app treats `datetime-local` input as UTC for simplicity and displays times in UTC with an explicit label (`YYYY-MM-DD HH:mm UTC`); the clock is injectable (`createApp(db, { now })`) so tests are deterministic. Known caveat: browsers fill `datetime-local` in local time, so non-UTC users must enter UTC.
- **Testing:** Vitest per `tech-stack.md`; routes through `app.request()` (including form POSTs via the `postForm` helper in `src/testing.ts`); in-memory SQLite. Responsiveness is additionally checked by `npm run check:responsive` (builds, serves the app on a temporary database, loads every GET page in headless Chrome at 320/768/1280px, fails on horizontal overflow or block-level tap targets under 44px). It needs Chrome/Chromium (`CHROME_PATH` overrides detection) and is not part of `npm test`.

## Context

- Mission: agents get matched with therapists and therapies; staff run it from a clean dashboard — "Mary really wants a nice dashboard". Keep the tone whimsical and the scope demo-sized.
- Existing code: `createApp(db)`, `openDatabase()` with numbered SQL migrations, idempotent `seed()`, repositories for agents/ailments, `Layout`/`Header`/`Nav`/`StatusBadge` components, mobile-first `public/styles.css`. See `specs/2026-11-09-agents-and-ailments/`.
- Roadmap bookkeeping: on completion, mark Phases 3, 4, 5 complete in `specs/roadmap.md` and note which Phase 7 items were pulled in.
- Branch: `mvp`.

## Open questions (not decided in the MVP)

1. Should booking/completing an appointment change the agent's `status` (`waiting`/`in_session`/`recovering`)?
2. Should the same agent be blockable from overlapping appointments, and should there be minimum/maximum booking lead times? Should completing a future appointment be allowed?
3. Should the therapist list be filtered or suggested by the agent's ailments, and should an appointment record which therapy it applies?
4. Is UTC-only acceptable beyond the demo, or should the user's time zone be captured?
5. What does "staff manage records" include beyond this scope (deleting agents and its cascade effect on appointments; editing ailments, therapies, therapists)?
6. What remains of "input sanitization" in Phase 7 (HTML stripping policy, CSRF, rate limiting) and logging middleware?
