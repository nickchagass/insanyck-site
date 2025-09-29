import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/sections/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // Cores personalizadas INSANYCK via CSS vars
      colors: {
        'bg': {
          0: 'var(--bg-0)',
          1: 'var(--bg-1)',
          2: 'var(--bg-2)',
        },
        'text': {
          primary: 'var(--text-primary)',
          secondary: 'var(--text-secondary)',
          muted: 'var(--text-muted)',
        },
        'stroke': {
          DEFAULT: 'var(--stroke-default)',
          hover: 'var(--stroke-hover)',
        },
        'glass': {
          weak: 'var(--glass-weak)',
          medium: 'var(--glass-medium)',
          strong: 'var(--glass-strong)',
        },
        'gold': {
          300: 'var(--gold-300)',
          400: 'var(--gold-400)',
          500: 'var(--gold-500)',
        },
        'brand': 'var(--brand)',
      },
      // Tipografia
      fontFamily: {
        sans: 'var(--font-body)',
        display: 'var(--font-display)',
        mono: 'var(--font-mono)',
      },
      // Sombras
      boxShadow: {
        'sm': 'var(--shadow-sm)',
        'md': 'var(--shadow-md)',
        'lg': 'var(--shadow-lg)',
        'xl': 'var(--shadow-xl)',
        'glow': 'var(--shadow-glow)',
        'glow-strong': 'var(--shadow-glow-strong)',
      },
      // Animações
      transitionTimingFunction: {
        'premium': 'var(--ease-premium)',
        'spring': 'var(--spring)',
      },
      transitionDuration: {
        'fast': 'var(--duration-fast)',
        'normal': 'var(--duration-normal)',
        'slow': 'var(--duration-slow)',
      },
    },
  },
  plugins: [],
};

export default config;