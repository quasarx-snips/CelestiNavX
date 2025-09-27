import React, { useState, useEffect } from 'react'
import { useMeasurements } from '../hooks/useDatabase'
import { apiService } from '../services/api'

const CelestiNavPage: React.FC = () => {
  const [mode, setMode] = useState<'gps' | 'solar'>('solar')
  const [pitch, setPitch] = useState(0)
  const [heading, setHeading] = useState(0)
  const [elevation, setElevation] = useState(0)
  const [pressure, setPressure] = useState(1013.25)
  const [temperature, setTemperature] = useState(15)
  const [isCalculating, setIsCalculating] = useState(false)
  const [lastResult, setLastResult] = useState<{ lat: number; lng: number } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [sensorPermission, setSensorPermission] = useState(false)

  const { measurements } = useMeasurements()

  // Device orientation sensor handling
  useEffect(() => {
    const handleOrientation = (event: DeviceOrientationEvent) => {
      if (event.beta !== null && event.alpha !== null) {
        // Adjust pitch to solar altitude (device pointing up = positive altitude)
        setPitch(event.beta - 90)
        
        // Handle compass heading
        if ((event as any).webkitCompassHeading !== undefined) {
          setHeading((event as any).webkitCompassHeading)
        } else if (event.alpha !== null) {
          setHeading(360 - event.alpha)
        }
      }
    }

    const requestSensorPermission = async () => {
      if (typeof DeviceOrientationEvent !== 'undefined' && 
          typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
        try {
          const permission = await (DeviceOrientationEvent as any).requestPermission()
          if (permission === 'granted') {
            window.addEventListener('deviceorientation', handleOrientation)
            setSensorPermission(true)
          }
        } catch (error) {
          console.error('Sensor permission error:', error)
        }
      } else {
        // For non-iOS devices
        window.addEventListener('deviceorientation', handleOrientation)
        setSensorPermission(true)
      }
    }

    requestSensorPermission()

    return () => {
      window.removeEventListener('deviceorientation', handleOrientation)
    }
  }, [])

  const calculatePosition = async () => {
    if (!sensorPermission) {
      setError('Device orientation permission required')
      return
    }

    setIsCalculating(true)
    setError(null)

    try {
      // Call backend API
      const result = await apiService.calculateSolarPosition({
        pitch,
        heading,
        elevation,
        pressure,
        temperature
      })

      // The backend already saved the measurement during calculation
      // Just update our local state with the result

      setLastResult({ lat: result.latitude, lng: result.longitude })
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Calculation failed')
    } finally {
      setIsCalculating(false)
    }
  }

  return (
    <div className="min-h-full bg-primary-800 p-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold flex items-center">
            <span className="mr-2">☀️</span>
            Solar Calculator
          </h1>
          <div className="flex items-center">
            <span className="text-sm text-text-secondary mr-2">Offline</span>
            <div className="w-2 h-2 bg-accent-orange rounded-full"></div>
          </div>
        </div>

        {/* Mode Toggle */}
        <div className="flex bg-primary-600 rounded-lg p-1 mb-6">
          <button
            onClick={() => setMode('gps')}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
              mode === 'gps'
                ? 'bg-primary-500 text-text-primary'
                : 'text-text-secondary'
            }`}
          >
            <span className="mr-1">📡</span>
            GPS Mode
          </button>
          <button
            onClick={() => setMode('solar')}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
              mode === 'solar'
                ? 'bg-accent-orange text-white'
                : 'text-text-secondary'
            }`}
          >
            <span className="mr-1">☀️</span>
            Solar Mode
          </button>
        </div>

        {/* Camera View */}
        <div className="relative bg-black rounded-lg overflow-hidden mb-6" style={{ aspectRatio: '4/3' }}>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-text-secondary text-center">
              <p className="mb-2">📷</p>
              <p className="text-sm">Align sun with center circle</p>
            </div>
          </div>
          {/* Crosshairs */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative">
              <div className="w-16 h-16 border-2 border-accent-green rounded-full"></div>
              <div className="absolute top-1/2 left-1/2 w-1 h-16 bg-accent-green transform -translate-x-1/2 -translate-y-1/2"></div>
              <div className="absolute top-1/2 left-1/2 w-16 h-1 bg-accent-green transform -translate-x-1/2 -translate-y-1/2"></div>
              <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-accent-green rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
            </div>
          </div>
        </div>

        {/* Solar Sensor Data */}
        <div className="bg-accent-blue rounded-lg p-4 mb-6">
          <h3 className="text-white font-semibold mb-4 flex items-center">
            <span className="mr-2">☀️</span>
            Solar Sensor Data
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-blue-200 text-sm mb-1">Solar Azimuth</p>
              <p className="text-white text-xl font-bold">{heading.toFixed(1)}°</p>
            </div>
            <div>
              <p className="text-blue-200 text-sm mb-1">Solar Altitude</p>
              <p className="text-white text-xl font-bold">{pitch.toFixed(1)}°</p>
            </div>
          </div>
          <p className="text-blue-200 text-xs mt-3">
            Point your device camera at the sun to get accurate readings
          </p>
        </div>

        {/* Environmental Parameters */}
        <div className="bg-primary-600 rounded-lg p-4 mb-6 border border-primary-500">
          <h3 className="text-text-primary font-semibold mb-4 flex items-center">
            <span className="mr-2">📊</span>
            Environmental Parameters
          </h3>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-text-secondary text-sm mb-1">Elevation (m)</label>
              <input
                type="number"
                value={elevation}
                onChange={(e) => setElevation(Number(e.target.value))}
                className="w-full bg-primary-700 border border-primary-500 rounded-lg px-3 py-2 text-text-primary"
              />
            </div>
            <div>
              <label className="block text-text-secondary text-sm mb-1">Pressure (hPa)</label>
              <input
                type="number"
                value={pressure}
                onChange={(e) => setPressure(Number(e.target.value))}
                className="w-full bg-primary-700 border border-primary-500 rounded-lg px-3 py-2 text-text-primary"
              />
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-text-secondary text-sm mb-1">Temperature (°C)</label>
            <input
              type="number"
              value={temperature}
              onChange={(e) => setTemperature(Number(e.target.value))}
              className="w-full bg-primary-700 border border-primary-500 rounded-lg px-3 py-2 text-text-primary"
            />
          </div>
          <button 
            onClick={calculatePosition}
            disabled={isCalculating || !sensorPermission}
            className="w-full bg-accent-blue text-white py-3 rounded-lg font-semibold disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isCalculating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Calculating...
              </>
            ) : (
              'Calculate Position'
            )}
          </button>
        </div>

        {/* Results Section */}
        {lastResult && (
          <div className="bg-accent-green rounded-lg p-4 mb-6">
            <h3 className="text-white font-semibold mb-3 flex items-center">
              <span className="mr-2">🎯</span>
              Calculated Position
            </h3>
            <div className="text-white text-sm space-y-2">
              <div className="flex justify-between">
                <span>Latitude:</span>
                <span className="font-mono">{lastResult.lat.toFixed(6)}°</span>
              </div>
              <div className="flex justify-between">
                <span>Longitude:</span>
                <span className="font-mono">{lastResult.lng.toFixed(6)}°</span>
              </div>
              <div className="text-green-200 text-xs mt-2">
                Position saved to local database ✓
              </div>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="bg-accent-red rounded-lg p-4 mb-6">
            <h3 className="text-white font-semibold mb-2 flex items-center">
              <span className="mr-2">❌</span>
              Error
            </h3>
            <p className="text-white text-sm">{error}</p>
          </div>
        )}

        {/* Recent Measurements */}
        {measurements.length > 0 && (
          <div className="bg-primary-600 rounded-lg p-4 mb-6 border border-primary-500">
            <h3 className="text-text-primary font-semibold mb-3 flex items-center">
              <span className="mr-2">📋</span>
              Recent Measurements ({measurements.length})
            </h3>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {measurements.slice(0, 3).map((measurement) => (
                <div key={measurement.id} className="text-sm bg-primary-700 rounded p-2">
                  <div className="flex justify-between text-text-primary">
                    <span>{measurement.latitude?.toFixed(4)}°, {measurement.longitude?.toFixed(4)}°</span>
                    <span className="text-text-secondary">
                      {new Date(measurement.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Sensor Status */}
        <div className="bg-primary-600 rounded-lg p-4 mb-6 border border-primary-500">
          <h3 className="text-text-primary font-semibold mb-3 flex items-center">
            <span className="mr-2">📱</span>
            Sensor Status
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-text-secondary">Device Orientation</span>
              <span className={sensorPermission ? 'text-accent-green' : 'text-accent-red'}>
                {sensorPermission ? 'Active' : 'Permission Required'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Current Pitch</span>
              <span className="text-text-primary font-mono">{pitch.toFixed(1)}°</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Current Heading</span>
              <span className="text-text-primary font-mono">{heading.toFixed(1)}°</span>
            </div>
          </div>
        </div>

        {/* How to Use */}
        <div className="bg-accent-orange rounded-lg p-4">
          <h3 className="text-white font-semibold mb-3 flex items-center">
            <span className="mr-2">💡</span>
            How to Use
          </h3>
          <div className="text-white text-sm space-y-2">
            <p>1. Allow device orientation permissions when prompted</p>
            <p>2. Point your device toward the sun (watch sensor readings)</p>
            <p>3. Adjust environmental parameters if known</p>
            <p>4. Click Calculate Position to get your coordinates</p>
          </div>
          <div className="mt-3 p-2 bg-orange-700 rounded text-white text-xs">
            <p>⚠️ <strong>Never look directly at the sun.</strong> Use the device shadow or indirect observation methods.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CelestiNavPage