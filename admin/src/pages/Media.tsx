import React, { useEffect, useState, useRef } from 'react';
import { Upload, Trash2, Copy, FileText, FileImage, FileAudio, FileVideo, File, Trash, X, Download, Calendar, Hash, Sparkles, ScanSearch } from 'lucide-react';
import EmptyState from '../components/EmptyState';
import api from '../lib/api';
import { useToast } from '../lib/toast';
import { t, getLang } from '../lib/i18n';

function formatSize(bytes: number): string {
  if (!bytes) return '0 B';
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return (bytes / Math.pow(1024, i)).toFixed(1) + ' ' + sizes[i];
}

function getFileIcon(mime: string) {
  if (!mime) return File;
  if (mime.startsWith('image/')) return FileImage;
  if (mime.startsWith('video/')) return FileVideo;
  if (mime.startsWith('audio/')) return FileAudio;
  if (mime.includes('pdf') || mime.includes('document')) return FileText;
  return File;
}

export default function Media() {
  const toast = useToast();
  const [media, setMedia] = useState<any[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<any>(null);
  const [aiAnalyzing, setAiAnalyzing] = useState<string | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<Record<string, string>>({});
  const [genPrompt, setGenPrompt] = useState('');
  const [genOpen, setGenOpen] = useState(false);
  const [genLoading, setGenLoading] = useState(false);
  const [filter, setFilter] = useState('all');
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => { api.get('/media').then(r => setMedia(r.data.media)); }, []);

  async function uploadFile(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files; if (!files || files.length === 0) return;
    setUploading(true);
    let done = 0;
    for (const file of Array.from(files)) {
      const form = new FormData(); form.append('file', file);
      await api.post('/media/upload', form, { onUploadProgress: (p: any) => { if (p.total) setUploadProgress(Math.round((done * 100 + (p.loaded / p.total) * 100) / files.length)); } });
      done++;
    }
    setUploading(false); setUploadProgress(null);
    const r = await api.get('/media'); setMedia(r.data.media);
  }

  async function saveMeta() {
    if (!preview) return;
    try {
      const r = await api.put('/media/' + preview.id, { title: preview.title, alt: preview.alt });
      setPreview(r.data);
      const rr = await api.get('/media'); setMedia(rr.data.media);
    } catch {}
  }

  const filtered = filter === 'all' ? media : media.filter((m: any) =>
    filter === 'image' ? m.mimeType?.startsWith('image/') :
    filter === 'video' ? m.mimeType?.startsWith('video/') :
    filter === 'audio' ? m.mimeType?.startsWith('audio/') : !m.mimeType?.startsWith('image/') && !m.mimeType?.startsWith('video/') && !m.mimeType?.startsWith('audio/'));

  const [bulkTitle, setBulkTitle] = useState('');
  const [bulkAlt, setBulkAlt] = useState('');
  const [dragOver, setDragOver] = useState(false);

  async function bulkEdit() {
    if (selected.size === 0 || (!bulkTitle.trim() && !bulkAlt.trim())) return;
    try {
      await api.post('/media/bulk-edit', { ids: Array.from(selected), title: bulkTitle.trim(), alt: bulkAlt.trim() });
      setBulkTitle(''); setBulkAlt(''); setSelected(new Set());
      const r = await api.get('/media'); setMedia(r.data.media);
      toast.toast(t('bulk edit applied', getLang()));
    } catch (e: any) { toast.toast(e.response?.data?.error || t('bulk edit failed', getLang()), 'error'); }
  }

  async function del(id: string) { if (!confirm(t('delete?', getLang()))) return; await api.delete('/media/' + id); setPreview(null); const r = await api.get('/media'); setMedia(r.data.media); }
  async function bulkDelete() { if (selected.size === 0) return; await api.post('/media/bulk-delete', { ids: Array.from(selected) }); setSelected(new Set()); const r = await api.get('/media'); setMedia(r.data.media); }

  // Paste-to-upload: paste an image from the clipboard
  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      const files = Array.from(e.clipboardData?.files || []).filter(f => f.type.startsWith('image/'));
      if (files.length > 0) { e.preventDefault(); uploadPasted(files); }
    };
    document.addEventListener('paste', onPaste);
    return () => document.removeEventListener('paste', onPaste);
  }, []);

  async function uploadPasted(files: File[]) {
    setUploading(true);
    let done = 0;
    for (const file of files) {
      const form = new FormData(); form.append('file', file);
      try { await api.post('/media/upload', form); } catch {}
      done++;
    }
    setUploading(false);
    const r = await api.get('/media'); setMedia(r.data.media);
  }
  function toggleSelect(id: string) { const n = new Set(selected); n.has(id) ? n.delete(id) : n.add(id); setSelected(n); }
  function selectAll() { if (selected.size === media.length) setSelected(new Set()); else setSelected(new Set(media.map((m: any) => m.id))); }

  function openPreview(m: any) { setPreview(m); }

  async function analyzeImage(m: any) {
    if (aiAnalyzing) return;
    setAiAnalyzing(m.id);
    try {
      const r = await api.post('/ai/vision', { url: m.url, question: '请描述这张图片的内容、风格和适用场景' });
      setAiAnalysis({ ...aiAnalysis, [m.id]: r.data.analysis || r.data.error || '分析失败' });
    } catch (e: any) { setAiAnalysis({ ...aiAnalysis, [m.id]: e.response?.data?.error || '分析失败' }); }
    finally { setAiAnalyzing(null); }
  }

  async function generateImage() {
    if (!genPrompt.trim() || genLoading) return;
    setGenLoading(true);
    try {
      const r = await api.post('/ai/image-gen', { prompt: genPrompt });
      if (r.data.url) {
        setGenPrompt('');
        const rr = await api.get('/media'); setMedia(rr.data.media);
      } else alert(r.data.error || '生成失败');
    } catch (e: any) { alert(e.response?.data?.error || '生成失败'); }
    finally { setGenLoading(false); }
  }
  function closePreview() { setPreview(null); }

  // Keyboard: ESC to close preview
  useEffect(() => {
    if (!preview) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') closePreview(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [preview]);

  return React.createElement('div', {
      onDragOver: (e: React.DragEvent) => { e.preventDefault(); setDragOver(true); },
      onDragLeave: () => setDragOver(false),
      onDrop: (e: React.DragEvent) => { e.preventDefault(); setDragOver(false); if (e.dataTransfer.files.length > 0) uploadPasted(Array.from(e.dataTransfer.files)); },
    },
    dragOver && React.createElement('div', { className: 'fixed inset-0 z-50 bg-primary-600/20 border-4 border-dashed border-primary-500 rounded-2xl pointer-events-none flex items-center justify-center' },
      React.createElement('p', { className: 'text-2xl font-bold text-primary-700 bg-white/80 px-8 py-4 rounded-2xl' }, t('drop to upload', getLang()))
    ),
    React.createElement('div', { className: 'flex items-center justify-between mb-6' },
      React.createElement('h2', { className: 'text-2xl font-bold text-gray-900' }, t('media library', getLang())),
      React.createElement('div', { className: 'flex items-center gap-3' },
        React.createElement('input', { type: 'text', placeholder: t('search media', getLang()), onChange: (e: React.ChangeEvent<HTMLInputElement>) => { api.get('/media?search=' + encodeURIComponent(e.target.value)).then(r => setMedia(r.data.media)); }, className: 'input-field w-48 text-sm' }),
        React.createElement('button', { onClick: () => fileRef.current?.click(), disabled: uploading, className: 'btn-primary' }, React.createElement(Upload, { size: 16 }), uploading ? t('uploading', getLang()) : t('upload', getLang())),
        React.createElement('button', { onClick: () => setGenOpen(!genOpen), className: 'btn-secondary' }, React.createElement(Sparkles, { size: 16 }), t('ai generate image', getLang())),
        selected.size > 0 && React.createElement('button', { onClick: bulkDelete, className: 'btn-danger text-xs' }, React.createElement(Trash, { size: 14 }), t('delete selected', getLang()) + ' (' + selected.size + ')')),
      React.createElement('input', { ref: fileRef, type: 'file', multiple: true, onChange: uploadFile, className: 'hidden', accept: 'image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,audio/mpeg,audio/wav,video/mp4,application/zip' })
    ),
    // Type filter tabs (WordPress media filter bar)
    React.createElement('div', { className: 'flex items-center gap-1 mb-3 flex-wrap' },
      ['all', 'image', 'video', 'audio', 'document'].map(ft => React.createElement('button', {
        key: ft,
        onClick: () => setFilter(ft),
        className: 'px-3 py-1.5 text-xs rounded-lg border ' + (filter === ft ? 'border-primary-400 bg-primary-50 text-primary-700 font-medium' : 'border-gray-200 text-gray-500 hover:text-gray-700'),
      }, t('filter ' + ft, getLang()))),
      React.createElement('div', { className: 'flex-1' }),
      React.createElement('button', { onClick: selectAll, className: 'btn-secondary text-xs' }, selected.size === media.length ? t('deselect all', getLang()) : t('select all', getLang()))
    ),
    selected.size > 0 && React.createElement('div', { className: 'card p-3 mb-3 flex flex-wrap items-center gap-2' },
      React.createElement('span', { className: 'text-xs font-medium text-gray-600' }, t('bulk edit', getLang()) + ' (' + selected.size + ')'),
      React.createElement('input', { value: bulkTitle, onChange: (e: React.ChangeEvent<HTMLInputElement>) => setBulkTitle(e.target.value), placeholder: t('set title', getLang()), className: 'input-field w-44 text-sm' }),
      React.createElement('input', { value: bulkAlt, onChange: (e: React.ChangeEvent<HTMLInputElement>) => setBulkAlt(e.target.value), placeholder: t('set alt text', getLang()), className: 'input-field w-44 text-sm' }),
      React.createElement('button', { onClick: bulkEdit, disabled: !bulkTitle.trim() && !bulkAlt.trim(), className: 'btn-primary text-xs disabled:opacity-40' }, t('apply', getLang())),
      React.createElement('button', { onClick: () => { setSelected(new Set()); setBulkTitle(''); setBulkAlt(''); }, className: 'btn-secondary text-xs' }, t('cancel', getLang()))
    ),
    uploadProgress !== null && React.createElement('div', { className: 'mb-3' },
      React.createElement('div', { className: 'h-1.5 bg-gray-100 rounded-full overflow-hidden' },
        React.createElement('div', { className: 'h-full bg-primary-500 transition-all', style: { width: uploadProgress + '%' } })),
      React.createElement('p', { className: 'text-xs text-gray-400 mt-1' }, t('uploading', getLang()) + ' ' + uploadProgress + '%')
    ),
    genOpen && React.createElement('div', { className: 'card p-3 mb-4 flex gap-2' },
      React.createElement('input', { value: genPrompt, onChange: (e: React.ChangeEvent<HTMLInputElement>) => setGenPrompt(e.target.value), onKeyDown: (e: React.KeyboardEvent) => { if (e.key === 'Enter') generateImage(); }, placeholder: t('image gen prompt', getLang()), className: 'input-field flex-1 text-sm' }),
      React.createElement('button', { onClick: generateImage, disabled: genLoading || !genPrompt.trim(), className: 'btn-primary text-sm' }, React.createElement(Sparkles, { size: 14 }), genLoading ? t('generating', getLang()) + '...' : t('generate', getLang()))),
    media.length === 0 ? React.createElement(EmptyState, {
        icon: FileImage,
        title: t('no media uploaded yet', getLang()),
        description: t('upload images, documents, audio and video to use in your content', getLang()),
        action: React.createElement('button', { onClick: () => fileRef.current?.click(), className: 'btn-primary text-sm' }, React.createElement(Upload, { size: 15 }), t('upload', getLang())),
      })
    : filtered.length === 0 ? React.createElement('div', { className: 'text-center py-16 text-gray-400 text-sm' }, t('no files match this filter', getLang()))
    : React.createElement('div', { className: 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4' },
        filtered.map((m: any) => React.createElement('div', { key: m.id, className: 'card overflow-hidden group relative cursor-pointer', onClick: () => openPreview(m) },
          React.createElement('input', { type: 'checkbox', checked: selected.has(m.id), onChange: (e: React.ChangeEvent<HTMLInputElement>) => { e.stopPropagation(); toggleSelect(m.id); }, className: 'absolute top-2 left-2 z-10 w-4 h-4 rounded border-gray-300 text-primary-600 opacity-0 group-hover:opacity-100 ' + (selected.has(m.id) ? 'opacity-100' : '') }),
          React.createElement('div', { className: 'aspect-square bg-gray-100 flex items-center justify-center' },
            m.mimeType?.startsWith('image/') ? React.createElement('img', { src: (m.thumbnail || m.url), alt: m.alt || m.original, className: 'w-full h-full object-cover' })
            : React.createElement(getFileIcon(m.mimeType), { size: 40, className: 'text-gray-400' })),
          m.mimeType?.startsWith('image/') && React.createElement('button', {
            onClick: (e: React.MouseEvent) => { e.stopPropagation(); analyzeImage(m); },
            disabled: aiAnalyzing === m.id,
            className: 'absolute top-2 right-2 z-10 p-1.5 rounded-lg bg-white/90 backdrop-blur text-gray-500 hover:text-primary-600 shadow opacity-0 group-hover:opacity-100 transition-opacity',
            title: t('ai analyze image', getLang()),
          }, React.createElement(ScanSearch, { size: 14 })),
          aiAnalysis[m.id] && React.createElement('div', { className: 'p-2 text-[10px] text-gray-500 bg-purple-50 dark:bg-purple-500/10 max-h-16 overflow-y-auto', onClick: (e: React.MouseEvent) => e.stopPropagation() }, aiAnalysis[m.id]),
          React.createElement('div', { className: 'p-2' },
            React.createElement('p', { className: 'text-xs text-gray-600 truncate' }, m.original),
            React.createElement('p', { className: 'text-xs text-gray-400' }, formatSize(m.size)),
            React.createElement('div', { className: 'flex items-center gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity' },
              React.createElement('button', { onClick: (e: React.MouseEvent) => { e.stopPropagation(); navigator.clipboard.writeText(m.url); }, className: 'p-1 text-gray-400 hover:text-primary-600' }, React.createElement(Copy, { size: 14 })),
              React.createElement('button', { onClick: (e: React.MouseEvent) => { e.stopPropagation(); del(m.id); }, className: 'p-1 text-gray-400 hover:text-red-600' }, React.createElement(Trash2, { size: 14 }))
            )
          )
        ))
      ),

    // ---- Preview modal ----
    preview && React.createElement('div', { className: 'fixed inset-0 z-50 flex items-center justify-center bg-black/60', onClick: closePreview },
      React.createElement('div', { className: 'bg-white rounded-lg shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto', onClick: (e: React.MouseEvent) => e.stopPropagation() },
        // Header
        React.createElement('div', { className: 'flex items-center justify-between p-4 border-b border-gray-200' },
          React.createElement('h3', { className: 'text-lg font-semibold text-gray-900 truncate' }, preview.original),
          React.createElement('button', { onClick: closePreview, className: 'p-1 text-gray-400 hover:text-gray-600 rounded' }, React.createElement(X, { size: 20 }))
        ),
        // Preview area
        React.createElement('div', { className: 'bg-gray-100 flex items-center justify-center p-4', style: { minHeight: '200px', maxHeight: '400px' } },
          preview.mimeType?.startsWith('image/') ? React.createElement('img', { src: preview.url, alt: preview.alt || preview.original, className: 'max-w-full max-h-80 object-contain rounded' })
          : preview.mimeType?.startsWith('video/') ? React.createElement('video', { src: preview.url, controls: true, className: 'max-w-full max-h-80 rounded' })
          : preview.mimeType?.startsWith('audio/') ? React.createElement('audio', { src: preview.url, controls: true, className: 'w-full' })
          : React.createElement('div', { className: 'text-center' },
              React.createElement(getFileIcon(preview.mimeType), { size: 64, className: 'text-gray-400 mx-auto mb-2' }),
              React.createElement('p', { className: 'text-sm text-gray-500' }, preview.mimeType || t('unknown type', getLang())))
        ),
        // Details
        React.createElement('div', { className: 'p-4 space-y-3' },
          // URL with copy
          React.createElement('div', { className: 'flex items-center gap-2' },
            React.createElement('input', { type: 'text', value: preview.url, readOnly: true, className: 'input-field text-xs flex-1', onFocus: (e: React.FocusEvent<HTMLInputElement>) => e.target.select() }),
            React.createElement('button', { onClick: () => navigator.clipboard.writeText(preview.url), className: 'btn-secondary text-xs' }, React.createElement(Copy, { size: 14 }), t('copy', getLang())),
            React.createElement('a', { href: preview.url, target: '_blank', rel: 'noopener', className: 'btn-secondary text-xs', download: preview.original }, React.createElement(Download, { size: 14 }))
          ),
          // Metadata grid
          React.createElement('div', { className: 'grid grid-cols-2 gap-3 text-sm' },
            React.createElement('div', null,
              React.createElement('p', { className: 'text-xs text-gray-400' }, t('filename', getLang())),
              React.createElement('p', { className: 'text-gray-700 truncate' }, preview.filename)),
            React.createElement('div', null,
              React.createElement('p', { className: 'text-xs text-gray-400' }, t('type', getLang())),
              React.createElement('p', { className: 'text-gray-700' }, preview.mimeType || '-')),
            React.createElement('div', null,
              React.createElement('p', { className: 'text-xs text-gray-400 flex items-center gap-1' }, React.createElement(Hash, { size: 12 }), t('size', getLang())),
              React.createElement('p', { className: 'text-gray-700' }, formatSize(preview.size))),
            preview.width && preview.height ? React.createElement('div', null,
              React.createElement('p', { className: 'text-xs text-gray-400' }, t('dimensions', getLang())),
              React.createElement('p', { className: 'text-gray-700' }, preview.width + ' x ' + preview.height + 'px')) : null,
            React.createElement('div', null,
              React.createElement('p', { className: 'text-xs text-gray-400 flex items-center gap-1' }, React.createElement(Calendar, { size: 12 }), t('uploaded', getLang())),
              React.createElement('p', { className: 'text-gray-700' }, new Date(preview.createdAt).toLocaleDateString())),
            preview.username && React.createElement('div', null,
              React.createElement('p', { className: 'text-xs text-gray-400' }, t('uploaded by', getLang())),
              React.createElement('p', { className: 'text-gray-700' }, preview.username))
          ),
          // Editable title / alt text (WordPress attachment edit)
          React.createElement('div', null,
            React.createElement('p', { className: 'text-xs text-gray-400' }, t('title', getLang())),
            React.createElement('input', { type: 'text', value: preview.title || '', onChange: (e: React.ChangeEvent<HTMLInputElement>) => setPreview({ ...preview, title: e.target.value }), className: 'input-field text-sm mt-1' })),
          React.createElement('div', null,
            React.createElement('p', { className: 'text-xs text-gray-400' }, t('alt text', getLang())),
            React.createElement('input', { type: 'text', value: preview.alt || '', onChange: (e: React.ChangeEvent<HTMLInputElement>) => setPreview({ ...preview, alt: e.target.value }), className: 'input-field text-sm mt-1' })),
          React.createElement('button', { onClick: saveMeta, className: 'btn-secondary text-xs w-full' }, React.createElement(Copy, { size: 14 }), t('save changes', getLang())),
          // Actions
          React.createElement('div', { className: 'flex gap-2 pt-3 border-t border-gray-100' },
            React.createElement('a', { href: preview.url, target: '_blank', rel: 'noopener', className: 'btn-secondary text-xs' }, t('view full size', getLang())),
            React.createElement('button', { onClick: () => del(preview.id), className: 'btn-danger text-xs' }, React.createElement(Trash2, { size: 14 }), t('delete permanently', getLang())),
            React.createElement('button', { onClick: () => { navigator.clipboard.writeText(preview.url); }, className: 'btn-secondary text-xs' }, React.createElement(Copy, { size: 14 }), t('copy url', getLang()))
          )
        )
      )
    )
  );
}
