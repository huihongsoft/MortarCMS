import fs from 'fs';
import path from 'path';
import https from 'https';
import http from 'http';
import dns from 'node:dns/promises';
import { execFileSync } from 'child_process';
import { tmpdir as osTmpDir } from 'os';
import db from '../utils/db';
import { assertArchiveWithinLimits } from '../utils/archive';
import { verifyArtifact } from '../utils/artifact';
import { isPrivateIp } from '../utils/ssrf';
import { APP_VERSION } from '../utils/config';
import { doAction, withHookSource, removeHooksBySource } from '../utils/hooks';
import { purgeContentCaches } from '../utils/cache';
import { removeShortcodesBySource } from '../utils/shortcodes';
import { removeToolsBySource } from '../utils/aiTools';
import { setPluginContext, removePluginRegistrations, clearPluginIntervals } from '../utils/pluginApi';

// Plugins ship as TypeScript sources (server/plugins/<name>/index.ts). Register
// tsx's CommonJS loader so `node dist/index.js` (production build) can require
// .ts plugin entries the same way the tsx dev runtime does. In dev this is a
// no-op (tsx already handles it).
try { require('tsx/cjs'); } catch { /* tsx not installed — plugin loading falls back to tsx dev runtime */ }

export interface PluginSettingField {
  key: string;
  label: string; // i18n key (English text; admin UI translates it)
  type: 'text' | 'textarea' | 'password' | 'number' | 'checkbox' | 'select' | 'url';
  options?: string[]; // for select
  default?: string;
  hint?: string; // i18n key
}

export interface PluginMeta {
  name: string;
  version: string;
  description: string;
  author?: string;
  active: boolean;
  builtin: boolean;
  requires?: string; // minimum core version, e.g. "0.1.0"
  error?: string;
  settingsSchema?: PluginSettingField[];
  /** sha256 of the archive this plugin was installed from; absent when unknown. */
  artifactHash?: string;
  /** sha256 a market catalogue publishes for the package, when it declares one. */
  marketSha256?: string;
}

// Validate a plugin's declared settings against its schema
export function validatePluginSettings(schema: PluginSettingField[] | undefined, values: Record<string, unknown>): string | null {
  if (!schema) return null;
  for (const field of schema) {
    const v = values[field.key];
    if (v === undefined || v === null || v === '') continue;
    const s = String(v);
    if (field.type === 'number') {
      if (isNaN(Number(s))) return field.key + ' must be a number';
      const n = Number(s);
      if (field.key.includes('days') || field.key.includes('length') || field.key.includes('retention')) {
        if (n < 1) return field.key + ' must be >= 1';
      }
    }
    if (field.type === 'url' && !/^https?:\/\/\S+$/i.test(s)) return field.key + ' must be a valid http(s) URL';
    if (field.type === 'checkbox' && s !== '0' && s !== '1') return field.key + ' must be 0 or 1';
    if (field.type === 'select' && field.options && !field.options.includes(s)) return field.key + ' must be one of: ' + field.options.join(', ');
  }
  return null;
}

const pluginsDir = path.join(__dirname, '..', '..', 'plugins');
const marketDir = path.join(__dirname, '..', '..', 'market');

// A plugin name is a directory component (uninstall does fs.rmSync recursively,
// load requires index.ts from it). Express decodes route params, so an
// unvalidated name like "../../uploads" would resolve outside pluginsDir — the
// same class of bug as the theme routes. Names are plain slugs, like the shipping
// plugins (comment-email-notify, event-webhook, ...).
// Underscores are allowed (the installer accepts them, and unlike theme settings
// plugin settings are not namespaced by name); dots and slashes are not.
const PLUGIN_NAME_RE = /^[A-Za-z0-9_-]+$/;
function safePluginDir(name: unknown): string | null {
  const n = String(name || '');
  if (!PLUGIN_NAME_RE.test(n)) return null;
  return path.join(pluginsDir, n);
}
const loaded: Record<string, { meta: PluginMeta; register?: () => void }> = {};

function activePlugins(): string[] {
  const row = db.prepare("SELECT value FROM Setting WHERE key = 'active_plugins'").get() as any;
  try { return row ? JSON.parse(row.value) : []; } catch { return []; }
}

