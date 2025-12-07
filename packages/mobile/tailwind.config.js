/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        metal: {
          900: '#18181b',
          800: '#27272a',
          700: '#3f3f46',
          accent: '#b91c1c',
        },
      },
    },
  },
  plugins: [],
};
