import React, { useState, useEffect } from 'react'
import BottomNavigation from './components/BottomNavigation'
import HomePage from './pages/HomePage'
import CelestiNavPage from './pages/CelestiNavPage'
import WeatherPage from './pages/WeatherPage'
import RadarPage from './pages/RadarPage'
import SOSPage from './pages/SOSPage'
import LandingPage from './pages/LandingPage'
import { useDatabase } from './hooks/useDatabase'
import { useAuth } from './hooks/useAuth'

type TabType = 'home' | 'celestinav' | 'weather' | 'radar' | 'sos'

function App() {
  const [activeTab, setActiveTab] = useState<TabType>('home')
  const { isInitialized, error } = useDatabase()
  const { isAuthenticated, isLoading } = useAuth()

  useEffect(() => {
    if (error) {
      console.error('Database initialization error:', error)
    }
  }, [error])

  // Show landing page for unauthenticated users
  if (isLoading || !isAuthenticated) {
    return <LandingPage />
  }

  const renderPage = () => {
    switch (activeTab) {
      case 'home':
        return <HomePage />
      case 'celestinav':
        return <CelestiNavPage />
      case 'weather':
        return <WeatherPage />
      case 'radar':
        return <RadarPage />
      case 'sos':
        return <SOSPage />
      default:
        return <HomePage />
    }
  }

  return (
    <div className="h-screen w-full bg-primary-800 text-text-primary flex flex-col overflow-hidden">
      <main className="flex-1 overflow-auto">
        {renderPage()}
      </main>
      <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  )
}

export default App