
import React, { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import ThemeToggle from '../components/ThemeToggle'

interface NavigationButtonProps {
  onClick: () => void
  className: string
  children: React.ReactNode
  delay?: number
}

interface SensorData {
  name: string
  status: 'active' | 'inactive' | 'error'
  value?: string | number
  unit?: string
  lastUpdate?: number
}

const NavigationButton: React.FC<NavigationButtonProps> = ({ onClick, className, children, delay = 0 }) => {
  return (
    <button 
      onClick={onClick} 
      className={className}
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </button>
  )
}

const HomePage: React.FC = () => {
  const { user, logout } = useAuth()
  const [currentTime, setCurrentTime] = useState(new Date())
  const [mounted, setMounted] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [sensors, setSensors] = useState<SensorData[]>([
    { name: 'GPS', status: 'active', value: 'Ready', lastUpdate: Date.now() },
    { name: 'Compass', status: 'inactive', value: '---°', unit: '°' },
    { name: 'Accelerometer', status: 'active', value: '9.8', unit: 'm/s²', lastUpdate: Date.now() },
    { name: 'Gyroscope', status: 'active', value: '0.1', unit: 'rad/s', lastUpdate: Date.now() },
    { name: 'Barometer', status: 'inactive', value: '---', unit: 'hPa' },
    { name: 'Magnetometer', status: 'error', value: 'Error', lastUpdate: Date.now() - 30000 },
    { name: 'Proximity', status: 'active', value: 'Far', lastUpdate: Date.now() },
    { name: 'Light Sensor', status: 'active', value: '450', unit: 'lux', lastUpdate: Date.now() }
  ])

  // Auto-update time every second
  useEffect(() => {
    setMounted(true)
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  // Simulate sensor updates
  useEffect(() => {
    const interval = setInterval(() => {
      setSensors(prev => prev.map(sensor => {
        if (sensor.status === 'active') {
          let newValue = sensor.value
          switch (sensor.name) {
            case 'Accelerometer':
              newValue = (9.8 + (Math.random() - 0.5) * 0.2).toFixed(1)
              break
            case 'Gyroscope':
              newValue = (Math.random() * 0.2).toFixed(2)
              break
            case 'Light Sensor':
              newValue = Math.floor(400 + Math.random() * 200)
              break
          }
          return { ...sensor, value: newValue, lastUpdate: Date.now() }
        }
        return sensor
      }))
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  if (!mounted) {
    return (
      <div className="p-4 min-h-screen flex items-center justify-center">
        <div className="animate-pulse">
          <div className="w-8 h-8 bg-accent-primary rounded-full"></div>
        </div>
      </div>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500'
      case 'inactive': return 'bg-yellow-500'
      case 'error': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'ACTIVE'
      case 'inactive': return 'OFFLINE'
      case 'error': return 'ERROR'
      default: return 'UNKNOWN'
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: 'var(--bg-primary)' }}>
      {/* Animated background gradient */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-gradient-to-r from-accent-primary/20 to-accent-purple-500/20 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-gradient-to-l from-accent-blue-500/20 to-accent-pink-500/20 rounded-full mix-blend-multiply filter blur-xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-gradient-to-t from-accent-purple-500/20 to-accent-primary/20 rounded-full mix-blend-multiply filter blur-xl animate-pulse" style={{ animationDelay: '4s' }}></div>
      </div>

      <div className="relative z-10 p-6">
        <div className="max-w-md mx-auto space-y-6">
          {/* Enhanced Header with Settings */}
          <div className="text-center mb-6 animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="p-2 rounded-xl transition-all duration-200 shadow-card hover:shadow-card-md hover:scale-105 active:scale-95"
                style={{
                  background: 'var(--surface-200)',
                  color: 'var(--text-primary)'
                }}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
                </svg>
              </button>
              
              <div className="text-center flex-1">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-primary rounded-xl shadow-lg mb-3 animate-bounce-subtle">
                  <span className="text-xl">🛰️</span>
                </div>
                <h1 className="text-2xl font-black" style={{ color: 'var(--text-primary)' }}>
                  CelestiNav
                </h1>
                <p style={{ color: 'var(--text-secondary)' }} className="text-xs font-medium mt-1">
                  Professional Navigation System
                </p>
              </div>
              
              <div className="flex flex-col items-end gap-2 flex-1">
                <ThemeToggle />
                <div className="flex items-center">
                  <span className="status-dot status-online animate-pulse"></span>
                </div>
              </div>
            </div>
          </div>

          {/* Settings Panel */}
          {showSettings && (
            <div className="card p-4 backdrop-blur-sm border border-white/20 animate-slide-up bg-black/40 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                  System Settings
                </h3>
                <button
                  onClick={() => setShowSettings(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                  </svg>
                </button>
              </div>

              {/* Sensor Status Grid */}
              <div className="mb-4">
                <h4 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
                  Sensor Status
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {sensors.map((sensor, index) => (
                    <div key={sensor.name} className="bg-gray-800/50 rounded-lg p-2 border border-gray-700/50">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>
                          {sensor.name}
                        </span>
                        <span className={`w-2 h-2 rounded-full ${getStatusColor(sensor.status)} animate-pulse`}></span>
                      </div>
                      <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                        {typeof sensor.value === 'number' ? sensor.value.toFixed(2) : sensor.value}
                        {sensor.unit && ` ${sensor.unit}`}
                      </div>
                      <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                        {getStatusText(sensor.status)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Additional Settings */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                    Auto-sync Data
                  </span>
                  <div className="toggle-group">
                    <div className="toggle-option toggle-active">ON</div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                    High Accuracy Mode
                  </span>
                  <div className="toggle-group">
                    <div className="toggle-option toggle-active">ON</div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                    Power Saving
                  </span>
                  <div className="toggle-group">
                    <div className="toggle-option toggle-inactive">OFF</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Professional Status Cards */}
          <div className="grid grid-cols-2 gap-3 mb-5">
            <div className="gradient-card-blue text-center relative overflow-hidden animate-slide-up p-3" style={{ animationDelay: '100ms' }}>
              <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full -translate-y-8 translate-x-8"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-center mb-1">
                  <span className="text-xl">⚡</span>
                </div>
                <span className="text-white text-xs font-semibold block leading-tight">Offline Ready</span>
                <span className="text-white/90 text-xs leading-tight">System Active</span>
              </div>
            </div>
            <div className="gradient-card-purple text-center relative overflow-hidden animate-slide-up p-3" style={{ animationDelay: '200ms' }}>
              <div className="absolute top-0 left-0 w-14 h-14 bg-white/10 rounded-full -translate-y-7 -translate-x-7"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-center mb-1">
                  <span className="text-xl">🤖</span>
                </div>
                <span className="text-white text-xs font-semibold block leading-tight">AI Powered</span>
                <span className="text-white/90 text-xs leading-tight">Neural Net Active</span>
              </div>
            </div>
          </div>

          {/* Enhanced User Profile - Removed Active Session */}
          {user && (
            <div className="card p-4 backdrop-blur-sm border border-white/20 animate-fade-in bg-black/40" style={{ animationDelay: '300ms' }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center flex-1 min-w-0">
                  {user.profile_image_url ? (
                    <div className="relative flex-shrink-0">
                      <img 
                        src={user.profile_image_url} 
                        alt="Profile" 
                        className="w-10 h-10 rounded-xl object-cover mr-3 ring-2 ring-blue-400/30 shadow-card"
                      />
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                    </div>
                  ) : (
                    <div className="relative mr-3 flex-shrink-0">
                      <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center shadow-lg">
                        <span className="text-white font-bold text-sm">
                          {(user.first_name || user.email || 'U')[0].toUpperCase()}
                        </span>
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-sm truncate" style={{ color: 'var(--text-primary)' }}>
                      {user.first_name} {user.last_name}
                    </p>
                    <p className="text-xs truncate" style={{ color: 'var(--text-secondary)' }}>
                      {user.email}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={logout}
                  className="text-red-400 text-xs font-semibold hover:text-red-300 transition-all duration-200 py-2 px-2 rounded-lg hover:bg-red-500/20 flex-shrink-0 ml-2"
                >
                  Sign Out
                </button>
              </div>
            </div>
          )}

          {/* Professional Status Dashboard */}
          <div className="card p-4 backdrop-blur-sm border border-white/20 animate-slide-up bg-black/40" style={{ animationDelay: '400ms' }}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-bold flex items-center" style={{ color: 'var(--text-primary)' }}>
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                System Status
              </h3>
              <div className="text-xs font-mono" style={{ color: 'var(--text-secondary)' }}>
                {currentTime.toLocaleTimeString([], { hour12: false })}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center p-3 bg-gradient-to-br from-slate-700 to-slate-600 rounded-lg shadow-lg">
                <div className="text-lg font-bold text-yellow-400">Day</div>
                <div className="text-xs text-white/80 font-medium">Mode</div>
              </div>
              <div className="text-center p-3 bg-gradient-to-br from-slate-700 to-slate-600 rounded-lg shadow-lg">
                <div className="text-lg font-bold text-red-400">---</div>
                <div className="text-xs text-white/80 font-medium">Altitude ASL</div>
              </div>
              <div className="text-center p-3 bg-gradient-to-br from-slate-700 to-slate-600 rounded-lg shadow-lg">
                <div className="text-lg font-bold text-white">1.2°</div>
                <div className="text-xs text-white/80 font-medium">Declination</div>
              </div>
              <div className="text-center p-3 bg-gradient-to-br from-slate-700 to-slate-600 rounded-lg shadow-lg">
                <div className="text-lg font-bold text-green-400">GPS</div>
                <div className="text-xs text-white/80 font-medium">Ready</div>
              </div>
            </div>
          </div>

          {/* Enhanced Main CTA */}
          <NavigationButton 
            onClick={() => window.location.hash = '#celestinav'}
            className="btn-primary w-full py-5 text-lg font-bold flex items-center justify-center relative overflow-hidden group animate-scale-in shadow-glow-purple hover:shadow-glow-purple transform hover:scale-105 transition-all duration-300"
            delay={500}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            <span className="mr-3 text-2xl animate-bounce-subtle">🛰️</span>
            <span className="relative z-10">Start Navigation</span>
          </NavigationButton>

          {/* Professional Action Grid */}
          <div className="grid grid-cols-2 gap-3">
            <NavigationButton 
              onClick={() => window.location.hash = '#weather'}
              className="gradient-card-pink text-center cursor-pointer hover:scale-105 hover:shadow-glow-pink transition-all duration-300 relative overflow-hidden group animate-slide-up p-4"
              delay={600}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10">
                <span className="text-2xl mb-2 block animate-bounce-subtle" style={{ animationDelay: '1s' }}>🌤️</span>
                <span className="text-white text-xs font-bold block leading-tight">Weather AI</span>
                <span className="text-white/90 text-xs leading-tight">Neural Analysis</span>
              </div>
            </NavigationButton>
            <NavigationButton 
              onClick={() => window.location.hash = '#radar'}
              className="gradient-card-blue text-center cursor-pointer hover:scale-105 hover:shadow-glow-blue transition-all duration-300 relative overflow-hidden group animate-slide-up p-4"
              delay={700}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10">
                <span className="text-2xl mb-2 block animate-bounce-subtle" style={{ animationDelay: '1.2s' }}>📡</span>
                <span className="text-white text-xs font-bold block leading-tight">Cell Radar</span>
                <span className="text-white/90 text-xs leading-tight">Signal Detection</span>
              </div>
            </NavigationButton>
          </div>

          {/* Enhanced Emergency Button */}
          <NavigationButton 
            onClick={() => window.location.hash = '#sos'}
            className="w-full py-5 text-lg font-bold flex items-center justify-center bg-gradient-to-r from-red-500 to-red-600 text-white rounded-2xl shadow-lg hover:shadow-xl hover:from-red-600 hover:to-red-700 transform hover:scale-105 transition-all duration-300 animate-pulse-slow animate-fade-in"
            delay={800}
          >
            <span className="mr-3 text-2xl animate-bounce-subtle">⚠️</span>
            EMERGENCY SOS
          </NavigationButton>

          {/* Professional Footer */}
          <div className="text-center space-y-2 pt-3 animate-fade-in" style={{ animationDelay: '900ms' }}>
            <div className="flex items-center justify-center">
              <span className="status-dot status-online mr-2"></span>
              <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                All systems operational
              </span>
            </div>
            <div className="flex items-center justify-center space-x-3 text-xs" style={{ color: 'var(--text-muted)' }}>
              <span>Last sync: {currentTime.toLocaleDateString()}</span>
              <span>•</span>
              <span>Build: 2.1.0</span>
              <span>•</span>
              <span className="text-green-400 font-medium">Secure</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HomePage
