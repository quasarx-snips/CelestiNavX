import React, { useState } from 'react'
import BottomNavigation from './components/BottomNavigation'
import HomePage from './pages/HomePage'
import CelestiNavPage from './pages/CelestiNavPage'
import WeatherPage from './pages/WeatherPage'
import RadarPage from './pages/RadarPage'
import SOSPage from './pages/SOSPage'

type TabType = 'home' | 'celestinav' | 'weather' | 'radar' | 'sos'

function App() {
  const [activeTab, setActiveTab] = useState<TabType>('home')

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