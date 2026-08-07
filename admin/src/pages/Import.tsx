import React, { useRef, useState } from 'react';
import { Upload, FileUp, CheckCircle2 } from 'lucide-react';
import { useToast } from '../lib/toast';
import api from '../lib/api';
import { t, getLang } from '../lib/i18n';

export default function Import() {
  const [dragging, setDragging] = useState(false);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const toast = useToast();

  async function handleFile(file: File | undefined) {
    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.xml')) { toast.toast(t('please select a .xml (wordpress wxr) file', getLang()), 'error'); return; }
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

  return React.createElement('div', null,
    React.createElement('h2', { className: 'text-2xl font-bold text-gray-900 mb-2' }, t('import', getLang())),
    React.createElement('p', { className: 'text-sm text-gray-500 mb-6' }, t('import content from a wordpress wxr export file (posts, pages, categories, tags and comments).', getLang())),
    React.createElement('div', {
      onClick: () => fileRef.current?.click(),
      onDragOver: (e: React.DragEvent) => { e.preventDefault(); setDragging(true); },
      onDragLeave: () => setDragging(false),
      onDrop: (e: React.DragEvent) => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files?.[0]); },
      className: `border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-colors ${dragging ? 'border-primary-500 bg-primary-50' : 'border-gray-300 hover:border-gray-400'}`,
    },
      importing
        ? React.createElement(React.Fragment, null,
            React.createElement(Upload, { size: 40, className: 'mx-auto mb-3 text-primary-500 animate-pulse' }),
            React.createElement('p', { className: 'text-sm text-gray-600' }, t('importing...', getLang())))
        : React.createElement(React.Fragment, null,
            React.createElement(FileUp, { size: 40, className: 'mx-auto mb-3 text-gray-400' }),
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
    )
  );
}

function statItem(label: string, value: number) {
  return React.createElement('div', { className: 'bg-gray-50 rounded-lg p-3 text-center' },
    React.createElement('p', { className: 'text-xl font-bold text-gray-900' }, value),
    React.createElement('p', { className: 'text-xs text-gray-500' }, label)
  );
}
