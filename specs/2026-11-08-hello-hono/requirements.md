# Requirements — Phase 1: Hello Hono

## Scope

In scope (from `specs/roadmap.md`, Phase 1, plus one addition):

- Install and configure Hono with a `tsx` dev server
- A single `/` route that serves a minimal AgentClinic home page whose headline is `AgentClinic is open for business`
- Confirm TypeScript types work end-to-end (strict mode, typed app, typed JSX, clean `tsc` build)

- A main layout component composed of three subcomponents (header, main, footer), each in its own file, plus a linked CSS file

Out of scope (later phases): nav links, full CSS design system, SQLite, any other routes, Prettier, logging, error pages.

## Decisions

- **Framework:** Hono with `@hono/node-server` as the Node adapter (per `specs/tech-stack.md`).
- **Dev server:** `tsx watch src/index.ts` via `npm run dev`; no build step in development.
- **Production build:** `tsc` to `dist/`, run with `node dist/index.js` via `npm start`.
- **Module system:** switch `tsconfig.json` to `module`/`moduleResolution` `NodeNext` and set `"type": "module"` in `package.json`, since Hono's Node adapter is ESM-first. Target `ES2022`.
- **App/server split:** `src/app.tsx` exports the Hono `app` (no side effects); `src/index.ts` starts the server. This keeps the app testable without binding a port.
- **Port:** `3000`, overridable via `PORT` env var.
- **Home page:** a standalone Hono JSX component (`src/pages/Home.tsx`) rendering a full HTML document with an `<h1>` of `AgentClinic is open for business` and a short mission tagline. Uses Hono JSX (per tech stack) via `jsx: react-jsx` / `jsxImportSource: hono/jsx`. It renders inside the shared `Layout` component and has no inline styles.
- **Layout components:** `Layout`, `Header`, `Main` and `Footer` each live in their own file under `src/components/` (`Layout.tsx`, `Header.tsx`, `Main.tsx`, `Footer.tsx`), one exported component per file. `Layout` imports the other three and composes them; no component is defined inline inside another's file.
- **Stylesheet:** a plain CSS file at `public/styles.css`, served at `/styles.css` via `serveStatic` and linked from `Layout`'s `<head>` with `<link rel="stylesheet" href="/styles.css">`.
- **Response type:** `text/html`, status 200. The roadmap's plain-text wording is satisfied by the `<h1>` content.
- **Testing exception:** the scope is roadmap-only, but validation requires an automated check, so a single minimal Vitest smoke test of `/` is added as a dev dependency. No other test infrastructure is added.

## Context

- Repo currently contains only a placeholder `src/index.ts` (`console.log`) and a `tsconfig.json` using CommonJS; `package.json` has only TypeScript.
- Mission: AgentClinic is a whimsical, tightly-scoped demo/teaching project; keep this slice small and reviewable.
- Tech stack: TypeScript, Node.js, Hono, Hono JSX, plain CSS, SQLite later, Vitest for tests, `tsx` for dev, `tsc` for builds.
- Branch: `phase-1-hello-hono`.
