import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, ArrowLeft, Palette, FileText, Sparkles, PanelRightClose, Languages } from 'lucide-react';
import DOMPurify from 'dompurify';
import { useToast } from '../lib/toast';
import RichEditor from '../components/RichEditor';
import VisualEditor from '../components/VisualEditor';
import RevisionsPanel from '../components/RevisionsPanel';
import api from '../lib/api';
import { t, getLang, serverMessage } from '../lib/i18n';
import Select from '../components/Select';
import { useUnsavedGuard } from '../lib/useUnsavedGuard';
import { postPath, permalinkPrefix, usePermalinkPrefix } from '../lib/permalink';

export default function PostEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [slug, setSlug] = useState('');
  // Post URLs depend on this setting; the permalink previews below must not
  // advertise a different path than the site actually serves.
  const permalink = usePermalinkPrefix();
  const [title, setTitle] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [content, setContent] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [status, setStatus] = useState('draft');
  const [categoryIds, setCategoryIds] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [tagNames, setTagNames] = useState<string[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const toast = useToast();
  const [metaFields, setMetaFields] = useState<{key:string,value:string}[]>([]);
  // The content type drives which custom fields exist. Seeded from the query so
  // a brand-new entry of a custom type asks for the right definitions straight
  // away; an existing post overwrites it with its own type once loaded.
  const [postType, setPostType] = useState(() => new URLSearchParams(window.location.search).get('type') || 'post');
  const [fieldDefs, setFieldDefs] = useState<any[]>([]);
  // Structured tag/category suggestions (the 'tags' AI action), applied as-is.
  const [aiSuggestions, setAiSuggestions] = useState<{ tags: string[]; categories: string[] } | null>(null);
  const [format, setFormat] = useState('standard');
  const [authorId, setAuthorId] = useState('');
  const [users, setUsers] = useState<any[]>([]);
  const [visualMode, setVisualMode] = useState(false);
  const [saveState, setSaveState] = useState<'saved' | 'saving' | 'dirty'>('saved');
  const [lastSavedAt, setLastSavedAt] = useState('');
  // Baseline snapshot for autosave dirty-detection (title/content/excerpt)
  const snapshotRef = useRef('');
  // Custom-field keys this post was loaded with. A save only SENDS the fields
  // still present, and the API only touches keys it is sent — so a field the
  // user deleted has to be reported explicitly, or it would silently survive.
  const loadedMetaKeysRef = useRef<string[]>([]);

  // Autosave (WordPress-style): 30s after the last keystroke, silently save
  // drafts that have changed. Published/scheduled posts are never autosaved —
  // a background save must not touch the live state. saveRef always points at
  // the latest handleSave so the interval never saves with stale state (e.g.
  // an edited SEO title would otherwise be overwritten by the old one).
  const saveRef = useRef(handleSave);
  useEffect(() => { saveRef.current = handleSave; });
  useEffect(() => {
    snapshotRef.current = title + '\u0000' + content + '\u0000' + excerpt;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);
  useEffect(() => {
    const t = setInterval(() => {
      const cur = title + '\u0000' + content + '\u0000' + excerpt;
      if (cur === snapshotRef.current || savingRef.current) return;
      const canAutosave = !id || status === 'draft' || status === 'pending';
      if (!canAutosave) return;
      saveRef.current('draft', true, true);
    }, 30000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, content, excerpt, id, status]);
  const [visualCss, setVisualCss] = useState('');
  const [aiOpen, setAiOpen] = useState(false);
  const [aiStyle, setAiStyle] = useState('formal');
  const [aiLang, setAiLang] = useState('简体中文');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState('');
  const [aiError, setAiError] = useState('');
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDesc, setSeoDesc] = useState('');
  const [seoNoindex, setSeoNoindex] = useState(false);
  const [seoCanonical, setSeoCanonical] = useState('');
  const [seoOgImage, setSeoOgImage] = useState('');
  // Reported as article:section. The schema has no "primary category", so the
  // editor names one explicitly; empty falls back to the first assigned.
  const [seoPrimaryCategory, setSeoPrimaryCategory] = useState('');
  const [templates, setTemplates] = useState<any[]>([]);
  const [templateName, setTemplateName] = useState('');
  const [saving, setSaving] = useState(false);
  // savingRef mirrors the saving flag so the autosave interval never races an
  // in-flight publish (the interval closure's saving would be stale)
  const savingRef = useRef(false);
  useEffect(() => { savingRef.current = saving; }, [saving]);
  const [featured, setFeatured] = useState('');
  const [mediaItems, setMediaItems] = useState<any[]>([]);
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [siteId, setSiteId] = useState('');
  const [sites, setSites] = useState<any[]>([]);
  const [allowComments, setAllowComments] = useState(true);
  const [password, setPassword] = useState('');
  // Members-only: a PostMeta flag that hides the post from anonymous visitors.
  // The post-expiry plugin sets it automatically; this is the manual switch, and
  // the only way to put such a post back in front of everyone.
  const [membersOnly, setMembersOnly] = useState(false);
  // Content language. '' is the site's default language — the one served without
  // a URL prefix, and what every post written before this feature says.
  const [lang, setLang] = useState('');
  const [langs, setLangs] = useState<string[]>([]);
  const [defaultContentLang, setDefaultContentLang] = useState('zh');
  // The other languages this content exists in ({ id, lang, title, status }).
  const [translations, setTranslations] = useState<any[]>([]);
  const [translating, setTranslating] = useState(false);
  // Publish date shown in the visual sidebar (datetime-local value, '' = immediately)
  const [publishDate, setPublishDate] = useState('');
  // Tracks the id of a newly-created post so draft saves (which stay in the
  // editor) reuse the same post instead of creating duplicates
  const createdIdRef = useRef<string | null>(null);
  // Content type to create as (custom post types live in the same list/editor).
  const createType = new URLSearchParams(window.location.search).get('type') || '';

  // Closing the tab or following an admin link with unsaved edits asks first.
  useUnsavedGuard(saveState === 'dirty');

  // Keyboard shortcut: Ctrl+S to save draft. Route through saveRef so the
  // handler always sees the latest state (a deps-array closure would go stale
  // and overwrite newer edits — e.g. SEO fields — with old values).
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        saveRef.current('draft');
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // New posts default to the site currently being browsed (multi-site only);
  // the editor still offers "global (all sites)" explicitly.
  useEffect(() => {
    if (id || sites.length <= 1) return;
    api.get('/sites/current').then(r => { if (r.data?.id) setSiteId(r.data.id); }).catch(() => {});
  }, [id, sites.length]);
  useEffect(() => { api.get('/sites').then(r => setSites(r.data?.sites || r.data || [])).catch(() => {}); api.get('/users').then(r => setUsers(r.data)).catch(() => {});
    // Which languages this site publishes content in (the default first).
    api.get('/settings').then(r => {
      const def = String(r.data?.site_lang || 'zh').trim().toLowerCase() || 'zh';
      const list = String(r.data?.content_langs || '').split(/[,\s]+/).map(s => s.trim().toLowerCase()).filter(Boolean);
      setDefaultContentLang(def);
      setLangs([def, ...list.filter((l: string) => l !== def)]);
    }).catch(() => {});
    api.get('/categories').then(r => setCategories(r.data)); api.get('/media').then(r => setMediaItems(r.data.media || []));
    api.get('/editor/templates').then(r => setTemplates(r.data.templates || [])).catch(() => {});
    if (id) { api.get(`/posts/${id}/translations`).then(r => setTranslations(r.data?.translations || [])).catch(() => {});
      api.get(`/posts/admin?limit=100`).then(r => { const p = r.data.posts.find((x: any) => x.id === id); if (p) { setSlug(p.slug); setLang(p.lang || ''); setTitle(p.title); setContent(p.content); setExcerpt(p.excerpt); setStatus(p.status); setCategoryIds(p.categories?.map((c: any) => c.categoryId || c.category?.id) || []); setTagNames(p.tags?.map((t: any) => t.name || t.tag?.name) || []); if (p.featured) setFeatured(p.featured); if (p.allowComments !== undefined) setAllowComments(p.allowComments); if (p.password) setPassword(p.password); if (p.siteId) setSiteId(p.siteId); if (p.authorId) setAuthorId(p.authorId); if (p.publishedAt) { const d = new Date(p.publishedAt); const pad = (n: number) => String(n).padStart(2, '0'); setPublishDate(`${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`); } if (p.meta?._visual_css) setVisualCss(p.meta._visual_css); if (p.meta?._seo_title) setSeoTitle(p.meta._seo_title); if (p.meta?._seo_desc) setSeoDesc(p.meta._seo_desc); if (p.meta?._seo_noindex) setSeoNoindex(p.meta._seo_noindex === '1'); if (p.meta?._seo_canonical) setSeoCanonical(p.meta._seo_canonical); if (p.meta?._seo_og_image) setSeoOgImage(p.meta._seo_og_image); if (p.meta?._seo_primary_category) setSeoPrimaryCategory(p.meta._seo_primary_category); setMembersOnly(p.meta?._members_only === '1');
      // Custom fields: user-defined keys only. Every `_`-prefixed key is the
      // application's own (`_seo_*`/`_visual_css` have panels; `_members_only`
      // and plugin keys are managed server-side) — loading one here would put it
      // in the save payload, and the API refuses to write that namespace.
      if (p.meta) {
        const fields = Object.entries(p.meta).filter(([k]) => !k.startsWith('_') && k.trim()).map(([key, value]) => ({ key, value: String(value) }));
        setMetaFields(fields);
        loadedMetaKeysRef.current = fields.map(f => f.key);
      }
      // Baseline the autosave snapshot AFTER the async load, otherwise the
      // initial empty state looks "changed" and triggers a spurious save
      snapshotRef.current = p.title + '\u0000' + (p.content || '') + '\u0000' + (p.excerpt || '');
      if (p.type) setPostType(p.type);
    } }); } }, [id]);

  // The typed fields this type defines. Values are not a second source of truth:
  // they live in the same metaFields list the free-form rows below use.
  useEffect(() => {
    api.get('/field-groups/for/' + encodeURIComponent(postType))
      .then(r => setFieldDefs(r.data.fields || []))
      .catch(() => setFieldDefs([]));
  }, [postType]);

  // metaFields is the single list that gets saved; the panel writes into it by
  // key, creating the entry on first edit.
  function setMetaValue(key: string, value: string) {
    const exists = metaFields.some(m => m.key === key);
    setMetaFields(exists ? metaFields.map(m => m.key === key ? { ...m, value } : m) : [...metaFields, { key, value }]);
    setSaveState('dirty');
  }

  // stay=false (publish): navigate to the post list; stay=true (draft from the
  // builder): keep editing in place, like WordPress. silent=true skips the
  // toast (used by autosave so background saves never interrupt the user).
  async function handleSave(s: string, stay = false, silent = false) {
    // The visual editor's header saves without going through the buttons above
    // (which are disabled on !title), and the API requires a title: without this
    // the request came back as a raw validation error. A silent (background) save
    // just returns.
    if (!title.trim()) { if (!silent) toast.toast(t('please enter a title first', getLang()), 'error'); return; }
    setSaving(true);
    setSaveState('saving');
    try {
      const schedDate = publishDate || (document.getElementById('scheduled-date') as HTMLInputElement)?.value || null;
      // "Save draft" always drafts; "Publish" uses the user-selected status
      // (published / private / scheduled...), falling back to published.
      // A publish date only applies when actually publishing (drafts never
      // carry one); an empty date means "publish now" like WordPress.
      // pending is a review state (managed via the review endpoint): editing
      // a pending post and hitting Publish means "approve" — publish it.
      // Autosave must never change the workflow state: a post awaiting review
      // (pending) that is autosaved stays pending instead of silently dropping
      // back to draft and leaving the review queue.
      const finalStatus = silent
        ? (status || 'draft')
        : (s === 'draft' ? 'draft' : (status === 'draft' || status === 'pending' ? 'published' : status));
      const payload: any = { title, slug: slug || undefined, content, excerpt, status: finalStatus, categoryIds, tagNames, featured: featured || undefined, format: format || 'standard', publishedAt: finalStatus !== 'draft' && schedDate ? new Date(schedDate).toISOString() : undefined, authorId: authorId || undefined, siteId: siteId || null, allowComments, password, lang };
      // The list can open this editor for a custom post type (?type=<slug>); the
      // type is only sent on create — an existing entry keeps its type.
      if (!id && !createdIdRef.current && createType) payload.type = createType;
      payload.meta = { _visual_css: visualCss, _seo_title: seoTitle, _seo_desc: seoDesc, _seo_noindex: seoNoindex ? '1' : '', _seo_canonical: seoCanonical, _seo_og_image: seoOgImage, _seo_primary_category: seoPrimaryCategory };
      // Custom fields (user-defined key/value pairs) ride along in meta
      for (const mf of metaFields) { if (mf.key.trim()) payload.meta[mf.key.trim()] = mf.value; }
      // The members-only flag is a meta key like the SEO fields, and an empty
      // string clears it (the API refuses the `_` namespace otherwise).
      payload.meta._members_only = membersOnly ? '1' : '';
      // A key the post was loaded with and the user has since removed: send it
      // empty so the API deletes that row (it only touches the keys it is sent).
      for (const key of loadedMetaKeysRef.current) { if (!(key in payload.meta)) payload.meta[key] = ''; }
      const postId = id || createdIdRef.current;
      if (postId) await api.put(`/posts/${postId}`, payload);
      else {
        const r = await api.post('/posts', payload);
        if (r.data?.id) createdIdRef.current = r.data.id;
      }
      setSaveState('saved');
      setLastSavedAt(new Date().toLocaleTimeString());
      // Sync the status so autosave stops for published/scheduled posts and
      // the interval can never race a publish back into draft
      if (status !== finalStatus) setStatus(finalStatus);
      // Refresh the baseline so autosave never re-saves the same state
      snapshotRef.current = title + '\u0000' + content + '\u0000' + excerpt;
      if (!silent) toast.toast(postId ? t('post updated', getLang()) : t('post created', getLang()));
      if (!stay) navigate('/posts');
    } catch (e: any) {
      setSaveState('dirty');
      // Background autosave failures stay quiet (the dirty indicator shows it);
      // only user-initiated saves raise a toast.
      if (!silent) toast.toast(describeSaveError(e, getLang()), 'error');
    } finally { setSaving(false); }
  }

  function addTag() { if (tagInput.trim() && !tagNames.includes(tagInput.trim())) { setTagNames([...tagNames, tagInput.trim()]); setTagInput(''); } }

  // Create (or jump to) the translation of this post in `target`. The server
  // copies the content and categories into a draft so the translator starts from
  // the source rather than from an empty editor.
  async function translateInto(target: string) {
    if (!id || translating) return;
    setTranslating(true);
    try {
      const r = await api.post('/posts/' + id + '/translate', { lang: target });
      toast.toast(t('translation created', getLang()).replace('{lang}', target));
      if (r.data?.id) navigate('/posts/' + r.data.id + '/edit');
    } catch (e: any) {
      toast.toast(serverMessage(e, t('translation failed', getLang())), 'error');
    } finally { setTranslating(false); }
  }

  // ---- AI assistant for the editor ----
  async function runAi(action: string) {
    if (aiLoading) return;
    // Preconditions per action — a silent disabled button looks broken, so
    // clicking without the required input shows a clear hint instead
    const needsTitle = ['generate', 'seo', 'tags', 'topics'].includes(action);
    const needsContent = ['polish', 'continue', 'translate', 'summarize'].includes(action);
    if (needsTitle && !title.trim()) { setAiResult(''); setAiError(t('please enter a title first', getLang())); return; }
    if (needsContent && !content.trim()) { setAiResult(''); setAiError(t('please enter content first', getLang())); return; }
    setAiLoading(true); setAiError(''); setAiResult(''); setAiSuggestions(null);
    try {
      // Tag suggestions come from a structured endpoint: it sees the site's
      // existing vocabulary (so it reuses tags people actually browse instead of
      // inventing synonyms) and returns categories too. Everything else is the
      // free-text generate call.
      if (action === 'tags') {
        const r = await api.post('/ai/suggest-terms', { title, content, excerpt });
        const tags: string[] = r.data?.tags || [];
        const cats: string[] = r.data?.categories || [];
        if (!tags.length && !cats.length) { setAiError(t('ai returned no result', getLang())); return; }
        setAiSuggestions({ tags, categories: cats });
        setAiResult([...cats.map(c => '📁 ' + c), ...tags.map(x => '🏷 ' + x)].join('\n'));
        return;
      }
      const r = await api.post('/ai/generate', { action, title, content, excerpt, style: aiStyle, language: aiLang });
      const out = r.data.content || '';
      if (!out.trim()) setAiError(t('ai returned no result', getLang()));
      else setAiResult(out);
    } catch (e: any) {
      // Clear any stale result so the error can never be paired with an
      // outdated output the user might accidentally apply
      setAiResult('');
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
    // Strip a leading label in either language ("摘要：" / "Summary:")
    const clean = aiResult.replace(/^(摘要|Summary)\s*[:：]\s*/i, '').trim();
    if (clean) { setExcerpt(clean); setSaveState('dirty'); }
  }

  const AI_ACTIONS = [
    { key: 'generate', label: t('ai generate', getLang()), icon: '✍️' },
    { key: 'polish', label: t('ai polish', getLang()), icon: '✨' },
    { key: 'continue', label: t('ai continue', getLang()), icon: '➡️' },
    { key: 'translate', label: t('ai translate', getLang()), icon: '🌐' },
    { key: 'summarize', label: t('ai summarize', getLang()), icon: '📝' },
    { key: 'tags', label: t('ai suggest tags', getLang()), icon: '🏷️' },
    { key: 'topics', label: t('ai topics', getLang()), icon: '💡' },
    { key: 'seo', label: t('ai seo', getLang()), icon: '🔍' },
  ];

  function applyTags() {
    // Structured suggestions when we have them: no guessing at the model's prose,
    // and a suggested category is matched against the real list before it is set.
    if (aiSuggestions) {
      if (aiSuggestions.tags.length) setTagNames([...new Set([...tagNames, ...aiSuggestions.tags])]);
      const ids = aiSuggestions.categories
        .map(name => categories.find((c: any) => c.name === name)?.id)
        .filter(Boolean) as string[];
      if (ids.length) setCategoryIds([...new Set([...categoryIds, ...ids])]);
      setSaveState('dirty');
      return;
    }
    // Strip a leading label ("推荐标签：" / "Tags:") and list markers
    const tags = aiResult.replace(/^(推荐标签|Tags?)\s*[:：]\s*/i, '').split(/[,，、\n]/).map((x: string) => x.trim().replace(/^\d+[.、)]\s*/, '')).filter(Boolean);
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
          React.createElement(Select, { value: aiStyle, onChange: (v: string) => setAiStyle(v), className: 'input-field w-28 text-xs' },
            [['formal', 'formal'], ['casual', 'casual'], ['marketing', 'marketing'], ['concise', 'concise']].map(([v, l]) => React.createElement('option', { key: v, value: v }, t(l, getLang())))),
          React.createElement(Select, { value: aiLang, onChange: (v: string) => setAiLang(v), className: 'input-field w-28 text-xs' },
            ['简体中文', 'English', '日本語', '한국어', 'Français', 'Deutsch', 'Español'].map(l => React.createElement('option', { key: l, value: l }, l))),
          AI_ACTIONS.map(a => React.createElement('button', {
            key: a.key,
            onClick: () => runAi(a.key),
            disabled: aiLoading,
            className: 'flex items-center gap-1 px-2.5 py-1.5 text-xs rounded-lg border border-gray-200 text-gray-600 hover:border-primary-400 hover:text-primary-600 disabled:opacity-40 transition-colors',
          }, React.createElement('span', null, a.icon), a.label))
        ),
        aiLoading && React.createElement('p', { className: 'text-xs text-gray-400 mb-2' }, t('ai working', getLang()) + '...'),
        aiError && React.createElement('p', { className: 'text-xs text-red-600 mb-2' }, aiError),
        aiResult && React.createElement('div', null,
          React.createElement('div', { className: 'max-h-48 overflow-y-auto bg-gray-50 rounded-lg p-3 text-xs text-gray-700 prose prose-sm max-w-none' },
            // AI output is sanitized before rendering: model output can be
            // influenced by prompt injection embedded in user content
            React.createElement('div', { dangerouslySetInnerHTML: { __html: DOMPurify.sanitize(aiResult, { USE_PROFILES: { html: true } }) } })),
          React.createElement('div', { className: 'flex flex-wrap gap-1.5 mt-2' },
            /^SEO/.test(aiResult) ? React.createElement('button', { onClick: applySeoResult, className: 'btn-primary text-xs' }, t('apply seo', getLang()))
            : /^(摘要|Summary)\s*[:：]/i.test(aiResult) && aiResult.length < 400 ? React.createElement('button', { onClick: applySummary, className: 'btn-primary text-xs' }, t('apply as excerpt', getLang()))
            : aiSuggestions ? React.createElement('button', { onClick: applyTags, className: 'btn-primary text-xs' }, t('apply tags', getLang()))
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
    // The server answers in Chinese; serverMessage() maps the known ones to
    // English so an operator on the English UI is not shown raw Chinese.
    return String(msg ? serverMessage(msg, lang) : t('save failed', lang)) + ' (' + status + ')';
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
      // Excerpt (matches the visual editor sidebar)
      React.createElement('div', { className: 'card p-4' },
        React.createElement('h3', { className: 'text-sm font-semibold text-gray-900 mb-3' }, t('excerpt', getLang())),
        React.createElement('textarea', { value: excerpt, onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => setExcerpt(e.target.value), placeholder: t('write a short excerpt', getLang()), className: 'input-field', rows: 3 })
      ),
      // Permalink (matches the visual editor sidebar)
      React.createElement('div', { className: 'card p-4' },
        React.createElement('h3', { className: 'text-sm font-semibold text-gray-900 mb-3' }, t('permalink', getLang())),
        // Editable: this was a read-only preview while the editor still sent the
        // value in its payload — the API dropped it, so the field looked like it
        // existed and did nothing.
        React.createElement('input', {
          value: slug, onChange: (e: React.ChangeEvent<HTMLInputElement>) => setSlug(e.target.value),
          placeholder: t('post slug', getLang()), className: 'input-field text-sm mb-2 font-mono',
          spellCheck: false, 'aria-label': t('post slug', getLang()),
        }),
        React.createElement('p', { className: 'text-xs text-gray-500 break-all' }, postPath(permalink, slug || t('untitled', getLang()), true, lang)),
        React.createElement('p', { className: 'text-[11px] text-gray-400 mt-1' }, t('slug change hint', getLang())),
        slug && React.createElement('button', { onClick: () => window.open(postPath(permalink, slug, true, lang), '_blank'), className: 'text-xs text-primary-600 hover:text-primary-700 mt-1' }, t('view post', getLang()))
      ),
      // Language + translations. Only shown once the site publishes more than one
      // language, so a single-language install's editor is untouched.
      langs.length > 1 && React.createElement('div', { className: 'card p-4' },
        React.createElement('h3', { className: 'text-sm font-semibold text-gray-900 mb-3 flex items-center gap-1.5' }, React.createElement(Languages, { size: 14 }), t('language', getLang())),
        React.createElement(Select, { value: lang, onChange: (v: string) => setLang(v), className: 'input-field' },
          langs.map(l => React.createElement('option', { key: l, value: l === defaultContentLang ? '' : l }, l === defaultContentLang ? t('default', getLang()) + ' (' + l + ')' : l))),
        React.createElement('p', { className: 'text-[11px] text-gray-400 mt-1' }, t('content language hint', getLang())),
        // The translation group: who else this article exists as. Empty until a
        // translation is created.
        translations.length > 1 && React.createElement('div', { className: 'mt-3 pt-3 border-t border-gray-100' },
          React.createElement('p', { className: 'text-xs text-gray-500 mb-1.5' }, t('translations', getLang())),
          React.createElement('ul', { className: 'space-y-1' }, translations.map(tr => React.createElement('li', { key: tr.id, className: 'flex items-center justify-between gap-2 text-xs' },
            React.createElement('span', { className: 'text-gray-600' }, (tr.lang || defaultContentLang) + ' · ' + (tr.title || t('untitled', getLang())) + (tr.status !== 'published' ? ' (' + tr.status + ')' : '')),
            tr.id === id
              ? React.createElement('span', { className: 'text-gray-400' }, t('current', getLang()))
              : React.createElement('button', { onClick: () => navigate('/posts/' + tr.id + '/edit'), className: 'text-primary-600 hover:text-primary-700' }, t('edit', getLang())))))
        ),
        // Creating one is only meaningful once the post exists (the translation
        // points back at its source).
        id && langs.filter(l => l !== defaultContentLang && !translations.some(tr => (tr.lang || '') === l)).map(l =>
          React.createElement('button', {
            key: l, disabled: translating, onClick: () => translateInto(l),
            className: 'mt-3 w-full text-xs btn-secondary justify-center disabled:opacity-50',
          }, translating ? t('creating', getLang()) + '…' : t('translate into', getLang()) + ' ' + l))
      ),
      // Discussion (matches the visual editor sidebar)
      React.createElement('div', { className: 'card p-4' },
        React.createElement('h3', { className: 'text-sm font-semibold text-gray-900 mb-3' }, t('discussion', getLang())),
        React.createElement('label', { className: 'flex items-center gap-2 cursor-pointer' },
          React.createElement('input', { type: 'checkbox', checked: allowComments, onChange: (e: React.ChangeEvent<HTMLInputElement>) => setAllowComments(e.target.checked), className: 'rounded border-gray-300 text-primary-600' }),
          React.createElement('span', { className: 'text-sm text-gray-600' }, t('allow comments', getLang()))
        ),
        // Visibility: hidden from anonymous visitors, still reachable when a
        // reader is signed in. Set automatically by the post-expiry plugin, so
        // without this switch there was no way to take such a post back public.
        React.createElement('label', { className: 'flex items-center gap-2 cursor-pointer mt-3' },
          React.createElement('input', { type: 'checkbox', checked: membersOnly, onChange: (e: React.ChangeEvent<HTMLInputElement>) => setMembersOnly(e.target.checked), className: 'rounded border-gray-300 text-primary-600' }),
          React.createElement('span', { className: 'text-sm text-gray-600' }, t('members only', getLang()))
        ),
        React.createElement('p', { className: 'text-[11px] text-gray-400 mt-1' }, t('members only hint', getLang()))
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
        React.createElement('label', { className: 'flex items-center gap-2 cursor-pointer mb-3' },
          React.createElement('input', { type: 'checkbox', checked: seoNoindex, onChange: (e: React.ChangeEvent<HTMLInputElement>) => setSeoNoindex(e.target.checked), className: 'rounded border-gray-300 text-primary-600' }),
          React.createElement('span', { className: 'text-xs text-gray-600' }, t('noindex (hide from search engines)', getLang()))
        ),
        React.createElement('div', { className: 'mb-3' },
          React.createElement('label', { className: 'block text-xs text-gray-500 mb-1' }, t('canonical url (optional)', getLang())),
          React.createElement('input', { value: seoCanonical, onChange: (e: React.ChangeEvent<HTMLInputElement>) => setSeoCanonical(e.target.value), placeholder: postPath(permalink, slug || 'post-slug', true), className: 'input-field text-xs' })
        ),
        React.createElement('div', { className: 'mb-3' },
          React.createElement('label', { className: 'block text-xs text-gray-500 mb-1' }, t('og image url (optional)', getLang())),
          React.createElement('input', { value: seoOgImage, onChange: (e: React.ChangeEvent<HTMLInputElement>) => setSeoOgImage(e.target.value), placeholder: featured || 'https://.../image.jpg', className: 'input-field text-xs' })
        ),
        React.createElement('div', { className: 'mb-3' },
          React.createElement('label', { className: 'block text-xs text-gray-500 mb-1' }, t('primary category (article section)', getLang())),
          // Only the post's own categories are offered: picking one outside them
          // would be meaningless for article:section.
          React.createElement('select', { value: seoPrimaryCategory, onChange: (e: React.ChangeEvent<HTMLSelectElement>) => setSeoPrimaryCategory(e.target.value), className: 'input-field text-xs' },
            React.createElement('option', { value: '' }, t('first assigned category', getLang())),
            categories.filter((c: any) => categoryIds.includes(c.id)).map((c: any) =>
              React.createElement('option', { key: c.id, value: c.id }, c.name))
          )
        ),
        // Google-style search preview
        React.createElement('div', { className: 'rounded-lg border border-gray-200 bg-white p-3' },
          React.createElement('p', { className: 'text-sm text-blue-700 hover:underline truncate' }, seoTitle || title || 'Post title'),
          React.createElement('p', { className: 'text-xs text-green-700 truncate' }, postPath(permalink, slug || 'post-slug', true)),
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
        React.createElement(Select, { value: siteId, onChange: (v: string) => setSiteId(v), className: 'input-field' },
          React.createElement('option', { value: '' }, t('global (all sites)', getLang())),
          sites.map((st: any) => React.createElement('option', { key: st.id, value: st.id }, st.name + (st.isPrimary === 1 ? ' (primary)' : '')))
        ),
        React.createElement('p', { className: 'text-[10px] text-gray-400 mt-1' }, t('posts assigned to a site are only visible on that site\u2019s domain', getLang()))
      ),
      React.createElement('div', { className: 'card p-4' },
        React.createElement('h3', { className: 'text-sm font-semibold text-gray-900 mb-3' }, t('format', getLang())),
        React.createElement(Select, { value: format, onChange: (v: string) => setFormat(v), className: 'input-field' },
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
        React.createElement(Select, { value: authorId, onChange: (v: string) => setAuthorId(v), className: 'input-field' },
          React.createElement('option', { value: '' }, t('select author', getLang())),
          users.map((u: any) => React.createElement('option', { key: u.id, value: u.id }, u.username))
        )
      ),
      React.createElement('div', { className: 'card p-4' },
        React.createElement('h3', { className: 'text-sm font-semibold text-gray-900 mb-3' }, t('status', getLang())),
        React.createElement(Select, { value: status, onChange: (v: string) => setStatus(v), className: 'input-field' },
          React.createElement('option', { value: 'draft' }, t('draft', getLang())),
          React.createElement('option', { value: 'published' }, t('published', getLang())),
          React.createElement('option', { value: 'scheduled' }, t('scheduled', getLang())),
          React.createElement('option', { value: 'private' }, t('private', getLang())),
          status === 'pending' && React.createElement('option', { value: 'pending' }, t('pending', getLang()))
        ),
        React.createElement('div', { className: 'mt-3' },
          React.createElement('label', { className: 'block text-xs text-gray-500 mb-1' }, t('publish date (for scheduled)', getLang())),
          React.createElement('input', { type: 'datetime-local', id: 'scheduled-date', className: 'input-field text-xs' })
        ),
        React.createElement('div', { className: 'mt-3' },
          React.createElement('label', { className: 'block text-xs text-gray-500 mb-1' }, t('password protected', getLang())),
          React.createElement('input', { type: 'password', value: password, onChange: e => setPassword(e.target.value), placeholder: t('password protect this page', getLang()), autoComplete: 'new-password', className: 'input-field text-xs' })
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
      // Typed fields first: these come from the field groups defined for this
      // content type, so what the author fills in is checked by the server.
      fieldDefs.length > 0 && React.createElement('div', { className: 'card p-4' },
        React.createElement('h3', { className: 'text-sm font-semibold text-gray-900 mb-3' }, t('custom fields', getLang())),
        fieldDefs.map((f: any) => {
          const value = metaFields.find(m => m.key === f.key)?.value || '';
          const set = (v: string) => setMetaValue(f.key, v);
          const common = { className: 'input-field text-sm' };
          let input;
          if (f.type === 'boolean') {
            input = React.createElement('label', { className: 'flex items-center gap-2 text-sm text-gray-600' },
              React.createElement('input', { type: 'checkbox', checked: value === '1', onChange: (e: React.ChangeEvent<HTMLInputElement>) => set(e.target.checked ? '1' : '') }),
              f.label);
          } else if (f.type === 'select') {
            input = React.createElement('select', { value, onChange: (e: React.ChangeEvent<HTMLSelectElement>) => set(e.target.value), ...common },
              React.createElement('option', { value: '' }, ''),
              (f.options || []).map((o: string) => React.createElement('option', { key: o, value: o }, o)));
          } else if (f.type === 'textarea' || f.type === 'richtext') {
            input = React.createElement('textarea', { value, onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => set(e.target.value), rows: f.type === 'richtext' ? 6 : 3, ...common });
          } else if (f.type === 'number') {
            input = React.createElement('input', { type: 'number', value, onChange: (e: React.ChangeEvent<HTMLInputElement>) => set(e.target.value), ...common });
          } else if (f.type === 'date') {
            // Stored as an ISO string; the native picker works in yyyy-mm-dd.
            input = React.createElement('input', { type: 'date', value: value ? value.slice(0, 10) : '', onChange: (e: React.ChangeEvent<HTMLInputElement>) => set(e.target.value), ...common });
          } else {
            input = React.createElement('input', { value, onChange: (e: React.ChangeEvent<HTMLInputElement>) => set(e.target.value), placeholder: f.type === 'media' ? '/uploads/...' : '', ...common });
          }
          return React.createElement('div', { key: f.key, className: 'mb-3' },
            f.type !== 'boolean' && React.createElement('label', { className: 'block text-xs text-gray-500 mb-1' }, f.label + (f.required ? ' *' : '')),
            input,
            f.hint && React.createElement('p', { className: 'text-[11px] text-gray-400 mt-1' }, f.hint));
        })
      ),
      React.createElement('div', { className: 'card p-4' },
        React.createElement('h3', { className: 'text-sm font-semibold text-gray-900 mb-3' }, t('custom fields', getLang())),
        // Defined fields are edited in the panel above; showing them here as
        // raw rows too would mean two controls writing the same key.
        metaFields.map((m: any, i: number) => !fieldDefs.some((f: any) => f.key === m.key) && React.createElement('div', { key: i, className: 'flex gap-2 mb-2' },
          // The `_` namespace belongs to the application and the API refuses to
          // write it, so a leading underscore is stripped here rather than
          // letting the save fail with a 400.
          React.createElement('input', { value: m.key, onChange: (e: React.ChangeEvent<HTMLInputElement>) => { const n = [...metaFields]; n[i].key = e.target.value.replace(/^_+/, ''); setMetaFields(n); }, placeholder: t('key', getLang()), className: 'input-field w-2/5 text-xs' }),
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
        React.createElement('button', { onClick: () => navigate('/posts'), className: 'p-2 text-gray-400 hover:text-gray-600', 'aria-label': t('back', getLang())}, React.createElement(ArrowLeft, { size: 20 })),
        React.createElement('h2', { className: 'text-2xl font-bold text-gray-900' }, id ? t('edit post', getLang()) : t('new post', getLang()))
      ),
      React.createElement('div', { className: 'flex items-center gap-2 flex-wrap justify-end' },
        lastSavedAt && React.createElement('span', { className: 'text-xs text-gray-400' }, t('saved at', getLang()) + ' ' + lastSavedAt),
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
          mode: 'post',
          pageSettings: {
            status,
            onStatusChange: (v: string) => { setStatus(v); setSaveState('dirty'); },
            slug,
            permalinkPrefix: permalinkPrefix(permalink),
            showPreview: async () => {
              const postId = id || createdIdRef.current;
              // A published post has a real public URL. Anything else (draft,
              // pending, scheduled) does not — ask the server for a signed link
              // that shows this one post to whoever opens it.
              if (postId && status !== 'published') {
                try {
                  const r = await api.get('/posts/' + postId + '/preview-link');
                  if (r.data?.url) window.open(r.data.url, '_blank');
                } catch {
                  toast.toast(t('preview link failed', getLang()), 'error');
                }
                return;
              }
              if (slug) window.open(postPath(permalink, slug, true), '_blank');
              else toast.toast(t('save first then preview', getLang()), 'error');
            },
            featuredImage: featured || undefined,
            onFeaturedImageChange: (url: string) => { setFeatured(url); setSaveState('dirty'); },
            showMediaPicker: () => setShowMediaPicker(true),
            excerpt,
            onExcerptChange: (v: string) => { setExcerpt(v); setSaveState('dirty'); },
            allowComments,
            onAllowCommentsChange: (v: boolean) => { setAllowComments(v); setSaveState('dirty'); },
            password,
            onPasswordChange: (v: string) => { setPassword(v); setSaveState('dirty'); },
            // ---- Post mode: WordPress-style post settings ----
            postTitle: title,
            onPostTitleChange: (v: string) => { setTitle(v); setSaveState('dirty'); },
            categories,
            categoryIds,
            onCategoryIdsChange: (ids: string[]) => { setCategoryIds(ids); setSaveState('dirty'); },
            onAddCategory: async (name: string) => { const r = await api.post('/categories', { name }); setCategories([...categories, r.data]); return r.data; },
            tags: tagNames,
            onTagsChange: (tags: string[]) => { setTagNames(tags); setSaveState('dirty'); },
            users,
            authorId,
            onAuthorIdChange: (uid: string) => { setAuthorId(uid); setSaveState('dirty'); },
            publishDate,
            // A future date schedules the post (WordPress behavior); clearing
            // the date un-schedules so the post can't stay stuck as "scheduled"
            onPublishDateChange: (v: string) => {
              setPublishDate(v); setSaveState('dirty');
              if (v && new Date(v).getTime() > Date.now()) setStatus('scheduled');
              else if (!v && status === 'scheduled') setStatus('draft');
            },
            // ---- Extended panels (same info as the rich-text sidebar) ----
            seoTitle, seoDesc, seoNoindex, seoCanonical, seoOgImage, seoPrimaryCategory,
            onSeoChange: (patch: any) => {
              if (patch.seoTitle !== undefined) setSeoTitle(patch.seoTitle);
              if (patch.seoDesc !== undefined) setSeoDesc(patch.seoDesc);
              if (patch.seoNoindex !== undefined) setSeoNoindex(patch.seoNoindex);
              if (patch.seoCanonical !== undefined) setSeoCanonical(patch.seoCanonical);
              if (patch.seoOgImage !== undefined) setSeoOgImage(patch.seoOgImage);
              if (patch.seoPrimaryCategory !== undefined) setSeoPrimaryCategory(patch.seoPrimaryCategory);
              setSaveState('dirty');
            },
            sites, siteId,
            onSiteIdChange: (v: string) => { setSiteId(v); setSaveState('dirty'); },
            format,
            onFormatChange: (v: string) => { setFormat(v); setSaveState('dirty'); },
            metaFields,
            onMetaFieldsChange: (fields: { key: string; value: string }[]) => { setMetaFields(fields); setSaveState('dirty'); },
            postId: id || createdIdRef.current || undefined,
            onRestoreRevision: (post: any) => { setTitle(post.title); setContent(post.content || ''); setExcerpt(post.excerpt || ''); setSaveState('dirty'); },
          },
        }),
      ),
      // Bottom spacer the height of the admin status bar (~42px), which stays
      // visible above this full-screen overlay — the editor area ends here so
      // canvas content can scroll fully into view without being covered.
      React.createElement('div', { className: 'shrink-0 bg-white dark:bg-gray-800 h-[42px]', 'aria-hidden': 'true' }),
    ),
    // ---- TEXT MODE: original 3-col grid ----
    !visualMode && React.createElement('div', { className: 'grid grid-cols-1 ' + (sidebarOpen ? 'lg:grid-cols-3' : '') + ' gap-6' },
      React.createElement('div', { className: (sidebarOpen ? 'lg:col-span-2 ' : '') + 'space-y-4' },
        React.createElement('div', { className: 'relative' },
          React.createElement('input', { value: title, onChange: e => { setTitle(e.target.value); setSaveState('dirty'); }, placeholder: t('post title', getLang()), className: 'input-field text-lg font-semibold pr-20' }),
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
          React.createElement('button', {
            onClick: () => setSidebarOpen(!sidebarOpen),
            title: sidebarOpen ? t('collapse sidebar', getLang()) : t('expand sidebar', getLang()),
            className: 'ml-auto flex items-center gap-1.5 px-3 py-2 text-sm border-b-2 border-transparent text-gray-500 hover:text-gray-700 transition-colors',
          }, React.createElement(PanelRightClose, { size: 14 }), t('post settings', getLang())),
        ),
        renderAiPanel(),
        React.createElement(RichEditor, { value: content, onChange: (html: string) => { setContent(html); setSaveState('dirty'); }, placeholder: t('write your post content', getLang()) })
      ),
      sidebarOpen && renderSidebar()
    )
  );
}
