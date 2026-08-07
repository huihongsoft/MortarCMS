import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, ArrowLeft } from 'lucide-react';
import { timeAgo } from '../../lib/time';
import { t } from '../../lib/i18n';

// Default author archive template
export default function AuthorLayout(props: any) {
  const { username, posts, loading } = props;

  return React.createElement('div', { className: 'max-w-3xl mx-auto px-4 py-8' },
    React.createElement(Link, { to: '/', className: 'inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6' }, React.createElement(ArrowLeft, { size: 14 }), t('back')),
    React.createElement('div', { className: 'flex items-center gap-3 mb-8' },
      React.createElement('div', { className: 'w-12 h-12 rounded-full bg-primary-600 flex items-center justify-center text-white text-lg font-bold' }, (username || '?')[0].toUpperCase()),
      React.createElement('div', null,
        React.createElement('h1', { className: 'text-2xl font-bold text-gray-900' }, username),
        React.createElement('p', { className: 'text-sm text-gray-500' }, posts.length + ' ' + t('posts'))
      )
    ),
    loading ? React.createElement('p', { className: 'text-gray-500' }, t('loading'))
    : posts.length === 0 ? React.createElement('p', { className: 'text-gray-500' }, t('no posts yet'))
    : React.createElement('div', { className: 'space-y-6' },
        posts.map((p: any) => React.createElement('article', { key: p.id, className: 'pb-6 border-b border-gray-100 last:border-0' },
          React.createElement(Link, { to: '/post/' + p.slug }, React.createElement('h2', { className: 'text-lg font-bold text-gray-900 hover:text-primary-600 mb-2' }, p.title)),
          React.createElement('div', { className: 'flex items-center gap-3 text-xs text-gray-500' },
            React.createElement('span', { className: 'flex items-center gap-1' }, React.createElement(Calendar, { size: 12 }), timeAgo(p.publishedAt || p.createdAt)),
            p.categories?.[0] && React.createElement('span', { className: 'capitalize' }, p.categories[0].name)
          ),
          p.excerpt && React.createElement('p', { className: 'text-sm text-gray-600 mt-2' }, p.excerpt)
        ))
      )
  );
}
