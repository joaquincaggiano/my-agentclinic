# Validation — Phase 1: Hello Hono

The implementation is successful and mergeable when every item below passes.

## Automated

- [ ] `npm install` completes cleanly on a fresh clone.
- [ ] `npm run typecheck` exits 0 with `strict` enabled (including `.tsx` files) and no `any` escapes in `src/`.
- [ ] `npm test` passes: `GET /` returns status 200, a `text/html` content type, and a body whose `<h1>` is exactly `AgentClinic is open for business`.
- [ ] `npm run build` produces `dist/index.js` and `dist/app.js` with no errors.

## Manual

- [ ] `npm run dev` starts the server and logs the listening URL (default `http://localhost:3000`).
- [ ] `curl -i http://localhost:3000/` returns `200`, `content-type: text/html`, and HTML containing the `<h1>`.
- [ ] Opening `http://localhost:3000/` in a browser shows the home page: headline `AgentClinic is open for business` and the tagline, readable and unbroken (no layout, nav, or external CSS expected).
- [ ] Page source starts with `<!DOCTYPE html>` and includes `lang="en"`, charset and viewport meta tags, and `<title>AgentClinic</title>`.
- [ ] Editing the headline or tagline while `npm run dev` is running reloads the server and the new text is served.
- [ ] `PORT=4000 npm run dev` serves on port 4000.
- [ ] `npm run build && npm start` serves the same page from compiled output.
- [ ] An unknown path (e.g. `/nope`) returns Hono's default 404 (custom error pages are Phase 10).

## Merge criteria

- [ ] Only in-scope changes: Hono setup, `/` route and minimal home page, tsconfig/package changes, one smoke test, README getting-started notes, and this spec directory.
- [ ] No shared layout component or stylesheet file introduced (deferred to Phase 2).
- [ ] `node_modules/` and `dist/` are not committed.
- [ ] All checkboxes above are checked.
