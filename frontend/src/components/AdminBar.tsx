// WordPress-style admin bar: logged-in users see a slim top bar with quick
// links (edit current post, go to admin, view site). Rendered in normal flow
// so no layout compensation is needed. Hidden when not authenticated.
import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../lib/api';

const ADMIN_ROLES = ['admin', 'editor', 'author', 'contributor'];

export default function AdminBar() {
  const [user, setUser] = useState<any>(null);
  const [postId, setPostId] = useState<string | null>(null);
  const location = useLocation();
  const m = location.pathname.match(/^\/post\/([^/]+)/);
  const slug = m ? m[1] : null;

  useEffect(() => {
    api.get('/auth/me').then(r => setUser(r.data)).catch(() => setUser(null));
  }, []);

  useEffect(() => {
    if (!slug) { setPostId(null); return; }
    api.get('/posts/slug/' + slug).then(r => setPostId(r.data?.id || null)).catch(() => setPostId(null));
  }, [slug]);

  if (!user) return null;
  const isAdminish = ADMIN_ROLES.includes(user.role);
  return React.createElement('div', { className: 'bg-[#1d2327] text-white/90 text-xs flex items-center gap-4 px-4 py-1.5 sticky top-0 z-50' },
    React.createElement('a', { href: '/', className: 'flex items-center gap-1.5 font-semibold hover:text-white' }, '⚙️ ' + (user.site_title || '')),
    slug && postId && React.createElement('a', { href: '/admin/post/' + postId, className: 'hover:text-white' }, '✏️ ' + '编辑此文'),
    isAdminish && React.createElement('a', { href: '/admin/', className: 'hover:text-white' }, '🛠 后台管理'),
    React.createElement('span', { className: 'flex-1' }),
    React.createElement('a', { href: '/admin/profile', className: 'opacity-80 hover:opacity-100' }, '👤 ' + user.username)
  );
}
