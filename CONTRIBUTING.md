# Contributing to Mortar

Thank you for your interest in contributing! This guide explains how to set up a development environment and submit changes.

## Development Setup

```bash
# 1. Clone & install
git clone <your-fork-url> mortar
cd mortar
cd server && npm install && cd ..
cd admin && npm install && cd ..
cd frontend && npm install && cd ..

# 2. Run all three services in watch mode
npm run dev
#   Server:   http://localhost:3001
#   Frontend: http://localhost:3000
#   Admin:    http://localhost:3002
```

The server proxies `/api` and `/uploads` to `localhost:3001` for both frontends in dev mode.

## Project Layout

```
server/      Express API, data layer, plugins, themes, market
admin/       Admin SPA (React + Vite + Tailwind)
frontend/    Public site SPA (React + Vite + Tailwind)
docs/        Documentation
```

## Before You Submit

1. **Type-check, lint & test** — every workspace must pass:

   ```bash
   # repo root
   npm run lint                        # ESLint (0 errors; warnings don't block)
   # server
   cd server && npx tsc --noEmit && npm test   # vitest unit tests
   # admin / frontend
   cd admin && npx tsc -b && npx vite build
   cd frontend && npx tsc -b && npx vite build
   ```

2. **Test against SQLite** (default) — all changes must keep the default path green. If you touch the data layer, also verify a MySQL/PostgreSQL connection if available (`DATABASE_URL=...`).

3. **Keep the UI bilingual** — new UI strings must go through `t('key', getLang())` / `t('key', settings)` and the key must exist in `admin/src/lib/i18n.ts` or `frontend/src/lib/i18n.ts`.

4. **Security by default** — new endpoints require authentication unless they are intentionally public (and then reviewed). Never log secrets or tokens.

## Commit Guidelines

- Write clear, focused commit messages describing **why** (not just what).
- Keep pull requests small and reviewable; one feature or fix per PR.
- Reference related issues in the description.

## Code Style

- TypeScript strict mode is enabled in the server.
- React components use `React.createElement` (no JSX) consistently across the codebase — please match the existing style.
- Follow existing naming: `camelCase` for functions/variables, `PascalCase` for components.

## Reporting Issues

Use the GitHub issue templates. Include:

- Mortar version and how you installed it
- Steps to reproduce
- Expected vs. actual behavior
- Server logs, if applicable

Thank you for helping make Mortar better! 🚀
