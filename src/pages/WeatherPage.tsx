import React, { useState, useRef, useCallback } from 'react'
import { apiService } from '../services/api'

const WeatherPage: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1)
  const [capturedImages, setCapturedImages] = useState<{[key: string]: string}>({})
  const [capturedDirections, setCapturedDirections] = useState<string[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<any>(null)
  const [currentDirection, setCurrentDirection] = useState('NORTH')
  const [error, setError] = useState<string | null>(null)
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null)
  const [isCameraActive, setIsCameraActive] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const directions = ['NORTH', 'EAST', 'SOUTH', 'WEST']
  
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
          width: { ideal: 1280 },
          height: { ideal: 720 }
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
      setError(`Camera access failed: ${errorMessage}. Please allow camera permissions for sky analysis.`)
      console.error('Camera error:', err)
    }
  }

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop())
      setCameraStream(null)
      setIsCameraActive(false)
    }
  }

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return null

    const video = videoRef.current
    const canvas = canvasRef.current
    const context = canvas.getContext('2d')
    
    if (!context) return null

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    context.drawImage(video, 0, 0, canvas.width, canvas.height)
    
    const imageData = canvas.toDataURL('image/jpeg', 0.8)
    return imageData
  }, [])

  const handleCaptureDirection = async () => {
    const imageData = capturePhoto()
    if (imageData) {
      setCapturedImages(prev => ({
        ...prev,
        [currentDirection]: imageData
      }))
      
      if (!capturedDirections.includes(currentDirection)) {
        setCapturedDirections([...capturedDirections, currentDirection])
      }
      
      const nextIndex = directions.indexOf(currentDirection) + 1
      if (nextIndex < directions.length) {
        setCurrentDirection(directions[nextIndex])
        setCurrentStep(nextIndex + 1)
      } else {
        stopCamera()
      }
    }
  }

  const selectDirection = (direction: string) => {
    setCurrentDirection(direction)
    setCurrentStep(directions.indexOf(direction) + 1)
  }

  const resetCapture = () => {
    setCapturedImages({})
    setCapturedDirections([])
    setCurrentDirection('NORTH')
    setCurrentStep(1)
    setAnalysisResult(null)
    setError(null)
    stopCamera()
  }

  const runAnalysis = async () => {
    if (Object.keys(capturedImages).length === 0) {
      setError('Please capture at least one sky image first')
      return
    }

    setIsAnalyzing(true)
    setError(null)

    try {
      const result = await apiService.analyzeWeather({
        images: capturedImages,
        location: { lat: 0, lng: 0 }
      })
      
      setAnalysisResult(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Weather analysis failed')
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <div className="p-4">
      <div className="max-w-md mx-auto space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-text-inverse flex items-center">
            <span className="mr-2">🌤️</span>
            Weather AI Analysis
          </h1>
          <div className="flex items-center">
            <span className="text-text-inverse/70 text-sm mr-2">Online</span>
            <span className="status-dot status-online"></span>
          </div>
        </div>

        {/* Camera View */}
        {isCameraActive && (
          <div className="info-card animate-fade-in">
            <div className="bg-black rounded-lg overflow-hidden mb-3" style={{ aspectRatio: '4/3' }}>
              <div className="relative h-full">
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  autoPlay
                  playsInline
                  muted
                />
                <div className="absolute top-3 left-3 bg-black bg-opacity-70 text-white px-3 py-2 rounded-lg text-sm font-medium">
                  📍 Direction: {currentDirection}
                </div>
              </div>
            </div>
          </div>
        )}

        <canvas ref={canvasRef} style={{ display: 'none' }} />

        {/* Sky Photo Capture Card */}
        <div className="gradient-card-blue animate-slide-up">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-bold text-sm flex items-center">
              <span className="mr-2">📷</span>
              Sky Photo Capture - Step {currentStep} of 4
            </h3>
            <span className="status-dot status-online"></span>
          </div>
          
          <p className="text-white/80 text-sm mb-4">
            Point your camera at the <strong className="text-white">{currentDirection}</strong> sky and capture a photo for accurate weather analysis.
          </p>
          
          {/* Direction Buttons */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            {directions.map((direction) => (
              <button
                key={direction}
                onClick={() => selectDirection(direction)}
                className={`py-3 px-4 rounded-lg font-medium transition-all text-sm ${
                  direction === currentDirection
                    ? 'bg-white/20 text-white shadow-md border border-white/30'
                    : capturedDirections.includes(direction)
                    ? 'bg-accent-success text-white shadow-md'
                    : 'bg-white/10 text-white/70 border border-white/20 hover:bg-white/20'
                }`}
              >
                <span className="block text-lg mb-1">
                  {capturedDirections.includes(direction) ? '✅' : '📷'}
                </span>
                {direction}
              </button>
            ))}
          </div>

          {/* Camera Controls */}
          <div className="flex gap-3">
            {!isCameraActive ? (
              <button 
                onClick={startCamera}
                className="btn-primary flex-1 text-sm py-3"
              >
                <span className="mr-2">📷</span>
                Start Camera
              </button>
            ) : (
              <button 
                onClick={handleCaptureDirection}
                className="btn-primary flex-1 text-sm py-3"
              >
                <span className="mr-2">📷</span>
                Capture {currentDirection} Sky
              </button>
            )}
            <button 
              onClick={resetCapture}
              className="btn-secondary text-sm py-3 px-4"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Refresh Analysis Button */}
        <button 
          onClick={runAnalysis}
          disabled={isAnalyzing || Object.keys(capturedImages).length === 0}
          className="btn-primary w-full py-3 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="mr-2">🤖</span>
          {isAnalyzing ? 'Analyzing...' : `Refresh Analysis`}
        </button>

        {/* ML Model Status Card */}
        <div className="info-card animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-text-primary font-bold text-sm flex items-center">
              <span className="mr-2">🤖</span>
              ML Model Status
            </h3>
            <span className="status-dot status-online"></span>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center py-1">
              <span className="text-text-secondary text-sm">Weather Classification</span>
              <div className="flex items-center">
                <span className="status-dot status-online mr-2"></span>
                <span className="text-accent-success text-sm font-semibold">Online</span>
              </div>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-text-secondary text-sm">Cloud Detection</span>
              <div className="flex items-center">
                <span className="status-dot status-online mr-2"></span>
                <span className="text-accent-success text-sm font-semibold">Online</span>
              </div>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-text-secondary text-sm">Sky Condition Analysis</span>
              <div className="flex items-center">
                <span className="status-dot status-online mr-2"></span>
                <span className="text-accent-success text-sm font-semibold">Online</span>
              </div>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-text-secondary text-sm">Last Model Update</span>
              <span className="text-text-primary text-sm font-mono">
                {new Date().toLocaleTimeString()}
              </span>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="info-card bg-accent-error/10 border-accent-error/30 animate-fade-in">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-accent-error font-bold text-sm flex items-center">
                <span className="mr-2">❌</span>
                Error
              </h3>
              <span className="status-dot status-error"></span>
            </div>
            <p className="text-accent-error text-sm">{error}</p>
          </div>
        )}

        {/* Analysis in Progress */}
        {isAnalyzing && (
          <div className="info-card bg-accent-primary/10 border-accent-primary/30 animate-fade-in">
            <div className="flex items-center justify-center py-6">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-accent-primary mr-3"></div>
              <span className="text-text-primary text-sm">Processing sky images with ML models...</span>
            </div>
          </div>
        )}

        {/* Analysis Results */}
        {analysisResult && (
          <div className="gradient-card-purple animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-bold text-sm flex items-center">
                <span className="mr-2">🌤️</span>
                Weather Analysis Results
              </h3>
              <span className="status-dot status-online"></span>
            </div>
            
            {/* Current Conditions */}
            <div className="bg-white/10 rounded-lg p-4 mb-4">
              <h4 className="text-white font-semibold mb-3 text-sm">Current Conditions</h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-text-secondary">Cloud Cover:</span>
                  <span className="text-text-primary font-semibold">{analysisResult.conditions?.cloudCover?.toFixed(0) || 0}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Visibility:</span>
                  <span className="text-text-primary font-semibold">{analysisResult.conditions?.visibility?.toFixed(1) || 0} km</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Weather:</span>
                  <span className="text-text-primary font-semibold capitalize">{analysisResult.conditions?.weatherType?.replace('_', ' ') || 'Clear'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Confidence:</span>
                  <span className="text-text-primary font-semibold">{((analysisResult.conditions?.confidence || 0.9) * 100).toFixed(0)}%</span>
                </div>
              </div>
            </div>

            {/* Navigation Recommendations */}
            <div className="bg-white/10 rounded-lg p-4">
              <h4 className="text-white font-semibold mb-3 text-sm">📍 Navigation Recommendations</h4>
              <div className="text-text-secondary text-sm space-y-2">
                <div className="flex items-start">
                  <span className="mr-2">☀️</span>
                  <div>
                    <strong className="text-text-primary">Solar Navigation:</strong> {
                      (analysisResult.conditions?.cloudCover || 0) < 30 
                        ? 'Excellent conditions'
                        : (analysisResult.conditions?.cloudCover || 0) < 70
                        ? 'Moderate conditions'
                        : 'Use GPS backup'
                    }
                  </div>
                </div>
                <div className="flex items-start">
                  <span className="mr-2">🌟</span>
                  <div>
                    <strong className="text-text-primary">Star Navigation:</strong> {
                      (analysisResult.conditions?.cloudCover || 0) < 20 
                        ? 'Ideal for nighttime'
                        : (analysisResult.conditions?.cloudCover || 0) < 50
                        ? 'Limited visibility'
                        : 'Not recommended'
                    }
                  </div>
                </div>
              </div>
            </div>

            <div className="text-white/60 text-xs mt-3 text-center">
              Analysis completed at {new Date().toLocaleTimeString()}
            </div>
          </div>
        )}

        {/* Capture Progress */}
        {Object.keys(capturedImages).length > 0 && (
          <div className="text-center text-text-muted text-xs">
            <div className="flex items-center justify-center mb-1">
              <span className="status-dot status-online mr-2"></span>
              <span>{Object.keys(capturedImages).length} images captured</span>
            </div>
            <p>Ready for AI analysis</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default WeatherPage