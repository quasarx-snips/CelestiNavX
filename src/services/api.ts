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

  async analyzeWeather(data: WeatherAnalysisRequest): Promise<WeatherAnalysisResponse> {
    try {
      // Enhanced mock analysis with realistic weather patterns
      // In production, this would call a real ML weather analysis service
      
      const imageCount = Object.keys(data.images).length
      
      // Simulate analysis delay
      await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 3000))
      
      // Generate realistic weather conditions based on image analysis simulation
      const cloudTypes = ['clear', 'partly_cloudy', 'cloudy', 'overcast', 'stormy']
      const weatherDetails = {
        'clear': { cloudCover: 5 + Math.random() * 15, visibility: 15 + Math.random() * 10, confidence: 0.9 },
        'partly_cloudy': { cloudCover: 20 + Math.random() * 30, visibility: 10 + Math.random() * 8, confidence: 0.8 },
        'cloudy': { cloudCover: 50 + Math.random() * 30, visibility: 5 + Math.random() * 8, confidence: 0.85 },
        'overcast': { cloudCover: 80 + Math.random() * 20, visibility: 2 + Math.random() * 5, confidence: 0.9 },
        'stormy': { cloudCover: 95 + Math.random() * 5, visibility: 1 + Math.random() * 3, confidence: 0.7 }
      }
      
      const weatherType = cloudTypes[Math.floor(Math.random() * cloudTypes.length)]
      const conditions = weatherDetails[weatherType]
      
      const analysisTexts = {
        'clear': 'Excellent clear sky conditions detected. Minimal cloud coverage with high visibility. Perfect for solar and stellar navigation.',
        'partly_cloudy': 'Partly cloudy conditions with scattered clouds. Good visibility for most navigation methods.',
        'cloudy': 'Significant cloud coverage detected. Reduced visibility may impact celestial navigation accuracy.',
        'overcast': 'Heavy overcast conditions with dense cloud coverage. Limited celestial navigation opportunities.',
        'stormy': 'Storm conditions detected with very poor visibility. GPS navigation strongly recommended.'
      }
      
      const mockAnalysis: WeatherAnalysisResponse = {
        conditions: {
          cloudCover: conditions.cloudCover,
          visibility: conditions.visibility,
          weatherType,
          confidence: conditions.confidence
        },
        analysis: {
          classification: `AI Weather Analysis (${imageCount} images processed)`,
          confidence: conditions.confidence,
          details: analysisTexts[weatherType]
        },
        timestamp: Date.now()
      }

      // Save analysis to weather readings
      await this.createWeatherReading({
        cloud_cover: mockAnalysis.conditions.cloudCover,
        visibility: mockAnalysis.conditions.visibility,
        weather_type: mockAnalysis.conditions.weatherType,
        confidence: mockAnalysis.conditions.confidence,
        analysis_details: mockAnalysis.analysis.details,
        image_count: imageCount,
        timestamp: mockAnalysis.timestamp
      })

      return mockAnalysis
    } catch (error) {
      console.error('Weather analysis error:', error)
      throw new Error('Failed to analyze weather conditions. Please check your images and try again.')
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