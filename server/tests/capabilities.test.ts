import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import fs from 'fs';
import path from 'path';
import express from 'express';
import db, { initDB } from '../src/utils/db';
import { signToken } from '../src/utils/jwt';
import { invalidateRoleCache } from '../src/middleware/auth';
import { alignBuiltinRoleCapabilities, addRoleCapabilities, BUILTIN_ROLES } from '../src/utils/db';
import { CAPABILITY_CATALOG } from '../src/routes/roles';
import userRoutes from '../src/routes/users';
import pluginRoutes from '../src/routes/plugins';
import siteRoutes from '../src/routes/sites';
import exportRoutes from '../src/routes/export';
import menuRoutes from '../src/routes/menus';
import mediaRoutes from '../src/routes/media';
import dbToolRoutes from '../src/routes/dbTools';
import securityRoutes from '../src/routes/security';
import roleRoutes from '../src/routes/roles';

// The admin-only areas were guarded by role name, so the capability catalogue on
// the Roles page was decorative: granting manage_plugins to a custom role did
// nothing. These pin both directions — a role WITHOUT the capability is still
// refused (no accidental widening) and one WITH it gets in.
const DB_FILE = process.env.MORTAR_DB_PATH || '/tmp/mortar-vitest-caps.db';
let server: any;
let base = '';

const token = (id: string, role: string) => ({ authorization: 'Bearer ' + signToken({ userId: id, role, v: 0 }), 'content-type': 'application/json' });

beforeAll(async () => {
  initDB();
  db.prepare("INSERT INTO User (id, username, email, password, role, tokenVersion) VALUES ('a1','a1','a1@test.dev','x','admin',0)").run();
  db.prepare("INSERT INTO User (id, username, email, password, role, tokenVersion) VALUES ('e1','e1','e1@test.dev','x','editor',0)").run();
  db.prepare("INSERT INTO User (id, username, email, password, role, tokenVersion) VALUES ('o1','o1','o1@test.dev','x','ops',0)").run();
  db.prepare("INSERT INTO User (id, username, email, password, role, tokenVersion) VALUES ('au1','au1','au1@test.dev','x','author',0)").run();
  // A custom role holding just one of the previously unreachable areas.
  db.prepare("INSERT INTO Role (id, slug, name, capabilities, isSystem, createdAt) VALUES ('r1','ops','Ops',?,0,?)")
    .run(JSON.stringify(['manage_plugins']), new Date().toISOString());
  // The superuser capability: no built-in role holds it, it must be granted.
  db.prepare("INSERT INTO Role (id, slug, name, capabilities, isSystem, createdAt) VALUES ('r2','sysop','SysOp',?,0,?)")
    .run(JSON.stringify(['manage_system']), new Date().toISOString());
  db.prepare("INSERT INTO User (id, username, email, password, role, tokenVersion) VALUES ('s1','s1','s1@test.dev','x','sysop',0)").run();
  invalidateRoleCache();

  const app = express();
  app.use(express.json());
  app.use('/api/users', userRoutes);
  app.use('/api/plugins', pluginRoutes);
  app.use('/api/sites', siteRoutes);
  app.use('/api/export', exportRoutes);
  app.use('/api/menus', menuRoutes);
  app.use('/api/media', mediaRoutes);
  app.use('/api/db', dbToolRoutes);
  app.use('/api/security', securityRoutes);
  app.use('/api/roles', roleRoutes);
  server = app.listen(0);
  await new Promise(r => server.on('listening', r));
  base = 'http://127.0.0.1:' + server.address().port + '/api';
});

afterAll(() => {
  server?.close();
  for (const s of ['', '-wal', '-shm']) { try { fs.unlinkSync(DB_FILE + s); } catch {} }
});

