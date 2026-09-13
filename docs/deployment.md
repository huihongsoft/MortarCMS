# Deployment

## 🚀 One-click install (recommended)

```bash
curl -fsSL https://raw.githubusercontent.com/huihongsoft/MortarCMS/main/install.sh | bash
```

The script handles: OS/architecture detection (Linux/macOS), Node.js ≥ 22
checks, dependency installation (with npm-cache fallback), building admin /
frontend / ESM / theme bundles / server, registering a **systemd** service
(Linux) or **launchd** agent (macOS) with auto-restart, and a health check.

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

## Deploying with 宝塔面板 (BT Panel / aaPanel)

1. **Software store**: install *Node.js version manager* (Node 18+) and the
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

- **Full backup**: Admin → System Info → Download full backup
  (database + uploads, single zip)
- **Restore**: same page → Restore backup
- Old databases are preserved automatically (`mortar.db.bak-<timestamp>`)
- Schedule a cron job that hits the backup endpoint with an admin token if
  you want automated off-host copies

## Switching databases

- **At install**: the wizard writes the choice to `server/.env`
- **At runtime**: Admin → System Info → Switch database
- The old database file is never modified — switch back any time

## Maintenance

- `maintenance_mode` setting shows a maintenance page to visitors;
  authenticated admins bypass it
- `npm run db:optimize`-style maintenance available in Admin → System Info
- Scheduled posts publish automatically every minute (built-in cron)

## Performance notes

- Assets are served with immutable caching (hash-named bundles)
- Responsive images: `/api/media/:id/img?w=&fmt=` with disk cache; uploads
  generate thumbnails + webp srcset automatically
- For heavy traffic, put Nginx in front, enable gzip/brotli, and consider a
  CDN for `/uploads/` (set `cdn_url` in Settings)
