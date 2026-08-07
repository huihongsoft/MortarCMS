import React, { useEffect, useState, useRef } from 'react';
import { Upload, Trash2, Copy, FileText, FileImage, FileAudio, FileVideo, File, Trash } from 'lucide-react';
import api from '../lib/api';
import { t, getLang } from '../lib/i18n';

function formatSize(bytes: number): string {
  if (!bytes) return '0 B';
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return (bytes / Math.pow(1024, i)).toFixed(1) + ' ' + sizes[i];
}
export default function Media() {

  function getFileIcon(mime: string) {
    if (!mime) return File;
    if (mime.startsWith('image/')) return FileImage;
    if (mime.startsWith('video/')) return FileVideo;
    if (mime.startsWith('audio/')) return FileAudio;
    if (mime.includes('pdf') || mime.includes('document')) return FileText;
    return File;
  }

  const [media, setMedia] = useState<any[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  useEffect(() => { api.get('/media').then(r => setMedia(r.data.media)); }, []);

  async function uploadFile(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files; if (!files || files.length === 0) return;
    setUploading(true);
    let done = 0;
    for (const file of Array.from(files)) {
      const form = new FormData(); form.append('file', file);
      await api.post('/media/upload', form);
      done++;
    }
    setUploading(false);
    const r = await api.get('/media'); setMedia(r.data.media);
  }

  async function del(id: string) { if (!confirm(t('delete?', getLang()))) return; await api.delete('/media/' + id); const r = await api.get('/media'); setMedia(r.data.media); }
  async function bulkDelete() { if (selected.size === 0) return; await api.post('/media/bulk-delete', { ids: Array.from(selected) }); setSelected(new Set()); const r = await api.get('/media'); setMedia(r.data.media); }
  function toggleSelect(id: string) { const n = new Set(selected); n.has(id) ? n.delete(id) : n.add(id); setSelected(n); }
  function selectAll() { if (selected.size === media.length) setSelected(new Set()); else setSelected(new Set(media.map((m: any) => m.id))); }

  return React.createElement('div', null,
    React.createElement('div', { className: 'flex items-center justify-between mb-6' },
      React.createElement('h2', { className: 'text-2xl font-bold text-gray-900' }, t('media library', getLang())),
      React.createElement('div', { className: 'flex items-center gap-3' }, React.createElement('input', { type: 'text', placeholder: t('search media', getLang()), onChange: (e: React.ChangeEvent<HTMLInputElement>) => { api.get('/media?search=' + encodeURIComponent(e.target.value)).then(r => setMedia(r.data.media)); }, className: 'input-field w-48 text-sm' }), React.createElement('button', { onClick: () => fileRef.current?.click(), disabled: uploading, className: 'btn-primary' }, React.createElement(Upload, { size: 16 }), uploading ? t('uploading', getLang()) : t('upload', getLang())), selected.size > 0 && React.createElement('button', { onClick: bulkDelete, className: 'btn-danger text-xs' }, React.createElement(Trash, { size: 14 }), t('delete selected', getLang()) + ' (' + selected.size + ')')),
      React.createElement('input', { ref: fileRef, type: 'file', onChange: uploadFile, className: 'hidden', accept: 'image/*' })
    ),
    React.createElement('div', { className: 'mb-3' }, React.createElement('button', { onClick: selectAll, className: 'btn-secondary text-xs' }, selected.size === media.length ? t('deselect all', getLang()) : t('select all', getLang()))),
    media.length === 0 ? React.createElement('p', { className: 'text-gray-500' }, t('no media uploaded yet', getLang()))
    : React.createElement('div', { className: 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4' },
        media.map((m: any) => React.createElement('div', { key: m.id, className: 'card overflow-hidden group relative' }, React.createElement('input', { type: 'checkbox', checked: selected.has(m.id), onChange: () => toggleSelect(m.id), className: 'absolute top-2 left-2 z-10 w-4 h-4 rounded border-gray-300 text-primary-600 opacity-0 group-hover:opacity-100 ' + (selected.has(m.id) ? 'opacity-100' : '') }),
          React.createElement('div', { className: 'aspect-square bg-gray-100 flex items-center justify-center' },
            m.mimeType?.startsWith('image/') ? React.createElement('img', { src: (m.thumbnail || m.url), alt: m.alt || m.original, className: 'w-full h-full object-cover' })
            : React.createElement(getFileIcon(m.mimeType), { size: 32, className: 'text-gray-400' })
          ),
          React.createElement('div', { className: 'p-2' },
            React.createElement('p', { className: 'text-xs text-gray-600 truncate' }, m.original),
            React.createElement('p', { className: 'text-xs text-gray-400' }, formatSize(m.size)),
            m.alt && React.createElement('p', { className: 'text-xs text-gray-400 truncate', title: m.alt }, t('alt', getLang()) + ': ' + (m.alt || '').substring(0, 30)),
            React.createElement('div', { className: 'flex items-center gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity' },
              React.createElement('button', { onClick: () => { navigator.clipboard.writeText(m.url); }, className: 'p-1 text-gray-400 hover:text-primary-600' }, React.createElement(Copy, { size: 14 })),
              React.createElement('button', { onClick: () => del(m.id), className: 'p-1 text-gray-400 hover:text-red-600' }, React.createElement(Trash2, { size: 14 }))
            )
          )
        ))
      )
  );
}
