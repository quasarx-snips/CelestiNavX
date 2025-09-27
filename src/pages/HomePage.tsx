import React from 'react'
import { useAuth } from '../hooks/useAuth'

const HomePage: React.FC = () => {
  const { user, logout } = useAuth()

  return (
    <div className="min-h-full bg-primary-800 p-6">
      <div className="max-w-md mx-auto">
        {/* Header with user info */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 bg-accent-blue rounded-full flex items-center justify-center mr-3">
              <span className="text-2xl">🧭</span>
            </div>
            <div className="text-left">
              <h1 className="text-2xl font-bold text-text-primary">CelestiNav</h1>
              {user && (
                <p className="text-text-secondary text-sm">
                  Welcome, {user.firstName || user.email || 'Navigator'}
                </p>
              )}
            </div>
          </div>
          <p className="text-text-secondary">Offline Survival Navigation System</p>
        </div>

        {/* User Profile Section */}
        {user && (
          <div className="bg-primary-600 rounded-lg p-4 border border-primary-500 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                {user.profileImageUrl ? (
                  <img 
                    src={user.profileImageUrl} 
                    alt="Profile" 
                    className="w-10 h-10 rounded-full object-cover mr-3"
                  />
                ) : (
                  <div className="w-10 h-10 bg-accent-blue rounded-full flex items-center justify-center mr-3">
                    <span className="text-white font-semibold">
                      {(user.firstName || user.email || 'U')[0].toUpperCase()}
                    </span>
                  </div>
                )}
                <div>
                  <p className="text-text-primary font-medium">
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="text-text-secondary text-sm">{user.email}</p>
                </div>
              </div>
              <button 
                onClick={logout}
                className="text-accent-red text-sm font-medium hover:text-red-400"
              >
                Sign Out
              </button>
            </div>
          </div>
        )}

        {/* Status Cards */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-primary-600 rounded-lg p-4 border border-primary-500">
            <div className="flex items-center mb-2">
              <span className="w-2 h-2 bg-accent-green rounded-full mr-2"></span>
              <span className="text-sm text-text-secondary">Offline Ready</span>
            </div>
          </div>
          <div className="bg-primary-600 rounded-lg p-4 border border-primary-500">
            <div className="flex items-center mb-2">
              <span className="w-2 h-2 bg-accent-blue rounded-full mr-2"></span>
              <span className="text-sm text-text-secondary">AI Powered</span>
            </div>
          </div>
        </div>

        {/* System Status */}
        <div className="bg-primary-600 rounded-lg p-4 border border-primary-500 mb-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <span className="mr-2">🎯</span>
            Current Status
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-text-secondary">Mode</span>
              <span className="text-accent-yellow font-medium">Day Mode</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Altitude</span>
              <span className="text-accent-red font-medium">--- ASL</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Time Local</span>
              <span className="text-text-primary font-medium">{new Date().toLocaleTimeString([], { hour12: false })}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Magnetic Declination</span>
              <span className="text-text-primary font-medium">1.2°</span>
            </div>
          </div>
        </div>

        {/* Main Action Button */}
        <button className="w-full bg-accent-blue text-white py-4 rounded-lg font-semibold text-lg mb-4 flex items-center justify-center">
          <span className="mr-2">🛰️</span>
          Start Celestial Navigation
        </button>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4">
          <button className="bg-primary-600 text-text-primary py-3 rounded-lg font-medium border border-primary-500 flex items-center justify-center">
            <span className="mr-2">🌤️</span>
            Weather AI
          </button>
          <button className="bg-primary-600 text-text-primary py-3 rounded-lg font-medium border border-primary-500 flex items-center justify-center">
            <span className="mr-2">📡</span>
            Cell Radar
          </button>
        </div>

        {/* Emergency Button */}
        <button className="w-full bg-accent-red text-white py-4 rounded-lg font-bold text-lg mt-6 flex items-center justify-center">
          <span className="mr-2">⚠️</span>
          EMERGENCY SOS
        </button>
      </div>
    </div>
  )
}

export default HomePage