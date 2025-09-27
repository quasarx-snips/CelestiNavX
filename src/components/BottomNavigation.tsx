import React from 'react'

type TabType = 'home' | 'celestinav' | 'weather' | 'radar' | 'sos'

interface BottomNavigationProps {
  activeTab: TabType
  onTabChange: (tab: TabType) => void
}

const BottomNavigation: React.FC<BottomNavigationProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { 
      id: 'home', 
      label: 'Home', 
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
        </svg>
      )
    },
    { 
      id: 'celestinav', 
      label: 'CelestiNav', 
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1L13.5 2.5L16.17 5.17L10.5 10.84C10.1 11.24 10.1 11.86 10.5 12.25L11.75 13.5C12.14 13.89 12.76 13.89 13.15 13.5L18.83 7.83L21.5 10.5L23 9H21Z"/>
        </svg>
      )
    },
    { 
      id: 'weather', 
      label: 'Weather', 
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M6.5 12C6.5 10.61 7.61 9.5 9 9.5C10.39 9.5 11.5 10.61 11.5 12C11.5 13.39 10.39 14.5 9 14.5C7.61 14.5 6.5 13.39 6.5 12ZM12 6.5C13.25 6.5 14.45 7 15.35 7.9C16.25 8.8 16.75 10 16.75 11.25C16.75 12.5 16.25 13.7 15.35 14.6C14.45 15.5 13.25 16 12 16C10.75 16 9.55 15.5 8.65 14.6C7.75 13.7 7.25 12.5 7.25 11.25C7.25 10 7.75 8.8 8.65 7.9C9.55 7 10.75 6.5 12 6.5Z"/>
        </svg>
      )
    },
    { 
      id: 'radar', 
      label: 'Radar', 
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20ZM12 6C8.69 6 6 8.69 6 12C6 15.31 8.69 18 12 18C15.31 18 18 15.31 18 12C18 8.69 15.31 6 12 6ZM12 16C9.79 16 8 14.21 8 12C8 9.79 9.79 8 12 8C14.21 8 16 9.79 16 12C16 14.21 14.21 16 12 16Z"/>
        </svg>
      )
    },
    { 
      id: 'sos', 
      label: 'SOS', 
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M1 21H4L2.5 19.5L1 21ZM11 8H13V16H11V8ZM12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20ZM11 6H13V10H11V6Z"/>
        </svg>
      )
    },
  ] as const

  return (
    <nav className="glass border-t border-primary-600/40 shadow-card">
      <div className="flex justify-around items-center max-w-lg mx-auto px-3 py-2">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id
          const isEmergency = tab.id === 'sos'
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id as TabType)}
              className={`
                relative group flex flex-col items-center justify-center
                min-w-[4.5rem] px-3 py-3 rounded-button
                transition-all duration-300 cubic-bezier(0.4, 0, 0.2, 1)
                transform-gpu hover:scale-105 active:scale-95
                ${isActive 
                  ? 'text-accent-orange bg-accent-orange/15 shadow-glow scale-105 elevated' 
                  : isEmergency
                    ? 'text-accent-red hover:text-red-300 hover:bg-accent-red/15 hover:shadow-card'
                    : 'text-text-secondary hover:text-text-primary hover:bg-primary-700/50 hover:shadow-card'
                }
                backdrop-blur-sm
              `}
              aria-label={tab.label}
              role="tab"
              aria-selected={isActive}
            >
              {/* Icon with enhanced animation */}
              <div className={`
                mb-1.5 transition-all duration-300 cubic-bezier(0.4, 0, 0.2, 1)
                ${isActive ? 'scale-110 -translate-y-0.5' : 'scale-100 group-hover:scale-105'}
                ${isEmergency && !isActive ? 'animate-pulse-slow' : ''}
              `}>
                {tab.icon}
              </div>
              
              {/* Label with better typography */}
              <span className={`
                text-xs transition-all duration-300 cubic-bezier(0.4, 0, 0.2, 1)
                ${isActive 
                  ? 'font-semibold opacity-100 tracking-wide' 
                  : 'font-medium opacity-80 group-hover:opacity-100'
                }
              `}>
                {tab.label}
              </span>
              
              {/* Enhanced active indicator */}
              {isActive && (
                <>
                  {/* Modern bottom indicator */}
                  <div className="absolute -bottom-1.5 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-accent-orange rounded-full shadow-glow animate-scale-in" />
                  
                  {/* Subtle background glow */}
                  <div className="absolute inset-0 bg-gradient-to-t from-accent-orange/8 to-transparent rounded-button animate-fade-in" />
                </>
              )}
              
              {/* Hover indicator for inactive tabs */}
              {!isActive && (
                <div className="absolute inset-0 bg-transparent rounded-button transition-all duration-300 ease-out group-hover:bg-primary-600/25 group-hover:backdrop-blur-sm" />
              )}
              
              {/* Emergency pulse indicator */}
              {isEmergency && !isActive && (
                <div className="absolute top-1.5 right-1.5 w-2 h-2 bg-accent-red rounded-full animate-pulse opacity-80 shadow-glow-strong" />
              )}
            </button>
          )
        })}
      </div>
      
      {/* Bottom safe area for mobile devices */}
      <div className="bg-gradient-to-t from-primary-950/80 to-transparent" style={{height: 'env(safe-area-inset-bottom)'}} />
    </nav>
  )
}

export default BottomNavigation