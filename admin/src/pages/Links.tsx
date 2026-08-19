import React, { useEffect, useState } from 'react';
import { Plus, Trash2, Pencil, Check, X, Link2, FolderPlus, Search, Handshake } from 'lucide-react';
import { t, getLang } from '../lib/i18n';
import api from '../lib/api';
import { useToast } from '../lib/toast';

// Navigation-site link model: categorized links with descriptions, sub-site
// ownership, an optional linked page, and associated posts (e.g. the
// OpenClaw official site linking its install/usage tutorials).
export default function Links() {
  const [links, setLinks] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [sites, setSites] = useState<any[]>([]);
  const [pages, setPages] = useState<any[]>([]);
  // Link form
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [description, setDescription] = useState('');
  const [avatar, setAvatar] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [siteId, setSiteId] = useState('');
  const [pageId, setPageId] = useState('');
  const [menuOrder, setMenuOrder] = useState(0);
  const [active, setActive] = useState(true);
  const [postIds, setPostIds] = useState<string[]>([]);
  const [editing, setEditing] = useState<any>(null);
  // Post picker
  const [postSearch, setPostSearch] = useState('');
  const [postResults, setPostResults] = useState<any[]>([]);
  // id → title map so chips render even for freshly picked (unsaved) posts
  const [postTitles, setPostTitles] = useState<Record<string, string>>({});
  // Category form
  const [catName, setCatName] = useState('');
  const [catDesc, setCatDesc] = useState('');
  const [catOrder, setCatOrder] = useState(0);
  const [catEditing, setCatEditing] = useState<any>(null);
  const toast = useToast();
  // ---- Tab: navigation links vs friend links (blogroll) ----
  const [tab, setTab] = useState<'nav' | 'friends'>('nav');
  // Friend-link form state
  const [friends, setFriends] = useState<any[]>([]);
  const [fName, setFName] = useState('');
  const [fUrl, setFUrl] = useState('');
  const [fAvatar, setFAvatar] = useState('');
  const [fDesc, setFDesc] = useState('');
  const [fEditing, setFEditing] = useState<any>(null);

  useEffect(() => { fetchAll(); }, []);
  async function fetchAll() {
    fetchLinks();
    api.get('/links/categories').then(r => setCategories(r.data || [])).catch(() => {});
    api.get('/sites').then(r => setSites(r.data?.sites || r.data || [])).catch(() => {});
    api.get('/pages').then(r => setPages((r.data || []).filter((p: any) => p.status === 'published'))).catch(() => {});
    api.get('/friend-links').then(r => setFriends(r.data || [])).catch(() => {});
  }
  async function fetchLinks() { api.get('/links').then(r => setLinks(r.data || [])).catch(() => {}); }

  // ---- Friend links (blogroll) CRUD ----
  async function saveFriend() {
    if (!fName || !fUrl) return;
    try {
      if (fEditing) await api.put('/friend-links/' + fEditing.id, { name: fName, url: fUrl, avatar: fAvatar, description: fDesc });
      else await api.post('/friend-links', { name: fName, url: fUrl, avatar: fAvatar, description: fDesc });
      toast.toast(fEditing ? t('link updated', getLang()) : t('link created', getLang()));
      setFName(''); setFUrl(''); setFAvatar(''); setFDesc(''); setFEditing(null);
      api.get('/friend-links').then(r => setFriends(r.data || [])).catch(() => {});
    } catch (e: any) { toast.toast(e.response?.data?.error || t('save failed', getLang()), 'error'); }
  }
  function startEditFriend(f: any) { setFEditing(f); setFName(f.name); setFUrl(f.url); setFAvatar(f.avatar || ''); setFDesc(f.description || ''); }
  async function delFriend(f: any) {
    if (!confirm(t('delete link', getLang()) + ' "' + f.name + '"?')) return;
    try { await api.delete('/friend-links/' + f.id); toast.toast(t('link deleted', getLang())); api.get('/friend-links').then(r => setFriends(r.data || [])).catch(() => {}); }
    catch (e: any) { toast.toast(e.response?.data?.error || t('delete failed', getLang()), 'error'); }
  }

  async function save() {
    if (!name || !url) return;
    try {
      const payload: any = { name, url, description, avatar, categoryId: categoryId || null, siteId: siteId || null, pageId: pageId || null, menuOrder, active, postIds };
      if (editing) await api.put('/links/' + editing.id, payload);
      else await api.post('/links', payload);
      toast.toast(editing ? t('link updated', getLang()) : t('link created', getLang()));
      reset(); fetchLinks();
    } catch (e: any) { toast.toast(e.response?.data?.error || t('save failed', getLang()), 'error'); }
  }

  function reset() { setName(''); setUrl(''); setDescription(''); setAvatar(''); setCategoryId(''); setSiteId(''); setPageId(''); setMenuOrder(0); setActive(true); setPostIds([]); setEditing(null); setPostSearch(''); setPostResults([]); }
  function startEdit(l: any) {
    setEditing(l); setName(l.name); setUrl(l.url); setDescription(l.description || ''); setAvatar(l.avatar || '');
    setCategoryId(l.categoryId || ''); setSiteId(l.siteId || ''); setPageId(l.pageId || ''); setMenuOrder(l.menuOrder || 0);
    setActive(l.active !== 0); setPostIds((l.posts || []).map((p: any) => p.id));
    setPostTitles(prev => { const n = { ...prev }; (l.posts || []).forEach((p: any) => { n[p.id] = p.title; }); return n; });
  }

  async function del(l: any) {
    if (!confirm(t('delete link', getLang()) + ' "' + l.name + '"?')) return;
    try { await api.delete('/links/' + l.id); toast.toast(t('link deleted', getLang())); fetchLinks(); }
    catch (e: any) { toast.toast(e.response?.data?.error || t('delete failed', getLang()), 'error'); }
  }

  // ---- Associated-post search (e.g. OpenClaw official site → its tutorials) ----
  function searchPosts(q: string) {
    setPostSearch(q);
    if (!q.trim()) { setPostResults([]); return; }
    api.get('/posts/admin?limit=10&search=' + encodeURIComponent(q.trim())).then(r => {
      const found = (r.data?.posts || []).filter((p: any) => p.status === 'published');
      setPostResults(found);
      setPostTitles(prev => { const n = { ...prev }; found.forEach((p: any) => { n[p.id] = p.title; }); return n; });
    }).catch(() => {});
  }
  function togglePost(pid: string) {
    setPostIds(prev => prev.includes(pid) ? prev.filter(x => x !== pid) : [...prev, pid]);
  }

  // ---- Category CRUD ----
  async function saveCategory() {
    if (!catName) return;
    try {
      if (catEditing) await api.put('/links/categories/' + catEditing.id, { name: catName, description: catDesc, menuOrder: catOrder });
      else await api.post('/links/categories', { name: catName, description: catDesc, menuOrder: catOrder });
      toast.toast(catEditing ? t('category updated', getLang()) : t('category created', getLang()));
      setCatName(''); setCatDesc(''); setCatOrder(0); setCatEditing(null);
      api.get('/links/categories').then(r => setCategories(r.data || [])).catch(() => {});
    } catch (e: any) { toast.toast(e.response?.data?.error || t('save failed', getLang()), 'error'); }
  }
  async function delCategory(c: any) {
    if (!confirm(t('delete category', getLang()) + ' "' + c.name + '"?')) return;
    try { await api.delete('/links/categories/' + c.id); toast.toast(t('category deleted', getLang())); fetchAll(); }
    catch (e: any) { toast.toast(e.response?.data?.error || t('delete failed', getLang()), 'error'); }
  }

  const selectedPosts = postIds.filter(pid => postTitles[pid]).map(pid => ({ id: pid, title: postTitles[pid] }));

  return React.createElement('div', null,
    React.createElement('h2', { className: 'text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2' }, React.createElement(Link2, { size: 22 }), t('links', getLang())),
    React.createElement('div', { className: 'flex items-center gap-1 border-b border-gray-200 dark:border-gray-700 mb-5' },
      React.createElement('button', { onClick: () => setTab('nav'), className: 'px-3 py-2 text-sm border-b-2 -mb-px transition-colors ' + (tab === 'nav' ? 'border-primary-600 text-primary-600 font-medium' : 'border-transparent text-gray-500 hover:text-gray-700') }, t('navigation links', getLang())),
      React.createElement('button', { onClick: () => setTab('friends'), className: 'px-3 py-2 text-sm border-b-2 -mb-px transition-colors ' + (tab === 'friends' ? 'border-primary-600 text-primary-600 font-medium' : 'border-transparent text-gray-500 hover:text-gray-700') }, t('friend links', getLang()))
    ),
    tab === 'nav' && React.createElement('div', { className: 'grid grid-cols-1 lg:grid-cols-3 gap-6' },
      // Left column: categories + link form
      React.createElement('div', { className: 'space-y-4' },
        // Categories
        React.createElement('div', { className: 'card p-5' },
          React.createElement('h3', { className: 'text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2' }, React.createElement(FolderPlus, { size: 15, className: 'text-primary-500' }), t('link categories', getLang())),
          React.createElement('div', { className: 'space-y-3' },
            React.createElement('input', { value: catName, onChange: e => setCatName(e.target.value), placeholder: t('new category', getLang()), className: 'input-field text-sm' }),
            React.createElement('input', { value: catDesc, onChange: e => setCatDesc(e.target.value), placeholder: t('description (optional)', getLang()), className: 'input-field text-sm' }),
            React.createElement('input', { type: 'number', value: catOrder, onChange: e => setCatOrder(parseInt(e.target.value) || 0), placeholder: t('order', getLang()), className: 'input-field text-sm' }),
            React.createElement('div', { className: 'flex gap-2' },
              React.createElement('button', { onClick: saveCategory, disabled: !catName, className: 'btn-primary text-sm' }, catEditing ? t('update', getLang()) : t('add', getLang())),
              catEditing && React.createElement('button', { onClick: () => { setCatName(''); setCatDesc(''); setCatOrder(0); setCatEditing(null); }, className: 'btn-secondary text-sm' }, React.createElement(X, { size: 14 }), t('cancel', getLang()))
            )
          ),
          categories.length > 0 && React.createElement('div', { className: 'mt-3 space-y-1 max-h-56 overflow-y-auto' },
            categories.map(c => React.createElement('div', { key: c.id, className: 'flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 group' },
              React.createElement('span', { className: 'flex-1 text-sm text-gray-700 truncate' }, c.name),
              React.createElement('span', { className: 'text-xs text-gray-400' }, c.count || 0),
              React.createElement('button', { onClick: () => { setCatEditing(c); setCatName(c.name); setCatDesc(c.description || ''); setCatOrder(c.menuOrder || 0); }, className: 'p-1 text-gray-300 hover:text-primary-600 opacity-0 group-hover:opacity-100', title: t('edit', getLang()) }, React.createElement(Pencil, { size: 14 })),
              React.createElement('button', { onClick: () => delCategory(c), className: 'p-1 text-gray-300 hover:text-red-600 opacity-0 group-hover:opacity-100', title: t('delete', getLang()) }, React.createElement(Trash2, { size: 14 }))
            ))
          )
        ),
        // Link form
        React.createElement('div', { className: 'card p-5' },
          React.createElement('h3', { className: 'text-sm font-semibold text-gray-900 mb-4' }, editing ? t('edit link', getLang()) : t('new link', getLang())),
          React.createElement('div', { className: 'space-y-3' },
            React.createElement('input', { value: name, onChange: e => setName(e.target.value), placeholder: t('name', getLang()), className: 'input-field text-sm' }),
            React.createElement('input', { value: url, onChange: e => setUrl(e.target.value), placeholder: 'https://...', className: 'input-field text-sm' }),
            React.createElement('input', { value: description, onChange: e => setDescription(e.target.value), placeholder: t('description (optional)', getLang()), className: 'input-field text-sm' }),
            React.createElement('input', { value: avatar, onChange: e => setAvatar(e.target.value), placeholder: t('avatar url', getLang()), className: 'input-field text-sm' }),
            React.createElement('select', { value: categoryId, onChange: (e: React.ChangeEvent<HTMLSelectElement>) => setCategoryId(e.target.value), className: 'input-field text-sm' },
              React.createElement('option', { value: '' }, '(' + t('no category', getLang()) + ')'),
              categories.map(c => React.createElement('option', { key: c.id, value: c.id }, c.name))
            ),
            React.createElement('select', { value: siteId, onChange: (e: React.ChangeEvent<HTMLSelectElement>) => setSiteId(e.target.value), className: 'input-field text-sm' },
              React.createElement('option', { value: '' }, '(' + t('global (all sites)', getLang()) + ')'),
              sites.map((st: any) => React.createElement('option', { key: st.id, value: st.id }, st.name + (st.isPrimary === 1 ? ' (primary)' : '')))
            ),
            React.createElement('select', { value: pageId, onChange: (e: React.ChangeEvent<HTMLSelectElement>) => setPageId(e.target.value), className: 'input-field text-sm' },
              React.createElement('option', { value: '' }, '(' + t('select page', getLang()) + ')'),
              pages.map(p => React.createElement('option', { key: p.id, value: p.id }, p.title))
            ),
            React.createElement('div', { className: 'flex items-center gap-3' },
              // input-field carries w-full, so the order input needs an inline
              // width or it would push the enabled toggle onto its own line
              React.createElement('input', { type: 'number', value: menuOrder, onChange: e => setMenuOrder(parseInt(e.target.value) || 0), placeholder: t('order', getLang()), className: 'input-field text-sm', style: { width: 88 }, title: t('order hint', getLang()) }),
              React.createElement('label', { title: t('enabled hint', getLang()), className: 'flex items-center gap-2 text-sm text-gray-600 cursor-pointer whitespace-nowrap' },
                React.createElement('input', { type: 'checkbox', checked: active, onChange: e => setActive(e.target.checked), className: 'rounded border-gray-300 text-primary-600' }),
                t('enabled', getLang())
              )
            ),
            // Associated posts (e.g. link an official site to its tutorials)
            React.createElement('div', null,
              React.createElement('p', { className: 'text-xs font-medium text-gray-500 mb-1' }, t('associated posts', getLang())),
              React.createElement('div', { className: 'relative' },
                React.createElement(Search, { size: 13, className: 'absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400' }),
                React.createElement('input', { value: postSearch, onChange: e => searchPosts(e.target.value), placeholder: t('search posts to associate', getLang()), className: 'input-field text-sm pl-8' })
              ),
              postResults.length > 0 && React.createElement('div', { className: 'mt-2 max-h-36 overflow-y-auto border border-gray-200 rounded-lg' },
                postResults.map(p => React.createElement('div', { key: p.id, onClick: () => togglePost(p.id), className: 'flex items-center gap-2 px-2.5 py-1.5 text-sm cursor-pointer hover:bg-gray-50 ' + (postIds.includes(p.id) ? 'bg-primary-50' : '') },
                  React.createElement('input', { type: 'checkbox', checked: postIds.includes(p.id), readOnly: true, className: 'rounded border-gray-300 text-primary-600 pointer-events-none' }),
                  React.createElement('span', { className: 'truncate flex-1 text-gray-700' }, p.title)
                ))
              ),
              postIds.length > 0 && React.createElement('div', { className: 'mt-3 flex flex-wrap gap-1' },
                selectedPosts.map(p => p && React.createElement('span', { key: p.id, className: 'flex items-center gap-1 px-2 py-0.5 bg-primary-50 text-primary-700 text-xs rounded-full' },
                  p.title,
                  React.createElement('button', { onClick: () => togglePost(p.id), className: 'hover:text-red-600' }, '\u00d7')
                ))
              )
            ),
            React.createElement('div', { className: 'flex gap-2' },
              React.createElement('button', { onClick: save, disabled: !name || !url, className: 'btn-primary text-sm' }, React.createElement(Check, { size: 14 }), editing ? t('update', getLang()) : t('add', getLang())),
              editing && React.createElement('button', { onClick: reset, className: 'btn-secondary text-sm' }, React.createElement(X, { size: 14 }), t('cancel', getLang()))
            )
          )
        )
      ),
      // Right column: links table
      React.createElement('div', { className: 'card overflow-hidden lg:col-span-2' },
        links.length === 0
          ? React.createElement('p', { className: 'text-sm text-gray-400 p-6' }, t('no links yet', getLang()))
          : React.createElement('table', { className: 'w-full' },
              React.createElement('thead', null, React.createElement('tr', { className: 'border-b border-gray-200 bg-gray-50 dark:bg-gray-800' },
                React.createElement('th', { className: 'text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase' }, t('name', getLang())),
                React.createElement('th', { className: 'text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase' }, t('category', getLang())),
                React.createElement('th', { className: 'text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase hidden md:table-cell' }, t('posts', getLang())),
                React.createElement('th', { className: 'text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase hidden lg:table-cell' }, t('clicks', getLang())),
                React.createElement('th', { className: 'text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase' }, t('actions', getLang())),
              )),
              React.createElement('tbody', null, links.map(l =>
                React.createElement('tr', { key: l.id, className: 'border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800' + (l.active === 0 ? ' opacity-50' : '') },
                  React.createElement('td', { className: 'px-4 py-3' },
                    React.createElement('div', { className: 'flex items-center gap-2' },
                      l.avatar ? React.createElement('img', { src: l.avatar, alt: '', className: 'w-7 h-7 rounded-full object-cover' }) : React.createElement('div', { className: 'w-7 h-7 rounded-full bg-primary-600 flex items-center justify-center text-white text-xs font-medium' }, l.name.charAt(0).toUpperCase()),
                      React.createElement('div', { className: 'min-w-0' },
                        React.createElement('p', { className: 'font-medium text-gray-900 truncate' }, l.name),
                        l.description && React.createElement('p', { className: 'text-xs text-gray-400 truncate max-w-[240px]' }, l.description)
                      )
                    )
                  ),
                  React.createElement('td', { className: 'px-4 py-3' },
                    l.category ? React.createElement('span', { className: 'px-2 py-0.5 text-[11px] rounded-full bg-gray-100 text-gray-600' }, l.category.name)
                      : React.createElement('span', { className: 'text-xs text-gray-300' }, '—')
                  ),
                  React.createElement('td', { className: 'px-4 py-3 hidden md:table-cell' },
                    (l.posts || []).length > 0
                      ? React.createElement('div', { className: 'flex flex-wrap gap-1' }, l.posts.slice(0, 2).map((p: any) => React.createElement('a', { key: p.id, href: '/post/' + p.slug, target: '_blank', className: 'px-1.5 py-0.5 text-[10px] rounded bg-primary-50 text-primary-700 hover:bg-primary-100 truncate block max-w-[130px]' }, p.title)),
                        (l.posts || []).length > 2 && React.createElement('span', { className: 'text-[10px] text-gray-400' }, '+' + ((l.posts || []).length - 2)))
                      : React.createElement('span', { className: 'text-xs text-gray-300' }, '—')
                  ),
                  React.createElement('td', { className: 'px-4 py-3 text-sm text-gray-500 hidden lg:table-cell' }, (l.clicks || 0).toLocaleString()),
                  React.createElement('td', { className: 'px-4 py-3' },
                    React.createElement('div', { className: 'flex justify-end gap-1' },
                      React.createElement('button', { onClick: () => startEdit(l), className: 'p-1.5 text-gray-400 hover:text-primary-600', title: t('edit', getLang()) }, React.createElement(Pencil, { size: 16 })),
                      React.createElement('button', { onClick: () => del(l), className: 'p-1.5 text-gray-400 hover:text-red-600', title: t('delete', getLang()) }, React.createElement(Trash2, { size: 16 }))
                    )
                  )
                )
              ))
            )
      )
    ),
    tab === 'friends' && React.createElement('div', { className: 'grid grid-cols-1 lg:grid-cols-3 gap-6' },
      React.createElement('div', { className: 'card p-5' },
        React.createElement('h3', { className: 'text-sm font-semibold text-gray-900 mb-4' }, fEditing ? t('edit link', getLang()) : t('new friend link', getLang())),
        React.createElement('div', { className: 'space-y-3' },
          React.createElement('input', { value: fName, onChange: e => setFName(e.target.value), placeholder: t('name', getLang()), className: 'input-field text-sm' }),
          React.createElement('input', { value: fUrl, onChange: e => setFUrl(e.target.value), placeholder: 'https://...', className: 'input-field text-sm' }),
          React.createElement('input', { value: fAvatar, onChange: e => setFAvatar(e.target.value), placeholder: t('avatar url', getLang()), className: 'input-field text-sm' }),
          React.createElement('input', { value: fDesc, onChange: e => setFDesc(e.target.value), placeholder: t('description (optional)', getLang()), className: 'input-field text-sm' }),
          React.createElement('div', { className: 'flex gap-2' },
            React.createElement('button', { onClick: saveFriend, disabled: !fName || !fUrl, className: 'btn-primary text-sm' }, React.createElement(Check, { size: 14 }), fEditing ? t('update', getLang()) : t('add', getLang())),
            fEditing && React.createElement('button', { onClick: () => { setFName(''); setFUrl(''); setFAvatar(''); setFDesc(''); setFEditing(null); }, className: 'btn-secondary text-sm' }, React.createElement(X, { size: 14 }), t('cancel', getLang()))
          )
        )
      ),
      React.createElement('div', { className: 'card overflow-hidden lg:col-span-2' },
        friends.length === 0
          ? React.createElement('p', { className: 'text-sm text-gray-400 p-6' }, t('no links yet', getLang()))
          : React.createElement('table', { className: 'w-full' },
              React.createElement('thead', null, React.createElement('tr', { className: 'border-b border-gray-200 bg-gray-50 dark:bg-gray-800' },
                React.createElement('th', { className: 'text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase' }, t('name', getLang())),
                React.createElement('th', { className: 'text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase hidden md:table-cell' }, t('url', getLang())),
                React.createElement('th', { className: 'text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase' }, t('actions', getLang())),
              )),
              React.createElement('tbody', null, friends.map(f =>
                React.createElement('tr', { key: f.id, className: 'border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800' },
                  React.createElement('td', { className: 'px-4 py-3' },
                    React.createElement('div', { className: 'flex items-center gap-2' },
                      f.avatar ? React.createElement('img', { src: f.avatar, alt: '', className: 'w-7 h-7 rounded-full object-cover' }) : React.createElement('div', { className: 'w-7 h-7 rounded-full bg-gray-400 flex items-center justify-center text-white text-xs font-medium' }, f.name.charAt(0).toUpperCase()),
                      React.createElement('div', null,
                        React.createElement('p', { className: 'font-medium text-gray-900' }, f.name),
                        f.description && React.createElement('p', { className: 'text-xs text-gray-400 truncate max-w-[220px]' }, f.description)
                      )
                    )
                  ),
                  React.createElement('td', { className: 'px-4 py-3 hidden md:table-cell' }, React.createElement('a', { href: f.url, target: '_blank', rel: 'noopener noreferrer', className: 'text-sm text-primary-600 hover:underline truncate block max-w-[220px]' }, f.url)),
                  React.createElement('td', { className: 'px-4 py-3' },
                    React.createElement('div', { className: 'flex justify-end gap-1' },
                      React.createElement('button', { onClick: () => startEditFriend(f), className: 'p-1.5 text-gray-400 hover:text-primary-600', title: t('edit', getLang()) }, React.createElement(Pencil, { size: 16 })),
                      React.createElement('button', { onClick: () => delFriend(f), className: 'p-1.5 text-gray-400 hover:text-red-600', title: t('delete', getLang()) }, React.createElement(Trash2, { size: 16 }))
                    )
                  )
                )
              ))
            )
      )
    )
  );
}
