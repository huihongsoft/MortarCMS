import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Puzzle } from 'lucide-react';
import api from '../lib/api';
import { t, getLang } from '../lib/i18n';

// Host for screens a plugin registered with addAdminPage(): the plugin ships
// HTML and the admin shell renders it here. Scripts are re-created after
// injection, because innerHTML never executes them.
//
// Plugin code is trusted (it already runs server-side with database access), so
// its markup is injected as-is rather than sanitised — a plugin can only damage
// its own admin screen, and any admin can disable the plugin.
export default function PluginPage() {
  const { plugin, page } = useParams();
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState('');
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setData(null); setError('');
    api.get('/ext/pages/' + encodeURIComponent(String(plugin)) + '/' + encodeURIComponent(String(page)))
      .then(r => setData(r.data))
      .catch((e: any) => setError(e?.response?.data?.error || t('failed to load', getLang())));
  }, [plugin, page]);

  useEffect(() => {
    const host = hostRef.current;
    if (!host || !data) return;
    // Re-create <script> nodes so plugin-provided behaviour runs (inline scripts
    // inserted via innerHTML are inert by spec).
    host.querySelectorAll('script').forEach((old) => {
      const s = document.createElement('script');
      for (const attr of Array.from(old.attributes)) s.setAttribute(attr.name, attr.value);
      s.text = old.textContent || '';
      old.replaceWith(s);
    });
  }, [data]);

  if (error) return React.createElement('p', { className: 'text-sm text-red-500 p-6' }, error);
  if (!data) return React.createElement('p', { className: 'text-sm text-gray-400 p-6' }, t('loading...', getLang()));

  return React.createElement('div', null,
    React.createElement('div', { className: 'flex items-center gap-3 mb-6' },
      React.createElement(Puzzle, { size: 20, className: 'text-primary-600' }),
      React.createElement('h2', { className: 'text-2xl font-bold text-gray-900 dark:text-gray-100' }, data.title),
      React.createElement('span', { className: 'text-xs px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-500' }, data.plugin)
    ),
    React.createElement('div', { ref: hostRef, dangerouslySetInnerHTML: { __html: data.html } })
  );
}
