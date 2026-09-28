/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      // The frontend uses `*-primary-*` utilities throughout (buttons, links,
      // widgets, accents). They resolve to CSS variables rather than fixed hexes,
      // so the colour an operator sets in Appearance reaches them — the palette
      // used to be ten hard-coded values here, which no setting could change.
      //
      // Triplets, not plain colours: Tailwind's opacity modifier needs the
      // `<alpha-value>` form, and the UI uses `bg-primary-500/10` and
      // `bg-primary-900/30`. The values are generated from one colour by
      // src/lib/themeColor.ts and written to :root by index.css (defaults) and by
      // the app / the server renderer (theme settings).
      colors: {
        primary: {
          50: 'rgb(var(--primary-50) / <alpha-value>)',
          100: 'rgb(var(--primary-100) / <alpha-value>)',
          200: 'rgb(var(--primary-200) / <alpha-value>)',
          300: 'rgb(var(--primary-300) / <alpha-value>)',
          400: 'rgb(var(--primary-400) / <alpha-value>)',
          500: 'rgb(var(--primary-500) / <alpha-value>)',
          600: 'rgb(var(--primary-600) / <alpha-value>)',
          700: 'rgb(var(--primary-700) / <alpha-value>)',
          800: 'rgb(var(--primary-800) / <alpha-value>)',
          900: 'rgb(var(--primary-900) / <alpha-value>)',
        },
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};
