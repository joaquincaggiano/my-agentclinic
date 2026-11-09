---
name: changelog
description: Create or update CHANGELOG.md in the project root from git commits, grouped under date headings. Run manually before merging a branch.
disable-model-invocation: true
allowed-tools: Bash(git log:*) Bash(git branch:*) Bash(git status:*) Bash(git diff:*) Bash(git rev-parse:*) Read Edit Write
---

# Changelog

Maintain `CHANGELOG.md` in the project root. Entries are bullets grouped under date headings, newest date first. This skill is run by hand before merging; never run it unprompted.

## Format

```markdown
# Changelog

## 2026-11-09

- Adopt Vitest as the validation mechanism and add component and route test suites
- Make the stylesheet mobile-first and responsive

## 2026-11-08

- Add the main layout with header, main and footer components
```

- Heading is `## YYYY-MM-DD` (ISO date, no brackets, no version numbers).
- Use each commit's author date in the committer's local time (`git log --date=format:%Y-%m-%d`).
- One bullet per meaningful change, not per commit: merge related commits into a single bullet.
- Write bullets for a reader of the project, in the imperative, one line, no commit hashes, no trailing period.
- Skip merge commits, commits that only touch `CHANGELOG.md`, and noise such as typo or formatting fixups.

## Steps

1. Run `git branch --show-current` and `git status --short`. If the working tree is dirty, tell the user which files are uncommitted. They are not in the changelog until committed.
2. Read `CHANGELOG.md` if it exists.
3. Choose the commits to cover:
   - **No changelog yet:** the full history, `git log --no-merges --reverse --date=format:%Y-%m-%d --format='%ad%x09%h%x09%s%n%b'`. Examine commit bodies as well as subjects.
   - **Changelog exists, on a feature branch:** the commits about to be merged, `git log <default-branch>..HEAD` (detect the default branch with `git rev-parse --abbrev-ref origin/HEAD`, falling back to `main`).
   - **Changelog exists, on the default branch:** commits dated on or after the newest heading's date.
   - In every case, drop any commit whose change is already described by an existing bullet. When unsure, read the commit's diff stat (`git log -1 --stat <hash>`) before deciding.
4. Group the commits by date and write the bullets.
   - New date: add a new `## YYYY-MM-DD` section in the right place so the newest date stays on top.
   - Date already present: append new bullets to that section; do not duplicate the heading or reword existing bullets.
5. Create the file with a `# Changelog` title if it does not exist; otherwise edit it in place with minimal changes.
6. Show the user the added bullets (or a short diff) and stop. Do not commit, push or merge. Offer to commit the file if they want.

## Rules

- Only describe what the commits show. Do not invent features, and do not copy raw commit subjects like "WIP" or "fix".
- Do not rewrite or reorder history the user has already approved in the file.
- If there is nothing new to add, say so and leave the file untouched.
