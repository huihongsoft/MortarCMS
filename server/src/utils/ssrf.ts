// Shared SSRF protection: refuses requests to private/loopback/link-local
// addresses and follows redirects manually (default fetch follows them
// transparently, which would let an external page redirect us into an
// internal network), re-checking the resolved IP on every hop.
// Used by the AI theme-style analyzer and outbound webhook delivery.
import dns from 'node:dns/promises';

export function isPrivateIp(ip: string): boolean {
  if (!ip) return true;
  if (ip.includes(':')) { // IPv6: loopback, link-local, unique-local
    return /^::1$|^fe80:|^fc|^fd/.test(ip);
  }
  const parts = ip.split('.').map(Number);
  return parts[0] === 127 || parts[0] === 10 || parts[0] === 0 ||
    (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) ||
    (parts[0] === 192 && parts[1] === 168) ||
    (parts[0] === 169 && parts[1] === 254);
}

// SSRF-guarded fetch: GET by default, POST when opts.body is set. Returns
// {status, text} or null on refusal/error. Redirects are followed manually
// and each hop's resolved IP is checked.
export async function fetchUrlGuarded(url: string, opts: { method?: string; headers?: Record<string, string>; body?: string; timeoutMs?: number } = {}): Promise<{ status: number; text: string } | null> {
  let current = url;
  const method = (opts.method || 'GET').toUpperCase();
  for (let hop = 0; hop < 5; hop++) {
    let u: URL;
    try {
      u = new URL(current);
      if (!['http:', 'https:'].includes(u.protocol)) return null;
    } catch { return null; }
    const addrs = await dns.lookup(u.hostname, { all: true }).catch(() => []);
    if (addrs.some((a: any) => isPrivateIp(a.address))) return null;
    let res: Response;
    try {
      res = await fetch(current, { method, headers: opts.headers, body: method === 'POST' ? opts.body : undefined, redirect: 'manual', signal: AbortSignal.timeout(opts.timeoutMs || 10000) });
    } catch { return null; }
    if ([301, 302, 303, 307, 308].includes(res.status)) {
      const loc = res.headers.get('location');
      if (!loc) return null;
      try { current = new URL(loc, current).href; } catch { return null; }
      continue;
    }
    if (!res.ok) return { status: res.status, text: '' };
    return { status: res.status, text: (await res.text()).slice(0, 2_000_000) };
  }
  return null;
}