describe('capability-gated admin areas', () => {
  it('still refuses roles that do not hold the capability', async () => {
    expect((await fetch(base + '/users', { headers: token('e1', 'editor') })).status).toBe(403);
    expect((await fetch(base + '/plugins', { headers: token('e1', 'editor') })).status).toBe(403);
    // The site LIST stays open to editors (the post editor's site dropdown needs
    // it) — the writes are what the capability gates.
    expect((await fetch(base + '/sites', { method: 'POST', headers: token('e1', 'editor'), body: '{}' })).status).toBe(403);
    expect((await fetch(base + '/export/export', { headers: token('e1', 'editor') })).status).toBe(403);
  });

  it('lets a custom role in through its capability', async () => {
    expect((await fetch(base + '/plugins', { headers: token('o1', 'ops') })).status).toBe(200);
    // ...and only that area
    expect((await fetch(base + '/users', { headers: token('o1', 'ops') })).status).toBe(403);
    expect((await fetch(base + '/sites', { method: 'POST', headers: token('o1', 'ops'), body: '{}' })).status).toBe(403);
  });

  it('ships an editor default that covers comments, forms and the dashboard', () => {
    // These are the capabilities the sparse seed was missing; without them an
    // editor could not moderate comments or open Forms/dashboard at all.
    const editor = BUILTIN_ROLES.find(r => r.slug === 'editor')!.capabilities;
    for (const cap of ['moderate_comments', 'manage_forms', 'manage_options', 'edit_others_posts', 'ai_use']) {
      expect(editor).toContain(cap);
    }
    // The last role-slug guards moved to capabilities, so the editor default has
    // to carry the keys those screens now check (Security/broken links were
    // manage_options before, the site dropdown was role-gated).
    for (const cap of ['manage_security', 'view_sites']) {
      expect(editor).toContain(cap);
    }
    // Nobody but admin may hold the superuser capability by default.
    for (const role of BUILTIN_ROLES) {
      if (role.slug === 'admin') continue;
      expect(role.capabilities).not.toContain('manage_system');
    }
  });

  it('tops up a stale built-in role with the missing defaults only', () => {
    // Simulate an install seeded long ago: an editor with a short list, plus a
    // capability an administrator removed on purpose.
    db.prepare("UPDATE Role SET capabilities = ? WHERE slug = 'editor'").run(JSON.stringify(['edit_posts', 'publish_posts']));
    const changed = alignBuiltinRoleCapabilities();
    const editor = changed.find(c => c.slug === 'editor');
    expect(editor).toBeTruthy();
    expect(editor!.added).toContain('moderate_comments');
    expect(editor!.added).toContain('manage_options');

    const caps = JSON.parse((db.prepare("SELECT capabilities FROM Role WHERE slug = 'editor'").get() as any).capabilities);
    expect(caps).toContain('moderate_comments');
    expect(caps).toContain('edit_posts');           // existing entries kept
    expect(caps).not.toContain('manage_roles');     // nothing invented

    // idempotent, and custom roles are left alone
    const again = alignBuiltinRoleCapabilities();
    expect(again.find(c => c.slug === 'editor')).toBeUndefined();
    const custom = JSON.parse((db.prepare("SELECT capabilities FROM Role WHERE slug = 'ops'").get() as any).capabilities);
    expect(custom).toEqual(['manage_plugins']);
    invalidateRoleCache();
  });

  it('keeps the access editors already had (menus, media) working', async () => {
    // Menus were role-gated; the editor role now carries manage_menus so the
    // capability route does not lock out the people who could already do it.
    const list = await fetch(base + '/menus', { headers: token('e1', 'editor') });
    expect(list.status).toBe(200);
    // An author never had menu access and still does not.
    expect((await fetch(base + '/menus', { headers: token('au1', 'author') })).status).toBe(403);
    // Media: authors may upload (upload_files) but not edit metadata.
    expect((await fetch(base + '/media', { headers: token('au1', 'author') })).status).toBe(200);
    expect((await fetch(base + '/media/some-id', { method: 'PUT', headers: token('au1', 'author'), body: '{}' })).status).toBe(403);
    expect((await fetch(base + '/media/some-id', { method: 'PUT', headers: token('e1', 'editor'), body: '{}' })).status).toBe(404);
  });

  it('keeps admins unrestricted', async () => {
    expect((await fetch(base + '/users', { headers: token('a1', 'admin') })).status).toBe(200);
    expect((await fetch(base + '/sites', { headers: token('a1', 'admin') })).status).toBe(200);
    // admin clears the capability gate (the 400 is just a missing body)
    expect((await fetch(base + '/sites', { method: 'POST', headers: token('a1', 'admin'), body: '{}' })).status).toBe(400);
  });
});

// The last of the role-slug route guards (`authorize('admin')`) became the
// `manage_system` capability, so the superuser areas follow the Roles page too.
describe('superuser areas follow manage_system', () => {
  it('lets a role granted the capability in, and only through it', async () => {
    expect((await fetch(base + '/db/status', { headers: token('s1', 'sysop') })).status).toBe(200);
    // ...and only that area: the capability is not a skeleton key for the others.
    expect((await fetch(base + '/users', { headers: token('s1', 'sysop') })).status).toBe(403);
    expect((await fetch(base + '/plugins', { headers: token('s1', 'sysop') })).status).toBe(403);
  });

  it('still refuses an editor, who holds manage_options', async () => {
    // This is the whole point of a dedicated key: manage_options is held by the
    // editor role, so reusing it would hand editors the database tools.
    expect((await fetch(base + '/db/status', { headers: token('e1', 'editor') })).status).toBe(403);
    expect((await fetch(base + '/security/audit', { headers: token('e1', 'editor') })).status).toBe(200);
  });

  it('keeps editors on the site list (view_sites) but not on site management', async () => {
    expect((await fetch(base + '/sites', { headers: token('e1', 'editor') })).status).toBe(200);
    // An author never had the list and still does not.
    expect((await fetch(base + '/sites', { headers: token('au1', 'author') })).status).toBe(403);
    expect((await fetch(base + '/security/audit', { headers: token('au1', 'author') })).status).toBe(403);
  });
});

