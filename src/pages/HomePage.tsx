import React, { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'

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
    <div className="min-h-screen bg-primary-800 p-4 page-transition">
      <div className="max-w-md mx-auto space-y-4">
        {/* Header with app branding */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center mb-3">
            <div className="w-12 h-12 bg-accent-blue rounded-full flex items-center justify-center mr-3 shadow-md">
              <span className="text-2xl">🧭</span>
            </div>
            <div className="text-left">
              <h1 className="text-2xl font-bold text-text-primary">CelestiNav</h1>
              <p className="text-text-secondary text-sm">Offline Survival Navigation System</p>
            </div>
          </div>
        </div>

        {/* Status indicators */}
        <div className="grid grid-cols-2 gap-3">
          <div className="metric-card">
            <div className="flex items-center justify-center mb-2">
              <span className="status-dot status-online mr-2"></span>
              <span className="text-text-secondary text-sm font-medium">Offline Ready</span>
            </div>
          </div>
          <div className="metric-card">
            <div className="flex items-center justify-center mb-2">
              <span className="status-dot status-online mr-2"></span>
              <span className="text-text-secondary text-sm font-medium">AI Powered</span>
            </div>
          </div>
        </div>

        {/* User Profile Card */}
        {user && (
          <div className="info-card animate-fade-in">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                {user.profileImageUrl ? (
                  <img 
                    src={user.profileImageUrl} 
                    alt="Profile" 
                    className="w-10 h-10 rounded-full object-cover mr-3 ring-2 ring-primary-400/20"
                  />
                ) : (
                  <div className="w-10 h-10 bg-accent-blue rounded-full flex items-center justify-center mr-3 shadow-sm">
                    <span className="text-white font-semibold text-sm">
                      {(user.firstName || user.email || 'U')[0].toUpperCase()}
                    </span>
                  </div>
                )}
                <div>
                  <p className="text-text-primary font-semibold text-sm">
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="text-text-secondary text-xs">{user.email}</p>
                </div>
              </div>
              <button 
                onClick={logout}
                className="text-accent-red text-xs font-medium hover:text-red-400 transition-colors py-1 px-2 rounded hover:bg-primary-700/50"
              >
                Sign Out
              </button>
            </div>
          </div>
        )}

        {/* Current Status Card */}
        <div className="info-card animate-slide-up">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-text-primary flex items-center">
              <span className="mr-2">🎯</span>
              Current Status
            </h3>
            <span className="status-dot status-online"></span>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-1">
              <span className="text-text-secondary text-sm">Mode</span>
              <div className="flex items-center">
                <span className="status-dot bg-accent-yellow mr-2"></span>
                <span className="text-accent-yellow font-semibold text-sm">Day Mode</span>
              </div>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-text-secondary text-sm">Altitude</span>
              <div className="flex items-center">
                <span className="status-dot status-error mr-2"></span>
                <span className="text-accent-red font-semibold text-sm">--- ASL</span>
              </div>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-text-secondary text-sm">Time Local</span>
              <span className="text-text-primary font-semibold text-sm font-mono">
                {currentTime.toLocaleTimeString([], { hour12: false })}
              </span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-text-secondary text-sm">Magnetic Declination</span>
              <span className="text-text-primary font-semibold text-sm">1.2°</span>
            </div>
          </div>
        </div>

        {/* Main Navigation Button */}
        <button className="btn-primary w-full py-4 text-lg flex items-center justify-center animate-fade-in">
          <span className="mr-3 text-xl">🛰️</span>
          Start Celestial Navigation
        </button>

        {/* Quick Action Cards */}
        <div className="grid grid-cols-2 gap-3">
          <div className="action-card text-center">
            <span className="text-2xl mb-2 block">🌤️</span>
            <span className="text-text-primary text-sm font-semibold">Weather AI</span>
          </div>
          <div className="action-card text-center">
            <span className="text-2xl mb-2 block">📡</span>
            <span className="text-text-primary text-sm font-semibold">Cell Radar</span>
          </div>
        </div>

        {/* Emergency SOS Button */}
        <button className="btn-danger w-full py-4 text-lg flex items-center justify-center">
          <span className="mr-3 text-xl">⚠️</span>
          EMERGENCY SOS
        </button>

        {/* Status Footer */}
        <div className="text-center text-text-muted text-xs space-y-1 pt-2">
          <div className="flex items-center justify-center">
            <span className="status-dot status-online mr-2"></span>
            <span>System ready • All sensors active</span>
          </div>
          <p>Last sync: {currentTime.toLocaleDateString()}</p>
        </div>
      </div>
    </div>
  )
}

export default HomePage