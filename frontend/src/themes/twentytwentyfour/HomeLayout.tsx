import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, User } from 'lucide-react';
import { cdnUrl } from '../../lib/cdn';
import { timeAgo } from '../../lib/time';
import { t } from '../../lib/i18n';

// WordPress Twenty Twenty-Four style homepage: hero + spacious card grid
export default function TTHomeLayout(props: any) {
  const { settings, posts, total, page, setPage, loadError, catSlug, isTagPage } = props;
  const showHero = (settings.theme_show_hero || '1') !== '0';
  const heroTitle = settings.theme_hero_title || '';

  return React.createElement('div', null,
    // Hero (TT4 style: big statement)
    showHero && !catSlug && React.createElement('section', { className: 'py-20 md:py-28 text-center px-6' },
      React.createElement('h1', { className: 'text-4xl md:text-6xl font-bold tracking-tight text-gray-900 max-w-3xl mx-auto leading-tight' },
        heroTitle || settings.site_title || 'Welcome'),
      settings.site_description && React.createElement('p', { className: 'text-lg text-gray-500 mt-6 max-w-2xl mx-auto' }, settings.site_description),
    ),
    catSlug && React.createElement('div', { className: 'py-14 text-center' },
      React.createElement('h1', { className: 'text-3xl font-bold tracking-tight text-gray-900 capitalize' }, (isTagPage ? t('tag', settings) + ': ' : '') + (catSlug || '').replace(/-/g, ' '))
    ),
    // Posts: spacious grid (2 columns per TT4 default)
    React.createElement('div', { className: 'max-w-6xl mx-auto px-6 pb-24' },
      posts.length === 0
        ? loadError
          ? React.createElement('p', { className: 'text-gray-500 text-center py-20' }, t('failed to load posts', settings))
          : React.createElement('p', { className: 'text-gray-500 text-center py-20' }, t('no posts yet', settings))
        : React.createElement('div', { className: 'grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-16' },
            posts.map((p: any) =>
              React.createElement('article', { key: p.id, className: 'flex flex-col' },
                p.featured && React.createElement(Link, { to: '/post/' + p.slug },
                  React.createElement('img', { src: cdnUrl(p.featured, settings), alt: p.title, className: 'w-full aspect-[16/10] object-cover rounded-lg mb-5', loading: 'lazy' })),
                React.createElement('div', { className: 'flex items-center gap-3 text-xs text-gray-400 mb-2' },
                  React.createElement('span', { className: 'flex items-center gap-1' }, React.createElement(Calendar, { size: 12 }), timeAgo(p.publishedAt || p.createdAt)),
                  React.createElement('span', { className: 'flex items-center gap-1' }, React.createElement(User, { size: 12 }), p.author?.username),
                  p.categories?.[0] && React.createElement('span', { className: 'text-gray-300' }, '/', p.categories[0].name),
                ),
                React.createElement(Link, { to: '/post/' + p.slug },
                  React.createElement('h2', { className: 'text-2xl font-semibold tracking-tight text-gray-900 hover:text-gray-600 mb-2' }, p.title)),
                p.excerpt && React.createElement('p', { className: 'text-gray-500 text-sm leading-relaxed flex-1' }, p.excerpt),
                React.createElement(Link, { to: '/post/' + p.slug, className: 'inline-flex items-center gap-1 mt-3 text-sm font-medium text-gray-900 border-b border-gray-900 pb-0.5 w-fit hover:text-gray-600' },
                  t('read more', settings), React.createElement('span', null, '\u2192')),
              )
            )
          ),
      total > parseInt(settings.posts_per_page || '10') && React.createElement('div', { className: 'flex items-center justify-center gap-4 pt-16' },
        React.createElement('button', { onClick: () => setPage(Math.max(1, page - 1)), disabled: page === 1, className: 'px-5 py-2 border border-gray-300 rounded-full text-sm hover:bg-gray-50 disabled:opacity-40' }, '\u2190 ' + t('previous', settings)),
        React.createElement('span', { className: 'text-sm text-gray-400' }, t('page', settings) + ' ' + page + ' ' + t('of', settings) + ' ' + Math.ceil(total / parseInt(settings.posts_per_page || '10'))),
        React.createElement('button', { onClick: () => setPage(page + 1), disabled: page * parseInt(settings.posts_per_page || '10') >= total, className: 'px-5 py-2 border border-gray-300 rounded-full text-sm hover:bg-gray-50 disabled:opacity-40' }, t('next', settings) + ' \u2192'),
      )
    )
  );
}
