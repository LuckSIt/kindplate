/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Включаем dark mode через класс
  theme: {
    fontFamily: {
      'sans': ['var(--font-sans)'],
      'display': ['var(--font-display)'],
      'body': ['var(--font-sans)'],
    },
    extend: {
      borderRadius: {
        'sm': '8px',
        'md': '12px',
        'lg': '16px',
        'xl': '24px',
        '2xl': '28px',
      },
      spacing: {
        '1': '4px',
        '1.5': '6px',
        '2': '8px',
        '2.5': '10px',
        '3': '12px',
        '3.5': '14px',
        '4': '16px',
        '5': '20px',
        '6': '24px',
        '7': '28px',
        '8': '32px',
      },
      fontSize: {
        'xs': ['12px', { lineHeight: '18px' }],
        'sm': ['14px', { lineHeight: '20px' }],
        'base': ['16px', { lineHeight: '24px' }],
        'lg': ['18px', { lineHeight: '26px' }],
        'xl': ['20px', { lineHeight: '28px' }],
        '2xl': ['24px', { lineHeight: '30px' }],
        '3xl': ['28px', { lineHeight: '34px' }],
      },
      colors: {
        // Современная цветовая схема в стиле ResQ Club
        'primary': {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e', // Основной зеленый
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
          950: '#052e16',
        },
        'accent': {
          50: '#fef7ff',
          100: '#fceeff',
          200: '#f8ddff',
          300: '#f2bbff',
          400: '#e879f9',
          500: '#d946ef', // Фиолетовый акцент
          600: '#c026d3',
          700: '#a21caf',
          800: '#86198f',
          900: '#701a75',
          950: '#4a044e',
        },
        'warm': {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316', // Оранжевый для акцентов
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
          950: '#431407',
        },
        // Кастомные цвета для темной темы
        'dark-bg': '#0f172a',
        'dark-card': '#1e293b',
        'dark-border': '#334155',
        'dark-text': '#f8fafc',
        'dark-text-secondary': '#cbd5e1',
      }
    },
  },
  plugins: [],
}

