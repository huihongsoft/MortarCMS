import React, { useEffect, useState } from 'react';
import { Server, Database, Cpu, HardDrive, CheckCircle2, XCircle, Activity, RefreshCw, X } from 'lucide-react';
import api, { downloadFile } from '../lib/api';
import { t, getLang } from '../lib/i18n';

export default function SystemInfo() {
  const [info, setInfo] = useState<any>(null);
  const [health, setHealth] = useState<any>(null);
  const [dbCfg, setDbCfg] = useState<any>(null);
  const [showDbSwitch, setShowDbSwitch] = useState(false);
  const [swDbType, setSwDbType] = useState('sqlite');
  const [swCfg, setSwCfg] = useState({ host: 'localhost', port: '3306', user: 'root', password: '', database: 'mortar' });
  const [swError, setSwError] = useState('');
  const [swLoading, setSwLoading] = useState(false);
  useEffect(() => {
    api.get('/settings/info').then(r => setInfo(r.data)).catch(() => {});
    api.get('/health/detail').then(r => setHealth(r.data)).catch(() => {});
    api.get('/install').then(r => setDbCfg(r.data)).catch(() => {});
  }, []);

  async function switchDb() {
    setSwError(''); setSwLoading(true);
    try {
      const r = await api.post('/install/switch', { dbType: swDbType, dbConfig: swDbType === 'sqlite' ? undefined : swCfg });
      alert(r.data.message);
      window.location.reload();
    } catch (e: any) { setSwError(e.response?.data?.error || t('switch failed', getLang())); setSwLoading(false); }
  }

  if (!info) return React.createElement('p', { className: 'text-gray-500' }, t('loading...', getLang()));

  return React.createElement('div', null,
    React.createElement('h2', { className: 'text-2xl font-bold text-gray-900 mb-6' }, t('system info', getLang())),
    React.createElement('div', { className: 'grid grid-cols-1 md:grid-cols-2 gap-4' },
      infoCard(Server, t('server', getLang()), 'Node.js ' + info.php.version + ' on ' + info.php.platform + ' ' + info.php.arch),
      infoCard(Database, t('database', getLang()), info.database.engine + ' · ' + info.database.tables + ' tables · ' + info.database.posts + ' posts'),
      infoCard(Cpu, t('memory', getLang()), info.server.memory + ' used · Uptime: ' + Math.floor(info.server.uptime / 60) + ' min'),
      infoCard(HardDrive, t('site', getLang()), info.site.title + ' · v' + info.site.version + ' · ' + info.themes.available.length + ' themes'),
    ),
    health && React.createElement('div', { className: 'mt-6 card p-5' },
      React.createElement('div', { className: 'flex items-center gap-2 mb-4' },
        React.createElement(Activity, { size: 18, className: 'text-primary-500' }),
        React.createElement('h3', { className: 'text-sm font-semibold text-gray-900' }, t('health checks', getLang())),
        React.createElement('span', { className: 'ml-auto text-xs ' + (health.ok ? 'text-green-600' : 'text-red-600') }, health.ok ? t('all checks passed', getLang()) : t('issues detected', getLang()))
      ),
      React.createElement('div', { className: 'grid grid-cols-1 md:grid-cols-2 gap-3' },
        healthRow(t('database', getLang()), health.checks.database, health.checks.database?.tables + ' tables'),
        healthRow(t('database detail', getLang()), health.checks.databaseDetail, health.checks.databaseDetail && (health.checks.databaseDetail.sizeKB + ' KB · ' + health.checks.databaseDetail.indexes + ' indexes')),
        healthRow(t('content counts', getLang()), health.checks.counts, health.checks.counts && (health.checks.counts.posts + ' posts · ' + health.checks.counts.pages + ' pages · ' + health.checks.counts.comments + ' comments · ' + health.checks.counts.pendingComments + ' pending comments')),
        healthRow(t('uploads directory', getLang()), health.checks.uploads, health.checks.uploads?.dir),
        healthRow(t('uploads size', getLang()), health.checks.uploadsSize, health.checks.uploadsSize && health.checks.uploadsSize.sizeMB + ' MB'),
        healthRow(t('disk space', getLang()), health.checks.disk, health.checks.disk && health.checks.disk.freeGB + ' GB free'),
        healthRow(t('environment', getLang()), health.checks.environment, 'Node ' + health.checks.environment?.node + ' · ' + health.checks.environment?.memoryMB + ' MB used'),
        healthRow(t('ecosystem', getLang()), health.checks.ecosystem, health.checks.ecosystem && (health.checks.ecosystem.themes + ' themes · ' + health.checks.ecosystem.plugins + ' plugins · ' + health.checks.ecosystem.backups + ' backups')),
        healthRow(t('mail settings', getLang()), health.checks.mail, health.checks.mail?.configured ? t('configured', getLang()) : t('not configured', getLang())),
        healthRow(t('directory permissions', getLang()), health.checks.permissions, health.checks.permissions?.writable ? t('uploads writable', getLang()) : health.checks.permissions?.error),
        healthRow(t('dependencies', getLang()), health.checks.dependencies, health.checks.dependencies?.deps ? Object.keys(health.checks.dependencies.deps).length + ' key packages' : health.checks.dependencies?.error),
        healthRow(t('backup status', getLang()), health.checks.backupStatus, health.checks.backupStatus?.lastBackup ? t('last backup', getLang()) + ': ' + new Date(health.checks.backupStatus.lastBackup).toLocaleDateString() : t('no backups yet', getLang())),
        healthRow(t('operations', getLang()), health.checks.operations, (health.checks.operations?.cache ? t('cache on', getLang()) : t('cache off', getLang())) + ' · ' + (health.checks.operations?.maintenance ? t('maintenance active', getLang()) : t('no maintenance', getLang()))),
      )
    ),
    dbCfg && React.createElement('div', { className: 'mt-6 card p-5' },
      React.createElement('h3', { className: 'text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2' }, React.createElement(Database, { size: 16, className: 'text-primary-500' }), t('database config', getLang())),
      React.createElement('div', { className: 'grid grid-cols-2 md:grid-cols-4 gap-3' },
        dbRow(t('driver', getLang()), dbCfg.driver),
        dbRow(t('host', getLang()), dbCfg.host || t('local file', getLang())),
        dbRow(t('port', getLang()), dbCfg.port || '—'),
        dbRow(t('database', getLang()), dbCfg.database || '—'),
      ),
      React.createElement('div', { className: 'flex items-center justify-between mt-3' },
        React.createElement('p', { className: 'text-xs text-gray-400' }, t('switch db hint', getLang())),
        React.createElement('button', { onClick: () => setShowDbSwitch(true), className: 'btn-secondary text-xs' }, React.createElement(RefreshCw, { size: 12 }), t('switch database', getLang()))
      )
    ),
    React.createElement('div', { className: 'mt-6 card p-5' },
      React.createElement('h3', { className: 'text-sm font-semibold text-gray-900 mb-3' }, t('backup', getLang())),
      React.createElement('p', { className: 'text-xs text-gray-500 mb-4' }, t('backup description', getLang())),
      React.createElement('div', { className: 'flex flex-wrap gap-3 items-center' },
        React.createElement('button', { onClick: () => { if (!downloadFile('/db/backup-full', 'mortar-backup.zip')) alert(t('download failed', getLang())); }, className: 'btn-primary text-xs' }, t('download full backup', getLang())),
        React.createElement('button', { onClick: () => { if (!downloadFile('/db/backup', 'mortar-backup.db')) alert(t('download failed', getLang())); }, className: 'btn-secondary text-xs' }, t('download db backup', getLang())),
        React.createElement('label', { className: 'btn-secondary text-xs cursor-pointer' },
          t('restore backup', getLang()),
          React.createElement('input', {
            type: 'file', accept: '.zip', className: 'hidden',
            onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
              const f = e.target.files?.[0];
              if (!f) return;
              if (!confirm(t('restore confirm', getLang()))) { e.target.value = ''; return; }
              const fd = new FormData();
              fd.append('file', f);
              api.post('/db/restore-full', fd).then(r => alert(t('restore complete', getLang()) + ': ' + (r.data.message || ''))).catch((err: any) => alert(err.response?.data?.error || t('restore failed', getLang())));
              e.target.value = '';
            },
          }),
        ),
      ),
    ),
    showDbSwitch && React.createElement('div', { className: 'fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4' },
      React.createElement('div', { className: 'bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-lg w-full p-6' },
        React.createElement('div', { className: 'flex items-center justify-between mb-4' },
          React.createElement('h3', { className: 'font-semibold text-gray-900 dark:text-gray-100' }, t('switch database', getLang())),
          React.createElement('button', { onClick: () => setShowDbSwitch(false), className: 'p-1 text-gray-400 hover:text-gray-600' }, React.createElement(X, { size: 18 })),
        ),
        swError && React.createElement('div', { className: 'p-3 mb-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg' }, swError),
        React.createElement('div', { className: 'space-y-2 mb-4' },
          ['sqlite', 'mysql', 'postgres'].map(dt =>
            React.createElement('button', {
              key: dt, onClick: () => { setSwDbType(dt); if (dt !== 'sqlite') setSwCfg({ ...swCfg, port: dt === 'mysql' ? '3306' : '5432' }); },
              className: 'w-full text-left px-3 py-2 rounded-lg border text-sm ' + (swDbType === dt ? 'border-primary-500 bg-primary-50/50 dark:bg-primary-900/30 text-gray-900 dark:text-gray-100' : 'border-gray-200 text-gray-700 dark:text-gray-300'),
            }, dt === 'sqlite' ? 'SQLite (local file)' : dt === 'mysql' ? 'MySQL / MariaDB' : 'PostgreSQL')
          )
        ),
        swDbType !== 'sqlite' && React.createElement('div', { className: 'grid grid-cols-2 gap-3 mb-4' },
          React.createElement('input', { value: swCfg.host, onChange: e => setSwCfg({ ...swCfg, host: e.target.value }), placeholder: t('host', getLang()), className: 'input-field' }),
          React.createElement('input', { value: swCfg.port, onChange: e => setSwCfg({ ...swCfg, port: e.target.value }), placeholder: t('port', getLang()), className: 'input-field' }),
          React.createElement('input', { value: swCfg.user, onChange: e => setSwCfg({ ...swCfg, user: e.target.value }), placeholder: t('username', getLang()), className: 'input-field' }),
          React.createElement('input', { type: 'password', value: swCfg.password, onChange: e => setSwCfg({ ...swCfg, password: e.target.value }), placeholder: t('password', getLang()), className: 'input-field' }),
          React.createElement('input', { value: swCfg.database, onChange: e => setSwCfg({ ...swCfg, database: e.target.value }), placeholder: t('database name', getLang()), className: 'input-field col-span-2' }),
        ),
        React.createElement('p', { className: 'text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg p-2 mb-4' }, t('switch warning', getLang())),
        React.createElement('button', { onClick: switchDb, disabled: swLoading, className: 'btn-primary w-full justify-center' },
          swLoading ? t('switching...', getLang()) : t('switch database', getLang())),
      )
    )
  );
}

