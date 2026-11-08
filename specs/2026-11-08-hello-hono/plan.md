# Plan — Phase 1: Hello Hono

## 1. Dependencies and scripts
1. Add runtime deps: `hono`, `@hono/node-server`.
2. Add dev deps: `tsx`, `@types/node`, `vitest`.
3. Set `"type": "module"` in `package.json`.
4. Add scripts: `dev` (`tsx watch src/index.ts`), `build` (`tsc`), `start` (`node dist/index.js`), `test` (`vitest run`), `typecheck` (`tsc --noEmit`).

## 2. TypeScript configuration
1. Update `tsconfig.json`: `target` ES2022, `module` and `moduleResolution` NodeNext, keep `strict`, `outDir: dist`, `rootDir: src`.
2. Enable Hono JSX: `"jsx": "react-jsx"` and `"jsxImportSource": "hono/jsx"`.
3. Exclude test files from the production build output if they live in `src` (or place tests in `tests/` and include them in typechecking only).

## 3. App and server
1. Create `src/app.tsx`: `const app = new Hono()`, register the `/` route (wired to the home page in group 4), `export default app`.
2. Replace `src/index.ts`: import app, call `serve({ fetch: app.fetch, port })` with `port = Number(process.env.PORT ?? 3000)`, log the listening URL.

## 4. Minimal home page
1. Create `src/pages/Home.tsx`: a single Hono JSX component rendering a complete HTML document (`<!DOCTYPE html>`, `<html lang="en">`, `<meta charset>`, viewport meta, `<title>AgentClinic</title>`).
2. Body content: an `<h1>` with `AgentClinic is open for business`, plus one short tagline paragraph taken from the mission (e.g. "Because AI agents have feelings too.").
3. Use only semantic elements (`<main>`, `<h1>`, `<p>`). No shared layout, no nav/footer, no external CSS file (those are Phase 2); at most a few inline `<style>` rules for readable defaults.
4. In `src/app.tsx`, have `GET /` return `c.html(<Home />)`.

## 5. Smoke test
1. Add `src/app.test.ts` (or `tests/app.test.ts`): `app.request('/')` returns status 200, a `text/html` content type, and a body containing `<h1>` text `AgentClinic is open for business`.

## 6. Verify and document
1. Run `npm run typecheck`, `npm test`, `npm run build`.
2. Run `npm run dev`, `curl localhost:3000/`, and open it in a browser.
3. Add a short "Getting started" section to `README.md` (install, dev, build, test).
4. Walk through `validation.md` before merging.
