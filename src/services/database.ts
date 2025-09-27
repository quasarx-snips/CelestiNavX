// IndexedDB wrapper for offline data persistence
export interface Measurement {
  id: string
  timestamp: number
  latitude: number | null
  longitude: number | null
  pitch: number
  heading: number
  elevation: number
  pressure: number
  temperature: number
  calculationMethod: 'solar' | 'gps'
  accuracy?: number
  notes?: string
}

export interface WeatherReading {
  id: string
  timestamp: number
  latitude?: number
  longitude?: number
  skyImages: {
    north?: string
    east?: string
    south?: string
    west?: string
  }
  conditions: {
    cloudCover?: number
    visibility?: number
    weatherType?: string
    confidence?: number
  }
  aiAnalysis?: {
    classification: string
    confidence: number
    details: string
  }
}

export interface UserSession {
  id: string
  startTime: number
  measurements: string[] // measurement IDs
  weatherReadings: string[] // weather reading IDs
  location?: {
    lat: number
    lng: number
    accuracy: number
  }
}

class OfflineDatabase {
  private db: IDBDatabase | null = null
  private readonly dbName = 'CelestiNavDB'
  private readonly version = 1

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version)
      
      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        this.db = request.result
        resolve()
      }
      
      request.onupgradeneeded = () => {
        const db = request.result
        
        // Measurements store
        if (!db.objectStoreNames.contains('measurements')) {
          const measurementStore = db.createObjectStore('measurements', { keyPath: 'id' })
          measurementStore.createIndex('timestamp', 'timestamp', { unique: false })
          measurementStore.createIndex('method', 'calculationMethod', { unique: false })
        }
        
        // Weather readings store
        if (!db.objectStoreNames.contains('weather')) {
          const weatherStore = db.createObjectStore('weather', { keyPath: 'id' })
          weatherStore.createIndex('timestamp', 'timestamp', { unique: false })
        }
        
        // User sessions store
        if (!db.objectStoreNames.contains('sessions')) {
          const sessionStore = db.createObjectStore('sessions', { keyPath: 'id' })
          sessionStore.createIndex('startTime', 'startTime', { unique: false })
        }
      }
    })
  }

  // Measurements
  async saveMeasurement(measurement: Measurement): Promise<void> {
    if (!this.db) throw new Error('Database not initialized')
    
    const transaction = this.db.transaction(['measurements'], 'readwrite')
    const store = transaction.objectStore('measurements')
    await store.put(measurement)
  }

  async getMeasurements(limit = 50): Promise<Measurement[]> {
    if (!this.db) throw new Error('Database not initialized')
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['measurements'], 'readonly')
      const store = transaction.objectStore('measurements')
      const index = store.index('timestamp')
      const request = index.openCursor(null, 'prev') // Latest first
      
      const results: Measurement[] = []
      let count = 0
      
      request.onsuccess = () => {
        const cursor = request.result
        if (cursor && count < limit) {
          results.push(cursor.value)
          count++
          cursor.continue()
        } else {
          resolve(results)
        }
      }
      
      request.onerror = () => reject(request.error)
    })
  }

  async getMeasurement(id: string): Promise<Measurement | null> {
    if (!this.db) throw new Error('Database not initialized')
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['measurements'], 'readonly')
      const store = transaction.objectStore('measurements')
      const request = store.get(id)
      
      request.onsuccess = () => resolve(request.result || null)
      request.onerror = () => reject(request.error)
    })
  }

  // Weather readings
  async saveWeatherReading(reading: WeatherReading): Promise<void> {
    if (!this.db) throw new Error('Database not initialized')
    
    const transaction = this.db.transaction(['weather'], 'readwrite')
    const store = transaction.objectStore('weather')
    await store.put(reading)
  }

  async getWeatherReadings(limit = 20): Promise<WeatherReading[]> {
    if (!this.db) throw new Error('Database not initialized')
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['weather'], 'readonly')
      const store = transaction.objectStore('weather')
      const index = store.index('timestamp')
      const request = index.openCursor(null, 'prev')
      
      const results: WeatherReading[] = []
      let count = 0
      
      request.onsuccess = () => {
        const cursor = request.result
        if (cursor && count < limit) {
          results.push(cursor.value)
          count++
          cursor.continue()
        } else {
          resolve(results)
        }
      }
      
      request.onerror = () => reject(request.error)
    })
  }

  // Sessions
  async createSession(): Promise<UserSession> {
    const session: UserSession = {
      id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      startTime: Date.now(),
      measurements: [],
      weatherReadings: []
    }
    
    if (!this.db) throw new Error('Database not initialized')
    
    const transaction = this.db.transaction(['sessions'], 'readwrite')
    const store = transaction.objectStore('sessions')
    await store.put(session)
    
    return session
  }

  async updateSession(session: UserSession): Promise<void> {
    if (!this.db) throw new Error('Database not initialized')
    
    const transaction = this.db.transaction(['sessions'], 'readwrite')
    const store = transaction.objectStore('sessions')
    await store.put(session)
  }

  async getSessions(limit = 10): Promise<UserSession[]> {
    if (!this.db) throw new Error('Database not initialized')
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['sessions'], 'readonly')
      const store = transaction.objectStore('sessions')
      const index = store.index('startTime')
      const request = index.openCursor(null, 'prev')
      
      const results: UserSession[] = []
      let count = 0
      
      request.onsuccess = () => {
        const cursor = request.result
        if (cursor && count < limit) {
          results.push(cursor.value)
          count++
          cursor.continue()
        } else {
          resolve(results)
        }
      }
      
      request.onerror = () => reject(request.error)
    })
  }

  // Statistics
  async getStats() {
    if (!this.db) throw new Error('Database not initialized')
    
    const measurements = await this.getMeasurements(1000)
    const weatherReadings = await this.getWeatherReadings(100)
    
    return {
      totalMeasurements: measurements.length,
      totalWeatherReadings: weatherReadings.length,
      averageAccuracy: measurements.filter(m => m.accuracy).reduce((sum, m) => sum + (m.accuracy || 0), 0) / measurements.filter(m => m.accuracy).length || 0,
      lastMeasurement: measurements[0]?.timestamp || null,
      methodBreakdown: {
        solar: measurements.filter(m => m.calculationMethod === 'solar').length,
        gps: measurements.filter(m => m.calculationMethod === 'gps').length
      }
    }
  }
}

// Singleton instance
export const offlineDB = new OfflineDatabase()

// Settings management using localStorage
export const settings = {
  get(key: string, defaultValue: any = null) {
    try {
      const value = localStorage.getItem(`celestinav_${key}`)
      return value ? JSON.parse(value) : defaultValue
    } catch {
      return defaultValue
    }
  },
  
  set(key: string, value: any) {
    try {
      localStorage.setItem(`celestinav_${key}`, JSON.stringify(value))
    } catch (error) {
      console.warn('Failed to save setting:', key, error)
    }
  },
  
  remove(key: string) {
    localStorage.removeItem(`celestinav_${key}`)
  }
}