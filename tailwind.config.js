/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        industrial: {
          950: '#0b0f17',
          900: '#0b0f19',
          850: '#111827',
          800: '#172033',
          700: '#273449',
        },
        brand: {
          50: '#edfdf7',
          100: '#d1fae5',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
        },
        night: {
          950: '#0b0f17',
          900: '#0b0f19',
          800: '#111827',
        },
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(52, 211, 153, 0.18), 0 20px 60px rgba(16, 185, 129, 0.16)',
      },
      animation: {
        float: 'float 8s ease-in-out infinite',
        pulseSoft: 'pulseSoft 3s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.65' },
        },
      },
    },
  },
  plugins: [],
}
