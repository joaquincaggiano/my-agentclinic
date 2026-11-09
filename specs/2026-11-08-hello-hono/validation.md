# Validation — Phase 1: Hello Hono

The implementation is successful and mergeable when every item below passes.

## Automated

- [ ] `npm install` completes cleanly on a fresh clone.
- [ ] `npm run typecheck` exits 0 with `strict` enabled (including `.tsx` files) and no `any` escapes in `src/`.
- [ ] `npm test` (`vitest run`) passes: `GET /` returns 200, `text/html`, and a body whose `<h1>` is exactly `AgentClinic is open for business`, rendered inside the shared layout (header, main, footer, stylesheet link); `GET /styles.css` returns 200 with `text/css`.
- [ ] `src/components/` contains `Layout.tsx`, `Header.tsx`, `Main.tsx` and `Footer.tsx`, each exporting its own component from its own file.
- [ ] Tests assert the viewport meta tag and that `/styles.css` contains a mobile-first `min-width` media query.
- [ ] `npm run build` produces `dist/index.js` and `dist/app.js` with no errors.

## Manual

- [ ] Responsive: at 320px, 768px and 1280px widths (browser dev tools) the page has no horizontal scrollbar, text is readable without zooming, and header, main and footer stay intact; content stays centred and capped at the max width on wide screens.
- [ ] `npm run dev` starts the server and logs the listening URL (default `http://localhost:3000`).
- [ ] `curl -i http://localhost:3000/` returns `200`, `content-type: text/html`, and HTML containing the `<h1>`.
- [ ] Opening `http://localhost:3000/` in a browser shows the home page: headline `AgentClinic is open for business` and the tagline, readable and unbroken inside the layout (header, main, footer) and styled by the linked stylesheet.
- [ ] Page source starts with `<!DOCTYPE html>` and includes `lang="en"`, charset and viewport meta tags, and `<title>AgentClinic</title>`.
- [ ] Editing the headline or tagline while `npm run dev` is running reloads the server and the new text is served.
- [ ] `PORT=4000 npm run dev` serves on port 4000.
- [ ] `npm run build && npm start` serves the same page from compiled output.
- [ ] `http://localhost:3000/styles.css` returns `200` with `content-type: text/css`, and the page `<head>` links to it.
- [ ] An unknown path (e.g. `/nope`) returns Hono's default 404 (custom error pages are Phase 7).

## Merge criteria

- [ ] Only in-scope changes: Hono setup, `/` route and home page, layout components (one file each), `public/styles.css`, tsconfig/package changes, Vitest tests (`src/app.test.ts`), README getting-started notes, and this spec directory.
- [ ] `node_modules/` and `dist/` are not committed.
- [ ] All checkboxes above are checked.
