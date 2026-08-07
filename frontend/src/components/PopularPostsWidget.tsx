import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp } from 'lucide-react';
import api from '../lib/api';
import { t } from '../lib/i18n';

export default function PopularPostsWidget() {
  const [posts, setPosts] = useState<any[]>([]);

  useEffect(() => {
    api.get('/posts/popular?limit=5').then(r => setPosts(r.data || [])).catch(() => {});
  }, []);

  if (posts.length === 0) return null;

  return React.createElement('div', { className: 'rounded-lg border border-gray-200 p-4' },
    React.createElement('h3', { className: 'text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wider flex items-center gap-1.5' }, React.createElement(TrendingUp, { size: 14 }), t('popular posts')),
    React.createElement('ul', { className: 'space-y-2' },
      posts.map((p: any, i: number) =>
        React.createElement('li', { key: p.id, className: 'flex items-start gap-2' },
          React.createElement('span', { className: 'text-xs font-bold text-gray-300 mt-0.5 w-4' }, i + 1),
          React.createElement(Link, { to: '/post/' + p.slug, className: 'text-sm text-gray-600 hover:text-primary-600 line-clamp-1' }, p.title),
          p.views > 0 && React.createElement('span', { className: 'text-xs text-gray-400 ml-auto shrink-0' }, p.views + ' ' + t('views'))
        )
      )
    )
  );
}
