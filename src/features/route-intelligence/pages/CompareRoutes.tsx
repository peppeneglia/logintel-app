import React, { useState } from 'react'
import { mockRouteComparisons } from '../../../data/mockData'
import { useAuthStore } from '../../../stores/authStore'
import { RiskBadge } from '../../../components/RiskBadge'
import { CityAutocomplete } from '../../../components/CityAutocomplete'
import type { CitySelection } from '../../../components/CityAutocomplete'
import { predictRoute } from '../../../services/api'
import type { PredictionResponse } from '../../../services/api'

function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = Math.round(minutes % 60)
  return `${h}h ${m}min`
}

function getRiskFromDelay(delay: number): 'low' | 'medium' | 'high' {
  if (delay < 10) return 'low'
  if (delay <= 30) return 'medium'
  return 'high'
}

interface DisplayRoute {
  name: string
  distance: number
  baseDuration: number
  weatherDelay: number
  risk: 'low' | 'medium' | 'high'
  eta: string
  recommended?: boolean
}

function predictionToDisplayRoutes(pred: PredictionResponse, origin: string, destination: string, departureTime: string): DisplayRoute[] {
  const departure = new Date(departureTime)
  const totalDistanceKm = pred.segments.reduce((sum, s) => sum + s.length_km, 0)
  const lastArrival = pred.segments.length ? new Date(pred.segments[pred.segments.length - 1].estimated_arrival) : departure
  const totalMinutes = (lastArrival.getTime() - departure.getTime()) / 60_000
  const baseDuration = Math.round(totalMinutes - pred.total_delay_minutes)

  const mainRoute: DisplayRoute = {
    name: `${origin} → ${destination} (principale)`,
    distance: Math.round(totalDistanceKm),
    baseDuration,
    weatherDelay: Math.round(pred.total_delay_minutes),
    risk: getRiskFromDelay(pred.total_delay_minutes),
    eta: lastArrival.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }),
    recommended: pred.alternatives.length === 0 || pred.total_delay_minutes <= Math.min(...pred.alternatives.map((a) => a.total_delay_minutes)),
  }

  const altRoutes: DisplayRoute[] = pred.alternatives.map((alt, idx) => {
    const altArrival = new Date(departure.getTime() + alt.duration_minutes * 60_000 + alt.total_delay_minutes * 60_000)
    const altBaseDuration = Math.round(alt.duration_minutes)
    const isBest = alt.total_delay_minutes < pred.total_delay_minutes
    return {
      name: alt.summary || `Alternativa ${idx + 1}`,
      distance: Math.round(alt.distance_km),
      baseDuration: altBaseDuration,
      weatherDelay: Math.round(alt.total_delay_minutes),
      risk: getRiskFromDelay(alt.total_delay_minutes),
      eta: altArrival.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }),
      recommended: isBest,
    }
  })

  // If an alternative is recommended, un-recommend the main route
  if (altRoutes.some((r) => r.recommended)) {
    mainRoute.recommended = false
  }

  return [mainRoute, ...altRoutes]
}

