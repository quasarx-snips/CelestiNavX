import { useState, useEffect } from 'react'
import { offlineDB, Measurement, WeatherReading, UserSession } from '../services/database'

export function useDatabase() {
  const [isInitialized, setIsInitialized] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Since we're using Flask backend with SQLAlchemy,
    // we don't need client-side database initialization
    setIsInitialized(true)
  }, [])

  return {
    isInitialized,
    error
  }
}

export const useMeasurements = () => {
  const [measurements, setMeasurements] = useState<Measurement[]>([])
  const [loading, setLoading] = useState(false)

  const loadMeasurements = async (limit = 50) => {
    setLoading(true)
    try {
      // Try to load from backend first
      const response = await fetch(`/api/measurements?limit=${limit}`)
      if (response.ok) {
        const result = await response.json()
        setMeasurements(result.data)
      } else {
        throw new Error('Backend load failed')
      }
    } catch (error) {
      console.warn('Failed to load from backend, using local storage:', error)
      // Fallback to local storage
      try {
        const data = await offlineDB.getMeasurements(limit)
        setMeasurements(data)
      } catch (localError) {
        console.error('Failed to load measurements from local storage:', localError)
      }
    } finally {
      setLoading(false)
    }
  }

  const saveMeasurement = async (measurement: Omit<Measurement, 'id' | 'timestamp'>) => {
    try {
      // Save to backend database first
      const backendData = await fetch('/api/measurements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(measurement)
      })

      if (backendData.ok) {
        const result = await backendData.json()
        const savedMeasurement = result.data

        // Also save to local IndexedDB as backup
        const localMeasurement: Measurement = {
          id: `local_${savedMeasurement.id}`,
          timestamp: Date.parse(savedMeasurement.timestamp),
          ...measurement
        }

        try {
          await offlineDB.saveMeasurement(localMeasurement)
        } catch (localError) {
          console.warn('Failed to save to local storage:', localError)
        }

        await loadMeasurements()
        return savedMeasurement
      } else {
        throw new Error('Backend save failed')
      }
    } catch (error) {
      console.error('Failed to save measurement:', error)

      // Fallback to local storage if backend fails
      const localMeasurement: Measurement = {
        id: `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: Date.now(),
        ...measurement
      }

      await offlineDB.saveMeasurement(localMeasurement)
      await loadMeasurements()
      return localMeasurement
    }
  }

  useEffect(() => {
    loadMeasurements()
  }, [])

  return { measurements, loading, saveMeasurement, loadMeasurements }
}

export const useWeatherReadings = () => {
  const [readings, setReadings] = useState<WeatherReading[]>([])
  const [loading, setLoading] = useState(false)

  const loadReadings = async (limit = 20) => {
    setLoading(true)
    try {
      const data = await offlineDB.getWeatherReadings(limit)
      setReadings(data)
    } catch (error) {
      console.error('Failed to load weather readings:', error)
    } finally {
      setLoading(false)
    }
  }

  const saveReading = async (reading: Omit<WeatherReading, 'id' | 'timestamp'>) => {
    const fullReading: WeatherReading = {
      ...reading,
      id: `weather_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now()
    }

    try {
      await offlineDB.saveWeatherReading(fullReading)
      await loadReadings()
      return fullReading
    } catch (error) {
      console.error('Failed to save weather reading:', error)
      throw error
    }
  }

  useEffect(() => {
    loadReadings()
  }, [])

  return { readings, loading, saveReading, loadReadings }
}

export const useSession = () => {
  const [currentSession, setCurrentSession] = useState<UserSession | null>(null)

  const startSession = async () => {
    try {
      const session = await offlineDB.createSession()
      setCurrentSession(session)
      return session
    } catch (error) {
      console.error('Failed to create session:', error)
      throw error
    }
  }

  const updateSession = async (updates: Partial<UserSession>) => {
    if (!currentSession) return

    const updatedSession = { ...currentSession, ...updates }
    try {
      await offlineDB.updateSession(updatedSession)
      setCurrentSession(updatedSession)
    } catch (error) {
      console.error('Failed to update session:', error)
    }
  }

  const endSession = () => {
    setCurrentSession(null)
  }

  return { currentSession, startSession, updateSession, endSession }
}