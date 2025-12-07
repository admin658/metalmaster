/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        metal: {
          900: "#0f0f11",
          accent: "#ff6b35",
        }
      }
    }
  }
};