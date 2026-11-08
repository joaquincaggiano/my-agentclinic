# Tech Stack

## Principles

- Reliable and popular choices over novel ones (Mary, engineering).
- Server-side TypeScript throughout.
- Attractive UI that works well in modern browsers (Steve, marketing).

## Language and runtime

- **TypeScript** (strict mode), compiled with `tsc`.
- **Node.js** (current LTS) as the server runtime.

## Framework (recommended): Fastify

We recommend **Fastify** as the server-side framework.

Why Fastify:
- Popular, mature, and actively maintained, which fits the reliability goal.
- First-class TypeScript support, with typed routes and schema validation.
- Fast, with a small footprint and a rich plugin ecosystem (static files, templating, cookies, etc.).
- Well suited to a server-rendered dashboard plus JSON endpoints.

Alternatives considered:
- **Express**: the most familiar, but weaker TypeScript ergonomics and fewer built-in guarantees.
- **Hono**: modern and light, but a smaller ecosystem.
- **Next.js / NestJS**: more than we need for this scope.

## Database

- **SQLite** for persistence.
- Zero-setup and file-based, which suits course students and quick conference demos.
- Accessed from Node.js through a SQLite driver (library to be chosen when implementing).

## Frontend

- Server-rendered HTML from Fastify, with a templating plugin.
- Modern CSS, with no heavy client-side framework for now.
- Target: current versions of evergreen browsers (Chrome, Firefox, Safari, Edge).

## Tooling

- `npm` for package management.
- `tsc` for builds (already configured in `package.json`).
- Linting, formatting, and testing tools to be chosen in a later phase.

## Open decisions

- SQLite driver/library (e.g. `better-sqlite3`) and migration approach.
- Templating engine and CSS approach.
- Testing framework.
