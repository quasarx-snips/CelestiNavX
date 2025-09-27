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
    <div className="min-h-full bg-primary-800 p-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold flex items-center justify-center mb-2">
            <span className="mr-2">⚠️</span>
            Emergency SOS
          </h1>
          <p className="text-text-secondary">Critical situation assistance</p>
        </div>

        {/* Emergency Status */}
        {isEmergencyActive && (
          <div className="bg-accent-red rounded-lg p-4 mb-6 border-2 border-red-400 animate-pulse">
            <div className="text-center">
              <h2 className="text-white font-bold text-lg mb-2">🚨 EMERGENCY ACTIVE 🚨</h2>
              <p className="text-red-100 text-sm mb-4">Emergency signal is being broadcast</p>
              <button 
                onClick={deactivateEmergency}
                className="bg-white text-accent-red px-6 py-2 rounded-lg font-semibold"
              >
                Cancel Emergency
              </button>
            </div>
          </div>
        )}

        {/* Emergency Actions */}
        {!isEmergencyActive && (
          <div className="space-y-4 mb-6">
            <button 
              onClick={activateEmergency}
              className="w-full bg-accent-red text-white py-6 rounded-lg font-bold text-xl flex items-center justify-center border-2 border-red-400"
            >
              <span className="mr-3 text-2xl">🆘</span>
              ACTIVATE EMERGENCY SOS
            </button>
            
            <div className="bg-primary-600 rounded-lg p-4 border border-primary-500">
              <h3 className="text-accent-red font-semibold mb-2">⚠️ Emergency Mode</h3>
              <p className="text-text-secondary text-sm">
                This will activate all available emergency protocols including:
                signal broadcasting, location sharing, and emergency frequency transmission.
              </p>
            </div>
          </div>
        )}

        {/* Current Location */}
        <div className="bg-primary-600 rounded-lg p-4 mb-6 border border-primary-500">
          <h3 className="text-text-primary font-semibold mb-4 flex items-center">
            <span className="mr-2">📍</span>
            Current Location
          </h3>
          {location ? (
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-text-secondary">Latitude</span>
                <span className="text-text-primary font-mono">{location.lat.toFixed(6)}°</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Longitude</span>
                <span className="text-text-primary font-mono">{location.lng.toFixed(6)}°</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Accuracy</span>
                <span className="text-accent-green font-medium">High</span>
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-text-secondary mb-3">Location not available</p>
              <button className="bg-accent-blue text-white px-4 py-2 rounded-lg text-sm">
                Get Location
              </button>
            </div>
          )}
        </div>

        {/* Emergency Contacts */}
        <div className="bg-primary-600 rounded-lg p-4 mb-6 border border-primary-500">
          <h3 className="text-text-primary font-semibold mb-4 flex items-center">
            <span className="mr-2">📞</span>
            Emergency Contacts
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-text-secondary">Emergency Services</span>
              <button className="text-accent-blue font-medium">Call 911</button>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-text-secondary">Coast Guard</span>
              <button className="text-accent-blue font-medium">Call</button>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-text-secondary">Mountain Rescue</span>
              <button className="text-accent-blue font-medium">Call</button>
            </div>
          </div>
        </div>

        {/* Survival Information */}
        <div className="bg-primary-600 rounded-lg p-4 border border-primary-500">
          <h3 className="text-text-primary font-semibold mb-4 flex items-center">
            <span className="mr-2">📋</span>
            Survival Checklist
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center">
              <span className="mr-2">☑️</span>
              <span className="text-text-secondary">Find shelter and stay warm</span>
            </div>
            <div className="flex items-center">
              <span className="mr-2">☑️</span>
              <span className="text-text-secondary">Conserve water and energy</span>
            </div>
            <div className="flex items-center">
              <span className="mr-2">☑️</span>
              <span className="text-text-secondary">Make yourself visible to rescuers</span>
            </div>
            <div className="flex items-center">
              <span className="mr-2">☑️</span>
              <span className="text-text-secondary">Stay in one location if possible</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SOSPage