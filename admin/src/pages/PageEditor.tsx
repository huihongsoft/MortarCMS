import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, ArrowLeft, Palette, FileText, Settings2, X, Eye } from 'lucide-react';
import { useToast } from '../lib/toast';
import RichEditor from '../components/RichEditor';
import VisualEditor from '../components/VisualEditor';
import api from '../lib/api';
import { t, getLang } from '../lib/i18n';

export default function PageEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [content, setContent] = useState('');
  const [status, setStatus] = useState('draft');
  const [parentId, setParentId] = useState('');
  const [parentPages, setParentPages] = useState<any[]>([]);
  const [menuOrder, setMenuOrder] = useState(0);
  const toast = useToast();
  const [visualMode, setVisualMode] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [saveState, setSaveState] = useState<'saved' | 'saving' | 'dirty'>('saved');
  const [visualCss, setVisualCss] = useState('');
  const [saving, setSaving] = useState(false);
  const createdIdRef = useRef<string | null>(null);

  useEffect(() => { api.get('/pages').then(r => { const all = r.data; setParentPages(all.filter((p: any) => p.id !== id)); if (id) { const p = all.find((x: any) => x.id === id); if (p) { setTitle(p.title); setSlug(p.slug || ''); setContent(p.content); setStatus(p.status); setMenuOrder(p.menuOrder); setParentId(p.parentId || ''); if (p.meta?._visual_css) setVisualCss(p.meta._visual_css); } } }); }, [id]);

  // stay=false (publish): navigate to pages; stay=true (draft from the builder):
  // keep editing in place
  async function handleSave(s: string, stay = false) {
    setSaving(true);
    setSaveState('saving');
    try {
      const payload: any = { title, content, status: s, menuOrder, parentId: parentId || null };
      if (visualCss) payload.meta = { _visual_css: visualCss };
      const pageId = id || createdIdRef.current;
      if (pageId) await api.put(`/pages/${pageId}`, payload);
      else {
        const r = await api.post('/pages', payload);
        if (r.data?.id) createdIdRef.current = r.data.id;
      }
      setSaveState('saved');
      if (!stay) navigate('/pages');
    } catch (e: any) {
      setSaveState('dirty');
      toast.toast(describeSaveError(e, getLang()), 'error');
    } finally { setSaving(false); }
  }

  function describeSaveError(e: any, lang: string): string {
    if (!e?.response) return t('network error - check your connection and try again', lang);
    const status = e.response.status;
    const d = e.response.data;
    let msg = typeof d === 'string' ? d : (d?.error || d?.message || '');
    if (Array.isArray(msg)) msg = msg.map((x: any) => x?.message || JSON.stringify(x)).join('; ');
    if (status === 401) return t('session expired - please log in again', lang);
    if (status === 429) return t('too many requests - try again in a moment', lang);
    return String(msg || t('save failed', lang)) + ' (' + status + ')';
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
    // ---- VISUAL MODE: full-screen builder (Elementor/Fanke style) ----
    visualMode && React.createElement('div', { className: 'fixed inset-0 z-50 bg-white dark:bg-gray-900 flex flex-col' },
      // Builder top bar
      React.createElement('div', { className: 'flex flex-wrap items-center gap-3 px-4 py-2 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shrink-0' },
        React.createElement('button', {
          onClick: () => setVisualMode(false),
          className: 'flex items-center gap-1.5 px-2.5 py-1.5 text-sm text-gray-500 hover:text-gray-900 rounded-lg hover:bg-gray-100',
          title: t('back to rich text', getLang()),
        }, React.createElement(ArrowLeft, { size: 16 }), React.createElement(FileText, { size: 14 })),
        React.createElement('div', { className: 'relative flex-1 max-w-xl' },
          React.createElement('input', { value: title, onChange: e => setTitle(e.target.value), placeholder: t('page title', getLang()), className: 'input-field text-sm font-semibold pr-16' })
        ),
        React.createElement('div', { className: 'flex-1' }),
        // Save status indicator
        React.createElement('span', {
          className: 'flex items-center gap-1.5 text-[11px] ' +
            (saveState === 'saved' ? 'text-green-600' : saveState === 'saving' ? 'text-blue-600' : 'text-amber-600'),
        },
          React.createElement('span', { className: 'inline-block w-2 h-2 rounded-full ' + (saveState === 'saved' ? 'bg-green-500' : saveState === 'saving' ? 'bg-blue-500 animate-pulse' : 'bg-amber-500') }),
          saveState === 'saved' ? t('saved', getLang()) : saveState === 'saving' ? t('saving...', getLang()) : t('unsaved changes', getLang())
        ),
        React.createElement('button', {
          onClick: () => setShowSettings(!showSettings),
          className: 'flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg border ' +
            (showSettings ? 'border-primary-400 bg-primary-50 text-primary-700' : 'border-gray-300 text-gray-600 hover:bg-gray-50'),
        }, React.createElement(Settings2, { size: 14 }), t('page settings', getLang())),
        // Preview on the live site (only when a slug exists)
        slug && React.createElement('a', {
          href: window.location.origin + '/page/' + slug,
          target: '_blank', rel: 'noopener',
          className: 'flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50',
        }, React.createElement(Eye, { size: 14 }), t('preview', getLang())),
        React.createElement('button', { onClick: () => handleSave('draft', true), disabled: saving || !title, className: 'btn-secondary text-xs' }, React.createElement(Save, { size: 14 }), t('save draft', getLang())),
        React.createElement('button', { onClick: () => handleSave('published'), disabled: saving || !title, className: 'btn-primary text-xs' }, t('publish', getLang()))
      ),
      // Editor area + settings drawer
      React.createElement('div', { className: 'flex-1 relative overflow-hidden' },
        React.createElement(VisualEditor, {
          content, css: visualCss,
          onChange: (html: string, css: string) => { setContent(html); setVisualCss(css); setSaveState('dirty'); },
          height: '100%',
          onSaveShortcut: () => handleSave('draft', true),
        }),
        showSettings && React.createElement('div', { className: 'absolute inset-y-0 right-0 z-20 bg-black/30', onClick: () => setShowSettings(false) },
          React.createElement('div', {
            className: 'absolute right-0 top-0 h-full w-96 max-w-[90vw] bg-white dark:bg-gray-900 shadow-2xl overflow-y-auto',
            onClick: (e: React.MouseEvent) => e.stopPropagation(),
          },
            React.createElement('div', { className: 'sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center justify-between z-10' },
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
