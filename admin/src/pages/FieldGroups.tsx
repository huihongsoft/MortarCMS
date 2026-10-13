import React, { useEffect, useState } from 'react';
import { Plus, Trash2, ListPlus, Pencil } from 'lucide-react';
import api from '../lib/api';
import { t, getLang, serverMessage } from '../lib/i18n';
import { dialog } from '../lib/dialog';

// Field groups: the custom fields attached to one content type. The definition
// lives here; each post's values are edited in the post editor, on the panel
// this page's definitions produce.

const FIELD_TYPES = ['text', 'textarea', 'richtext', 'number', 'boolean', 'date', 'select', 'media', 'relation'];

interface FieldDef { key: string; label: string; type: string; required?: boolean; options?: string[]; hint?: string; default?: string }
interface Draft { id: string | null; typeSlug: string; name: string; fields: FieldDef[] }

const emptyDraft = (typeSlug: string): Draft => ({ id: null, typeSlug, name: '', fields: [] });

export default function FieldGroups() {
  const [groups, setGroups] = useState<any[]>([]);
  const [types, setTypes] = useState<any[]>([]);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const load = () => api.get('/field-groups').then(r => setGroups(r.data.groups || [])).catch(() => {});
  useEffect(() => {
    load();
    api.get('/post-types').then(r => setTypes(Array.isArray(r.data) ? r.data : [])).catch(() => {});
  }, []);

  const typeLabel = (slug: string) => types.find(x => x.slug === slug)?.label || slug;

  function updateField(i: number, patch: Partial<FieldDef>) {
    if (!draft) return;
    const fields = draft.fields.map((f, j) => j === i ? { ...f, ...patch } : f);
    setDraft({ ...draft, fields });
  }

  async function save() {
    if (!draft) return;
    setSaving(true); setError('');
    try {
      const payload = { typeSlug: draft.typeSlug, name: draft.name.trim(), fields: draft.fields };
      if (draft.id) await api.put('/field-groups/' + draft.id, payload);
      else await api.post('/field-groups', payload);
      await load();
      setDraft(null);
    } catch (e: any) { setError(serverMessage(e.response?.data?.error || '', getLang()) || t('save failed', getLang())); }
    setSaving(false);
  }

  async function remove(id: string, name: string) {
    if (!(await dialog.confirm(t('delete field group confirm', getLang()) + '「' + name + '」？', { danger: true }))) return;
    try {
      await api.delete('/field-groups/' + id);
      setGroups(groups.filter(g => g.id !== id));
    } catch (e: any) { setError(serverMessage(e.response?.data?.error || '', getLang()) || t('delete failed', getLang())); }
  }

  const fieldRow = (f: FieldDef, i: number) => React.createElement('div', { key: i, className: 'rounded-lg border border-gray-100 dark:border-gray-700 p-2 space-y-2' },
    React.createElement('div', { className: 'grid grid-cols-12 gap-2 items-center' },
      React.createElement('input', { value: f.key, onChange: (e: React.ChangeEvent<HTMLInputElement>) => updateField(i, { key: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '') }), placeholder: t('field key', getLang()), className: 'input-field text-sm col-span-4' }),
      React.createElement('input', { value: f.label, onChange: (e: React.ChangeEvent<HTMLInputElement>) => updateField(i, { label: e.target.value }), placeholder: t('field label', getLang()), className: 'input-field text-sm col-span-4' }),
      React.createElement('select', { value: f.type, onChange: (e: React.ChangeEvent<HTMLSelectElement>) => updateField(i, { type: e.target.value }), className: 'input-field text-sm col-span-3' },
        FIELD_TYPES.map(x => React.createElement('option', { key: x, value: x }, x))),
      React.createElement('button', { onClick: () => draft && setDraft({ ...draft, fields: draft.fields.filter((_x, j) => j !== i) }), className: 'text-red-500 text-xs col-span-1' }, React.createElement(Trash2, { size: 13 }))
    ),
    React.createElement('div', { className: 'grid grid-cols-12 gap-2 items-center' },
      // Options only mean something for a select — showing the box for every
      // type would invite values nothing ever checks.
      f.type === 'select'
        ? React.createElement('input', { value: (f.options || []).join(','), onChange: (e: React.ChangeEvent<HTMLInputElement>) => updateField(i, { options: e.target.value.split(',').map(s => s.trim()).filter(Boolean) }), placeholder: t('options comma separated', getLang()), className: 'input-field text-sm col-span-5' })
        : React.createElement('span', { className: 'col-span-5' }),
      React.createElement('input', { value: f.default || '', onChange: (e: React.ChangeEvent<HTMLInputElement>) => updateField(i, { default: e.target.value }), placeholder: t('default value', getLang()), className: 'input-field text-sm col-span-4' }),
      React.createElement('label', { className: 'col-span-3 flex items-center gap-1 text-[11px] text-gray-500' },
        React.createElement('input', { type: 'checkbox', checked: !!f.required, onChange: (e: React.ChangeEvent<HTMLInputElement>) => updateField(i, { required: e.target.checked }) }),
        t('required', getLang()))
    ),
    React.createElement('input', { value: f.hint || '', onChange: (e: React.ChangeEvent<HTMLInputElement>) => updateField(i, { hint: e.target.value }), placeholder: t('field hint', getLang()), className: 'input-field text-xs' })
  );

  return React.createElement('div', { className: 'space-y-6' },
    React.createElement('div', { className: 'flex items-center gap-3' },
      React.createElement(ListPlus, { size: 20, className: 'text-primary-600' }),
      React.createElement('h2', { className: 'text-xl font-semibold text-gray-900 dark:text-white' }, t('custom fields', getLang()))
    ),
    React.createElement('p', { className: 'text-sm text-gray-500 max-w-2xl' }, t('custom fields hint', getLang())),
    error && React.createElement('div', { className: 'p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg' }, error),

    // Create / edit
    React.createElement('div', { className: 'card p-5' },
      draft
        ? React.createElement('div', { className: 'space-y-3' },
            React.createElement('div', { className: 'grid grid-cols-1 md:grid-cols-3 gap-3' },
              React.createElement('select', { value: draft.typeSlug, onChange: (e: React.ChangeEvent<HTMLSelectElement>) => setDraft({ ...draft, typeSlug: e.target.value }), className: 'input-field', disabled: !!draft.id },
                types.map(x => React.createElement('option', { key: x.slug, value: x.slug }, x.label))),
              React.createElement('input', { value: draft.name, onChange: (e: React.ChangeEvent<HTMLInputElement>) => setDraft({ ...draft, name: e.target.value }), placeholder: t('group name', getLang()), className: 'input-field' }),
              React.createElement('div', { className: 'flex gap-2' },
                React.createElement('button', { onClick: save, disabled: saving || !draft.name.trim(), className: 'btn-primary text-sm' }, t('save', getLang())),
                React.createElement('button', { onClick: () => setDraft(null), className: 'btn-secondary text-sm' }, t('cancel', getLang()))
              )
            ),
            draft.fields.length > 0 && React.createElement('div', { className: 'space-y-2' }, draft.fields.map(fieldRow)),
            React.createElement('button', { onClick: () => setDraft({ ...draft, fields: [...draft.fields, { key: '', label: '', type: 'text' }] }), className: 'btn-secondary text-xs' },
              React.createElement(Plus, { size: 13 }), t('add field', getLang()))
          )
        : React.createElement('button', {
            onClick: () => setDraft(emptyDraft(types[0]?.slug || 'post')),
            className: 'btn-primary text-sm',
            disabled: types.length === 0,
          }, React.createElement(Plus, { size: 16 }), t('new field group', getLang()))
    ),

    // Existing groups
    groups.length === 0
      ? React.createElement('p', { className: 'text-gray-400 text-sm' }, t('no field groups yet', getLang()))
      : React.createElement('div', { className: 'space-y-3' }, groups.map(g =>
          React.createElement('div', { key: g.id, className: 'card p-4 flex items-start justify-between gap-4' },
            React.createElement('div', { className: 'min-w-0' },
              React.createElement('p', { className: 'font-medium text-gray-900 dark:text-white text-sm' }, g.name),
              React.createElement('p', { className: 'text-xs text-gray-500 mt-0.5' }, typeLabel(g.typeSlug) + ' · ' + g.fields.length + ' ' + t('fields', getLang())),
              React.createElement('p', { className: 'text-[11px] text-gray-400 mt-1 truncate' }, g.fields.map((f: FieldDef) => f.key).join(', '))
            ),
            React.createElement('div', { className: 'flex items-center gap-1 shrink-0' },
              React.createElement('button', { onClick: () => setDraft({ id: g.id, typeSlug: g.typeSlug, name: g.name, fields: g.fields.map((f: FieldDef) => ({ ...f })) }), className: 'p-1.5 text-gray-400 hover:text-primary-600', 'aria-label': t('edit', getLang()) }, React.createElement(Pencil, { size: 15 })),
              React.createElement('button', { onClick: () => remove(g.id, g.name), className: 'p-1.5 text-gray-400 hover:text-red-600', 'aria-label': t('delete', getLang()) }, React.createElement(Trash2, { size: 15 }))
            )
          )))
  );
}
