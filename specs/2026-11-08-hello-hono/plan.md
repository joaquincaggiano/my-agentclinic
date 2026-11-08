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
3. Use semantic elements only. Page content (`<h1>`, `<p>`) is rendered inside the shared layout from group 5 (the inline `<style>` is replaced by the linked stylesheet).
4. In `src/app.tsx`, have `GET /` return `c.html(<Home />)`.

## 5. Main layout and stylesheet
Each component below goes in its own file, one exported component per file.

1. Create `src/components/Header.tsx`: a `<header>` with the site name "AgentClinic" linking to `/`.
2. Create `src/components/Main.tsx`: a `<main>` that renders `children`.
3. Create `src/components/Footer.tsx`: a `<footer>` with a short tagline/copyright line.
4. Create `src/components/Layout.tsx`: renders the `<!DOCTYPE html>` document (`lang="en"`, charset, viewport, `<title>` from a `title` prop, `<link rel="stylesheet" href="/styles.css">`) and composes `<Header />`, `<Main>{children}</Main>`, `<Footer />`.
5. Create `public/styles.css`: custom properties, minimal reset, typography, and basic styling for header/main/footer (footer sticks to the bottom via flex column on `body`).
6. Serve it: in `src/app.tsx`, import `serveStatic` from `@hono/node-server/serve-static` and register `app.use('/styles.css', serveStatic({ path: './public/styles.css' }))` before the routes.
7. Refactor `src/pages/Home.tsx` to render `<Layout title="AgentClinic">` containing only the `<h1>` and tagline.

## 6. Smoke test
1. Add `src/app.test.ts` (or `tests/app.test.ts`): `app.request('/')` returns status 200, a `text/html` content type, and a body containing `<h1>` text `AgentClinic is open for business`.
2. Extend it: the body contains `<header>`, `<main>`, `<footer>` and `<link rel="stylesheet" href="/styles.css">`; `GET /styles.css` returns 200 with a `text/css` content type.

## 7. Verify and document
1. Run `npm run typecheck`, `npm test`, `npm run build`.
2. Run `npm run dev`, `curl localhost:3000/`, and open it in a browser.
3. Add a short "Getting started" section to `README.md` (install, dev, build, test).
4. Walk through `validation.md` before merging.