export function CompareRoutes() {
  const isDemo = useAuthStore((s) => s.isDemo)
  const [origin, setOrigin] = useState(isDemo ? 'Bologna' : '')
  const [originCoords, setOriginCoords] = useState<CitySelection | null>(null)
  const [destination, setDestination] = useState(isDemo ? 'Napoli' : '')
  const [destinationCoords, setDestinationCoords] = useState<CitySelection | null>(null)
  const [departureTime, setDepartureTime] = useState(isDemo ? '2026-02-25T08:00' : '')
  const [showResults, setShowResults] = useState(isDemo)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [apiRoutes, setApiRoutes] = useState<DisplayRoute[]>([])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!origin.trim() || !destination.trim() || !departureTime) return

    if (new Date(departureTime) <= new Date()) {
      setError('La data e ora di partenza devono essere nel futuro')
      return
    }

    setLoading(true)
    setError('')
    setShowResults(false)

    if (isDemo) {
      setTimeout(() => {
        setLoading(false)
        setShowResults(true)
      }, 800)
      return
    }

    try {
      const originArg = originCoords ? { lat: originCoords.lat, lon: originCoords.lon } : origin
      const destArg = destinationCoords ? { lat: destinationCoords.lat, lon: destinationCoords.lon } : destination
      const pred = await predictRoute(originArg, destArg, departureTime, true)
      setApiRoutes(predictionToDisplayRoutes(pred, origin, destination, departureTime))
      setShowResults(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore nel confronto rotte')
    } finally {
      setLoading(false)
    }
  }

  const displayRoutes = isDemo ? mockRouteComparisons : apiRoutes

  return (
    <div>
      <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-400 to-cyan-500 bg-clip-text text-transparent mb-3">Confronta Percorsi</h1>

      <form onSubmit={handleSubmit} className="bg-[#1e293b] rounded-2xl border border-[#334155] p-6 mb-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Origine</label>
            <CityAutocomplete value={origin} onChange={(val, coords) => { setOrigin(val); setOriginCoords(coords) }} placeholder="es. Bologna" className="w-full px-3 py-2 bg-[#334155] border border-slate-600 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Destinazione</label>
            <CityAutocomplete value={destination} onChange={(val, coords) => { setDestination(val); setDestinationCoords(coords) }} placeholder="es. Napoli" className="w-full px-3 py-2 bg-[#334155] border border-slate-600 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Data/ora partenza</label>
            <input type="datetime-local" value={departureTime} onChange={(e) => setDepartureTime(e.target.value)} className="w-full px-3 py-2 bg-[#334155] border border-slate-600 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500" />
          </div>
        </div>
        <button type="submit" disabled={loading} className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-700 text-white font-medium rounded-xl hover:from-emerald-600 hover:to-emerald-800 transition-colors text-sm disabled:opacity-60">
          {loading ? 'Calcolo in corso...' : 'Confronta percorsi'}
        </button>
      </form>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 mb-3">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {loading && (
        <div className="bg-[#1e293b] rounded-2xl border border-[#334155] p-12 text-center">
          <div className="animate-spin w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full mx-auto mb-3" />
          <p className="text-sm text-slate-500">Confronto percorsi in corso...</p>
        </div>
      )}

      {showResults && !loading && displayRoutes.length > 0 && (
        <div className="card-accent bg-[#1e293b] rounded-2xl border border-[#334155] p-6">
          <h2 className="text-sm font-semibold text-slate-300 mb-4">{origin} &rarr; {destination} &mdash; Confronto percorsi</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#334155]">
                  <th className="text-left py-3 px-3 font-medium text-slate-400">Percorso</th>
                  <th className="text-left py-3 px-3 font-medium text-slate-400">Distanza</th>
                  <th className="text-left py-3 px-3 font-medium text-slate-400">Durata base</th>
                  <th className="text-left py-3 px-3 font-medium text-slate-400">Ritardo meteo</th>
                  <th className="text-left py-3 px-3 font-medium text-slate-400">Rischio</th>
                  <th className="text-left py-3 px-3 font-medium text-slate-400">ETA</th>
                </tr>
              </thead>
              <tbody>
                {displayRoutes.map((route, idx) => (
                  <tr key={idx} className={`border-b border-[#334155] ${route.recommended ? 'bg-emerald-500/5' : ''}`}>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <span className="text-white font-medium">{route.name}</span>
                        {route.recommended && (
                          <span className="inline-flex items-center rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-xs font-semibold text-emerald-400">Consigliato</span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-3 text-slate-400">{route.distance} km</td>
                    <td className="py-3 px-3 text-slate-400">{formatDuration(route.baseDuration)}</td>
                    <td className="py-3 px-3">
                      <span className={`font-semibold ${route.weatherDelay < 10 ? 'text-emerald-400' : route.weatherDelay <= 30 ? 'text-amber-400' : 'text-red-400'}`}>+{route.weatherDelay} min</span>
                    </td>
                    <td className="py-3 px-3"><RiskBadge risk={route.risk} delay={route.weatherDelay} /></td>
                    <td className="py-3 px-3 text-white font-medium">{route.eta}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
