/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fdf8e7',
          100: '#faedc0',
          200: '#f6dd85',
          300: '#f5c518',
          400: '#f0b90b',
          500: '#d9a509',
          600: '#b38507',
          700: '#8c6706',
          800: '#654a04',
          900: '#3d2c03',
          950: '#1f1601',
        },
        surface: {
          DEFAULT: '#0d0c0a',
          card: '#151310',
          hover: '#1a1815',
          border: 'rgba(255,255,255,0.06)',
        },
      },
      fontFamily: {
        sans: ['Nunito', 'Inter', 'sans-serif'],
        display: ['Baloo 2', 'Nunito', 'sans-serif'],
      },
      borderRadius: {
        pill: '9999px',
      },
    },
  },
  plugins: [],
}
