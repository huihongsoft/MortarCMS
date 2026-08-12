import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Search } from 'lucide-react';
import { timeAgo } from '../../lib/time';
import { t } from '../../lib/i18n';

function highlight(text: string, q: string): any {
  if (!q || !text) return text;
  const parts = text.split(new RegExp('(' + q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'gi'));
  return parts.map((part: string, i: number) =>
    part.toLowerCase() === q.toLowerCase()
      ? React.createElement('mark', { key: i, className: 'bg-yellow-200 rounded px-0.5' }, part)
      : part
  );
}

// Default search results template
export default function SearchLayout(props: any) {
  const { query, posts, loading, error } = props;

  return React.createElement('div', { className: 'max-w-3xl mx-auto px-4 py-8' },
    React.createElement('h1', { className: 'text-2xl font-bold text-gray-900 mb-2' }, t('search results')),
    React.createElement('p', { className: 'text-sm text-gray-500 mb-6' }, query ? t('showing results for') + ' "' + query + '"' : t('enter a search term')),
    loading ? React.createElement('p', { className: 'text-gray-500' }, t('searching'))
    : error ? React.createElement('div', { className: 'text-center py-12' },
        React.createElement('h3', { className: 'text-lg font-semibold text-gray-900 mb-2' }, t('search failed')),
        React.createElement('p', { className: 'text-sm text-gray-500 mb-4' }, t('try again later')),
      )
    : posts.length === 0 ? React.createElement('div', { className: 'text-center py-12' },
        React.createElement(Search, { size: 48, className: 'mx-auto text-gray-300 mb-4' }),
        React.createElement('h3', { className: 'text-lg font-semibold text-gray-900 mb-2' }, t('no results for') + ' "' + query + '"'),
        React.createElement('p', { className: 'text-sm text-gray-500 mb-4' }, t('try different keywords')),
        React.createElement(Link, { to: '/', className: 'text-primary-600 text-sm' }, '\u2190 ' + t('browse all posts')),
      )
    : React.createElement('div', { className: 'space-y-6' },
        posts.map((p: any) => React.createElement('article', { key: p.id, className: 'pb-6 border-b border-gray-100 last:border-0' },
          React.createElement(Link, { to: '/post/' + p.slug }, React.createElement('h2', { className: 'text-lg font-bold text-gray-900 hover:text-primary-600 mb-2' }, highlight(p.title, query))),
          React.createElement('div', { className: 'flex items-center gap-3 text-xs text-gray-500 mb-2' },
            React.createElement('span', { className: 'flex items-center gap-1' }, React.createElement(Calendar, { size: 12 }), timeAgo(p.publishedAt || p.createdAt)),
            React.createElement('span', null, t('written by') + ' ' + (p.author?.username || 'Unknown'))
          ),
          p.excerpt && React.createElement('p', { className: 'text-sm text-gray-600' }, highlight(p.excerpt, query))
        ))
      )
  );
}
