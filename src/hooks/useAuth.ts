
import { useState, useEffect } from 'react'

interface User {
  id: string
  email: string
  first_name?: string
  last_name?: string
  profile_image_url?: string
}

export function useAuth() {
  // Direct access mode - no authentication required
  const [isAuthenticated] = useState(true)
  const [isLoading] = useState(false)
  const [user] = useState<User | null>({
    id: 'guest-user',
    email: 'guest@celestinav.local',
    first_name: 'Guest',
    last_name: 'User'
  })

  useEffect(() => {
    // Skip authentication check - direct access enabled
  }, [])

  const checkAuthStatus = async () => {
    // No-op - authentication disabled
  }

  const logout = async () => {
    // No-op - authentication disabled
    console.log('Logout disabled in direct access mode')
  }

  return {
    isAuthenticated,
    isLoading,
    user,
    logout,
    checkAuthStatus
  }
}
