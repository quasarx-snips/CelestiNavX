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
          950: '#0a0a0a', // deepest dark background
          900: '#141414', // main app background  
          800: '#1e1e1e', // card backgrounds
          700: '#2a2a2a', // elevated surfaces
          600: '#3a3a3a', // borders and dividers
          500: '#6a6a6a', // disabled text
          400: '#9a9a9a', // secondary text
          300: '#c4c4c4', // primary text on dark
          200: '#e8e8e8', // high contrast text
          100: '#ffffff'  // pure white for emphasis
        },
        accent: {
          orange: '#F26207', // Official Replit Orange
          'orange-light': '#FF7A2B', // Lighter variant
          'orange-dark': '#D44B00',  // Darker variant
          green: '#00D26A',  // Replit success green
          blue: '#0099FF',   // Replit blue
          red: '#FF5555',    // Error red
          yellow: '#FFB800', // Warning yellow
          purple: '#8B5CF6' // Purple accent
        },
        text: {
          primary: '#e8e8e8',   // high contrast on dark
          secondary: '#9a9a9a', // secondary content
          muted: '#6a6a6a',     // disabled/placeholder
          inverse: '#1e1e1e'    // text on light backgrounds
        }
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgba(0, 0, 0, 0.2), 0 1px 2px 0 rgba(0, 0, 0, 0.12)',
        'card-hover': '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.18)',
        'card-active': '0 1px 2px 0 rgba(0, 0, 0, 0.15)',
        'glow': '0 0 20px rgba(88, 166, 255, 0.15)',
        'glow-strong': '0 0 30px rgba(88, 166, 255, 0.25)'
      },
      animation: {
        'pulse-slow': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        'slide-up': 'slideUp 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        'scale-in': 'scaleIn 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        'bounce-subtle': 'bounceSubtle 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(16px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        bounceSubtle: {
          '0%': { transform: 'scale(0.95)' },
          '50%': { transform: 'scale(1.02)' },
          '100%': { transform: 'scale(1)' },
        },
      },
      borderRadius: {
        'card': '8px',     // Replit uses more subtle rounded corners
        'card-lg': '12px',
        'button': '6px',   // buttons slightly less rounded
      },
      fontFamily: {
        'sans': [
          'ui-sans-serif',
          'system-ui', 
          '-apple-system',
          'BlinkMacSystemFont',
          'Inter',
          'sans-serif'
        ],
      },
    },
  },
  plugins: [],
}