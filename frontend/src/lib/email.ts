// Email notification helper (opens mailto)
export function notifyComment(postTitle: string, commentAuthor: string, adminEmail?: string): string {
  const to = adminEmail || 'admin@mortar.dev';
  const subject = 'New comment on: ' + postTitle;
  const body = 'A new comment was posted by ' + commentAuthor + ' on "' + postTitle + '".%0D%0A%0D%0APlease review it in the admin panel.';
  return 'mailto:' + to + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
}
