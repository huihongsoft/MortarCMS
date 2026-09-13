import { describe, it, expect } from 'vitest';
import { isPrivateIp } from '../src/utils/ssrf';

// true = must be refused (private/loopback/reserved or embeds one)
const BLOCKED: [string, string][] = [
  ['0.0.0.0', 'this-host'],
  ['127.0.0.1', 'loopback'],
  ['127.1', 'short loopback form'],
  ['10.0.0.1', 'private'],
  ['100.64.0.1', 'CGNAT'],
  ['169.254.169.254', 'cloud metadata'],
  ['172.16.0.1', 'private'],
  ['192.0.0.5', 'IETF protocol'],
  ['192.0.2.1', 'TEST-NET-1'],
  ['192.168.1.1', 'private'],
  ['198.18.0.1', 'benchmark'],
  ['198.51.100.1', 'TEST-NET-2'],
  ['203.0.113.1', 'TEST-NET-3'],
  ['224.0.0.1', 'multicast'],
  ['255.255.255.255', 'broadcast'],
  ['::', 'unspecified'],
  ['::1', 'loopback v6'],
  ['::ffff:127.0.0.1', 'v4-mapped dotted'],
  ['::ffff:7f00:1', 'v4-mapped hex'],
  ['0:0:0:0:0:ffff:7f00:1', 'v4-mapped full form'],
  ['::7f00:1', 'v4-compatible'],
  ['fe80::1%eth0', 'link-local with zone'],
  ['fec0::1', 'site-local'],
  ['fd00::1', 'unique-local'],
  ['ff02::1', 'multicast v6'],
  ['64:ff9b::7f00:1', 'NAT64 wrapping loopback'],
  ['2002:0a00:0001::', '6to4 embedding 10.0.0.1'],
  ['2001:0:0:0:0:0:80ff:fffe', 'Teredo embedding 127.0.0.1'],
];

const ALLOWED: [string, string][] = [
  ['8.8.8.8', 'public dns'],
  ['1.1.1.1', 'public dns'],
  ['93.184.216.34', 'public host'],
  ['172.15.0.1', 'just below private range'],
  ['172.32.0.1', 'just above private range'],
  ['2002:0808:0808::', '6to4 embedding 8.8.8.8'],
  ['2606:4700::1111', 'public v6'],
  ['2001:db8::1', 'documentation range'],
];

describe('isPrivateIp', () => {
  for (const [ip, label] of BLOCKED) {
    it(`blocks ${ip} (${label})`, () => expect(isPrivateIp(ip)).toBe(true));
  }
  for (const [ip, label] of ALLOWED) {
    it(`allows ${ip} (${label})`, () => expect(isPrivateIp(ip)).toBe(false));
  }
  it('treats empty/garbage as unsafe', () => {
    expect(isPrivateIp('')).toBe(true);
    expect(isPrivateIp('not-an-ip')).toBe(true);
  });
});
