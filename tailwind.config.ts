import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: '#0a0a0a',
          secondary: '#111111',
          tertiary: '#1a1a1a',
        },
        gold: {
          primary: '#D4AF37',
          bright: '#FFD700',
          dim: '#8B7536',
          glow: 'rgba(212, 175, 55, 0.25)',
        },
        text: {
          primary: '#FFFFFF',
          secondary: '#B0B0B0',
          gold: '#D4AF37',
        },
        danger: '#C0392B',
        success: '#27AE60',
      },
      fontFamily: {
        cinzel: ['var(--font-cinzel)', 'serif'],
        inter: ['var(--font-inter)', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
export default config;
