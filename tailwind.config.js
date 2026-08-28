/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          950: '#0E1116',
          900: '#161B22',
          800: '#1F2630',
          700: '#2B3440',
          600: '#3D4857',
          400: '#7C8A9C',
          200: '#C7CFD9',
          100: '#EEF1F5',
        },
        signal: {
          DEFAULT: '#5B6EF5',
          soft: 'rgba(91, 110, 245, 0.15)',
          strong: '#4351C9',
        },
        good: {
          DEFAULT: '#1F9D6B',
          soft: 'rgba(31, 157, 107, 0.15)',
        },
        warn: {
          DEFAULT: '#D68A1F',
          soft: 'rgba(214, 138, 31, 0.15)',
        },
        bad: {
          DEFAULT: '#D6483F',
          soft: 'rgba(214, 72, 63, 0.15)',
        },
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        body: ['"Inter"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        '2xl': '1.25rem',
      },
    },
  },
  plugins: [],
}