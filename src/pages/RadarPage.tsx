import React from 'react'

const RadarPage: React.FC = () => {
  return (
    <div className="min-h-full bg-primary-800 p-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-xl font-bold flex items-center mb-2">
            <span className="mr-2">📡</span>
            Radar & Signals
          </h1>
          <p className="text-text-secondary text-sm">Detection and signal analysis</p>
        </div>

        {/* Radar Display */}
        <div className="bg-primary-900 rounded-lg p-6 mb-6 border border-accent-green">
          <div className="relative w-full aspect-square max-w-xs mx-auto">
            {/* Radar Background */}
            <div className="absolute inset-0 border-2 border-accent-green rounded-full opacity-30"></div>
            <div className="absolute inset-4 border border-accent-green rounded-full opacity-20"></div>
            <div className="absolute inset-8 border border-accent-green rounded-full opacity-10"></div>
            
            {/* Radar Lines */}
            <div className="absolute top-1/2 left-0 right-0 h-px bg-accent-green opacity-20"></div>
            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-accent-green opacity-20"></div>
            
            {/* Center Dot */}
            <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-accent-green rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
            
            {/* Sweep Animation */}
            <div className="absolute top-1/2 left-1/2 w-full h-px bg-gradient-to-r from-accent-green to-transparent transform -translate-y-1/2 origin-left rotate-45 animate-pulse"></div>
          </div>
          <p className="text-center text-accent-green text-sm mt-4">Scanning...</p>
        </div>

        {/* Signal Strength */}
        <div className="bg-primary-600 rounded-lg p-4 mb-6 border border-primary-500">
          <h3 className="text-text-primary font-semibold mb-4 flex items-center">
            <span className="mr-2">📶</span>
            Signal Detection
          </h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-text-secondary text-sm">Cellular Signal</span>
                <span className="text-accent-red text-sm font-medium">No Signal</span>
              </div>
              <div className="w-full bg-primary-700 rounded-full h-2">
                <div className="bg-accent-red h-2 rounded-full w-0"></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-text-secondary text-sm">WiFi Networks</span>
                <span className="text-accent-yellow text-sm font-medium">2 Found</span>
              </div>
              <div className="w-full bg-primary-700 rounded-full h-2">
                <div className="bg-accent-yellow h-2 rounded-full w-1/3"></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-text-secondary text-sm">Bluetooth Devices</span>
                <span className="text-accent-green text-sm font-medium">5 Detected</span>
              </div>
              <div className="w-full bg-primary-700 rounded-full h-2">
                <div className="bg-accent-green h-2 rounded-full w-2/3"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Emergency Frequencies */}
        <div className="bg-primary-600 rounded-lg p-4 mb-6 border border-primary-500">
          <h3 className="text-text-primary font-semibold mb-4 flex items-center">
            <span className="mr-2">📻</span>
            Emergency Frequencies
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-text-secondary">Emergency Services</span>
              <span className="text-text-primary font-mono">121.5 MHz</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Maritime Emergency</span>
              <span className="text-text-primary font-mono">156.8 MHz</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Aircraft Emergency</span>
              <span className="text-text-primary font-mono">243.0 MHz</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Weather Radio</span>
              <span className="text-text-primary font-mono">162.55 MHz</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <button className="w-full bg-accent-blue text-white py-3 rounded-lg font-semibold flex items-center justify-center">
            <span className="mr-2">🔍</span>
            Start Deep Scan
          </button>
          <button className="w-full bg-primary-600 text-text-primary py-3 rounded-lg font-medium border border-primary-500 flex items-center justify-center">
            <span className="mr-2">📋</span>
            View Scan History
          </button>
        </div>
      </div>
    </div>
  )
}

export default RadarPage