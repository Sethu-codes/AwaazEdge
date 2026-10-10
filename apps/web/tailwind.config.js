/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        teal: {
          50: '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0d9488',
          700: '#0f766e', // Deep teal primary
          800: '#115e59',
          900: '#134e4a',
          950: '#042f2e'
        },
        urgency: {
          critical: {
            bg: '#fef2f2',
            border: '#fecaca',
            text: '#991b1b',
            badge: '#ef4444',
            darkBg: '#450a0a',
            darkText: '#fca5a5'
          },
          high: {
            bg: '#fff7ed',
            border: '#ffedd5',
            text: '#9a3412',
            badge: '#f97316',
            darkBg: '#431407',
            darkText: '#fdba74'
          },
          medium: {
            bg: '#fffbeb',
            border: '#fef3c7',
            text: '#92400e',
            badge: '#f59e0b',
            darkBg: '#451a03',
            darkText: '#fde68a'
          },
          low: {
            bg: '#f8fafc',
            border: '#e2e8f0',
            text: '#334155',
            badge: '#64748b',
            darkBg: '#0f172a',
            darkText: '#94a3b8'
          }
        }
      },
      fontFamily: {
        sans: [
          'Inter',
          '"Noto Sans Gujarati"',
          '"Noto Sans Devanagari"',
          '-apple-system',
          'BlinkMacSystemFont',
          'system-ui',
          'sans-serif'
        ]
      }
    }
  },
  plugins: []
};
