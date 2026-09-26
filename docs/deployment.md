# Deployment

## 🚀 One-click install (recommended)

```bash
curl -fsSL https://raw.githubusercontent.com/huihongsoft/MortarCMS/main/install.sh | bash
```

The script handles: OS/architecture detection (Linux/macOS) with the correct
package-manager hints (apt/dnf/yum/zypper/pacman/apk/brew), Node.js ≥ 20
checks, dependency installation (with npm-cache fallback), building admin /
frontend / ESM / theme bundles / server, registering a **systemd** service
(Linux) or **launchd** agent (macOS) with auto-restart, and a health check.
`git` is optional — without it the source is downloaded as a tarball.

Options:

```bash
bash install.sh --port 8080 --dir /opt/mortar --no-service
# SQLite is the supported production database. MySQL/PostgreSQL are
# experimental — see below before setting DATABASE_URL.
```

Service management:

```bash
./mortarctl.sh {start|stop|restart|status|logs}   # or: systemctl ... mortar
```

## ⬆️ Upgrading an existing install

Re-run the installer in **upgrade mode** from the source directory — it
updates dependencies, rebuilds, and restarts the existing service without
creating a conflicting one:

```bash
cd /path/to/mortar
curl -fsSL https://raw.githubusercontent.com/huihongsoft/MortarCMS/main/install.sh | bash -s -- --upgrade
```

If the site is not managed by systemd (e.g. a panel that runs `npm run dev`),
the upgrade prints the exact restart command instead of restarting for you.

## 🐳 Docker

The repo ships a multi-stage `Dockerfile` and `docker-compose.yml`.

**Quick start (SQLite, zero config):**

```bash
docker compose up -d --build
open http://localhost:3001/install
```

- The image is built with **Node 22 slim** (glibc); `better-sqlite3` and
  `sharp` use prebuilt binaries.
- Persistence: SQLite database → `mortar-data` volume
  (`/app/server/data`), uploads → `mortar-uploads` (`/app/server/uploads`).
- **Set `JWT_SECRET`** before going live — the server refuses to start in
  production without it:

  ```bash
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  # put the output into docker-compose.yml → environment → JWT_SECRET
  ```

**With MySQL or PostgreSQL (experimental).** These drivers are **not
recommended for production**: they run over a single-connection worker thread
that can block the request loop, and are far less tested than SQLite. For local
evaluation, uncomment the matching service in `docker-compose.yml` and set
`DATABASE_URL` accordingly (e.g. `mysql://mortar:secret@mysql:3306/mortar`).

**Single-instance only.** SQLite, on-disk uploads and the in-process
cache/scheduler assume one process. Do not run multiple replicas against one
SQLite file or behind a load balancer without shared storage — scheduled tasks
would run on every replica and uploads/caches would diverge.

**Behind a reverse proxy:** set `TRUST_PROXY: "1"` and terminate TLS at the
proxy, forwarding `X-Forwarded-Proto` (see the Nginx example below).

**Manual build:**

```bash
docker build -t mortar .
docker run -d -p 3001:3001 \
  -e JWT_SECRET=<long-random-string> \
  -v mortar-data:/app/server/data \
  -v mortar-uploads:/app/server/uploads \
  mortar
```

## Production build

`./build.sh` builds everything (admin, frontend, shared ESM bundles, themes)
and restarts the server — suitable for development machines. For production
use `install.sh` (also installs a system service), or build manually:

```bash
# 1. Admin
cd admin && npx vite build && cd ..

# 2. Frontend (app bundle + shared ESM + theme bundles)
cd frontend
npx vite build
npx esbuild esm/react.js --bundle --format=esm --minify --define:process.env.NODE_ENV=\"production\" --outfile=public/esm-react.js
npx esbuild esm/router.js --bundle --format=esm --external:react --external:react-dom --outfile=public/esm-router.js
for t in default magazine aurora twentytwentyfour twentytwentyone twentynineteen twentyseventeen softstore; do THEME_NAME=$t npx vite build --config vite.themes.config.ts >/dev/null 2>&1; done
for t in default magazine aurora twentytwentyfour twentytwentyone twentynineteen twentyseventeen softstore; do cp dist/themes/$t.js ../server/themes/$t/theme.js; done
npx vite build >/dev/null 2>&1   # final dist incl. ESM bundles
cd ..

# 3. Server
cd server && npm run build && cd ..
```

