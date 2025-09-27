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

  // Full-screen camera interface with disabled scrolling
  return (
    <div className="fixed inset-0 bg-black z-50 overflow-hidden touch-none" style={{ height: '100vh', width: '100vw', position: 'fixed' }}>
      {/* Camera Video Feed */}
      {isCameraActive && (
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover"
          autoPlay
          playsInline
          muted
        />
      )}

      {/* Camera not available overlay */}
      {!isCameraActive && (
        <div className="absolute inset-0 bg-black flex items-center justify-center">
          <div className="text-center text-white">
            <div className="text-6xl mb-4">📷</div>
            <p className="text-lg mb-4">Starting camera...</p>
            {error && <p className="text-red-400 text-sm">{error}</p>}
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

      {/* Camera Controls - Bottom Center */}
      <div className="absolute bottom-32 left-1/2 -translate-x-1/2 z-20 flex items-center gap-6">
        {/* Database Button - Left of Shutter */}
        <button
          onClick={toggleDatabase}
          className="w-12 h-12 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white text-lg border border-white/30 active:scale-95 transition-transform"
        >
          📊
        </button>
        
        {/* Shutter Button */}
        <button
          onClick={captureReading}
          disabled={isCalculating || !sensorPermission}
          className="w-14 h-14 bg-white border-3 border-white rounded-full shadow-lg active:scale-95 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isCalculating ? (
            <div className="w-full h-full rounded-full bg-yellow-400 flex items-center justify-center">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
            </div>
          ) : (
            <div className="w-full h-full rounded-full bg-red-500"></div>
          )}
        </button>
      </div>

      {/* Settings Button - Bottom Right */}
      <div className="absolute bottom-4 right-4 z-10">
        <button
          onClick={() => {
            // Simple toggle for basic environmental settings
            const newElevation = prompt(`Current elevation: ${elevation}m\nEnter new elevation:`, elevation.toString())
            if (newElevation && !isNaN(Number(newElevation))) {
              setElevation(Number(newElevation))
            }
          }}
          className="w-10 h-10 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white text-sm border border-white/30 active:scale-95 transition-transform"
        >
          ⚙️
        </button>
      </div>

      {/* Database Panel */}
      {showDatabase && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-30 flex items-center justify-center p-4">
          <div className="bg-black/90 rounded-lg p-4 max-w-sm w-full max-h-96 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-bold text-lg">Stored Locations</h3>
              <button
                onClick={toggleDatabase}
                className="text-white/70 hover:text-white text-xl"
              >
                ✕
              </button>
            </div>
            
            {measurements.length === 0 ? (
              <div className="text-center text-white/70 py-8">
                <div className="text-3xl mb-2">📍</div>
                <p>No measurements saved yet</p>
                <p className="text-sm mt-1">Capture your first reading!</p>
              </div>
            ) : (
              <div className="space-y-2">
                {measurements.slice(0, 10).map((measurement) => (
                  <button
                    key={measurement.id}
                    onClick={() => selectMeasurement(measurement)}
                    className="w-full text-left p-3 bg-white/10 hover:bg-white/20 rounded-lg transition-colors border border-white/20"
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

      {/* Status indicator - bottom left */}
      <div className="absolute bottom-4 left-4 text-white text-xs z-10">
        <div className="bg-black/50 backdrop-blur-sm rounded px-2 py-1">
          <div className="flex items-center gap-1">
            <span className={`w-2 h-2 rounded-full ${sensorPermission ? 'bg-green-400' : 'bg-red-400'}`}></span>
            <span>{sensorPermission ? 'SENSORS ACTIVE' : 'NO SENSORS'}</span>
          </div>
          {measurements.length > 0 && (
            <div className="mt-1 text-white/70">
              {measurements.length} saved
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default CelestiNavPage
