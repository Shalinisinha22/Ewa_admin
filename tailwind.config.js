/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f9e6e6',
          100: '#f3cccd',
          200: '#e7999a',
          300: '#db6667',
          400: '#cf3334',
          500: '#c30001', // Main primary color
          600: '#9c0001',
          700: '#750001',
          800: '#4e0000',
          900: '#270000',
        },
        secondary: {
          50: '#f1f1f1',
          100: '#e3e3e3',
          200: '#c7c7c7',
          300: '#ababab',
          400: '#8f8f8f',
          500: '#737373',
          600: '#5a5a5a',
          700: '#414141',
          800: '#292929', // Main secondary color
          900: '#121212',
        },
      },
      fontFamily: {
        sans: ['"Inter"', 'system-ui', '-apple-system', 'sans-serif'],
        heading: ['"Poppins"', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
};