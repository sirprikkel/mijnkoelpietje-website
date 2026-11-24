import type { Config } from 'tailwindcss';

// Zelfde thema als de oude inline tailwind.config in index.html (Tailwind 3.4.17).
const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Poiret One', 'sans-serif'],
        sans: ['Didact Gothic', 'sans-serif'],
        mono: ['Space Mono', 'monospace'],
      },
      colors: {
        geel: '#f5c400',
        'geel-dim': '#c49e00',
        zwart: '#000000',
        donker: '#0a0a0a',
        oppervlak: '#121212',
        grijs: '#1a1a1a',
        tekst: '#e8e8e8',
      },
    },
  },
  plugins: [],
};
export default config;
