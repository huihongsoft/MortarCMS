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
  const [linkCats, setLinkCats] = useState<any[]>([]);
  const [newItem, setNewItem] = useState<{ type: string; label: string; url: string; pageId: string; categoryId: string; linkCategoryId: string; parentId: string }>({ type: 'page', label: '', url: '', pageId: '', categoryId: '', linkCategoryId: '', parentId: '' });
  const [editParent, setEditParent] = useState<{ id: string; parentId: string } | null>(null);

  useEffect(() => {
    api.get('/menus').then(r => { const m = r.data.find((x: any) => x.id === id); if (m) { setMenu(m); setItems(m.items || []); setMenuName(m.name || ''); setMenuLocation(m.location || 'primary'); setMenuSiteId(m.siteId || ''); } });
    api.get('/sites').then(r => setSites(r.data?.sites || r.data || []));
    api.get('/pages').then(r => setPages(r.data.filter((p: any) => p.status === 'published')));
    api.get('/categories').then(r => setCategories(r.data));
    api.get('/links/categories').then(r => setLinkCats(r.data || [])).catch(() => {});
  }, [id]);

  function addItem() {
    if (!newItem.label) return;
    let url = newItem.url;
    if (newItem.type === 'page' && newItem.pageId) url = '/page/' + pages.find(p => p.id === newItem.pageId)?.slug;
    if (newItem.type === 'category' && newItem.categoryId) url = '/category/' + categories.find(c => c.id === newItem.categoryId)?.slug;
    if (newItem.type === 'linkcat' && newItem.linkCategoryId) {
      const cat = linkCats.find(c => c.id === newItem.linkCategoryId);
      const catPage = cat?.pageId ? pages.find(pg => pg.id === cat.pageId) : null;
      url = catPage ? '/page/' + catPage.slug : '/links?category=' + cat?.slug;
    }
    setItems([...items, { id: Date.now().toString(), label: newItem.label, url: url || '#', parentId: newItem.parentId || null }]);
    setShowAdd(false); setNewItem({ type: 'page', label: '', url: '', pageId: '', categoryId: '', linkCategoryId: '', parentId: '' });
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
  const [dropTargetIdx, setDropTargetIdx] = useState<number | null>(null);
  const [menuName, setMenuName] = useState('');
  const [menuLocation, setMenuLocation] = useState('primary');
  const [menuSiteId, setMenuSiteId] = useState('');
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<{ label: string; url: string; parentId: string }>({ label: '', url: '', parentId: '' });
  const [sites, setSites] = useState<any[]>([]);
  // Drop a dragged item onto another item to make it a CHILD of that item
  // (reordering is done with the up/down arrows). Cycle guard: you cannot
  // drop an item onto itself or onto one of its own descendants.
  function isDescendant(id: string, ancestorId: string | null): boolean {
    if (!ancestorId) return false;
    if (id === ancestorId) return true;
    const parent = items.find((it: any) => it.id === ancestorId);
    return parent ? isDescendant(id, parent.parentId) : false;
  }
  function onDrop(targetIdx: number) {
    if (dragIdx === null || dragIdx === targetIdx) { setDragIdx(null); setDropTargetIdx(null); return; }
    const dragged = items[dragIdx];
    const target = items[targetIdx];
    if (!dragged || !target || isDescendant(dragged.id, target.id)) { setDragIdx(null); setDropTargetIdx(null); return; }
    const next = items.map((it: any, i: number) => i === dragIdx ? { ...it, parentId: target.id } : it);
    setItems(next);
    setDragIdx(null);
    setDropTargetIdx(null);
  }
  function onDragOverItem(targetIdx: number) {
    if (dragIdx === null || dragIdx === targetIdx) return;
    const dragged = items[dragIdx];
    const target = items[targetIdx];
    if (dragged && target && !isDescendant(dragged.id, target.id)) setDropTargetIdx(targetIdx);
  }

  // The 新增 button next to 编辑 adds a top-level menu item (one level up)
  function startAddTop() {
    setEditingIdx(null);
    setShowAdd(true);
    setNewItem({ type: 'custom', label: '', url: '', pageId: '', categoryId: '', linkCategoryId: '', parentId: '' });
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
        ),
      ),
      React.createElement('button', { onClick: saveMenu, className: 'btn-primary' }, React.createElement(Save, { size: 16 }), t('save menu', getLang()))
    ),
    React.createElement('div', { className: 'flex flex-col sm:flex-row gap-6 items-start' },
      React.createElement('div', { className: 'flex-1 min-w-0 w-full overflow-x-auto' },
        React.createElement('div', { className: 'card p-4' },
          React.createElement('div', { className: 'flex items-center justify-between mb-4' },
            React.createElement('h3', { className: 'text-sm font-semibold text-gray-900' }, t('menu items', getLang())),
            React.createElement('button', { onClick: startEditMenu, className: 'inline-flex items-center gap-1 px-2.5 py-1.5 rounded text-xs font-medium border border-gray-200 text-gray-600 hover:border-primary-400 hover:text-primary-600 transition-colors' }, React.createElement(Edit2, { size: 12 }), t('edit', getLang())),
          ),
          items.length === 0 ? React.createElement('p', { className: 'text-sm text-gray-400 py-4' }, t('no menu items yet', getLang()))
          : React.createElement('div', {
              className: 'space-y-1 min-h-[120px]',
              onClick: () => setEditingIdx(null),
              // Drop on the empty area of the list to move the item back to top level
              onDragOver: (e: React.DragEvent) => { if (e.target === e.currentTarget) e.preventDefault(); },
              onDrop: (e: React.DragEvent) => {
                if (e.target === e.currentTarget && dragIdx !== null) {
                  const next = items.map((it: any, i: number) => i === dragIdx ? { ...it, parentId: null } : it);
                  setItems(next);
                  setDragIdx(null);
                  setDropTargetIdx(null);
                }
              },
            }, (() => {
              const topItems = items.filter((it: any) => !it.parentId);
              const childrenOf = (pid: string) => items.filter((it: any) => it.parentId === pid);
              const rows: React.ReactNode[] = [];
              const renderRow = (item: any, idx: number, isChild: boolean) => {
                const itemIdx = items.findIndex((x: any) => x.id === item.id);
                rows.push(React.createElement('div', {
                  key: item.id,
                  draggable: true,
                  onDragStart: () => setDragIdx(itemIdx),
                  onDragOver: (e: React.DragEvent) => { e.preventDefault(); onDragOverItem(itemIdx); },
                  onDrop: (e: React.DragEvent) => { e.stopPropagation(); onDrop(itemIdx); },
                  onDragLeave: () => setDropTargetIdx(null),
                  onClick: (e: React.MouseEvent) => e.stopPropagation(),
                  className: 'flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200 cursor-grab ' + (isChild ? 'ml-6 pl-6 border-l-4 border-l-indigo-200' : '') + ' ' + (dragIdx === itemIdx ? 'opacity-50' : '') + ' ' + (editingIdx === itemIdx ? 'ring-2 ring-primary-400' : '') + ' ' + (dropTargetIdx === itemIdx ? 'ring-2 ring-indigo-400 bg-indigo-50' : ''),
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
                  !isChild && React.createElement('button', { onClick: startAddTop, className: 'inline-flex items-center gap-1 px-2 py-1 rounded text-xs border border-gray-200 text-gray-600 hover:border-primary-400 hover:text-primary-600 transition-colors' }, React.createElement(Plus, { size: 12 }), t('add item', getLang())),
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
            })()),
          // Visible drop zone: drag an item here to move it back to top level
          dragIdx !== null && React.createElement('div', {
            onDragOver: (e: React.DragEvent) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; setDropTargetIdx(-2); },
            onDragLeave: () => setDropTargetIdx(null),
            onDrop: (e: React.DragEvent) => {
              e.preventDefault();
              if (dragIdx !== null) {
                const next = items.map((it: any, i: number) => i === dragIdx ? { ...it, parentId: null } : it);
                setItems(next);
              }
              setDragIdx(null);
              setDropTargetIdx(null);
            },
            className: 'mt-3 rounded-lg border-2 border-dashed p-3 text-center text-xs transition-colors ' + (dropTargetIdx === -2 ? 'border-indigo-400 bg-indigo-50 text-indigo-600' : 'border-gray-300 text-gray-400'),
          }, '\u2913 ' + t('drop here to make top level', getLang())),
        )
      ),
      React.createElement('div', { className: 'w-full sm:w-80 flex-shrink-0 space-y-4' },
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
            : t('add item', getLang())),
          React.createElement('div', { className: 'space-y-3' },
            React.createElement('select', { value: newItem.type, onChange: (e: React.ChangeEvent<HTMLSelectElement>) => setNewItem({ ...newItem, type: e.target.value }), className: 'input-field' },
              React.createElement('option', { value: 'page' }, t('page', getLang())), React.createElement('option', { value: 'category' }, t('category', getLang())), React.createElement('option', { value: 'linkcat' }, t('link categories', getLang())), React.createElement('option', { value: 'custom' }, t('custom link', getLang()))
            ),
            React.createElement('input', { value: newItem.label, onChange: (e: React.ChangeEvent<HTMLInputElement>) => setNewItem({ ...newItem, label: e.target.value }), placeholder: t('label', getLang()), className: 'input-field' }),
            newItem.type === 'page' && React.createElement('select', { value: newItem.pageId, onChange: (e: React.ChangeEvent<HTMLSelectElement>) => setNewItem({ ...newItem, pageId: e.target.value }), className: 'input-field' },
              React.createElement('option', { value: '' }, t('select page', getLang()) + '...'), pages.map((p: any) => React.createElement('option', { key: p.id, value: p.id }, p.title))
            ),
            newItem.type === 'category' && React.createElement('select', { value: newItem.categoryId, onChange: (e: React.ChangeEvent<HTMLSelectElement>) => setNewItem({ ...newItem, categoryId: e.target.value }), className: 'input-field' },
              React.createElement('option', { value: '' }, t('select category', getLang()) + '...'), categories.map((c: any) => React.createElement('option', { key: c.id, value: c.id }, c.name))
            ),
            newItem.type === 'linkcat' && React.createElement('select', { value: newItem.linkCategoryId, onChange: (e: React.ChangeEvent<HTMLSelectElement>) => setNewItem({ ...newItem, linkCategoryId: e.target.value }), className: 'input-field' },
              React.createElement('option', { value: '' }, t('select category', getLang()) + '...'), linkCats.map((c: any) => React.createElement('option', { key: c.id, value: c.id }, c.name))
            ),
            newItem.type === 'custom' && React.createElement('input', { value: newItem.url, onChange: (e: React.ChangeEvent<HTMLInputElement>) => setNewItem({ ...newItem, url: e.target.value }), placeholder: 'URL (https://...)', className: 'input-field' }),
            items.length > 0 && React.createElement('select', { value: newItem.parentId, onChange: (e: React.ChangeEvent<HTMLSelectElement>) => setNewItem({ ...newItem, parentId: e.target.value }), className: 'input-field' },
              React.createElement('option', { value: '' }, t('top level', getLang())),
              items.map(it => React.createElement('option', { key: it.id, value: it.id }, it.label))),
            React.createElement('button', { onClick: addItem, className: 'btn-primary w-full justify-center' }, React.createElement(Plus, { size: 16 }), t('add to menu', getLang()))
          )
        )
      )
    )
  );
}
