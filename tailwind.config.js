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
          900: '#0f1419',
          800: '#1a1a2e', 
          700: '#16213e',
          600: '#2c3856',
          500: '#3e4c76',
          400: '#5d9eeb',
          300: '#7fb3f0',
          200: '#a1c8f5',
          100: '#c3ddfa'
        },
        accent: {
          orange: '#ff6b35',
          green: '#2ecc71',
          blue: '#4a90e2',
          red: '#e74c3c',
          yellow: '#f39c12'
        },
        text: {
          primary: '#e9e9f0',
          secondary: '#929ebd',
          muted: '#6b7280'
        }
      }
    },
  },
  plugins: [],
}