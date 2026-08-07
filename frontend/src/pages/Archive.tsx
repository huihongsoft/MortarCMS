import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import useSEO from '../hooks/useSEO';
import api from '../lib/api';
import { t } from '../lib/i18n';
import { getTheme } from '../themes';

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

export default function ArchivePage({ settings }: { settings: Record<string, string> }) {
  const { year, month } = useParams();
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    api.get('/posts/archive/' + year + '/' + month).then(r => setData(r.data)).catch(() => setData({ error: true }));
  }, [year, month]);

  useSEO({ title: MONTHS[parseInt(month || '1') - 1] + ' ' + year + ' ' + t('archive'), url: window.location.origin + '/archive/' + year + '/' + month });

  if (!data) return React.createElement('p', { className: 'text-gray-500 p-8' }, t('loading'));
  if (data.error) return React.createElement('p', { className: 'text-gray-500 p-8' }, t('failed to load archive'));

  const Layout = getTheme(settings.theme_name).ArchiveLayout;
  return React.createElement(Layout, { data, year, month });
}
