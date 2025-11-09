/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'audit-blue': '#0a0e27',
        'audit-electric': '#6366f1',
        'audit-purple': '#8b5cf6',
        'audit-green': '#10b981',
        'audit-red': '#ef4444',
      },
      fontFamily: {
        'display': ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
