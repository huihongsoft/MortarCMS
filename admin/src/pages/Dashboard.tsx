import React, { useEffect, useState } from 'react';
import { FileText, Files, MessageSquare, Users, Image, Tag as TagIcon, PenLine } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { t, getLang } from '../lib/i18n';
import RecentActivity from '../components/RecentActivity';
import api from '../lib/api';
import { useToast } from '../lib/toast';

export default function Dashboard() {
  const toast = useToast();
  const [stats, setStats] = useState({ posts: 0, pages: 0, comments: 0, users: 0, media: 0, tags: 0 });
  const [todayPosts, setTodayPosts] = useState(0);
  const [recent, setRecent] = useState<any[]>([]);
  const [statsData, setStatsData] = useState<any>(null);
  const [quickTitle, setQuickTitle] = useState('');
  const [quickContent, setQuickContent] = useState('');
  const navigate = useNavigate();

  async function quickDraft() {
    if (!quickTitle) return;
    try {
      await api.post('/posts', { title: quickTitle, content: quickContent, status: 'draft' });
      setQuickTitle(''); setQuickContent('');
      const r = await api.get('/posts/admin?limit=5'); setRecent(r.data.posts);
      toast.toast(t('draft saved', getLang()));
    } catch { toast.toast(t('failed to save draft', getLang()), 'error'); }
  }

  useEffect(() => {
    api.get('/posts/admin?limit=5').then(r => setRecent(r.data.posts)).catch(() => {});
    Promise.all([
      api.get('/posts/admin?limit=1').then(r => r.data.total),
      api.get('/pages').then(r => r.data.length),
      api.get('/comments/admin?limit=1').then(r => r.data.total),
      api.get('/users').then(r => r.data.length),
      api.get('/media?limit=1').then(r => r.data.total),
    ]).then(([p, pg, c, u, m]) => setStats({ posts: p, pages: pg, comments: c, users: u, media: m, tags: 0 }));
    api.get('/stats?days=14').then(r => setStatsData(r.data)).catch(() => {});
  }, []);

  const cards = [
    { label: t('posts', getLang()), value: stats.posts, icon: FileText, gradient: 'linear-gradient(135deg,#60a5fa,#2563eb)' },
    { label: t('pages', getLang()), value: stats.pages, icon: Files, gradient: 'linear-gradient(135deg,#34d399,#059669)' },
    { label: t('comments', getLang()), value: stats.comments, icon: MessageSquare, gradient: 'linear-gradient(135deg,#a78bfa,#7c3aed)' },
    { label: t('users', getLang()), value: stats.users, icon: Users, gradient: 'linear-gradient(135deg,#fb923c,#ea580c)' },
    { label: t('media', getLang()), value: stats.media, icon: Image, gradient: 'linear-gradient(135deg,#f472b6,#db2777)' },
    { label: t('tags', getLang()), value: (stats as any).tags || 0, icon: TagIcon, gradient: 'linear-gradient(135deg,#2dd4bf,#0d9488)' },
  ];

  return React.createElement('div', null,
    React.createElement('h2', { className: 'text-2xl font-bold text-gray-900 mb-6' }, t('dashboard', getLang())),
    // Row 1: unified stat cards (6 in one row)
    React.createElement('div', { className: 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8' },
      cards.map(c => React.createElement('div', { key: c.label, className: 'card p-4 flex items-center gap-3 hover:shadow-lg hover:-translate-y-1 transition-all duration-200 cursor-default' },
        React.createElement('div', { style: { background: c.gradient }, className: 'w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-md' }, React.createElement(c.icon, { size: 20, className: 'text-white' })),
        React.createElement('div', { className: 'min-w-0' },
          React.createElement('p', { className: 'text-2xl font-bold text-gray-900 leading-tight' }, c.value),
          React.createElement('p', { className: 'text-xs text-gray-500 truncate' }, c.label)
        )
      ))
    ),
    // Row 1.5: Visit stats (PV/UV chart + top posts)
    statsData && React.createElement('div', { className: 'grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8' },
      React.createElement('div', { className: 'card p-5 lg:col-span-2' },
        React.createElement('div', { className: 'flex items-center justify-between mb-3' },
          React.createElement('h3', { className: 'text-sm font-semibold text-gray-900' }, t('visit stats', getLang()) + ' (14 ' + t('days', getLang()) + ')'),
          React.createElement('div', { className: 'flex gap-4 text-xs text-gray-500' },
            React.createElement('span', null, React.createElement('span', { className: 'inline-block w-2 h-2 rounded-full bg-primary-500 mr-1' }), 'PV ' + statsData.total.pv),
            React.createElement('span', null, React.createElement('span', { className: 'inline-block w-2 h-2 rounded-full bg-green-500 mr-1' }), 'UV ' + statsData.total.uv),
          ),
        ),
        React.createElement('div', { className: 'flex items-end gap-1 h-32' },
          statsData.series.map((d: any) => {
            const max = Math.max(...statsData.series.map((x: any) => x.pv), 1);
            const h = Math.round((d.pv / max) * 100);
            return React.createElement('div', { key: d.date, className: 'flex-1 flex flex-col items-center justify-end gap-1 min-w-0' },
              React.createElement('div', { className: 'flex items-end gap-0.5 w-full justify-center' },
                React.createElement('div', { title: 'PV ' + d.pv, className: 'w-2 rounded-t bg-primary-500', style: { height: Math.max(2, Math.round(h * 0.8)) + 'px' } }),
                React.createElement('div', { title: 'UV ' + d.uv, className: 'w-2 rounded-t bg-green-500', style: { height: Math.max(2, Math.round(h * 0.5)) + 'px' } }),
              ),
              React.createElement('span', { className: 'text-[9px] text-gray-400 truncate w-full text-center' }, d.date.slice(5)),
            );
          })
        ),
      ),
      React.createElement('div', { className: 'card p-5' },
        React.createElement('h3', { className: 'text-sm font-semibold text-gray-900 mb-3' }, t('top posts', getLang())),
        statsData.top.length === 0
          ? React.createElement('p', { className: 'text-sm text-gray-400' }, t('no posts yet', getLang()))
          : React.createElement('div', { className: 'space-y-2' }, statsData.top.map((p: any, i: number) =>
              React.createElement('div', { key: p.slug, className: 'flex items-center gap-2' },
                React.createElement('span', { className: 'text-xs text-gray-400 w-4' }, i + 1),
                React.createElement('span', { className: 'flex-1 text-sm text-gray-700 truncate' }, p.title),
                React.createElement('span', { className: 'text-xs text-gray-400' }, p.views + ' ' + t('views', getLang()))
              )
            ))
      )
    ),
    // Row 2: Activity (2/3) + Quick draft (1/3)
    React.createElement('div', { className: 'grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8' },
      React.createElement('div', { className: 'card p-5 lg:col-span-2' },
        React.createElement('h3', { className: 'text-sm font-semibold text-gray-900 mb-3' }, t('activity', getLang())),
        React.createElement(RecentActivity)
      ),
      React.createElement('div', { className: 'card p-5' },
        React.createElement('h3', { className: 'text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2' }, React.createElement(PenLine, { size: 16 }), t('quick draft', getLang())),
        React.createElement('input', { value: quickTitle, onChange: (e: React.ChangeEvent<HTMLInputElement>) => setQuickTitle(e.target.value), placeholder: t('title', getLang()) + '...', className: 'input-field mb-2' }),
        React.createElement('textarea', { value: quickContent, onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => setQuickContent(e.target.value), placeholder: t('content', getLang()) + '...', className: 'input-field mb-3', rows: 5 }),
        React.createElement('button', { onClick: quickDraft, disabled: !quickTitle, className: 'btn-primary text-xs w-full justify-center whitespace-nowrap' }, t('save draft', getLang()))
      )
    ),
    // Row 3: Recent posts (2/3) + Recent comments (1/3)
    React.createElement('div', { className: 'grid grid-cols-1 lg:grid-cols-3 gap-6' },
      React.createElement('div', { className: 'card p-5 lg:col-span-2' },
        React.createElement('h3', { className: 'text-sm font-semibold text-gray-900 mb-3' }, t('recent posts', getLang())),
        recent.length === 0
          ? React.createElement('p', { className: 'text-sm text-gray-500' }, t('no posts yet', getLang()))
          : React.createElement('div', { className: 'space-y-2' }, recent.map((p: any) =>
              React.createElement('div', { key: p.id, className: 'p-3 rounded-lg bg-gray-50 flex items-center justify-between gap-3' },
                React.createElement('div', { className: 'min-w-0' },
                  React.createElement('p', { className: 'font-medium text-gray-900 truncate' }, p.title),
                  React.createElement('p', { className: 'text-xs text-gray-500' }, `${t('by', getLang())} ${p.author?.username} · ${new Date(p.createdAt).toLocaleDateString()}`)
                ),
                React.createElement('span', { className: `px-2 py-1 text-xs rounded-full font-medium shrink-0 ${p.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}` }, p.status)
              )
            ))
      ),
      React.createElement('div', { className: 'card p-5' },
        React.createElement('h3', { className: 'text-sm font-semibold text-gray-900 mb-3' }, t('recent comments', getLang())),
        React.createElement('p', { className: 'text-sm text-gray-500' }, t('no recent comments', getLang()))
      )
    )
  );
}
