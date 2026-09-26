import db, { cuid } from './db';
import { logger } from './logger';

// In-app notifications: the bell, the AI assistant's task reports, and the
// editorial workflow (a submission was approved or sent back).
//
// One table since migration 24 — the review flow used to write into the AI
// assistant's table, which is why an author's "your post was approved" turned up
// in the assistant's inbox.

export type NotificationKind = 'ai' | 'ai_task' | 'review' | 'system';

export interface NotifyInput {
  userId: string;
  kind?: NotificationKind;
  message: string;
  /** Admin-relative path to open from the notification, e.g. '/posts/123/edit'. */
  link?: string;
  taskId?: string;
}

export function notify(input: NotifyInput): string | null {
  try {
    if (!input?.userId || !input.message) return null;
    const id = cuid();
    db.prepare('INSERT INTO Notification (id, userId, kind, message, link, taskId, read, createdAt) VALUES (?, ?, ?, ?, ?, ?, 0, ?)')
      .run(id, input.userId, input.kind || 'system', String(input.message).slice(0, 500), input.link || '', input.taskId || null, new Date().toISOString());
    return id;
  } catch (err: any) {
    // A notification is never worth failing the action that produced it.
    logger.warn({ err: err?.message, kind: input?.kind }, 'could not write a notification');
    return null;
  }
}

export interface NotificationRow {
  id: string;
  kind: string;
  message: string;
  link: string;
  read: number;
  taskId: string | null;
  createdAt: string;
}

export function listFor(userId: string, limit = 20): NotificationRow[] {
  try {
    return db.prepare('SELECT id, kind, message, link, read, taskId, createdAt FROM Notification WHERE userId = ? ORDER BY createdAt DESC, id DESC LIMIT ?')
      .all(userId, Math.min(Math.max(1, limit), 100)) as NotificationRow[];
  } catch { return []; }
}

export function unreadCount(userId: string): number {
  try {
    return (db.prepare('SELECT COUNT(*) as c FROM Notification WHERE userId = ? AND read = 0').get(userId) as any)?.c || 0;
  } catch { return 0; }
}

/**
 * Mark one notification read. Scoped to the owner: an id is guessable enough that
 * marking someone else's is not a thing a caller should be able to do.
 */
export function markRead(userId: string, id: string): boolean {
  try {
    return db.prepare('UPDATE Notification SET read = 1 WHERE id = ? AND userId = ?').run(id, userId).changes > 0;
  } catch { return false; }
}

export function markAllRead(userId: string): number {
  try {
    return db.prepare('UPDATE Notification SET read = 1 WHERE userId = ? AND read = 0').run(userId).changes || 0;
  } catch { return 0; }
}

export function removeForUser(userId: string): void {
  try { db.prepare('DELETE FROM Notification WHERE userId = ?').run(userId); } catch { /* best effort */ }
}

export function removeForTask(taskId: string): void {
  try { db.prepare('DELETE FROM Notification WHERE taskId = ?').run(taskId); } catch { /* best effort */ }
}

/** Drop read notifications older than the retention window. Returns how many went. */
export function pruneRead(cutoffIso: string): number {
  try { return db.prepare('DELETE FROM Notification WHERE read = 1 AND createdAt < ?').run(cutoffIso).changes || 0; } catch { return 0; }
}
