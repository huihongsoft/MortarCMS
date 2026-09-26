import { describe, it, expect } from 'vitest';
import express from 'express';
import { securityHeaders, cspHeaderName, CSP_POLICY } from '../src/middleware/securityHeaders';

// The app-wide CSP is shipped report-only on purpose (a plugin screen injects
// inline scripts, and a wrong policy white-screens the admin with no server-side
// symptom). These pin both the policy's content and the switch, so neither the
// header nor the default can be lost silently.
function collect(env: NodeJS.ProcessEnv = {}): Promise<Record<string, any>> {
  return new Promise((resolve) => {
    const app = express();
    app.use((req, _res, next) => { (req as any).env = env; next(); });
    app.use((req, res, next) => {
      const saved = process.env.CSP_ENFORCE;
      if (env.CSP_ENFORCE !== undefined) process.env.CSP_ENFORCE = env.CSP_ENFORCE;
      else delete process.env.CSP_ENFORCE;
      try { securityHeaders()(req, res, next); }
      finally { if (saved === undefined) delete process.env.CSP_ENFORCE; else process.env.CSP_ENFORCE = saved; }
    });
    app.get('/', (_req, res) => { res.json({ ok: true }); });
    const server = app.listen(0, async () => {
      const port = (server.address() as any).port;
      const r = await fetch('http://127.0.0.1:' + port + '/');
      const headers: Record<string, any> = {};
      r.headers.forEach((v, k) => { headers[k.toLowerCase()] = v; });
      server.close();
      resolve(headers);
    });
  });
}

describe('security headers', () => {
  it('sends the policy report-only by default', async () => {
    const h = await collect();
    expect(h['content-security-policy-report-only']).toBe(CSP_POLICY);
    expect(h['content-security-policy']).toBeUndefined();
  });

  it('enforces the policy when CSP_ENFORCE=1', async () => {
    expect(cspHeaderName({ CSP_ENFORCE: '1' } as any)).toBe('Content-Security-Policy');
    const h = await collect({ CSP_ENFORCE: '1' });
    expect(h['content-security-policy']).toBe(CSP_POLICY);
    expect(h['content-security-policy-report-only']).toBeUndefined();
  });

  it('keeps the directives the app relies on', () => {
    expect(CSP_POLICY).toContain("script-src 'self'");
    expect(CSP_POLICY).toContain("style-src 'self' 'unsafe-inline'");   // block editor writes inline styles
    expect(CSP_POLICY).toContain("frame-src 'self' blob:");             // visual editor canvas
    expect(CSP_POLICY).toContain("frame-ancestors 'none'");
    expect(CSP_POLICY).toContain("object-src 'none'");
    expect(CSP_POLICY).toContain("base-uri 'self'");
    expect(CSP_POLICY).toContain("form-action 'self'");
  });

  it('keeps the companion headers', async () => {
    const h = await collect();
    expect(h['x-frame-options']).toBe('DENY');
    expect(h['x-content-type-options']).toBe('nosniff');
    expect(h['referrer-policy']).toBe('strict-origin-when-cross-origin');
    expect(h['permissions-policy']).toContain('camera=()');
  });
});
