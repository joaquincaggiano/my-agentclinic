import { fileURLToPath } from 'node:url'

/** Repository root (parent of `src/` and `dist/`), independent of the working directory. */
export const projectRoot = fileURLToPath(new URL('..', import.meta.url))
