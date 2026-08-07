import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, User } from 'lucide-react';
import { cdnUrl } from '../../lib/cdn';
import { timeAgo } from '../../lib/time';
import { t } from '../../lib/i18n';

// Twenty Nineteen homepage: bold headlines, single centered column, no sidebar
export default function TN19HomeLayout(props: any) {
  const { settings, posts, total, page, setPage, loadError, catSlug, isTagPage } = props;
  const heroHeading = settings.theme_hero_heading || '';

  return React.createElement('div', null,
    !catSlug && heroHeading && React.createElement('div', { className: 'max-w-4xl mx-auto px-4 pt-16' },
      React.createElement('h2', { className: 'text-3xl font-extrabold tracking-tight text-gray-900' }, heroHeading),
      React.createElement('div', { className: 'w-16 h-1 bg-gray-900 mt-4' }),
    ),
    catSlug && React.createElement('div', { className: 'max-w-4xl mx-auto px-4 pt-12' },
      React.createElement('h1', { className: 'text-3xl font-extrabold tracking-tight text-gray-900 capitalize' }, (isTagPage ? t('tag', settings) + ': ' : '') + (catSlug || '').replace(/-/g, ' ')),
      React.createElement('div', { className: 'w-16 h-1 bg-gray-900 mt-4' }),
    ),
    React.createElement('div', { className: 'max-w-4xl mx-auto px-4 py-12' },
      posts.length === 0
        ? React.createElement('p', { className: 'text-gray-500 text-center py-16' }, loadError ? t('failed to load posts', settings) : t('no posts yet', settings))
        : React.createElement('div', { className: 'space-y-16' },
            posts.map((p: any) =>
              React.createElement('article', { key: p.id },
                p.featured && React.createElement(Link, { to: '/post/' + p.slug },
                  React.createElement('img', { src: cdnUrl(p.featured, settings), alt: p.title, className: 'w-full max-h-96 object-cover mb-8', loading: 'lazy' })),
                React.createElement('div', { className: 'flex items-center gap-4 text-xs uppercase tracking-widest text-gray-400 mb-4' },
                  React.createElement('span', { className: 'flex items-center gap-1' }, React.createElement(Calendar, { size: 12 }), timeAgo(p.publishedAt || p.createdAt)),
                  React.createElement('span', { className: 'flex items-center gap-1' }, React.createElement(User, { size: 12 }), p.author?.username),
                  p.categories?.[0] && React.createElement('span', { className: 'text-primary-600' }, p.categories[0].name),
                ),
                React.createElement(Link, { to: '/post/' + p.slug },
                  React.createElement('h2', { className: 'text-3xl font-extrabold tracking-tight text-gray-900 hover:text-gray-600 mb-4' }, p.title)),
                p.excerpt && React.createElement('p', { className: 'text-gray-600 leading-relaxed text-lg mb-6' }, p.excerpt),
                React.createElement(Link, { to: '/post/' + p.slug, className: 'text-sm font-bold uppercase tracking-widest text-primary-600 hover:text-primary-700' }, t('read more', settings), ' \u2192'),
              )
            )
          ),
      total > parseInt(settings.posts_per_page || '10') && React.createElement('div', { className: 'flex items-center justify-center gap-4 pt-16' },
        React.createElement('button', { onClick: () => setPage(Math.max(1, page - 1)), disabled: page === 1, className: 'px-4 py-2 text-sm uppercase tracking-widest hover:text-gray-600 disabled:opacity-40' }, '\u2190 ' + t('previous', settings)),
        React.createElement('span', { className: 'text-sm text-gray-400' }, t('page', settings) + ' ' + page + ' ' + t('of', settings) + ' ' + Math.ceil(total / parseInt(settings.posts_per_page || '10'))),
        React.createElement('button', { onClick: () => setPage(page + 1), disabled: page * parseInt(settings.posts_per_page || '10') >= total, className: 'px-4 py-2 text-sm uppercase tracking-widest hover:text-gray-600 disabled:opacity-40' }, t('next', settings) + ' \u2192'),
      )
    )
  );
}
