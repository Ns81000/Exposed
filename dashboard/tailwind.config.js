/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#09090B',
        surface: '#111111',
        raised: '#1A1A1A',
        border: '#242424',
        text: '#FAFAFA',
        secondary: '#A1A1AA',
        muted: '#52525B',
        riskHigh: '#DC2626',
        riskMedium: '#D97706',
        riskLow: '#2563EB'
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'Segoe UI', 'sans-serif']
      }
    }
  },
  plugins: []
};
