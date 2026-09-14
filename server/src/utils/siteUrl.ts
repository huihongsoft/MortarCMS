// Site URL / domain normalization, used by the install wizard.
//
// The site resolver (middleware/site.ts) matches the request Host header against
// Site.domain after stripping the port and lowercasing it, so a stored domain
// must be a bare lowercase hostname with no port, scheme or path. This module
// encodes that invariant for the install flow; the admin sites API
// (routes/sites.ts) still normalizes inline and could adopt these helpers later.

// Same character class as safeDbField in routes/install.ts: whitespace and
// control characters are never valid in a URL and can smuggle line breaks.
const CONTROL_OR_SPACE = /[\s\x00-\x1f\x7f]/;

const INVALID = 'Invalid site URL - use http(s)://host with no path';

// Turn user input (a bare domain, host:port, or a full URL) into the hostname
// stored in Site.domain. Returns '' when nothing usable remains.
export function normalizeDomainInput(raw: unknown): string {
  let s = String(raw ?? '').trim().toLowerCase();
  if (!s) return '';
  s = s.replace(/^[a-z][a-z0-9+.-]*:\/\//, ''); // drop any scheme
  s = s.split(/[/?#]/, 1)[0];                   // drop path / query / hash
  const at = s.lastIndexOf('@');
  if (at !== -1) s = s.slice(at + 1);           // drop userinfo
  if (s.startsWith('[')) {                      // IPv6 literal keeps its brackets
    const end = s.indexOf(']');
    return end === -1 ? '' : s.slice(0, end + 1);
  }
  // Drop the port only for a plain host:port — a bare IPv6 has several colons.
  if (/^[^:]+:\d+$/.test(s)) s = s.slice(0, s.lastIndexOf(':'));
  // A trailing root dot is the same host (example.com. == example.com), but it
  // would never equal the Host header, so a site registered that way would
  // silently serve the primary site instead.
  return s.replace(/\.+$/, '');
}

// A hostname that can actually appear in a Host header: dot-separated labels of
// [a-z0-9_-], no empty label, no leading/trailing hyphen, ≤63 chars per label
// and ≤253 total. Underscores are tolerated because internal DNS names use them.
// Catches typos at install time rather than letting them fail to match silently.
function validHostname(host: string): boolean {
  if (!host || host.length > 253) return false;
  for (const label of host.split('.')) {
    if (!label || label.length > 63) return false;
    if (label.startsWith('-') || label.endsWith('-')) return false;
    if (!/^[a-z0-9_-]+$/.test(label)) return false;
  }
  return true;
}

// Validate and normalize a site URL typed into the install wizard.
// The URL must be an origin: http(s) scheme, a host, and nothing else. Paths are
// rejected because the app is only routed at the root.
export function parseSiteUrl(raw: unknown): { url: string; domain: string } | { error: string } {
  const s = String(raw ?? '').trim();
  if (!s || CONTROL_OR_SPACE.test(s)) return { error: INVALID };
  if (!/^https?:\/\//i.test(s)) return { error: INVALID };

  let u: URL;
  try { u = new URL(s); } catch { return { error: INVALID }; }

  if (u.protocol !== 'http:' && u.protocol !== 'https:') return { error: INVALID };
  if (u.username || u.password) return { error: INVALID };
  if (u.pathname !== '/' || u.search || u.hash) return { error: INVALID };

  const domain = normalizeDomainInput(u.hostname);
  if (!u.hostname || !domain) return { error: INVALID };
  // Bracketed IPv6 literals are matched verbatim; every other host must be a
  // plausible hostname.
  if (!domain.startsWith('[') && !validHostname(domain)) return { error: INVALID };

  // Rebuild from the normalized hostname rather than u.origin, so a trailing
  // root dot cannot survive in the stored URL either. u.port is empty for a
  // default port and keeps a non-default one (http://localhost:3001).
  return { url: u.protocol + '//' + domain + (u.port ? ':' + u.port : ''), domain };
}
