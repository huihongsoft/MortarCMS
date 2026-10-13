import { userCan } from '../middleware/auth';
import { userMayAccessSite } from './userSites';

// Who may act on one post row.
//
// Shared rather than duplicated: the bulk endpoints, the CMS block preview and
// anything else that acts on ids the client chose have to apply the same two
// rules the single-row routes apply — the row must be inside a site the caller
// is assigned to, and a caller who cannot edit other people's posts is limited
// to their own. A second copy of this drifts.
export function mayTouchPost(
  user: { userId: string; role: string },
  row: { siteId?: string | null; authorId?: string } | undefined,
): boolean {
  if (!row) return false;
  if (!userMayAccessSite(user.userId, user.role, row.siteId || undefined)) return false;
  if (!userCan(user, 'edit_others_posts') && row.authorId !== user.userId) return false;
  return true;
}
