import React from 'react'

const RadarPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-surface-800 via-surface-700 to-surface-600 p-4 page-transition">
      <div className="max-w-md mx-auto space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-text-inverse flex items-center">
            <span className="mr-2">📡</span>
            Radar & Signals
          </h1>
          <div className="flex items-center">
            <span className="text-text-inverse/70 text-sm mr-2">Scanning</span>
            <span className="status-dot status-online animate-pulse"></span>
          </div>
        </div>

        {/* Radar Display Card */}
        <div className="gradient-card-blue animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-bold text-sm">RADAR DISPLAY</h3>
            <span className="status-dot status-online"></span>
          </div>
          
          <div className="relative w-full aspect-square max-w-xs mx-auto">
            {/* Radar Background */}
            <div className="absolute inset-0 border-2 border-accent-success rounded-full opacity-30"></div>
            <div className="absolute inset-4 border border-accent-success rounded-full opacity-20"></div>
            <div className="absolute inset-8 border border-accent-success rounded-full opacity-10"></div>
            
            {/* Radar Lines */}
            <div className="absolute top-1/2 left-0 right-0 h-px bg-accent-success opacity-20"></div>
            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-accent-success opacity-20"></div>
            
            {/* Center Dot */}
            <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-accent-success rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
            
            {/* Sweep Animation */}
            <div className="absolute top-1/2 left-1/2 w-full h-px bg-gradient-to-r from-accent-success to-transparent transform -translate-y-1/2 origin-left rotate-45 animate-pulse"></div>
          </div>
          <p className="text-center text-accent-success text-sm mt-4 font-semibold">Scanning...</p>
        </div>

        {/* Signal Detection Card */}
        <div className="info-card animate-slide-up">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-text-primary font-bold text-sm flex items-center">
              <span className="mr-2">📶</span>
              Signal Detection
            </h3>
            <span className="status-dot status-online"></span>
          </div>
          
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-text-secondary text-sm">Cellular Signal</span>
                <div className="flex items-center">
                  <span className="status-dot status-error mr-2"></span>
                  <span className="text-accent-red text-sm font-semibold">No Signal</span>
                </div>
              </div>
              <div className="w-full bg-primary-700 rounded-full h-2">
                <div className="bg-accent-red h-2 rounded-full w-0"></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-text-secondary text-sm">WiFi Networks</span>
                <div className="flex items-center">
                  <span className="status-dot status-warning mr-2"></span>
                  <span className="text-accent-yellow text-sm font-semibold">2 Found</span>
                </div>
              </div>
              <div className="w-full bg-primary-700 rounded-full h-2">
                <div className="bg-accent-yellow h-2 rounded-full w-1/3"></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-text-secondary text-sm">Bluetooth Devices</span>
                <div className="flex items-center">
                  <span className="status-dot status-online mr-2"></span>
                  <span className="text-accent-success text-sm font-semibold">5 Detected</span>
                </div>
              </div>
              <div className="w-full bg-primary-700 rounded-full h-2">
                <div className="bg-accent-success h-2 rounded-full w-2/3"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Emergency Frequencies Card */}
        <div className="info-card animate-slide-up">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-text-primary font-bold text-sm flex items-center">
              <span className="mr-2">📻</span>
              Emergency Frequencies
            </h3>
            <span className="status-dot status-online"></span>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center py-1">
              <span className="text-text-secondary text-sm">Emergency Services</span>
              <span className="text-text-primary font-mono font-semibold text-sm">121.5 MHz</span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-text-secondary text-sm">Maritime Emergency</span>
              <span className="text-text-primary font-mono font-semibold text-sm">156.8 MHz</span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-text-secondary text-sm">Aircraft Emergency</span>
              <span className="text-text-primary font-mono font-semibold text-sm">243.0 MHz</span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-text-secondary text-sm">Weather Radio</span>
              <span className="text-text-primary font-mono font-semibold text-sm">162.55 MHz</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 animate-fade-in">
          <button className="btn-primary w-full py-3">
            <span className="mr-2">🔍</span>
            Start Deep Scan
          </button>
          <button className="btn-secondary w-full py-3">
            <span className="mr-2">📋</span>
            View Scan History
          </button>
        </div>

        {/* Status Footer */}
        <div className="text-center text-text-inverse/50 text-xs pt-2">
          <div className="flex items-center justify-center mb-1">
            <span className="status-dot status-online mr-2"></span>
            <span>Radar active • All frequencies monitored</span>
          </div>
          <p>Last scan: {new Date().toLocaleTimeString()}</p>
        </div>
      </div>
    </div>
  )
}

export default RadarPage