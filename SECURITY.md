# Security Policy

## Supported Versions

Security fixes are applied to the latest release. We recommend always running
the most recent version.

## Reporting a Vulnerability

Please **do not** open a public issue for security vulnerabilities. Instead,
report privately so we can fix the issue before it is disclosed.

**How to report:**

- Open a **private security advisory** on the GitHub repository
  (`Security` tab → `Report a vulnerability`), or
- Email the maintainers (address listed in the repository profile).

Please include:

1. Affected version(s)
2. A description of the vulnerability
3. Steps to reproduce (or a proof of concept)
4. Impact assessment

We aim to respond within **5 business days** and will coordinate a disclosure
timeline with you.

## Security Best Practices for Deployments

- Set a strong `JWT_SECRET` in `server/.env` — without it, sessions are
  invalidated on every restart.
- Enable 2FA (TOTP) for all admin accounts (`/admin` → Users).
- Terminate TLS at your reverse proxy and forward `X-Forwarded-Proto`.
- Run behind a reverse proxy that sets security headers (the app sets
  `X-Frame-Options`, `nosniff`, `Referrer-Policy` and `Permissions-Policy`
  itself as a baseline).
- Keep `server/.env` out of version control and restrict file permissions
  (`chmod 600`).
- Take regular backups (Admin → System Info → Backup) and store them off-host.
- Use the built-in **Security Audit** page (`/admin/security`) to review your
  installation.

## Security Features Built In

| Area | Protection |
|------|-----------|
| Authentication | JWT (HS256, explicit algorithms), server-side logout (token blacklist) |
| Login | 2FA challenge (TOTP), account lockout (5 fails / 15 min), rate limiting |
| Passwords | bcrypt (cost 12), strength policy (8+ chars, letters & numbers) |
| Uploads | Extension + MIME allowlist, image content verification (sharp) |
| Output | DOMPurify on user content, CDN URL validation, link protocol checks |
| Headers | X-Frame-Options DENY, nosniff, Referrer-Policy, Permissions-Policy |
| Installer | Anonymous reset blocked — admin-only (see `/api/install/reset`) |
| Privacy | GDPR data export & erase |
