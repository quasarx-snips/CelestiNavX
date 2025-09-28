
import { useState, useEffect } from 'react'
import BottomNavigation from './components/BottomNavigation'
import HomePage from './pages/HomePage'
import CelestiNavPage from './pages/CelestiNavPage'
import WeatherPage from './pages/WeatherPage'
import AIPage from './pages/AIPage'
import RadarPage from './pages/RadarPage'
import SOSPage from './pages/SOSPage'
import LandingPage from './pages/LandingPage'
import { useDatabase } from './hooks/useDatabase'
import { useAuth } from './hooks/useAuth'

type TabType = 'home' | 'celestinav' | 'weather' | 'radar' | 'sos'
type ExtendedTabType = TabType | 'weather-analysis'

function App() {
  const [activeTab, setActiveTab] = useState<ExtendedTabType>('home')
  const { error } = useDatabase()
  const { isAuthenticated, isLoading } = useAuth()

  // Handle hash-based navigation
  useEffect(() => {
    const handleHashChange = () => {
      // Properly parse hash - remove # and optional leading /
      const hash = window.location.hash.replace(/^#\/?/, '') as ExtendedTabType
      if (['home', 'celestinav', 'weather', 'weather-analysis', 'radar', 'sos'].includes(hash)) {
        setActiveTab(hash)
      }
    }

    // Set initial tab from hash
    handleHashChange()
    
    // Listen for hash changes
    window.addEventListener('hashchange', handleHashChange)
    
    return () => {
      window.removeEventListener('hashchange', handleHashChange)
    }
  }, [])

  useEffect(() => {
    if (error) {
      console.error('Database initialization error:', error)
    }
  }, [error])

  // Show loading or landing page for unauthenticated users
  if (isLoading) {
    return (
      <div className="h-screen w-full text-contrast-high flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
        <div className="text-center animate-fade-in">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-contrast-medium font-medium">Loading...</p>
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
          return <AIPage />
        case 'weather-analysis':
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
      <div key={activeTab} className="page-transition page-content">
        {pageComponent}
      </div>
    )
  }

  return (
    <div className="h-screen w-full text-contrast-high flex flex-col" style={{ background: 'var(--bg-primary)' }}>
      <main className="flex-1 overflow-auto scrollable pb-16">
        {renderPage()}
      </main>
      <div className="fixed bottom-0 left-0 right-0 z-50">
        <BottomNavigation 
          activeTab={activeTab === 'weather-analysis' ? 'weather' : activeTab as TabType} 
          onTabChange={(tab: TabType) => setActiveTab(tab)} 
        />
      </div>
    </div>
  )
}

export default App
