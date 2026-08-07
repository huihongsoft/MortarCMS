import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import useSEO from '../hooks/useSEO';
import api from '../lib/api';
import { t } from '../lib/i18n';
import { getTheme } from '../themes';

export default function SearchPage({ settings }: { settings: Record<string, string> }) {
  const [sp] = useSearchParams();
  const query = sp.get('q') || '';
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!query) { setLoading(false); return; }
    api.get('/posts?search=' + encodeURIComponent(query) + '&limit=20').then(r => setPosts(r.data.posts || [])).catch(() => {}).finally(() => setLoading(false));
  }, [query]);

  useSEO({ title: query ? t('search') + ': ' + query : t('search'), url: window.location.origin + '/search' });

  const Layout = getTheme(settings.theme_name).SearchLayout;
  return React.createElement(Layout, { query, posts, loading });
}
