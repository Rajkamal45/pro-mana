// tailwind.config.js
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',      // App Router directory
    './pages/**/*.{js,ts,jsx,tsx}',    // Pages directory (if used)
    './components/**/*.{js,ts,jsx,tsx}', // Components directory
    './layouts/**/*.{js,ts,jsx,tsx}', // Layouts directory (if used)
    './public/**/*.{js,ts,jsx,tsx}',   // Public assets (if Tailwind classes are used here)
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
