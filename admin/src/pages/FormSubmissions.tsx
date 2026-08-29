import React, { useEffect, useState } from 'react';
import { ArrowLeft, Download, CheckCheck, Trash2, AlertTriangle } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { downloadFile } from '../lib/api';
import { useToast } from '../lib/toast';
import { t, getLang } from '../lib/i18n';

interface Submission { id: string; data: Record<string, string>; ip: string; spam: number; status: string; createdAt: string }
interface FieldDef { name: string; label: string }

export default function FormSubmissions() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [formName, setFormName] = useState('');
  const [fields, setFields] = useState<FieldDef[]>([]);
  const [subs, setSubs] = useState<Submission[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    api.get('/admin/forms/' + id + '/submissions?page=' + page).then(r => {
      setFields(r.data.fields || []);
      setSubs(r.data.submissions || []);
      setTotal(r.data.total || 0);
      setLoading(false);
    }).catch(() => setLoading(false));
  };
  useEffect(load, [page, id]);
  useEffect(() => {
    api.get('/admin/forms/' + id).then(r => setFormName(r.data.name)).catch(() => {});
  }, [id]);

  const exportCsv = async () => {
    const ok = await downloadFile('/admin/forms/' + id + '/submissions/export', 'submissions.csv');
    if (!ok) toast(t('failed', getLang()), 'error');
  };

  const markAllRead = async () => {
    try {
      await api.post('/admin/forms/' + id + '/submissions/read', {});
      toast(t('mark read', getLang()));
      load();
    } catch (e: any) { toast(e?.response?.data?.error || String(e), 'error'); }
  };

  const remove = async (s: Submission) => {
    if (!window.confirm(t('delete submission confirm', getLang()))) return;
    try {
      await api.delete('/admin/forms/' + id + '/submissions/' + s.id);
      toast(t('form deleted', getLang()));
      load();
    } catch (e: any) { toast(e?.response?.data?.error || String(e), 'error'); }
  };

  const pages = Math.max(1, Math.ceil(total / 15));

  return React.createElement('div', null,
    React.createElement('div', { className: 'flex items-center justify-between mb-2' },
      React.createElement('div', { className: 'flex items-center gap-3' },
        React.createElement('button', { onClick: () => navigate('/forms'), className: 'btn-secondary text-sm' }, React.createElement(ArrowLeft, { size: 14 }), t('back to forms', getLang())),
        React.createElement('h2', { className: 'text-2xl font-bold text-gray-900 dark:text-gray-100' }, t('submissions', getLang()) + (formName ? ' — ' + formName : '')),
      ),
      React.createElement('div', { className: 'flex gap-2' },
        React.createElement('button', { onClick: markAllRead, className: 'btn-secondary text-sm' }, React.createElement(CheckCheck, { size: 14 }), t('mark read', getLang())),
        React.createElement('button', { onClick: exportCsv, className: 'btn-secondary text-sm' }, React.createElement(Download, { size: 14 }), t('export csv', getLang())),
      ),
    ),
    React.createElement('p', { className: 'text-sm text-gray-500 dark:text-gray-400 mb-6' }, total + ' ' + t('submissions', getLang())),

    loading
      ? React.createElement('p', { className: 'text-sm text-gray-400' }, t('loading', getLang()) + '…')
      : subs.length === 0
        ? React.createElement('div', { className: 'card p-10 text-center' },
            React.createElement('p', { className: 'text-sm text-gray-400' }, t('no submissions yet', getLang())))
        : React.createElement('div', { className: 'space-y-3' },
            subs.map(s =>
              React.createElement('div', { key: s.id, className: 'card p-4' },
                React.createElement('div', { className: 'flex items-center gap-2 mb-2 flex-wrap' },
                  React.createElement('span', { className: 'text-xs text-gray-500 dark:text-gray-400' }, new Date(s.createdAt).toLocaleString()),
                  s.spam
                    ? React.createElement('span', { className: 'text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 flex items-center gap-1' }, React.createElement(AlertTriangle, { size: 10 }), t('spam', getLang()))
                    : s.status === 'new'
                      ? React.createElement('span', { className: 'text-[10px] px-2 py-0.5 rounded-full bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300 font-medium' }, t('unread', getLang()))
                      : React.createElement('span', { className: 'text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400' }, t('mark read', getLang())),
                  React.createElement('span', { className: 'text-[11px] text-gray-400' }, t('ip address', getLang()) + ': ' + (s.ip || '-')),
                  React.createElement('button', {
                    onClick: () => remove(s),
                    title: t('delete', getLang()),
                    className: 'ml-auto text-gray-400 hover:text-red-500',
                  }, React.createElement(Trash2, { size: 14 })),
                ),
                React.createElement('dl', { className: 'grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5' },
                  fields.map(f =>
                    React.createElement('div', { key: f.name, className: 'flex gap-2 text-sm' },
                      React.createElement('dt', { className: 'text-gray-500 dark:text-gray-400 shrink-0 font-medium' }, (f.label || f.name) + ':'),
                      React.createElement('dd', { className: 'text-gray-800 dark:text-gray-200 break-all' }, s.data[f.name] || '—'),
                    )
                  )
                ),
              )
            ),
            pages > 1 && React.createElement('div', { className: 'flex items-center justify-center gap-2 mt-4' },
              Array.from({ length: pages }, (_, i) => i + 1).map(p =>
                React.createElement('button', {
                  key: p,
                  onClick: () => setPage(p),
                  className: 'w-8 h-8 text-sm rounded-lg border ' + (p === page ? 'bg-primary-600 text-white border-primary-600' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300'),
                }, p)
              )
            )
          ),
  );
}
