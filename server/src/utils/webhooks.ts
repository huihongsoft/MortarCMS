// Outbound webhook system: registers listeners on core content hooks and
// POSTs JSON payloads to configured endpoints. Every delivery is HMAC-SHA256
// signed (X-Webhook-Signature header) and SSRF-guarded (private/loopback
// hosts are refused, redirects re-checked per hop). Deliveries run in the
// background so hook triggers never block the request that fired them.
import crypto from 'crypto';
import db from './db';
import { addAction } from './hooks';
import { fetchUrlGuarded } from './ssrf';

// Events admins can subscribe to. Kept in sync with the KNOWN_ACTIONS call
// sites: posts.ts, comments.ts, auth.ts, scheduler.ts, media.ts.
export const WEBHOOK_EVENTS = [
  'post_published',
  'post_created',
  'post_updated',
  'delete_post',
  'comment_added',
  'comment_approved',
  'comment_spam',
  'delete_comment',
  'user_register',
  'media_uploaded',
];

// Hook arg shapes (documented for webhook consumers):
//   post_*:        (postId)
//   comment_*:     (commentId)
//   user_register: (userId, role)
//   media_uploaded:(mediaId)
function eventData(event: string, args: any[]): any {
  const id = args[0];
  switch (event) {
    case 'post_published':
    case 'post_created':
    case 'post_updated':
    case 'delete_post': {
      const p = db.prepare('SELECT id, title, slug, status, type, excerpt FROM Post WHERE id = ?').get(id) as any;
      return p ? { postId: p.id, title: p.title, slug: p.slug, status: p.status, type: p.type, excerpt: p.excerpt || '' } : { postId: id };
    }
    case 'comment_added':
    case 'comment_approved':
    case 'comment_spam':
    case 'delete_comment': {
      const c = db.prepare('SELECT id, content, author, email, status, postId, parentId FROM Comment WHERE id = ?').get(id) as any;
      return c ? { commentId: c.id, content: c.content, author: c.author, email: c.email, status: c.status, postId: c.postId, parentId: c.parentId } : { commentId: id };
    }
    case 'user_register':
      return { userId: id, role: args[1] || '' };
    case 'media_uploaded': {
      const m = db.prepare('SELECT id, filename, original, mimeType, size, url FROM Media WHERE id = ?').get(id) as any;
      return m ? { mediaId: m.id, filename: m.original || m.filename, mimeType: m.mimeType, size: m.size, url: m.url } : { mediaId: id };
    }
    default:
      return { id };
  }
}

// Deliver one event to every active webhook subscribed to it. Failures are
// recorded on the row (lastStatus/lastError) and never thrown — a broken
// endpoint must not break the site.
export async function deliverWebhooks(event: string, args: any[]): Promise<void> {
  let rows: any[];
  try {
    rows = db.prepare('SELECT * FROM Webhook WHERE active = 1').all() as any[];
  } catch { return; }
  const matching = rows.filter((w: any) => {
    try { return (JSON.parse(w.events || '[]') as string[]).includes(event); } catch { return false; }
  });
  for (const w of matching) {
    const payload = JSON.stringify({ event, data: eventData(event, args), sentAt: new Date().toISOString() });
    const sig = crypto.createHmac('sha256', w.secret || '').update(payload).digest('hex');
    const res = await fetchUrlGuarded(w.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mortar-CMS-Webhook/1.0',
        'X-Webhook-Signature': 'sha256=' + sig,
      },
      body: payload,
      timeoutMs: 5000,
    });
    const status = res ? res.status : 0;
    const error = res ? (res.status >= 200 && res.status < 300 ? '' : 'HTTP ' + res.status) : 'Delivery failed (SSRF-blocked, unreachable, or timed out)';
    try {
      db.prepare('UPDATE Webhook SET lastStatus = ?, lastError = ?, lastSentAt = ? WHERE id = ?')
        .run(status === 0 ? null : status, error, new Date().toISOString(), w.id);
    } catch {}
  }
}

// Test delivery: fires a synthetic 'test' event (payload is always static so
// the receiving side can verify signature + parsing without real content).
export async function deliverTestWebhook(id: string): Promise<{ ok: boolean; status: number | null; error: string }> {
  const w = db.prepare('SELECT * FROM Webhook WHERE id = ?').get(id) as any;
  if (!w) return { ok: false, status: null, error: 'Unknown webhook' };
  const payload = JSON.stringify({ event: 'test', data: { message: 'Mortar webhook test' }, sentAt: new Date().toISOString() });
  const sig = crypto.createHmac('sha256', w.secret || '').update(payload).digest('hex');
  const res = await fetchUrlGuarded(w.url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'Mortar-CMS-Webhook/1.0',
      'X-Webhook-Signature': 'sha256=' + sig,
    },
    body: payload,
    timeoutMs: 5000,
  });
  const status = res ? res.status : 0;
  const error = res ? (res.status >= 200 && res.status < 300 ? '' : 'HTTP ' + res.status) : 'Delivery failed (SSRF-blocked, unreachable, or timed out)';
  try {
    db.prepare('UPDATE Webhook SET lastStatus = ?, lastError = ?, lastSentAt = ? WHERE id = ?')
      .run(status === 0 ? null : status, error, new Date().toISOString(), id);
  } catch {}
  return { ok: !error, status: status === 0 ? null : status, error };
}

// Fire-and-forget delivery: hook listeners are synchronous, so spawn the
// async work without awaiting it (errors are swallowed inside deliverWebhooks).
function notify(event: string, args: any[]): void {
  deliverWebhooks(event, args).catch(() => {});
}

// Register listeners for every supported event. Called once at startup,
// after plugins/theme bootstrap so webhook deliveries observe the same
// event stream as everything else.
export function initWebhooks(): void {
  for (const event of WEBHOOK_EVENTS) {
    addAction(event, (...args: any[]) => notify(event, args), 30, 'webhooks');
  }
}
