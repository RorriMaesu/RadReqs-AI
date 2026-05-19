/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./index.html",
    "./syngnosia/index.html",
    "./syngnosia/app.js",
    "./syngnosia/data.js",
    "./chemistry/**/*.{html,js}"
  ],
  theme: {
    extend: {
      fontFamily: { sans: ['Inter', 'sans-serif'] },
      colors: {
        slate: { 850: '#151e2e', 900: '#0f172a', 950: '#020617' }
      }
    }
  },
  plugins: [],
}