> Note: the theme bundles step is required — `server/themes/*/theme.js` drives
> the frontend theme system; without them themes silently fall back to default.

## Environment

Create `server/.env` (see `server/.env.example`). The server **loads this file
automatically at startup** (from `server/.env`, relative to the install dir),
so after editing it just restart the service — real environment variables take
precedence over the file. `install.sh` also creates it with a generated
`JWT_SECRET` if one is missing.

```bash
# Database: SQLite at server/data/mortar.db (supported production default;
# MORTAR_DB_PATH overrides the location). MySQL/PostgreSQL are experimental —
# not recommended for production.
# DATABASE_URL=mysql://user:password@localhost:3306/mortar
# DATABASE_URL=postgres://user:password@localhost:5432/mortar

# JWT secret — HARD requirement in production.
# The server refuses to start without it (fail-fast), so every session can be
# verified across restarts and the key never falls back to a database row.
# Generate: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
JWT_SECRET=<long-random-string>

# Port (default 3001)
# PORT=3001

# NODE_ENV=production   # hides internal error details in API responses

# Trust X-Forwarded-For (set to 1 ONLY behind a reverse proxy like Nginx)
# TRUST_PROXY=1

# Extra cross-origin origins allowed to call the API (comma-separated);
# same-origin and site_url are always allowed
# CORS_ORIGINS=https://app.example.com

# Log verbosity: trace|debug|info|warn|error|fatal (default: info in
# production, debug otherwise). Logs are JSON in production, with a
# per-request id echoed as X-Request-Id.
# LOG_LEVEL=info

# Where backup archives and pre-migration snapshots are written
# (default: server/backups). Point it at another volume/disk when you can.
# MORTAR_BACKUPS_DIR=/mnt/backups/mortar
```

## Running the server

```bash
cd server && npm start          # compiled JS (production)
./start.sh                      # tsx (dev-friendly)
./run.sh                        # auto-restart loop
```

## Reverse proxy (Nginx example)

**HTTP only (development / LAN):**

```nginx
server {
    listen 80;
    server_name example.com;

    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # Uploads can be cached aggressively
    location /uploads/ {
        proxy_pass http://127.0.0.1:3001;
        expires 1d;
    }
}
```

