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
          soft: '#EDEFFE',
          strong: '#4351C9',
        },
        good: '#1F9D6B',
        warn: '#D68A1F',
        bad: '#D6483F',
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        body: ['"Inter"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        xl2: '1.25rem',
      },
    },
  },
  plugins: [],
}
