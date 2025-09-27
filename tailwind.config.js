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
      },
      boxShadow: {
        'card': '0 2px 8px rgba(0, 0, 0, 0.15), 0 0 1px rgba(255, 255, 255, 0.05)',
        'card-hover': '0 4px 16px rgba(0, 0, 0, 0.2), 0 0 1px rgba(255, 255, 255, 0.1)',
        'card-active': '0 1px 4px rgba(0, 0, 0, 0.2)',
      },
      animation: {
        'pulse-slow': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      borderRadius: {
        'card': '12px',
        'card-lg': '16px',
      },
    },
  },
  plugins: [],
}