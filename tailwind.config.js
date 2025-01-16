/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "media",
  content: [
    "App.{tsx,jsx,ts,js}",
    "index.{tsx,jsx,ts,js}",
    "src/**/*.{tsx,jsx,ts,js}",
    "components/**/*.{tsx,jsx,ts,js}",
  ],
  presets: [require('nativewind/preset')],
};
