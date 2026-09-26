import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

// Response security headers, kept out of index.ts so they can be exercised
// without booting the whole server (index.ts starts listening on import).

/**
 * Content-Security-Policy for the app's own documents and API responses.
 *
 * What each allowance is for:
 *   script-src 'self' + nonce  — the app ships bundled scripts, plus the inline
 *                                ones it writes itself (the importmap, the
 *                                server-render payload, the header/footer code an
 *                                admin pastes into Settings) which carry a
 *                                per-response nonce
 *   style-src  'unsafe-inline' — Tailwind's runtime styles and the block editor,
 *                                which writes inline style blocks into its canvas
 *   img/font/media https:      — a CMS legitimately embeds remote images and fonts
 *   frame-src  'self' blob:    — the visual editor renders its canvas in an iframe
 *   frame-ancestors 'none'     — same intent as X-Frame-Options: DENY
 *
 * The nonce matters: without it an enforcing policy blocks the importmap, and a
 * blocked importmap means no module resolution at all — the frontend never boots.
 * (Report-only hid that: violations were logged while everything kept working.)
 */
export function cspPolicy(nonce?: string): string {
  return [
    "default-src 'self'",
    "script-src 'self'" + (nonce ? " 'nonce-" + nonce + "'" : ''),
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
}

/** The policy without a nonce — what a document that carries no inline script gets. */
export const CSP_POLICY = cspPolicy();

/** The nonce this response's inline scripts must carry, if one was issued. */
export function cspNonce(res: Response): string {
  return String((res.locals as any)?.cspNonce || '');
}

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
    // One nonce per response, for the inline scripts this server writes into the
    // documents it serves. Not for API responses (they carry no markup), but the
    // header is uniform — sending the same policy everywhere is what keeps it
    // auditable.
    const nonce = crypto.randomBytes(16).toString('base64');
    (res.locals as any).cspNonce = nonce;
    res.setHeader(cspHeaderName(), cspPolicy(nonce));
    // HSTS on HTTPS deployments (browsers ignore it over plain HTTP)
    if (process.env.NODE_ENV === 'production') {
      res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    }
    next();
  };
}
