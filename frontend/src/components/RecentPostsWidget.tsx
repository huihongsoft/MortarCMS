import Widget from './Widget';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/api';
import { t } from '../lib/i18n';
import { postPath } from '../lib/permalink';

export default function RecentPostsWidget() {
  const [posts, setPosts] = useState<any[]>([]);
  useEffect(() => { api.get('/posts?limit=5').then(r => setPosts(r.data.posts || [])).catch(() => {}); }, []);
  if (posts.length === 0) return null;
  return React.createElement(Widget, { title: t('recent posts') },
    React.createElement('ul', { className: 'space-y-2' },
      posts.map((p: any) => React.createElement('li', { key: p.id },
        React.createElement(Link, { to: postPath(p.slug), className: 'text-sm text-gray-600 hover:text-primary-600 line-clamp-1' }, p.title)
      ))
    )
  );
}
