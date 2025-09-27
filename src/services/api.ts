// API service for backend communication
export interface SolarCalculationRequest {
  pitch: number
  heading: number
  elevation?: number
  pressure?: number
  temperature?: number
  timestamp?: number
}

export interface SolarCalculationResponse {
  latitude: number
  longitude: number
  accuracy: number
  method: string
  timestamp: number
  error?: string
}

export interface WeatherAnalysisRequest {
  images: {
    north?: string
    east?: string
    south?: string
    west?: string
  }
  location?: {
    lat: number
    lng: number
  }
}

export interface WeatherAnalysisResponse {
  conditions: {
    cloudCover: number
    visibility: number
    weatherType: string
    confidence: number
  }
  analysis: {
    classification: string
    confidence: number
    details: string
  }
  timestamp: number
}

class APIService {
  private baseURL = '/api'

  async calculateSolarPosition(data: SolarCalculationRequest): Promise<SolarCalculationResponse> {
    try {
      const params = new URLSearchParams({
        pitch: data.pitch.toString(),
        heading: data.heading.toString(),
        elevation: (data.elevation || 0).toString(),
        pressure: (data.pressure || 1013.25).toString(),
        temperature: (data.temperature || 15).toString()
      })

      const response = await fetch(`/calculate_latlon?${params}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`Solar calculation failed: ${response.status}`)
      }

      const result = await response.json()
      
      return {
        latitude: parseFloat(result.lat),
        longitude: parseFloat(result.lon),
        accuracy: result.accuracy || 1000,
        method: 'solar',
        timestamp: Date.now()
      }
    } catch (error) {
      console.error('Solar calculation error:', error)
      throw new Error('Failed to calculate solar position. Check your measurements and try again.')
    }
  }

  // Measurements API
  async getMeasurements(limit = 50) {
    try {
      const response = await fetch(`${this.baseURL}/measurements?limit=${limit}`)
      if (!response.ok) throw new Error(`Failed to fetch measurements: ${response.status}`)
      
      const result = await response.json()
      return result.data
    } catch (error) {
      console.error('Get measurements error:', error)
      throw new Error('Failed to fetch measurements')
    }
  }

  async createMeasurement(data: any) {
    try {
      const response = await fetch(`${this.baseURL}/measurements`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      
      if (!response.ok) throw new Error(`Failed to save measurement: ${response.status}`)
      
      const result = await response.json()
      return result.data
    } catch (error) {
      console.error('Create measurement error:', error)
      throw new Error('Failed to save measurement')
    }
  }

  // Convenience method for saving GPS and other measurements
  async saveMeasurement(data: {
    latitude: number
    longitude: number
    method: string
    accuracy?: number
    elevation?: number
    pressure?: number
    temperature?: number
  }) {
    const measurementData = {
      ...data,
      timestamp: Date.now(),
      session_id: 1 // Default session for now
    }
    return this.createMeasurement(measurementData)
  }

  // Weather API
  async getWeatherReadings(limit = 20) {
    try {
      const response = await fetch(`${this.baseURL}/weather?limit=${limit}`)
      if (!response.ok) throw new Error(`Failed to fetch weather readings: ${response.status}`)
      
      const result = await response.json()
      return result.data
    } catch (error) {
      console.error('Get weather readings error:', error)
      throw new Error('Failed to fetch weather readings')
    }
  }

  async createWeatherReading(data: any) {
    try {
      const response = await fetch(`${this.baseURL}/weather`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      
      if (!response.ok) throw new Error(`Failed to save weather reading: ${response.status}`)
      
      const result = await response.json()
      return result.data
    } catch (error) {
      console.error('Create weather reading error:', error)
      throw new Error('Failed to save weather reading')
    }
  }

  // Sessions API
  async createSession(data: any = {}) {
    try {
      const response = await fetch(`${this.baseURL}/sessions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      
      if (!response.ok) throw new Error(`Failed to create session: ${response.status}`)
      
      const result = await response.json()
      return result.data
    } catch (error) {
      console.error('Create session error:', error)
      throw new Error('Failed to create session')
    }
  }

  async updateSession(sessionId: number, data: any) {
    try {
      const response = await fetch(`${this.baseURL}/sessions/${sessionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      
      if (!response.ok) throw new Error(`Failed to update session: ${response.status}`)
      
      const result = await response.json()
      return result.data
    } catch (error) {
      console.error('Update session error:', error)
      throw new Error('Failed to update session')
    }
  }

  // Stats API
  async getStats() {
    try {
      const response = await fetch(`${this.baseURL}/stats`)
      if (!response.ok) throw new Error(`Failed to fetch stats: ${response.status}`)
      
      const result = await response.json()
      return result.data
    } catch (error) {
      console.error('Get stats error:', error)
      throw new Error('Failed to fetch statistics')
    }
  }

  async analyzeWeather(_data: WeatherAnalysisRequest): Promise<WeatherAnalysisResponse> {
    try {
      // For now, return mock data since we haven't implemented the weather AI yet
      // This will be replaced with actual ML model integration
      
      const mockAnalysis: WeatherAnalysisResponse = {
        conditions: {
          cloudCover: Math.random() * 100,
          visibility: Math.random() * 20 + 5,
          weatherType: ['clear', 'partly_cloudy', 'cloudy', 'overcast'][Math.floor(Math.random() * 4)],
          confidence: 0.7 + Math.random() * 0.3
        },
        analysis: {
          classification: 'Mock weather analysis - ML model integration pending',
          confidence: 0.85,
          details: 'This is a placeholder response. Weather AI analysis will be implemented with free ML models in the next phase.'
        },
        timestamp: Date.now()
      }

      return mockAnalysis
    } catch (error) {
      console.error('Weather analysis error:', error)
      throw new Error('Failed to analyze weather conditions')
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseURL}/health`, {
        method: 'GET',
        timeout: 5000
      } as any)
      return response.ok
    } catch {
      return false
    }
  }
}

export const apiService = new APIService()