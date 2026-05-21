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
        'flash-border': 'flashBorder 0.5s ease-in-out infinite alternate',
        'spin-slow': 'spin 3s linear infinite',
      },
      keyframes: {
        flashBorder: {
          '0%': { borderColor: '#F59E0B', boxShadow: '0 0 0 4px rgba(245,158,11,0.4)' },
          '100%': { borderColor: '#FBBF24', boxShadow: '0 0 0 8px rgba(245,158,11,0.1)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
