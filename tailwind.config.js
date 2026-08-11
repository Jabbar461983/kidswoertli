/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'longchamp-black': '#1a1a1a',
        'longchamp-gold': '#d4af37',
        'longchamp-ivory': '#f5f1e8',
        'longchamp-dark-gold': '#b8860b',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
  darkMode: 'class',
}
