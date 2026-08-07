import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import useSEO from '../hooks/useSEO';
import api from '../lib/api';
import { t } from '../lib/i18n';
import { getTheme } from '../themes';

export default function AuthorPage({ settings }: { settings: Record<string, string> }) {
  const { username } = useParams();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/posts/author/' + username).then(r => setPosts(r.data.posts || [])).catch(() => {}).finally(() => setLoading(false));
  }, [username]);

  useSEO({ title: username || t('author'), url: window.location.origin + '/author/' + username });

  const Layout = getTheme(settings.theme_name).AuthorLayout;
  return React.createElement(Layout, { username, posts, loading });
}
