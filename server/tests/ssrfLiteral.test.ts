import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import http from 'node:http';
import { fetchUrlGuarded } from '../src/utils/ssrf';

// Regression guard: the guard used to look up URL.hostname verbatim. For an IPv6
// literal that value keeps its brackets ("[::1]"), dns.lookup fails, and the
// `.catch(() => [])` made the address list empty — which read as "no private
// address found" and let the request through. An author-level AI tool
// (analyze_web_theme) reaches this with a user-supplied URL.
describe('fetchUrlGuarded vs IP literals', () => {
  let srv: http.Server;
  let port = 0;

  beforeAll(async () => {
    srv = http.createServer((_req, res) => res.end('REACHED-INTERNAL'));
    await new Promise<void>((r) => srv.listen(0, '::1', () => r()));
    port = (srv.address() as any).port;
  });

  afterAll(() => { srv?.close(); });

  it('refuses an IPv6 loopback literal', async () => {
    expect(await fetchUrlGuarded('http://[::1]:' + port + '/', { timeoutMs: 3000 })).toBeNull();
  });

  it('refuses an IPv6-mapped IPv4 loopback literal', async () => {
    expect(await fetchUrlGuarded('http://[::ffff:127.0.0.1]:' + port + '/', { timeoutMs: 3000 })).toBeNull();
  });

  it('refuses an IPv4 loopback literal', async () => {
    expect(await fetchUrlGuarded('http://127.0.0.1:' + port + '/', { timeoutMs: 3000 })).toBeNull();
  });

  it('refuses an IPv6 unique-local literal', async () => {
    expect(await fetchUrlGuarded('http://[fd00::1]:' + port + '/', { timeoutMs: 3000 })).toBeNull();
  });

  it('refuses localhost and .internal names without a DNS round trip', async () => {
    expect(await fetchUrlGuarded('http://localhost:' + port + '/', { timeoutMs: 3000 })).toBeNull();
    expect(await fetchUrlGuarded('http://db.internal:' + port + '/', { timeoutMs: 3000 })).toBeNull();
  });

  it('refuses a hostname that does not resolve (fail closed)', async () => {
    expect(await fetchUrlGuarded('http://definitely-not-a-real-host.invalid/', { timeoutMs: 3000 })).toBeNull();
  });

  it('refuses non-http(s) schemes', async () => {
    expect(await fetchUrlGuarded('file:///etc/passwd')).toBeNull();
  });
});
