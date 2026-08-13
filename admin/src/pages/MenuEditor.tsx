import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, GripVertical, Save, Edit2 } from 'lucide-react';
import api from '../lib/api';
import { t, getLang } from '../lib/i18n';

export default function MenuEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [menu, setMenu] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [pages, setPages] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [newItem, setNewItem] = useState<{ type: string; label: string; url: string; pageId: string; categoryId: string; parentId: string }>({ type: 'page', label: '', url: '', pageId: '', categoryId: '', parentId: '' });
  const [editParent, setEditParent] = useState<{ id: string; parentId: string } | null>(null);

  useEffect(() => {
    api.get('/menus').then(r => { const m = r.data.find((x: any) => x.id === id); if (m) { setMenu(m); setItems(m.items || []); setMenuName(m.name || ''); setMenuLocation(m.location || 'primary'); setMenuSiteId(m.siteId || ''); } });
    api.get('/sites').then(r => setSites(r.data?.sites || r.data || []));
    api.get('/pages').then(r => setPages(r.data.filter((p: any) => p.status === 'published')));
    api.get('/categories').then(r => setCategories(r.data));
  }, [id]);

  function addItem() {
    if (!newItem.label) return;
    let url = newItem.url;
    if (newItem.type === 'page' && newItem.pageId) url = '/page/' + pages.find(p => p.id === newItem.pageId)?.slug;
    if (newItem.type === 'category' && newItem.categoryId) url = '/category/' + categories.find(c => c.id === newItem.categoryId)?.slug;
    setItems([...items, { id: Date.now().toString(), label: newItem.label, url: url || '#', parentId: newItem.parentId || null }]);
    setShowAdd(false); setNewItem({ type: 'page', label: '', url: '', pageId: '', categoryId: '', parentId: '' });
  }

  function removeItem(idx: number) { setItems(items.filter((_, i) => i !== idx)); }
  function moveItem(idx: number, dir: number) {
    const next = [...items];
    const target = idx + dir;
    if (target < 0 || target >= next.length) return;
    [next[idx], next[target]] = [next[target], next[idx]];
    setItems(next);
  }

  // HTML5 drag-to-reorder (WordPress menu drag behaviour)
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [menuName, setMenuName] = useState('');
  const [menuLocation, setMenuLocation] = useState('primary');
  const [menuSiteId, setMenuSiteId] = useState('');
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<{ label: string; url: string; parentId: string }>({ label: '', url: '', parentId: '' });
  const [sites, setSites] = useState<any[]>([]);
  function onDrop(targetIdx: number) {
    if (dragIdx === null || dragIdx === targetIdx) { setDragIdx(null); return; }
    const next = [...items];
    const [moved] = next.splice(dragIdx, 1);
    next.splice(targetIdx, 0, moved);
    setItems(next);
    setDragIdx(null);
  }

  function startAddChild(itemIdx: number) {
    const it = items[itemIdx];
    setEditingIdx(null);
    setShowAdd(true);
    setNewItem({ type: 'custom', label: '', url: '', pageId: '', categoryId: '', parentId: it.id });
  }

  // editingIdx === -1: editing the MENU itself (name/location/site)
  // editingIdx >= 0: editing a menu item's label/url/parent
  function startEdit(idx: number) {
    setEditingIdx(idx);
    if (idx >= 0) {
      const it = items[idx];
      setEditForm({ label: it.label || '', url: it.url || '', parentId: it.parentId || '' });
    }
  }
  function startEditMenu() { startEdit(-1); }
  function saveEdit() {
    if (editingIdx === null) return;
    if (editingIdx === -1) { setEditingIdx(null); return; } // menu info saved via saveMenuNow
    const next = items.map((it, i) => i === editingIdx ? { ...it, label: editForm.label, url: editForm.url || '#', parentId: editForm.parentId || null } : it);
    setItems(next);
    setEditingIdx(null);
  }

  async function saveMenuNow() {
    await api.put('/menus/' + id, { items, name: menuName, location: menuLocation, siteId: menuSiteId || null });
  }

  async function saveMenu() {
    await saveMenuNow();
    navigate('/menus');
  }

  if (!menu) return React.createElement('p', { className: 'text-gray-500' }, t('loading', getLang()) + '...');

  return React.createElement('div', null,
    React.createElement('div', { className: 'flex items-center justify-between mb-6' },
      React.createElement('div', { className: 'flex items-center gap-3' },
        React.createElement('button', { onClick: () => navigate('/menus'), className: 'p-2 text-gray-400 hover:text-gray-600' }, React.createElement(ArrowLeft, { size: 20 })),
        React.createElement('div', null,
          React.createElement('h2', { className: 'text-2xl font-bold text-gray-900' }, t('edit menu', getLang()) + ': ' + menuName),
          React.createElement('button', { onClick: startEditMenu, className: 'inline-flex items-center gap-1.5 mt-2 px-3 py-1.5 rounded-lg text-xs font-medium border border-gray-200 text-gray-600 hover:border-primary-400 hover:text-primary-600 transition-colors' }, React.createElement(Edit2, { size: 14 }), t('edit menu info', getLang())),
        ),
      ),
      React.createElement('button', { onClick: saveMenu, className: 'btn-primary' }, React.createElement(Save, { size: 16 }), t('save menu', getLang()))
    ),
    React.createElement('div', { className: 'grid grid-cols-1 lg:grid-cols-3 gap-6' },
      React.createElement('div', { className: 'lg:col-span-2' },
        React.createElement('div', { className: 'card p-4' },
          React.createElement('h3', { className: 'text-sm font-semibold text-gray-900 mb-4' }, t('menu items', getLang())),
          items.length === 0 ? React.createElement('p', { className: 'text-sm text-gray-400 py-4' }, t('no menu items yet', getLang()))
          : React.createElement('div', { className: 'space-y-1', onClick: () => setEditingIdx(null) }, (() => {
              const topItems = items.filter((it: any) => !it.parentId);
              const childrenOf = (pid: string) => items.filter((it: any) => it.parentId === pid);
              const rows: React.ReactNode[] = [];
              const renderRow = (item: any, idx: number, isChild: boolean) => {
                const itemIdx = items.findIndex((x: any) => x.id === item.id);
                rows.push(React.createElement('div', {
                  key: item.id,
                  draggable: true,
                  onDragStart: () => setDragIdx(itemIdx),
                  onDragOver: (e: React.DragEvent) => e.preventDefault(),
                  onDrop: () => onDrop(itemIdx),
                  onClick: (e: React.MouseEvent) => e.stopPropagation(),
                  className: 'flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200 cursor-grab ' + (isChild ? 'ml-6 pl-6 border-l-4 border-l-indigo-200' : '') + ' ' + (dragIdx === itemIdx ? 'opacity-50' : '') + ' ' + (editingIdx === itemIdx ? 'ring-2 ring-primary-400' : ''),
                },
                  React.createElement('div', { className: 'flex flex-col gap-0.5' },
                    React.createElement('button', { onClick: () => moveItem(itemIdx, -1), className: 'p-0.5 text-gray-300 hover:text-gray-500 leading-none' }, '\u25b2'),
                    React.createElement('button', { onClick: () => moveItem(itemIdx, 1), className: 'p-0.5 text-gray-300 hover:text-gray-500 leading-none' }, '\u25bc')
                  ),
                  React.createElement(GripVertical, { size: 14, className: 'text-gray-300' }),
                  React.createElement('div', { className: 'flex-1 min-w-0' },
                    React.createElement('div', { className: 'flex items-center gap-2' },
                      isChild && React.createElement('span', { className: 'text-gray-300 text-xs' }, '└─'),
                      React.createElement('span', { className: 'text-sm font-medium text-gray-900' }, item.label),
                      isChild && React.createElement('span', { className: 'text-[10px] px-1.5 py-0.5 rounded bg-gray-200 text-gray-500' }, t('sub item', getLang()))),
                    React.createElement('div', { className: 'flex items-center gap-2 mt-0.5' },
                      React.createElement('span', { className: 'text-xs text-gray-400 truncate' }, item.url),
                      React.createElement('select', {
                        value: item.parentId || '',
                        onChange: (e: React.ChangeEvent<HTMLSelectElement>) => {
                          const next = items.map(it => it.id === item.id ? { ...it, parentId: e.target.value || null } : it);
                          setItems(next);
                        },
                        className: 'text-[11px] border border-gray-200 rounded px-1 py-0.5 bg-white',
                      },
                        React.createElement('option', { value: '' }, t('top level', getLang())),
                        items.filter(it => it.id !== item.id).map(it => React.createElement('option', { key: it.id, value: it.id }, it.label)))
                    )
                  ),
                  !isChild && React.createElement('button', { onClick: () => startEdit(itemIdx), className: 'inline-flex items-center gap-1 px-2 py-1 rounded text-xs border border-gray-200 text-gray-600 hover:border-primary-400 hover:text-primary-600 transition-colors' }, React.createElement(Edit2, { size: 12 }), t('edit', getLang())),
                  !isChild && React.createElement('button', { onClick: () => startAddChild(itemIdx), className: 'inline-flex items-center gap-1 px-2 py-1 rounded text-xs border border-gray-200 text-gray-600 hover:border-primary-400 hover:text-primary-600 transition-colors' }, React.createElement(Plus, { size: 12 }), t('add sub item', getLang())),
                  React.createElement('button', { onClick: () => removeItem(itemIdx), className: 'p-1 text-gray-400 hover:text-red-600' }, React.createElement(Trash2, { size: 14 }))
                ));
              };
              topItems.forEach((parent: any) => {
                const pIdx = items.findIndex((x: any) => x.id === parent.id);
                renderRow(parent, pIdx, false);
                childrenOf(parent.id).forEach((child: any) => renderRow(child, items.findIndex((x: any) => x.id === child.id), true));
              });
              // orphans (invalid parent refs) at the end
              items.forEach((it: any, idx: number) => { if (it.parentId && !items.some((x: any) => x.id === it.parentId)) renderRow(it, idx, false); });
              return rows;
            })())
        )
      ),
      React.createElement('div', { className: 'space-y-4' },        )
      ),
      React.createElement('div', { className: 'space-y-4' },
        editingIdx === -1 ? React.createElement('div', { className: 'card p-4' },
          React.createElement('h3', { className: 'text-sm font-semibold text-gray-900 mb-3' }, t('edit menu info', getLang())),
          React.createElement('div', { className: 'space-y-3' },
            React.createElement('div', null,
              React.createElement('label', { className: 'block text-xs font-medium text-gray-600 mb-1' }, t('menu name', getLang())),
              React.createElement('input', { value: menuName, onChange: (e: React.ChangeEvent<HTMLInputElement>) => setMenuName(e.target.value), className: 'input-field text-sm' })),
            React.createElement('div', null,
              React.createElement('label', { className: 'block text-xs font-medium text-gray-600 mb-1' }, t('location', getLang())),
              React.createElement('select', { value: menuLocation, onChange: (e: React.ChangeEvent<HTMLSelectElement>) => setMenuLocation(e.target.value), className: 'input-field text-sm' },
                React.createElement('option', { value: 'primary' }, t('primary (header)', getLang())),
                React.createElement('option', { value: 'footer' }, t('footer', getLang())),
                React.createElement('option', { value: 'sidebar' }, t('sidebar', getLang())))),
            sites.length > 0 && React.createElement('div', null,
              React.createElement('label', { className: 'block text-xs font-medium text-gray-600 mb-1' }, t('site', getLang())),
              React.createElement('select', { value: menuSiteId, onChange: (e: React.ChangeEvent<HTMLSelectElement>) => setMenuSiteId(e.target.value), className: 'input-field text-sm' },
                React.createElement('option', { value: '' }, t('global (all sites)', getLang())),
                sites.map((st: any) => React.createElement('option', { key: st.id, value: st.id }, st.name)))),
            React.createElement('div', { className: 'flex gap-2' },
              React.createElement('button', { onClick: async () => { await saveMenuNow(); setEditingIdx(null); }, className: 'btn-primary flex-1 justify-center' }, React.createElement(Save, { size: 14 }), t('save', getLang())),
              React.createElement('button', { onClick: () => setEditingIdx(null), className: 'btn-secondary' }, t('cancel', getLang()))
            )
          )
        )
        : editingIdx !== null ? React.createElement('div', { className: 'card p-4' },
          React.createElement('h3', { className: 'text-sm font-semibold text-gray-900 mb-3' }, t('edit item', getLang())),
          React.createElement('div', { className: 'space-y-3' },
            React.createElement('input', { value: editForm.label, onChange: (e: React.ChangeEvent<HTMLInputElement>) => setEditForm({ ...editForm, label: e.target.value }), placeholder: t('label', getLang()), className: 'input-field' }),
            React.createElement('input', { value: editForm.url, onChange: (e: React.ChangeEvent<HTMLInputElement>) => setEditForm({ ...editForm, url: e.target.value }), placeholder: 'URL (/page/xxx 或 https://...)', className: 'input-field' }),
            items.length > 1 && React.createElement('select', { value: editForm.parentId, onChange: (e: React.ChangeEvent<HTMLSelectElement>) => setEditForm({ ...editForm, parentId: e.target.value }), className: 'input-field' },
              React.createElement('option', { value: '' }, t('top level', getLang())),
              items.filter((it: any, i: number) => i !== editingIdx).map((it: any) => React.createElement('option', { key: it.id, value: it.id }, it.label))),
            React.createElement('div', { className: 'flex gap-2' },
              React.createElement('button', { onClick: saveEdit, className: 'btn-primary flex-1 justify-center' }, React.createElement(Save, { size: 14 }), t('save', getLang())),
              React.createElement('button', { onClick: () => setEditingIdx(null), className: 'btn-secondary' }, t('cancel', getLang()))
            )
          )
        )
        : React.createElement('div', { className: 'card p-4' },
          React.createElement('h3', { className: 'text-sm font-semibold text-gray-900 mb-3' }, newItem.parentId
            ? t('add sub item', getLang()) + ' → ' + (items.find((it: any) => it.id === newItem.parentId)?.label || '')
            : t('add item', getLang())),      )
    )
  );
}
