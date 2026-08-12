import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import useSEO from '../hooks/useSEO';
import api from '../lib/api';
import { t } from '../lib/i18n';
import { useTheme } from '../themes';

export default function AuthorPage({ settings }: { settings: Record<string, string> }) {
  const { username } = useParams();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    api.get('/posts/author/' + username)
      .then(r => setPosts(r.data.posts || []))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [username]);

  useSEO({
    siteTitle: settings.site_title,
    title: username || t('author'),
    url: window.location.origin + '/author/' + username,
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'ProfilePage',
        name: username || t('author'),
        url: window.location.origin + '/author/' + username,
        mainEntity: { '@type': 'Person', name: username || t('author') },
      },
      ...(posts.length ? [{
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        itemListElement: posts.map((p: any, i: number) => ({ '@type': 'ListItem', position: i + 1, name: p.title, url: window.location.origin + '/post/' + p.slug })),
      }] : []),
    ],
  });

  const Layout = useTheme().AuthorLayout;
  return React.createElement(Layout, { username, posts, loading, error });
}
