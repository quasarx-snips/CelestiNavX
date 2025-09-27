/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Modern mobile app background colors
        background: {
          primary: '#6366F1',      // Main purple background
          secondary: '#8B5CF6',    // Secondary purple  
          gradient: {
            start: '#4F46E5',     // Gradient start (indigo)
            middle: '#7C3AED',    // Gradient middle (violet)
            end: '#8B5CF6'        // Gradient end (purple)
          }
        },
        // Card and surface colors
        surface: {
          50: '#F8FAFC',          // Lightest surface (white cards)
          100: '#F1F5F9',         // Very light surface
          200: '#E2E8F0',         // Light surface
          300: '#CBD5E1',         // Medium light surface
          400: '#94A3B8',         // Medium surface
          500: '#64748B',         // Neutral surface
          600: '#475569',         // Dark surface
          700: '#334155',         // Darker surface
          800: '#1E293B',         // Very dark surface
          900: '#0F172A'          // Darkest surface
        },
        // Vibrant accent colors for mobile UI
        accent: {
          primary: '#6366F1',     // Primary purple
          secondary: '#EC4899',   // Pink accent
          success: '#10B981',     // Green success
          warning: '#F59E0B',     // Orange warning  
          error: '#EF4444',       // Red error
          info: '#3B82F6',        // Blue info
          // Card specific colors
          purple: {
            50: '#FAF5FF',
            100: '#F3E8FF', 
            200: '#E9D5FF',
            300: '#D8B4FE',
            400: '#C084FC',
            500: '#A855F7',
            600: '#9333EA',
            700: '#7C3AED',
            800: '#6B21A8',
            900: '#581C87'
          },
          blue: {
            50: '#EFF6FF',
            100: '#DBEAFE',
            200: '#BFDBFE', 
            300: '#93C5FD',
            400: '#60A5FA',
            500: '#3B82F6',
            600: '#2563EB',
            700: '#1D4ED8',
            800: '#1E40AF',
            900: '#1E3A8A'
          },
          pink: {
            50: '#FDF2F8',
            100: '#FCE7F3',
            200: '#FBCFE8',
            300: '#F9A8D4',
            400: '#F472B6',
            500: '#EC4899',
            600: '#DB2777',
            700: '#BE185D',
            800: '#9D174D',
            900: '#831843'
          }
        },
        // Text colors for mobile app
        text: {
          primary: '#1F2937',     // Dark text on light backgrounds
          secondary: '#6B7280',   // Secondary text
          muted: '#9CA3AF',       // Muted/placeholder text
          inverse: '#F9FAFB',     // Light text on dark backgrounds
          accent: '#6366F1'       // Accent colored text
        }
      },
      boxShadow: {
        // Modern mobile app shadows
        'card': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        'card-md': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'card-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'card-hover': '0 8px 25px -5px rgba(99, 102, 241, 0.25), 0 8px 10px -6px rgba(99, 102, 241, 0.1)',
        'card-active': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'glow-purple': '0 0 20px rgba(139, 92, 246, 0.3)',
        'glow-blue': '0 0 20px rgba(59, 130, 246, 0.3)',
        'glow-pink': '0 0 20px rgba(236, 72, 153, 0.3)',
        'button': '0 2px 4px 0 rgba(99, 102, 241, 0.2)',
        'button-hover': '0 4px 12px 0 rgba(99, 102, 241, 0.3)'
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
        'card': '16px',        // More modern rounded corners for cards
        'card-lg': '24px',     // Large cards
        'card-sm': '12px',     // Small cards
        'button': '12px',      // Modern button radius
        'button-sm': '8px',    // Small buttons
        'full': '9999px',      // Fully rounded (pills)
      },
      // Add background gradients
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 50%, #8B5CF6 100%)',
        'gradient-secondary': 'linear-gradient(135deg, #EC4899 0%, #8B5CF6 100%)',
        'gradient-card': 'linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%)',
        'gradient-purple': 'linear-gradient(135deg, #A855F7 0%, #8B5CF6 100%)',
        'gradient-blue': 'linear-gradient(135deg, #3B82F6 0%, #6366F1 100%)',
        'gradient-pink': 'linear-gradient(135deg, #EC4899 0%, #F472B6 100%)',
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