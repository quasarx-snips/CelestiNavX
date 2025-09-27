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
      setError('Camera access denied. Please allow camera permissions for sky analysis.')
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

    // Set canvas size to match video
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    
    // Draw current video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height)
    
    // Convert to base64 image data
    const imageData = canvas.toDataURL('image/jpeg', 0.8)
    return imageData
  }, [])

  const handleCaptureDirection = async () => {
    const imageData = capturePhoto()
    if (imageData) {
      // Save captured image for current direction
      setCapturedImages(prev => ({
        ...prev,
        [currentDirection]: imageData
      }))
      
      // Add direction to captured list
      if (!capturedDirections.includes(currentDirection)) {
        setCapturedDirections([...capturedDirections, currentDirection])
      }
      
      // Move to next direction
      const nextIndex = directions.indexOf(currentDirection) + 1
      if (nextIndex < directions.length) {
        setCurrentDirection(directions[nextIndex])
        setCurrentStep(nextIndex + 1)
      } else {
        // All directions captured, stop camera
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
      // Call the weather analysis API
      const result = await apiService.analyzeWeather({
        images: capturedImages,
        location: { lat: 0, lng: 0 } // TODO: Get from GPS if available
      })
      
      setAnalysisResult(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Weather analysis failed')
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <div className="min-h-full bg-primary-800 p-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-xl font-bold flex items-center mb-2">
            <span className="mr-2">🌤️</span>
            Weather AI Analysis
          </h1>
        </div>

        {/* Camera View */}
        {isCameraActive && (
          <div className="bg-black rounded-lg overflow-hidden mb-6" style={{ aspectRatio: '4/3' }}>
            <div className="relative">
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                autoPlay
                playsInline
                muted
              />
              <div className="absolute top-4 left-4 bg-black bg-opacity-60 text-white px-3 py-1 rounded-lg text-sm">
                Direction: {currentDirection}
              </div>
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                <button
                  onClick={handleCaptureDirection}
                  className="bg-white text-black px-6 py-3 rounded-full font-semibold flex items-center shadow-lg"
                >
                  <span className="mr-2">📷</span>
                  Capture {currentDirection}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Hidden canvas for image capture */}
        <canvas ref={canvasRef} style={{ display: 'none' }} />

        {/* Sky Photo Capture */}
        <div className="bg-primary-600 rounded-lg p-4 mb-6 border border-accent-blue">
          <h3 className="text-text-primary font-semibold mb-4 flex items-center">
            <span className="mr-2">📷</span>
            Sky Photo Capture - Step {currentStep} of 4
          </h3>
          <p className="text-text-secondary text-sm mb-4">
            Point your camera at the <strong>{currentDirection}</strong> sky and capture a photo for accurate weather analysis.
          </p>
          
          {/* Direction Buttons */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            {directions.map((direction) => (
              <button
                key={direction}
                onClick={() => selectDirection(direction)}
                className={`py-3 px-4 rounded-lg font-medium transition-colors ${
                  direction === currentDirection
                    ? 'bg-accent-blue text-white'
                    : capturedDirections.includes(direction)
                    ? 'bg-accent-green text-white'
                    : 'bg-primary-700 text-text-secondary border border-primary-500'
                }`}
              >
                <span className="block text-lg mb-1">
                  {capturedDirections.includes(direction) ? '✅' : '📷'}
                </span>
                {direction}
              </button>
            ))}
          </div>

          {/* Camera Control Buttons */}
          <div className="flex gap-3">
            {!isCameraActive ? (
              <button 
                onClick={startCamera}
                className="flex-1 bg-accent-blue text-white py-3 rounded-lg font-semibold flex items-center justify-center"
              >
                <span className="mr-2">📷</span>
                Start Camera
              </button>
            ) : (
              <button 
                onClick={stopCamera}
                className="flex-1 bg-accent-red text-white py-3 rounded-lg font-semibold flex items-center justify-center"
              >
                <span className="mr-2">⏹️</span>
                Stop Camera
              </button>
            )}
            <button 
              onClick={resetCapture}
              className="px-6 py-3 bg-primary-700 text-text-primary rounded-lg font-medium border border-primary-500"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Analysis Button */}
        <button 
          onClick={runAnalysis}
          disabled={isAnalyzing || Object.keys(capturedImages).length === 0}
          className="w-full bg-accent-blue text-white py-4 rounded-lg font-semibold text-lg mb-6 flex items-center justify-center disabled:opacity-50"
        >
          <span className="mr-2">🤖</span>
          {isAnalyzing ? 'Analyzing Sky Conditions...' : `Analyze Weather (${Object.keys(capturedImages).length} images)`}
        </button>

        {/* ML Model Status */}
        <div className="bg-primary-600 rounded-lg p-4 border border-primary-500">
          <h3 className="text-text-primary font-semibold mb-4 flex items-center">
            <span className="mr-2">🤖</span>
            ML Model Status
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-text-secondary">Weather Classification</span>
              <span className="text-accent-green text-sm font-medium">Online</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-text-secondary">Cloud Detection</span>
              <span className="text-accent-green text-sm font-medium">Online</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-text-secondary">Sky Condition Analysis</span>
              <span className="text-accent-green text-sm font-medium">Online</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-text-secondary">Last Model Update</span>
              <span className="text-text-secondary text-sm">23:18:05</span>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 bg-accent-red rounded-lg p-4">
            <h3 className="text-white font-semibold mb-2 flex items-center">
              <span className="mr-2">❌</span>
              Error
            </h3>
            <p className="text-white text-sm">{error}</p>
          </div>
        )}

        {/* Results Section */}
        {isAnalyzing && (
          <div className="mt-6 bg-primary-600 rounded-lg p-4 border border-accent-blue">
            <h3 className="text-text-primary font-semibold mb-4 flex items-center">
              <span className="mr-2">🔍</span>
              AI Analysis in Progress
            </h3>
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-blue"></div>
              <span className="ml-3 text-text-secondary">Processing sky images with ML models...</span>
            </div>
          </div>
        )}

        {/* Analysis Results */}
        {analysisResult && (
          <div className="mt-6 bg-accent-green rounded-lg p-4">
            <h3 className="text-white font-semibold mb-4 flex items-center">
              <span className="mr-2">🌤️</span>
              Weather Analysis Results
            </h3>
            
            {/* Weather Conditions */}
            <div className="bg-white bg-opacity-20 rounded-lg p-4 mb-4">
              <h4 className="text-white font-semibold mb-3">Current Conditions</h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-green-200">Cloud Cover:</span>
                  <span className="text-white font-bold ml-2">{analysisResult.conditions.cloudCover.toFixed(0)}%</span>
                </div>
                <div>
                  <span className="text-green-200">Visibility:</span>
                  <span className="text-white font-bold ml-2">{analysisResult.conditions.visibility.toFixed(1)} km</span>
                </div>
                <div>
                  <span className="text-green-200">Weather Type:</span>
                  <span className="text-white font-bold ml-2 capitalize">{analysisResult.conditions.weatherType.replace('_', ' ')}</span>
                </div>
                <div>
                  <span className="text-green-200">Confidence:</span>
                  <span className="text-white font-bold ml-2">{(analysisResult.conditions.confidence * 100).toFixed(0)}%</span>
                </div>
              </div>
            </div>

            {/* AI Analysis Details */}
            <div className="bg-white bg-opacity-20 rounded-lg p-4 mb-4">
              <h4 className="text-white font-semibold mb-3">AI Analysis</h4>
              <p className="text-green-100 text-sm mb-2">
                <strong>Classification:</strong> {analysisResult.analysis.classification}
              </p>
              <p className="text-green-100 text-sm mb-2">
                <strong>Confidence:</strong> {(analysisResult.analysis.confidence * 100).toFixed(0)}%
              </p>
              <p className="text-green-100 text-sm">
                <strong>Details:</strong> {analysisResult.analysis.details}
              </p>
            </div>

            {/* Navigation Recommendations */}
            <div className="bg-white bg-opacity-20 rounded-lg p-4">
              <h4 className="text-white font-semibold mb-3">📍 Navigation Recommendations</h4>
              <div className="text-green-100 text-sm space-y-2">
                <div className="flex items-start">
                  <span className="mr-2">☀️</span>
                  <div>
                    <strong>Solar Navigation:</strong> {
                      analysisResult.conditions.cloudCover < 30 
                        ? 'Excellent conditions for solar positioning'
                        : analysisResult.conditions.cloudCover < 70
                        ? 'Moderate conditions - use GPS backup'
                        : 'Poor visibility - rely on GPS navigation'
                    }
                  </div>
                </div>
                <div className="flex items-start">
                  <span className="mr-2">🌟</span>
                  <div>
                    <strong>Star Navigation:</strong> {
                      analysisResult.conditions.cloudCover < 20 
                        ? 'Ideal for nighttime star navigation'
                        : analysisResult.conditions.cloudCover < 50
                        ? 'Limited star visibility expected'
                        : 'Star navigation not recommended'
                    }
                  </div>
                </div>
                <div className="flex items-start">
                  <span className="mr-2">⚠️</span>
                  <div>
                    <strong>Weather Warning:</strong> {
                      analysisResult.conditions.weatherType.includes('storm') || analysisResult.conditions.weatherType.includes('rain')
                        ? 'Adverse weather conditions - exercise caution'
                        : 'Favorable weather conditions for navigation'
                    }
                  </div>
                </div>
              </div>
            </div>

            <div className="text-green-200 text-xs mt-3 text-center">
              Analysis completed at {new Date(analysisResult.timestamp).toLocaleTimeString()}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default WeatherPage