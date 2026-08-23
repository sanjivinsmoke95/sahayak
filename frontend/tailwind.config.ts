import type { Config } from 'tailwindcss';

/**
 * The palette is carried over unchanged from the prototype. Government
 * paperwork is stressful enough without a redesign, and the contrast ratios
 * here were chosen for readers with weak eyesight.
 */
const config: Config = {
  darkMode: ['class'],
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './hooks/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        ink: '#132339',
        muted: '#4A5D75',
        paper: '#F6F8FC',
        navy: {
          50: '#EFF5FD', 100: '#DCE9F9', 200: '#BCD4F1', 300: '#8DB4E4',
          400: '#4C82C6', 500: '#2A62A8', 600: '#1B4B8F', 700: '#143A70', 800: '#102D57',
        },
        leaf:   { 50: '#ECF7F1', 100: '#D3EDE0', 600: '#1E7A4B', 700: '#175F3B' },
        amberx: { 50: '#FEF6E7', 100: '#FCE9C4', 600: '#9A6206', 700: '#7A4E05' },
        alert:  { 50: '#FDEEEC', 100: '#FBD9D4', 600: '#B3261E', 700: '#8C1D17' },
      },
      fontFamily: {
        sans: [
          'Inter',
          'Noto Sans Devanagari', 'Noto Sans Telugu',
          'system-ui', '-apple-system', 'Segoe UI', 'sans-serif',
        ],
      },
      boxShadow: {
        soft: '0 1px 2px rgba(19,35,57,.05), 0 8px 24px -12px rgba(19,35,57,.18)',
        lift: '0 2px 4px rgba(19,35,57,.06), 0 18px 40px -18px rgba(19,35,57,.28)',
      },
      borderRadius: { xl2: '1.25rem' },
      keyframes: {
        rise: { from: { opacity: '0', transform: 'translateY(10px)' }, to: { opacity: '1', transform: 'none' } },
        pulsering: {
          '0%':   { boxShadow: '0 0 0 0 rgba(27,75,143,.35)' },
          '70%':  { boxShadow: '0 0 0 22px rgba(27,75,143,0)' },
          '100%': { boxShadow: '0 0 0 0 rgba(27,75,143,0)' },
        },
        shimmer: { '100%': { transform: 'translateX(100%)' } },
      },
      animation: {
        rise: 'rise .45s ease-out both',
        pulsering: 'pulsering 1.6s infinite',
        shimmer: 'shimmer 1.3s infinite',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;
