
import { useState, useEffect } from 'react'
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
  const { error } = useDatabase()
  const { isAuthenticated, isLoading } = useAuth()

  useEffect(() => {
    if (error) {
      console.error('Database initialization error:', error)
    }
  }, [error])

  // Show loading or landing page for unauthenticated users
  if (isLoading) {
    return (
      <div className="h-screen w-full bg-primary-950 text-text-primary flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-accent-blue border-t-transparent mx-auto mb-4 shadow-glow"></div>
          <p className="text-text-secondary font-medium">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <LandingPage />
  }

  const renderPage = () => {
    const pageComponent = (() => {
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
    })()
    
    return (
      <div key={activeTab} className="page-transition">
        {pageComponent}
      </div>
    )
  }

  return (
    <div className="h-screen w-full bg-primary-950 text-text-primary flex flex-col overflow-hidden">
      <main className="flex-1 overflow-auto scrollable">
        {renderPage()}
      </main>
      <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  )
}

export default App
