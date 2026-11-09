# Changelog

## 2026-11-09

- Add SQLite storage with SQL migrations and idempotent seed data for agents, ailments and their links
- Add the `/agents`, `/agents/:id` and `/ailments` pages with header navigation that marks the current page
- Extend the stylesheet with cards, status badges and responsive grids, and add a shared status badge component
- Resolve migrations, the database and static files from the project root so the app runs from any directory
- Add the Phase 2 spec (plan, requirements, validation) and document the database and routes in the README
- Adopt Vitest as the validation mechanism and document the testing conventions in the tech stack
- Add test suites for the layout components, document head and unknown routes
- Make the web UI responsive: mobile-first, fluid stylesheet, and responsive design rules in the specs
- Split `tsconfig.build.json` from `tsconfig.json` so tests are typechecked but not built

## 2026-11-08

- Add the project constitution: mission, tech stack and roadmap
- Add Phase 1 "Hello Hono": Hono app with `tsx` dev server, NodeNext TypeScript config, home page route and Vitest smoke test
- Add the main layout with header, main and footer components and a linked stylesheet
- Initial project setup
