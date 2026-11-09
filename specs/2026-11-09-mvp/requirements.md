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

- **Data model** (new migrations `002_…`, `003_…`, applied by the existing runner):
  - `therapies(id, name, description)`
  - `ailment_therapies(ailment_id, therapy_id)` — many-to-many, composite PK, `ON DELETE CASCADE`
  - `therapists(id, name, specialty)` — small seeded table; no management UI
  - `appointments(id, agent_id, therapist_id, scheduled_at, status, created_at)` — FKs to agents/therapists; `scheduled_at` stored as ISO-8601 UTC text; `status` `CHECK` in `scheduled | completed | cancelled`
- **"Open appointment"** means `status = 'scheduled'`. **"Ailments in flight"** means distinct ailments linked to agents that have at least one open appointment.
- **Booking flow:** the form lives on `/agents/:id` (therapist `<select>` + `datetime-local` input) and posts to `POST /agents/:id/appointments`.
  - Valid → `303` redirect to `GET /appointments/:id` (confirmation page).
  - Invalid → `422` with the profile re-rendered, inline error messages and the submitted values preserved.
  - Rules: agent and therapist must exist; datetime is required, parseable and in the future; no double booking of the same therapist at the same `scheduled_at`.
- **Staff management** (no auth in the MVP; the dashboard is open, noted as a known limitation):
  - Appointments: `POST /appointments/:id/status` to mark `completed` or `cancelled` (only from `scheduled`).
  - Agents: create (`GET/POST /agents/new`) and edit (`GET/POST /agents/:id/edit`) with name, model type, status and ailment checkboxes.
  - Ailments, therapies and therapists are read-only in the UI.
- **Dashboard:** `GET /dashboard` shows three summary counts (agents, open appointments, ailments in flight) plus tables for upcoming appointments, agents and ailments. Tables scroll inside their own container on small screens.
- **Forms:** plain HTML forms with POST + redirect (PRG); no client-side JavaScript. Inputs are trimmed, length-limited and whitelisted (enums, numeric ids); all SQL is parameterized; output is escaped by Hono JSX. CSRF protection is deferred with auth.
- **Error pages:** `app.notFound` renders a styled 404 inside `Layout`; `app.onError` renders a styled 500 without leaking error details. Replaces the plain-text 404s from Phases 1–2 (existing tests updated).
- **Navigation:** Home, Agents, Ailments, Therapies, Dashboard. Appointments are reached via the dashboard and agent profiles. `Nav` highlights the current section (including nested paths).
- **Code structure (unchanged conventions):** Hono JSX pages in `src/pages/`, shared pieces in `src/components/`, SQL helpers in `src/repositories/`, validation helpers in `src/validation/`, props declared as named types, one exported component per file. `createApp(db)` stays the composition root; `src/testing.ts` stays the shared test helper.
- **Dates/time:** the app treats `datetime-local` input as UTC for simplicity and displays times in UTC with an explicit label; `now` is injectable into the booking validator so tests are deterministic.
- **Testing:** Vitest per `tech-stack.md`; routes through `app.request()` (including form POSTs); in-memory SQLite.

## Context

- Mission: agents get matched with therapists and therapies; staff run it from a clean dashboard — "Mary really wants a nice dashboard". Keep the tone whimsical and the scope demo-sized.
- Existing code: `createApp(db)`, `openDatabase()` with numbered SQL migrations, idempotent `seed()`, repositories for agents/ailments, `Layout`/`Header`/`Nav`/`StatusBadge` components, mobile-first `public/styles.css`. See `specs/2026-11-09-agents-and-ailments/`.
- Roadmap bookkeeping: on completion, mark Phases 3, 4, 5 complete in `specs/roadmap.md` and note which Phase 7 items were pulled in.
- Branch: `mvp`.
