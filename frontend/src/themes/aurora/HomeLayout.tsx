import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, User, Folder } from 'lucide-react';
import TagCloudWidget from '../../components/TagCloudWidget';
import RecentPostsWidget from '../../components/RecentPostsWidget';
import PopularPostsWidget from '../../components/PopularPostsWidget';
import ArchiveWidget from '../../components/ArchiveWidget';
import SearchWidget from '../../components/SearchWidget';
import LinksWidget from '../../components/LinksWidget';
import RecentCommentsWidget from '../../components/RecentCommentsWidget';
import CalendarWidget from '../../components/CalendarWidget';
import PagesWidget from '../../components/PagesWidget';
import RssWidget from '../../components/RssWidget';
import { cdnUrl } from '../../lib/cdn';
import { timeAgo, readingTime } from '../../lib/time';
import { t } from '../../lib/i18n';
import Carousel from '../../components/Carousel';

// Re-render every minute so relative times stay current
function useTimeTick(): number {
  const [tick, setTick] = React.useState(Date.now());
  React.useEffect(() => {
    const iv = setInterval(() => setTick(Date.now()), 60000);
    return () => clearInterval(iv);
  }, []);
  return tick;
}

// Aurora home: centered editorial list, no cards, generous whitespace
export default function HomeLayout(props: any) {
  useTimeTick();
  const { settings, posts, total, page, setPage, loadError, catSlug, isTagPage, categories } = props;

  return React.createElement('div', null,
    catSlug && React.createElement('div', { className: 'py-16 text-center' },
      React.createElement('p', { className: 'text-xs font-medium uppercase tracking-[0.2em] text-indigo-600 mb-3' }, isTagPage ? t('tag', settings) : t('category', settings)),
      React.createElement('h1', { className: 'text-4xl sm:text-5xl font-bold tracking-tight text-gray-900 capitalize' }, (catSlug || '').replace(/-/g, ' ')),
    ),
    React.createElement('div', { className: 'max-w-5xl mx-auto px-6 py-16' },
    (() => {
      const slides: any[] = (() => { try { return JSON.parse(settings.carousel_items || '[]'); } catch { return []; } })();
      const items = (Array.isArray(slides) ? slides : []).filter((c: any) => c && c.image);
      return items.length > 0 ? React.createElement('div', { className: 'mb-12' }, React.createElement(Carousel, { items, settings })) : null;
    })(),

      React.createElement('div', { className: 'grid grid-cols-1 lg:grid-cols-3 gap-16' + (settings.theme_sidebar_position === 'left' ? ' [direction:rtl] [&>*]:[direction:ltr]' : '') },
        React.createElement('div', { className: 'lg:col-span-2' },
          posts.length === 0
            ? loadError
              ? React.createElement('div', { className: 'text-center py-24' }, React.createElement('h3', { className: 'text-lg font-semibold text-gray-900 mb-2' }, t('failed to load posts', settings)), React.createElement('p', { className: 'text-sm text-gray-500' }, t('please try again later', settings)))
              : React.createElement('div', { className: 'text-center py-24' }, React.createElement('h3', { className: 'text-lg font-semibold text-gray-900 mb-2' }, t('no posts yet', settings)), React.createElement('p', { className: 'text-sm text-gray-500' }, t('check back later for new content', settings)))
            : React.createElement('div', null,
                posts.map((p: any, idx: number) => React.createElement('article', { key: p.id, className: 'pb-12 ' + (idx > 0 ? 'pt-12 border-t border-gray-900/[0.06]' : '') },
                  p.featured && React.createElement(Link, { to: '/post/' + p.slug, className: 'block overflow-hidden rounded-2xl mb-8' },
                    React.createElement('img', { src: cdnUrl(p.featured, settings), alt: p.title, className: 'w-full aspect-[16/9] object-cover transition-transform duration-500 hover:scale-[1.02]', loading: 'lazy', decoding: 'async' })),
                  React.createElement(Link, { to: '/post/' + p.slug },
                    React.createElement('h2', { className: 'font-bold tracking-tight text-gray-900 hover:text-indigo-600 transition-colors mb-4', style: { fontSize: 'var(--heading-max-size, 30px)' } }, p.title)),
                  React.createElement('div', { className: 'flex items-center gap-4 text-xs text-gray-500 mb-4' },
                    React.createElement('span', { className: 'flex items-center gap-1.5' }, React.createElement(Calendar, { size: 13 }), timeAgo(p.publishedAt || p.createdAt)),
                    React.createElement('span', { className: 'flex items-center gap-1.5' }, React.createElement(User, { size: 13 }), React.createElement(Link, { to: '/author/' + (p.author?.username || ''), className: 'hover:text-gray-900 transition-colors' }, p.author?.username)),
                    p.categories?.[0] && React.createElement('span', { className: 'flex items-center gap-1.5' }, React.createElement(Folder, { size: 13 }), p.categories[0].name)
                  ),
                  p.excerpt && React.createElement('p', { className: 'text-gray-600 leading-relaxed mb-6' }, p.excerpt),
                  React.createElement('div', { className: 'flex items-center justify-between' },
                    React.createElement('span', { className: 'text-xs text-gray-400' }, readingTime(p.content)),
                    React.createElement(Link, { to: '/post/' + p.slug, className: 'inline-flex items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors' }, t('read more', settings), React.createElement('span', null, '\u2192')),
                  ),
                )),
                total > parseInt(settings.posts_per_page || '10') && React.createElement('div', { className: 'flex items-center justify-center gap-4 pt-12' },
                  React.createElement('button', { onClick: () => setPage(Math.max(1, page - 1)), disabled: page === 1, className: 'px-5 py-2.5 rounded-full border border-gray-200 text-sm hover:border-gray-400 disabled:opacity-40 transition-colors' }, '\u2190 ' + t('previous', settings)),
                  React.createElement('span', { className: 'text-sm text-gray-500' }, t('page', settings) + ' ' + page + ' ' + t('of', settings) + ' ' + Math.ceil(total / parseInt(settings.posts_per_page || '10'))),
                  React.createElement('button', { onClick: () => setPage(page + 1), disabled: page * parseInt(settings.posts_per_page || '10') >= total, className: 'px-5 py-2.5 rounded-full border border-gray-200 text-sm hover:border-gray-400 disabled:opacity-40 transition-colors' }, t('next', settings) + ' \u2192'),
                ),
              ),
        ),
        React.createElement('aside', { className: 'space-y-4' },
          (() => {
            const activeWidgets: string[] = (() => { try { return JSON.parse(settings.widgets_active || '[]'); } catch { return []; } })();
            const cfg: Record<string, { title?: string; html?: string }> = (() => { try { return JSON.parse(settings.widgets_config || '{}'); } catch { return {}; } })();
            const has = (id: string) => activeWidgets.length === 0 || activeWidgets.includes(id);
            return React.createElement(React.Fragment, null,
              has('search') && React.createElement(SearchWidget),
              has('recent_posts') && React.createElement(RecentPostsWidget),
              has('popular') && React.createElement(PopularPostsWidget),
              has('tag_cloud') && React.createElement(TagCloudWidget),
              has('archives') && React.createElement(ArchiveWidget),
              has('links') && React.createElement(LinksWidget),
              has('recent_comments') && React.createElement(RecentCommentsWidget),
              has('calendar') && React.createElement(CalendarWidget),
              has('pages') && React.createElement(PagesWidget),
              has('rss') && React.createElement(RssWidget),
              has('html') && cfg.html?.html && React.createElement('div', null,
                cfg.html.title && React.createElement('h3', { className: 'text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wider' }, cfg.html.title),
                React.createElement('div', { className: 'text-sm text-gray-600', dangerouslySetInnerHTML: { __html: cfg.html.html } })
              ),
            );
          })(),
          React.createElement('div', { className: 'rounded-lg border border-gray-200 p-4' },
            React.createElement('h3', { className: 'text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wider' }, t('categories', settings)),
            categories.length === 0
              ? React.createElement('p', { className: 'text-sm text-gray-500' }, t('no categories yet', settings))
              : React.createElement('ul', { className: 'space-y-2.5' }, categories.map((c: any) => React.createElement('li', { key: c.id },
                  React.createElement(Link, { to: '/category/' + c.slug, className: 'text-sm flex items-center justify-between group' },
                    React.createElement('span', { className: 'text-gray-600 group-hover:text-gray-900 transition-colors' }, c.name),
                    c._count?.posts > 0 && React.createElement('span', { className: 'text-xs text-gray-400' }, c._count.posts))
                ))))
        ),
      ),
    ),
  );
}
