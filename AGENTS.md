# AGENTS.md

## Cursor Cloud specific instructions

This is a Vite + React + TypeScript single-page frontend application (no backend, no database).

### Commands

| Task | Command |
|------|---------|
| Install deps | `npm install` |
| Dev server | `npm run dev` (serves at http://localhost:5173) |
| Lint | `npm run lint` |
| Build | `npm run build` (runs `tsc -b && vite build`) |
| Preview prod build | `npm run preview` |

### Notes

- Package manager is **npm** (lockfile: `package-lock.json`).
- No test framework is configured; there are no automated tests to run.
- No environment variables or `.env` files are needed.
- The dev server supports HMR via `@vitejs/plugin-react`.
- To expose the dev server on all interfaces (useful in cloud VMs), run: `npm run dev -- --host 0.0.0.0`.
