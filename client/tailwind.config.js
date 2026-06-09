/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        /* ── Semantic color utilities ───────────────────────────
           All values come from CSS custom properties in
           src/styles/tokens.css. The <alpha-value> placeholder
           lets Tailwind opacity modifiers work (e.g. bg-primary/10).
        ─────────────────────────────────────────────────────── */
        primary:         'rgb(var(--color-primary)        / <alpha-value>)',
        'primary-hover': 'rgb(var(--color-primary-hover)  / <alpha-value>)',
        'on-primary':    'rgb(var(--color-on-primary)     / <alpha-value>)',
        surface:         'rgb(var(--color-surface)        / <alpha-value>)',
        'surface-alt':   'rgb(var(--color-surface-alt)    / <alpha-value>)',
        bg:              'rgb(var(--color-bg)              / <alpha-value>)',
        text:            'rgb(var(--color-text)            / <alpha-value>)',
        muted:           'rgb(var(--color-text-muted)      / <alpha-value>)',
        border:          'rgb(var(--color-border)          / <alpha-value>)',
        'focus-ring':    'rgb(var(--color-focus-ring)      / <alpha-value>)',
        success:         'rgb(var(--color-success)         / <alpha-value>)',
        warning:         'rgb(var(--color-warning)         / <alpha-value>)',
        danger:          'rgb(var(--color-danger)          / <alpha-value>)',
        info:            'rgb(var(--color-info)            / <alpha-value>)',
        overlay:         'rgb(var(--color-overlay)         / <alpha-value>)',
      },
    },
  },
  plugins: [],
};
