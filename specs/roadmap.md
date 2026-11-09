# Roadmap

Phases are intentionally small — each one is a shippable slice of work, independently reviewable and testable. Every page built in any phase must be responsive (mobile-first, see `tech-stack.md`). Every phase ships with Vitest tests (`npm test`); a phase is done when its tests pass.

---

## Phase 1 — Hello Hono ✅ Complete
- Install and configure Hono with `tsx` dev server
- Single `/` route returning "AgentClinic is open for business"
- Confirm TypeScript types work end-to-end

## Phase 2 — Agents & Ailments
- Layout: add site navigation (header nav) to the shared server-side JSX layout; all routes render inside it
- Basic CSS (custom properties, reset, typography), mobile-first and responsive from the start
- SQLite database + migrations (`agents`, `ailments` tables)
- Seed a handful of fictional agents and ailments (e.g., "context-window claustrophobia", "prompt fatigue")
- `/agents` page listing all agents
- `/agents/:id` page showing a single agent's profile: name, model type, current status, presenting complaints
- `/ailments` list page
- Link agents to one or more ailments

## Phase 3 — Therapies Catalog
- `therapies` table + seed data
- `/therapies` list page
- Map ailments → recommended therapies

## Phase 4 — Appointment Booking
- `appointments` table (agent, therapist, datetime, status)
- Form to book an appointment from an agent's detail page
- Basic validation and confirmation page

## Phase 5 — Staff Dashboard
- `/dashboard` with summary counts: agents, open appointments, ailments in-flight
- Simple table views for staff to manage records
- Mary's dashboard is now real

## Phase 6 — Polish & Accessibility
- Responsive audit across all pages (320px–1280px+) for Steve's modern-browser requirement; fix any regressions
- Semantic HTML audit
- Keyboard navigation and focus styles

## Phase 7 — Hardening
- Error pages (404, 500)
- Input sanitization on all forms
- Basic logging middleware

---

Later phases (not yet planned): auth, email notifications, therapist profiles, reporting.
