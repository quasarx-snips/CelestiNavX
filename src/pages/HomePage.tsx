import React, { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import ThemeToggle from '../components/ThemeToggle'

interface NavigationButtonProps {
  onClick: () => void
  className: string
  children: React.ReactNode
}

const NavigationButton: React.FC<NavigationButtonProps> = ({ onClick, className, children }) => {
  return (
    <button onClick={onClick} className={className}>
      {children}
    </button>
  )
}

const HomePage: React.FC = () => {
  const { user, logout } = useAuth()
  const [currentTime, setCurrentTime] = useState(new Date())

  // Auto-update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  return (
    <div className="p-4">
      <div className="max-w-md mx-auto space-y-4">
        {/* Header with app branding */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-contrast-high">CelestiNav</h1>
            <p className="text-contrast-medium text-sm">Offline Survival Navigation System</p>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <div className="text-right">
              <div className="flex items-center">
                <span className="text-contrast-medium text-sm mr-2">System</span>
                <span className="status-dot status-online"></span>
              </div>
            </div>
          </div>
        </div>

        {/* Status indicators */}
        <div className="grid grid-cols-2 gap-3">
          <div className="gradient-card-blue">
            <div className="flex items-center justify-center mb-2">
              <span className="status-dot bg-white/90 mr-2"></span>
              <span className="text-white text-sm font-medium">Offline Ready</span>
            </div>
          </div>
          <div className="gradient-card-purple">
            <div className="flex items-center justify-center mb-2">
              <span className="status-dot bg-white/90 mr-2"></span>
              <span className="text-white text-sm font-medium">AI Powered</span>
            </div>
          </div>
        </div>

        {/* User Profile Card */}
        {user && (
          <div className="info-card animate-fade-in">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                {user.profile_image_url ? (
                  <img 
                    src={user.profile_image_url} 
                    alt="Profile" 
                    className="w-10 h-10 rounded-full object-cover mr-3 ring-2 ring-accent-primary/20"
                  />
                ) : (
                  <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center mr-3 shadow-card">
                    <span className="text-white font-semibold text-sm">
                      {(user.first_name || user.email || 'U')[0].toUpperCase()}
                    </span>
                  </div>
                )}
                <div>
                  <p className="text-contrast-high font-semibold text-sm">
                    {user.first_name} {user.last_name}
                  </p>
                  <p className="text-contrast-medium text-xs">{user.email}</p>
                </div>
              </div>
              <button 
                onClick={logout}
                className="text-accent-error text-xs font-medium hover:text-red-400 transition-colors py-1 px-2 rounded hover:bg-surface-50/20"
              >
                Sign Out
              </button>
            </div>
          </div>
        )}

        {/* Current Status Card */}
        <div className="info-card animate-slide-up">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-contrast-high flex items-center">
              <span className="mr-2">🎯</span>
              Current Status
            </h3>
            <span className="status-dot status-online"></span>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-1">
              <span className="text-contrast-medium text-sm">Mode</span>
              <div className="flex items-center">
                <span className="status-dot bg-accent-warning mr-2"></span>
                <span className="text-accent-warning font-semibold text-sm">Day Mode</span>
              </div>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-contrast-medium text-sm">Altitude</span>
              <div className="flex items-center">
                <span className="status-dot status-error mr-2"></span>
                <span className="text-accent-error font-semibold text-sm">--- ASL</span>
              </div>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-contrast-medium text-sm">Time Local</span>
              <span className="text-contrast-high font-semibold text-sm font-mono">
                {currentTime.toLocaleTimeString([], { hour12: false })}
              </span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-contrast-medium text-sm">Magnetic Declination</span>
              <span className="text-contrast-high font-semibold text-sm">1.2°</span>
            </div>
          </div>
        </div>

        {/* Main Navigation Button */}
        <NavigationButton 
          onClick={() => window.location.hash = '#celestinav'}
          className="btn-primary w-full py-4 text-lg flex items-center justify-center animate-fade-in"
        >
          <span className="mr-3 text-xl">🛰️</span>
          Start Celestial Navigation
        </NavigationButton>

        {/* Quick Action Cards */}
        <div className="grid grid-cols-2 gap-3">
          <NavigationButton 
            onClick={() => window.location.hash = '#weather'}
            className="gradient-card-pink text-center cursor-pointer hover:scale-105 transition-transform"
          >
            <span className="text-2xl mb-2 block">🌤️</span>
            <span className="text-white text-sm font-semibold">Weather AI</span>
          </NavigationButton>
          <NavigationButton 
            onClick={() => window.location.hash = '#radar'}
            className="gradient-card-purple text-center cursor-pointer hover:scale-105 transition-transform"
          >
            <span className="text-2xl mb-2 block">📡</span>
            <span className="text-white text-sm font-semibold">Cell Radar</span>
          </NavigationButton>
        </div>

        {/* Emergency SOS Button */}
        <NavigationButton 
          onClick={() => window.location.hash = '#sos'}
          className="btn-danger w-full py-4 text-lg flex items-center justify-center"
        >
          <span className="mr-3 text-xl">⚠️</span>
          EMERGENCY SOS
        </NavigationButton>

        {/* Status Footer */}
        <div className="text-center text-contrast-medium text-xs space-y-1 pt-2">
          <div className="flex items-center justify-center">
            <span className="status-dot status-online mr-2"></span>
            <span className="text-contrast-medium">System ready • All sensors active</span>
          </div>
          <p className="text-contrast-medium">Last sync: {currentTime.toLocaleDateString()}</p>
        </div>
      </div>
    </div>
  )
}

export default HomePage