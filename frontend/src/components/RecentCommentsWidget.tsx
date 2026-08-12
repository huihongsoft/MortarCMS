import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare } from 'lucide-react';
import api from '../lib/api';
import { t } from '../lib/i18n';

// Recent comments across the site (WordPress-style widget)
export default function RecentCommentsWidget() {
  const [comments, setComments] = useState<any[]>([]);
  useEffect(() => { api.get('/comments/recent?limit=5').then(r => setComments(r.data || [])).catch(() => {}); }, []);
  if (comments.length === 0) return null;
  return React.createElement('div', { className: 'rounded-lg border border-gray-200 p-4' },
    React.createElement('h3', { className: 'text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wider flex items-center gap-1.5' }, React.createElement(MessageSquare, { size: 14, className: 'text-gray-400' }), t('recent comments')),
    React.createElement('ul', { className: 'space-y-2' },
      comments.map((c: any) => React.createElement('li', { key: c.id, className: 'text-xs text-gray-600 leading-snug' },
        React.createElement('span', { className: 'font-medium text-gray-800' }, c.author || t('anonymous')),
        ' ' + t('on') + ' ',
        React.createElement(Link, { to: '/post/' + c.postSlug + '#comments', className: 'text-primary-600 hover:underline' }, c.postTitle),
        React.createElement('p', { className: 'text-gray-500 mt-0.5 line-clamp-2' }, c.content)
      ))
    )
  );
}
