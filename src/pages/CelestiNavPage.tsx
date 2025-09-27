
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
  const [isFullScreenCamera, setIsFullScreenCamera] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())
  const videoRef = useRef<HTMLVideoElement>(null)

  const { measurements } = useMeasurements()

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // Camera functionality
  const startCamera = async () => {
    try {
      setError(null)
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment',
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      })
      
      setCameraStream(stream)
      setIsCameraActive(true)
      setIsFullScreenCamera(true)
      
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
      setIsFullScreenCamera(false)
    }
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

  // Device orientation sensor handling
  useEffect(() => {
    const handleOrientation = (event: DeviceOrientationEvent) => {
      if (event.beta !== null && event.alpha !== null) {
        setPitch(event.beta - 90)
        
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
        const location = gpsLocation || await getGPSLocation()
        setLastResult({ lat: location.lat, lng: location.lng })
        
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
        
        // Stop camera after successful calculation
        if (isFullScreenCamera) {
          stopCamera()
        }
      }
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Calculation failed')
    } finally {
      setIsCalculating(false)
    }
  }

  const handleShutterClick = () => {
    if (isFullScreenCamera && sensorPermission) {
      calculatePosition()
    }
  }

  useEffect(() => {
    if (cameraStream && videoRef.current) {
      videoRef.current.srcObject = cameraStream
      videoRef.current.play().catch((err) => {
        console.error('Error playing video:', err)
        setError('Failed to start video playbook')
      })
    }
  }, [cameraStream])

  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop())
      }
    }
  }, [cameraStream])

  useEffect(() => {
    if (mode !== 'solar' && isCameraActive) {
      stopCamera()
    }
  }, [mode, isCameraActive])

  // Auto-start camera when switching to solar mode
  useEffect(() => {
    if (mode === 'solar' && !isCameraActive) {
      startCamera()
    }
  }, [mode])

  const isActive = mode === 'gps' ? gpsPermission : sensorPermission

  // Full-screen camera view
  if (isFullScreenCamera && mode === 'solar') {
    return (
      <div className="fixed inset-0 bg-black z-50 flex flex-col">
        {/* Camera feed */}
        <video
          ref={videoRef}
          className="flex-1 w-full h-full object-cover"
          autoPlay
          playsInline
          muted
        />
        
        {/* Crosshair overlay */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="relative">
            {/* Main crosshair circle */}
            <div className="w-16 h-16 border-2 border-white rounded-full opacity-90 shadow-lg"></div>
            {/* Horizontal line */}
            <div className="absolute top-1/2 left-1/2 w-8 h-0.5 bg-white -translate-x-1/2 -translate-y-1/2 shadow-md"></div>
            {/* Vertical line */}
            <div className="absolute top-1/2 left-1/2 w-0.5 h-8 bg-white -translate-x-1/2 -translate-y-1/2 shadow-md"></div>
          </div>
        </div>
        
        {/* Live data overlay */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 mt-12 pointer-events-none">
          <div className="bg-black/60 backdrop-blur-sm rounded-xl px-4 py-2 text-white text-center">
            <div className="flex gap-6 items-center justify-center text-sm">
              <div className="flex flex-col items-center">
                <span className="text-xs text-gray-300 uppercase tracking-wide">PITCH</span>
                <span className="text-lg font-bold font-mono text-green-400">
                  {pitch.toFixed(2)}°
                </span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-xs text-gray-300 uppercase tracking-wide">HEADING</span>
                <span className="text-lg font-bold font-mono text-green-400">
                  {heading.toFixed(2)}°
                </span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-xs text-gray-300 uppercase tracking-wide">TIME</span>
                <span className="text-sm font-bold font-mono text-orange-400">
                  {currentTime.toLocaleTimeString([], { hour12: false })}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Controls at bottom */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
          <div className="flex items-center justify-between max-w-lg mx-auto">
            {/* Exit button */}
            <button 
              onClick={stopCamera}
              className="bg-white/20 hover:bg-white/30 text-white rounded-full p-3 backdrop-blur-sm transition-all"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            {/* Shutter button */}
            <button
              onClick={handleShutterClick}
              disabled={isCalculating || !sensorPermission}
              className={`w-20 h-20 rounded-full border-4 border-white transition-all duration-200 ${
                isCalculating 
                  ? 'bg-yellow-500' 
                  : sensorPermission 
                    ? 'bg-red-500 hover:bg-red-600 active:scale-95' 
                    : 'bg-gray-500'
              } disabled:opacity-50`}
              style={{ 
                boxShadow: isCalculating ? 'none' : '0 0 20px rgba(239, 68, 68, 0.8)' 
              }}
            >
              {isCalculating && (
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-white border-t-transparent mx-auto"></div>
              )}
            </button>
            
            {/* Spacer */}
            <div className="w-12"></div>
          </div>
        </div>
        
        {/* Status indicator */}
        <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm rounded-lg px-3 py-1.5 text-white text-sm">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${sensorPermission ? 'bg-green-400' : 'bg-red-400'}`}></span>
            <span>{sensorPermission ? 'ACTIVE' : 'NO SENSOR'}</span>
          </div>
        </div>
        
        {/* Error overlay */}
        {error && (
          <div className="absolute top-20 left-4 right-4 bg-red-500/90 backdrop-blur-sm rounded-lg p-4 text-white text-center">
            <p className="text-sm font-medium">{error}</p>
            <button 
              onClick={() => setError(null)}
              className="mt-2 text-xs underline opacity-80"
            >
              Dismiss
            </button>
          </div>
        )}
      </div>
    )
  }

  // Regular UI when not in full-screen camera mode
  return (
    <div className="p-4">
      <div className="max-w-md mx-auto space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-contrast-high flex items-center">
            <span className="mr-2">{mode === 'gps' ? '📡' : '☀️'}</span>
            {mode === 'gps' ? 'GPS Navigator' : 'Solar Navigator'}
          </h1>
          <div className="flex items-center">
            <span className="text-contrast-medium text-sm mr-2">
              {isActive ? 'Online' : 'Offline'}
            </span>
            <span className={`status-dot ${isActive ? 'status-online' : 'status-offline'}`}></span>
          </div>
        </div>

        {/* Mode Toggle */}
        <div className="toggle-group">
          <button
            onClick={() => setMode('gps')}
            className={`toggle-option ${mode === 'gps' ? 'toggle-active' : 'toggle-inactive'}`}
          >
            <span className="mr-1">📡</span>
            GPS Mode
          </button>
          <button
            onClick={() => setMode('solar')}
            className={`toggle-option ${mode === 'solar' ? 'toggle-active' : 'toggle-inactive'}`}
          >
            <span className="mr-1">☀️</span>
            Solar Mode
          </button>
        </div>

        {/* GPS Mode Content */}
        {mode === 'gps' && (
          <div className="info-card animate-fade-in">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-text-primary font-bold text-sm">GPS COORDINATES</h3>
              <span className={`status-dot ${gpsLocation ? 'status-online' : 'status-offline'}`}></span>
            </div>
            {gpsLocation ? (
              <div className="space-y-2">
                <div className="text-lg font-bold text-text-primary">
                  {gpsLocation.lat.toFixed(6)}°
                </div>
                <div className="text-lg font-bold text-text-primary">
                  {gpsLocation.lng.toFixed(6)}°
                </div>
                <div className="text-text-secondary text-xs">
                  Accuracy: ±{gpsLocation.accuracy?.toFixed(0)}m
                </div>
              </div>
            ) : gpsLoading ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-2 border-accent-primary border-t-transparent mx-auto mb-2"></div>
                <div className="text-text-secondary text-sm">Getting location...</div>
              </div>
            ) : (
              <div className="text-center py-4">
                <div className="text-2xl mb-2">📡</div>
                <div className="text-text-secondary text-sm">No GPS signal</div>
              </div>
            )}
          </div>
        )}

        {/* Solar Mode - Start Camera */}
        {mode === 'solar' && !isCameraActive && (
          <div className="info-card animate-slide-up text-center py-8">
            <div className="text-4xl mb-4">📷</div>
            <h3 className="text-text-primary font-bold text-lg mb-2">Camera Required</h3>
            <p className="text-text-secondary text-sm mb-4">
              Point your camera at the sun to calculate position
            </p>
            <button onClick={startCamera} className="btn-primary">
              Start Camera View
            </button>
          </div>
        )}

        {/* Environmental Parameters */}
        <div className="info-card animate-slide-up">
          <h3 className="text-text-primary font-bold text-sm mb-4">Environmental Parameters</h3>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-text-secondary text-xs mb-1">Elevation (m)</label>
                <input
                  type="number"
                  value={elevation}
                  onChange={(e) => setElevation(Number(e.target.value))}
                  className="w-full bg-surface-50/90 backdrop-blur-sm border border-white/30 rounded-lg px-3 py-2 text-text-primary text-sm focus:border-accent-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/20"
                />
              </div>
              <div>
                <label className="block text-text-secondary text-xs mb-1">Pressure (hPa)</label>
                <input
                  type="number"
                  value={pressure}
                  onChange={(e) => setPressure(Number(e.target.value))}
                  className="w-full bg-surface-50/90 backdrop-blur-sm border border-white/30 rounded-lg px-3 py-2 text-text-primary text-sm focus:border-accent-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/20"
                />
              </div>
            </div>
            <div>
              <label className="block text-text-secondary text-xs mb-1">Temperature (°C)</label>
              <input
                type="number"
                value={temperature}
                onChange={(e) => setTemperature(Number(e.target.value))}
                className="w-full bg-surface-50/90 backdrop-blur-sm border border-white/30 rounded-lg px-3 py-2 text-text-primary text-sm focus:border-accent-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/20"
              />
            </div>
          </div>
        </div>

        {/* Calculate Button - Only show for GPS mode when not in camera */}
        {mode === 'gps' && (
          <button 
            onClick={calculatePosition}
            disabled={isCalculating}
            className="btn-primary w-full py-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCalculating ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Getting Location...
              </div>
            ) : (
              <div className="flex items-center justify-center">
                <span className="mr-2">📍</span>
                Get GPS Location
              </div>
            )}
          </button>
        )}

        {/* Results */}
        {lastResult && (
          <div className="gradient-card-blue animate-fade-in">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-white font-bold text-sm">
                {mode === 'gps' ? 'GPS LOCATION' : 'CALCULATED POSITION'}
              </h3>
              <span className="status-dot bg-white/90"></span>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-white/80">Latitude:</span>
                <span className="text-white font-mono font-bold">{lastResult.lat.toFixed(6)}°</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/80">Longitude:</span>
                <span className="text-white font-mono font-bold">{lastResult.lng.toFixed(6)}°</span>
              </div>
            </div>
          </div>
        )}

        {/* Database Status */}
        {measurements.length > 0 && (
          <div className="info-card animate-fade-in">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-text-primary font-bold text-sm">DATABASE</h3>
              <span className="status-dot status-online"></span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-text-secondary text-sm">{measurements.length} locations saved</span>
              <button className="btn-secondary text-xs py-1 px-3">
                Show History
              </button>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="info-card bg-accent-error/10 border-accent-error/30 animate-fade-in">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-accent-error font-bold text-sm">ERROR</h3>
              <span className="status-dot status-error"></span>
            </div>
            <p className="text-accent-error text-sm">{error}</p>
          </div>
        )}

        {/* Refresh Button */}
        <div className="flex justify-center pt-2">
          <button className="btn-secondary text-sm py-2 px-4" onClick={() => window.location.reload()}>
            <span className="mr-2">🔄</span>
            Refresh
          </button>
        </div>

        {/* User info footer */}
        <div className="text-center text-text-inverse/50 text-xs pt-2">
          <div className="flex items-center justify-center mb-1">
            <span className="status-dot status-online mr-2"></span>
            <span>Online</span>
          </div>
          <p>Last updated: {new Date().toLocaleTimeString()}</p>
        </div>
      </div>
    </div>
  )
}

export default CelestiNavPage
