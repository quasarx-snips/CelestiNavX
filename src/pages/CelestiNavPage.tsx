import React, { useState, useEffect, useRef } from 'react'
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
  const [gpsLocation, setGpsLocation] = useState<{ lat: number; lng: number; accuracy?: number } | null>(null)
  const [gpsLoading, setGpsLoading] = useState(false)
  const [gpsPermission, setGpsPermission] = useState(false)
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null)
  const [isCameraActive, setIsCameraActive] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  const { measurements } = useMeasurements()

  // Camera functionality
  const startCamera = async () => {
    try {
      setError(null)
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment', // Use back camera if available
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      })
      
      setCameraStream(stream)
      setIsCameraActive(true)
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play()
      }
    } catch (err) {
      setError('Camera access denied. Please allow camera permissions for sun alignment.')
      console.error('Camera error:', err)
    }
  }

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop())
      setCameraStream(null)
      setIsCameraActive(false)
    }
    // Clear video element's srcObject
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
  }

  // GPS functionality
  const getGPSLocation = async () => {
    setGpsLoading(true)
    setError(null)

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          resolve,
          reject,
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 60000
          }
        )
      })

      const location = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        accuracy: position.coords.accuracy
      }

      setGpsLocation(location)
      setGpsPermission(true)
      
      // Auto-detect elevation if available
      if (position.coords.altitude !== null) {
        setElevation(Math.round(position.coords.altitude))
      }

      return location
    } catch (err) {
      const message = err instanceof Error ? err.message : 'GPS access failed'
      setError(`GPS Error: ${message}`)
      setGpsPermission(false)
      throw err
    } finally {
      setGpsLoading(false)
    }
  }

  // Auto-detect atmospheric pressure (if available)
  const detectEnvironmental = async () => {
    try {
      // Try to estimate pressure based on elevation (rough approximation)
      if (elevation > 0) {
        const estimatedPressure = 1013.25 * Math.pow(1 - 0.0065 * elevation / 288.15, 5.255)
        setPressure(Math.round(estimatedPressure * 100) / 100)
      }
    } catch (err) {
      console.log('Environmental detection not available')
    }
  }

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
    setIsCalculating(true)
    setError(null)

    try {
      if (mode === 'gps') {
        // GPS mode - get current location directly
        const location = gpsLocation || await getGPSLocation()
        setLastResult({ lat: location.lat, lng: location.lng })
        
        // Save GPS measurement to database
        await apiService.saveMeasurement({
          latitude: location.lat,
          longitude: location.lng,
          method: 'gps',
          accuracy: location.accuracy,
          elevation,
          pressure,
          temperature
        })
        
      } else {
        // Solar mode - calculate position from sun observations
        if (!sensorPermission) {
          setError('Device orientation permission required')
          return
        }

        const result = await apiService.calculateSolarPosition({
          pitch,
          heading,
          elevation,
          pressure,
          temperature
        })

        setLastResult({ lat: result.latitude, lng: result.longitude })
      }
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Calculation failed')
    } finally {
      setIsCalculating(false)
    }
  }

  // Effect to assign camera stream to video element when both become available
  useEffect(() => {
    if (cameraStream && videoRef.current) {
      videoRef.current.srcObject = cameraStream
      videoRef.current.play().catch((err) => {
        console.error('Error playing video:', err)
        setError('Failed to start video playback')
      })
    }
  }, [cameraStream])

  // Effect to detect environmental conditions when elevation changes
  useEffect(() => {
    detectEnvironmental()
  }, [elevation])

  // Effect to cleanup camera when component unmounts or mode changes
  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop())
      }
    }
  }, [cameraStream])

  // Effect to stop camera when switching away from solar mode
  useEffect(() => {
    if (mode !== 'solar' && isCameraActive) {
      stopCamera()
    }
  }, [mode, isCameraActive])

  return (
    <div className="min-h-full bg-primary-800 p-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold flex items-center">
            <span className="mr-2">{mode === 'gps' ? '📡' : '☀️'}</span>
            {mode === 'gps' ? 'GPS Navigator' : 'Solar Calculator'}
          </h1>
          <div className="flex items-center">
            <span className="text-sm text-text-secondary mr-2">
              {mode === 'gps' && gpsLocation ? 'GPS Ready' : 'Offline'}
            </span>
            <div className={`w-2 h-2 rounded-full ${
              mode === 'gps' && gpsLocation ? 'bg-accent-green' : 'bg-accent-orange'
            }`}></div>
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

        {/* Camera View / GPS Status */}
        <div className="relative bg-black rounded-lg overflow-hidden mb-6" style={{ aspectRatio: '4/3' }}>
          {mode === 'solar' ? (
            <>
              {isCameraActive && cameraStream ? (
                <>
                  <video
                    ref={videoRef}
                    className="w-full h-full object-cover"
                    autoPlay
                    playsInline
                    muted
                  />
                  {/* Crosshairs Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="relative">
                      <div className="w-16 h-16 border-2 border-accent-green rounded-full"></div>
                      <div className="absolute top-1/2 left-1/2 w-1 h-16 bg-accent-green transform -translate-x-1/2 -translate-y-1/2"></div>
                      <div className="absolute top-1/2 left-1/2 w-16 h-1 bg-accent-green transform -translate-x-1/2 -translate-y-1/2"></div>
                      <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-accent-green rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
                    </div>
                  </div>
                  {/* Camera Status Indicator */}
                  <div className="absolute top-3 left-3 bg-black bg-opacity-70 text-white px-3 py-2 rounded-lg text-sm font-medium">
                    <span className="mr-1">📷</span>
                    Camera Active
                  </div>
                </>
              ) : (
                <>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-text-secondary text-center">
                      <p className="mb-2">📷</p>
                      <p className="text-sm">Start camera for sun alignment</p>
                      <button
                        onClick={startCamera}
                        className="mt-3 bg-accent-orange text-white px-4 py-2 rounded-lg text-sm font-medium"
                      >
                        Start Camera
                      </button>
                    </div>
                  </div>
                  {/* Crosshairs (placeholder mode) */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="relative">
                      <div className="w-16 h-16 border-2 border-accent-green opacity-30 rounded-full"></div>
                      <div className="absolute top-1/2 left-1/2 w-1 h-16 bg-accent-green opacity-30 transform -translate-x-1/2 -translate-y-1/2"></div>
                      <div className="absolute top-1/2 left-1/2 w-16 h-1 bg-accent-green opacity-30 transform -translate-x-1/2 -translate-y-1/2"></div>
                      <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-accent-green opacity-30 rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
                    </div>
                  </div>
                </>
              )}
            </>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-text-secondary text-center">
                {gpsLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto mb-2"></div>
                    <p className="text-sm">Acquiring GPS signal...</p>
                  </>
                ) : gpsLocation ? (
                  <>
                    <p className="mb-2 text-2xl">🌍</p>
                    <p className="text-sm text-accent-green">GPS Signal Acquired</p>
                    <p className="text-xs mt-1">Accuracy: ±{gpsLocation.accuracy?.toFixed(0)}m</p>
                  </>
                ) : (
                  <>
                    <p className="mb-2">📡</p>
                    <p className="text-sm">Tap 'Get GPS Location' to start</p>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Sensor Data Section */}
        {mode === 'solar' ? (
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
            <div className="flex gap-2 mt-3">
              {!isCameraActive ? (
                <button 
                  onClick={startCamera}
                  className="flex-1 bg-white text-accent-blue py-2 px-4 rounded-lg font-medium text-sm"
                >
                  <span className="mr-1">📷</span>
                  Start Camera
                </button>
              ) : (
                <button 
                  onClick={stopCamera}
                  className="flex-1 bg-accent-red text-white py-2 px-4 rounded-lg font-medium text-sm"
                >
                  <span className="mr-1">⏹️</span>
                  Stop Camera
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-accent-green rounded-lg p-4 mb-6">
            <h3 className="text-white font-semibold mb-4 flex items-center">
              <span className="mr-2">📡</span>
              GPS Location Data
            </h3>
            {gpsLocation ? (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-green-200 text-sm mb-1">Latitude</p>
                  <p className="text-white text-lg font-bold">{gpsLocation.lat.toFixed(6)}°</p>
                </div>
                <div>
                  <p className="text-green-200 text-sm mb-1">Longitude</p>
                  <p className="text-white text-lg font-bold">{gpsLocation.lng.toFixed(6)}°</p>
                </div>
              </div>
            ) : (
              <div className="text-center">
                <button
                  onClick={getGPSLocation}
                  disabled={gpsLoading}
                  className="bg-white text-accent-green px-6 py-3 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center mx-auto"
                >
                  {gpsLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-accent-green mr-2"></div>
                      Getting Location...
                    </>
                  ) : (
                    <>
                      <span className="mr-2">📍</span>
                      Get GPS Location
                    </>
                  )}
                </button>
              </div>
            )}
            {gpsLocation && (
              <p className="text-green-200 text-xs mt-3">
                GPS accuracy: ±{gpsLocation.accuracy?.toFixed(0)}m • High precision location
              </p>
            )}
          </div>
        )}

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
            disabled={isCalculating || (mode === 'solar' && !sensorPermission)}
            className="w-full bg-accent-blue text-white py-3 rounded-lg font-semibold disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isCalculating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                {mode === 'gps' ? 'Getting Location...' : 'Calculating...'}
              </>
            ) : (
              mode === 'gps' ? 'Get Current Location' : 'Calculate Position'
            )}
          </button>
        </div>

        {/* Results Section */}
        {lastResult && (
          <div className="bg-accent-green rounded-lg p-4 mb-6">
            <h3 className="text-white font-semibold mb-3 flex items-center">
              <span className="mr-2">{mode === 'gps' ? '📍' : '🎯'}</span>
              {mode === 'gps' ? 'Current Position' : 'Calculated Position'}
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
                {mode === 'gps' ? 'GPS position' : 'Solar calculation'} saved to database ✓
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
              <span className="text-text-secondary">GPS Permission</span>
              <span className={gpsPermission ? 'text-accent-green' : 'text-accent-red'}>
                {gpsPermission ? 'Granted' : 'Not Granted'}
              </span>
            </div>
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