function setActive(names: string[]): void {
  db.prepare("INSERT INTO Setting (id, key, value) VALUES (?, 'active_plugins', ?) ON CONFLICT(key) DO UPDATE SET value = ?").run(
    'active_plugins', JSON.stringify(names), JSON.stringify(names)
  );
}

// Scan plugin directories and read metadata
export function isPluginActive(name: string): boolean { return activePlugins().includes(name); }

// Everything a plugin added at runtime: extension points, hook listeners and
// shortcodes. `plugin:` is the source prefix hooks are tagged with.
function discardPluginArtifacts(name: string): void {
  removePluginRegistrations(name);
  removeHooksBySource('plugin:' + name);
  removeHooksBySource(name);
  removeShortcodesBySource(name);
  removeToolsBySource(name);
  // Periodic work must stop with the plugin: media-cleanup kept deleting files
  // after it was disabled because its own setInterval outlived the deactivation.
  clearPluginIntervals(name);
}

export function listPlugins(): PluginMeta[] {
  const active = activePlugins();
  const hashes = artifactHashes();
  const result: PluginMeta[] = [];
  try {
    const dirs = fs.readdirSync(pluginsDir).filter(d => {
      const p = path.join(pluginsDir, d);
      return fs.statSync(p).isDirectory() && fs.existsSync(path.join(p, 'plugin.json'));
    });
    for (const dir of dirs) {
      try {
        const meta = JSON.parse(fs.readFileSync(path.join(pluginsDir, dir, 'plugin.json'), 'utf8'));
        const name = meta.name || dir;
        result.push({
          name,
          version: meta.version || '0.0.0',
          description: meta.description || '',
          author: meta.author || '',
          requires: meta.requires || undefined,
          active: active.includes(name),
          builtin: true,
          settingsSchema: Array.isArray(meta.settingsSchema) ? meta.settingsSchema : undefined,
          // Fingerprint of the archive it was installed from, when it came from
          // one. A plugin copied into the directory by hand has none — that is
          // reported as "unverified" rather than as an empty hash, because the
          // two mean different things to an operator.
          artifactHash: hashes[name],
        });
      } catch (err: any) {
        result.push({ name: dir, version: '?', description: '', active: false, builtin: true, error: err.message });
      }
    }
  } catch {}
  return result;
}

