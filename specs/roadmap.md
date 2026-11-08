# Roadmap

High-level implementation order, in very small phases. Each phase is a minimal, verifiable deliverable.

## Phase 1: Project skeleton
Fastify and TypeScript installed, with a dev script and a build script that both run cleanly.

## Phase 2: Hello clinic
A server that starts and responds on `/` with a welcome page, plus a `/health` endpoint.

## Phase 3: Layout and styling
A shared page layout (header, nav, footer) with base styles, responsive in modern browsers.

## Phase 4: Dashboard shell
A `/dashboard` page with placeholder sections for agents, ailments, therapies, and appointments.

## Phase 5: Agents
List agents and view a single agent's profile (seeded sample data).

## Phase 6: Ailments
List ailments and show which agents suffer from which.

## Phase 7: Therapies
List therapies and link each to the ailments it treats.

## Phase 8: Appointments, viewing
List appointments for an agent and for a therapy.

## Phase 9: Appointments, booking
A form to book an appointment for an agent with a therapy, with validation.

## Phase 10: Dashboard data
Replace placeholders with real summaries (counts, upcoming appointments).

## Phase 11: Polish
Visual refinement for marketing, accessibility pass, and cross-browser check.

## Phase 12: Hardening
Error pages, input validation review, logging, and a basic test suite.
