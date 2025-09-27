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
          facingMode: 'environment',
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
      }
      
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
        setError('Failed to start video playback')
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

  const isActive = mode === 'gps' ? gpsPermission : sensorPermission

  return (
    <div className="min-h-screen p-4 page-transition">
      <div className="max-w-md mx-auto space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-text-inverse flex items-center">
            <span className="mr-2">{mode === 'gps' ? '📡' : '☀️'}</span>
            {mode === 'gps' ? 'GPS Navigator' : 'Solar Navigator'}
          </h1>
          <div className="flex items-center">
            <span className="text-text-inverse/70 text-sm mr-2">
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

        {/* Main Metric Cards */}
        {/* Full Screen Camera View for Solar Mode */}
        {mode === 'solar' && isCameraActive ? (
          <div className="fixed inset-0 bg-black z-40">
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              autoPlay
              playsInline
              muted
            />
            
            {/* Crosshair */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="relative">
                {/* Main crosshair */}
                <div className="w-12 h-12 border-2 border-accent-primary rounded-full opacity-90"></div>
                <div className="absolute top-1/2 left-1/2 w-6 h-0.5 bg-accent-primary -translate-x-1/2 -translate-y-1/2"></div>
                <div className="absolute top-1/2 left-1/2 w-0.5 h-6 bg-accent-primary -translate-x-1/2 -translate-y-1/2"></div>
                
                {/* Minimal pitch and azimuth display below crosshair */}
                <div className="absolute top-8 left-1/2 -translate-x-1/2 text-center text-white">
                  <div className="bg-black/60 backdrop-blur-sm rounded-lg px-3 py-1.5 text-sm font-medium">
                    <div className="flex gap-4">
                      <span>P: {pitch.toFixed(1)}°</span>
                      <span>A: {heading.toFixed(1)}°</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Exit camera button */}
            <button 
              onClick={stopCamera}
              className="absolute top-4 right-4 bg-accent-error/80 hover:bg-accent-error text-white rounded-full p-3 backdrop-blur-sm transition-all z-50"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ) : mode === 'solar' ? (
          <>
            {/* Solar Mode - Camera Pitch Card */}
            <div className="info-card text-center animate-fade-in">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-text-primary font-bold text-sm">CAMERA PITCH</h3>
                <span className={`status-dot ${sensorPermission ? 'status-online' : 'status-offline'}`}></span>
              </div>
              <div className="text-4xl font-bold text-text-primary mb-2">
                {pitch.toFixed(1)}°
              </div>
              <div className="text-text-secondary text-sm">
                {sensorPermission ? 'Active' : 'Permission Required'}
              </div>
            </div>

            {/* Azimuth Card */}
            <div className="info-card text-center animate-fade-in">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-text-primary font-bold text-sm">AZIMUTH</h3>
                <span className={`status-dot ${sensorPermission ? 'status-online' : 'status-offline'}`}></span>
              </div>
              <div className="text-4xl font-bold text-text-primary mb-2">
                {heading.toFixed(1)}°
              </div>
              <div className="text-text-secondary text-sm flex items-center justify-center">
                <div className="w-8 h-8 border border-text-secondary rounded-full mr-2 relative">
                  <div 
                    className="absolute top-0.5 left-1/2 w-0.5 h-3 bg-accent-success transform -translate-x-1/2 origin-bottom"
                    style={{ transform: `translate(-50%, 0) rotate(${heading}deg)` }}
                  ></div>
                </div>
                {sensorPermission ? 'Active' : 'Inactive'}
              </div>
            </div>
          </>
        ) : (
          <>
            {/* GPS Coordinates Card */}
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
          </>
        )}

        {/* Camera Status Card - Only show when not in full screen */}
        {mode === 'solar' && !isCameraActive && (
          <div className="info-card animate-slide-up">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-text-primary font-bold text-sm">CAMERA STATUS</h3>
              <span className={`status-dot ${isCameraActive ? 'status-online' : 'status-offline'}`}></span>
            </div>
            <div className="text-center py-4">
              <button onClick={startCamera} className="btn-primary w-full text-sm py-2">
                <span className="mr-2">📷</span>
                Start Camera
              </button>
            </div>
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

        {/* Calculate Button */}
        <button 
          onClick={calculatePosition}
          disabled={isCalculating || (mode === 'solar' && !sensorPermission)}
          className="btn-primary w-full py-3 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isCalculating ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              {mode === 'gps' ? 'Getting Location...' : 'Calculating...'}
            </div>
          ) : (
            <div className="flex items-center justify-center">
              <span className="mr-2">{mode === 'gps' ? '📍' : '🎯'}</span>
              {mode === 'gps' ? 'Get GPS Location' : 'Calculate Position'}
            </div>
          )}
        </button>

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
            <span className="status-dot status-offline mr-2"></span>
            <span>Offline Mode</span>
          </div>
          <p>Last updated: {new Date().toLocaleTimeString()}</p>
          <p>User: user_{Date.now().toString().slice(-6)}</p>
        </div>
      </div>
    </div>
  )
}

export default CelestiNavPage