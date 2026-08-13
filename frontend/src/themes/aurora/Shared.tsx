import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, User, Folder } from 'lucide-react';
import { cdnUrl } from '../../lib/cdn';
import { timeAgo, readingTime } from '../../lib/time';
import { t } from '../../lib/i18n';

function useTimeTick(): number {
  const [tick, setTick] = React.useState(Date.now());
  React.useEffect(() => {
    const iv = setInterval(() => setTick(Date.now()), 60000);
    return () => clearInterval(iv);
  }, []);
  return tick;
}

// Aurora archive list (shared by category/tag/archive pages): centered,
// hairline separators, editorial spacing
export function AuroraList(props: any) {
  useTimeTick();
  const { settings, posts, page, total, setPage, loadError } = props;
  const perPage = parseInt(settings.posts_per_page || '10');

  if (loadError) return React.createElement('div', { className: 'text-center py-24' },
    React.createElement('h3', { className: 'text-lg font-semibold text-gray-900 mb-2' }, t('failed to load posts', settings)),
    React.createElement('p', { className: 'text-sm text-gray-500' }, t('please try again later', settings)));
  if (posts.length === 0) return React.createElement('div', { className: 'text-center py-24' },
    React.createElement('h3', { className: 'text-lg font-semibold text-gray-900 mb-2' }, t('no posts yet', settings)));

  return React.createElement('div', null,
    posts.map((p: any, idx: number) => React.createElement('article', { key: p.id, className: 'pb-12 ' + (idx > 0 ? 'pt-12 border-t border-gray-900/[0.06]' : '') },
      p.featured && React.createElement(Link, { to: '/post/' + p.slug, className: 'block overflow-hidden rounded-2xl mb-8' },
        React.createElement('img', { src: cdnUrl(p.featured, settings), alt: p.title, className: 'w-full aspect-[16/9] object-cover transition-transform duration-500 hover:scale-[1.02]', loading: 'lazy', decoding: 'async' })),
      React.createElement(Link, { to: '/post/' + p.slug },
        React.createElement('h2', { className: 'text-2xl font-bold tracking-tight text-gray-900 hover:text-indigo-600 transition-colors mb-4' }, p.title)),
      React.createElement('div', { className: 'flex items-center gap-4 text-xs text-gray-500 mb-4' },
        React.createElement('span', { className: 'flex items-center gap-1.5' }, React.createElement(Calendar, { size: 13 }), timeAgo(p.publishedAt || p.createdAt)),
        React.createElement('span', { className: 'flex items-center gap-1.5' }, React.createElement(User, { size: 13 }), React.createElement(Link, { to: '/author/' + (p.author?.username || ''), className: 'hover:text-gray-900 transition-colors' }, p.author?.username)),
        p.categories?.[0] && React.createElement('span', { className: 'flex items-center gap-1.5' }, React.createElement(Folder, { size: 13 }), p.categories[0].name)
      ),
      p.excerpt && React.createElement('p', { className: 'text-gray-600 leading-relaxed' }, p.excerpt),
      React.createElement('div', { className: 'mt-5' }, React.createElement(Link, { to: '/post/' + p.slug, className: 'inline-flex items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors' }, t('read more', settings), React.createElement('span', null, '\u2192'))),
    )),
    total > perPage && React.createElement('div', { className: 'flex items-center justify-center gap-4 pt-12' },
      React.createElement('button', { onClick: () => setPage(Math.max(1, page - 1)), disabled: page === 1, className: 'px-5 py-2.5 rounded-full border border-gray-200 text-sm hover:border-gray-400 disabled:opacity-40 transition-colors' }, '\u2190 ' + t('previous', settings)),
      React.createElement('span', { className: 'text-sm text-gray-500' }, t('page', settings) + ' ' + page + ' ' + t('of', settings) + ' ' + Math.ceil(total / perPage)),
      React.createElement('button', { onClick: () => setPage(page + 1), disabled: page * perPage >= total, className: 'px-5 py-2.5 rounded-full border border-gray-200 text-sm hover:border-gray-400 disabled:opacity-40 transition-colors' }, t('next', settings) + ' \u2192'),
    ),
  );
}

// Page header with a small uppercase kicker (category/tag/archive name)
export function AuroraPageHeader(props: any) {
  const { kicker, title } = props;
  return React.createElement('div', { className: 'py-16 text-center' },
    kicker && React.createElement('p', { className: 'text-xs font-medium uppercase tracking-[0.2em] text-indigo-600 mb-3' }, kicker),
    React.createElement('h1', { className: 'text-4xl sm:text-5xl font-bold tracking-tight text-gray-900 capitalize' }, title),
  );
}
