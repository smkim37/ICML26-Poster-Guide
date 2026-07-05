/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        accent: { DEFAULT: '#2A419E', dark: '#8B9FE8' },
        tier: {
          core: { DEFAULT: '#059669', dark: '#34d399' },
          related: { DEFAULT: '#2563eb', dark: '#60a5fa' },
          reference: { DEFAULT: '#d97706', dark: '#fbbf24' },
        },
      },
      fontFamily: {
        sans: [
          '-apple-system', 'BlinkMacSystemFont', '"Apple SD Gothic Neo"',
          '"Pretendard Variable"', 'Pretendard', '"Noto Sans KR"',
          '"Segoe UI"', 'Roboto', 'sans-serif',
        ],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Consolas', 'monospace'],
      },
    },
  },
  plugins: [],
}
