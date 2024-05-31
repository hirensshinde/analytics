/** @type {import('tailwindcss').Config} */

module.exports = {
  darkMode: 'selector',
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./node_modules/react-tailwindcss-datepicker/dist/index.esm.js",
    './public/index.html',
  ],
  theme: {
    extend: {},
  },
  variants: {
    extend: {}, 
  },
  plugins: [],
};
