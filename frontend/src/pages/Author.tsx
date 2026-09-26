import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import useSEO from '../hooks/useSEO';
import api from '../lib/api';
import { t } from '../lib/i18n';
import { useTheme } from '../themes';
import { postPath } from '../lib/permalink';
import Pagination from '../components/Pagination';

export default function AuthorPage({ settings }: { settings: Record<string, string> }) {
  const { username } = useParams();
  const [posts, setPosts] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // The author's own posts paginate too — the endpoint always returned a total,
  // the page just showed the first batch.
  useEffect(() => { setPage(1); }, [username]);
  useEffect(() => {
    setLoading(true);
    api.get('/posts/author/' + username + '?page=' + page + '&limit=' + (settings.posts_per_page || '10'))
      .then(r => { setPosts(r.data.posts || []); setProfile(r.data.author || null); setTotal(r.data.total || 0); })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [username, page, settings.posts_per_page]);

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
        itemListElement: posts.map((p: any, i: number) => ({ '@type': 'ListItem', position: i + 1, name: p.title, url: window.location.origin + postPath(p.slug) })),
      }] : []),
    ],
  });

  const Layout = useTheme().AuthorLayout;
  const pagination = React.createElement(Pagination, {
    page, total, perPage: parseInt(settings.posts_per_page || '10'), onChange: setPage, settings,
  });
  return React.createElement(Layout, { settings, username, posts, loading, error, author: profile, total, pagination, page, setPage });
}
