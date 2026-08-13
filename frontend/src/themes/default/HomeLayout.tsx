import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, User, Folder, MessageSquare } from 'lucide-react';
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

// Re-render every minute so relative times ("7h ago") stay current
// without a page reload.
function useTimeTick(): number {
  const [tick, setTick] = React.useState(Date.now());
  React.useEffect(() => {
    const iv = setInterval(() => setTick(Date.now()), 60000);
    return () => clearInterval(iv);
  }, []);
  return tick;
}



function formatIcon(f: string) {
  const icons: Record<string, string> = { gallery: '\u{1F5BC}', video: '\u{1F3AC}', audio: '\u{1F3B5}', quote: '\u{1F4AC}', link: '\u{1F517}' };
  return icons[f] || '';
}

// Default homepage template: list + right sidebar
export default function HomeLayout(props: any) {
  useTimeTick();
  const { settings, posts, total, page, setPage, loadError, catSlug, isTagPage, categories } = props;

  return React.createElement('div', null,
    catSlug && React.createElement('div', { className: 'bg-gray-50 border-b border-gray-200 py-12 text-center' },
      React.createElement('h1', { className: 'text-3xl font-bold text-gray-900 capitalize' }, (isTagPage ? t('tag', settings) + ': ' : '') + (catSlug || '').replace(/-/g, ' '))
    ),
    React.createElement('div', { className: 'max-w-5xl mx-auto px-4 py-8' },
    (() => {
      const slides: any[] = (() => { try { return JSON.parse(settings.carousel_items || '[]'); } catch { return []; } })();
      const items = (Array.isArray(slides) ? slides : []).filter((c: any) => c && c.image);
      return items.length > 0 ? React.createElement('div', { className: 'mb-12' }, React.createElement(Carousel, { items, settings })) : null;
    })(),

      React.createElement('div', { className: 'grid grid-cols-1 lg:grid-cols-3 gap-8' + (settings.theme_sidebar_position === 'left' ? ' [direction:rtl] [&>*]:[direction:ltr]' : '') },
        React.createElement('div', { className: 'lg:col-span-2' },
          posts.length === 0
            ? loadError
              ? React.createElement('div', { className: 'text-center py-20' }, React.createElement('div', { className: 'text-6xl mb-4' }, '\u26A0\uFE0F'), React.createElement('h3', { className: 'text-lg font-semibold text-gray-900 mb-2' }, t('failed to load posts', settings)), React.createElement('p', { className: 'text-sm text-gray-500' }, t('please try again later', settings)))
              : React.createElement('div', { className: 'text-center py-20' }, React.createElement('div', { className: 'text-6xl mb-4' }, '\u{1F4DD}'), React.createElement('h3', { className: 'text-lg font-semibold text-gray-900 mb-2' }, t('no posts yet', settings)), React.createElement('p', { className: 'text-sm text-gray-500' }, t('check back later for new content', settings)))
            : React.createElement('div', { className: 'space-y-12' },
                posts.map((p: any) => React.createElement('article', { key: p.id, className: 'pb-12 border-b border-gray-100 last:border-0' },
                  p.featured && React.createElement('img', { src: cdnUrl(p.featured, settings), alt: p.title, className: 'w-full h-48 object-cover rounded-lg mb-5', loading: 'lazy', decoding: 'async',
                    sizes: '(min-width: 900px) 512px, 100vw',
                    srcSet: p.srcset ? Object.entries(p.srcset).map(([w, u]) => (cdnUrl(u as string, settings) as string) + ' ' + w + 'w').join(', ') : undefined }),
                  React.createElement(Link, { to: '/post/' + p.slug },
                    React.createElement('h2', { className: 'text-xl font-bold text-gray-900 hover:text-primary-600 mb-3' }, p.format && p.format !== 'standard' ? React.createElement('span', { className: 'inline-flex items-center gap-1 px-2 py-0.5 mr-2 text-xs font-medium bg-gray-100 text-gray-500 rounded' }, formatIcon(p.format), p.format.charAt(0).toUpperCase() + p.format.slice(1)) : null, p.sticky ? React.createElement('span', { className: 'inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-orange-100 text-orange-700 rounded mr-2 align-middle' }, '\u2605 ' + t('featured', settings)) : null, p.title)
                  ),
                  React.createElement('div', { className: 'flex items-center gap-4 text-xs text-gray-500 mb-4' },
                    React.createElement('span', { className: 'flex items-center gap-1' }, React.createElement(Calendar, { size: 12 }), timeAgo(p.publishedAt || p.createdAt)),
                    React.createElement('span', { className: 'flex items-center gap-1' }, React.createElement(User, { size: 12 }), React.createElement(Link, { to: '/author/' + (p.author?.username || ''), className: 'hover:text-primary-600' }, p.author?.username)),
                    p.categories?.[0] && React.createElement('span', { className: 'flex items-center gap-1' }, React.createElement(Folder, { size: 12 }), p.categories[0].name)
                  ),
                  p.excerpt && React.createElement('p', { className: 'text-gray-600 text-sm leading-relaxed mb-4' }, p.excerpt),
                  React.createElement('div', { className: 'flex items-center justify-between gap-3' },
                    React.createElement('div', { className: 'flex items-center gap-3 text-xs text-gray-500' },
                      React.createElement('span', { className: 'inline-flex items-center gap-1' }, readingTime(p.content)),
                      (p.commentCount > 0) && React.createElement('span', { className: 'inline-flex items-center gap-1' }, React.createElement(MessageSquare, { size: 12 }), '' + p.commentCount)
                    ),
                    React.createElement(Link, { to: '/post/' + p.slug, className: 'inline-flex items-center gap-1 text-sm font-medium text-primary-600 hover:text-primary-700' }, t('read more', settings))
                  ),
                ))
              ),
          total > parseInt(settings.posts_per_page || '10') && React.createElement('div', { className: 'flex items-center justify-center gap-4 pt-4' },
            React.createElement('button', { onClick: () => setPage(Math.max(1, page - 1)), disabled: page === 1, className: 'px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50' }, '\u2190 ' + t('previous', settings)),
            React.createElement('span', { className: 'text-sm text-gray-500' }, t('page', settings) + ' ' + page + ' ' + t('of', settings) + ' ' + Math.ceil(total / parseInt(settings.posts_per_page || '10'))),
            React.createElement('button', { onClick: () => setPage(page + 1), disabled: page * parseInt(settings.posts_per_page || '10') >= total, className: 'px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50' }, t('next', settings) + ' \u2192')
          )
        ),
        React.createElement('aside', { className: 'space-y-6' },
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
              has('html') && cfg.html?.html && React.createElement('div', { className: 'rounded-lg border border-gray-200 p-4' },
                cfg.html.title && React.createElement('h3', { className: 'text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wider' }, cfg.html.title),
                React.createElement('div', { dangerouslySetInnerHTML: { __html: cfg.html.html } })
              ),
            );
          })(),
          React.createElement('div', { className: 'rounded-lg border border-gray-200 p-4' },
            React.createElement('h3', { className: 'text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wider' }, t('categories', settings)),
            categories.length === 0
              ? React.createElement('p', { className: 'text-sm text-gray-500' }, t('no categories yet', settings))
              : React.createElement('ul', { className: 'space-y-1' }, categories.map((c: any) => React.createElement('li', { key: c.id },
                  React.createElement(Link, { to: '/category/' + c.slug, className: 'text-sm ' + (catSlug === c.slug ? 'text-primary-600 font-medium' : 'text-gray-600 hover:text-primary-600') }, c.name, c._count?.posts > 0 ? React.createElement('span', { className: 'text-gray-500 ml-1' }, '(' + c._count.posts + ')') : null)
                ))))
        )
      )
    )
  );
}
