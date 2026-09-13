// Shared SSRF protection: refuses requests to private/loopback/link-local
// addresses and follows redirects manually (default fetch follows them
// transparently, which would let an external page redirect us into an
// internal network), re-checking the resolved IP on every hop.
// Used by the AI theme-style analyzer and outbound webhook delivery.
import dns from 'node:dns/promises';

// Expand an IPv6 literal to eight 16-bit hextets, or null if unparseable.
function expandIpv6(addr: string): number[] | null {
  const parts = addr.split('::');
  if (parts.length > 2) return null;
  const head = parts[0] ? parts[0].split(':') : [];
  const tail = parts.length === 2 ? (parts[1] ? parts[1].split(':') : []) : [];
  const missing = 8 - head.length - tail.length;
  if (parts.length === 2 && missing < 0) return null;
  const all = parts.length === 2 ? [...head, ...Array(missing).fill('0'), ...tail] : head;
  if (all.length !== 8) return null;
  const nums = all.map((h) => parseInt(h || '0', 16));
  if (nums.some((n) => !Number.isFinite(n) || n < 0 || n > 0xffff)) return null;
  return nums;
}

function hextetsToIpv4(pair: number[] | undefined): string | null {
  if (!pair || pair.length !== 2) return null;
  const [hi, lo] = pair;
  return [hi >> 8, hi & 255, lo >> 8, lo & 255].join('.');
}

const allZero = (a: number[]) => a.every((n) => n === 0);

export function isPrivateIp(ip: string): boolean {
  if (!ip) return true;
  let addr = String(ip).trim().toLowerCase();
  const pct = addr.indexOf('%'); // strip IPv6 zone index (fe80::1%eth0)
  if (pct !== -1) addr = addr.slice(0, pct);

  if (addr.includes(':')) {
    // Dotted IPv4 embedded directly (::ffff:127.0.0.1)
    const dotted = addr.match(/(?:^|:)((?:\d{1,3}\.){3}\d{1,3})$/);
    if (dotted) return isPrivateIp(dotted[1]);

    const h = expandIpv6(addr);
    if (h) {
      // Extract an embedded IPv4 from mapped/compatible/6to4/Teredo forms and
      // judge by it. Covers full-length mapped addresses (0:0:0:0:0:ffff:7f00:1)
      // that a `::ffff:` string check would miss.
      let embedded: number[] | undefined;
      if (allZero(h.slice(0, 5)) && (h[5] === 0 || h[5] === 0xffff)) embedded = h.slice(6);
      else if (h[0] === 0x2002) embedded = h.slice(1, 3);                    // 6to4
      else if (h[0] === 0x2001 && h[1] === 0x0000) {                         // Teredo (client XOR)
        const x = ~((h[6] << 16) | h[7]) >>> 0;
        embedded = [x >>> 16, x & 0xffff];
      }
      const v4 = hextetsToIpv4(embedded);
      if (v4) return isPrivateIp(v4);
    }

    if (addr === '::1' || addr === '::') return true;      // loopback / unspecified
    if (/^fe[89ab]/.test(addr)) return true;               // fe80::/10 link-local
    if (/^fec/.test(addr)) return true;                    // fec0::/10 site-local (deprecated)
    if (/^f[cd]/.test(addr)) return true;                  // fc00::/7 unique-local
    if (/^ff/.test(addr)) return true;                     // ff00::/8 multicast
    if (/^64:ff9b:/.test(addr)) return true;               // NAT64 (can map to private v4)
    if (/^2001:0:/.test(addr)) return true;                // Teredo if not decodable
    return false;
  }

  const parts = addr.split('.').map(Number);
  if (parts.length !== 4 || parts.some((n) => !Number.isInteger(n) || n < 0 || n > 255)) return true;
  const [a, b, c] = parts;
  if (a === 0 || a === 10 || a === 127) return true;            // this-host / private / loopback
  if (a === 100 && b >= 64 && b <= 127) return true;            // 100.64/10 CGNAT
  if (a === 169 && b === 254) return true;                      // 169.254/16 link-local (cloud metadata)
  if (a === 172 && b >= 16 && b <= 31) return true;             // 172.16/12 private
  if (a === 192 && (b === 0 || b === 168)) return true;         // 192.0.0/24 + 192.168/16
  if (a === 192 && b === 88 && c === 99) return true;           // 6to4 relay anycast
  if (a === 198 && (b === 18 || b === 19)) return true;         // 198.18/15 benchmarking
  if (a === 198 && b === 51 && c === 100) return true;          // TEST-NET-2
  if (a === 203 && b === 0 && c === 113) return true;           // TEST-NET-3
  if (a >= 224) return true;                                    // multicast + reserved + broadcast
  return false;
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
