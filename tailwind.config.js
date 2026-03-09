/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Amazonia Concrete brand palette
        amazonia: {
          50:  '#f2f7f0',
          100: '#e0ecd9',
          200: '#c2d9b4',
          300: '#97be82',
          400: '#6ea050',
          500: '#527d36',
          600: '#3d6227',
          700: '#2d4a1e',  // dark forest — primary actions
          800: '#1e3315',  // deeper green
          900: '#12200d',  // darkest — sidebar bg
          950: '#0a1408',
        },
        earth: {
          400: '#a87050',
          500: '#8b5e3c',  // warm brown accent
          600: '#6f4a2a',
        },
        stone: {
          50:  '#f9f7f2',
          100: '#f0ece2',
          200: '#e0d9c8',
          300: '#c8c0a8',
          400: '#a89e86',
        },
        // keep primary alias pointing to amazonia-700
        primary: {
          50:  '#f2f7f0',
          100: '#e0ecd9',
          500: '#527d36',
          600: '#3d6227',
          700: '#2d4a1e',
          800: '#1e3315',
          900: '#12200d',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
