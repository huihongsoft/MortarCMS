import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/api';
import { t } from '../lib/i18n';

export default function RelatedPosts({ postId, slug }: { postId?: string; slug?: string }) {
  const [posts, setPosts] = useState<any[]>([]);
  useEffect(() => {
    if (!postId) return;
    api.get('/posts/' + postId + '/related').then(r => setPosts(r.data)).catch(() => {});
  }, [postId]);

  if (posts.length === 0) return React.createElement('p', { className: 'text-sm text-gray-400' }, t('no related posts'));

  return React.createElement('div', { className: 'grid grid-cols-1 sm:grid-cols-2 gap-4' },
    posts.map((p: any) => React.createElement(Link, { key: p.id, to: '/post/' + p.slug, className: 'group block p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:shadow-sm transition-all' },
      React.createElement('h4', { className: 'text-sm font-medium text-gray-900 group-hover:text-primary-600 mb-1' }, p.title),
      React.createElement('p', { className: 'text-xs text-gray-500 line-clamp-2' }, p.excerpt || '')
    ))
  );
}
