import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Clock, CheckCircle2, XCircle } from 'lucide-react';
import api from '../lib/api';
import { t } from '../lib/i18n';
import useSEO from '../hooks/useSEO';

interface MyPost { id: string; title: string; slug: string; status: string; createdAt: string }

const STATUS_STYLE: Record<string, { cls: string; icon: any }> = {
  pending: { cls: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300', icon: Clock },
  published: { cls: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300', icon: CheckCircle2 },
  draft: { cls: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400', icon: XCircle },
};

export default function MyPosts() {
  useSEO({ title: t('my submissions'), url: '/my-posts', noindex: true });
  const [loggedIn, setLoggedIn] = useState(!!localStorage.getItem('mortar_token'));
  const [posts, setPosts] = useState<MyPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!loggedIn) return;
    api.get('/posts/mine').then(r => { setPosts(r.data.posts || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [loggedIn]);

  if (!loggedIn) {
    return React.createElement('div', { className: 'max-w-md mx-auto px-4 py-16 text-center' },
      React.createElement('h1', { className: 'text-2xl font-bold text-gray-900 mb-4' }, t('my submissions')),
      React.createElement('p', { className: 'text-sm text-gray-500 mb-6' }, t('login to submit')),
      React.createElement(Link, { to: '/login', className: 'btn-primary inline-flex' }, t('sign in')));
  }

  return React.createElement('div', { className: 'max-w-2xl mx-auto px-4 py-12' },
    React.createElement('div', { className: 'flex items-center justify-between mb-8' },
      React.createElement('h1', { className: 'text-2xl font-bold text-gray-900' }, t('my submissions')),
      React.createElement(Link, { to: '/submit-post', className: 'btn-primary text-sm' }, React.createElement(FileText, { size: 14 }), t('submit a post'))),
    loading
      ? React.createElement('p', { className: 'text-sm text-gray-400' }, t('loading') + '…')
      : posts.length === 0
        ? React.createElement('div', { className: 'card p-10 text-center' },
            React.createElement('p', { className: 'text-sm text-gray-400' }, t('no submissions yet')))
        : React.createElement('div', { className: 'space-y-3' },
            posts.map(p => {
              const st = STATUS_STYLE[p.status] || STATUS_STYLE.draft;
              return React.createElement('div', { key: p.id, className: 'card p-4 flex items-center gap-3' },
                React.createElement('div', { className: 'flex-1 min-w-0' },
                  React.createElement('h3', { className: 'text-sm font-semibold text-gray-900 truncate' }, p.title),
                  React.createElement('p', { className: 'text-xs text-gray-400 mt-1' }, new Date(p.createdAt).toLocaleDateString())),
                React.createElement('span', { className: 'text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1 ' + st.cls },
                  React.createElement(st.icon, { size: 10 }), t(p.status === 'pending' ? 'pending review' : p.status)));
            })
          ),
  );
}