// ---- Installed-artifact fingerprints ----
//
// sha256 of the archive each plugin was installed from. Plugins run with full
// privileges (no sandbox), so recording what was installed is the only
// integrity signal available: an operator can compare it against the hash the
// publisher announced, and a re-install of the same release should match.
function artifactHashes(): Record<string, string> {
  try {
    const row = db.prepare("SELECT value FROM Setting WHERE key = 'plugin_artifact_hashes'").get() as any;
    const parsed = row?.value ? JSON.parse(row.value) : {};
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch { return {}; }
}

export function recordArtifactHash(name: string, sha256: string): void {
  try {
    const map = artifactHashes();
    map[name] = sha256;
    db.prepare("INSERT INTO Setting (id, key, value) VALUES ('plugin_artifact_hashes', 'plugin_artifact_hashes', ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value")
      .run(JSON.stringify(map));
  } catch { /* best effort: a missing fingerprint must not fail an install */ }
}

export function getArtifactHash(name: string): string | null {
  return artifactHashes()[name] || null;
}

// Dynamically load a plugin's register() and execute it
export async function loadPlugin(name: string): Promise<{ ok: boolean; error?: string }> {
  try {
    const dir = safePluginDir(name);
    if (!dir) return { ok: false, error: 'Invalid plugin name' };
    const entry = path.join(dir, 'index.ts');
    if (!fs.existsSync(entry)) return { ok: false, error: 'Plugin entry not found' };
    const mod = require(entry) as any;
    // Start from a clean slate so re-loading (a toggle off/on, or a second
    // loadActivePlugins pass) cannot hit "already registered" errors or stack a
    // second copy of every hook/shortcode.
    discardPluginArtifacts(name);
    // Everything register() adds is attributed to this plugin: hooks (so the
    // hooks browser shows the real source) and its routes/admin pages/blocks.
    if (typeof mod.register === 'function') {
      withHookSource('plugin:' + name, () => {
        setPluginContext(name);
        try { mod.register(); } finally { setPluginContext(null); }
      });
    }
    loaded[name] = { meta: listPlugins().find((p: any) => p.name === name) as PluginMeta, register: mod.register };
    return { ok: true };
  } catch (err: any) {
    return { ok: false, error: err.message };
  }
}

// Lifecycle hook helpers (WordPress-style): plugin index.ts may export
// activate() / deactivate() / uninstall() functions
async function runLifecycle(name: string, hook: 'activate' | 'deactivate' | 'uninstall'): Promise<void> {
  try {
    const dir = safePluginDir(name);
    if (!dir) return;
    const entry = path.join(dir, 'index.ts');
    if (!fs.existsSync(entry)) return;
    const mod = require(entry) as any;
    if (typeof mod[hook] === 'function') await mod[hook]();
  } catch (err: any) {
    console.log('[Plugins] ' + hook + ' failed for ' + name + ': ' + err.message);
  }
}

export { runLifecycle };

// Load all active plugins at startup
export async function loadActivePlugins(): Promise<void> {
  const active = activePlugins();
  for (const name of active) {
    const r = await loadPlugin(name);
    if (!r.ok) console.log('[Plugins] Failed to load ' + name + ': ' + r.error);
    else console.log('[Plugins] Loaded ' + name);
  }
}

// Market: list available packages (server/market/*) with install status
export function listMarket(): PluginMeta[] {
  const installed = listPlugins().map((p: any) => p.name);
  const result: PluginMeta[] = [];
  try {
    const dirs = fs.readdirSync(marketDir).filter(d => {
      const p = path.join(marketDir, d);
      return fs.statSync(p).isDirectory() && fs.existsSync(path.join(p, 'plugin.json'));
    });
    for (const dir of dirs) {
      try {
        const meta = JSON.parse(fs.readFileSync(path.join(marketDir, dir, 'plugin.json'), 'utf8'));
        result.push({
          name: meta.name || dir,
          version: meta.version || '0.0.0',
          description: meta.description || '',
          author: meta.author || '',
          active: installed.includes(meta.name || dir),
          builtin: true,
        });
      } catch (err: any) {
        result.push({ name: dir, version: '?', description: '', active: false, builtin: true, error: err.message });
      }
    }
  } catch {}
  return result;
}

// SSRF guard: reject URLs pointing at private / loopback / link-local hosts so
// a malicious plugin URL cannot be used to probe the internal network or cloud
// metadata endpoints. The hostname is resolved first — a name like
// `evil.example` that resolves to 127.0.0.1 must be refused just like a literal
// IP. (Node's http.get does not follow redirects, and 3xx responses are
// rejected below, so the initial host check covers the download.)
async function assertPublicUrl(url: string): Promise<void> {
  let parsed: URL;
  try { parsed = new URL(url); } catch { throw new Error('Invalid URL'); }
  if (!['http:', 'https:'].includes(parsed.protocol)) throw new Error('Invalid URL');
  // URL.hostname keeps the brackets for IPv6 literals ([::1]); strip them so
  // the literal can be classified (and public IPv6 plugin URLs aren't refused).
  const h = parsed.hostname.toLowerCase().replace(/\.$/, '').replace(/^\[|\]$/g, '');
  if (!h || h === 'localhost' || h.endsWith('.local') || h.endsWith('.internal')) {
    throw new Error('Download from private/internal addresses is not allowed');
  }
  // Literal IP (v4 or v6) — classify directly, no DNS involved.
  if (/^[0-9.]+$/.test(h) || h.includes(':')) {
    if (isPrivateIp(h)) throw new Error('Download from private/internal addresses is not allowed');
    return;
  }
  const addrs = await dns.lookup(h, { all: true }).catch(() => []);
  if (addrs.length === 0 || addrs.some((a: any) => isPrivateIp(a.address))) {
    throw new Error('Download from private/internal addresses is not allowed');
  }
}

// Download a remote plugin archive (zip or tar.gz) and install it
export async function installFromUrl(url: string, expectedSha256?: string): Promise<{ ok: boolean; error?: string; name?: string; sha256?: string }> {
  const tmpDir = path.join(osTmpDir(), 'mortar-plugin-' + Date.now());
  let archivePath: string | null = null;
  try {
    if (!/^https?:\/\//.test(url)) return { ok: false, error: 'Invalid URL' };
    try { await assertPublicUrl(url); } catch (e: any) { return { ok: false, error: e.message }; }
    fs.mkdirSync(tmpDir, { recursive: true });
    const isGz = /\.(tar\.gz|tgz)$/i.test(url);
    const ext = isGz ? 'tar.gz' : 'zip';
    archivePath = path.join(tmpDir, 'pkg.' + ext);

    // Download, with a hard byte cap: the response used to be piped straight to
    // disk, so a hostile server could stream indefinitely and fill the volume.
    const MAX_DOWNLOAD = 100 * 1024 * 1024;
    await new Promise<void>((resolve, reject) => {
      const mod = url.startsWith('https') ? https : http;
      const req = mod.get(url, { headers: { 'User-Agent': 'Mortar-CMS/0.1' } }, (res) => {
        if (res.statusCode !== 200) { reject(new Error('Download failed: HTTP ' + res.statusCode)); res.resume(); return; }
        let received = 0;
        const out = fs.createWriteStream(archivePath!);
        res.on('data', (chunk: Buffer) => {
          received += chunk.length;
          if (received > MAX_DOWNLOAD) {
            out.destroy();
            res.destroy();
            req.destroy();
            reject(new Error('Download exceeds the ' + MAX_DOWNLOAD + ' byte limit'));
          }
        });
        res.pipe(out);
        out.on('finish', () => { out.close(); resolve(); });
        out.on('error', reject);
      });
      req.on('error', reject);
      req.setTimeout(30000, () => req.destroy(new Error('Download timed out')));
    });

    // Integrity gate: when the source publishes a digest, nothing is extracted
    // until the archive matches it. Compared before extraction, so a tampered
    // package never reaches the filesystem.
    const artifact = verifyArtifact(archivePath, expectedSha256);
    if (expectedSha256 && !artifact.ok) {
      return { ok: false, error: 'Checksum mismatch: expected ' + artifact.expected + ', got ' + (artifact.sha256 || '(unreadable)') };
    }

    // Extract into tmpDir/extracted (zip-slip guard, entry-count and real
    // expansion limits all checked before extraction).
    const extractDir = path.join(tmpDir, 'extracted');
    fs.mkdirSync(extractDir, { recursive: true });
    await assertArchiveWithinLimits(archivePath, { maxEntries: 5000, maxBytes: 500 * 1024 * 1024 });
    if (isGz) execFileSync('tar', ['-xzf', archivePath, '-C', extractDir]);
    else execFileSync('unzip', ['-q', archivePath, '-d', extractDir]);

    // Find plugin root (dir containing plugin.json, one level deep max)
    let pluginRoot: string | null = null;
    if (fs.existsSync(path.join(extractDir, 'plugin.json'))) pluginRoot = extractDir;
    else {
      const entries = fs.readdirSync(extractDir).filter(e => fs.statSync(path.join(extractDir, e)).isDirectory());
      for (const e of entries) {
        if (fs.existsSync(path.join(extractDir, e, 'plugin.json'))) { pluginRoot = path.join(extractDir, e); break; }
      }
    }
    if (!pluginRoot) return { ok: false, error: 'No plugin.json found in archive' };
    // Zip-slip guard: ensure the plugin root stays inside the extraction dir
    const resolvedRoot = fs.realpathSync(pluginRoot);
    const resolvedExtract = fs.realpathSync(extractDir);
    if (!resolvedRoot.startsWith(resolvedExtract + path.sep)) return { ok: false, error: 'Archive path traversal detected' };
    const meta = JSON.parse(fs.readFileSync(path.join(pluginRoot, 'plugin.json'), 'utf8'));
    const name = meta.name;
    // The name becomes a directory inside plugins/: it must be a plain slug so
    // a crafted plugin.json can never escape the plugins directory (../ traversal).
    if (!name || !/^[a-z0-9][a-z0-9-_]*$/i.test(name)) return { ok: false, error: 'plugin.json name must be a plain alphanumeric slug' };
    const dest = safePluginDir(name);
    if (!dest) return { ok: false, error: 'Invalid plugin name' };
    if (fs.existsSync(dest)) return { ok: false, error: 'Plugin already installed: ' + name };
    fs.cpSync(pluginRoot, dest, { recursive: true });
    // Remember the fingerprint of what was installed, so the admin can see it
    // and a later re-install can be compared against the same release.
    if (artifact.sha256) recordArtifactHash(name, artifact.sha256);
    return { ok: true, name, sha256: artifact.sha256 || undefined };
  } catch (err: any) {
    return { ok: false, error: err.message };
  } finally {
    try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch {}
  }
}

// Install: copy a market package into the plugins directory
export async function installPlugin(name: string): Promise<{ ok: boolean; error?: string }> {
  try {
    const safeName = safePluginDir(name);
    if (!safeName) return { ok: false, error: 'Invalid plugin name' };
    const src = path.join(marketDir, path.basename(safeName));
    const dest = safeName;
    if (!fs.existsSync(path.join(src, 'plugin.json'))) return { ok: false, error: 'Package not found in market' };
    if (fs.existsSync(dest)) return { ok: false, error: 'Plugin already installed' };
    fs.cpSync(src, dest, { recursive: true });
    return { ok: true };
  } catch (err: any) {
    return { ok: false, error: err.message };
  }
}

// Uninstall: remove a plugin directory (must be inactive first)
export async function uninstallPlugin(name: string): Promise<{ ok: boolean; error?: string }> {
  try {
    const dest = safePluginDir(name);
    if (!dest) return { ok: false, error: 'Invalid plugin name' };
    if (!fs.existsSync(dest)) return { ok: false, error: 'Plugin not installed' };
    const active = activePlugins();
    if (active.includes(name)) return { ok: false, error: 'Deactivate the plugin before uninstalling' };
    await runLifecycle(name, 'uninstall');
    fs.rmSync(dest, { recursive: true, force: true });
    return { ok: true };
  } catch (err: any) {
    return { ok: false, error: err.message };
  }
}

// Minimal semver compare: "1.2.3" >= "0.9.0"
function versionAtLeast(actual: string, required: string): boolean {
  const a = actual.split('.').map(Number);
  const r = required.split('.').map(Number);
  for (let i = 0; i < Math.max(a.length, r.length); i++) {
    const av = a[i] || 0, rv = r[i] || 0;
    if (av !== rv) return av > rv;
  }
  return true;
}

export const CORE_VERSION = APP_VERSION;

export async function setPluginActive(name: string, active: boolean): Promise<{ ok: boolean; error?: string }> {
  const metas = listPlugins();
  const meta = metas.find((m: any) => m.name === name);
  if (!meta) return { ok: false, error: 'Plugin not found' };
  if (active && meta.requires && !versionAtLeast(CORE_VERSION, meta.requires)) {
    return { ok: false, error: 'This plugin requires core version ' + meta.requires + ' or newer (installed: ' + CORE_VERSION + ')' };
  }
  const current = activePlugins();
  const idx = current.indexOf(name);
  if (active && idx === -1) current.push(name);
  if (!active && idx !== -1) current.splice(idx, 1);
  setActive(current);
  // Plugins and webhooks can react to activation, exactly as they can to a
  // plugin's own activate()/deactivate() lifecycle function.
  const fire = (hook: string) => { try { doAction(hook, name, active); } catch (e: any) { console.log('[Plugins] ' + hook + ' listener failed: ' + e.message); } };
  if (active) {
    const r = await loadPlugin(name);
    if (!r.ok) {
      // register() threw: do not leave it marked active with half its
      // registrations live — a restart would then try to load it again.
      setActive(activePlugins().filter(n => n !== name));
      discardPluginArtifacts(name);
      return r;
    }
    await runLifecycle(name, 'activate');
    // A plugin's shortcodes and post_content filters are part of the rendered
    // (cached) HTML, so enabling it has to flush the content cache.
    try { purgeContentCaches(); } catch {}
    fire('plugin_activated');
    return r;
  }
  await runLifecycle(name, 'deactivate');
  // A deactivated plugin must stop answering requests, offering admin
  // pages/blocks and running its hooks/shortcodes; register() re-adds them if it
  // is enabled again.
  discardPluginArtifacts(name);
  try { purgeContentCaches(); } catch {}
  fire('plugin_deactivated');
  return { ok: true };
}
