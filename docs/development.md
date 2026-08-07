# Development Guide

## Local setup

```bash
npm install                     # root tooling (concurrently)
cd server && npm install
cd ../admin && npm install
cd ../frontend && npm install
```

## Running in dev mode

```bash
npm run dev
```

| Service | URL | Port |
|---------|-----|------|
| Server (Express API) | http://localhost:3001 | 3001 |
| Frontend (Vite) | http://localhost:3000 | 3000 |
| Admin (Vite) | http://localhost:3002 | 3002 |

The Vite dev servers proxy `/api` and `/uploads` to `:3001`.

## Codebase conventions

- **React without JSX** — components use `React.createElement(...)` everywhere.
  Match the existing style; do not introduce JSX.
- **TypeScript strict** on the server (`strict: true`).
- **i18n** — every user-facing string goes through `t('key', getLang())`
  (admin) or `t('key', settings)` (frontend). Add the key to
  `admin/src/lib/i18n.ts` / `frontend/src/lib/i18n.ts` with a Chinese value.
- **Database access** — always parameterized:
  `db.prepare('SELECT ... WHERE id = ?').get(id)`. Never string-concatenate
  user input into SQL.
- **Hooks** — extend the system through `addAction`/`addFilter` rather than
  editing route internals when possible.

## Adding a route

1. Create `server/src/routes/<name>.ts` exporting a `Router`
2. Mount it in `server/src/index.ts` (`app.use('/api/<name>', router)`)
3. Protect it: `authenticate` + `authorize`/`requireCap` unless intentionally public
4. Add tests manually against SQLite (and ideally MySQL/PG if available)

## Adding an admin page

1. Create `admin/src/pages/<Name>.tsx`
2. Register a lazy import + route in `admin/src/App.tsx`
3. Add the sidebar entry (and group) in `admin/src/components/Sidebar.tsx`
4. Localize all strings

## Adding a frontend page

1. Create `frontend/src/pages/<Name>.tsx`
2. Register the route in `frontend/src/App.tsx`
3. Use `useSEO` for title/meta/JSON-LD
4. Localize strings with `t('key', settings)`

## Verifying changes

```bash
# Type checks
cd server && npx tsc --noEmit
cd admin && npx tsc -b --noEmit
cd frontend && npx tsc -b --noEmit

# Production builds
cd admin && npx vite build
cd frontend && npx vite build

# Server smoke test
curl http://localhost:3001/api/health
```

## Database tooling

```bash
npm run db:migrate    # prisma migrate dev (schema reference)
npm run db:studio     # Prisma Studio in the browser
npm run db:seed       # seed data
```

The runtime data layer is `better-sqlite3`/`mysql2`/`pg` via
`server/src/utils/db.ts`; Prisma is kept as the schema reference.

## Testing databases

With a local MySQL or PostgreSQL:

```bash
# MySQL
DATABASE_URL=mysql://root:secret@localhost:3306/mortar_dev npm run dev:server

# PostgreSQL
DATABASE_URL=postgres://postgres:secret@localhost:5432/mortar_dev npm run dev:server
```

The server auto-creates the database for MySQL and applies the full schema
on boot. See `docs/architecture.md` for the driver bridge details.
