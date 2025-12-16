/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0f172a",
        mint: "#0dd3b8",
        sand: "#f8fafc"
      }
    }
  },
  plugins: []
};