**HTTPS (production) — terminate TLS at the proxy.** Obtain certificates with
`certbot` (Let's Encrypt) or your hosting panel, then redirect 80 → 443 and
forward the original scheme:

```nginx
# HTTP → HTTPS redirect
server {
    listen 80;
    server_name example.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name example.com;

    ssl_certificate     /etc/letsencrypt/live/example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/example.com/privkey.pem;

    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-Proto $scheme;   # required: lets the app know it is https
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    location /uploads/ {
        proxy_pass http://127.0.0.1:3001;
        expires 1d;
    }
}
```

So that the app itself knows it is behind HTTPS:

1. Set `TRUST_PROXY=1` in `server/.env` (only when it really is behind a proxy)
   and `NODE_ENV=production` — the app then reads `X-Forwarded-Proto`, sets HSTS,
   and the admin **Security** page shows the HTTPS check as passing.
2. Set the site URL to `https://example.com` (Settings → General) so canonical
   links, feeds and emails use HTTPS.
3. Restart the service (`./mortarctl.sh restart` or `systemctl restart mortar`).

Use `certbot` (Let's Encrypt) for TLS, or the 1Panel-style panel of your
choice.

## Multiple domains / multi-site

One Mortar process serves many domains from a single database. Each domain maps
to a `Site` row (Admin → Sites) and gets its own title, description, menus and
content. A common layout: `example.com` for the main site, `blog.example.com`
and `shop.example.com` for sections, all pointing at the same server.

`./install.sh --domain example.com,blog.example.com` generates a ready-to-use
`mortar-nginx.conf` with the configuration below; copy it to
`/etc/nginx/conf.d/` and reload. The rest of this section explains what it does
and why.

### How a request picks its site

The app resolves the site from the request's `Host` header: the port is
stripped, the value is lowercased, and it is compared for **exact** equality
against `Site.domain`. If nothing matches, the request is served by the
**primary** site — silently, with no error. Browser requests and CDN/proxy
front-ends must therefore forward the original `Host`, and every domain must be
registered in Admin → Sites.

### DNS

Add an A (or AAAA) record for every domain and subdomain pointing at the server.
A wildcard `*.example.com` record only helps if your DNS provider supports it —
and note that it does **not** cover the bare `example.com`.

### One vhost for all domains

Per-site routing is done by the app, not by nginx, so all domains share a single
`proxy_pass`:

```nginx
server {
    listen 80;
    server_name example.com blog.example.com shop.example.com;
    location /.well-known/acme-challenge/ { root /var/www/html; }
    location / { return 301 https://$host$request_uri; }
}

server {
    listen 443 ssl http2;
    server_name example.com blog.example.com shop.example.com;

    ssl_certificate     /etc/letsencrypt/live/example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/example.com/privkey.pem;

    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_set_header Host $host;                  # mandatory — see below
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

**`proxy_set_header Host $host` is mandatory.** Without it nginx sends
`Host: 127.0.0.1:3001` to the app, no site matches, and *every* domain silently
serves the primary site. `$host` is already lowercased and port-stripped, which
is exactly what the resolver expects.

### TLS

Issue a certificate covering every name:

```bash
certbot certonly --nginx -d example.com -d blog.example.com -d shop.example.com
```

A wildcard `*.example.com` requires the DNS-01 challenge and does **not** cover
the apex `example.com` — request `-d example.com -d '*.example.com'` if you want
both.

### www → bare domain

`www.example.com` and `example.com` are different hostnames and do not match
each other, so a request to the other one falls back to the primary site.
Rather than creating a second site, redirect. `listen 443 ssl` needs a
certificate in the same block, so add `-d www.example.com` to the certbot
command above and reuse the certificate:

```nginx
server {
    listen 443 ssl http2;
    server_name www.example.com;

    ssl_certificate     /etc/letsencrypt/live/example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/example.com/privkey.pem;

    return 301 https://example.com$request_uri;
}
```

Register only the canonical host in Admin → Sites. (The generated
`mortar-nginx.conf` does not include this block; add it by hand if you want it.)

### Registering the domains

In Admin → Sites, the **domain** field takes a bare hostname — no scheme, no
port, no path (the API strips a pasted scheme and lowercases it, but a port or
path will never match). The primary site is the fallback for anything
unregistered. Per-site title and description overrides live in the same row.

Set the canonical public URL in **Settings → General → Site URL** (the install
wizard now fills this in from the address you installed through) so canonical
tags, feeds and emails use the right scheme and host.

### Verifying

Check the app layer first, bypassing nginx, then the full path:

```bash
# App layer: fake the Host header straight at the app port
curl -s -H "Host: blog.example.com" http://127.0.0.1:3001/api/sites/current

# Full path
curl -s https://blog.example.com/api/sites/current
```

The response contains the resolved site's `id`/`name`/`domain`.

- Direct-to-app returns `blog`, through the domain returns the primary site →
  nginx is not forwarding `Host`.
- Both return the primary site → the domain is not registered (or the site is
  inactive).

### Pitfalls

- **`TRUST_PROXY=1`** is required in `server/.env` whenever a proxy is in front
  (`--domain` sets it). Otherwise rate limiting and visit tracking see the
  proxy's IP instead of the visitor's.
- A domain stored with a **port or path** never matches — the resolver compares
  the port-stripped `Host` exactly.
- **Unregistered hosts fail open**: they serve the primary site rather than
  404. If a domain shows the wrong content, check registration before anything
  else.
- `/api/sitemap.xml` and `/api/feed/rss` build their links from the **global**
  Site URL setting, not the per-site override, so on secondary domains they
  point at the primary domain. Canonical tags, `og:url` and JSON-LD do honour
  the per-site value.

## Deploying with 宝塔面板 (BT Panel / aaPanel)

1. **Software store**: install *Node.js version manager* (Node 20+) and the
   *Node project* plugin (or use a plain site + reverse proxy).
2. **Upload code** to `/www/wwwroot/mortar`:
   ```bash
   cd /www/wwwroot
   git clone -b v0.1.2 https://github.com/huihongsoft/MortarCMS.git mortar
   ```
3. **Install deps & build** (see *Production build* above): run the three
   build stages from the repo root.
4. **Environment**: create `server/.env` with `JWT_SECRET`, `PORT=3001`,
   `NODE_ENV=production` (see *Environment* above).
5. **Node project**: add a project with
   - Path: `/www/wwwroot/mortar/server`
   - Start command: `node dist/index.js`
   - Run as: `www` · Port: `3001`
   Then click **映射 (map)** to bind your domain (auto reverse proxy).
   Alternatively create a static site and add a reverse proxy
   `location / { proxy_pass http://127.0.0.1:3001; ... }`.
6. **Permissions**:
   ```bash
   chown -R www:www /www/wwwroot/mortar/server/data /www/wwwroot/mortar/server/uploads /www/wwwroot/mortar/server/backups
   ```
7. Open `https://your-domain/install` and complete the wizard.

Troubleshooting: if the install page whitescreens with
`Failed to load module script ... MIME type of "text/html"`, the static
bundles are being redirected — verify the reverse proxy reaches the Node
service (`curl -sI http://127.0.0.1:3001/assets/...` should return 200, not
a 302 to /install).

## Backups

- **Scheduled**: the `backup_database` task (daily, Admin → System Info → Tasks)
  writes `server/backups/mortar-<timestamp>.tar.gz` holding the database **and**
  the uploads directory. `backup_retention` (default 10) keeps the newest N
  archives; the pruning order comes from file age, not the filename.
- **Full backup on demand**: Admin → System Info → Download full backup
  (database + uploads as a zip).
- **Restore**: Admin → System Info → Restore backup. Both a zip (the download
  above) and a tar.gz (the scheduled archive) are accepted; the type is detected
  from the file's magic bytes, not its name. The live database is copied to
  `mortar.db.bak-<timestamp>` before being replaced, and the server exits so the
  supervisor restarts it against the restored file.
- **Before every upgrade**: when the server boots with pending migrations it
  writes `server/backups/pre-migration-v<versions>-<timestamp>.db` first (newest
  5 kept). Migrations are forward-only, so this is the only way back — see
  [upgrade-rollback.md](upgrade-rollback.md).
- **Verify a backup before you need it**: unpack the archive somewhere and check
  that `mortar.db` starts with `SQLite format 3` and that your uploads are in
  there. A backup nobody has ever restored is a guess.
- **Off-host copies**: mirror `server/backups/` (or point the task at S3 in
  Admin → Settings → Storage, which mirrors each archive automatically). A backup
  on the same disk as the database only protects against operator error.
- **Docker**: `/app/server/backups` is a volume, so archives survive a container
  rebuild — but an anonymous volume is not a backup strategy. Bind-mount it or
  mirror it off the host.
- Restoring does **not** cover a database switch or a different schema version:
  restore into the same version that wrote the archive.

## Switching databases

- **At install**: the wizard writes the choice to `server/.env`
- **At runtime**: Admin → System Info → Switch database
- The old database file is never modified — switch back any time

## Maintenance

- `maintenance_mode` setting shows a maintenance page to visitors;
  authenticated admins bypass it
- Database maintenance (status, integrity check, slow queries, optimize) lives in
  Admin → System Info, backed by `/api/db/*` — there are no npm scripts for it
- Scheduled posts publish automatically every minute (built-in cron)

## Performance notes

- Assets are served with immutable caching (hash-named bundles)
- Responsive images: `/api/media/:id/img?w=&fmt=` with disk cache; uploads
  generate thumbnails + webp srcset automatically
- For heavy traffic, put Nginx in front, enable gzip/brotli, and consider a
  CDN for `/uploads/` (set `cdn_url` in Settings)
