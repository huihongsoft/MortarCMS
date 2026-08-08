import React, { useEffect, useState } from 'react';
import { Check, X, Trash2, Trash, Sparkles } from 'lucide-react';
import { useToast } from '../lib/toast';
import { t, getLang } from '../lib/i18n';
import api from '../lib/api';

export default function Comments() {
  const [comments, setComments] = useState<any[]>([]);
  const toast = useToast();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState('');
  const [aiReview, setAiReview] = useState<any[] | null>(null);
  const [aiReviewing, setAiReviewing] = useState(false);
  useEffect(() => { fetchComments(); }, [filter]);
  async function fetchComments() { const r = await api.get(`/comments/admin?limit=50&status=${filter}`); setComments(r.data.comments); }
  async function updateStatus(id: string, status: string) { await api.put(`/comments/${id}`, { status }); fetchComments(); }
  async function del(id: string) { if (!confirm(t('delete?', getLang()))) return; await api.delete('/comments/' + id); fetchComments(); }
  async function bulkAction(act: string) { if (selected.size === 0) return; await api.post('/comments/bulk-action', { ids: Array.from(selected), action: act }); toast.toast(selected.size + ' ' + t('comments', getLang()) + ' ' + act); setSelected(new Set()); fetchComments(); }
  async function runAiReview() {
    if (aiReviewing) return;
    setAiReviewing(true);
    setAiReview(null);
    try {
      const r = await api.post('/ai/review-comments');
      setAiReview(r.data.verdicts || []);
    } catch (e: any) { alert(e.response?.data?.error || 'AI 审核失败'); }
    finally { setAiReviewing(false); }
  }

  function toggle(id: string) { const n = new Set(selected); n.has(id) ? n.delete(id) : n.add(id); setSelected(n); }
  function selectAll() { if (selected.size === comments.length) setSelected(new Set()); else setSelected(new Set(comments.map((c: any) => c.id))); }

  return React.createElement('div', null,
    React.createElement('h2', { className: 'text-2xl font-bold text-gray-900 mb-6' }, t('comments', getLang())),
    React.createElement('div', { className: 'flex items-center gap-2 mb-4' },
      React.createElement('button', { onClick: selectAll, className: 'btn-secondary text-xs' }, selected.size === comments.length ? t('deselect', getLang()) : t('select all', getLang())),
      selected.size > 0 && React.createElement(React.Fragment, null,
        React.createElement('button', { onClick: () => bulkAction('approved'), className: 'btn-secondary text-xs' }, t('approve', getLang()) + ' (' + selected.size + ')'),
        React.createElement('button', { onClick: () => bulkAction('spam'), className: 'btn-secondary text-xs' }, t('spam', getLang())),
        React.createElement('button', { onClick: () => bulkAction('trash'), className: 'btn-danger text-xs' }, React.createElement(Trash, { size: 12 }), t('delete', getLang()))
      )
    ),
    React.createElement('div', { className: 'flex items-center gap-3 mb-4' },
      React.createElement('button', {
        onClick: runAiReview,
        disabled: aiReviewing,
        className: 'flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg border border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-100 disabled:opacity-50',
      }, React.createElement(Sparkles, { size: 13 }), aiReviewing ? t('reviewing', getLang()) + '...' : t('ai review comments', getLang())),
      ['all', 'pending', 'approved', 'spam'].map(s =>
        React.createElement('button', { key: s, onClick: () => setFilter(s === 'all' ? '' : s), className: `px-3 py-1.5 text-sm rounded-lg ${(s === 'all' && !filter) || filter === s ? 'bg-primary-600 text-white' : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-50'}` }, s.charAt(0).toUpperCase() + s.slice(1))
      )
    ),
    aiReview && React.createElement('div', { className: 'card p-4 mb-4 border-purple-200 dark:border-purple-800' },
      React.createElement('p', { className: 'text-xs font-semibold text-gray-700 dark:text-gray-200 mb-2' }, t('ai review results', getLang())),
      aiReview.length === 0 && React.createElement('p', { className: 'text-xs text-gray-400' }, t('no pending comments to review', getLang())),
      React.createElement('div', { className: 'space-y-1.5' },
        aiReview.map((v: any) => React.createElement('div', { key: v.id, className: 'flex items-center gap-2 text-xs' },
          React.createElement('span', { className: 'px-1.5 py-0.5 rounded-full ' + (v.verdict === 'spam' ? 'bg-red-100 text-red-700 dark:bg-red-500/20' : 'bg-green-100 text-green-700 dark:bg-green-500/20') }, v.verdict),
          React.createElement('span', { className: 'flex-1 text-gray-600 dark:text-gray-300 truncate' }, v.reason || v.id),
          React.createElement('button', {
            onClick: async () => { await updateStatus(v.id, v.verdict); setAiReview(aiReview.filter(x => x.id !== v.id)); },
            className: 'text-primary-600 hover:text-primary-700 font-medium',
          }, t('apply', getLang()))
        )))
    ),
    comments.length === 0 ? React.createElement('p', { className: 'text-gray-500' }, t('no comments yet', getLang()))
    : React.createElement('div', { className: 'space-y-2' }, comments.map((c: any) =>
        React.createElement('div', { key: c.id, className: 'card p-3 flex items-start gap-3' },
          // Selection checkbox — left side
          React.createElement('input', { type: 'checkbox', checked: selected.has(c.id), onChange: () => toggle(c.id), className: 'mt-1 w-4 h-4 rounded border-gray-300 text-primary-600 flex-shrink-0' }),
          // Content area
          React.createElement('div', { className: 'flex-1 min-w-0' },
            React.createElement('div', { className: 'flex items-center gap-2 mb-0.5' },
              React.createElement('span', { className: 'font-medium text-sm text-gray-900' }, c.author),
              c.email && React.createElement('span', { className: 'text-xs text-gray-400' }, c.email),
              React.createElement('span', { className: `px-1.5 py-0.5 text-xs rounded-full ${c.status === 'approved' ? 'bg-green-100 text-green-700' : c.status === 'spam' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}` }, c.status)
            ),
            React.createElement('p', { className: 'text-sm text-gray-700 mt-1' }, c.content),
            React.createElement('p', { className: 'text-xs text-gray-400 mt-1' }, `${t('on', getLang())}: ${c.post?.title || t('unknown', getLang())} · ${new Date(c.createdAt).toLocaleString()}`)
          ),
          // Action buttons — same icon-only pattern used across Posts/Pages/Categories/Users
          React.createElement('div', { className: 'flex items-center gap-1 ml-4 flex-shrink-0' },
            c.status !== 'approved' && React.createElement('button', { onClick: () => updateStatus(c.id, 'approved'), className: 'p-1.5 text-gray-400 hover:text-green-600', title: t('approve', getLang()) }, React.createElement(Check, { size: 16 })),
            c.status !== 'spam' && React.createElement('button', { onClick: () => updateStatus(c.id, 'spam'), className: 'p-1.5 text-gray-400 hover:text-red-600', title: t('spam', getLang()) }, React.createElement(X, { size: 16 })),
            React.createElement('button', { onClick: () => del(c.id), className: 'p-1.5 text-gray-400 hover:text-red-600', title: t('delete', getLang()) }, React.createElement(Trash2, { size: 16 }))
          )
        )
      ))
  );
}
