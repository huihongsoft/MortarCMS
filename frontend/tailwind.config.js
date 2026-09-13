/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      // The frontend uses `*-primary-*` utilities throughout (install logo,
      // step indicators, buttons, widgets). Without this palette those classes
      // are never generated, so e.g. white text on `bg-primary-600` renders
      // white-on-white. Kept in sync with admin/tailwind.config.js.
      colors: {
        primary: { 50: '#eff6ff', 100: '#dbeafe', 200: '#bfdbfe', 300: '#93c5fd', 400: '#60a5fa', 500: '#3b82f6', 600: '#2563eb', 700: '#1d4ed8', 800: '#1e40af', 900: '#1e3a8a' },
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};
