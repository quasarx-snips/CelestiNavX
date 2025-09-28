import React from 'react'

const AIPage: React.FC = () => {
  const aiOptions = [
    {
      id: 'health-tracker',
      title: 'Health Tracker',
      subtitle: 'Medical Monitoring',
      icon: '❤️',
      description: 'Track vital signs and health metrics',
      functional: false,
      cardClass: 'gradient-card-red'
    },
    {
      id: 'offline-maps',
      title: 'Offline Maps',
      subtitle: 'Navigation',
      icon: '🗺️',
      description: 'Download and use maps without internet',
      functional: false,
      cardClass: 'gradient-card-green'
    },
    {
      id: 'wildlife-identification',
      title: 'Wildlife ID',
      subtitle: 'Species Recognition',
      icon: '🦅',
      description: 'Identify animals and plants with AI',
      functional: false,
      cardClass: 'gradient-card-yellow'
    },
    {
      id: 'camera-measurement',
      title: 'Camera Measurement',
      subtitle: 'Distance & Size',
      icon: '📏',
      description: 'Measure objects using camera',
      functional: false,
      cardClass: 'gradient-card-purple'
    },
    {
      id: 'weather-ai',
      title: 'Weather AI',
      subtitle: 'Neural Analysis',
      icon: '🌤️',
      description: 'Advanced weather analysis from sky photos',
      functional: true,
      cardClass: 'gradient-card-blue'
    }
  ]

  const handleOptionClick = (option: typeof aiOptions[0]) => {
    if (option.functional) {
      // Navigate to the existing weather page
      window.location.hash = '#weather-analysis'
    } else {
      // Show coming soon message for non-functional options
      alert(`${option.title} is coming soon! This feature is still under development.`)
    }
  }

  return (
    <div className="p-4">
      <div className="max-w-md mx-auto space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-text-inverse flex items-center">
            <span className="mr-2">🤖</span>
            AI Smart Tools
          </h1>
          <div className="flex items-center">
            <span className="text-text-inverse/70 text-sm mr-2">Online</span>
            <span className="status-dot status-online"></span>
          </div>
        </div>

        {/* Description */}
        <div className="info-card animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-text-primary font-bold text-sm flex items-center">
              <span className="mr-2">✨</span>
              AI-Powered Features
            </h3>
            <span className="status-dot status-online"></span>
          </div>
          <p className="text-text-secondary text-sm">
            Choose from our collection of AI-powered tools designed for outdoor survival and navigation. 
            Advanced machine learning algorithms help you analyze your environment effectively.
          </p>
        </div>

        {/* AI Options Grid */}
        <div className="grid grid-cols-1 gap-4">
          {aiOptions.map((option, index) => (
            <div 
              key={option.id}
              onClick={() => handleOptionClick(option)}
              className={`${option.cardClass} animate-slide-up cursor-pointer hover:scale-105 transition-all duration-300 relative overflow-hidden group p-4`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <span className="text-2xl mr-3 animate-bounce-subtle">{option.icon}</span>
                    <div>
                      <h3 className="text-white font-bold text-sm">{option.title}</h3>
                      <p className="text-white/80 text-xs">{option.subtitle}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    {option.functional ? (
                      <span className="status-dot status-online"></span>
                    ) : (
                      <div className="flex items-center">
                        <span className="text-white/60 text-xs mr-2">Soon</span>
                        <span className="status-dot status-warning"></span>
                      </div>
                    )}
                  </div>
                </div>
                <p className="text-white/70 text-xs mb-3">{option.description}</p>
                
                {option.functional ? (
                  <div className="btn-primary text-xs py-2 px-4 text-center rounded-lg">
                    Launch Tool
                  </div>
                ) : (
                  <div className="bg-white/20 text-white/60 text-xs py-2 px-4 text-center rounded-lg cursor-not-allowed">
                    Coming Soon
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Footer Info */}
        <div className="info-card animate-fade-in" style={{ animationDelay: '500ms' }}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-text-primary font-bold text-sm flex items-center">
              <span className="mr-2">📊</span>
              Development Status
            </h3>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex justify-between">
              <span className="text-text-secondary">Ready:</span>
              <span className="text-accent-success font-semibold">1/5</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">In Development:</span>
              <span className="text-accent-warning font-semibold">4/5</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">AI Models:</span>
              <span className="text-text-primary font-semibold">Active</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Last Update:</span>
              <span className="text-text-primary font-semibold text-xs font-mono">
                {new Date().toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AIPage