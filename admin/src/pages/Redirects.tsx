import React, { useEffect, useState } from 'react';
import { ArrowRightLeft, Plus, Trash2, Search, Upload, RefreshCw } from 'lucide-react';
import api from '../lib/api';
import { t, getLang } from '../lib/i18n';
import { useToast } from '../lib/toast';
import { dialog } from '../lib/dialog';
import Select from '../components/Select';

// Old URLs. The list is what an operator reads after a link rots; the automatic
// rows (written when a published slug changes) are marked so they are not
// mistaken for hand-made ones and deleted by accident.
export default function Redirects() {
  const toast = useToast();
  const [rows, setRows] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(true);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [status, setStatus] = useState('301');
  const [busy, setBusy] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [csv, setCsv] = useState('');

  useEffect(() => { load(); }, [page]); // eslint-disable-line react-hooks/exhaustive-deps

  function load() {
    setLoading(true);
    api.get('/redirects?page=' + page + '&limit=30' + (q.trim() ? '&q=' + encodeURIComponent(q.trim()) : ''))
      .then((r) => { setRows(r.data.redirects || []); setTotal(r.data.total || 0); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }

  async function create() {
    if (!from.trim() || !to.trim()) return;
    setBusy(true);
    try {
      await api.post('/redirects', { fromPath: from.trim(), toPath: to.trim(), status: Number(status) });
      setFrom(''); setTo('');
      setPage(1); load();
      toast.toast(t('saved', getLang()));
    } catch (e: any) { toast.toast(e.response?.data?.error || t('save failed', getLang()), 'error'); }
    finally { setBusy(false); }
  }

  async function remove(id: string) {
    if (!(await dialog.confirm(t('delete this redirect?', getLang()), { danger: true }))) return;
    try { await api.delete('/redirects/' + id); load(); }
    catch (e: any) { toast.toast(e.response?.data?.error || t('delete failed', getLang()), 'error'); }
  }

  async function runImport() {
    if (!csv.trim()) return;
    setBusy(true);
    try {
      const r = await api.post('/redirects/import', { csv });
      const d = r.data || {};
      toast.toast(t('imported', getLang()) + ': ' + (d.created || 0) + ' / ' + t('skipped', getLang()) + ' ' + (d.skipped || 0) + (d.errorCount ? ' / ' + t('errors', getLang()) + ' ' + d.errorCount : ''));
      setCsv(''); setImportOpen(false); setPage(1); load();
    } catch (e: any) { toast.toast(e.response?.data?.error || t('import failed', getLang()), 'error'); }
    finally { setBusy(false); }
  }

  const totalPages = Math.max(1, Math.ceil(total / 30));

  return React.createElement('div', null,
    React.createElement('div', { className: 'flex items-center justify-between mb-6 flex-wrap gap-3' },
      React.createElement('h2', { className: 'text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2' },
        React.createElement(ArrowRightLeft, { size: 22, className: 'text-primary-500' }), t('redirects', getLang())),
      React.createElement('div', { className: 'flex items-stretch gap-2' },
        React.createElement('div', { className: 'relative shrink-0' },
          React.createElement(Search, { size: 14, className: 'absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400' }),
          React.createElement('input', {
            value: q, onChange: (e: React.ChangeEvent<HTMLInputElement>) => setQ(e.target.value),
            onKeyDown: (e: React.KeyboardEvent) => { if (e.key === 'Enter') { setPage(1); load(); } },
            placeholder: t('search paths', getLang()), className: 'input-field h-full text-sm w-56', style: { paddingLeft: '2.5rem' },
          })),
        React.createElement('button', { onClick: () => { setPage(1); load(); }, className: 'btn-secondary text-sm h-auto' }, React.createElement(RefreshCw, { size: 14 }), t('refresh', getLang())),
        React.createElement('button', { onClick: () => setImportOpen(!importOpen), className: 'btn-secondary text-sm h-auto' }, React.createElement(Upload, { size: 14 }), t('import csv', getLang())))),

    React.createElement('p', { className: 'text-xs text-gray-500 dark:text-gray-400 mb-4' }, t('redirects hint', getLang())),

    importOpen && React.createElement('div', { className: 'card p-4 mb-4' },
      React.createElement('p', { className: 'text-xs text-gray-500 dark:text-gray-400 mb-2' }, t('csv format hint', getLang())),
      React.createElement('textarea', {
        value: csv, onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => setCsv(e.target.value),
        rows: 6, className: 'input-field font-mono text-xs mb-2', placeholder: '/old-path,/new-path\n/another,https://example.com/x,302\n# 以 # 开头的行为注释',
      }),
      React.createElement('div', { className: 'flex gap-2' },
        React.createElement('button', { onClick: runImport, disabled: busy || !csv.trim(), className: 'btn-primary text-sm disabled:opacity-40' }, t('import csv', getLang())),
        React.createElement('button', { onClick: () => { setImportOpen(false); setCsv(''); }, className: 'btn-secondary text-sm' }, t('cancel', getLang())))),

    React.createElement('div', { className: 'card p-4 mb-4' },
      React.createElement('div', { className: 'grid grid-cols-1 md:grid-cols-12 gap-2' },
        React.createElement('input', { value: from, onChange: (e: React.ChangeEvent<HTMLInputElement>) => setFrom(e.target.value), placeholder: t('from path', getLang()) + ' /old-url', className: 'input-field md:col-span-5 font-mono text-sm' }),
        React.createElement('input', { value: to, onChange: (e: React.ChangeEvent<HTMLInputElement>) => setTo(e.target.value), placeholder: t('to path or url', getLang()) + ' /new-url', className: 'input-field md:col-span-5 font-mono text-sm' }),
        React.createElement(Select, { value: status, onChange: (v: string) => setStatus(v), className: 'input-field md:col-span-2 text-sm' },
          React.createElement('option', { value: '301' }, '301'),
          React.createElement('option', { value: '302' }, '302'))),
      React.createElement('button', { onClick: create, disabled: busy || !from.trim() || !to.trim(), className: 'btn-primary text-sm mt-3 disabled:opacity-40' }, React.createElement(Plus, { size: 14 }), t('add redirect', getLang()))),

    React.createElement('div', { className: 'card overflow-hidden' },
      loading && rows.length === 0
        ? React.createElement('p', { className: 'text-sm text-gray-400 p-8 text-center' }, t('loading', getLang()) + '…')
        : rows.length === 0
          ? React.createElement('p', { className: 'text-sm text-gray-400 p-8 text-center' }, t('no redirects yet', getLang()))
          : React.createElement('table', { className: 'w-full' },
              React.createElement('thead', null, React.createElement('tr', { className: 'border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-left' },
                React.createElement('th', { className: 'px-4 py-3 text-[11px] uppercase text-gray-400 font-medium' }, t('from path', getLang())),
                React.createElement('th', { className: 'px-4 py-3 text-[11px] uppercase text-gray-400 font-medium' }, t('to path or url', getLang())),
                React.createElement('th', { className: 'px-4 py-3 text-[11px] uppercase text-gray-400 font-medium' }, t('status', getLang())),
                React.createElement('th', { className: 'px-4 py-3 text-[11px] uppercase text-gray-400 font-medium' }, t('hits', getLang())),
                React.createElement('th', { className: 'px-4 py-3' }))),
              React.createElement('tbody', null, rows.map((r: any) =>
                React.createElement('tr', { key: r.id, className: 'border-b border-gray-50 dark:border-gray-800' },
                  React.createElement('td', { className: 'px-4 py-2.5 text-xs font-mono text-gray-700 dark:text-gray-200 break-all' }, r.fromPath),
                  React.createElement('td', { className: 'px-4 py-2.5 text-xs font-mono text-gray-500 break-all' }, r.toPath),
                  React.createElement('td', { className: 'px-4 py-2.5 text-xs whitespace-nowrap' },
                    React.createElement('span', { className: 'px-1.5 py-0.5 rounded ' + (r.status === 302 ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300') }, String(r.status)),
                    r.createdBy === 'slug-change' && React.createElement('span', { className: 'ml-2 text-[10px] text-gray-400' }, t('automatic', getLang()))),
                  React.createElement('td', { className: 'px-4 py-2.5 text-xs text-gray-500' }, String(r.hits || 0)),
                  React.createElement('td', { className: 'px-4 py-2.5 text-right' },
                    React.createElement('button', { onClick: () => remove(r.id), className: 'p-1.5 text-gray-400 hover:text-red-600', title: t('delete', getLang()) }, React.createElement(Trash2, { size: 14 }))))))),
      total > 30 && React.createElement('div', { className: 'flex items-center justify-between px-4 py-3 border-t border-gray-100 dark:border-gray-700' },
        React.createElement('span', { className: 'text-xs text-gray-400' }, total + ' ' + t('entries', getLang())),
        React.createElement('div', { className: 'flex items-center gap-2' },
          React.createElement('button', { onClick: () => setPage(Math.max(1, page - 1)), disabled: page <= 1, className: 'btn-secondary text-xs disabled:opacity-40' }, t('previous', getLang())),
          React.createElement('span', { className: 'text-xs text-gray-500' }, page + ' / ' + totalPages),
          React.createElement('button', { onClick: () => setPage(Math.min(totalPages, page + 1)), disabled: page >= totalPages, className: 'btn-secondary text-xs disabled:opacity-40' }, t('next', getLang())))))
  );
}
