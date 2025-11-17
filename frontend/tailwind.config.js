/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", // all React components
    "./node_modules/flowbite/**/*.js", // include Flowbite JS
    "./public/index.html"          // HTML entry
  ],
  theme: {
    extend: {
    fontFamily: {
      aeonik: ["Aeonik", "sans-serif"],
      antelope: ["Antelope", "serif"],
      timernis: ["Timernis", "serif"],
      balkey: ["Balkey", "serif"],
      sohneBreit: ["SohneBreit", "serif"],
    },
  },
  },
  plugins: [
    require('flowbite/plugin')
  ],
}
