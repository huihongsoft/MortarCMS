import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, ArrowLeft, Palette, FileText, Settings2, X } from 'lucide-react';
import { useToast } from '../lib/toast';
import RichEditor from '../components/RichEditor';
import VisualEditor from '../components/VisualEditor';
import api from '../lib/api';
import { t, getLang } from '../lib/i18n';

export default function PageEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [status, setStatus] = useState('draft');
  const [parentId, setParentId] = useState('');
  const [parentPages, setParentPages] = useState<any[]>([]);
  const [menuOrder, setMenuOrder] = useState(0);
  const toast = useToast();
  const [visualMode, setVisualMode] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [visualCss, setVisualCss] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => { api.get('/pages').then(r => { const all = r.data; setParentPages(all.filter((p: any) => p.id !== id)); if (id) { const p = all.find((x: any) => x.id === id); if (p) { setTitle(p.title); setContent(p.content); setStatus(p.status); setMenuOrder(p.menuOrder); setParentId(p.parentId || ''); if (p.meta?._visual_css) setVisualCss(p.meta._visual_css); } } }); }, [id]);

  async function handleSave(s: string) {
    setSaving(true);
    try { const payload: any = { title, content, status: s, menuOrder, parentId: parentId || null }; if (visualCss) payload.meta = { _visual_css: visualCss }; if (id) await api.put(`/pages/${id}`, payload); else await api.post('/pages', payload); navigate('/pages'); } catch (e: any) { const msg = e?.response?.data?.error || e?.response?.data?.message || t('save failed', getLang()); toast.toast(typeof msg === 'string' ? msg : t('save failed', getLang()), 'error'); } finally { setSaving(false); }
  }

  return React.createElement('div', null,
    React.createElement('div', { className: 'flex items-center justify-between mb-6' },
      React.createElement('div', { className: 'flex items-center gap-3' },
        React.createElement('button', { onClick: () => navigate('/pages'), className: 'p-2 text-gray-400 hover:text-gray-600' }, React.createElement(ArrowLeft, { size: 20 })),
        React.createElement('h2', { className: 'text-2xl font-bold text-gray-900' }, id ? t('edit page', getLang()) : t('new page', getLang()))
      ),
      React.createElement('div', { className: 'flex items-center gap-2' },
        React.createElement('button', { onClick: () => handleSave('draft'), disabled: saving || !title, className: 'btn-secondary' }, React.createElement(Save, { size: 16 }), t('save draft', getLang())),
        React.createElement('button', { onClick: () => handleSave('published'), disabled: saving || !title, className: 'btn-primary' }, t('publish', getLang()))
      )
    ),
    // ---- VISUAL MODE: full-width editor + settings drawer ----
    visualMode && React.createElement(React.Fragment, null,
      React.createElement('div', { className: 'space-y-3' },
        React.createElement('input', { value: title, onChange: e => setTitle(e.target.value), placeholder: t('page title', getLang()), className: 'input-field text-lg font-semibold' }),
        React.createElement('div', { className: 'flex items-center justify-between border-b border-gray-200' },
          React.createElement('div', { className: 'flex items-center' },
            React.createElement('button', {
              onClick: () => setVisualMode(false),
              className: 'flex items-center gap-1.5 px-3 py-2 text-sm border-b-2 transition-colors ' +
                (!visualMode ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700'),
            }, React.createElement(FileText, { size: 14 }), t('rich text', getLang())),
            React.createElement('button', {
              onClick: () => setVisualMode(true),
              className: 'flex items-center gap-1.5 px-3 py-2 text-sm border-b-2 transition-colors ' +
                (visualMode ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700'),
            }, React.createElement(Palette, { size: 14 }), t('visual design', getLang())),
          ),
          React.createElement('button', {
            onClick: () => setShowSettings(!showSettings),
            className: 'flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg border ' +
              (showSettings ? 'border-primary-400 bg-primary-50 text-primary-700' : 'border-gray-300 text-gray-600 hover:bg-gray-50'),
          }, React.createElement(Settings2, { size: 14 }), t('page settings', getLang())),
        ),
        React.createElement(VisualEditor, {
          content, css: visualCss,
          onChange: (html: string, css: string) => { setContent(html); setVisualCss(css); },
          height: 'calc(100vh - 195px)',
        }),
      ),
      // Settings drawer
      showSettings && React.createElement('div', { className: 'fixed inset-0 z-40 bg-black/30', onClick: () => setShowSettings(false) },
        React.createElement('div', {
          className: 'absolute right-0 top-0 h-full w-96 max-w-[90vw] bg-white shadow-2xl overflow-y-auto',
          onClick: (e: React.MouseEvent) => e.stopPropagation(),
        },
          React.createElement('div', { className: 'sticky top-0 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between z-10' },
            React.createElement('h3', { className: 'text-sm font-semibold text-gray-900' }, t('page settings', getLang())),
            React.createElement('button', { onClick: () => setShowSettings(false), className: 'p-1 text-gray-400 hover:text-gray-600' }, React.createElement(X, { size: 16 }))
          ),
          React.createElement('div', { className: 'p-4 space-y-4' },
            React.createElement('div', { className: 'card p-4' },
              React.createElement('h3', { className: 'text-sm font-semibold text-gray-900 mb-3' }, t('status', getLang())),
              React.createElement('select', { value: status, onChange: (e: React.ChangeEvent<HTMLSelectElement>) => setStatus(e.target.value), className: 'input-field' },
                React.createElement('option', { value: 'draft' }, t('draft', getLang())), React.createElement('option', { value: 'published' }, t('published', getLang())), React.createElement('option', { value: 'private' }, t('private', getLang()))
              )
            ),
            parentPages.length > 0 && React.createElement('div', { className: 'card p-4' },
              React.createElement('h3', { className: 'text-sm font-semibold text-gray-900 mb-3' }, t('parent page', getLang())),
              React.createElement('select', { value: parentId, onChange: (e: React.ChangeEvent<HTMLSelectElement>) => setParentId(e.target.value), className: 'input-field' },
                React.createElement('option', { value: '' }, '(' + t('no parent', getLang()) + ')'),
                parentPages.map((pp: any) => React.createElement('option', { key: pp.id, value: pp.id }, pp.title))
              )
            ),
            React.createElement('div', { className: 'card p-4' },
              React.createElement('h3', { className: 'text-sm font-semibold text-gray-900 mb-3' }, t('menu order', getLang())),
              React.createElement('input', { type: 'number', value: menuOrder, onChange: e => setMenuOrder(parseInt(e.target.value) || 0), className: 'input-field' })
            )
          )
        )
      )
    ),
    // ---- TEXT MODE: original 3-col grid ----
    !visualMode && React.createElement('div', { className: 'grid grid-cols-1 lg:grid-cols-3 gap-6' },
      React.createElement('div', { className: 'lg:col-span-2 space-y-4' },
        React.createElement('input', { value: title, onChange: e => setTitle(e.target.value), placeholder: t('page title', getLang()), className: 'input-field text-lg font-semibold' }),
        React.createElement('div', { className: 'flex items-center border-b border-gray-200 mb-0' },
          React.createElement('button', {
            onClick: () => setVisualMode(false),
            className: 'flex items-center gap-1.5 px-3 py-2 text-sm border-b-2 transition-colors ' +
              (!visualMode ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700'),
          }, React.createElement(FileText, { size: 14 }), t('rich text', getLang())),
          React.createElement('button', {
            onClick: () => setVisualMode(true),
            className: 'flex items-center gap-1.5 px-3 py-2 text-sm border-b-2 transition-colors ' +
              (visualMode ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700'),
          }, React.createElement(Palette, { size: 14 }), t('visual design', getLang())),
        ),
        React.createElement(RichEditor, { value: content, onChange: setContent, placeholder: t('write page content', getLang()) })
      ),
      React.createElement('div', { className: 'space-y-4' },
        React.createElement('div', { className: 'card p-4' },
          React.createElement('h3', { className: 'text-sm font-semibold text-gray-900 mb-3' }, t('status', getLang())),
          React.createElement('select', { value: status, onChange: (e: React.ChangeEvent<HTMLSelectElement>) => setStatus(e.target.value), className: 'input-field' },
            React.createElement('option', { value: 'draft' }, t('draft', getLang())), React.createElement('option', { value: 'published' }, t('published', getLang())), React.createElement('option', { value: 'private' }, t('private', getLang()))
          )
        ),
        parentPages.length > 0 && React.createElement('div', { className: 'card p-4' },
          React.createElement('h3', { className: 'text-sm font-semibold text-gray-900 mb-3' }, t('parent page', getLang())),
          React.createElement('select', { value: parentId, onChange: (e: React.ChangeEvent<HTMLSelectElement>) => setParentId(e.target.value), className: 'input-field' },
            React.createElement('option', { value: '' }, '(' + t('no parent', getLang()) + ')'),
            parentPages.map((pp: any) => React.createElement('option', { key: pp.id, value: pp.id }, pp.title))
          )
        ),
        React.createElement('div', { className: 'card p-4' },
          React.createElement('h3', { className: 'text-sm font-semibold text-gray-900 mb-3' }, t('menu order', getLang())),
          React.createElement('input', { type: 'number', value: menuOrder, onChange: e => setMenuOrder(parseInt(e.target.value) || 0), className: 'input-field' })
        )
      )
    )
  );
}
