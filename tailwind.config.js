/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        'primary': '#4A90E2',
        'primary-dark': '#357ABD',
        'primary-light': '#6BA3E8',
        'secondary': '#50C878',
        'danger': '#E74C3C',
        'warning': '#F39C12',
      }
    },
  },
  plugins: [],
}
