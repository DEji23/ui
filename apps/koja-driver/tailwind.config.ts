import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        koja: {
          bg: '#0A0F1E',
          card: '#111827',
          border: '#1F2937',
          amber: '#F59E0B',
          green: '#22C55E',
          red: '#EF4444',
          muted: '#9CA3AF',
        },
      },
      animation: {
        'pulse-slow': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'border-flash': 'borderFlash 0.8s ease-in-out infinite',
      },
      keyframes: {
        borderFlash: {
          '0%, 100%': { borderColor: '#F59E0B', boxShadow: '0 0 0 4px rgba(245,158,11,0.5)' },
          '50%': { borderColor: 'transparent', boxShadow: 'none' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
