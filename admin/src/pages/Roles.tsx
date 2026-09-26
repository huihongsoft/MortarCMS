import React, { useEffect, useState } from 'react';
import { Plus, Shield, Users, Save, Trash2, KeyRound, Bot } from 'lucide-react';
import api from '../lib/api';
import { useToast } from '../lib/toast';
import { t, getLang } from '../lib/i18n';
import { dialog } from '../lib/dialog';

interface Role {
  slug: string;
  name: string;
  capabilities: string[];
  isSystem: boolean;
  userCount: number;
}

// Capability ids come from the server catalog and are translated through the
// dictionary (`cap <id>` / `cap group <key>`). The dictionary keys are English
// copy, so a miss returns the key — the English labels below are the fallback,
// the same convention the block palette uses in VisualEditor.
const CAP_EN: Record<string, string> = {
  edit_posts: 'Edit posts', publish_posts: 'Publish posts', delete_posts: 'Delete posts',
  edit_others_posts: "Edit others' posts", delete_others_posts: "Delete others' posts",
  edit_pages: 'Edit pages', publish_pages: 'Publish pages', delete_pages: 'Delete pages',
  moderate_comments: 'Moderate comments', submit_posts: 'Submit posts', review_posts: 'Review submissions',
  manage_forms: 'Manage forms', manage_categories: 'Manage categories', manage_tags: 'Manage tags', manage_links: 'Manage links',
  upload_files: 'Upload files', edit_media: 'Edit media details', delete_media: 'Delete media',
  manage_menus: 'Manage menus', manage_themes: 'Manage themes', install_themes: 'Install themes',
  delete_themes: 'Delete themes', rebuild_themes: 'Rebuild theme bundles',
  manage_options: 'Site settings', manage_users: 'Manage users', manage_roles: 'Manage roles & permissions',
  manage_plugins: 'Manage plugins', import: 'Data import', export: 'Data export',
  manage_sites: 'Manage sites', view_sites: 'View site list', manage_security: 'Security audit',
  view_system_info: 'System info', manage_system: 'System maintenance',
  ai_use: 'Use AI chat / tasks / writing', ai_manage: 'AI providers & permissions', ai_bindings: 'WeChat / DingTalk bindings',
  ai_tasks: 'View all AI tasks', ai_review: 'AI comment moderation',
};
const GROUP_EN: Record<string, string> = { content: 'Content', media: 'Media', appearance: 'Appearance', system: 'System', ai: 'AI assistant' };

/** Translated capability label, falling back to the English map. */
function capLabel(id: string): string {
  const key = 'cap ' + id;
  const translated = t(key, getLang());
  return translated !== key ? translated : (CAP_EN[id] || id);
}

/** Translated capability-group title, falling back to the English map. */
function groupLabel(group: string): string {
  const key = 'cap group ' + group;
  const translated = t(key, getLang());
  return translated !== key ? translated : (GROUP_EN[group] || group);
}


