import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit2, Trash2, Eye, Pin, Trash, Copy } from 'lucide-react';
import { useToast } from '../lib/toast';
import api from '../lib/api';
import { t, getLang } from '../lib/i18n';

export default function Posts() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const toast = useToast();
  const [quickEdit, setQuickEdit] = useState<any>(null);
  const [qeTitle, setQeTitle] = useState('');
  const [qeStatus, setQeStatus] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortDir, setSortDir] = useState('desc');
  const [counts, setCounts] = useState<Record<string,number>>({});
  const [filter, setFilter] = useState('');

  useEffect(() => { api.get('/posts/admin?limit=1').then(r => setCounts(c => ({...c, all: r.data.total || 0}))).catch(()=>{}); api.get('/posts/admin?status=published&limit=1').then(r => setCounts(c => ({...c, published: r.data.total || 0}))).catch(()=>{}); api.get('/posts/admin?status=draft&limit=1').then(r => setCounts(c => ({...c, draft: r.data.total || 0}))).catch(()=>{}); api.get('/posts/admin?status=trash&limit=1').then(r => setCounts(c => ({...c, trash: r.data.total || 0}))).catch(()=>{}); }, []);
  useEffect(() => { fetchPosts(); }, [page, filter]);

  async function fetchPosts() {
    setLoading(true);
    try { const r = await api.get(`/posts/admin?page=${page}&limit=15&status=${filter}`); setPosts(r.data.posts); setTotal(r.data.total); } catch {} finally { setLoading(false); }
  }

  async function deletePost(id: string) { if (!confirm(t('delete this post', getLang()))) return; await api.delete(`/posts/${id}`); fetchPosts(); }

  async function quickSave() {
    if (!quickEdit) return;
    await api.put('/posts/' + quickEdit.id, { title: qeTitle, status: qeStatus });
    toast.toast(t('post updated', getLang()));
    setQuickEdit(null);
    fetchPosts();
  }
  function openQuickEdit(p: any) { setQuickEdit(p); setQeTitle(p.title); setQeStatus(p.status); }

  async function bulkTrash() {
    if (selected.size === 0) return;
    await api.post('/posts/bulk-trash', { ids: Array.from(selected) });
    toast.toast(`${selected.size} ${t('posts trashed', getLang())}`);
    setSelected(new Set());
    fetchPosts();
  }

  async function bulkRestore() {
    if (selected.size === 0) return;
    await api.post('/posts/bulk-restore', { ids: Array.from(selected) });
    toast.toast(selected.size + ' ' + t('posts restored', getLang()));
    setSelected(new Set());
    fetchPosts();
  }

  async function bulkDelete() {
    if (selected.size === 0) return;
    if (!confirm(t('permanently delete', getLang()) + ' ' + selected.size + ' ' + t('posts', getLang()) + '?')) return;
    await api.post('/posts/bulk-delete', { ids: Array.from(selected) });
    toast.toast(selected.size + ' ' + t('posts permanently deleted', getLang()));
    setSelected(new Set());
    fetchPosts();
  }

  async function toggleSticky(id: string) {
    const r = await api.put(`/posts/${id}/sticky`);
    toast.toast(r.data.sticky ? t('post pinned', getLang()) : t('post unpinned', getLang()));
    fetchPosts();
  }

  async function clonePost(id: string) {
    await api.post('/posts/' + id + '/clone');
    toast.toast(t('post cloned', getLang()));
    fetchPosts();
  }

  async function restorePost(id: string) {
    await api.put(`/posts/${id}/restore`);
    toast.toast(t('post restored to draft', getLang()));
    fetchPosts();
  }


  return React.createElement('div', null,
    React.createElement('div', { className: 'flex items-center justify-between mb-6' },
      React.createElement('h2', { className: 'text-2xl font-bold text-gray-900' }, t('posts', getLang())),
      React.createElement(Link, { to: '/posts/new', className: 'btn-primary' }, React.createElement(Plus, { size: 16 }), t('new post', getLang()))
    ),
    
      React.createElement('div', { className: 'flex items-center gap-3 mb-4' },
        selected.size > 0 && (
          filter === 'trash'
            ? React.createElement('div', { className: 'flex items-center gap-2' },
                React.createElement('button', { onClick: bulkRestore, className: 'btn-secondary text-xs' }, t('restore selected', getLang()) + ' (' + selected.size + ')'),
                React.createElement('button', { onClick: bulkDelete, className: 'btn-danger text-xs' }, t('delete permanently', getLang()) + ' (' + selected.size + ')'),
              )
            : React.createElement('button', { onClick: bulkTrash, className: 'btn-danger text-xs' }, React.createElement(Trash, { size: 14 }), t('trash selected', getLang()) + ' (' + selected.size + ')')
        )
      ),
      React.createElement('div', { className: 'flex items-center gap-3 mb-4 flex-wrap' },
      ['all', 'published', 'draft', 'trash'].map(s =>
        
  
      React.createElement('button', { key: s, onClick: () => { setFilter(s === 'all' ? '' : s); setPage(1); }, className: `px-3 py-1.5 text-sm rounded-lg whitespace-nowrap ${(s === 'all' && !filter) || filter === s ? 'bg-primary-600 text-white' : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-50'}` }, t(s, getLang()))
      )
    ),
    loading ? React.createElement('p', { className: 'text-gray-500' }, t('loading', getLang()))
    : posts.length === 0 ? React.createElement('p', { className: 'text-gray-500' }, t('no posts found', getLang()))
    : React.createElement('div', { className: 'card overflow-hidden' },
        React.createElement('table', { className: 'w-full' },
          React.createElement('thead', null, React.createElement('tr', { className: 'border-b border-gray-200 bg-gray-50' },
            React.createElement('th', { className: 'text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase cursor-pointer hover:text-gray-700', onClick: () => { setSortBy('title'); setSortDir(sortDir === 'asc' ? 'desc' : 'asc'); } }, t('title', getLang()) + (sortBy === 'title' ? (sortDir === 'asc' ? ' \u2191' : ' \u2193') : '')),
            React.createElement('th', { className: 'text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase' }, t('author', getLang())),
            React.createElement('th', { className: 'text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase' }, t('status', getLang())),
            React.createElement('th', { className: 'text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase' }, t('views', getLang())),
            React.createElement('th', { className: 'text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase cursor-pointer hover:text-gray-700', onClick: () => { setSortBy('createdAt'); setSortDir(sortDir === 'asc' ? 'desc' : 'asc'); } }, t('date', getLang()) + (sortBy === 'createdAt' ? (sortDir === 'asc' ? ' \u2191' : ' \u2193') : '')),
            React.createElement('th', { className: 'text-left px-2 py-3 text-xs font-medium text-gray-500 uppercase w-8' }, React.createElement('input', { type: 'checkbox', onChange: (e: React.ChangeEvent<HTMLInputElement>) => { if (e.target.checked) setSelected(new Set(posts.map((p: any) => p.id))); else setSelected(new Set()); } })),
            React.createElement('th', { className: 'text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase' }, t('actions', getLang())),
          )),
          React.createElement('tbody', null, posts.map((p: any) =>
            
              React.createElement('tr', { key: p.id, className: `border-b border-gray-100 hover:bg-gray-50 ${p.sticky ? 'bg-orange-50/50' : ''}` },
              React.createElement('td', { className: 'px-4 py-3' }, React.createElement('div', { className: 'flex items-center gap-2' }, p.featured ? React.createElement('img', { src: p.featured, alt: '', className: 'w-8 h-8 object-cover rounded' }) : React.createElement('div', { className: 'w-8 h-8 bg-gray-100 rounded flex items-center justify-center' }, React.createElement('span', { className: 'text-xs text-gray-400' }, 'IMG')), React.createElement('span', { className: 'font-medium text-gray-900' }, p.title))),
              React.createElement('td', { className: 'px-4 py-3 text-sm text-gray-500' }, p.author?.username),
              React.createElement('td', { className: 'px-4 py-3' }, React.createElement('span', { className: 'flex items-center gap-1.5' }, p.password ? React.createElement('span', { className: 'text-xs text-gray-400', title: t('password protected', getLang()) }, '\u{1F512}') : null, p.sticky ? React.createElement(Pin, { size: 12, className: 'text-orange-500' }) : null, React.createElement('span', { className: `px-2 py-1 text-xs rounded-full font-medium ${p.status === 'published' ? 'bg-green-100 text-green-700' : p.status === 'draft' ? 'bg-yellow-100 text-yellow-700' : p.status === 'trash' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'}` }, p.status))),
              React.createElement('td', { className: 'px-4 py-3 text-sm text-gray-500' }, p.views || 0),
              React.createElement('td', { className: 'px-4 py-3 text-sm text-gray-500' }, (p.publishedAt ? new Date(p.publishedAt).toLocaleDateString() : t('draft', getLang())) + (p.revisionCount ? ' (' + p.revisionCount + ' ' + t('revs', getLang()) + ')' : '')),
              React.createElement('td', { className: 'px-2 py-3' }, React.createElement('input', { type: 'checkbox', checked: selected.has(p.id), onChange: (e: React.ChangeEvent<HTMLInputElement>) => { const next = new Set(selected); e.target.checked ? next.add(p.id) : next.delete(p.id); setSelected(next); } })),
              React.createElement('td', { className: 'px-4 py-3' },
                React.createElement('div', { className: 'flex items-center justify-end gap-2' },
                  p.status === 'published' && React.createElement('a', { href: '/post/' + p.slug, target: '_blank', className: 'p-1.5 text-gray-400 hover:text-green-600', title: t('view post', getLang()) }, React.createElement(Eye, { size: 16 })),
                  React.createElement(Link, { to: `/posts/${p.id}/edit`, className: 'p-1.5 text-gray-400 hover:text-primary-600' }, React.createElement(Edit2, { size: 16 })),
                  p.status === 'trash' ? React.createElement('button', { onClick: () => restorePost(p.id), className: 'p-1.5 text-gray-400 hover:text-green-600', title: t('restore', getLang()) }, React.createElement('svg', { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, className: 'lucide' }, React.createElement('polyline', { points: '1 4 1 10 7 10' }), React.createElement('path', { d: 'M3.51 15a9 9 0 1 0 2.13-9.36L1 10' }))) : React.createElement('button', { onClick: () => toggleSticky(p.id), className: `p-1.5 ${p.sticky ? 'text-orange-500' : 'text-gray-400 hover:text-orange-500'}`, title: p.sticky ? t('unpin', getLang()) : t('pin', getLang()) }, React.createElement(Pin, { size: 16 })),
                  React.createElement('button', { onClick: () => deletePost(p.id), className: 'p-1.5 text-gray-400 hover:text-red-600' }, React.createElement(Trash2, { size: 16 }))
                )
              )
            )
          ))
        ),
        React.createElement('div', { className: 'flex items-center justify-between px-4 py-3 border-t border-gray-200' },
          React.createElement('span', { className: 'text-sm text-gray-500' }, `${total} ${t('posts total', getLang())}`),
          React.createElement('div', { className: 'flex gap-2' },
            React.createElement('button', { onClick: () => setPage(p => Math.max(1, p - 1)), disabled: page === 1, className: 'btn-secondary text-xs' }, t('previous', getLang())),
            React.createElement('button', { onClick: () => setPage(p => p + 1), disabled: page * 15 >= total, className: 'btn-secondary text-xs' }, t('next', getLang()))
          )
        )
      )
  );
}
