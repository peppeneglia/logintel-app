// Navigazione
export type RouteSubPage = 'single' | 'weekly' | 'compare' | 'report' | 'history'

// Chat
export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  prediction?: PredictionResult
}

export interface ChatConversation {
  id: string
  title: string
  messages: ChatMessage[]
  createdAt: Date
}

// Predizioni
export interface PredictionResult {
  id: string
  origin: string
  destination: string
  departureTime: Date
  estimatedDelay: number
  confidence: number
  originalETA: Date
  correctedETA: Date
  weatherConditions: WeatherPoint[]
  alternativeRoute?: AlternativeRoute
  creditsCost: number
}

export interface WeatherPoint {
  km: number
  location: string
  condition: WeatherCondition
  impactMinutes: number
  temperature: number
}

export type WeatherCondition = 'clear' | 'rain_light' | 'rain_heavy' | 'snow' | 'fog' | 'wind' | 'storm'

export interface AlternativeRoute {
  name: string
  estimatedDelay: number
  savings: number
  distance: number
}

// Storico
export interface PredictionHistoryItem {
  id: string
  requestedAt: Date
  origin: string
  destination: string
  departureTime: Date
  estimatedDelay: number
  confidence: number
  originalETA: Date
  correctedETA: Date
  weatherConditions: WeatherPoint[]
  alternativeRoute?: AlternativeRoute
  creditsCost: number
  actualDelay?: number
  feedbackGiven: boolean
}

// Piano settimanale
export interface WeeklyRouteEntry {
  id: string
  origin: string
  destination: string
  dayOfWeek: string
  departureTime: string
  prediction?: PredictionResult
}

// Confronto percorsi
export interface RouteComparison {
  name: string
  distance: number
  baseDuration: number
  weatherDelay: number
  risk: 'low' | 'medium' | 'high'
  eta: string
  recommended?: boolean
}

// Utente
export interface UserProfile {
  name: string
  email: string
  company: string
  role: string
  fleetSize: number
  plan: 'free' | 'pro' | 'team' | 'enterprise'
  creditsRemaining: number
  creditsDailyLimit: number
}

