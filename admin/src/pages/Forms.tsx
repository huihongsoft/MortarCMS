import React, { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Eye, Inbox, Copy, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { useToast } from '../lib/toast';
import { t, getLang } from '../lib/i18n';

interface FormRow {
  id: string; name: string; slug: string; enabled: number;
  fieldCount: number; unread: number; total: number; createdAt: string;
}

interface FieldDef { name: string; label: string; type: string; required: boolean; placeholder: string; options: string }

const FIELD_TYPES = ['text', 'email', 'number', 'tel', 'url', 'textarea', 'select'];

export default function Forms() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [forms, setForms] = useState<FormRow[]>([]);
  const [loading, setLoading] = useState(true);
  // Editing modal: id === null = create
  const [editing, setEditing] = useState<{
    id: string | null; name: string; successMessage: string; emailTo: string; emailSubject: string;
    fields: FieldDef[];
  } | null>(null);

  const load = () => {
    setLoading(true);
    api.get('/admin/forms').then(r => { setForms(r.data.forms || []); setLoading(false); })
      .catch(() => setLoading(false));
  };
  useEffect(load, []);

  const blankField = (): FieldDef => ({ name: '', label: '', type: 'text', required: false, placeholder: '', options: '' });

  const save = async () => {
    if (!editing) return;
    if (!editing.name.trim()) { toast(t('form name required', getLang()), 'error'); return; }
    if (editing.fields.length === 0) { toast(t('at least one field', getLang()), 'error'); return; }
    if (editing.fields.some(f => !f.name.trim())) { toast(t('field name required', getLang()), 'error'); return; }
    const payload = {
      name: editing.name, successMessage: editing.successMessage, emailTo: editing.emailTo, emailSubject: editing.emailSubject,
      fields: editing.fields.map(f => ({ ...f, name: f.name.trim(), label: f.label.trim() })),
    };
    try {
      if (editing.id) {
        await api.put('/admin/forms/' + editing.id, payload);
        toast(t('form updated', getLang()));
      } else {
        await api.post('/admin/forms', payload);
        toast(t('form created', getLang()));
      }
      setEditing(null);
      load();
    } catch (e: any) { toast(e?.response?.data?.error || String(e), 'error'); }
  };

  const toggleEnabled = async (f: FormRow) => {
    try {
      const full = (await api.get('/admin/forms/' + f.id)).data;
      await api.put('/admin/forms/' + f.id, {
        name: full.name, fields: full.fields, successMessage: full.successMessage,
        emailTo: full.emailTo, emailSubject: full.emailSubject, enabled: !f.enabled,
      });
      load();
    } catch (e: any) { toast(e?.response?.data?.error || String(e), 'error'); }
  };

  const remove = async (f: FormRow) => {
    if (!window.confirm(t('delete form confirm', getLang()))) return;
    try {
      await api.delete('/admin/forms/' + f.id);
      toast(t('form deleted', getLang()));
      load();
    } catch (e: any) { toast(e?.response?.data?.error || String(e), 'error'); }
  };

  const copyShortcode = (f: FormRow) => {
    navigator.clipboard.writeText('[form id="' + f.slug + '"]').then(() => toast(t('copied', getLang()))).catch(() => {});
  };

  return React.createElement('div', null,
    // Header
    React.createElement('div', { className: 'flex items-center justify-between mb-2' },
      React.createElement('h2', { className: 'text-2xl font-bold text-gray-900 dark:text-gray-100' }, t('forms', getLang())),
      React.createElement('button', {
        onClick: () => setEditing({ id: null, name: '', successMessage: '', emailTo: '', emailSubject: '', fields: [blankField()] }),
        className: 'btn-primary text-sm',
      }, React.createElement(Plus, { size: 15 }), t('new form', getLang())),
    ),
    React.createElement('p', { className: 'text-sm text-gray-500 dark:text-gray-400 mb-6' }, t('forms description', getLang())),

    loading
      ? React.createElement('p', { className: 'text-sm text-gray-400' }, t('loading', getLang()) + '…')
      : forms.length === 0
        ? React.createElement('div', { className: 'card p-10 text-center' },
            React.createElement('p', { className: 'text-sm text-gray-400' }, t('no forms yet', getLang())))
        : React.createElement('div', { className: 'space-y-3' },
            forms.map(f =>
              React.createElement('div', { key: f.id, className: 'card p-4 flex items-center gap-4' },
                // Enable toggle
                React.createElement('button', {
                  onClick: () => toggleEnabled(f),
                  title: t('active', getLang()),
                  role: 'switch',
                  'aria-checked': !!f.enabled,
                  className: 'relative w-9 h-5 rounded-full transition-colors shrink-0 ' + (f.enabled ? 'bg-primary-600' : 'bg-gray-300 dark:bg-gray-700'),
                }, React.createElement('span', { style: { position: 'absolute', top: 2, left: f.enabled ? 18 : 2, width: 16, height: 16 }, className: 'rounded-full bg-white shadow transition-all' })),
                // Info
                React.createElement('div', { className: 'flex-1 min-w-0' },
                  React.createElement('div', { className: 'flex items-center gap-2 flex-wrap' },
                    React.createElement('h3', { className: 'text-sm font-semibold text-gray-900 dark:text-gray-100' }, f.name),
                    f.unread > 0 && React.createElement('span', { className: 'text-[10px] px-2 py-0.5 rounded-full bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300 font-medium' }, f.unread + ' ' + t('unread', getLang())),
                    React.createElement('span', { className: 'text-[11px] text-gray-400' }, f.fieldCount + ' ' + t('fields', getLang()) + ' · ' + f.total + ' ' + t('submissions', getLang())),
                  ),
                  React.createElement('div', { className: 'flex items-center gap-2 mt-1' },
                    React.createElement('code', { className: 'text-xs text-gray-500 dark:text-gray-400' }, '[form id="' + f.slug + '"]'),
                    React.createElement('button', { onClick: () => copyShortcode(f), title: t('copy', getLang()), className: 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200' }, React.createElement(Copy, { size: 13 })),
                  ),
                ),
                // Actions
                React.createElement('div', { className: 'flex items-center gap-1.5 shrink-0' },
                  React.createElement('button', {
                    onClick: () => navigate('/forms/' + f.id + '/submissions'),
                    className: 'btn-secondary text-xs px-2.5 py-1',
                  }, React.createElement(Inbox, { size: 12 }), t('view submissions', getLang()), f.unread > 0 && React.createElement(ChevronRight, { size: 12 })),
                  React.createElement('button', {
                    onClick: () => { api.get('/admin/forms/' + f.id).then(r => setEditing({
                      id: f.id, name: r.data.name, successMessage: r.data.successMessage || '',
                      emailTo: r.data.emailTo || '', emailSubject: r.data.emailSubject || '',
                      fields: (r.data.fields || []).map((x: any) => ({ ...x, options: x.options || '' })),
                    })); },
                    title: t('edit', getLang()),
                    className: 'btn-secondary text-xs px-2.5 py-1',
                  }, React.createElement(Pencil, { size: 12 })),
                  React.createElement('button', { onClick: () => remove(f), title: t('delete', getLang()), className: 'btn-danger text-xs px-2.5 py-1' }, React.createElement(Trash2, { size: 12 })),
                ),
              )
            )
          ),

    // Create / edit modal
    editing && React.createElement('div', { className: 'fixed inset-0 z-[60] bg-black/40 flex items-center justify-center p-4', onClick: (e: React.MouseEvent) => { if (e.target === e.currentTarget) setEditing(null); } },
      React.createElement('div', { className: 'card w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto' },
        React.createElement('h3', { className: 'text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4' }, t(editing.id ? 'edit form' : 'new form', getLang())),
        React.createElement('label', { className: 'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1' }, t('form name', getLang())),
        React.createElement('input', {
          value: editing.name,
          onChange: (e: React.ChangeEvent<HTMLInputElement>) => setEditing({ ...editing, name: e.target.value }),
          placeholder: 'Contact us',
          className: 'input-field mb-3',
        }),
        // Fields editor
        React.createElement('label', { className: 'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2' }, t('fields', getLang())),
        React.createElement('div', { className: 'space-y-2 mb-4' },
          editing.fields.map((fld, i) =>
            React.createElement('div', { key: i, className: 'border border-gray-200 dark:border-gray-700 rounded-xl p-3 space-y-2' },
              React.createElement('div', { className: 'flex gap-2' },
                React.createElement('input', {
                  value: fld.label,
                  onChange: (e: React.ChangeEvent<HTMLInputElement>) => setEditing({ ...editing, fields: editing.fields.map((x, j) => j === i ? { ...x, label: e.target.value } : x) }),
                  placeholder: t('field label', getLang()),
                  className: 'input-field flex-1',
                }),
                React.createElement('input', {
                  value: fld.name,
                  onChange: (e: React.ChangeEvent<HTMLInputElement>) => setEditing({ ...editing, fields: editing.fields.map((x, j) => j === i ? { ...x, name: e.target.value } : x) }),
                  placeholder: t('field name', getLang()),
                  className: 'input-field flex-1',
                }),
                React.createElement('select', {
                  value: fld.type,
                  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => setEditing({ ...editing, fields: editing.fields.map((x, j) => j === i ? { ...x, type: e.target.value } : x) }),
                  className: 'input-field w-32',
                }, FIELD_TYPES.map(tp => React.createElement('option', { key: tp, value: tp }, tp))),
                React.createElement('label', { className: 'flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-300 whitespace-nowrap' },
                  React.createElement('input', {
                    type: 'checkbox',
                    checked: fld.required,
                    onChange: (e: React.ChangeEvent<HTMLInputElement>) => setEditing({ ...editing, fields: editing.fields.map((x, j) => j === i ? { ...x, required: e.target.checked } : x) }),
                    className: 'accent-primary-600',
                  }), t('field required', getLang())),
                React.createElement('button', { onClick: () => setEditing({ ...editing, fields: editing.fields.filter((_, j) => j !== i) }), className: 'btn-danger text-xs px-2 py-1', title: t('delete', getLang()) }, React.createElement(Trash2, { size: 12 })),
              ),
              React.createElement('div', { className: 'flex gap-2' },
                React.createElement('input', {
                  value: fld.placeholder,
                  onChange: (e: React.ChangeEvent<HTMLInputElement>) => setEditing({ ...editing, fields: editing.fields.map((x, j) => j === i ? { ...x, placeholder: e.target.value } : x) }),
                  placeholder: t('field label', getLang()) + ' / placeholder',
                  className: 'input-field flex-1',
                }),
                fld.type === 'select' && React.createElement('input', {
                  value: fld.options,
                  onChange: (e: React.ChangeEvent<HTMLInputElement>) => setEditing({ ...editing, fields: editing.fields.map((x, j) => j === i ? { ...x, options: e.target.value } : x) }),
                  placeholder: t('field options', getLang()),
                  className: 'input-field flex-1',
                }),
              ),
            )
          ),
        ),
        React.createElement('button', { onClick: () => setEditing({ ...editing, fields: [...editing.fields, blankField()] }), className: 'btn-secondary text-xs mb-4' }, React.createElement(Plus, { size: 13 }), t('add field', getLang())),
        // Settings
        React.createElement('label', { className: 'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1' }, t('success message', getLang())),
        React.createElement('input', {
          value: editing.successMessage,
          onChange: (e: React.ChangeEvent<HTMLInputElement>) => setEditing({ ...editing, successMessage: e.target.value }),
          className: 'input-field mb-3',
        }),
        React.createElement('label', { className: 'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1' }, t('notify email', getLang())),
        React.createElement('input', {
          value: editing.emailTo,
          onChange: (e: React.ChangeEvent<HTMLInputElement>) => setEditing({ ...editing, emailTo: e.target.value }),
          className: 'input-field mb-3',
        }),
        React.createElement('label', { className: 'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1' }, t('email subject', getLang())),
        React.createElement('input', {
          value: editing.emailSubject,
          onChange: (e: React.ChangeEvent<HTMLInputElement>) => setEditing({ ...editing, emailSubject: e.target.value }),
          className: 'input-field mb-5',
        }),
        React.createElement('div', { className: 'flex justify-end gap-2' },
          React.createElement('button', { onClick: () => setEditing(null), className: 'btn-secondary text-sm' }, t('cancel', getLang())),
          React.createElement('button', { onClick: save, className: 'btn-primary text-sm' }, t('save', getLang())),
        ),
      )
    ),
  );
}
