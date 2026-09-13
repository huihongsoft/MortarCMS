import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Edit2, Trash2, Eye, Pin, Trash, Copy, FileText, Languages, Search, X } from 'lucide-react';
import EmptyState from '../components/EmptyState';
import { useToast } from '../lib/toast';
import api from '../lib/api';
import { t, getLang } from '../lib/i18n';
import Select from '../components/Select';

export default function Posts() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const toast = useToast();
  const [quickEdit, setQuickEdit] = useState<any>(null);
  const [batchLang, setBatchLang] = useState('English');
  const [batchRunning, setBatchRunning] = useState(false);
  const [batchResults, setBatchResults] = useState<any[] | null>(null);
  const [qeTitle, setQeTitle] = useState('');
  const [qeStatus, setQeStatus] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortDir, setSortDir] = useState('desc');
  const [counts, setCounts] = useState<Record<string,number>>({});
  const [filter, setFilter] = useState(() => new URLSearchParams(window.location.search).get('status') || '');
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [sites, setSites] = useState<any[]>([]);
  const [siteFilter, setSiteFilter] = useState('all');
  // Site column/filter only make sense once more than one site exists.
  const multiSite = sites.length > 1;
  useEffect(() => { api.get('/sites').then(r => setSites(r.data?.sites || r.data || [])).catch(() => {}); }, []);
  const siteName = (id: string | null) => (id ? (sites.find((s: any) => s.id === id)?.name || id) : t('global (all sites)', getLang()));
  // Debounce the search box so we don't hit the API on every keystroke
  useEffect(() => {
    const h = setTimeout(() => { setSearch(searchInput.trim()); setPage(1); }, 300);
    return () => clearTimeout(h);
  }, [searchInput]);
  // Keep the status filter in the URL so dashboard links land on the right list
  useEffect(() => {
    const url = new URL(window.location.href);
    if (filter) url.searchParams.set('status', filter); else url.searchParams.delete('status');
    window.history.replaceState(null, '', url.toString());
  }, [filter]);

  useEffect(() => {
    const sf = '&siteId=' + encodeURIComponent(siteFilter);
    api.get('/posts/admin?limit=1' + sf).then(r => setCounts(c => ({...c, all: r.data.total || 0}))).catch(()=>{});
    api.get('/posts/admin?status=published&limit=1' + sf).then(r => setCounts(c => ({...c, published: r.data.total || 0}))).catch(()=>{});
    api.get('/posts/admin?status=draft&limit=1' + sf).then(r => setCounts(c => ({...c, draft: r.data.total || 0}))).catch(()=>{});
    api.get('/posts/admin?status=pending&limit=1' + sf).then(r => setCounts(c => ({...c, pending: r.data.total || 0}))).catch(()=>{});
    api.get('/posts/admin?status=trash&limit=1' + sf).then(r => setCounts(c => ({...c, trash: r.data.total || 0}))).catch(()=>{});
  }, [siteFilter]);
  useEffect(() => { fetchPosts(); }, [page, filter, sortBy, sortDir, search, siteFilter]);

  async function fetchPosts() {
    setLoading(true);
    try {
      const q = `/posts/admin?page=${page}&limit=15&status=${filter}&sortBy=${sortBy}&sortDir=${sortDir}${search ? '&search=' + encodeURIComponent(search) : ''}&siteId=${encodeURIComponent(siteFilter)}`;
      const r = await api.get(q); setPosts(r.data.posts); setTotal(r.data.total);
    } catch {} finally { setLoading(false); }
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

  async function bulkStatus(status: string) {
    if (selected.size === 0) return;
    await api.post('/posts/bulk-status', { ids: Array.from(selected), status });
    toast.toast(selected.size + ' ' + t('posts', getLang()) + ' → ' + t(status, getLang()));
    setSelected(new Set());
    fetchPosts();
  }
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

  async function batchTranslate() {
    if (selected.size === 0 || batchRunning) return;
    setBatchRunning(true); setBatchResults(null);
    try {
      const r = await api.post('/ai/batch-translate', { ids: Array.from(selected), language: batchLang });
      setBatchResults(r.data.results || []);
      setSelected(new Set());
    } catch (e: any) { alert(e.response?.data?.error || t('save failed', getLang())); }
    finally { setBatchRunning(false); }
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

  // Review workflow: approve publishes the pending submission, reject sends
  // it back to draft with an optional reason (notified to the author)
  async function reviewPost(id: string, action: 'approve' | 'reject') {
    let reason = '';
    if (action === 'reject') {
      reason = window.prompt(t('rejection reason prompt', getLang())) || '';
    }
    try {
      await api.post('/posts/' + id + '/review', { action, reason });
      toast.toast(action === 'approve' ? t('post approved', getLang()) : t('post rejected', getLang()));
      fetchPosts();
    } catch (e: any) { toast.toast(e?.response?.data?.error || String(e), 'error'); }
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
            : React.createElement(React.Fragment, null,
                React.createElement('button', { onClick: () => bulkStatus('published'), className: 'btn-secondary text-xs' }, t('publish selected', getLang()) + ' (' + selected.size + ')'),
                React.createElement('button', { onClick: () => bulkStatus('draft'), className: 'btn-secondary text-xs' }, t('draft selected', getLang()) + ' (' + selected.size + ')'),
                React.createElement('button', { onClick: bulkTrash, className: 'btn-danger text-xs' }, React.createElement(Trash, { size: 14 }), t('trash selected', getLang()) + ' (' + selected.size + ')'),
                React.createElement('div', { className: 'flex items-center gap-1' },
                  React.createElement(Select, { value: batchLang, onChange: (v: string) => setBatchLang(v), className: 'input-field w-28 text-xs' },
                    ['English', '日本語', '한국어', 'Français', 'Deutsch', 'Español', '简体中文'].map(l => React.createElement('option', { key: l, value: l }, l))),
                  React.createElement('button', { onClick: batchTranslate, disabled: batchRunning, className: 'btn-secondary text-xs' },
                    React.createElement(Languages, { size: 13 }), batchRunning ? t('translating', getLang()) + '...' : t('ai translate selected', getLang())))
              )
        )
      ),
      batchResults && React.createElement('div', { className: 'card p-4 mb-4 border-primary-200 dark:border-primary-800' },
        React.createElement('p', { className: 'text-xs font-semibold text-gray-700 dark:text-gray-200 mb-2' }, t('translation results', getLang())),
        React.createElement('div', { className: 'space-y-1' },
          batchResults.map((r: any, i: number) => React.createElement('div', { key: i, className: 'flex items-center gap-2 text-xs' },
            r.status === 'ok'
              ? React.createElement(React.Fragment, null,
                  React.createElement('span', { className: 'text-green-600' }, '✓'),
                  React.createElement('span', { className: 'flex-1 text-gray-600 dark:text-gray-300 truncate' }, r.title),
                  React.createElement(Link, { to: '/posts/' + r.id + '/edit', className: 'text-primary-600 hover:text-primary-700' }, t('edit', getLang())))
              : React.createElement(React.Fragment, null,
                  React.createElement('span', { className: 'text-red-500' }, '✗'),
                  React.createElement('span', { className: 'flex-1 text-gray-600 truncate' }, r.source || r.error))
          )))
      ),
      React.createElement('div', { className: 'flex items-center gap-3 mb-4 flex-wrap' },
      ['all', 'published', 'draft', 'pending', 'trash'].map(s =>
        
  
      React.createElement('button', { key: s, onClick: () => { setFilter(s === 'all' ? '' : s); setPage(1); }, className: `px-3 py-1.5 text-sm rounded-lg whitespace-nowrap ${(s === 'all' && !filter) || filter === s ? 'bg-primary-600 text-white' : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-50'}` }, t(s, getLang()))
      ),
      // Site filter (only when more than one site exists)
      multiSite && React.createElement(Select, {
        value: siteFilter,
        onChange: (v: string) => { setSiteFilter(v); setPage(1); },
        className: 'input-field w-40 text-sm',
      },
        React.createElement('option', { value: 'all' }, t('all sites', getLang())),
        React.createElement('option', { value: 'global' }, t('global (all sites)', getLang())),
        sites.map((st: any) => React.createElement('option', { key: st.id, value: st.id }, st.name))
      ),
      // Search box (fuzzy match on title/excerpt/content), pinned to the right
      React.createElement('div', { className: 'ml-auto relative' },
        React.createElement(Search, { size: 15, className: 'absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none' }),
        React.createElement('input', {
          value: searchInput,
          onChange: (e: React.ChangeEvent<HTMLInputElement>) => setSearchInput(e.target.value),
          placeholder: t('search posts', getLang()),
          'aria-label': t('search posts', getLang()),
          className: 'pl-9 pr-8 py-2 w-56 text-sm rounded-lg border border-gray-300 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500',
        }),
        searchInput && React.createElement('button', {
          onClick: () => setSearchInput(''),
          title: t('clear', getLang()),
          'aria-label': t('clear', getLang()),
          className: 'absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600',
        }, React.createElement(X, { size: 14 }))
      )
    ),
    loading ? React.createElement('p', { className: 'text-gray-500' }, t('loading', getLang()))
    : posts.length === 0 ? React.createElement(EmptyState, {
        icon: FileText,
        title: t('no posts found', getLang()),
        description: search ? t('no posts match your search', getLang()) : t('start writing and share your first post', getLang()),
        action: React.createElement('button', { onClick: () => navigate('/posts/new'), className: 'btn-primary text-sm' }, React.createElement(Plus, { size: 15 }), t('new post', getLang())),
      })
    : React.createElement('div', { className: 'card overflow-x-auto' },
        React.createElement('table', { className: 'w-full min-w-[720px]' },
          React.createElement('thead', null, React.createElement('tr', { className: 'border-b border-gray-200 bg-gray-50' },
            React.createElement('th', { className: 'text-left px-5 py-4 text-xs font-medium text-gray-500 uppercase cursor-pointer hover:text-gray-700', onClick: () => { setSortBy('title'); setSortDir(sortDir === 'asc' ? 'desc' : 'asc'); } }, t('title', getLang()) + (sortBy === 'title' ? (sortDir === 'asc' ? ' \u2191' : ' \u2193') : '')),
            React.createElement('th', { className: 'text-left px-5 py-4 text-xs font-medium text-gray-500 uppercase' }, t('author', getLang())),
            React.createElement('th', { className: 'text-left px-5 py-4 text-xs font-medium text-gray-500 uppercase cursor-pointer hover:text-gray-700', onClick: () => { setSortBy('status'); setSortDir(sortDir === 'asc' ? 'desc' : 'asc'); } }, t('status', getLang()) + (sortBy === 'status' ? (sortDir === 'asc' ? ' \u2191' : ' \u2193') : '')),
            multiSite && React.createElement('th', { className: 'text-left px-5 py-4 text-xs font-medium text-gray-500 uppercase' }, t('site', getLang())),
            React.createElement('th', { className: 'text-left px-5 py-4 text-xs font-medium text-gray-500 uppercase cursor-pointer hover:text-gray-700', onClick: () => { setSortBy('views'); setSortDir(sortDir === 'asc' ? 'desc' : 'asc'); } }, t('views', getLang()) + (sortBy === 'views' ? (sortDir === 'asc' ? ' \u2191' : ' \u2193') : '')),
            React.createElement('th', { className: 'text-left px-5 py-4 text-xs font-medium text-gray-500 uppercase cursor-pointer hover:text-gray-700', onClick: () => { setSortBy('createdAt'); setSortDir(sortDir === 'asc' ? 'desc' : 'asc'); } }, t('date', getLang()) + (sortBy === 'createdAt' ? (sortDir === 'asc' ? ' \u2191' : ' \u2193') : '')),
            React.createElement('th', { className: 'text-left px-3 py-4 text-xs font-medium text-gray-500 uppercase w-8' }, React.createElement('input', { type: 'checkbox', onChange: (e: React.ChangeEvent<HTMLInputElement>) => { if (e.target.checked) setSelected(new Set(posts.map((p: any) => p.id))); else setSelected(new Set()); } })),
            React.createElement('th', { className: 'text-right px-5 py-4 text-xs font-medium text-gray-500 uppercase' }, t('actions', getLang())),
          )),
          React.createElement('tbody', null, posts.map((p: any) =>
            
              React.createElement('tr', { key: p.id, className: `border-b border-gray-100 hover:bg-gray-50 ${p.sticky ? 'bg-orange-50/50' : ''}` },
              React.createElement('td', { className: 'px-5 py-4' }, React.createElement('div', { className: 'flex items-center gap-2' }, p.featured ? React.createElement('img', { src: p.featured, alt: '', className: 'w-8 h-8 object-cover rounded' }) : React.createElement('div', { className: 'w-8 h-8 bg-gray-100 rounded flex items-center justify-center' }, React.createElement('span', { className: 'text-xs text-gray-400' }, 'IMG')), React.createElement('span', { className: 'font-medium text-gray-900' }, p.title))),
              React.createElement('td', { className: 'px-5 py-4 text-sm text-gray-500' }, p.author?.username),
              React.createElement('td', { className: 'px-5 py-4' }, React.createElement('span', { className: 'flex items-center gap-1.5' }, p.password ? React.createElement('span', { className: 'text-xs text-gray-400', title: t('password protected', getLang()) }, '\u{1F512}') : null, p.sticky ? React.createElement(Pin, { size: 12, className: 'text-orange-500' }) : null, React.createElement('span', { className: `px-2 py-1 text-xs rounded-full font-medium ${p.status === 'published' ? 'bg-green-100 text-green-700' : p.status === 'draft' ? 'bg-yellow-100 text-yellow-700' : p.status === 'pending' ? 'bg-amber-100 text-amber-700' : p.status === 'trash' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'}` }, t(p.status, getLang())))),
              multiSite && React.createElement('td', { className: 'px-5 py-4 text-sm text-gray-500' }, siteName(p.siteId)),
              React.createElement('td', { className: 'px-5 py-4 text-sm text-gray-500' }, p.views || 0),
              // Date column: published date for published posts, creation date
              // for drafts (never the literal word "draft")
              React.createElement('td', { className: 'px-5 py-4 text-sm text-gray-500' }, (p.publishedAt || p.createdAt ? new Date(p.publishedAt || p.createdAt).toLocaleDateString() : '—') + (p.revisionCount ? ' (' + p.revisionCount + ' ' + t('revs', getLang()) + ')' : '')),
              React.createElement('td', { className: 'px-3 py-4' }, React.createElement('input', { type: 'checkbox', checked: selected.has(p.id), onChange: (e: React.ChangeEvent<HTMLInputElement>) => { const next = new Set(selected); e.target.checked ? next.add(p.id) : next.delete(p.id); setSelected(next); } })),
              React.createElement('td', { className: 'px-5 py-4' },
                React.createElement('div', { className: 'flex items-center justify-end gap-2' },
                  p.status === 'pending' && React.createElement(React.Fragment, null,
                    React.createElement('button', { onClick: () => reviewPost(p.id, 'approve'), className: 'px-2 py-1 text-xs rounded-lg bg-green-100 text-green-700 hover:bg-green-200', title: t('approve', getLang()) }, t('approve', getLang())),
                    React.createElement('button', { onClick: () => reviewPost(p.id, 'reject'), className: 'px-2 py-1 text-xs rounded-lg bg-red-100 text-red-700 hover:bg-red-200', title: t('reject', getLang()) }, t('reject', getLang())),
                  ),
                  p.status === 'published' && React.createElement('a', { href: '/post/' + p.slug, target: '_blank', className: 'p-1.5 text-gray-400 hover:text-green-600', title: t('view post', getLang()) }, React.createElement(Eye, { size: 16 })),
                  React.createElement(Link, { to: `/posts/${p.id}/edit`, className: 'p-1.5 text-gray-400 hover:text-primary-600' }, React.createElement(Edit2, { size: 16 })),
                  p.status === 'trash' ? React.createElement('button', { onClick: () => restorePost(p.id), className: 'p-1.5 text-gray-400 hover:text-green-600', title: t('restore', getLang()) }, React.createElement('svg', { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, className: 'lucide' }, React.createElement('polyline', { points: '1 4 1 10 7 10' }), React.createElement('path', { d: 'M3.51 15a9 9 0 1 0 2.13-9.36L1 10' }))) : React.createElement('button', { onClick: () => toggleSticky(p.id), className: `p-1.5 ${p.sticky ? 'text-orange-500' : 'text-gray-400 hover:text-orange-500'}`, title: p.sticky ? t('unpin', getLang()) : t('pin', getLang()) }, React.createElement(Pin, { size: 16 })),
                  React.createElement('button', { onClick: () => deletePost(p.id), className: 'p-1.5 text-gray-400 hover:text-red-600' }, React.createElement(Trash2, { size: 16 }))
                )
              )
            )
          ))
        ),
        React.createElement('div', { className: 'flex items-center justify-between px-5 py-4 border-t border-gray-200' },
          React.createElement('span', { className: 'text-sm text-gray-500' }, `${total} ${t('posts total', getLang())}`),
          React.createElement('div', { className: 'flex gap-2' },
            React.createElement('button', { onClick: () => setPage(p => Math.max(1, p - 1)), disabled: page === 1, className: 'btn-secondary text-xs' }, t('previous', getLang())),
            React.createElement('button', { onClick: () => setPage(p => p + 1), disabled: page * 15 >= total, className: 'btn-secondary text-xs' }, t('next', getLang()))
          )
        )
      )
  );
}
