import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';
import { useAuth } from '../lib/auth';
import { t, getLang } from '../lib/i18n';
import { accessFor, allowed, firstAllowedPath } from '../lib/access';

// Shown instead of a screen the account may not use.
//
// A URL that is typed, bookmarked or restored from the session used to render the
// page anyway and then fail on every request — either silently (an empty list) or
// as a raw error. This says what happened, which capability is missing, and where
// the account can go instead.
export default function NoAccess({ path }: { path: string }) {
  const { user, can } = useAuth();
  const navigate = useNavigate();
  const rule = accessFor(path);
  const target = firstAllowedPath(user, can);
  const needed = rule.cap
    ? t('this action needs the capability', getLang()) + ' ' + rule.cap
    : rule.roles?.length
      ? t('this area is limited to the roles', getLang()) + ' ' + rule.roles.join(', ')
      : '';

  return React.createElement('div', { className: 'flex flex-col items-center justify-center py-20 text-center' },
    React.createElement('div', { className: 'w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center mb-4' },
      React.createElement(ShieldAlert, { size: 28, className: 'text-amber-600 dark:text-amber-400' })),
    React.createElement('h2', { className: 'text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1' }, t('no permission', getLang())),
    React.createElement('p', { className: 'text-sm text-gray-500 dark:text-gray-400 mb-1 max-w-md' },
      t('your account does not have access to this screen', getLang())),
    needed && React.createElement('p', { className: 'text-xs text-gray-400 mb-4' }, needed),
    React.createElement('button', {
      onClick: () => navigate(target, { replace: true }),
      className: 'btn-primary text-sm',
    }, t('go to a screen you can use', getLang()))
  );
}

/** Route guard: renders the page when the account may use it, otherwise NoAccess.
 *  Kept next to the rule table so the sidebar and the guard cannot disagree. */
export function Guarded({ path, children }: { path: string; children: React.ReactNode }) {
  const { user, can } = useAuth();
  if (!allowed(user, accessFor(path), can)) return React.createElement(NoAccess, { path });
  return React.createElement(React.Fragment, null, children);
}
