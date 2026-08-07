# Theme Development

Themes define the look and feel of the public site. They live in
`server/themes/<name>/` and are activated from the admin Appearance page.

## Structure

```
server/themes/<name>/
└── theme.json     # metadata + settings + custom CSS
```

```json
{
  "name": "magazine",
  "version": "1.0.0",
  "description": "Magazine-style theme — serif headings, left sidebar.",
  "author": "Mortar Team",
  "settings": {
    "primary_color": "#dc2626",
    "background": "#fafaf9",
    "text_color": "#1c1917",
    "link_color": "#dc2626",
    "heading_font": "serif",
    "body_font": "system",
    "sidebar_position": "left",
    "posts_per_row": "1"
  },
  "custom_css": "article { border-radius: 12px; }"
}
```

## Settings

| Key | Type | Effect |
|-----|------|--------|
| `primary_color` | hex | Accent color (buttons, links, indicators) |
| `background` | hex | Page background |
| `text_color` | hex | Body text color |
| `link_color` | hex | Link color |
| `heading_font` | `system` / `serif` / `sans` | Heading font family |
| `body_font` | `system` / `serif` / `sans` | Body font family |
| `sidebar_position` | `right` / `left` / `none` | Homepage sidebar placement |
| `posts_per_row` | 1–3 | Homepage grid columns |

Settings are exposed to the frontend as CSS variables
(`--primary-color`, `--background`, `--text-color`, `--link-color`,
`--heading-font`, `--body-font`).

## Per-theme overrides

Admins edit a theme's settings in **Appearance**. Overrides are stored per
theme (`theme_<name>_<key>` in the settings table), so switching themes
restores each theme's own values.

## Custom CSS

`custom_css` is injected into the page head as a `<style>` tag. Use it for
typography tweaks, component styling, and responsive adjustments. It applies
regardless of light/dark mode unless scoped.

## Template system (WordPress-style)

A theme is more than colors — it can override **layout templates**. Each
theme lives in `frontend/src/themes/<name>/` and provides React layout
components:

```
frontend/src/themes/<name>/
├── Header.tsx      # site header template
├── Footer.tsx      # site footer template
├── HomeLayout.tsx  # homepage template (list + sidebar)
├── PostLayout.tsx  # single post template (title, meta, content, comments)
└── PageLayout.tsx  # static page template
```

Layouts receive props from the page controllers, e.g. `HomeLayout` gets
`{ settings, posts, total, page, setPage, ... }`, `PostLayout` gets
`{ settings, post, comments, submitComment, ... }` — so themes fully control
the rendered structure while the system handles data, SEO and auth.

### Fallback

Themes can be **partial**: any layout they do not export falls back to the
`default` theme automatically. Add a theme with just `Header.tsx` +
`HomeLayout.tsx` and the rest keeps working.

### Registration

Themes register in `frontend/src/themes/index.ts`:

```ts
import MyHeader from './mytheme/Header';
import MyHomeLayout from './mytheme/HomeLayout';

const themes = {
  default: { ... },
  mytheme: { name: 'mytheme', Header: MyHeader, HomeLayout: MyHomeLayout },
};
```

Activation is instant: switch the active theme in the admin (Appearance →
Themes) and the frontend renders the new templates on the next load.

## How it reaches the frontend

1. `GET /api/themes` — theme list with effective settings
2. `POST /api/themes/:name/activate` — switch active theme
3. Public `GET /api/settings` merges the active theme (`theme_name`,
   `theme_*` settings, `theme_custom_css`)
4. The frontend injects CSS variables + custom CSS and repositions the
   sidebar per `sidebar_position`

## Built-in themes

| Theme | Style |
|-------|-------|
| `default` | Clean minimal, indigo accent, right sidebar |
| `magazine` | Serif headings, red accent, left sidebar |
| `minimal` | Monochrome, generous whitespace |
| `dark` | Dark UI for night reading |
| `newspaper` | Classic serif masthead, paper background |

Add your own theme by creating a folder with a valid `theme.json` — no
code changes required for settings-based theming.
