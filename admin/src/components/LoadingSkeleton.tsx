import React from 'react';

export default function LoadingSkeleton({ rows = 5 }: { rows?: number }) {
  return React.createElement('div', { className: 'space-y-3 animate-pulse' },
    Array.from({ length: rows }).map((_, i) =>
      React.createElement('div', { key: i, className: 'card p-4' },
        React.createElement('div', { className: 'h-4 bg-gray-200 rounded w-3/4 mb-2' }),
        React.createElement('div', { className: 'h-3 bg-gray-200 rounded w-1/2' })
      )
    )
  );
}
