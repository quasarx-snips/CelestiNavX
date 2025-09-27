import React, { useState } from 'react'

const WeatherPage: React.FC = () => {
  const [currentStep] = useState(1)
  const [capturedDirections, setCapturedDirections] = useState<string[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const directions = ['NORTH', 'EAST', 'SOUTH', 'WEST']
  
  const captureDirection = (direction: string) => {
    if (!capturedDirections.includes(direction)) {
      setCapturedDirections([...capturedDirections, direction])
    }
  }

  const runAnalysis = () => {
    setIsAnalyzing(true)
    // Simulate analysis
    setTimeout(() => {
      setIsAnalyzing(false)
    }, 3000)
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

        {/* Sky Photo Capture */}
        <div className="bg-primary-600 rounded-lg p-4 mb-6 border border-accent-blue">
          <h3 className="text-text-primary font-semibold mb-4 flex items-center">
            <span className="mr-2">📷</span>
            Sky Photo Capture - Step {currentStep} of 4
          </h3>
          <p className="text-text-secondary text-sm mb-4">
            Point your camera at the <strong>NORTH</strong> sky and capture a photo for accurate weather analysis.
          </p>
          
          {/* Direction Buttons */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            {directions.map((direction) => (
              <button
                key={direction}
                onClick={() => captureDirection(direction)}
                className={`py-3 px-4 rounded-lg font-medium transition-colors ${
                  capturedDirections.includes(direction)
                    ? 'bg-accent-green text-white'
                    : 'bg-primary-700 text-text-secondary border border-primary-500'
                }`}
              >
                <span className="block text-lg mb-1">📷</span>
                {direction}
              </button>
            ))}
          </div>

          {/* Capture Button */}
          <div className="flex gap-3">
            <button className="flex-1 bg-accent-blue text-white py-3 rounded-lg font-semibold flex items-center justify-center">
              <span className="mr-2">📷</span>
              Capture NORTH Sky
            </button>
            <button className="px-6 py-3 bg-primary-700 text-text-primary rounded-lg font-medium border border-primary-500">
              Reset
            </button>
          </div>
        </div>

        {/* Analysis Button */}
        <button 
          onClick={runAnalysis}
          disabled={isAnalyzing}
          className="w-full bg-accent-blue text-white py-4 rounded-lg font-semibold text-lg mb-6 flex items-center justify-center disabled:opacity-50"
        >
          <span className="mr-2">🔄</span>
          {isAnalyzing ? 'Analyzing...' : 'Refresh Analysis'}
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

        {/* Results Section */}
        {isAnalyzing && (
          <div className="mt-6 bg-primary-600 rounded-lg p-4 border border-accent-blue">
            <h3 className="text-text-primary font-semibold mb-4 flex items-center">
              <span className="mr-2">🔍</span>
              Analysis Results
            </h3>
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-blue"></div>
              <span className="ml-3 text-text-secondary">Processing sky images...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default WeatherPage