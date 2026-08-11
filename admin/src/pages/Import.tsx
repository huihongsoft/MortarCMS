import React, { useRef, useState } from 'react';
import { Upload, FileUp, CheckCircle2, FileText } from 'lucide-react';
import { useToast } from '../lib/toast';
import api from '../lib/api';
import { t, getLang } from '../lib/i18n';

export default function Import() {
  const [dragging, setDragging] = useState(false);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [mdResult, setMdResult] = useState<any>(null);
  const [mdStatus, setMdStatus] = useState('draft');
  const fileRef = useRef<HTMLInputElement>(null);
  const mdRef = useRef<HTMLInputElement>(null);
  const toast = useToast();

  async function handleFile(file: File | undefined) {
    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.xml')) { toast.toast(t('please select a .xml (wxr) file', getLang()), 'error'); return; }
    const form = new FormData();
    form.append('file', file);
    setImporting(true);
    setResult(null);
    try {
      const r = await api.post('/import/wxr', form, { headers: { 'Content-Type': 'multipart/form-data' } });
      setResult(r.data.stats);
      toast.toast(t('import complete', getLang()));
    } catch (e: any) {
      toast.toast(e.response?.data?.error || t('import failed', getLang()), 'error');
    } finally { setImporting(false); }
  }

  async function handleMarkdown(files: FileList | null) {
    if (!files || files.length === 0) return;
    const form = new FormData();
    Array.from(files).forEach(f => form.append('files', f));
    form.append('status', mdStatus);
    setImporting(true);
    setMdResult(null);
    try {
      const r = await api.post('/import/markdown', form, { headers: { 'Content-Type': 'multipart/form-data' } });
      setMdResult(r.data);
      toast.toast(t('markdown import complete', getLang()) + ': ' + r.data.imported);
    } catch (e: any) {
      toast.toast(e.response?.data?.error || t('import failed', getLang()), 'error');
    } finally { setImporting(false); }
  }

  return React.createElement('div', null,
    React.createElement('h2', { className: 'text-2xl font-bold text-gray-900 mb-2' }, t('import', getLang())),
    React.createElement('p', { className: 'text-sm text-gray-500 mb-6' }, t('import content from a wxr export file (posts, pages, categories, tags and comments) or markdown files.', getLang())),
    // WXR import
    React.createElement('h3', { className: 'text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wider' }, t('wxr xml import', getLang())),
    React.createElement('div', {
      onClick: () => fileRef.current?.click(),
      onDragOver: (e: React.DragEvent) => { e.preventDefault(); setDragging(true); },
      onDragLeave: () => setDragging(false),
      onDrop: (e: React.DragEvent) => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files?.[0]); },
      className: `border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors mb-8 ${dragging ? 'border-primary-500 bg-primary-50' : 'border-gray-300 hover:border-gray-400'}`,
    },
      importing
        ? React.createElement(React.Fragment, null,
            React.createElement(Upload, { size: 36, className: 'mx-auto mb-3 text-primary-500 animate-pulse' }),
            React.createElement('p', { className: 'text-sm text-gray-600' }, t('importing...', getLang())))
        : React.createElement(React.Fragment, null,
            React.createElement(FileUp, { size: 36, className: 'mx-auto mb-3 text-gray-400' }),
            React.createElement('p', { className: 'text-sm font-medium text-gray-700 mb-1' }, t('drop your wxr xml file here', getLang())),
            React.createElement('p', { className: 'text-xs text-gray-400' }, t('or click to browse (max 50 mb)', getLang()))
          )
    ),
    React.createElement('input', { ref: fileRef, type: 'file', accept: '.xml', className: 'hidden', onChange: (e: React.ChangeEvent<HTMLInputElement>) => handleFile(e.target.files?.[0]) }),
    result && React.createElement('div', { className: 'mt-6 card p-5' },
      React.createElement('div', { className: 'flex items-center gap-2 mb-3' },
        React.createElement(CheckCircle2, { size: 18, className: 'text-green-500' }),
        React.createElement('h3', { className: 'font-semibold text-gray-900' }, t('import summary', getLang()))
      ),
      React.createElement('div', { className: 'grid grid-cols-2 md:grid-cols-4 gap-3 text-sm' },
        statItem(t('posts', getLang()), result.posts),
        statItem(t('pages', getLang()), result.pages),
        statItem(t('categories', getLang()), result.categories),
        statItem(t('tags', getLang()), result.tags),
        statItem(t('comments', getLang()), result.comments),
        statItem(t('attachments', getLang()), result.attachments),
        statItem(t('skipped', getLang()), result.skipped),
      )
    ),
    // Markdown import
    React.createElement('h3', { className: 'text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wider' }, t('markdown import', getLang())),
    React.createElement('div', { className: 'card p-5' },
      React.createElement('p', { className: 'text-sm text-gray-500 mb-3' }, t('import .md files with optional frontmatter (title, date, tags, categories, slug).', getLang())),
      React.createElement('div', { className: 'flex items-center gap-3 flex-wrap' },
        React.createElement('button', { onClick: () => mdRef.current?.click(), disabled: importing, className: 'btn-secondary text-sm' }, React.createElement(FileText, { size: 14 }), t('choose markdown files', getLang())),
        React.createElement('select', { value: mdStatus, onChange: (e: React.ChangeEvent<HTMLSelectElement>) => setMdStatus(e.target.value), className: 'input-field w-32 text-sm' },
          React.createElement('option', { value: 'draft' }, t('draft', getLang())),
          React.createElement('option', { value: 'published' }, t('published', getLang())))
      ),
      React.createElement('input', { ref: mdRef, type: 'file', accept: '.md,.markdown', multiple: true, className: 'hidden', onChange: (e: React.ChangeEvent<HTMLInputElement>) => handleMarkdown(e.target.files) }),
      mdResult && React.createElement('div', { className: 'mt-4 text-sm' },
        React.createElement('p', { className: 'text-green-600 flex items-center gap-1.5' }, React.createElement(CheckCircle2, { size: 15 }), t('markdown import complete', getLang()) + ': ' + mdResult.imported + (mdResult.errors ? ' · ' + mdResult.errors + ' ' + t('errors', getLang()) : '')),
        mdResult.items && React.createElement('div', { className: 'mt-2 max-h-32 overflow-y-auto space-y-1' },
          mdResult.items.map((it: any, i: number) =>
            React.createElement('div', { key: i, className: 'text-xs text-gray-500' },
              it.title + ' (' + t(it.status, getLang()) + ')')
          ))
      )
    )
  );
}

function statItem(label: string, value: number) {
  return React.createElement('div', { className: 'bg-gray-50 rounded-lg p-3 text-center' },
    React.createElement('p', { className: 'text-xl font-bold text-gray-900' }, value),
    React.createElement('p', { className: 'text-xs text-gray-500' }, label)
  );
}
