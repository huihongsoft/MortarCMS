import { addFilter } from '../../src/utils/hooks';

// Signature footer appended to post content
export function register() {
  addFilter('post_content', (html: string, post: any) => {
    if (!html) return html;
    const date = post.publishedAt || post.createdAt || '';
    const label = date ? new Date(date).toLocaleDateString() : '';
    // Usernames are user-controllable — escape before splicing into HTML
    const esc = (v: any) => String(v ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    const author = esc(post.author?.username || 'admin');
    return html + '<hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;"><p style="color:#9ca3af;font-size:12px;">\u2014 Published by <strong>' + author + '</strong>' + (label ? ' on ' + label : '') + ' (post-footer plugin)</p>';
  }, 10, 'post-footer');
}
