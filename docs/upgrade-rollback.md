# Upgrading and rolling back

The short version: **take a backup before you upgrade, and know where the
automatic one is.** Schema migrations are forward-only — there is no `down()` —
so the pre-migration snapshot is the only way back.

## Before you upgrade

1. **Note the version you are on.** Admin → System Info shows it, `GET
   /api/health` returns it, and it equals the four `package.json` versions (tags
   are `v<version>`).
2. **Take a backup and verify it.** Admin → System Info → *Download full
   backup* gives a zip with `mortar.db` plus your uploads. Unpack it once and
   check that `mortar.db` starts with `SQLite format 3` — before you need it,
   not after.
3. **Read `CHANGELOG.md`** for the range you are crossing, including the
   *Known gaps* section.
4. **Keep the previous release on disk.** Rolling back code is easy; rolling back
   a schema is not.

## Upgrading

- **Installer**: `install.sh --upgrade` updates dependencies, rebuilds and
  restarts the service.
- **Docker**: pull the new tag and recreate the container; `/app/server/backups`
  and `/app/server/uploads` are volumes, so they survive.
- **Manual**: build (`npm run build`) and restart the process.

Whichever path you take, the server itself handles the schema: on boot it looks
at the `_SchemaMigration` ledger, takes a **pre-migration snapshot**, then applies
the pending migrations in one transaction each.

## What the server does for you

- `server/backups/pre-migration-v<versions>-<timestamp>.db` — a copy of the
  database taken *before* the first migration of that boot. The newest 5 are
  kept, so a series of upgrades does not fill the disk.
- On SQLite a failed migration **aborts startup** rather than leaving a
  half-migrated schema (the app refuses to serve on a schema it cannot trust).
  The experimental MySQL/PostgreSQL drivers log and continue — another reason
  they are not the recommended production path.
- `mortar.db.bak-<timestamp>` next to the database is written when you restore a
  backup, so a mistaken restore is itself recoverable.

## Rolling back

**Code only (no migrations ran).** Check out the previous tag and rebuild. The
schema is unchanged, so nothing else is needed.

**A migration ran and something is wrong.** The pre-migration snapshot is the way
back:

1. Stop the service. Do **not** keep serving while you swap the database file.
2. Find the snapshot: it is named after the versions it preceded, e.g.
   `pre-migration-v18-2026-09-26T10-14-33.db` was taken just before migration 18.
   Pick the one from *before* the upgrade you are reverting (the oldest one that
   is still newer than your last known-good boot, if you crossed several).
3. Copy the live database aside first, then replace it:
   `cp server/data/mortar.db server/data/mortar.db.broken-<timestamp>` then
   `cp server/backups/pre-migration-v18-….db server/data/mortar.db`.
4. Delete the stale `mortar.db-wal` and `mortar.db-shm` sidecars — leaving them
   next to a replaced file is how a database gets corrupted.
5. Check out the previous code version and start the service. Confirm with
   `GET /api/health` that the version matches the code you checked out.

**No snapshot, no backup.** Then you are down to the last scheduled archive
(`server/backups/mortar-*.tar.gz`), which may be up to a day old — restoring it
loses everything written since. This is the case the first section exists to
avoid.

## Verifying an upgrade

- `GET /api/health` → `{"status":"ok","version":"<expected>"}`.
- Admin → System Info → Database: integrity check passes, no slow queries piling
  up.
- Admin → Security → run the audit.
- Open the site: home, a post, an archive page, search, a comment submit, the
  media library, and one admin save (create then delete a draft).

## Tag and version rules

- `package.json` (root, `server/`, `admin/`, `frontend/`) is the source of truth;
  the server reads `server/package.json` for `APP_VERSION`.
- The CI job `version-consistency` fails if the four disagree, or if a pushed tag
  does not equal the manifests' version.
- Tags are always `v<version>` (the early `0.1.0` / `0.1.1` tags predate the
  rule). A release tag builds the container image; it is pushed only when the
  `REGISTRY*` repository secrets are configured.
