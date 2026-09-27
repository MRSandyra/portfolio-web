/** @type {import('tailwindcss').Config} */

/* Ash - warm carbon neutral ramp. Replaces Tailwind's cool slate + the old indigo "navy". */
const ash = {
  50: '#FAF9F7',
  100: '#F2F0EB',
  200: '#E4E1DA',
  300: '#CDC8BE',
  400: '#A6A096',
  500: '#7D776D',
  600: '#5C5651',
  700: '#443F3A',
  800: '#2A2623',
  900: '#191613',
  950: '#0F0D0B',
};

/* Ferro - the single accent. Rust / vermilion. */
const ferro = {
  50: '#FDF4F0',
  100: '#FAE4DB',
  200: '#F4C6B4',
  300: '#EC9F84',
  400: '#E07C58',
  500: '#CE5B34',
  600: '#B04525',
  700: '#8E361C',
  800: '#6E2A16',
  900: '#4E1F11',
};

/* Semantic - reserved meaning, never reused as a chart series colour. */
const semantic = {
  good: '#0ca30c',
  'good-text': '#006300',
  warning: '#fab219',
  serious: '#ec835a',
  critical: '#d03b3b',
};

/* Chart series - documented data-viz hexes, orange-lead order.
   Validated in both modes: worst adjacent CVD dE 7.2 light / 8.6 dark,
   normal-vision 19.6 / 19.3. First three slots also clear the all-pairs gate. */
const series = {
  1: '#eb6834',
  2: '#2a78d6',
  3: '#1baf7a',
  '1-dark': '#d95926',
  '2-dark': '#3987e5',
  '3-dark': '#199e70',
};

export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        ash,
        ferro,
        ...semantic,
        series,
        /* Back-compat alias so any stray `navy-*` class keeps resolving to the
           new neutral instead of silently falling back to transparent. */
        navy: ash,
      },
      fontFamily: {
        display: ['"DM Serif Display"', 'Georgia', 'serif'],
        body: ['"DM Sans"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      /* Modular scale, ratio ~1.22. 2xl / 5xl / 6xl / 7xl are the steps the old
         scale was missing, which is why 36px jumped straight to 72px. */
      fontSize: {
        xs: ['0.75rem', { lineHeight: '1.5' }],
        sm: ['0.875rem', { lineHeight: '1.6' }],
        base: ['1rem', { lineHeight: '1.65' }],
        lg: ['1.125rem', { lineHeight: '1.65' }],
        xl: ['1.25rem', { lineHeight: '1.5' }],
        '2xl': ['1.5rem', { lineHeight: '1.3' }],
        '3xl': ['1.875rem', { lineHeight: '1.2' }],
        '4xl': ['2.25rem', { lineHeight: '1.12' }],
        '5xl': ['2.75rem', { lineHeight: '1.08' }],
        '6xl': ['3.375rem', { lineHeight: '1.06' }],
        '7xl': ['4.125rem', { lineHeight: '1.04' }],
        '8xl': ['5rem', { lineHeight: '1' }],
      },
      /* Fluid display sizes - these never overflow at 320px. */
      spacing: {
        'section-sm': '4rem',
        section: '6rem',
        'section-lg': '8.5rem',
      },
      borderRadius: {
        s: '6px',
        m: '12px',
        l: '20px',
      },
      boxShadow: {
        /* Tinted warm, matching the surface hue - never pure black. */
        low: '0 1px 2px rgb(28 20 14 / 0.08)',
        mid: '0 4px 14px -4px rgb(28 20 14 / 0.14)',
        high: '0 12px 34px -12px rgb(28 20 14 / 0.22)',
      },
      transitionTimingFunction: {
        settle: 'cubic-bezier(.16,1,.3,1)',
        io: 'cubic-bezier(.65,0,.35,1)',
      },
      transitionDuration: {
        tap: '120ms',
        ui: '200ms',
        slow: '320ms',
        reveal: '560ms',
      },
      maxWidth: {
        measure: '46ch',
        prose: '68ch',
      },
    },
  },
  plugins: [],
};
