import React from 'react'

export default function LandingPage() {
  const handleLogin = () => {
    window.location.href = '/api/login'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700 flex flex-col items-center justify-center p-6">
      <div className="text-center max-w-md">
        <h1 className="text-4xl font-bold text-text-primary mb-4">
          CelestiNav
        </h1>
        <p className="text-text-secondary mb-8">
          Offline Survival Navigation System with AI-powered weather analysis
        </p>

        <div className="space-y-4">
          <button
            onClick={handleLogin}
            className="w-full bg-accent-blue text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-600 transition-colors"
          >
            Login with Replit
          </button>

          <p className="text-text-muted text-sm">
            Secure authentication powered by Replit
          </p>
        </div>
      </div>
    </div>
  )
}