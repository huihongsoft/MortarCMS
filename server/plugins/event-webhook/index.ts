import { addAction } from '../../src/utils/hooks';
import db from '../../src/utils/db';
import crypto from 'crypto';

// Push site events to an external webhook (DingTalk group robot, enterprise
// WeChat, your own service, ...). Each event is POSTed as JSON:
//   { event: 'post_published', site: <site_url>, data: { ... } }
// When event_webhook_secret is set, an X-Signature header (HMAC-SHA256 hex of
// the body) is attached so receivers can verify authenticity.
//
// Config (Settings API):
//   event_webhook_url     = target URL (required to enable)
//   event_webhook_secret  = optional shared secret for the HMAC signature
//   event_webhook_events  = comma-separated: post_published,comment_added,user_register

function setting(key: string): string {
  try { return ((db.prepare('SELECT value FROM Setting WHERE key = ?').get(key) as any)?.value || '').toString(); } catch { return ''; }
}

function siteUrl(): string {
  return setting('site_url').replace(/\/$/, '');
}

function enabledEvents(): string[] {
  const raw = setting('event_webhook_events') || 'post_published,comment_added,user_register';
  return raw.split(',').map(e => e.trim()).filter(Boolean);
}

async function push(event: string, data: Record<string, unknown>): Promise<void> {
  try {
    const url = setting('event_webhook_url');
    if (!url || !enabledEvents().includes(event)) return;
    const body = JSON.stringify({ event, site: siteUrl(), data, at: new Date().toISOString() });
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    const secret = setting('event_webhook_secret');
    if (secret) headers['X-Signature'] = crypto.createHmac('sha256', secret).update(body).digest('hex');
    await fetch(url, { method: 'POST', headers, body, signal: AbortSignal.timeout(15000) });
  } catch { /* event push is best-effort */ }
}

export function register() {
  addAction('post_published', async (postId: string) => {
    const p = db.prepare('SELECT id, title, slug FROM Post WHERE id = ?').get(postId) as any;
    if (p) await push('post_published', { postId, title: p.title, url: siteUrl() + '/post/' + p.slug });
  }, 10, 'event-webhook');

  addAction('comment_added', async (commentId: string) => {
    const c = db.prepare('SELECT id, author, content, status FROM Comment WHERE id = ?').get(commentId) as any;
    if (c) await push('comment_added', { commentId, author: c.author, content: String(c.content || '').slice(0, 200), status: c.status });
  }, 10, 'event-webhook');

  addAction('user_register', async (userId: string) => {
    const u = db.prepare('SELECT id, username, role FROM User WHERE id = ?').get(userId) as any;
    if (u) await push('user_register', { userId, username: u.username, role: u.role });
  }, 10, 'event-webhook');
}
