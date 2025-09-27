// Landing page for unauthenticated users
import React from 'react'

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-full bg-primary-800 flex items-center justify-center p-6">
      <div className="max-w-md mx-auto text-center">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-accent-blue rounded-full flex items-center justify-center mr-4">
              <span className="text-3xl">🧭</span>
            </div>
            <h1 className="text-3xl font-bold text-text-primary">CelestiNav</h1>
          </div>
          <p className="text-text-secondary text-lg mb-2">Professional Celestial Navigation System</p>
          <p className="text-text-secondary">Navigate using the sun, moon, and stars. Works offline anywhere on Earth.</p>
        </div>

        {/* Features */}
        <div className="bg-primary-600 rounded-lg p-6 mb-8 border border-primary-500">
          <h3 className="text-text-primary font-semibold mb-4">Features</h3>
          <div className="space-y-3 text-left">
            <div className="flex items-center">
              <span className="mr-3">☀️</span>
              <span className="text-text-secondary">Solar position calculations</span>
            </div>
            <div className="flex items-center">
              <span className="mr-3">🌤️</span>
              <span className="text-text-secondary">AI weather analysis</span>
            </div>
            <div className="flex items-center">
              <span className="mr-3">📡</span>
              <span className="text-text-secondary">Signal detection & radar</span>
            </div>
            <div className="flex items-center">
              <span className="mr-3">🆘</span>
              <span className="text-text-secondary">Emergency SOS features</span>
            </div>
            <div className="flex items-center">
              <span className="mr-3">💾</span>
              <span className="text-text-secondary">Offline data storage</span>
            </div>
            <div className="flex items-center">
              <span className="mr-3">🔗</span>
              <span className="text-text-secondary">Collaborative measurements</span>
            </div>
          </div>
        </div>

        {/* Login Button */}
        <button 
          onClick={() => window.location.href = '/api/login'}
          className="w-full bg-accent-blue text-white py-4 rounded-lg font-semibold text-lg mb-4 flex items-center justify-center hover:bg-blue-600 transition-colors"
        >
          <span className="mr-2">🔐</span>
          Sign In to Get Started
        </button>

        {/* Info */}
        <div className="text-text-secondary text-sm">
          <p className="mb-2">Sign in with Google, GitHub, Apple, or Email</p>
          <p>Your measurements and session data will be securely saved</p>
        </div>

        {/* Demo Notice */}
        <div className="mt-8 bg-accent-orange rounded-lg p-4">
          <h4 className="text-white font-semibold mb-2">🚀 Professional Navigation Tool</h4>
          <p className="text-orange-100 text-sm">
            Built for surveyors, sailors, hikers, and anyone who needs reliable position finding 
            when GPS fails. Works completely offline using celestial bodies.
          </p>
        </div>
      </div>
    </div>
  )
}

export default LandingPage