/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      /* ── Semantic color utilities ───────────────────────────
         All values come from CSS custom properties in
         src/styles/tokens.css. The <alpha-value> placeholder
         lets Tailwind opacity modifiers work (e.g. bg-primary/10).
      ─────────────────────────────────────────────────────── */
      colors: {
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

      /* ── 8-px grid spacing extras ───────────────────────────
         Tailwind's default scale covers 0–96 in 4-px steps.
         These named aliases make intent explicit in components.
      ─────────────────────────────────────────────────────── */
      spacing: {
        '4.5': '1.125rem',  /* 18px — between p-4 (16) and p-5 (20) */
        '18':  '4.5rem',    /* 72px */
        '22':  '5.5rem',    /* 88px */
      },

      /* ── Border-radius scale ────────────────────────────────
         Design-system radii. Components should use these names.
           btn / input : rounded-lg  (8 px)
           card        : rounded-xl  (12 px)
           modal       : rounded-2xl (16 px)
           badge / pill: rounded-full
      ─────────────────────────────────────────────────────── */
      borderRadius: {
        'btn':   '0.5rem',    /* 8px  — buttons, inputs, small chips */
        'card':  '0.75rem',   /* 12px — cards, panels, table wrappers */
        'panel': '1rem',      /* 16px — modals, large surfaces         */
      },

      /* ── Typography scale ───────────────────────────────────
         Use these consistent text sizes across all components.
           page-title   → h1 on full pages
           section-title→ h2 within sections
           card-title   → h3 inside cards
           label        → form labels / table headers
           caption      → secondary / helper text
      ─────────────────────────────────────────────────────── */
      fontSize: {
        'page-title':    ['2.25rem', { lineHeight: '2.5rem',  fontWeight: '800' }],
        'section-title': ['1.5rem',  { lineHeight: '2rem',    fontWeight: '700' }],
        'card-title':    ['1.125rem',{ lineHeight: '1.75rem', fontWeight: '700' }],
        'label':         ['0.875rem',{ lineHeight: '1.25rem', fontWeight: '600' }],
        'caption':       ['0.75rem', { lineHeight: '1rem',    fontWeight: '400' }],
      },

      /* ── Container / breakpoints ─────────────────────────── */
      maxWidth: {
        'content': '80rem',  /* 1280px — same as max-w-7xl, named alias */
      },

      /* ── Responsive hero height ─────────────────────────── */
      height: {
        'hero-sm': '420px',
        'hero-md': '520px',
        'hero-lg': '600px',
      },
    },
  },
  plugins: [],
};
