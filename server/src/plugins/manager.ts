import fs from 'fs';
import path from 'path';
import https from 'https';
import http from 'http';
import { execFileSync } from 'child_process';
import { tmpdir as osTmpDir } from 'os';
import db from '../utils/db';
import { assertSafeArchive } from '../utils/archive';

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
export function listPlugins(): PluginMeta[] {
  const active = activePlugins();
  const result: PluginMeta[] = [];
  try {
    const dirs = fs.readdirSync(pluginsDir).filter(d => {
      const p = path.join(pluginsDir, d);
      return fs.statSync(p).isDirectory() && fs.existsSync(path.join(p, 'plugin.json'));
    });
    for (const dir of dirs) {
      try {
        const meta = JSON.parse(fs.readFileSync(path.join(pluginsDir, dir, 'plugin.json'), 'utf8'));
        result.push({
          name: meta.name || dir,
          version: meta.version || '0.0.0',
          description: meta.description || '',
          author: meta.author || '',
          requires: meta.requires || undefined,
          active: active.includes(meta.name || dir),
          builtin: true,
          settingsSchema: Array.isArray(meta.settingsSchema) ? meta.settingsSchema : undefined,
        });
      } catch (err: any) {
        result.push({ name: dir, version: '?', description: '', active: false, builtin: true, error: err.message });
      }
    }
  } catch {}
  return result;
}

// Dynamically load a plugin's register() and execute it
export async function loadPlugin(name: string): Promise<{ ok: boolean; error?: string }> {
  try {
    const dir = path.join(pluginsDir, name);
    const entry = path.join(dir, 'index.ts');
    if (!fs.existsSync(entry)) return { ok: false, error: 'Plugin entry not found' };
    const mod = require(entry) as any;
    if (typeof mod.register === 'function') mod.register();
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
    const dir = path.join(pluginsDir, name);
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
// metadata endpoints. (Node's http.get does not follow redirects automatically,
// and 3xx responses are rejected below, so the initial host check suffices.)
function isPrivateHost(hostname: string): boolean {
  const h = (hostname || '').toLowerCase().replace(/\.$/, '');
  if (!h || h === 'localhost' || h.endsWith('.local') || h.endsWith('.internal')) return true;
  if (/^\d+\.\d+\.\d+\.\d+$/.test(h)) {
    const [a, b] = h.split('.').map(Number);
    if (a === 10 || a === 127 || (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168)) return true;
  }
  return false;
}

// Download a remote plugin archive (zip or tar.gz) and install it
export async function installFromUrl(url: string): Promise<{ ok: boolean; error?: string; name?: string }> {
  const tmpDir = path.join(osTmpDir(), 'mortar-plugin-' + Date.now());
  let archivePath: string | null = null;
  try {
    if (!/^https?:\/\//.test(url)) return { ok: false, error: 'Invalid URL' };
    let parsed: URL;
    try { parsed = new URL(url); } catch { return { ok: false, error: 'Invalid URL' }; }
    if (isPrivateHost(parsed.hostname)) return { ok: false, error: 'Download from private/internal addresses is not allowed' };
    fs.mkdirSync(tmpDir, { recursive: true });
    const isGz = /\.(tar\.gz|tgz)$/i.test(url);
    const ext = isGz ? 'tar.gz' : 'zip';
    archivePath = path.join(tmpDir, 'pkg.' + ext);

    // Download
    await new Promise<void>((resolve, reject) => {
      const mod = url.startsWith('https') ? https : http;
      const req = mod.get(url, { headers: { 'User-Agent': 'Mortar-CMS/0.1' } }, (res) => {
        if (res.statusCode !== 200) { reject(new Error('Download failed: HTTP ' + res.statusCode)); res.resume(); return; }
        const out = fs.createWriteStream(archivePath!);
        res.pipe(out);
        out.on('finish', () => { out.close(); resolve(); });
        out.on('error', reject);
      });
      req.on('error', reject);
      req.setTimeout(30000, () => req.destroy(new Error('Download timed out')));
    });

    // Extract into tmpDir/extracted (zip-slip guard: entries validated first)
    const extractDir = path.join(tmpDir, 'extracted');
    fs.mkdirSync(extractDir, { recursive: true });
    assertSafeArchive(archivePath);
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
    const dest = path.join(pluginsDir, name);
    if (fs.existsSync(dest)) return { ok: false, error: 'Plugin already installed: ' + name };
    fs.cpSync(pluginRoot, dest, { recursive: true });
    return { ok: true, name };
  } catch (err: any) {
    return { ok: false, error: err.message };
  } finally {
    try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch {}
  }
}

// Install: copy a market package into the plugins directory
export async function installPlugin(name: string): Promise<{ ok: boolean; error?: string }> {
  try {
    const src = path.join(marketDir, name);
    const dest = path.join(pluginsDir, name);
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
    const dest = path.join(pluginsDir, name);
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

export const CORE_VERSION = '0.1.0';

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
  if (active) {
    const r = await loadPlugin(name);
    if (r.ok) await runLifecycle(name, 'activate');
    return r;
  }
  await runLifecycle(name, 'deactivate');
  return { ok: true };
}
