import React, { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import api from '../lib/api';
import useSEO from '../hooks/useSEO';
import { useTheme } from '../themes';
import { t } from '../lib/i18n';

export default function Home({ settings }: { settings: Record<string, string> }) {
  const { slug: catSlug } = useParams();
  const location = useLocation();
  const isTagPage = location.pathname.startsWith('/tag/');
  const [posts, setPosts] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [categories, setCategories] = useState<any[]>([]);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    const p = new URLSearchParams();
    p.set('page', String(page));
    p.set('limit', settings.posts_per_page || '10');
    if (catSlug) p.set(isTagPage ? 'tag' : 'category', catSlug);
    api.get('/posts?' + p.toString()).then(r => { setPosts(r.data.posts); setTotal(r.data.total); setLoadError(false); }).catch(() => setLoadError(true));
    api.get('/categories').then(r => setCategories(r.data)).catch(() => {});
  }, [page, catSlug, settings.posts_per_page]);
  useSEO({ title: catSlug ? (isTagPage ? t('tag', settings) + ': ' : '') + catSlug.replace(/-/g, ' ') : settings.site_title || undefined, description: settings.site_description || '', url: (settings.site_url || window.location.origin) + '/' + (catSlug ? (isTagPage ? 'tag/' : 'category/') + catSlug : '') });

  const theme = useTheme();
  const Layout = catSlug ? (isTagPage ? theme.TagLayout : theme.CategoryLayout) : theme.HomeLayout;
  return React.createElement(Layout, { settings, posts, total, page, setPage, loadError, catSlug, isTagPage, categories });
}