// The point of the whole exercise: saving a role on the Roles page must change
// what its users can do on the very next request, with no reload or re-login.
describe('editing a role takes effect immediately', () => {
  it('revokes and re-grants access without a new session', async () => {
    const asAdmin = token('a1', 'admin');
    // 'ops' starts with manage_plugins only.
    expect((await fetch(base + '/plugins', { headers: token('o1', 'ops') })).status).toBe(200);
    expect((await fetch(base + '/media', { headers: token('o1', 'ops') })).status).toBe(403);

    // Grant upload_files through the Roles endpoint.
    const grant = await fetch(base + '/roles/ops', {
      method: 'PUT', headers: asAdmin,
      body: JSON.stringify({ capabilities: ['manage_plugins', 'upload_files'] }),
    });
    expect(grant.status).toBe(200);
    // Same token, next request: in.
    expect((await fetch(base + '/media', { headers: token('o1', 'ops') })).status).toBe(200);

    // Take it away again.
    const revoke = await fetch(base + '/roles/ops', {
      method: 'PUT', headers: asAdmin,
      body: JSON.stringify({ capabilities: ['manage_plugins'] }),
    });
    expect(revoke.status).toBe(200);
    expect((await fetch(base + '/media', { headers: token('o1', 'ops') })).status).toBe(403);
  });

  it('cannot be used to hand out manage_system by a non-superuser', async () => {
    // 'ops' holds manage_roles? No — it holds manage_plugins, so it cannot even
    // reach the Roles endpoint. A role WITH manage_roles still cannot grant a
    // capability it does not itself hold (see authzBoundaries.test.ts), which is
    // what keeps the superuser key out of reach.
    expect((await fetch(base + '/roles', { headers: token('o1', 'ops') })).status).toBe(403);
  });
});

// A capability the Roles page offers but no route reads is a checkbox that lies.
// `edit_theme_options` and `manage_widgets` were exactly that; this keeps the
// catalog honest as new keys are added.
describe('every catalogued capability is enforced somewhere', () => {
  const ids = CAPABILITY_CATALOG.flatMap(g => g.caps.map(c => c.id));

  function sourceFiles(dir: string): string[] {
    return fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) return sourceFiles(full);
      return entry.name.endsWith('.ts') ? [full] : [];
    });
  }

  it('is read by a requireCap or userCan check', () => {
    const srcDir = path.join(__dirname, '..', 'src');
    const text = sourceFiles(srcDir).map(f => fs.readFileSync(f, 'utf8')).join('\n');
    const unenforced = ids.filter(id => !new RegExp(`(requireCap|userCan)\\([^)]*'${id}'`).test(text));
    expect(unenforced).toEqual([]);
  });

  it('lists no duplicate ids', () => {
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('sends ids and group keys, not hardcoded labels', async () => {
    // The admin translates them (`cap <id>` / `cap group <key>`) so the Roles
    // page follows the language toggle; shipping a Chinese label here would
    // bypass the dictionary again.
    const r = await fetch(base + '/roles', { headers: token('a1', 'admin') });
    const body = await r.json();
    expect(body.catalog.map((g: any) => g.group)).toEqual(['content', 'media', 'appearance', 'system', 'ai']);
    for (const group of body.catalog) {
      for (const cap of group.caps) {
        expect(typeof cap.id).toBe('string');
        expect(cap.label).toBeUndefined();
      }
    }
  });

  it('migration 17 tops up a stale editor row add-only', () => {
    // Exercise the migration body directly: an install seeded before the route
    // guards moved has an editor row without the two new keys.
    db.prepare("UPDATE Role SET capabilities = ? WHERE slug = 'editor'").run(JSON.stringify(['edit_posts', 'manage_options']));
    const added = addRoleCapabilities('editor', ['manage_security', 'view_sites']);
    expect(added).toEqual(['manage_security', 'view_sites']);
    const caps = JSON.parse((db.prepare("SELECT capabilities FROM Role WHERE slug = 'editor'").get() as any).capabilities);
    expect(caps).toContain('manage_security');
    expect(caps).toContain('view_sites');
    expect(caps).toContain('edit_posts');        // existing entries kept
    expect(caps).not.toContain('manage_roles');  // nothing else invented
    // Idempotent, and a '*' row is left alone.
    expect(addRoleCapabilities('editor', ['manage_security', 'view_sites'])).toEqual([]);
    // Restore the shipped default for any test declared after this one.
    db.prepare("UPDATE Role SET capabilities = ? WHERE slug = 'editor'")
      .run(JSON.stringify(BUILTIN_ROLES.find(r => r.slug === 'editor')!.capabilities));
    invalidateRoleCache();
  });
});
