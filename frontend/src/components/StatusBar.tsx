import React, { useEffect, useState } from 'react';
import { FileText, FolderTree, Tag as TagIcon, MessageSquare, Clock } from 'lucide-react';
import api from '../lib/api';
import { t } from '../lib/i18n';

// Footer status bar: live site stats + real-time clock + online indicator.
// Explores the site's content footprint in a single slim bar.
export default function StatusBar({ settings }: { settings?: Record<string, string> }) {
  const [stats, setStats] = useState<any>(null);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    api.get('/posts/site-stats').then(r => setStats(r.data)).catch(() => {});
    const iv = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(iv);
  }, []);

  const stat = (icon: any, value: number, label: string) => React.createElement('span', { key: label, className: 'inline-flex items-center gap-1.5 text-xs text-gray-500' },
    React.createElement(icon, { size: 13, className: 'text-gray-400' }),
    React.createElement('span', { className: 'font-medium text-gray-700' }, value),
    label,
  );

  const items: React.ReactNode[] = [];
  if (stats) {
    items.push(stat(FileText, stats.posts, t('posts', settings)));
    items.push(stat(FolderTree, stats.categories, t('categories', settings)));
    items.push(stat(TagIcon, stats.tags, t('tags', settings)));
    items.push(stat(MessageSquare, stats.comments, t('comments', settings)));
  }

  return React.createElement('div', { className: 'border-t border-gray-900/[0.06] bg-gray-50/50' },
    React.createElement('div', { className: 'max-w-5xl mx-auto px-6 py-3 flex flex-wrap items-center justify-center sm:justify-between gap-x-6 gap-y-2' },
      React.createElement('div', { className: 'flex flex-wrap items-center gap-x-6 gap-y-2' }, items),
      React.createElement('div', { className: 'flex items-center gap-4' },
        React.createElement('span', { className: 'inline-flex items-center gap-1.5 text-xs text-gray-500' },
          React.createElement('span', { className: 'w-2 h-2 rounded-full bg-emerald-500 animate-pulse' }),
          t('online', settings)),
        React.createElement('span', { className: 'inline-flex items-center gap-1.5 text-xs text-gray-500 tabular-nums' },
          React.createElement(Clock, { size: 13, className: 'text-gray-400' }),
          now.toLocaleTimeString(settings?.site_lang === 'en' ? 'en-US' : 'zh-CN', { hour12: false })),
      ),
    ),
  );
}
