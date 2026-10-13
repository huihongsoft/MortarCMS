import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import fs from 'fs';
import db, { initDB } from '../src/utils/db';
import { executeTool } from '../src/utils/aiTools';

// A model can emit the same write_post more than once — a batch of identical
// calls in one round, a retried request, or the "regenerate" button replaying a
// turn. write_post used to INSERT unconditionally, so each replay piled up
// another same-title draft (uniqueSlug only hid it by suffixing -2, -3…). The
// tool is now idempotent: an existing draft by the same author in the same site
// is updated in place instead of duplicated.

const DB_FILE = process.env.MORTAR_DB_PATH || '/tmp/mortar-vitest-write-post-idem.db';

const setSetting = (key: string, value: string) =>
  db.prepare("INSERT INTO Setting (id, key, value) VALUES (?, ?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value").run(key, key, value);

const postCount = (title: string) => (db.prepare("SELECT COUNT(*) as c FROM Post WHERE title = ? AND type = 'post'").get(title) as any).c;
const revisionCount = (postId: string) => (db.prepare('SELECT COUNT(*) as c FROM Revision WHERE postId = ?').get(postId) as any).c;

initDB();
for (const [id, role] of [['iu', 'author'], ['iu2', 'author']] as const) {
  db.prepare("INSERT OR REPLACE INTO User (id, username, email, password, role, tokenVersion) VALUES (?, ?, ?, 'x', ?, 0)").run(id, id, id + '@example.dev', role);
}
setSetting('ai_tool_permissions', JSON.stringify({ author: ['write_post'] }));

afterAll(() => {
  for (const s of ['', '-wal', '-shm']) { try { fs.unlinkSync(DB_FILE + s); } catch {} }
});

beforeEach(() => {
  db.prepare('DELETE FROM Post').run();
  db.prepare('DELETE FROM Revision').run();
});

describe('write_post does not pile up same-title drafts', () => {
  const ctx = { userId: 'iu', role: 'author' };

  it('reuses (and updates) an existing draft with the same title instead of inserting again', async () => {
    const first = await executeTool('write_post', { title: '同名稿', content: '<p>v1</p>' }, ctx) as any;
    expect(first.error).toBeUndefined();
    expect(postCount('同名稿')).toBe(1);

    const second = await executeTool('write_post', { title: '同名稿', content: '<p>v2</p>' }, ctx) as any;
    expect(postCount('同名稿')).toBe(1);          // no second row
    expect(second.id).toBe(first.id);             // the same draft, updated
    const row = db.prepare('SELECT content FROM Post WHERE id = ?').get(first.id) as any;
    expect(row.content).toContain('v2');
    // the overwrite is recoverable, like update_post
    expect(revisionCount(first.id)).toBe(1);
  });

  it('is a no-op when the replay is byte-identical (no row, no revision)', async () => {
    const first = await executeTool('write_post', { title: '逐字相同', content: '<p>same</p>' }, ctx) as any;
    const again = await executeTool('write_post', { title: '逐字相同', content: '<p>same</p>' }, ctx) as any;
    expect(postCount('逐字相同')).toBe(1);
    expect(again.id).toBe(first.id);
    expect(revisionCount(first.id)).toBe(0);
  });

  it('still creates separate posts for a different title', async () => {
    await executeTool('write_post', { title: '甲', content: '<p>a</p>' }, ctx);
    await executeTool('write_post', { title: '乙', content: '<p>b</p>' }, ctx);
    expect(postCount('甲')).toBe(1);
    expect(postCount('乙')).toBe(1);
  });

  it('never merges into another author\'s draft', async () => {
    await executeTool('write_post', { title: '共享标题', content: '<p>mine</p>' }, ctx);
    await executeTool('write_post', { title: '共享标题', content: '<p>theirs</p>' }, { userId: 'iu2', role: 'author' });
    expect(postCount('共享标题')).toBe(2);
  });

  it('never merges across sites', async () => {
    await executeTool('write_post', { title: '跨站标题', content: '<p>a</p>' }, { userId: 'iu', role: 'author', siteId: 'site-a' });
    await executeTool('write_post', { title: '跨站标题', content: '<p>b</p>' }, { userId: 'iu', role: 'author', siteId: 'site-b' });
    expect(postCount('跨站标题')).toBe(2);
  });
});
