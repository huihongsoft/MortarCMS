import React from 'react';
import { Inbox } from 'lucide-react';

// Centered empty-state with icon, title, description and optional action
export default function EmptyState({ icon: Icon = Inbox, title, description, action }: {
  icon?: React.ComponentType<any>;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return React.createElement('div', { className: 'flex flex-col items-center justify-center py-14 text-center' },
    React.createElement('div', { className: 'w-16 h-16 rounded-2xl bg-primary-50 flex items-center justify-center mb-4' },
      React.createElement(Icon, { size: 28, className: 'text-primary-600' }),
    ),
    React.createElement('h3', { className: 'text-base font-semibold text-gray-900 dark:text-gray-100 mb-1' }, title),
    description && React.createElement('p', { className: 'text-sm text-gray-500 dark:text-gray-400 mb-5 max-w-sm' }, description),
    action,
  );
}
