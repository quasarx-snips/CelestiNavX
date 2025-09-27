import React, { useState } from 'react'

const SOSPage: React.FC = () => {
  const [isEmergencyActive, setIsEmergencyActive] = useState(false)
  const [location] = useState<{ lat: number; lng: number } | null>(null)

  const activateEmergency = () => {
    setIsEmergencyActive(true)
    // In a real app, this would trigger emergency protocols
  }

  const deactivateEmergency = () => {
    setIsEmergencyActive(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-surface-800 via-surface-700 to-surface-600 p-4 page-transition">
      <div className="max-w-md mx-auto space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-text-inverse flex items-center">
            <span className="mr-2">⚠️</span>
            Emergency SOS
          </h1>
          <div className="flex items-center">
            <span className="text-text-inverse/70 text-sm mr-2">
              {isEmergencyActive ? 'ACTIVE' : 'Standby'}
            </span>
            <span className={`status-dot ${isEmergencyActive ? 'status-error animate-pulse' : 'status-offline'}`}></span>
          </div>
        </div>

        {/* Emergency Status */}
        {isEmergencyActive && (
          <div className="info-card bg-accent-error/20 border-accent-error animate-pulse">
            <div className="text-center">
              <h2 className="text-accent-error font-bold text-lg mb-2 flex items-center justify-center">
                🚨 EMERGENCY ACTIVE 🚨
              </h2>
              <p className="text-accent-error text-sm mb-4">Emergency signal is being broadcast</p>
              <button 
                onClick={deactivateEmergency}
                className="btn-secondary bg-white text-accent-error py-2 px-6"
              >
                Cancel Emergency
              </button>
            </div>
          </div>
        )}

        {/* Emergency Action Button */}
        {!isEmergencyActive && (
          <div className="animate-fade-in">
            <button 
              onClick={activateEmergency}
              className="w-full bg-accent-error hover:bg-red-600 active:bg-red-700 text-white py-6 rounded-card font-bold text-xl flex items-center justify-center border-2 border-red-400 shadow-card hover:shadow-card-hover active:shadow-card-active transition-all duration-200 active:scale-95"
            >
              <span className="mr-3 text-2xl">🆘</span>
              ACTIVATE EMERGENCY SOS
            </button>
            
            <div className="info-card bg-accent-error/10 border-accent-error/30 mt-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-accent-error font-bold text-sm">⚠️ Emergency Mode</h3>
                <span className="status-dot status-warning"></span>
              </div>
              <p className="text-text-secondary text-sm">
                This will activate all available emergency protocols including signal broadcasting, 
                location sharing, and emergency frequency transmission.
              </p>
            </div>
          </div>
        )}

        {/* Current Location Card */}
        <div className="info-card animate-slide-up">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-text-primary font-bold text-sm flex items-center">
              <span className="mr-2">📍</span>
              Current Location
            </h3>
            <span className={`status-dot ${location ? 'status-online' : 'status-offline'}`}></span>
          </div>
          
          {location ? (
            <div className="space-y-3">
              <div className="flex justify-between items-center py-1">
                <span className="text-text-secondary text-sm">Latitude</span>
                <span className="text-text-primary font-mono font-semibold text-sm">{location.lat.toFixed(6)}°</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-text-secondary text-sm">Longitude</span>
                <span className="text-text-primary font-mono font-semibold text-sm">{location.lng.toFixed(6)}°</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-text-secondary text-sm">Accuracy</span>
                <div className="flex items-center">
                  <span className="status-dot status-online mr-2"></span>
                  <span className="text-accent-success font-semibold text-sm">High</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              <div className="text-2xl mb-2">📍</div>
              <p className="text-text-secondary mb-3 text-sm">Location not available</p>
              <button className="btn-primary text-sm py-2 px-4">
                Get Location
              </button>
            </div>
          )}
        </div>

        {/* Emergency Contacts Card */}
        <div className="info-card animate-slide-up">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-text-primary font-bold text-sm flex items-center">
              <span className="mr-2">📞</span>
              Emergency Contacts
            </h3>
            <span className="status-dot status-online"></span>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center py-1">
              <span className="text-text-secondary text-sm">Emergency Services</span>
              <button className="text-accent-blue font-semibold text-sm hover:text-blue-400 transition-colors">
                Call 911
              </button>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-text-secondary text-sm">Coast Guard</span>
              <button className="text-accent-blue font-semibold text-sm hover:text-blue-400 transition-colors">
                Call
              </button>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-text-secondary text-sm">Mountain Rescue</span>
              <button className="text-accent-blue font-semibold text-sm hover:text-blue-400 transition-colors">
                Call
              </button>
            </div>
          </div>
        </div>

        {/* Survival Checklist Card */}
        <div className="info-card animate-slide-up">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-text-primary font-bold text-sm flex items-center">
              <span className="mr-2">📋</span>
              Survival Checklist
            </h3>
            <span className="status-dot status-online"></span>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center py-1">
              <span className="mr-3 text-accent-success">☑️</span>
              <span className="text-text-secondary text-sm">Find shelter and stay warm</span>
            </div>
            <div className="flex items-center py-1">
              <span className="mr-3 text-accent-success">☑️</span>
              <span className="text-text-secondary text-sm">Conserve water and energy</span>
            </div>
            <div className="flex items-center py-1">
              <span className="mr-3 text-accent-success">☑️</span>
              <span className="text-text-secondary text-sm">Make yourself visible to rescuers</span>
            </div>
            <div className="flex items-center py-1">
              <span className="mr-3 text-accent-success">☑️</span>
              <span className="text-text-secondary text-sm">Stay in one location if possible</span>
            </div>
          </div>
        </div>

        {/* Status Footer */}
        <div className="text-center text-text-inverse/50 text-xs pt-2">
          <div className="flex items-center justify-center mb-1">
            <span className={`status-dot ${isEmergencyActive ? 'status-error' : 'status-online'} mr-2`}></span>
            <span>{isEmergencyActive ? 'Emergency broadcast active' : 'System ready • Emergency protocols standby'}</span>
          </div>
          <p>Last check: {new Date().toLocaleTimeString()}</p>
        </div>
      </div>
    </div>
  )
}

export default SOSPage