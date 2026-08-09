# Deployment

## 🚀 One-click install (recommended)

```bash
curl -fsSL https://raw.githubusercontent.com/huihongsoft/mortar/main/install.sh | bash
```

The script handles: OS/architecture detection (Linux/macOS), Node.js ≥ 18
checks, dependency installation (with npm-cache fallback), building admin /
frontend / ESM / theme bundles / server, registering a **systemd** service
(Linux) or **launchd** agent (macOS) with auto-restart, and a health check.

Options:

```bash
bash install.sh --port 8080 --dir /opt/mortar --no-service
export DATABASE_URL=mysql://user:pass@host:3306/mortar   # instead of SQLite
```

Service management:

```bash
./mortarctl.sh {start|stop|restart|status|logs}   # or: systemctl ... mortar
```

## Production build

```bash
./build.sh
# Builds admin + frontend, restarts the server on :3001
```

Or manually:

```bash
cd admin && npx vite build
cd ../frontend && npx vite build
cd ../server && npm run build && npm start
```

## Environment

Create `server/.env` (see `server/.env.example`):

```bash
# Database (default: SQLite at server/data/mortar.db)
# DATABASE_URL=mysql://user:password@localhost:3306/mortar
# DATABASE_URL=postgres://user:password@localhost:5432/mortar

# JWT secret — REQUIRED in production (random per-boot otherwise)
JWT_SECRET=<long-random-string>

# Port (default 3001)
# PORT=3001

# NODE_ENV=production   # hides internal error details in API responses
```

## Running the server

```bash
cd server && npm start          # compiled JS
./start.sh                      # tsx (dev-friendly)
./run.sh                        # auto-restart loop
```

## Reverse proxy (Nginx example)

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

Use `certbot` (Let's Encrypt) for TLS, or the 1Panel-style panel of your
choice.

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
