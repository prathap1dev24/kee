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
          50: '#f0f0fe',
          100: '#e0e1fc',
          200: '#c2c3f9',
          300: '#a5a7f6',
          400: '#7c3aed',
          500: '#4f46e5',
          600: '#4338ca',
          700: '#3730a3',
          800: '#2e2879',
          900: '#241f57',
          950: '#161235',
        },
        surface: {
          DEFAULT: '#eef1f7',
          card: '#ffffff',
          hover: '#f4f6fb',
          border: 'rgba(30,41,59,0.08)',
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
