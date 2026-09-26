import React, { useEffect, useState } from 'react';
import { ClipboardCheck, Check, X, RefreshCw, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../lib/api';
import { t, getLang } from '../lib/i18n';
import { useToast } from '../lib/toast';
import { dialog } from '../lib/dialog';

// The review queue: everything waiting on `review_posts`, in one place.
//
// Review used to exist only as a status filter on the Posts list, which is fine
// when you know to look there and useless as a queue: a contributor's submission
// sat in the same table as every draft and nothing said "these are waiting for
// you". Approving publishes; rejecting sends it back with a reason and tells the
// author in the app and by email (see routes/posts.ts).
export default function ReviewQueue() {
  const toast = useToast();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState('');

  useEffect(() => { load(); }, []);

  function load() {
    setLoading(true);
    api.get('/posts/admin?status=pending&limit=50')
      .then((r) => setPosts(r.data.posts || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }

  async function review(post: any, action: 'approve' | 'reject') {
    let reason = '';
    if (action === 'reject') {
      const input = await dialog.prompt({ message: t('reject reason hint', getLang()) });
      // Cancelled: leave the item in the queue rather than rejecting it silently.
      if (input === null || input === undefined) return;
      reason = input;
    }
    setBusy(post.id);
    try {
      await api.post('/posts/' + post.id + '/review', { action, reason });
      toast.toast(action === 'approve' ? t('post approved', getLang()) : t('post rejected', getLang()));
      setPosts((list) => list.filter((p) => p.id !== post.id));
    } catch (e: any) { toast.toast(e.response?.data?.error || t('review failed', getLang()), 'error'); }
    finally { setBusy(''); }
  }

  return React.createElement('div', null,
    React.createElement('div', { className: 'flex items-center justify-between mb-6' },
      React.createElement('h2', { className: 'text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2' },
        React.createElement(ClipboardCheck, { size: 22, className: 'text-primary-500' }), t('review queue', getLang())),
      React.createElement('button', { onClick: load, className: 'btn-secondary text-sm' }, React.createElement(RefreshCw, { size: 14 }), t('refresh', getLang()))),

    React.createElement('p', { className: 'text-xs text-gray-500 dark:text-gray-400 mb-4' }, t('review queue hint', getLang())),

    React.createElement('div', { className: 'card overflow-hidden' },
      loading && posts.length === 0
        ? React.createElement('p', { className: 'text-sm text-gray-400 p-8 text-center' }, t('loading', getLang()) + '…')
        : posts.length === 0
          ? React.createElement('p', { className: 'text-sm text-gray-400 p-8 text-center' }, t('nothing waiting for review', getLang()))
          : posts.map((post: any) =>
              React.createElement('div', { key: post.id, className: 'flex items-start gap-3 px-4 py-3 border-b border-gray-50 dark:border-gray-800 last:border-0' },
                React.createElement('div', { className: 'flex-1 min-w-0' },
                  React.createElement('p', { className: 'text-sm font-medium text-gray-800 dark:text-gray-100 truncate' }, post.title || t('(no title)', getLang())),
                  React.createElement('p', { className: 'text-xs text-gray-400 mt-0.5' },
                    (post.author?.username || post.authorId || '—') + ' · ' +
                    (post.createdAt ? new Date(post.createdAt).toLocaleString() : '') +
                    (post.excerpt ? ' · ' + String(post.excerpt).slice(0, 80) : '')),
                  React.createElement('div', { className: 'flex items-center gap-3 mt-1' },
                    React.createElement(Link, { to: '/posts/' + post.id + '/edit', className: 'text-xs text-primary-600 hover:text-primary-700 inline-flex items-center gap-1' },
                      t('read and edit', getLang()), React.createElement(ExternalLink, { size: 11 })))),
                React.createElement('div', { className: 'flex items-center gap-2 shrink-0' },
                  React.createElement('button', { onClick: () => review(post, 'approve'), disabled: busy === post.id, className: 'btn-primary text-xs disabled:opacity-40' },
                    React.createElement(Check, { size: 13 }), t('approve', getLang())),
                  React.createElement('button', { onClick: () => review(post, 'reject'), disabled: busy === post.id, className: 'btn-secondary text-xs disabled:opacity-40' },
                    React.createElement(X, { size: 13 }), t('reject', getLang()))))))
  );
}
