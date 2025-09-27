import React, { useState, useEffect, useRef } from 'react'
import { useMeasurements } from '../hooks/useDatabase'
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
  const videoRef = useRef<HTMLVideoElement>(null)

  const { measurements } = useMeasurements()

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
        await videoRef.current.play()
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
        temperature
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

  useEffect(() => {
    if (cameraStream && videoRef.current) {
      videoRef.current.srcObject = cameraStream
      videoRef.current.play().catch((err) => {
        console.error('Error playing video:', err)
      })
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

      {/* Center Crosshair with Circle */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
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

      {/* Shutter Button - Above Bottom Navigation */}
      <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-20">
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

      {/* Status indicator - bottom left */}
      <div className="absolute bottom-4 left-4 text-white text-xs z-10">
        <div className="bg-black/50 backdrop-blur-sm rounded px-2 py-1">
          <div className="flex items-center gap-1">
            <span className={`w-2 h-2 rounded-full ${sensorPermission ? 'bg-green-400' : 'bg-red-400'}`}></span>
            <span>{sensorPermission ? 'SENSORS ACTIVE' : 'NO SENSORS'}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CelestiNavPage