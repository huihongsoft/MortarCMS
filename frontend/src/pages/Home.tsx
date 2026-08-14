import React, { useEffect, useState } from 'react';
import { ListSkeleton } from '../components/Skeleton';
import { useParams, useLocation } from 'react-router-dom';
import api from '../lib/api';
import useSEO from '../hooks/useSEO';
import { useTheme } from '../themes';
import { t } from '../lib/i18n';

export default function Home({ settings }: { settings: Record<string, string> }) {
  const { slug: catSlug } = useParams();
  const location = useLocation();
  const isTagPage = location.pathname.startsWith('/tag/');
  const isTypePage = location.pathname.startsWith('/type/');
  const [posts, setPosts] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [categories, setCategories] = useState<any[]>([]);
  const [loadError, setLoadError] = useState(false);
  const [loading, setLoading] = useState(true);
  // WordPress "static front page" — show a page instead of the post list
  const [frontPage, setFrontPage] = useState<any>(null);
  const showStatic = !catSlug && settings.show_on_front === 'page' && !!settings.page_on_front;
  // Must run unconditionally: hooks cannot be called inside a conditional branch
  const theme = useTheme();

  useEffect(() => {
    if (showStatic) {
      api.get('/pages/slug/' + settings.page_on_front).then(r => setFrontPage(r.data)).catch(() => setFrontPage({ error: true }));
      return;
    }
    setFrontPage(null);
    const p = new URLSearchParams();
    p.set('page', String(page));
    p.set('limit', settings.posts_per_page || '10');
    if (catSlug) p.set(isTagPage ? 'tag' : isTypePage ? 'type' : 'category', catSlug);
    api.get('/posts?' + p.toString()).then(r => { setPosts(r.data.posts); setTotal(r.data.total); setLoadError(false); }).catch(() => setLoadError(true)).finally(() => setLoading(false));
    api.get('/categories').then(r => setCategories(r.data)).catch(() => {});
  }, [page, catSlug, settings.posts_per_page, settings.show_on_front, settings.page_on_front]);

  const siteOrigin = settings.site_url || window.location.origin;
  useSEO({
    siteTitle: settings.site_title,
    title: frontPage ? frontPage.title : catSlug ? (isTagPage ? t('tag', settings) + ': ' : isTypePage ? '' : '') + catSlug.replace(/-/g, ' ') : settings.site_title || undefined,
    description: frontPage ? frontPage.excerpt || '' : settings.site_description || '',
    url: siteOrigin + '/' + (catSlug ? (isTagPage ? 'tag/' : isTypePage ? 'type/' : 'category/') + catSlug : ''),
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: settings.site_title || 'Mortar',
        url: siteOrigin,
        potentialAction: {
          '@type': 'SearchAction',
          target: siteOrigin + '/search?q={search_term_string}',
          'query-input': 'required name=search_term_string',
        },
      },
      ...(catSlug && posts.length > 0 ? [{
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        itemListElement: posts.map((p: any, i: number) => ({ '@type': 'ListItem', position: i + 1, name: p.title, url: siteOrigin + '/post/' + p.slug })),
      }] : []),
    ],
  });

  // Static front page rendering (WordPress page_on_front)
  if (showStatic) {
    if (!frontPage) return null;
    if (frontPage.error || frontPage.protected) {
      return React.createElement('div', { className: 'max-w-3xl mx-auto px-4 py-20 text-center' },
        React.createElement('h1', { className: 'text-2xl font-bold text-gray-900' }, t('page not found', settings)));
    }
    const PageLayout = theme.PageLayout;
    return React.createElement(PageLayout, { settings, page: frontPage });
  }

  const Layout = catSlug ? (isTagPage ? theme.TagLayout : theme.CategoryLayout) : theme.HomeLayout;
  // First paint: show a skeleton instead of flashing "no posts yet"
  if (loading && posts.length === 0 && !loadError && !catSlug) {
    return React.createElement(ListSkeleton, null);
  }
  return React.createElement(Layout, { settings, posts, total, page, setPage, loadError, catSlug, isTagPage, categories });
}
