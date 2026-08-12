import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import useSEO from '../hooks/useSEO';
import api from '../lib/api';
import { t } from '../lib/i18n';
import { useTheme } from '../themes';

export default function SearchPage({ settings }: { settings: Record<string, string> }) {
  const [sp] = useSearchParams();
  const query = sp.get('q') || '';
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!query) { setLoading(false); return; }
    setError(false);
    api.get('/posts?search=' + encodeURIComponent(query) + '&limit=20')
      .then(r => setPosts(r.data.posts || []))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [query]);

  useSEO({ siteTitle: settings.site_title, title: query ? t('search') + ': ' + query : t('search'), url: window.location.origin + '/search?q=' + encodeURIComponent(query) });

  const Layout = useTheme().SearchLayout;
  return React.createElement(Layout, { query, posts, loading, error });
}
