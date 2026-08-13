import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Server, Database, Clock, MessageSquare, CheckCircle2 } from 'lucide-react';
import api from '../lib/api';
import { t, getLang } from '../lib/i18n';

// Admin footer status bar: system info, pending moderation count, live clock.
export default function StatusBar() {
  const [info, setInfo] = useState<any>(null);
  const [pendingComments, setPendingComments] = useState<number>(0);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    api.get('/settings/info').then(r => setInfo(r.data)).catch(() => {});
    api.get('/comments/admin?status=pending&limit=1').then(r => setPendingComments(r.data?.total || 0)).catch(() => {});
    const iv = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(iv);
  }, []);

  // uptime -> human readable
  const uptime = info?.server?.uptime || 0;
  const mins = Math.floor(uptime / 60);
  const uptimeLabel = mins < 1 ? uptime + 's' : mins < 60 ? mins + 'm' : Math.floor(mins / 60) + 'h ' + (mins % 60) + 'm';

  const item = (icon: any, children: React.ReactNode, to?: string) => {
    const inner = React.createElement(React.Fragment, null, React.createElement(icon, { size: 12, className: 'text-gray-400' }), children);
    return to
      ? React.createElement(Link, { key: String(children), to, className: 'inline-flex items-center gap-1.5 hover:text-gray-900 transition-colors' }, inner)
      : React.createElement('span', { key: String(children), className: 'inline-flex items-center gap-1.5' }, inner);
  };

  return React.createElement('footer', { className: 'relative z-50 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 lg:px-8 py-2.5' },
    React.createElement('div', { className: 'flex flex-wrap items-center justify-between gap-x-6 gap-y-1 text-xs text-gray-500' },
      React.createElement('div', { className: 'flex flex-wrap items-center gap-x-5 gap-y-1' },
        info?.site && item(Server, React.createElement(React.Fragment, null,
          React.createElement('span', { className: 'font-medium text-gray-700' }, info.site.title),
          ' · v' + info.site.version)),
        info?.php && item(Database, React.createElement(React.Fragment, null,
          'Node ' + info.php.version.replace(/^v/, ''),
          ' · ' + (info.database?.engine || 'SQLite'),
          ' · ' + t('uptime', getLang()) + ' ' + uptimeLabel)),
        info?.database && item(CheckCircle2, React.createElement(React.Fragment, null,
          t('posts', getLang()) + ': ' + info.database.posts)),
      ),
      React.createElement('div', { className: 'flex items-center gap-x-5' },
        pendingComments > 0 && item(MessageSquare, React.createElement(Link, { to: '/comments', className: 'inline-flex items-center gap-1 text-orange-600 hover:text-orange-700 font-medium' },
          t('pending comments', getLang()) + ': ' + pendingComments), '/comments'),
        item(Clock, now.toLocaleTimeString(getLang() === 'zh' ? 'zh-CN' : 'en-US', { hour12: false })),
      ),
    ),
  );
}
