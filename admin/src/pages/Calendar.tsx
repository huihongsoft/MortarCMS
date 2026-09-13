import React, { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, CalendarDays, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../lib/api';
import { t, getLang } from '../lib/i18n';

interface CalPost { id: string; title: string; slug: string; status: string; publishedAt: string | null; createdAt: string }

const STATUS_CLS: Record<string, string> = {
  published: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  scheduled: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  draft: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400',
  pending: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
};

const WEEKDAYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

export default function Calendar() {
  const [posts, setPosts] = useState<CalPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState(() => { const d = new Date(); return { y: d.getFullYear(), m: d.getMonth() }; });

  useEffect(() => {
    setLoading(true);
    api.get('/posts/admin?limit=300').then(r => { setPosts(r.data.posts || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  // Group posts by their effective date (publishedAt for published/scheduled,
  // createdAt for drafts/pending)
  const byDay = useMemo(() => {
    const map: Record<string, CalPost[]> = {};
    for (const p of posts) {
      const raw = (p.status === 'published' || p.status === 'scheduled') ? p.publishedAt : p.createdAt;
      if (!raw) continue;
      const d = new Date(raw);
      const key = d.getFullYear() + '-' + d.getMonth() + '-' + d.getDate();
      if (!map[key]) map[key] = [];
      map[key].push(p);
    }
    return map;
  }, [posts]);

  const days = useMemo(() => {
    const first = new Date(view.y, view.m, 1);
    const startOffset = first.getDay();
    const total = new Date(view.y, view.m + 1, 0).getDate();
    const cells: (number | null)[] = Array(startOffset).fill(null);
    for (let i = 1; i <= total; i++) cells.push(i);
    while (cells.length % 7 !== 0) cells.push(null);
    return cells;
  }, [view]);

  const today = new Date();

  return React.createElement('div', null,
    // Header
    React.createElement('div', { className: 'flex items-center justify-between mb-6' },
      React.createElement('h2', { className: 'text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2' },
        React.createElement(CalendarDays, { size: 22, className: 'text-primary-600' }), t('calendar', getLang())),
      React.createElement('div', { className: 'flex items-center gap-2' },
        React.createElement('button', { onClick: () => setView({ y: view.y, m: view.m - 1 }), className: 'btn-secondary text-sm px-2.5' }, React.createElement(ChevronLeft, { size: 15 })),
        React.createElement('span', { className: 'text-sm font-semibold text-gray-700 dark:text-gray-200 min-w-28 text-center' }, view.y + ' / ' + String(view.m + 1).padStart(2, '0')),
        React.createElement('button', { onClick: () => setView({ y: view.y, m: view.m + 1 }), className: 'btn-secondary text-sm px-2.5' }, React.createElement(ChevronRight, { size: 15 })),
        React.createElement('button', { onClick: () => { const d = new Date(); setView({ y: d.getFullYear(), m: d.getMonth() }); }, className: 'btn-secondary text-sm' }, t('today', getLang()))),
    ),

    // Legend
    React.createElement('div', { className: 'flex items-center gap-4 mb-4 text-xs text-gray-500 dark:text-gray-400' },
      ['published', 'scheduled', 'draft', 'pending'].map(s =>
        React.createElement('span', { key: s, className: 'flex items-center gap-1.5' },
          React.createElement('span', { className: 'w-2.5 h-2.5 rounded-full ' + STATUS_CLS[s] }), t(s, getLang())))),
    React.createElement('p', { className: 'text-xs text-gray-400 mb-4' }, posts.length + ' ' + t('posts', getLang()) + ' / ' + t('calendar hint', getLang())),

    loading
      ? React.createElement('p', { className: 'text-sm text-gray-400' }, t('loading', getLang()) + '…')
      : React.createElement('div', { className: 'card overflow-x-auto' },
          React.createElement('div', { className: 'min-w-[640px]' },
            // Weekday header
            React.createElement('div', { className: 'grid grid-cols-7 border-b border-gray-200 dark:border-gray-700' },
              WEEKDAYS.map(d => React.createElement('div', { key: d, className: 'px-2 py-2 text-[11px] font-medium uppercase text-gray-400 text-center' }, t(d, getLang())))),
            // Day cells
            React.createElement('div', { className: 'grid grid-cols-7' },
              days.map((day, i) => {
                if (day === null) return React.createElement('div', { key: 'e' + i, className: 'min-h-24 bg-gray-50/50 dark:bg-gray-900/40 border-b border-r border-gray-100 dark:border-gray-800' });
                const key = view.y + '-' + view.m + '-' + day;
                const dayPosts = byDay[key] || [];
                const isToday = day === today.getDate() && view.m === today.getMonth() && view.y === today.getFullYear();
                return React.createElement('div', { key: i, className: 'min-h-24 p-1.5 border-b border-r border-gray-100 dark:border-gray-800' },
                  React.createElement('div', { className: 'text-[11px] font-medium mb-1 ' + (isToday ? 'w-5 h-5 rounded-full bg-primary-600 text-white flex items-center justify-center' : 'text-gray-400') }, day),
                  React.createElement('div', { className: 'space-y-1' },
                    dayPosts.slice(0, 4).map(p =>
                      React.createElement(Link, {
                        key: p.id, to: '/posts/' + p.id + '/edit',
                        className: 'block px-1.5 py-0.5 rounded text-[11px] truncate hover:opacity-80 ' + (STATUS_CLS[p.status] || STATUS_CLS.draft),
                      }, p.title)),
                    dayPosts.length > 4 && React.createElement('p', { className: 'text-[10px] text-gray-400 px-1' }, '+' + (dayPosts.length - 4) + ' ' + t('more', getLang())),
                  ));
              })),
          ),
        ),
    React.createElement('p', { className: 'text-xs text-gray-400 mt-3 flex items-center gap-1' },
      React.createElement(FileText, { size: 12 }), t('calendar note', getLang())),
  );
}
