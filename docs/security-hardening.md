# Security hardening checklist

What the application already does is listed at the end, so you can tell what you
still have to do at the infrastructure layer. Run through this before putting a
site on the public internet.

## Must do

1. **`JWT_SECRET` set, long, random, and secret.** Production refuses to start
   without it. 32 random bytes: `node -e
   "console.log(require('crypto').randomBytes(32).toString('hex'))"`. Rotating it
   invalidates every session (and re-encrypts nothing — AI provider keys and
   other encrypted settings are derived from it, so **rotating the secret makes
   existing encrypted values unreadable**; re-enter those after a rotation).
2. **`NODE_ENV=production`.** Without it, error payloads keep internal detail
   (SQL fragments, paths) and HSTS is not sent.
3. **HTTPS only, terminated at a reverse proxy.** Set `TRUST_PROXY=1` **only**
   when a proxy you control sets `X-Forwarded-For`; otherwise clients can spoof
   their IP and bypass the per-IP limits and the login lockout.
4. **Restrict `CORS_ORIGINS`.** Same-origin and `site_url` are always allowed;
   add only the extra origins you actually need.
5. **Back up off-host, and test a restore.** See
   [deployment.md → Backups](deployment.md#backups) and
   [upgrade-rollback.md](upgrade-rollback.md).
6. **Protect `server/.env`, `server/data/` and `server/backups/`.** Database
   backups contain password hashes, session secrets and encrypted values — treat
   them as secrets, not as ordinary files.
7. **Turn off directory listing and disable PHP/script execution** for
   `/uploads` in the proxy. Uploads are served with a restrictive
   `Content-Security-Policy` and `X-Content-Type-Options: nosniff` by the app, but
   a proxy that executes anything it finds in a writable directory is a much
   bigger hole.
8. **Enable 2FA on every admin account** (Admin → My Profile), and keep the
   number of `admin` / `manage_system` holders small.
9. **Review the roles.** `manage_system` covers the database tools, the
   installer, webhooks, mailer, GDPR erase and newsletter sending — it is the
   superuser key. No built-in role except `admin` holds it; grant it
   deliberately, one account at a time.
10. **Keep the plugin list short and trusted.** Plugins run in-process with full
    database, filesystem and network access — there is no sandbox. Install only
    from sources you would run as a shell user on the same machine.

## Should do

- Put the site behind a CDN/WAF for volumetric protection; the app's own rate
  limiters are per-process (one instance = one budget) and reset on restart.
- Log to a collector rather than a local file: `LOG_LEVEL=info` produces JSON
  lines with a `X-Request-Id` you can correlate. Log lines never contain
  passwords, tokens or API keys, but they do contain request paths and IPs.
- Alert on `/api/security/audit` moving to a worse score. Failed logins fire a
  `login_failed` **hook** (a plugin or webhook can observe it) but do not reach
  the activity log by default — subscribe to that hook if you want an off-box
  signal, and see the known gaps below.
- Set `backup_retention` deliberately (default 10) and mirror the archives.
- Serve the admin from a separate hostname if that fits your setup (an extra
  origin in `CORS_ORIGINS`), so a compromised public page has no same-origin
  reach into `/admin`.
- Prefer a database user with rights limited to the Mortar schema, not `root`.

## What the application already handles

- **Uploads**: extension + MIME allowlist, magic-byte sniffing for non-images,
  full decode of images, SVG sanitising, randomized filenames, 10MB cap.
- **SSRF**: a dedicated guard that classifies every hop's IP (DNS resolution,
  private ranges, redirects) and fails closed. Used by webhooks, the broken-link
  scanner, plugin installs from a URL and the AI style analyser.
- **Sessions**: JWT with a session version (`tokenVersion`) that a logout-all,
  password change or role change bumps; a revoked-token table; app passwords with
  a `read`/`full` scope, expiry and revocation.
- **Passwords**: bcrypt cost 12, minimum length/character policy, timing-safe
  login (an unknown account takes the same time as a wrong password).
- **Rate limits**: global `/api` cap, tighter limits on auth routes, comment
  submission, protected-post unlocking and the destructive DB tools, plus a
  per-account+IP login lockout.
- **Headers**: `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`,
  `Referrer-Policy`, `Permissions-Policy`; HSTS in production; a restrictive CSP
  on the uploads and theme static trees.
- **Content-Security-Policy** on the app's own documents and API responses,
  shipped **report-only** (`Content-Security-Policy-Report-Only`) so violations
  appear in the browser console without a wrong policy taking the admin down.
  Watch a session — especially the block editor and any plugin screen — then set
  `CSP_ENFORCE=1` to enforce it. The policy is in
  `server/src/middleware/securityHeaders.ts` with a comment per directive
  (`script-src 'self'`, `style-src 'self' 'unsafe-inline'` for the editor's
  inline style blocks, `frame-src` for the visual editor canvas).
- **Secrets**: AI provider keys and similar settings are encrypted at rest
  (AES-256-GCM), redacted from API responses, and stripped from exports.
- **Destructive actions**: DB reset/restore require the superuser capability and
  are rate limited; the UI asks for a typed confirmation.
- **Audit**: authenticated mutations are recorded in the activity log (90-day
  retention), and Admin → Security runs a self-audit.

## Known gaps (as of 0.1.3)

- The app-wide CSP is report-only until you set `CSP_ENFORCE=1`; a plugin
  screen's inline scripts are the thing to check before flipping it.
- Rate limits and the login lockout are in-process, so they reset on restart and
  are not shared across instances.
- No CAPTCHA on public forms (comments and form submissions rely on a honeypot
  plus the optional AI review).
- Plugin and market packages are not signed.
