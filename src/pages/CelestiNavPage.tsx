import React, { useState, useEffect, useRef } from 'react'
import { useMeasurements } from '../hooks/useDatabase'
import { useAuth } from '../hooks/useAuth'
import { apiService } from '../services/api'

const CelestiNavPage: React.FC = () => {
  const [pitch, setPitch] = useState(0)
  const [heading, setHeading] = useState(0)
  const [elevation, setElevation] = useState(0)
  const [pressure, setPressure] = useState(1013.25)
  const [temperature, setTemperature] = useState(15)
  const [isCalculating, setIsCalculating] = useState(false)
  const [lastResult, setLastResult] = useState<{ lat: number; lng: number } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [sensorPermission, setSensorPermission] = useState(false)
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null)
  const [isCameraActive, setIsCameraActive] = useState(false)
  const [showResult, setShowResult] = useState(false)
  const [showDatabase, setShowDatabase] = useState(false)
  const [selectedMeasurement, setSelectedMeasurement] = useState<any>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  const { measurements } = useMeasurements()
  const { user } = useAuth()

  // Auto-start camera when component mounts
  useEffect(() => {
    startCamera()
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop())
      }
    }
  }, [])

  // Camera functionality
  const startCamera = async () => {
    try {
      setError(null)
      
      // Check if mediaDevices is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera not supported on this device')
      }
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      })

      setCameraStream(stream)
      setIsCameraActive(true)

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        try {
          await videoRef.current.play()
        } catch (playError) {
          console.warn('Video play interrupted, retrying...', playError)
          // Retry play after a short delay
          setTimeout(async () => {
            try {
              if (videoRef.current && videoRef.current.srcObject) {
                await videoRef.current.play()
              }
            } catch (retryError) {
              console.error('Video play retry failed:', retryError)
            }
          }, 100)
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Camera access denied'
      setError(`Camera access failed: ${errorMessage}. Please allow camera permissions.`)
      console.error('Camera error:', err)
    }
  }

  // Device orientation sensor handling
  useEffect(() => {
    const handleOrientation = (event: DeviceOrientationEvent) => {
      if (event.beta !== null && event.alpha !== null) {
        setPitch(event.beta - 90) // Adjust for altitude

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

  const captureReading = async () => {
    setIsCalculating(true)
    setError(null)
    setShowResult(false)

    try {
      if (!sensorPermission) {
        setError('Device orientation permission required')
        return
      }

      const result = await apiService.calculateSolarPosition({
        pitch,
        heading,
        elevation,
        pressure,
        temperature,
        userId: user?.id
      })

      setLastResult({ lat: result.latitude, lng: result.longitude })
      setShowResult(true)

      // Auto-hide result after 5 seconds
      setTimeout(() => {
        setShowResult(false)
      }, 5000)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Calculation failed')
    } finally {
      setIsCalculating(false)
    }
  }

  const toggleDatabase = () => {
    setShowDatabase(!showDatabase)
    setSelectedMeasurement(null)
  }

  const selectMeasurement = (measurement: any) => {
    setSelectedMeasurement(measurement)
    if (measurement.latitude && measurement.longitude) {
      setLastResult({ lat: measurement.latitude, lng: measurement.longitude })
      setShowResult(true)
      setTimeout(() => {
        setShowResult(false)
      }, 8000)
    }
  }

  useEffect(() => {
    if (cameraStream && videoRef.current) {
      videoRef.current.srcObject = cameraStream
      const playVideo = async () => {
        try {
          await videoRef.current?.play()
        } catch (err) {
          console.warn('Video play error, retrying...', err)
          setTimeout(async () => {
            try {
              await videoRef.current?.play()
            } catch (retryErr) {
              console.error('Video play retry failed:', retryErr)
            }
          }, 200)
        }
      }
      playVideo()
    }
  }, [cameraStream])

  // Full-screen mobile camera interface with touch optimizations
  return (
    <div 
      className="fixed inset-0 bg-black z-50 overflow-hidden touch-none select-none" 
      style={{ 
        height: '100vh', 
        width: '100vw', 
        position: 'fixed',
        WebkitUserSelect: 'none',
        WebkitTouchCallout: 'none',
        WebkitTapHighlightColor: 'transparent'
      }}
    >
      {/* Camera Video Feed */}
      {isCameraActive && (
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover"
          autoPlay
          playsInline
          muted
          style={{
            WebkitTransform: 'translateZ(0)', // Hardware acceleration
            transform: 'translateZ(0)'
          }}
        />
      )}

      {/* Camera not available overlay */}
      {!isCameraActive && (
        <div className="absolute inset-0 bg-black flex items-center justify-center">
          <div className="text-center text-white px-4">
            <div className="text-6xl mb-4 animate-pulse">📷</div>
            <p className="text-lg mb-4 font-medium">Starting camera...</p>
            {error && <p className="text-red-400 text-sm max-w-sm mx-auto leading-relaxed">{error}</p>}
          </div>
        </div>
      )}

      {/* Grid Lines (3x3) */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Vertical lines */}
        <div className="absolute left-1/3 top-0 bottom-0 w-0.5 bg-white/30"></div>
        <div className="absolute left-2/3 top-0 bottom-0 w-0.5 bg-white/30"></div>
        {/* Horizontal lines */}
        <div className="absolute top-1/3 left-0 right-0 h-0.5 bg-white/30"></div>
        <div className="absolute top-2/3 left-0 right-0 h-0.5 bg-white/30"></div>
      </div>

      {/* Center Crosshair with Circle - Fixed positioning */}
      <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-10">
        <div className="relative">
          {/* Outer circle */}
          <div className="w-16 h-16 border-2 border-yellow-400 rounded-full opacity-90"></div>
          {/* Center crosshair */}
          <div className="absolute top-1/2 left-1/2 w-8 h-0.5 bg-yellow-400 -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute top-1/2 left-1/2 w-0.5 h-8 bg-yellow-400 -translate-x-1/2 -translate-y-1/2"></div>
          {/* Center dot */}
          <div className="absolute top-1/2 left-1/2 w-1 h-1 bg-yellow-400 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
        </div>
      </div>

      {/* Pitch and Heading Display - Top Center */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 text-center text-white z-10">
        <div className="bg-black/60 backdrop-blur-sm rounded-lg px-4 py-2">
          <div className="flex gap-6 text-sm font-medium">
            <div>
              <span className="text-white/70">PITCH: </span>
              <span className="text-green-400 font-mono">{pitch.toFixed(1)}°</span>
            </div>
            <div>
              <span className="text-white/70">AZIMUTH: </span>
              <span className="text-green-400 font-mono">{heading.toFixed(1)}°</span>
            </div>
          </div>
          {!sensorPermission && (
            <div className="text-red-400 text-xs mt-1">No sensor data</div>
          )}
        </div>
      </div>

      {/* Result Display */}
      {showResult && lastResult && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 text-center text-white z-10">
          <div className="bg-green-600/90 backdrop-blur-sm rounded-lg px-4 py-3">
            <div className="text-sm font-bold mb-1">Position Calculated</div>
            <div className="text-xs font-mono">
              <div>Lat: {lastResult.lat.toFixed(6)}°</div>
              <div>Lng: {lastResult.lng.toFixed(6)}°</div>
            </div>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 text-center text-white z-10">
          <div className="bg-red-600/90 backdrop-blur-sm rounded-lg px-4 py-2">
            <div className="text-sm">{error}</div>
          </div>
        </div>
      )}

      {/* Camera Controls - Bottom Center - Mobile Optimized */}
      <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-20 flex items-center gap-8">
        {/* Database Button - Left of Shutter - Larger touch target */}
        <button
          onClick={toggleDatabase}
          className="w-16 h-16 bg-black/60 backdrop-blur-sm rounded-full flex items-center justify-center text-white text-xl border-2 border-white/40 active:scale-90 transition-all duration-150 shadow-xl"
          style={{ minHeight: '44px', minWidth: '44px' }} // iOS touch target minimum
        >
          <span role="img" aria-label="Database">📊</span>
        </button>
        
        {/* Shutter Button - Enhanced for mobile */}
        <button
          onClick={captureReading}
          disabled={isCalculating || !sensorPermission}
          className="w-20 h-20 bg-white border-4 border-white rounded-full shadow-2xl active:scale-90 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden"
          style={{ 
            minHeight: '44px', 
            minWidth: '44px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.4), 0 0 0 4px rgba(255,255,255,0.2)'
          }}
        >
          {isCalculating ? (
            <div className="w-full h-full rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
              <div className="animate-spin rounded-full h-6 w-6 border-3 border-white border-t-transparent"></div>
            </div>
          ) : (
            <div className="w-full h-full rounded-full bg-gradient-to-br from-red-500 to-red-600 shadow-inner"></div>
          )}
          
          {/* Pulse animation ring for better visibility */}
          {sensorPermission && !isCalculating && (
            <div className="absolute inset-0 rounded-full border-2 border-white/30 animate-ping"></div>
          )}
        </button>
      </div>

      {/* Settings Button - Bottom Right - Mobile Optimized */}
      <div className="absolute bottom-6 right-6 z-10">
        <button
          onClick={() => {
            // Mobile-optimized prompt with better UX
            const newElevation = prompt(`🏔️ Current elevation: ${elevation}m\n\nEnter new elevation (meters):`, elevation.toString())
            if (newElevation && !isNaN(Number(newElevation)) && Number(newElevation) >= -500 && Number(newElevation) <= 9000) {
              setElevation(Number(newElevation))
            } else if (newElevation && isNaN(Number(newElevation))) {
              alert('Please enter a valid number')
            }
          }}
          className="w-14 h-14 bg-black/60 backdrop-blur-sm rounded-full flex items-center justify-center text-white text-lg border-2 border-white/40 active:scale-90 transition-all duration-150 shadow-xl"
          style={{ minHeight: '44px', minWidth: '44px' }}
        >
          <span role="img" aria-label="Settings">⚙️</span>
        </button>
      </div>

      {/* Database Panel - Mobile Optimized */}
      {showDatabase && (
        <div className="absolute inset-0 bg-black/85 backdrop-blur-sm z-30 flex items-end justify-center">
          <div 
            className="bg-black/95 rounded-t-2xl p-4 w-full max-h-[80vh] overflow-hidden shadow-2xl"
            style={{ 
              WebkitOverflowScrolling: 'touch',
              transform: 'translateZ(0)' // Hardware acceleration
            }}
          >
            {/* Handle bar for swipe gesture indication */}
            <div className="w-12 h-1 bg-white/30 rounded-full mx-auto mb-4"></div>
            
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-bold text-xl">📍 Stored Locations</h3>
              <button
                onClick={toggleDatabase}
                className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-white/70 hover:text-white text-xl active:scale-90 transition-all"
                style={{ minHeight: '44px', minWidth: '44px' }}
              >
                ✕
              </button>
            </div>
            
            <div className="overflow-y-auto max-h-[60vh] pr-2" style={{ WebkitOverflowScrolling: 'touch' }}>
            
            {measurements.length === 0 ? (
                <div className="text-center text-white/70 py-12">
                  <div className="text-5xl mb-4 animate-bounce">📍</div>
                  <p className="text-lg font-medium">No measurements saved yet</p>
                  <p className="text-sm mt-2 text-white/50">Capture your first reading!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {measurements.slice(0, 10).map((measurement) => (
                    <button
                      key={measurement.id}
                      onClick={() => selectMeasurement(measurement)}
                      className="w-full text-left p-4 bg-white/10 hover:bg-white/20 active:bg-white/30 rounded-xl transition-all duration-200 border border-white/20 active:scale-[0.98]"
                      style={{ 
                        minHeight: '44px',
                        WebkitTapHighlightColor: 'transparent'
                      }}
                    >
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-white font-medium text-sm">
                        #{measurement.id}
                      </span>
                      <span className="text-white/60 text-xs">
                        {new Date(measurement.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                    
                    {measurement.latitude && measurement.longitude ? (
                      <div className="text-white/80 text-xs font-mono space-y-1">
                        <div>Lat: {measurement.latitude.toFixed(6)}°</div>
                        <div>Lng: {measurement.longitude.toFixed(6)}°</div>
                        <div className="text-white/60">
                          Pitch: {measurement.pitch.toFixed(1)}° | Az: {measurement.heading.toFixed(1)}°
                        </div>
                      </div>
                    ) : (
                      <div className="text-white/60 text-xs">No location data</div>
                    )}
                    
                    {measurement.calculationMethod && (
                      <div className="mt-1">
                        <span className={`text-xs px-2 py-1 rounded ${
                          measurement.calculationMethod === 'solar' 
                            ? 'bg-yellow-500/20 text-yellow-300' 
                            : 'bg-blue-500/20 text-blue-300'
                        }`}>
                          {measurement.calculationMethod.toUpperCase()}
                        </span>
                      </div>
                    )}
                  </button>
                ))}
                
                {measurements.length > 10 && (
                  <div className="text-center text-white/60 text-xs py-2">
                    Showing latest 10 of {measurements.length} measurements
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Selected Measurement Details */}
      {selectedMeasurement && (
        <div className="absolute top-32 left-1/2 -translate-x-1/2 text-center text-white z-10">
          <div className="bg-blue-600/90 backdrop-blur-sm rounded-lg px-4 py-3">
            <div className="text-sm font-bold mb-1">Measurement #{selectedMeasurement.id}</div>
            <div className="text-xs font-mono">
              <div>Lat: {selectedMeasurement.latitude?.toFixed(6)}°</div>
              <div>Lng: {selectedMeasurement.longitude?.toFixed(6)}°</div>
              <div className="text-blue-200 mt-1">
                Captured: {new Date(selectedMeasurement.timestamp).toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Status indicator - bottom left - Mobile enhanced */}
      <div className="absolute bottom-6 left-6 text-white text-sm z-10">
        <div className="bg-black/70 backdrop-blur-sm rounded-xl px-3 py-2 border border-white/20">
          <div className="flex items-center gap-2">
            <span 
              className={`w-3 h-3 rounded-full ${sensorPermission ? 'bg-green-400 animate-pulse' : 'bg-red-400'} shadow-lg`}
              style={{
                boxShadow: sensorPermission ? '0 0 10px rgba(34, 197, 94, 0.5)' : '0 0 10px rgba(239, 68, 68, 0.5)'
              }}
            ></span>
            <span className="font-medium">
              {sensorPermission ? 'SENSORS ON' : 'NO SENSORS'}
            </span>
          </div>
          {measurements.length > 0 && (
            <div className="mt-1 text-white/70 text-xs flex items-center gap-1">
              <span>📊</span>
              <span>{measurements.length} saved</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default CelestiNavPage
