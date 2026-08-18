import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, ArrowLeft, Palette, FileText, Settings2, X, Eye } from 'lucide-react';
import { useToast } from '../lib/toast';
import RichEditor from '../components/RichEditor';
import VisualEditor from '../components/VisualEditor';
import RevisionsPanel from '../components/RevisionsPanel';
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
  const [password, setPassword] = useState('');
  const [featured, setFeatured] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [mediaItems, setMediaItems] = useState<any[]>([]);
  const toast = useToast();
  const [visualMode, setVisualMode] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [saveState, setSaveState] = useState<'saved' | 'saving' | 'dirty'>('saved');
  const [visualCss, setVisualCss] = useState('');
  const [saving, setSaving] = useState(false);
  const createdIdRef = useRef<string | null>(null);

  useEffect(() => { api.get('/pages').then(r => { const all = r.data; setParentPages(all.filter((p: any) => p.id !== id)); if (id) { const p = all.find((x: any) => x.id === id); if (p) { setTitle(p.title); setSlug(p.slug || ''); setContent(p.content); setStatus(p.status === 'published' && p.password ? 'password' : p.status); setMenuOrder(p.menuOrder); setParentId(p.parentId || ''); setPassword(p.password || ''); if (p.featured) setFeatured(p.featured); if (p.excerpt) setExcerpt(p.excerpt); if (p.meta?._visual_css) setVisualCss(p.meta._visual_css); } } }); api.get('/media').then(r => setMediaItems(r.data.media || [])).catch(() => {}); }, [id]);

  // stay=false (publish): navigate to pages; stay=true (draft from the builder):
  // keep editing in place
  async function handleSave(s: string, stay = false) {
    setSaving(true);
    setSaveState('saving');
    try {
      // "Save draft" always saves as draft; "Publish" uses the user-selected
      // status (published / password-protected / private), falling back to
      // published when the select is still on draft.
      const finalStatus = s === 'draft' ? 'draft' : (status === 'draft' ? 'published' : status);
      const payload: any = { title, content, status: finalStatus, menuOrder, parentId: parentId || null, password, featured: featured || undefined, excerpt };
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
    // ---- VISUAL MODE: full-screen Gutenberg-style builder ----
    visualMode && React.createElement('div', { className: 'fixed inset-0 z-50 bg-white dark:bg-gray-900 flex flex-col' },
      // Editor area — VisualEditor provides its own Gutenberg header
      React.createElement('div', { className: 'flex-1 relative overflow-hidden' },
        React.createElement(VisualEditor, {
          content, css: visualCss,
          onChange: (html: string, css: string) => { setContent(html); setVisualCss(css); setSaveState('dirty'); },
          height: '100%',
          onSaveShortcut: () => handleSave('draft', true),
          onPublish: () => handleSave('published'),
          onBack: () => setVisualMode(false),
          saveState,
          pageSettings: {
            status,
            onStatusChange: (v: string) => { setStatus(v); setSaveState('dirty'); },
            parentId,
            onParentIdChange: (v: string) => { setParentId(v); setSaveState('dirty'); },
            parentPages: parentPages.filter((p: any) => p.id !== id).map((p: any) => ({ id: p.id, title: p.title })),
            menuOrder,
            onMenuOrderChange: (v: number) => { setMenuOrder(v); setSaveState('dirty'); },
            password,
            onPasswordChange: (v: string) => { setPassword(v); setSaveState('dirty'); },
            slug,
            showPreview: () => { if (slug) window.open(window.location.origin + '/page/' + slug, '_blank'); },
            featuredImage: featured || undefined,
            onFeaturedImageChange: (url: string) => { setFeatured(url); setSaveState('dirty'); },
            showMediaPicker: () => {},   // the sidebar uses its own inline media grid
            excerpt,
            onExcerptChange: (v: string) => { setExcerpt(v); setSaveState('dirty'); },
            // Revisions panel (same info as the rich-text sidebar)
            postId: id || createdIdRef.current || undefined,
            onRestoreRevision: (post: any) => { setTitle(post.title); setContent(post.content || ''); setSaveState('dirty'); },
          },
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
                  React.createElement('option', { value: 'draft' }, t('draft', getLang())), React.createElement('option', { value: 'published' }, t('published', getLang())), React.createElement('option', { value: 'password' }, t('password protected', getLang())), React.createElement('option', { value: 'private' }, t('private', getLang()))
                ),
                React.createElement('input', { type: 'password', value: password, onChange: e => setPassword(e.target.value), placeholder: t('password protect this page', getLang()), className: 'input-field mt-2' })
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
        // Featured image (same picker as the post editor's text mode)
        React.createElement('div', { className: 'card p-4' },
          React.createElement('h3', { className: 'text-sm font-semibold text-gray-900 mb-3' }, t('featured image', getLang())),
          featured ? React.createElement('div', null,
            React.createElement('img', { src: featured, alt: t('featured', getLang()), className: 'w-full h-32 object-cover rounded-lg mb-2' }),
            React.createElement('button', { onClick: () => setFeatured(''), className: 'text-xs text-red-600 hover:text-red-700' }, t('remove', getLang()))
          ) : React.createElement('div', null,
            React.createElement('button', { onClick: () => setShowMediaPicker(!showMediaPicker), className: 'btn-secondary w-full justify-center text-xs' }, t('select from media', getLang())),
            showMediaPicker && React.createElement('div', { className: 'mt-2 max-h-48 overflow-y-auto border border-gray-200 rounded-lg' },
              mediaItems.length === 0
                ? React.createElement('p', { className: 'text-xs text-gray-400 p-3' }, t('no media uploaded yet', getLang()))
                : mediaItems.filter((m: any) => m.mimeType?.startsWith('image/')).map((m: any) =>
                    React.createElement('div', { key: m.id, onClick: () => { setFeatured(m.url); setShowMediaPicker(false); }, className: 'flex items-center gap-2 p-2 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-0' },
                      React.createElement('img', { src: m.thumbnail || m.url, alt: m.original, className: 'w-10 h-10 object-cover rounded' }),
                      React.createElement('span', { className: 'text-xs text-gray-600 truncate flex-1' }, m.original)
                    )
                  )
            )
          )
        ),
        // Excerpt (matches the visual editor sidebar)
        React.createElement('div', { className: 'card p-4' },
          React.createElement('h3', { className: 'text-sm font-semibold text-gray-900 mb-3' }, t('excerpt', getLang())),
          React.createElement('textarea', { value: excerpt, onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => setExcerpt(e.target.value), placeholder: t('write a short excerpt', getLang()), className: 'input-field', rows: 3 })
        ),
        // Permalink (matches the visual editor sidebar)
        React.createElement('div', { className: 'card p-4' },
          React.createElement('h3', { className: 'text-sm font-semibold text-gray-900 mb-3' }, t('permalink', getLang())),
          React.createElement('p', { className: 'text-xs text-gray-500 break-all' }, window.location.origin + '/page/' + (slug || t('untitled', getLang()))),
          slug && React.createElement('button', { onClick: () => window.open(window.location.origin + '/page/' + slug, '_blank'), className: 'text-xs text-primary-600 hover:text-primary-700 mt-1' }, t('view page', getLang()))
        ),
        React.createElement('div', { className: 'card p-4' },
          React.createElement('h3', { className: 'text-sm font-semibold text-gray-900 mb-3' }, t('status', getLang())),
          React.createElement('select', { value: status, onChange: (e: React.ChangeEvent<HTMLSelectElement>) => setStatus(e.target.value), className: 'input-field' },
            React.createElement('option', { value: 'draft' }, t('draft', getLang())), React.createElement('option', { value: 'published' }, t('published', getLang())), React.createElement('option', { value: 'password' }, t('password protected', getLang())), React.createElement('option', { value: 'private' }, t('private', getLang()))
          ),
          status === 'password' && React.createElement('input', { type: 'password', value: password, onChange: e => setPassword(e.target.value), placeholder: t('password protect this page', getLang()), className: 'input-field mt-2' })
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
        ),
        id && React.createElement(RevisionsPanel, { postId: id, onRestore: (post: any) => { setTitle(post.title); setContent(post.content || ''); setSaveState('dirty'); } })
      )
    )
  );
}