function dbRow(label: string, value: string) {
  return React.createElement('div', { className: 'p-3 rounded-lg bg-gray-50 dark:bg-gray-800' },
    React.createElement('p', { className: 'text-[10px] uppercase tracking-wider text-gray-400' }, label),
    React.createElement('p', { className: 'text-sm font-medium text-gray-900 dark:text-gray-100 truncate' }, value)
  );
}

function healthRow(title: string, check: any, detail: string) {
  const ok = check?.ok !== false;
  return React.createElement('div', { className: 'flex items-center gap-2 p-2 rounded-lg bg-gray-50' },
    ok
      ? React.createElement(CheckCircle2, { size: 16, className: 'text-green-500 shrink-0' })
      : React.createElement(XCircle, { size: 16, className: 'text-red-500 shrink-0' }),
    React.createElement('div', { className: 'min-w-0' },
      React.createElement('p', { className: 'text-xs font-medium text-gray-800' }, title),
      React.createElement('p', { className: 'text-[10px] text-gray-500 truncate' }, detail || check?.error || 'ok')
    )
  );
}

function infoCard(Icon: any, title: string, detail: string) {
  return React.createElement('div', { className: 'card p-5' },
    React.createElement('div', { className: 'flex items-start gap-3' },
      React.createElement(Icon, { size: 20, className: 'text-primary-500 mt-0.5' }),
      React.createElement('div', null,
        React.createElement('h3', { className: 'text-sm font-semibold text-gray-900 mb-1' }, title),
        React.createElement('p', { className: 'text-xs text-gray-500' }, detail)
      )
    )
  );
}
