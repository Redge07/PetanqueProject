/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx}", "./components/**/*.{js,jsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#1e3a5f",
        "primary-light": "#2d5a8a",
        "primary-dark": "#152a45",
        gold: "#d4af37",
        "gold-dark": "#c9a227",
        bg: "#faf8f5",
        "bg-mid": "#f5f0e8",
        "bg-dark": "#ebe4d8",
        border: "#e5e7eb",
      },
    },
  },
  plugins: [],
};
