import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import useSEO from '../hooks/useSEO';
import api from '../lib/api';
import { t } from '../lib/i18n';
import { useTheme } from '../themes';
import Pagination from '../components/Pagination';
import { siteOrigin } from '../lib/ssr';
import { postPath } from '../lib/permalink';
import { currentLangPrefix } from '../lib/contentLang';

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
  // The visitor-facing question box is off unless the operator enabled it; the
  // generic settings endpoint hides every ai_ key, so this is its own probe.
  const [askEnabled, setAskEnabled] = useState(false);
  const [askState, setAskState] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [answer, setAnswer] = useState('');
  const [sources, setSources] = useState<{ title: string; slug?: string; url: string }[]>([]);
  // Every question gets a number; a reply whose number is no longer current is
  // dropped. Without this, editing the query while a request is in flight left
  // the PREVIOUS question's answer on screen under the new query.
  const askSeq = React.useRef(0);

  useEffect(() => {
    api.get('/ai/public-qa').then(r => setAskEnabled(!!r.data?.enabled)).catch(() => {});
  }, []);
  // A new query invalidates the previous answer.
  useEffect(() => {
    askSeq.current++;   // invalidates any reply still in flight
    setAskState('idle'); setAnswer(''); setSources([]);
  }, [query]);

  async function ask() {
    if (!query || askState === 'loading') return;
    const seq = ++askSeq.current;
    setAskState('loading');
    try {
      // The language prefix the visitor is reading under, so the answer is built
      // from that edition and the sources link back into it.
      const r = await api.post('/ai/ask', { question: query, lang: currentLangPrefix() });
      if (seq !== askSeq.current) return;
      setAnswer(String(r.data?.answer || ''));
      setSources(Array.isArray(r.data?.sources) ? r.data.sources : []);
      setAskState('done');
    } catch { if (seq === askSeq.current) setAskState('error'); }
  }

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
  // Rendered ABOVE the theme's layout rather than inside SearchLayout: one place
  // to add it, and every theme gets it.
  const askBlock = askEnabled && query && React.createElement('div', { className: 'mb-6 p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50' },
    askState === 'done'
      ? React.createElement(React.Fragment, null,
          React.createElement('p', { className: 'text-sm text-gray-800 dark:text-gray-100 whitespace-pre-wrap' }, answer),
          sources.length > 0 && React.createElement('div', { className: 'mt-3 pt-3 border-t border-gray-200' },
            React.createElement('p', { className: 'text-[11px] text-gray-500 mb-1' }, t('sources')),
            React.createElement('ul', { className: 'space-y-0.5' },
              sources.map((s, i) => React.createElement('li', { key: i, className: 'text-xs' },
                // Built with the same helper as every other post link on the
                // site, so it carries the visitor's language prefix; the server's
                // own url is only the fallback.
                React.createElement('a', { href: s.slug ? postPath(s.slug) : s.url, className: 'text-primary-600 hover:underline' }, '[' + (i + 1) + '] ' + s.title))))))
      : React.createElement('div', { className: 'flex items-center gap-3' },
          React.createElement('button', {
            onClick: ask,
            disabled: askState === 'loading',
            className: 'text-xs px-3 py-1.5 rounded-lg bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-50',
          }, askState === 'loading' ? t('thinking') + '…' : t('ask ai about this')),
          React.createElement('span', { className: 'text-[11px] text-gray-500' },
            askState === 'error' ? t('ask failed') : t('ask hint'))));

  return React.createElement(React.Fragment, null,
    askBlock,
    React.createElement(Layout, { settings, query, posts, loading, error, total, category, tag, pagination, page, setPage }));
}
