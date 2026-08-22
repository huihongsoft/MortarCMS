import React, { useEffect, useState } from 'react';
import { FileText, Files, MessageSquare, Users, Image, Tag as TagIcon, PenLine, Sparkles, Clock, AlertCircle, Trash2, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { t, getLang } from '../lib/i18n';
import RecentActivity from '../components/RecentActivity';
import api from '../lib/api';
import { useToast } from '../lib/toast';

export default function Dashboard() {
  const toast = useToast();
  const [stats, setStats] = useState({ posts: 0, pages: 0, comments: 0, users: 0, media: 0, tags: 0 });
  const [postStatus, setPostStatus] = useState<Record<string, number>>({});
  const [commentStatus, setCommentStatus] = useState<Record<string, number>>({});
  const [recent, setRecent] = useState<any[]>([]);
  const [recentComments, setRecentComments] = useState<any[]>([]);
  const [hotTags, setHotTags] = useState<any[]>([]);
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
    api.get('/stats/dashboard').then(r => {
      setStats({
        posts: r.data.counts.posts, pages: r.data.counts.pages, comments: r.data.counts.comments,
        users: r.data.counts.users, media: r.data.counts.media, tags: r.data.counts.tags,
      });
      setPostStatus(r.data.postStatus || {});
      setCommentStatus(r.data.commentStatus || {});
      setRecent(r.data.recent?.posts || []);
      setRecentComments(r.data.recent?.comments || []);
    }).catch(() => {});
    api.get('/stats?days=14').then(r => setStatsData(r.data)).catch(() => {});
    // Hot tags: aggregated published-post views, top 8
    api.get('/tags').then(r => setHotTags((r.data || []).sort((a: any, b: any) => (b._count?.views || 0) - (a._count?.views || 0)).slice(0, 8))).catch(() => {});
  }, []);

  const cards = [
    { label: t('posts', getLang()), value: stats.posts || 0, icon: FileText, gradient: 'linear-gradient(135deg,#60a5fa,#2563eb)' },
    { label: t('pages', getLang()), value: stats.pages || 0, icon: Files, gradient: 'linear-gradient(135deg,#34d399,#059669)' },
    { label: t('comments', getLang()), value: stats.comments || 0, icon: MessageSquare, gradient: 'linear-gradient(135deg,#a78bfa,#7c3aed)' },
    { label: t('users', getLang()), value: stats.users || 0, icon: Users, gradient: 'linear-gradient(135deg,#fb923c,#ea580c)' },
    { label: t('media', getLang()), value: stats.media || 0, icon: Image, gradient: 'linear-gradient(135deg,#f472b6,#db2777)' },
    { label: t('tags', getLang()), value: (stats as any).tags || 0, icon: TagIcon, gradient: 'linear-gradient(135deg,#2dd4bf,#0d9488)' },
  ];

  const glance = [
    { label: t('drafts', getLang()), value: postStatus.draft || 0, to: '/posts?status=draft', icon: PenLine, color: 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/30' },
    { label: t('scheduled', getLang()), value: postStatus.scheduled || 0, to: '/posts?status=scheduled', icon: Clock, color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/30' },
    { label: t('pending comments', getLang()), value: commentStatus.pending || 0, to: '/comments?status=pending', icon: AlertCircle, color: 'text-orange-600 bg-orange-50 dark:bg-orange-900/30' },
    { label: t('spam', getLang()), value: commentStatus.spam || 0, to: '/comments?status=spam', icon: Trash2, color: 'text-red-600 bg-red-50 dark:bg-red-900/30' },
  ];

  return React.createElement('div', null,
    // Welcome banner with quick actions
    React.createElement('div', { className: 'rounded-2xl p-6 mb-6 text-white shadow-lg', style: { background: 'linear-gradient(135deg,#2563eb,#7c3aed)' } },
      React.createElement('div', { className: 'flex flex-col lg:flex-row lg:items-center gap-4 justify-between' },
        React.createElement('div', null,
          React.createElement('p', { className: 'text-sm text-white/80 mb-1' }, t('welcome back', getLang()) + ' \u{1F44B}'),
          React.createElement('h3', { className: 'text-xl font-bold' }, t('everything looks good today', getLang())),
          React.createElement('p', { className: 'text-sm text-white/70 mt-1' }, t('dashboard summary', getLang()))
        ),
        React.createElement('div', { className: 'flex flex-wrap gap-2' },
          React.createElement('button', { onClick: () => navigate('/posts/new'), className: 'px-4 py-2 rounded-xl bg-white/15 hover:bg-white/25 backdrop-blur text-sm font-medium flex items-center gap-1.5 transition-colors' }, React.createElement(PenLine, { size: 14 }), t('write post', getLang())),
          React.createElement('button', { onClick: () => navigate('/media'), className: 'px-4 py-2 rounded-xl bg-white/15 hover:bg-white/25 backdrop-blur text-sm font-medium flex items-center gap-1.5 transition-colors' }, React.createElement(Image, { size: 14 }), t('upload media', getLang())),
          React.createElement('button', { onClick: () => navigate('/comments'), className: 'px-4 py-2 rounded-xl bg-white/15 hover:bg-white/25 backdrop-blur text-sm font-medium flex items-center gap-1.5 transition-colors' }, React.createElement(MessageSquare, { size: 14 }), t('comments', getLang())),
          React.createElement('button', { onClick: () => navigate('/pages'), className: 'px-4 py-2 rounded-xl bg-white/15 hover:bg-white/25 backdrop-blur text-sm font-medium flex items-center gap-1.5 transition-colors' }, React.createElement(Files, { size: 14 }), t('pages', getLang()))
        )
      )
    ),
    // At-a-glance actionable row
    React.createElement('div', { className: 'grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8' },
      glance.map(g =>
        React.createElement('button', { key: g.label, onClick: () => navigate(g.to), className: 'card p-4 flex items-center gap-3 hover:shadow-lg transition-all text-left' },
          React.createElement('div', { className: 'w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ' + g.color }, React.createElement(g.icon, { size: 17 })),
          React.createElement('div', null,
            React.createElement('p', { className: 'text-xl font-bold text-gray-900 leading-tight' }, g.value),
            React.createElement('p', { className: 'text-xs text-gray-500' }, g.label)
          )
        )
      )
    ),
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
          React.createElement('div', { className: 'flex items-center gap-3' },
            React.createElement('div', { className: 'flex gap-4 text-xs text-gray-500' },
              React.createElement('span', null, React.createElement('span', { className: 'inline-block w-2 h-2 rounded-full bg-primary-500 mr-1' }), 'PV ' + statsData.total.pv),
              React.createElement('span', null, React.createElement('span', { className: 'inline-block w-2 h-2 rounded-full bg-green-500 mr-1' }), 'UV ' + statsData.total.uv),
            ),
            React.createElement('button', { onClick: () => navigate('/stats'), className: 'inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium border border-gray-200 text-gray-600 hover:border-primary-400 hover:text-primary-600 transition-colors' }, t('more', getLang()), React.createElement(ArrowRight, { size: 12 })),
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
              React.createElement('span', { className: 'text-[10px] text-gray-500 truncate w-full text-center' }, d.date.slice(5)),
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
                React.createElement('span', { className: `px-2 py-1 text-xs rounded-full font-medium shrink-0 ${p.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}` }, t(p.status, getLang()))
              )
            ))
      ),
      React.createElement('div', { className: 'card p-5' },
        React.createElement('h3', { className: 'text-sm font-semibold text-gray-900 mb-3' }, t('recent comments', getLang())),
        recentComments.length === 0
          ? React.createElement('p', { className: 'text-sm text-gray-500' }, t('no recent comments', getLang()))
          : React.createElement('div', { className: 'space-y-2' }, recentComments.map((c: any) =>
              React.createElement('div', { key: c.id, className: 'p-3 rounded-lg bg-gray-50' },
                React.createElement('p', { className: 'text-sm text-gray-700 line-clamp-2' }, c.content),
                React.createElement('p', { className: 'text-xs text-gray-500 mt-1' }, `${c.author} · ${new Date(c.createdAt).toLocaleDateString()}`)
              )
            ))
      )
    ),
    // Row 4: Hot tags (ranked by aggregated published-post views)
    hotTags.length > 0 && React.createElement('div', { className: 'card p-5 mt-8' },
      React.createElement('h3', { className: 'text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2' }, React.createElement(TagIcon, { size: 15, className: 'text-primary-500' }), t('hot tags', getLang())),
      React.createElement('div', { className: 'flex flex-wrap gap-2' },
        hotTags.map((tg, i) =>
          React.createElement('button', {
            key: tg.id,
            onClick: () => navigate('/tags'),
            className: 'px-2.5 py-1 text-xs rounded-full border ' + (i < 3 ? 'bg-primary-50 border-primary-200 text-primary-700' : 'bg-gray-50 border-gray-200 text-gray-600 hover:border-primary-300'),
            title: (tg._count?.views || 0).toLocaleString() + ' ' + t('views', getLang()),
          }, `#${i + 1} ${tg.name} · ${(tg._count?.views || 0).toLocaleString()}`)
        )
      )
    )
  );
}
