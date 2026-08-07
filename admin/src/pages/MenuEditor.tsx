import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, GripVertical, Save } from 'lucide-react';
import api from '../lib/api';

export default function MenuEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [menu, setMenu] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [pages, setPages] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [newItem, setNewItem] = useState({ type: 'page', label: '', url: '', pageId: '', categoryId: '' });

  useEffect(() => {
    api.get('/menus').then(r => { const m = r.data.find((x: any) => x.id === id); if (m) { setMenu(m); setItems(m.items || []); } });
    api.get('/pages').then(r => setPages(r.data.filter((p: any) => p.status === 'published')));
    api.get('/categories').then(r => setCategories(r.data));
  }, [id]);

  function addItem() {
    if (!newItem.label) return;
    let url = newItem.url;
    if (newItem.type === 'page' && newItem.pageId) url = '/page/' + pages.find(p => p.id === newItem.pageId)?.slug;
    if (newItem.type === 'category' && newItem.categoryId) url = '/category/' + categories.find(c => c.id === newItem.categoryId)?.slug;
    setItems([...items, { id: Date.now().toString(), label: newItem.label, url: url || '#' }]);
    setShowAdd(false); setNewItem({ type: 'page', label: '', url: '', pageId: '', categoryId: '' });
  }

  function removeItem(idx: number) { setItems(items.filter((_, i) => i !== idx)); }
  function moveItem(idx: number, dir: number) {
    const next = [...items];
    const target = idx + dir;
    if (target < 0 || target >= next.length) return;
    [next[idx], next[target]] = [next[target], next[idx]];
    setItems(next);
  }

  async function saveMenu() {
    await api.put('/menus/' + id, { items });
    navigate('/menus');
  }

  if (!menu) return React.createElement('p', { className: 'text-gray-500' }, 'Loading...');

  return React.createElement('div', null,
    React.createElement('div', { className: 'flex items-center justify-between mb-6' },
      React.createElement('div', { className: 'flex items-center gap-3' },
        React.createElement('button', { onClick: () => navigate('/menus'), className: 'p-2 text-gray-400 hover:text-gray-600' }, React.createElement(ArrowLeft, { size: 20 })),
        React.createElement('h2', { className: 'text-2xl font-bold text-gray-900' }, 'Edit: ' + menu.name)
      ),
      React.createElement('button', { onClick: saveMenu, className: 'btn-primary' }, React.createElement(Save, { size: 16 }), 'Save Menu')
    ),
    React.createElement('div', { className: 'grid grid-cols-1 lg:grid-cols-3 gap-6' },
      React.createElement('div', { className: 'lg:col-span-2' },
        React.createElement('div', { className: 'card p-4' },
          React.createElement('h3', { className: 'text-sm font-semibold text-gray-900 mb-4' }, 'Menu Items'),
          items.length === 0 ? React.createElement('p', { className: 'text-sm text-gray-400 py-4' }, 'No items yet. Add items from the right panel.')
          : React.createElement('div', { className: 'space-y-1' }, items.map((item: any, idx: number) =>
              React.createElement('div', { key: item.id, className: 'flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200' },
                React.createElement('div', { className: 'flex flex-col gap-0.5' },
                  React.createElement('button', { onClick: () => moveItem(idx, -1), className: 'p-0.5 text-gray-300 hover:text-gray-500 leading-none' }, '\u25b2'),
                  React.createElement('button', { onClick: () => moveItem(idx, 1), className: 'p-0.5 text-gray-300 hover:text-gray-500 leading-none' }, '\u25bc')
                ),
                React.createElement(GripVertical, { size: 14, className: 'text-gray-300' }),
                React.createElement('div', { className: 'flex-1' },
                  React.createElement('span', { className: 'text-sm font-medium text-gray-900' }, item.label),
                  React.createElement('span', { className: 'text-xs text-gray-400 ml-2' }, item.url)
                ),
                React.createElement('button', { onClick: () => removeItem(idx), className: 'p-1 text-gray-400 hover:text-red-600' }, React.createElement(Trash2, { size: 14 }))
              )
            ))
        )
      ),
      React.createElement('div', { className: 'space-y-4' },
        React.createElement('div', { className: 'card p-4' },
          React.createElement('h3', { className: 'text-sm font-semibold text-gray-900 mb-3' }, 'Add Item'),
          React.createElement('div', { className: 'space-y-3' },
            React.createElement('select', { value: newItem.type, onChange: (e: React.ChangeEvent<HTMLSelectElement>) => setNewItem({ ...newItem, type: e.target.value }), className: 'input-field' },
              React.createElement('option', { value: 'page' }, 'Page'), React.createElement('option', { value: 'category' }, 'Category'), React.createElement('option', { value: 'custom' }, 'Custom Link')
            ),
            React.createElement('input', { value: newItem.label, onChange: (e: React.ChangeEvent<HTMLInputElement>) => setNewItem({ ...newItem, label: e.target.value }), placeholder: 'Label', className: 'input-field' }),
            newItem.type === 'page' && React.createElement('select', { value: newItem.pageId, onChange: (e: React.ChangeEvent<HTMLSelectElement>) => setNewItem({ ...newItem, pageId: e.target.value }), className: 'input-field' },
              React.createElement('option', { value: '' }, 'Select page...'), pages.map((p: any) => React.createElement('option', { key: p.id, value: p.id }, p.title))
            ),
            newItem.type === 'category' && React.createElement('select', { value: newItem.categoryId, onChange: (e: React.ChangeEvent<HTMLSelectElement>) => setNewItem({ ...newItem, categoryId: e.target.value }), className: 'input-field' },
              React.createElement('option', { value: '' }, 'Select category...'), categories.map((c: any) => React.createElement('option', { key: c.id, value: c.id }, c.name))
            ),
            newItem.type === 'custom' && React.createElement('input', { value: newItem.url, onChange: (e: React.ChangeEvent<HTMLInputElement>) => setNewItem({ ...newItem, url: e.target.value }), placeholder: 'URL (e.g. https://...)', className: 'input-field' }),
            React.createElement('button', { onClick: addItem, className: 'btn-primary w-full justify-center' }, React.createElement(Plus, { size: 16 }), 'Add to Menu')
          )
        )
      )
    )
  );
}
