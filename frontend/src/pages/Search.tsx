import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import useSEO from '../hooks/useSEO';
import api from '../lib/api';
import { t } from '../lib/i18n';
import { useTheme } from '../themes';
import Pagination from '../components/Pagination';
import { siteOrigin } from '../lib/ssr';

export default function SearchPage({ settings }: { settings: Record<string, string> }) {
  const [sp] = useSearchParams();
  const query = sp.get('q') || '';
  // Optional narrowing: the posts endpoint already accepts category/tag, so the
  // search page can offer them without a second query path.
  const category = sp.get('category') || '';
  const tag = sp.get('tag') || '';
  const [posts, setPosts] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => { setPage(1); }, [query, category, tag]);
  useEffect(() => {
    if (!query) { setLoading(false); setPosts([]); setTotal(0); return; }
    setError(false);
    setLoading(true);
    const perPage = settings.posts_per_page || '10';
    const params = 'search=' + encodeURIComponent(query) + '&page=' + page + '&limit=' + perPage
      + (category ? '&category=' + encodeURIComponent(category) : '')
      + (tag ? '&tag=' + encodeURIComponent(tag) : '');
    api.get('/posts?' + params)
      .then(r => { setPosts(r.data.posts || []); setTotal(r.data.total || 0); })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
    // Feed the admin hot-search report (best-effort, never blocks the page).
    // Only the first page: paging through results is not a new search.
    if (page === 1) api.post('/posts/search-log', { q: query }).catch(() => {});
  }, [query, category, tag, page, settings.posts_per_page]);

  // Search result pages are thin, query-specific duplicates: keep them out of the
  // index (the server sends the same signal via X-Robots-Tag).
  useSEO({ siteTitle: settings.site_title, title: query ? t('search') + ': ' + query : t('search'), url: siteOrigin(settings) + '/search?q=' + encodeURIComponent(query), noindex: true });

  const Layout = useTheme().SearchLayout;
  const pagination = React.createElement(Pagination, {
    page, total, perPage: parseInt(settings.posts_per_page || '10'), onChange: setPage, settings,
  });
  return React.createElement(Layout, { settings, query, posts, loading, error, total, category, tag, pagination, page, setPage });
}
