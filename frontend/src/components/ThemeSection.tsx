import React from 'react';

// Renders a theme hook section (HTML+CSS) from the settings.
// Each section is a visual block designed via the theme Appearance editor.
export default function ThemeSection({ settings, location }: { settings: Record<string, string>; location: string }) {
  const key = 'theme_section_' + location;
  const raw = settings[key];
  if (!raw) return null;

  let data: { html?: string; css?: string };
  try { data = JSON.parse(raw); } catch { return null; }
  if (!data.html && !data.css) return null;

  return React.createElement(React.Fragment, null,
    data.css && React.createElement('style', { dangerouslySetInnerHTML: { __html: data.css } }),
    data.html && React.createElement('div', {
      className: 'theme-section theme-section--' + location,
      dangerouslySetInnerHTML: { __html: data.html },
    })
  );
}