export default function Roles() {
  const toast = useToast();
  const [roles, setRoles] = useState<Role[]>([]);
  const [catalog, setCatalog] = useState<any[]>([]);
  const [drafts, setDrafts] = useState<Record<string, string[]>>({});
  const [newName, setNewName] = useState('');
  const [active, setActive] = useState<string>('editor');
  const [editingNames, setEditingNames] = useState<Record<string, string>>({});

  useEffect(() => {
    api.get('/roles').then(r => {
      setRoles(r.data.roles || []);
      setCatalog(r.data.catalog || []);
      const d: Record<string, string[]> = {};
      (r.data.roles || []).forEach((role: Role) => { d[role.slug] = [...role.capabilities]; });
      setDrafts(d);
    }).catch(() => {});
  }, []);

  const activeRole = roles.find(r => r.slug === active) || roles[0];

  function toggleCap(slug: string, cap: string) {
    const cur = drafts[slug] || [];
    const next = cur.includes(cap) ? cur.filter(c => c !== cap) : [...cur, cap];
    setDrafts({ ...drafts, [slug]: next });
  }

  function toggleGroup(slug: string, groupCaps: string[]) {
    const cur = drafts[slug] || [];
    const allOn = groupCaps.every(c => cur.includes(c));
    const next = allOn ? cur.filter(c => !groupCaps.includes(c)) : [...new Set([...cur, ...groupCaps])];
    setDrafts({ ...drafts, [slug]: next });
  }

  function allCaps(): string[] {
    return catalog.flatMap(g => g.caps.map((c: any) => c.id));
  }

  async function save(slug: string) {
    try {
      await api.put('/roles/' + slug, { capabilities: drafts[slug] || [], name: editingNames[slug] });
      toast.toast(t('saved', getLang()));
      // The caller's own capabilities may have just changed: tell the auth
      // provider to re-read /auth/me so the sidebar and route guards follow.
      window.dispatchEvent(new Event('mortar-permissions-changed'));
      const r = await api.get('/roles');
      setRoles(r.data.roles || []);
      const d: Record<string, string[]> = {};
      (r.data.roles || []).forEach((role: Role) => { d[role.slug] = [...role.capabilities]; });
      setDrafts(d);
    } catch (e: any) { toast.toast(e.response?.data?.error || t('save failed', getLang()), 'error'); }
  }

  async function createRole() {
    if (!newName.trim()) return;
    try {
      await api.post('/roles', { name: newName, capabilities: [] });
      setNewName('');
      const r = await api.get('/roles');
      setRoles(r.data.roles || []);
      const d: Record<string, string[]> = {};
      (r.data.roles || []).forEach((role: Role) => { d[role.slug] = [...role.capabilities]; });
      setDrafts(d);
      toast.toast(t('role created', getLang()));
      window.dispatchEvent(new Event('mortar-permissions-changed'));
    } catch (e: any) { toast.toast(e.response?.data?.error || t('save failed', getLang()), 'error'); }
  }

  async function deleteRole(slug: string) {
    if (!(await dialog.confirm(t('delete role confirm', getLang()) + ' "' + slug + '"?', { danger: true }))) return;
    try {
      await api.delete('/roles/' + slug);
      const r = await api.get('/roles');
      setRoles(r.data.roles || []);
      const d: Record<string, string[]> = {};
      (r.data.roles || []).forEach((role: Role) => { d[role.slug] = [...role.capabilities]; });
      setDrafts(d);
      if (active === slug) setActive('editor');
      window.dispatchEvent(new Event('mortar-permissions-changed'));
    } catch (e: any) { toast.toast(e.response?.data?.error || t('delete failed', getLang()), 'error'); }
  }

  return React.createElement('div', null,
    React.createElement('div', { className: 'flex items-center justify-between mb-6' },
      React.createElement('h2', { className: 'text-2xl font-bold text-gray-900 flex items-center gap-2' },
        React.createElement(Shield, { size: 22, className: 'text-primary-600' }), t('roles & permissions', getLang())),
      React.createElement('div', { className: 'flex items-center gap-2' },
        React.createElement('input', { value: newName, onChange: e => setNewName(e.target.value), onKeyDown: e => { if (e.key === 'Enter') createRole(); }, placeholder: t('new role name', getLang()), className: 'input-field w-44 text-sm' }),
        React.createElement('button', { onClick: createRole, disabled: !newName.trim(), className: 'btn-primary text-sm' }, React.createElement(Plus, { size: 15 }), t('create role', getLang())))
    ),

    React.createElement('div', { className: 'grid grid-cols-1 lg:grid-cols-4 gap-6' },
      // Role list
      React.createElement('div', { className: 'space-y-2' },
        roles.map(role => React.createElement('div', {
          key: role.slug,
          onClick: () => setActive(role.slug),
          className: 'card p-3 cursor-pointer transition-colors ' + (active === role.slug ? 'border-primary-400 ring-1 ring-primary-200' : 'hover:border-gray-300'),
        },
          React.createElement('div', { className: 'flex items-center justify-between' },
            React.createElement('div', { className: 'flex items-center gap-2' },
              React.createElement(Users, { size: 14, className: 'text-gray-400' }),
              React.createElement('span', { className: 'font-medium text-sm text-gray-900' }, role.name),
              role.isSystem && React.createElement('span', { className: 'text-[9px] px-1 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-400' }, t('system', getLang()))),
            React.createElement('span', { className: 'text-[11px] text-gray-400' }, role.userCount + ' ' + t('users', getLang()))),
          React.createElement('p', { className: 'text-[10px] text-gray-400 mt-1 font-mono' }, role.slug),
          role.slug === 'admin'
            ? React.createElement('p', { className: 'text-[10px] text-primary-600 mt-1' }, t('full access', getLang()))
            : React.createElement('p', { className: 'text-[10px] text-gray-400 mt-1' }, (role.capabilities.length) + ' / ' + allCaps().length + ' ' + t('permissions', getLang()))
        ))
      ),

      // Permission matrix
      activeRole && React.createElement('div', { className: 'lg:col-span-3 card p-5' },
        React.createElement('div', { className: 'flex items-center justify-between mb-4' },
          React.createElement('div', { className: 'flex items-center gap-2' },
            React.createElement('input', {
              value: editingNames[activeRole.slug] !== undefined ? editingNames[activeRole.slug] : activeRole.name,
              onChange: e => setEditingNames({ ...editingNames, [activeRole.slug]: e.target.value }),
              disabled: activeRole.isSystem,
              className: 'input-field w-40 text-sm font-medium',
            }),
            React.createElement('span', { className: 'text-xs text-gray-400 font-mono' }, activeRole.slug),
          ),
          React.createElement('div', { className: 'flex items-center gap-2' },
            !activeRole.isSystem && React.createElement('button', { onClick: () => deleteRole(activeRole.slug), className: 'p-1.5 text-gray-400 hover:text-red-600' }, React.createElement(Trash2, { size: 15 })),
            React.createElement('button', { onClick: () => save(activeRole.slug), className: 'btn-primary text-xs' }, React.createElement(Save, { size: 14 }), t('save', getLang())),
          ),
        ),

        React.createElement('div', { className: 'space-y-4' },
          catalog.map((group: any) => {
            const groupCaps = group.caps.map((c: { id: string }) => c.id);
            const cur = drafts[activeRole.slug] || [];
            const allOn = groupCaps.every((c: string) => cur.includes(c));
            const someOn = groupCaps.some((c: string) => cur.includes(c));
            const isAi = group.group === 'ai';
            return React.createElement('div', { key: group.group, className: 'border border-gray-100 dark:border-gray-700 rounded-xl overflow-hidden' },
              React.createElement('div', { className: 'flex items-center justify-between px-3 py-2 bg-gray-50 dark:bg-gray-800' },
                React.createElement('p', { className: 'text-xs font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-1.5' },
                  isAi ? React.createElement(Bot, { size: 13, className: 'text-primary-600' }) : React.createElement(KeyRound, { size: 13, className: 'text-gray-400' }),
                  groupLabel(group.group)),
                React.createElement('button', {
                  onClick: () => toggleGroup(activeRole.slug, groupCaps),
                  className: 'text-[10px] px-2 py-0.5 rounded ' + (allOn ? 'bg-primary-600 text-white' : someOn ? 'bg-primary-50 text-primary-600' : 'bg-gray-200 dark:bg-gray-700 text-gray-500'),
                }, allOn ? t('all', getLang()) : someOn ? t('partial', getLang()) : t('none', getLang())),
              ),
              React.createElement('div', { className: 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-1.5 p-3' },
                group.caps.map((c: { id: string; label: string }) => {
                  const on = cur.includes(c.id);
                  const disabled = activeRole.slug === 'admin';
                  return React.createElement('label', {
                    key: c.id,
                    className: 'flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer transition-colors ' + (on ? 'bg-primary-50 dark:bg-primary-500/15' : 'hover:bg-gray-50 dark:hover:bg-gray-800'),
                  },
                    React.createElement('input', { type: 'checkbox', checked: on, disabled, onChange: () => toggleCap(activeRole.slug, c.id), className: 'rounded border-gray-300 text-primary-600 disabled:opacity-50' }),
                    React.createElement('span', { className: 'text-xs text-gray-700 dark:text-gray-300' }, capLabel(c.id)),
                  );
                })
              )
            );
          })
        )
      )
    )
  );
}
