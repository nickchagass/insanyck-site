// INSANYCK FASE G-04.2 — Tailwind config com Design System tokens (white-label ready)
import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/sections/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // INSANYCK FASE G-04.2 — Design System colors (token-based, white-label ready)
      colors: {
        ds: {
          // Surfaces
          surface: 'var(--ds-surface)',
          elevated: 'var(--ds-elevated)',
          surfaceSoft: 'var(--ds-surface-soft)',

          // Borders
          borderSubtle: 'var(--ds-border-subtle)',
          borderStrong: 'var(--ds-border-strong)',

          // Accents
          accent: 'var(--ds-accent)',
          accentSoft: 'var(--ds-accent-soft)',

          // Status
          danger: 'var(--ds-danger)',
          dangerSoft: 'var(--ds-danger-soft)',

          // Focus
          focus: 'var(--ds-focus-ring)',
        },
      },

      // INSANYCK FASE G-04.2 — Design System border radius
      borderRadius: {
        'ds-sm': 'var(--ds-radius-sm)',
        'ds-md': 'var(--ds-radius-md)',
        'ds-lg': 'var(--ds-radius-lg)',
        'ds-pill': 'var(--ds-radius-pill)',
      },

      // INSANYCK FASE G-04.2 — Design System shadows
      boxShadow: {
        'ds-1': 'var(--ds-shadow-1)',
        'ds-2': 'var(--ds-shadow-2)',
      },
    },
  },
  plugins: [],
};

export default config;