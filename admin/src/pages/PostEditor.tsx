import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, ArrowLeft, Palette, FileText, Settings2, X, Eye, Sparkles } from 'lucide-react';
import { useToast } from '../lib/toast';
import RichEditor from '../components/RichEditor';
import VisualEditor from '../components/VisualEditor';
import RevisionsPanel from '../components/RevisionsPanel';
import api from '../lib/api';
import { t, getLang } from '../lib/i18n';

export default function PostEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [slug, setSlug] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [status, setStatus] = useState('draft');
  const [categoryIds, setCategoryIds] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [tagNames, setTagNames] = useState<string[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const toast = useToast();
  const [metaFields, setMetaFields] = useState<{key:string,value:string}[]>([]);
  const [format, setFormat] = useState('standard');
  const [authorId, setAuthorId] = useState('');
  const [users, setUsers] = useState<any[]>([]);
  const [visualMode, setVisualMode] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [saveState, setSaveState] = useState<'saved' | 'saving' | 'dirty'>('saved');
  const [visualCss, setVisualCss] = useState('');
  const [aiOpen, setAiOpen] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState('');
  const [aiError, setAiError] = useState('');
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDesc, setSeoDesc] = useState('');
  const [templates, setTemplates] = useState<any[]>([]);
  const [templateName, setTemplateName] = useState('');
  const [saving, setSaving] = useState(false);
  const [featured, setFeatured] = useState('');
  const [mediaItems, setMediaItems] = useState<any[]>([]);
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [siteId, setSiteId] = useState('');
  const [sites, setSites] = useState<any[]>([]);
  // Tracks the id of a newly-created post so draft saves (which stay in the
  // editor) reuse the same post instead of creating duplicates
  const createdIdRef = useRef<string | null>(null);


  // Autosave every 30 seconds (stays in the editor, never navigates away)
  useEffect(() => {
    if (!title) return;
    const timer = setInterval(async () => {
      try {
        const payload: any = { title, content, excerpt, status: 'draft', siteId: siteId || null };
        payload.meta = { _visual_css: visualCss, _seo_title: seoTitle, _seo_desc: seoDesc };
        const postId = id || createdIdRef.current;
        if (postId) await api.put('/posts/' + postId, payload);
        else {
          const r = await api.post('/posts', { ...payload, categoryIds, tagNames, featured: featured || undefined });
          if (r.data?.id) createdIdRef.current = r.data.id;
        }
      } catch {}
    }, 30000);
    return () => clearInterval(timer);
  }, [title, content, excerpt, categoryIds, tagNames, featured, siteId, id, visualCss]);

  
  // Keyboard shortcut: Ctrl+S to save draft
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSave('draft');
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [title, content, excerpt, status, categoryIds, tagNames, featured, slug, format, siteId]);

  useEffect(() => { api.get('/sites').then(r => setSites(r.data || [])).catch(() => {}); api.get('/users').then(r => setUsers(r.data)).catch(() => {});
    api.get('/categories').then(r => setCategories(r.data)); api.get('/media').then(r => setMediaItems(r.data.media || []));
    api.get('/editor/templates').then(r => setTemplates(r.data.templates || [])).catch(() => {});
    if (id) { api.get(`/posts/admin?limit=100`).then(r => { const p = r.data.posts.find((x: any) => x.id === id); if (p) { setSlug(p.slug); setTitle(p.title); setContent(p.content); setExcerpt(p.excerpt); setStatus(p.status); setCategoryIds(p.categories?.map((c: any) => c.category.id) || []); setTagNames(p.tags?.map((t: any) => t.tag.name) || []); if (p.featured) setFeatured(p.featured); if (p.siteId) setSiteId(p.siteId); if (p.meta?._visual_css) setVisualCss(p.meta._visual_css); if (p.meta?._seo_title) setSeoTitle(p.meta._seo_title); if (p.meta?._seo_desc) setSeoDesc(p.meta._seo_desc); } }); } }, [id]);

  // stay=false (publish): navigate to the post list; stay=true (draft from the
  // builder): keep editing in place, like WordPress
  async function handleSave(s: string, stay = false) {
    setSaving(true);
    setSaveState('saving');
    try {
      const schedDate = (document.getElementById('scheduled-date') as HTMLInputElement)?.value || null;
      const payload: any = { title, slug: slug || undefined, content, excerpt, status: s, categoryIds, tagNames, featured: featured || undefined, format: format || 'standard', publishedAt: s === 'scheduled' && schedDate ? new Date(schedDate).toISOString() : undefined, siteId: siteId || null };
      payload.meta = { _visual_css: visualCss, _seo_title: seoTitle, _seo_desc: seoDesc };
      const postId = id || createdIdRef.current;
      if (postId) await api.put(`/posts/${postId}`, payload);
      else {
        const r = await api.post('/posts', payload);
        if (r.data?.id) createdIdRef.current = r.data.id;
      }
      setSaveState('saved');
      toast.toast(postId ? t('post updated', getLang()) : t('post created', getLang()));
      if (!stay) navigate('/posts');
    } catch (e: any) {
      setSaveState('dirty');
      toast.toast(describeSaveError(e, getLang()), 'error');
    } finally { setSaving(false); }
  }

  function addTag() { if (tagInput.trim() && !tagNames.includes(tagInput.trim())) { setTagNames([...tagNames, tagInput.trim()]); setTagInput(''); } }

  // ---- AI assistant for the editor ----
  async function runAi(action: string) {
    if (aiLoading) return;
    setAiLoading(true); setAiError(''); setAiResult('');
    try {
      const r = await api.post('/ai/generate', { action, title, content, excerpt });
      setAiResult(r.data.content || '');
    } catch (e: any) {
      setAiError(e.response?.data?.error || t('save failed', getLang()));
    } finally { setAiLoading(false); }
  }

  function applyAiResult(mode: 'append' | 'replace') {
    if (!aiResult) return;
    if (mode === 'replace') setContent(aiResult);
    else setContent((content || '') + aiResult);
    setSaveState('dirty');
  }

  function applySeoResult() {
    const tMatch = aiResult.match(/SEO标题[:：]\s*(.+)/);
    const dMatch = aiResult.match(/SEO描述[:：]\s*(.+)/);
    if (tMatch) setSeoTitle(tMatch[1].trim());
    if (dMatch) setSeoDesc(dMatch[1].trim());
    setSaveState('dirty');
  }

  function applySummary() {
    const clean = aiResult.replace(/^摘要[:：]\s*/i, '').trim();
    if (clean) { setExcerpt(clean); setSaveState('dirty'); }
  }

  const AI_ACTIONS = [
    { key: 'generate', label: t('ai generate', getLang()), icon: '✍️' },
    { key: 'polish', label: t('ai polish', getLang()), icon: '✨' },
    { key: 'continue', label: t('ai continue', getLang()), icon: '➡️' },
    { key: 'translate', label: t('ai translate', getLang()), icon: '🌐' },
    { key: 'summarize', label: t('ai summarize', getLang()), icon: '📝' },
    { key: 'tags', label: t('ai suggest tags', getLang()), icon: '🏷️' },
    { key: 'seo', label: t('ai seo', getLang()), icon: '🔍' },
  ];

  function applyTags() {
    const tags = aiResult.split(/[,，、\n]/).map((x: string) => x.trim().replace(/^\d+[.、)]\s*/, '')).filter(Boolean);
    if (tags.length) {
      const merged = [...new Set([...tagNames, ...tags.slice(0, 8)])];
      setTagNames(merged);
      setSaveState('dirty');
    }
  }

  // AI panel (shared between text mode and the visual-mode drawer)
  function renderAiPanel() {
    return React.createElement('div', { className: 'card p-4' },
      React.createElement('div', { className: 'flex items-center justify-between mb-3' },
        React.createElement('h3', { className: 'text-sm font-semibold text-gray-900 flex items-center gap-1.5' },
          React.createElement(Sparkles, { size: 14, className: 'text-primary-600' }), t('ai assistant', getLang())),
        React.createElement('button', { onClick: () => setAiOpen(!aiOpen), className: 'text-xs text-gray-400 hover:text-gray-600' }, aiOpen ? t('collapse', getLang()) : t('expand', getLang())),
      ),
      aiOpen && React.createElement('div', null,
        React.createElement('div', { className: 'flex flex-wrap gap-1.5 mb-3' },
          AI_ACTIONS.map(a => React.createElement('button', {
            key: a.key,
            onClick: () => runAi(a.key),
            disabled: aiLoading || (a.key === 'generate' && !title),
            className: 'flex items-center gap-1 px-2.5 py-1.5 text-xs rounded-lg border border-gray-200 text-gray-600 hover:border-primary-400 hover:text-primary-600 disabled:opacity-40 transition-colors',
          }, React.createElement('span', null, a.icon), a.label))
        ),
        aiLoading && React.createElement('p', { className: 'text-xs text-gray-400 mb-2' }, t('ai working', getLang()) + '...'),
        aiError && React.createElement('p', { className: 'text-xs text-red-600 mb-2' }, aiError),
        aiResult && React.createElement('div', null,
          React.createElement('div', { className: 'max-h-48 overflow-y-auto bg-gray-50 rounded-lg p-3 text-xs text-gray-700 prose prose-sm max-w-none' },
            React.createElement('div', { dangerouslySetInnerHTML: { __html: aiResult } })),
          React.createElement('div', { className: 'flex flex-wrap gap-1.5 mt-2' },
            aiResult.startsWith('SEO') ? React.createElement('button', { onClick: applySeoResult, className: 'btn-primary text-xs' }, t('apply seo', getLang()))
            : /摘要/.test(aiResult) && aiResult.length < 400 ? React.createElement('button', { onClick: applySummary, className: 'btn-primary text-xs' }, t('apply as excerpt', getLang()))
            : aiResult.split(/[,，、\n]/).length > 2 && aiResult.length < 200 ? React.createElement('button', { onClick: applyTags, className: 'btn-primary text-xs' }, t('apply tags', getLang()))
            : React.createElement(React.Fragment, null,
                React.createElement('button', { onClick: () => applyAiResult('append'), className: 'btn-secondary text-xs' }, t('insert to end', getLang())),
                React.createElement('button', { onClick: () => applyAiResult('replace'), className: 'btn-primary text-xs' }, t('replace content', getLang()))),
          )
        )
      )
    );
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
  async function saveTemplate() { if (!templateName.trim() || !content) return; await api.post('/editor/templates', { name: templateName, html: content, css: visualCss }); toast.toast(t('template saved', getLang())); setTemplateName(''); api.get('/editor/templates').then(r => setTemplates(r.data.templates || [])); }
  function loadTemplate(tpl: any) { setContent(tpl.html); setVisualCss(tpl.css || ''); toast.toast(t('template loaded', getLang())); }

  // Sidebar settings cards (used in text mode as a column, in visual mode as a drawer)
  function renderSidebar() {
    return React.createElement('div', { className: 'space-y-4' },
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
      // SEO panel with Google search preview
      React.createElement('div', { className: 'card p-4' },
        React.createElement('h3', { className: 'text-sm font-semibold text-gray-900 mb-3' }, t('seo', getLang())),
        React.createElement('div', { className: 'mb-3' },
          React.createElement('label', { className: 'block text-xs text-gray-500 mb-1' }, t('seo title', getLang())),
          React.createElement('input', { value: seoTitle, onChange: (e: React.ChangeEvent<HTMLInputElement>) => setSeoTitle(e.target.value), placeholder: title || t('post title', getLang()), maxLength: 70, className: 'input-field text-xs' }),
          React.createElement('p', { className: 'text-[10px] text-gray-400 mt-1' }, seoTitle.length + '/70')
        ),
        React.createElement('div', { className: 'mb-3' },
          React.createElement('label', { className: 'block text-xs text-gray-500 mb-1' }, t('seo description', getLang())),
          React.createElement('textarea', { value: seoDesc, onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => setSeoDesc(e.target.value), placeholder: excerpt || t('excerpt (optional)', getLang()), maxLength: 160, rows: 3, className: 'input-field text-xs' }),
          React.createElement('p', { className: 'text-[10px] text-gray-400 mt-1' }, seoDesc.length + '/160')
        ),
        // Google-style search preview
        React.createElement('div', { className: 'rounded-lg border border-gray-200 bg-white p-3' },
          React.createElement('p', { className: 'text-sm text-blue-700 hover:underline truncate' }, seoTitle || title || 'Post title'),
          React.createElement('p', { className: 'text-xs text-green-700 truncate' }, window.location.origin + '/post/' + (slug || 'post-slug')),
          React.createElement('p', { className: 'text-xs text-gray-600 line-clamp-2 mt-0.5' }, seoDesc || excerpt || 'Post description appears here...')
        )
      ),
      visualMode && React.createElement('div', { className: 'card p-4' },
        React.createElement('h3', { className: 'text-sm font-semibold text-gray-900 mb-3' }, t('templates', getLang())),
        React.createElement('div', { className: 'flex gap-1 mb-3' },
          React.createElement('input', { value: templateName, onChange: (e: React.ChangeEvent<HTMLInputElement>) => setTemplateName(e.target.value), placeholder: t('template name', getLang()), className: 'input-field flex-1 text-xs', onKeyDown: (e: React.KeyboardEvent) => { if (e.key === 'Enter') saveTemplate(); } }),
          React.createElement('button', { onClick: saveTemplate, disabled: !templateName.trim(), className: 'btn-secondary text-xs flex-shrink-0' }, t('save', getLang()))
        ),
        templates.length > 0 && React.createElement('div', { className: 'max-h-40 overflow-y-auto space-y-1' },
          templates.map((t: any) => React.createElement('button', {
            key: t.id,
            onClick: () => loadTemplate(t),
            className: 'w-full text-left text-xs px-2 py-1.5 rounded hover:bg-gray-50 text-gray-600 hover:text-gray-900 truncate block',
            title: t.name,
          }, t.name))
        )
      ),
      id && React.createElement(RevisionsPanel, { postId: id, onRestore: (post: any) => { setTitle(post.title); setContent(post.content || ''); setExcerpt(post.excerpt || ''); } }),
      sites.length > 0 && React.createElement('div', { className: 'card p-4' },
        React.createElement('h3', { className: 'text-sm font-semibold text-gray-900 mb-3' }, t('site', getLang())),
        React.createElement('select', { value: siteId, onChange: (e: React.ChangeEvent<HTMLSelectElement>) => setSiteId(e.target.value), className: 'input-field' },
          React.createElement('option', { value: '' }, t('global (all sites)', getLang())),
          sites.map((st: any) => React.createElement('option', { key: st.id, value: st.id }, st.name + (st.isPrimary === 1 ? ' (primary)' : '')))
        ),
        React.createElement('p', { className: 'text-[10px] text-gray-400 mt-1' }, t('posts assigned to a site are only visible on that site\u2019s domain', getLang()))
      ),
      React.createElement('div', { className: 'card p-4' },
        React.createElement('h3', { className: 'text-sm font-semibold text-gray-900 mb-3' }, t('format', getLang())),
        React.createElement('select', { value: format, onChange: (e: React.ChangeEvent<HTMLSelectElement>) => setFormat(e.target.value), className: 'input-field' },
          React.createElement('option', { value: 'standard' }, t('standard', getLang())),
          React.createElement('option', { value: 'gallery' }, t('gallery', getLang())),
          React.createElement('option', { value: 'video' }, t('video', getLang())),
          React.createElement('option', { value: 'audio' }, t('audio', getLang())),
          React.createElement('option', { value: 'quote' }, t('quote', getLang())),
          React.createElement('option', { value: 'link' }, t('link', getLang()))
        )
      ),
      React.createElement('div', { className: 'card p-4' },
        React.createElement('h3', { className: 'text-sm font-semibold text-gray-900 mb-3' }, t('author', getLang())),
        React.createElement('select', { value: authorId, onChange: (e: React.ChangeEvent<HTMLSelectElement>) => setAuthorId(e.target.value), className: 'input-field' },
          React.createElement('option', { value: '' }, t('select author', getLang())),
          users.map((u: any) => React.createElement('option', { key: u.id, value: u.id }, u.username))
        )
      ),
      React.createElement('div', { className: 'card p-4' },
        React.createElement('h3', { className: 'text-sm font-semibold text-gray-900 mb-3' }, t('status', getLang())),
        React.createElement('select', { value: status, onChange: (e: React.ChangeEvent<HTMLSelectElement>) => setStatus(e.target.value), className: 'input-field' },
          React.createElement('option', { value: 'draft' }, t('draft', getLang())),
          React.createElement('option', { value: 'published' }, t('published', getLang())),
          React.createElement('option', { value: 'scheduled' }, t('scheduled', getLang())),
          React.createElement('option', { value: 'private' }, t('private', getLang()))
        ),
        React.createElement('div', { className: 'mt-3' },
          React.createElement('label', { className: 'block text-xs text-gray-500 mb-1' }, t('publish date (for scheduled)', getLang())),
          React.createElement('input', { type: 'datetime-local', id: 'scheduled-date', className: 'input-field text-xs' })
        ),
      ),
      React.createElement('div', { className: 'card p-4' },
        React.createElement('h3', { className: 'text-sm font-semibold text-gray-900 mb-3' }, t('categories', getLang())),
        React.createElement('div', { className: 'flex gap-1 mt-2' },
          React.createElement('input', { id: 'quick-cat-name', placeholder: t('new category', getLang()), className: 'input-field flex-1 text-xs', onKeyDown: async (e: React.KeyboardEvent) => { if (e.key === 'Enter') { const name = (document.getElementById('quick-cat-name') as HTMLInputElement).value; if (name) { const r = await api.post('/categories', { name }); setCategories([...categories, r.data]); setCategoryIds([...categoryIds, r.data.id]); (document.getElementById('quick-cat-name') as HTMLInputElement).value = ''; } } } }),
          React.createElement('button', { onClick: async () => { const name = (document.getElementById('quick-cat-name') as HTMLInputElement).value; if (name) { const r = await api.post('/categories', { name }); setCategories([...categories, r.data]); setCategoryIds([...categoryIds, r.data.id]); (document.getElementById('quick-cat-name') as HTMLInputElement).value = ''; } }, className: 'btn-secondary text-xs' }, '+')
        ),
        categories.map(c => React.createElement('label', { key: c.id, className: 'flex items-center gap-2 py-1' },
          React.createElement('input', { type: 'checkbox', checked: categoryIds.includes(c.id), onChange: e => { if (e.target.checked) setCategoryIds([...categoryIds, c.id]); else setCategoryIds(categoryIds.filter(x => x !== c.id)); }, className: 'rounded border-gray-300 text-primary-600' }),
          React.createElement('span', { className: 'text-sm text-gray-700' }, c.name)
        ))
      ),
      React.createElement('div', { className: 'card p-4' },
        React.createElement('h3', { className: 'text-sm font-semibold text-gray-900 mb-3' }, t('custom fields', getLang())),
        metaFields.map((m: any, i: number) => React.createElement('div', { key: i, className: 'flex gap-2 mb-2' },
          React.createElement('input', { value: m.key, onChange: (e: React.ChangeEvent<HTMLInputElement>) => { const n = [...metaFields]; n[i].key = e.target.value; setMetaFields(n); }, placeholder: t('key', getLang()), className: 'input-field w-2/5 text-xs' }),
          React.createElement('input', { value: m.value, onChange: (e: React.ChangeEvent<HTMLInputElement>) => { const n = [...metaFields]; n[i].value = e.target.value; setMetaFields(n); }, placeholder: t('value', getLang()), className: 'input-field flex-1 text-xs' }),
          React.createElement('button', { onClick: () => setMetaFields(metaFields.filter((_,j) => j !== i)), className: 'text-red-500 text-xs' }, '×')
        )),
        React.createElement('button', { onClick: () => setMetaFields([...metaFields, { key: '', value: '' }]), className: 'text-xs text-primary-600 hover:text-primary-700' }, '+ ' + t('add custom field', getLang()))
      ),
      React.createElement('div', { className: 'card p-4' },
        React.createElement('h3', { className: 'text-sm font-semibold text-gray-900 mb-3' }, t('tags', getLang())),
        React.createElement('div', { className: 'flex gap-2 mb-2' },
          React.createElement('input', { value: tagInput, onChange: e => setTagInput(e.target.value), onKeyDown: e => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }, placeholder: t('add tag', getLang()), className: 'input-field flex-1' }),
          React.createElement('button', { onClick: addTag, className: 'btn-secondary' }, t('add', getLang()))
        ),
        React.createElement('div', { className: 'flex flex-wrap gap-1' }, tagNames.map(t => React.createElement('span', { key: t, className: 'flex items-center gap-1 px-2 py-1 bg-primary-50 text-primary-700 text-xs rounded-full' },
          t, React.createElement('button', { onClick: () => setTagNames(tagNames.filter(x => x !== t)), className: 'hover:text-red-600' }, '\u00d7')
        )))
      )
    );
  }

  return React.createElement('div', null,
    React.createElement('div', { className: 'flex items-center justify-between mb-6' },
      React.createElement('div', { className: 'flex items-center gap-3' },
        React.createElement('button', { onClick: () => navigate('/posts'), className: 'p-2 text-gray-400 hover:text-gray-600' }, React.createElement(ArrowLeft, { size: 20 })),
        React.createElement('h2', { className: 'text-2xl font-bold text-gray-900' }, id ? t('edit post', getLang()) : t('new post', getLang()))
      ),
      React.createElement('div', { className: 'flex items-center gap-2 flex-wrap justify-end' },
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
          React.createElement('input', { value: title, onChange: e => setTitle(e.target.value), placeholder: t('post title', getLang()), className: 'input-field text-sm font-semibold pr-16' }),
          React.createElement('span', { className: 'absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-gray-400' }, (content || '').replace(/<[^>]*>/g, '').trim().split(/\s+/).filter(Boolean).length + ' ' + t('words', getLang()))
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
          href: window.location.origin + '/post/' + slug,
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
            React.createElement('div', { className: 'p-4' },
              React.createElement('div', { className: 'card p-4 mb-4' },
                React.createElement('h3', { className: 'text-sm font-semibold text-gray-900 mb-3' }, t('excerpt (optional)', getLang())),
                React.createElement('textarea', { value: excerpt, onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => setExcerpt(e.target.value), placeholder: t('excerpt (optional)', getLang()), className: 'input-field', rows: 3 })
              ),
              renderAiPanel(),
              renderSidebar()
            )
          )
        )
      )
    ),
    // ---- TEXT MODE: original 3-col grid ----
    !visualMode && React.createElement('div', { className: 'grid grid-cols-1 lg:grid-cols-3 gap-6' },
      React.createElement('div', { className: 'lg:col-span-2 space-y-4' },
        React.createElement('div', { className: 'relative' },
          React.createElement('input', { value: title, onChange: e => setTitle(e.target.value), placeholder: t('post title', getLang()), className: 'input-field text-lg font-semibold pr-20' }),
          React.createElement('span', { id: 'post-word-count', className: 'absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400' }, (content || '').replace(/<[^>]*>/g, '').trim().split(/\s+/).filter(Boolean).length + ' ' + t('words', getLang()))
        ),
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
        renderAiPanel(),
        React.createElement(RichEditor, { value: content, onChange: setContent, placeholder: t('write your post content', getLang()) }),
        React.createElement('textarea', { value: excerpt, onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => setExcerpt(e.target.value), placeholder: t('excerpt (optional)', getLang()), className: 'input-field', rows: 3 })
      ),
      renderSidebar()
    )
  );
}
