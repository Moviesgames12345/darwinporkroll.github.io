/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./*.html", "./assets/js/**/*.js"],
  theme: { extend: {} },
  plugins: [require('@tailwindcss/typography'), require('@tailwindcss/forms')]
};
