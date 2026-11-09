# Tech Stack

AgentClinic is a server-side TypeScript application. All rendering happens on the server; the browser receives plain HTML that works well and looks good.

## Core

| Layer | Choice | Rationale |
|---|---|---|
| Language | TypeScript | Type safety end-to-end; satisfies Mary's requirement |
| Runtime | Node.js | Stable, well-supported, vast ecosystem |
| Server framework | **Hono** | Lightweight, TypeScript-first, fast, excellent DX; routes and middleware feel natural |
| Templating | Hono JSX (server-side) | JSX without React overhead; components are just functions |
| CSS | Plain CSS + CSS custom properties | No build step required; Steve gets a modern, attractive result |
| Responsiveness | Mobile-first responsive CSS | Every page works from phone to desktop without a separate mobile site |

## Recommended: Hono

[Hono](https://hono.dev) is chosen over Express/Fastify because:

- First-class TypeScript with zero config
- Built-in JSX renderer for server-side HTML
- Middleware model is simple and composable
- Runs on Node, Deno, Bun, and edge runtimes without changes

## Responsive Design

The web UI is responsive: every page must be usable and look good from ~320px phones to wide desktop screens.

- **Mobile-first:** base styles target small screens; `@media (min-width: …)` queries layer on larger-screen enhancements.
- **Viewport meta** (`width=device-width, initial-scale=1`) is present on every page, supplied by the shared `Layout`.
- **Fluid by default:** relative units (`rem`, `%`, `clamp()`), `max-width` containers and flexbox/grid instead of fixed pixel widths.
- **No horizontal scrolling** at any width; long text wraps, and media and tables scale or scroll within their own container.
- **Touch-friendly:** interactive targets are at least 44×44px.
- **Plain CSS only:** no CSS framework or preprocessor.
- **Verification:** automated tests check the viewport meta and the presence of responsive rules; visual checks at 320px, 768px and 1280px are part of each feature's manual validation.

## Data

- **SQLite** (via `better-sqlite3`) for local development and early production — simple, embedded, no infrastructure
- Migrations via plain SQL files; no ORM to start

## Testing

- **Vitest** — fast, TypeScript-native, compatible with the rest of the stack
- Vitest tests are the validation mechanism: a change is considered done when the tests pass
- Run via the `npm test` script in `package.json` (`vitest run`, single non-watch run suitable for CI)
- Tests live alongside the code they cover as `*.test.ts` files
- Route handlers are tested through Hono's `app.request()`, so no running server is needed

## Tooling

- `tsx` for development (run TypeScript directly, no build step needed)
- `tsc` for production builds
- `prettier` for formatting

## What We Are Not Using

- No React, Vue, or Svelte — server-side rendering keeps the stack simple
- No ORM — SQL is sufficient at this scale
- No Docker — not yet; that's a later phase concern
