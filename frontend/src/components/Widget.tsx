import React from 'react';

// The sidebar-widget shell.
//
// Ten widgets each spelled out the same two lines: a card
// (`rounded-lg border border-gray-200 p-4`, repeated in 15 files) and a heading
// (`text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wider`, in 10).
// They live here now — and as the `.card` / `.widget-title` classes in index.css,
// so the theme layouts that build their own blocks use the same two names instead
// of a third copy of the strings.
//
// A theme that wants a different look passes `className` (SearchWidget needs
// `relative` for its suggestion popover) rather than a new card.
export default function Widget({ title, icon, children, className, innerRef }: {
  title?: string;
  /**
   * Optional leading icon; its presence also switches the heading to a flex row.
   * ElementType rather than ComponentType: the icons are lucide
   * forwardRef components with their own prop type.
   */
  icon?: React.ElementType;
  children?: React.ReactNode;
  className?: string;
  /** For a widget that needs the element (SearchWidget closes on an outside click). */
  innerRef?: React.Ref<HTMLDivElement>;
}) {
  return React.createElement('div', { ref: innerRef, className: 'card' + (className ? ' ' + className : '') },
    title && React.createElement('h3', { className: 'widget-title' + (icon ? ' flex items-center gap-1.5' : '') },
      icon && React.createElement(icon, { size: 14, className: 'text-gray-400' }),
      title),
    children
  );
}
