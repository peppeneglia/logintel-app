import { geocode } from './geocode'

// ── Chat (Gemini via Vercel serverless) ──

export function sendChatMessage(message: string, history: { role: string; content: string }[]) {
  return apiCall<{ response: string }>('/api/chat', { message, history })
}

// ── Railway Prediction API types ──

export interface Coordinate {
  lat: number
  lon: number
}

export interface PredictionRequest {
  origin: Coordinate
  destination: Coordinate
  departure_time: string
  include_alternatives?: boolean
}

export interface SegmentWeather {
  type: string
  severity: string
  raw_value: number
  description: string
}

export interface Segment {
  index: number
  start_point: Coordinate
  end_point: Coordinate
  length_km: number
  estimated_arrival: string
  weather: SegmentWeather[]
  factors: {
    road_type: string
    road_factor: number
    altitude_m: number
    [key: string]: unknown
  }
  delay_minutes: number
}

export interface Alternative {
  route_index: number
  total_delay_minutes: number
  duration_minutes: number
  distance_km: number
  delay_savings_minutes: number
  summary: string
}

export interface PredictionResponse {
  id: string
  total_delay_minutes: number
  confidence: {
    overall: number
    level: string
    components: Record<string, unknown>
  }
  segments: Segment[]
  alternatives: Alternative[]
}

// ── API helpers ──

async function apiCall<T>(endpoint: string, body: unknown): Promise<T> {
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Errore del server' }))
    throw new Error(err.error || err.detail || `Errore ${res.status}`)
  }

  return res.json()
}

// ── Prediction cache (5 min TTL) ──

const predictionCache = new Map<string, { data: PredictionResponse; ts: number }>()
const CACHE_TTL = 5 * 60 * 1000

function predictionCacheKey(origin: Coordinate, destination: Coordinate, time: string): string {
  return `${origin.lat},${origin.lon}|${destination.lat},${destination.lon}|${time}`
}

// ── Prediction functions ──

export async function predictRoute(
  originInput: string | Coordinate,
  destinationInput: string | Coordinate,
  departureTime: string,
  includeAlternatives = true
): Promise<PredictionResponse> {
  const [origin, destination] = await Promise.all([
    typeof originInput === 'string' ? geocode(originInput) : Promise.resolve(originInput),
    typeof destinationInput === 'string' ? geocode(destinationInput) : Promise.resolve(destinationInput),
  ])

  const isoTime = departureTime.includes('+') || departureTime.includes('Z')
    ? departureTime
    : `${departureTime}:00+01:00`

  // Check cache
  const cacheKey = predictionCacheKey(origin, destination, isoTime)
  const cached = predictionCache.get(cacheKey)
  if (cached && Date.now() - cached.ts < CACHE_TTL) {
    return cached.data
  }

  const result = await apiCall<PredictionResponse>('/api/predict', {
    origin,
    destination,
    departure_time: isoTime,
    include_alternatives: includeAlternatives,
  })

  predictionCache.set(cacheKey, { data: result, ts: Date.now() })
  return result
}
