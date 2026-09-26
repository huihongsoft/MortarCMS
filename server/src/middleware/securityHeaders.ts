import { Request, Response, NextFunction } from 'express';

// Response security headers, kept out of index.ts so they can be exercised
// without booting the whole server (index.ts starts listening on import).

/**
 * Content-Security-Policy for the app's own documents and API responses.
 *
 * What each allowance is for:
 *   script-src 'self'          — the admin and frontend ship bundled scripts only
 *   style-src  'unsafe-inline' — Tailwind's runtime styles and the block editor,
 *                                which writes inline style blocks into its canvas
 *   img/font/media https:      — a CMS legitimately embeds remote images and fonts
 *   frame-src  'self' blob:    — the visual editor renders its canvas in an iframe
 *   frame-ancestors 'none'     — same intent as X-Frame-Options: DENY
 */
export const CSP_POLICY = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data: https:",
  "media-src 'self' https:",
  "connect-src 'self'",
  "frame-src 'self' blob:",
  "frame-ancestors 'none'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join('; ');

/**
 * Header name for the policy: report-only unless `CSP_ENFORCE=1`.
 *
 * A plugin's admin screen is injected as HTML and its inline <script> tags are
 * re-created after injection (admin/src/pages/PluginPage.tsx), so an enforcing
 * `script-src 'self'` would break those screens — and a wrong policy
 * white-screens the admin with nothing on the server side to debug. Report-only
 * surfaces every violation in the operator's DevTools console while everything
 * keeps working; the operator flips the switch once a session has been watched.
 */
export function cspHeaderName(env: NodeJS.ProcessEnv = process.env): string {
  return env.CSP_ENFORCE === '1' ? 'Content-Security-Policy' : 'Content-Security-Policy-Report-Only';
}

/** Apply the standard header set to every response. */
export function securityHeaders() {
  return (_req: Request, res: Response, next: NextFunction): void => {
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    res.setHeader(cspHeaderName(), CSP_POLICY);
    // HSTS on HTTPS deployments (browsers ignore it over plain HTTP)
    if (process.env.NODE_ENV === 'production') {
      res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    }
    next();
  };
}
