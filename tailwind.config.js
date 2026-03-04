/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eefcf8',
          100: '#d5f7ed',
          200: '#aeefde',
          300: '#79e2c9',
          400: '#43ccaf',
          500: '#22b09a',
          600: '#168f7d',
          700: '#147366',
          800: '#155b52',
          900: '#164b44',
          950: '#062d28',
        },
      },
    },
  },
  plugins: [],
}
