import type { Config } from 'tailwindcss';

export default {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        nyvex: {
          bg: '#090512',
          card: '#111029',
          neon: '#7c3aed',
          cyan: '#22d3ee'
        }
      },
      boxShadow: {
        neon: '0 0 40px rgba(124,58,237,.4)'
      }
    }
  },
  plugins: []
} satisfies Config;
