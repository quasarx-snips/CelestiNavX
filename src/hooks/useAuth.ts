
import { useState, useEffect } from 'react'
import { apiService } from '../services/api'

interface User {
  id: string
  email: string
  first_name?: string
  last_name?: string
  profile_image_url?: string
}

// Generate a persistent device-based user ID
function getDeviceUserId(): string {
  const storageKey = 'celestinav_device_user_id'
  
  // Try to get existing ID from localStorage
  let deviceUserId = localStorage.getItem(storageKey)
  
  if (!deviceUserId) {
    // Generate a unique device ID based on various device characteristics
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    ctx?.fillText('CelestiNav', 0, 0)
    const canvasFingerprint = canvas.toDataURL()
    
    const deviceInfo = [
      navigator.userAgent,
      navigator.language,
      screen.width + 'x' + screen.height,
      new Date().getTimezoneOffset(),
      canvasFingerprint.slice(0, 50), // Use part of canvas fingerprint
      Date.now().toString()
    ].join('|')
    
    // Create a simple hash of the device info
    let hash = 0
    for (let i = 0; i < deviceInfo.length; i++) {
      const char = deviceInfo.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }
    
    // Convert to a more readable format
    deviceUserId = `device_${Math.abs(hash).toString(36)}_${Date.now().toString(36)}`
    
    // Store it persistently
    localStorage.setItem(storageKey, deviceUserId)
  }
  
  return deviceUserId
}

export function useAuth() {
  // Direct access mode - no authentication required
  const [isAuthenticated] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [user, setUser] = useState<User | null>(() => {
    const deviceUserId = getDeviceUserId()
    return {
      id: deviceUserId,
      email: `${deviceUserId}@celestinav.local`,
      first_name: 'Guest',
      last_name: 'User'
    }
  })

  useEffect(() => {
    // Ensure user is created in database on first load
    const ensureUserInDatabase = async () => {
      if (user) {
        setIsLoading(true)
        try {
          await apiService.createOrGetUser(user.id, {
            email: user.email,
            first_name: user.first_name,
            last_name: user.last_name
          })
        } catch (error) {
          console.warn('Failed to create/get user in database:', error)
        } finally {
          setIsLoading(false)
        }
      }
    }
    
    ensureUserInDatabase()
  }, [user])

  const checkAuthStatus = async () => {
    // No-op - authentication disabled
  }

  const logout = async () => {
    try {
      // Delete all user data from the database
      if (user?.id) {
        await apiService.deleteUserData(user.id)
      }
    } catch (error) {
      console.warn('Failed to delete user data:', error)
    } finally {
      // Clear device user ID on logout to allow new device registration
      localStorage.removeItem('celestinav_device_user_id')
      window.location.reload()
    }
  }

  return {
    isAuthenticated,
    isLoading,
    user,
    logout,
    checkAuthStatus
  }
}
