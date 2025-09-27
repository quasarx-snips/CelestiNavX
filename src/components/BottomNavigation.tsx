import React from 'react'

type TabType = 'home' | 'celestinav' | 'weather' | 'radar' | 'sos'

interface BottomNavigationProps {
  activeTab: TabType
  onTabChange: (tab: TabType) => void
}

const BottomNavigation: React.FC<BottomNavigationProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'home', label: 'Home', icon: '🏠' },
    { id: 'celestinav', label: 'CelestiNav', icon: '🧭' },
    { id: 'weather', label: 'Weather', icon: '🌤️' },
    { id: 'radar', label: 'Radar', icon: '📡' },
    { id: 'sos', label: 'SOS', icon: '⚠️' },
  ] as const

  return (
    <nav className="bg-primary-900 border-t border-primary-600 px-2 py-2 safe-area-inset-bottom">
      <div className="flex justify-around items-center max-w-md mx-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id as TabType)}
            className={`flex flex-col items-center px-3 py-2 rounded-lg transition-colors ${
              activeTab === tab.id
                ? 'text-accent-blue bg-primary-700'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <span className="text-lg mb-1">{tab.icon}</span>
            <span className="text-xs font-medium">{tab.label}</span>
          </button>
        ))}
      </div>
    </nav>
  )
}

export default BottomNavigation