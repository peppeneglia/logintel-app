import React, { useState } from 'react'
import { mockSinglePrediction } from '../../../data/mockData'
import { useAuthStore } from '../../../stores/authStore'
import { ConfidenceBar } from '../../../components/ConfidenceBar'
import { CityAutocomplete } from '../../../components/CityAutocomplete'
import type { CitySelection } from '../../../components/CityAutocomplete'
import { RouteMap } from '../../../components/RouteMap'
import { predictRoute } from '../../../services/api'
import type { PredictionResponse } from '../../../services/api'
import type { WeatherCondition } from '../../../types'

const weatherEmoji: Record<string, string> = {
  clear: '\u2600\uFE0F',
  rain_light: '\uD83C\uDF26\uFE0F',
  rain_heavy: '\uD83C\uDF27\uFE0F',
  rain: '\uD83C\uDF27\uFE0F',
  snow: '\u2744\uFE0F',
  fog: '\uD83C\uDF2B\uFE0F',
  wind: '\uD83D\uDCA8',
  storm: '\u26C8\uFE0F',
  clouds: '\u2601\uFE0F',
}

const weatherTypeIT: Record<string, string> = {
  rain: 'Pioggia',
  snow: 'Neve',
  wind: 'Vento',
  fog: 'Nebbia',
  storm: 'Temporale',
  clouds: 'Nuvoloso',
  clear: 'Sereno',
}

const severityIT: Record<string, string> = {
  light: 'leggera',
  moderate: 'moderata',
  heavy: 'forte',
  very_heavy: 'molto forte',
}

const confidenceLevelIT: Record<string, string> = {
  high: 'Alta',
  good: 'Buona',
  moderate: 'Moderata',
  low: 'Bassa',
}

const roadTypeIT: Record<string, string> = {
  highway: 'Autostrada',
  state_road: 'Strada statale',
  provincial: 'Provinciale',
  mountain: 'Montagna',
}

function getWeatherColor(severity: string): string {
  if (severity === 'light') return 'text-amber-400'
  if (severity === 'moderate') return 'text-amber-400'
  return 'text-red-400' // heavy, very_heavy
}

function getDelayColor(delay: number): string {
  if (delay < 10) return 'text-emerald-400'
  if (delay < 30) return 'text-amber-400'
  return 'text-red-400'
}

function translateWeather(type: string, severity: string): string {
  const typeIt = weatherTypeIT[type] || type
  const sevIt = severityIT[severity] || severity
  return `${typeIt} ${sevIt}`
}

function isNightTime(dateStr: string): boolean {
  const date = new Date(dateStr)
  const hour = date.getHours()
  return hour < 6 || hour >= 21
}

function getClearEmoji(dateStr: string): string {
  return isNightTime(dateStr) ? '\uD83C\uDF19' : '\u2600\uFE0F'
}

function formatDateTime(date: Date): string {
  return date.toLocaleDateString('it-IT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }) + ' ' + date.toLocaleTimeString('it-IT', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function SinglePrediction() {
  const isDemo = useAuthStore((s) => s.isDemo)

  const [origin, setOrigin] = useState(isDemo ? 'Milano' : '')
  const [originCoords, setOriginCoords] = useState<CitySelection | null>(null)
  const [destination, setDestination] = useState(isDemo ? 'Roma' : '')
  const [destinationCoords, setDestinationCoords] = useState<CitySelection | null>(null)
  const [departureTime, setDepartureTime] = useState(isDemo ? '2026-02-25T08:00' : '')
  const [vehicleType, setVehicleType] = useState('truck_standard')
  const [showResult, setShowResult] = useState(isDemo)
  const [loading, setLoading] = useState(false)
  const [showSkeleton, setShowSkeleton] = useState(false)
  const [error, setError] = useState('')
  const [apiResult, setApiResult] = useState<PredictionResponse | null>(null)
  const [submittedOrigin, setSubmittedOrigin] = useState('')
  const [submittedDestination, setSubmittedDestination] = useState('')
  const [submittedDeparture, setSubmittedDeparture] = useState('')
  const [bestTimeLoading, setBestTimeLoading] = useState(false)
  const [bestTimeResult, setBestTimeResult] = useState<{ time: string; delay: number; all: { time: string; delay: number }[] } | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!origin.trim() || !destination.trim() || !departureTime) return

    if (new Date(departureTime) <= new Date()) {
      setError('La data e ora di partenza devono essere nel futuro')
      return
    }

    setLoading(true)
    setError('')
    setShowResult(false)

    if (isDemo) {
      setTimeout(() => {
        setLoading(false)
        setShowResult(true)
      }, 1000)
      return
    }

    setSubmittedOrigin(origin)
    setSubmittedDestination(destination)
    setSubmittedDeparture(departureTime)
    setShowSkeleton(false)
    setBestTimeResult(null)

    const skeletonTimer = setTimeout(() => setShowSkeleton(true), 2000)

    const originArg = originCoords ? { lat: originCoords.lat, lon: originCoords.lon } : origin
    const destArg = destinationCoords ? { lat: destinationCoords.lat, lon: destinationCoords.lon } : destination

    try {
      const result = await predictRoute(originArg, destArg, departureTime)
      setApiResult(result)
      setShowResult(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore nella predizione')
    } finally {
      clearTimeout(skeletonTimer)
      setShowSkeleton(false)
      setLoading(false)
    }
  }

  const handleSuggestBestTime = async () => {
    if (!submittedDeparture) return

    setBestTimeLoading(true)
    setBestTimeResult(null)

    const base = new Date(submittedDeparture)
    const offsets = [-2, -1, 1, 2]
    const times = offsets
      .map((h) => new Date(base.getTime() + h * 3600_000))
      .filter((d) => d > new Date()) // solo orari futuri
      .map((d) => {
        const yyyy = d.getFullYear()
        const mm = String(d.getMonth() + 1).padStart(2, '0')
        const dd = String(d.getDate()).padStart(2, '0')
        const hh = String(d.getHours()).padStart(2, '0')
        const min = String(d.getMinutes()).padStart(2, '0')
        return `${yyyy}-${mm}-${dd}T${hh}:${min}`
      })

    if (times.length === 0) {
      setBestTimeLoading(false)
      return
    }

    const originArg = originCoords ? { lat: originCoords.lat, lon: originCoords.lon } : submittedOrigin
    const destArg = destinationCoords ? { lat: destinationCoords.lat, lon: destinationCoords.lon } : submittedDestination

    try {
      const results = await Promise.all(
        times.map((t) => predictRoute(originArg, destArg, t, false))
      )

      const entries = times.map((t, i) => ({
        time: t,
        delay: results[i].total_delay_minutes,
      }))

      const allEntries = [
        { time: submittedDeparture, delay: apiResult!.total_delay_minutes },
        ...entries,
      ].sort((a, b) => a.delay - b.delay)

      setBestTimeResult({ time: allEntries[0].time, delay: allEntries[0].delay, all: allEntries })
    } catch {
      // silently fail
    } finally {
      setBestTimeLoading(false)
    }
  }

  const prediction = isDemo ? mockSinglePrediction : null
  const result = apiResult

  // Compute total distance and ETAs from Railway response
  const totalDistanceKm = result
    ? result.segments.reduce((sum, s) => sum + s.length_km, 0)
    : 0
  const lastSegmentArrival = result?.segments.length
    ? new Date(result.segments[result.segments.length - 1].estimated_arrival)
    : null
  const departureDate = submittedDeparture ? new Date(submittedDeparture) : null
  const correctedETA = lastSegmentArrival

  return (
    <div>
      <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-400 to-cyan-500 bg-clip-text text-transparent mb-3">Predizione Singola</h1>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-[#1e293b] rounded-2xl border border-[#334155] p-6 mb-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Origine</label>
            <CityAutocomplete
              value={origin}
              onChange={(val, coords) => { setOrigin(val); setOriginCoords(coords) }}
              placeholder="es. Milano"
              className="w-full px-3 py-2 bg-[#334155] border border-slate-600 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Destinazione</label>
            <CityAutocomplete
              value={destination}
              onChange={(val, coords) => { setDestination(val); setDestinationCoords(coords) }}
              placeholder="es. Roma"
              className="w-full px-3 py-2 bg-[#334155] border border-slate-600 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Data e ora partenza</label>
            <input
              type="datetime-local"
              value={departureTime}
              onChange={(e) => setDepartureTime(e.target.value)}
              className="w-full px-3 py-2 bg-[#334155] border border-slate-600 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Tipo veicolo</label>
            <select
              value={vehicleType}
              onChange={(e) => setVehicleType(e.target.value)}
              className="w-full px-3 py-2 bg-[#334155] border border-slate-600 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500"
            >
              <option value="truck_standard">Truck standard</option>
              <option value="truck_refrigerato">Truck refrigerato</option>
              <option value="furgone">Furgone</option>
              <option value="altro">Altro</option>
            </select>
          </div>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-700 text-white font-medium rounded-xl hover:from-emerald-600 hover:to-emerald-800 transition-colors disabled:opacity-60"
        >
          {loading ? 'Calcolo in corso...' : 'Calcola predizione'}
        </button>
      </form>

      {/* Error */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 mb-3">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {/* Loading — spinner iniziale, poi skeleton dopo 2s */}
      {loading && !showSkeleton && (
        <div className="bg-[#1e293b] rounded-2xl border border-[#334155] p-12 text-center">
          <div className="animate-spin w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full mx-auto mb-3" />
          <p className="text-sm text-slate-500">Calcolo predizione in corso...</p>
        </div>
      )}

      {loading && showSkeleton && submittedOrigin && (
        <div className="card-accent bg-[#1e293b] rounded-2xl border border-[#334155] p-6 animate-pulse">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-white">{submittedOrigin} &rarr; {submittedDestination}</h2>
              <p className="text-sm text-slate-500">{submittedDeparture.replace('T', ' ')}</p>
            </div>
          </div>
          <div className="bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border border-emerald-500/20 rounded-2xl p-5 mb-4">
            <p className="text-sm text-slate-400 mb-2">Calcolo ETA in corso...</p>
            <div className="flex items-center gap-4">
              <div>
                <p className="text-xs text-slate-500">Partenza</p>
                <p className="text-lg font-bold text-white">{submittedDeparture.replace('T', ' ')}</p>
              </div>
              <span className="text-slate-500 text-xl">&rarr;</span>
              <div>
                <p className="text-xs text-slate-500">Arrivo</p>
                <div className="h-6 w-32 bg-slate-700 rounded animate-pulse" />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
            <div className="bg-[#334155] rounded-xl p-4">
              <p className="text-sm text-slate-400 mb-2">Ritardo stimato</p>
              <div className="h-10 w-24 bg-slate-700 rounded animate-pulse" />
            </div>
            <div className="bg-[#334155] rounded-xl p-4">
              <p className="text-sm text-slate-400 mb-2">Confidenza</p>
              <div className="h-4 w-full bg-slate-700 rounded animate-pulse" />
            </div>
            <div className="bg-[#334155] rounded-xl p-4">
              <p className="text-sm text-slate-400 mb-2">Distanza totale</p>
              <div className="h-8 w-20 bg-slate-700 rounded animate-pulse" />
            </div>
          </div>
          <div className="flex items-center justify-center gap-2 py-4">
            <div className="animate-spin w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full" />
            <p className="text-sm text-slate-500">Analisi meteo e percorso in corso...</p>
          </div>
        </div>
      )}

      {/* Demo result */}
      {isDemo && showResult && !loading && prediction && (
        <div className="card-accent bg-[#1e293b] rounded-2xl border border-[#334155] p-6">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-lg font-semibold text-white">{prediction.origin} &rarr; {prediction.destination}</h2>
              <p className="text-sm text-slate-500">{formatDateTime(prediction.departureTime)}</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-3">
            <div className="bg-[#334155] rounded-xl p-4">
              <p className="text-sm text-slate-400 mb-1">Ritardo stimato</p>
              <p className={`text-4xl font-bold ${getDelayColor(prediction.estimatedDelay)}`}>+{prediction.estimatedDelay} min</p>
            </div>
            <div className="bg-[#334155] rounded-xl p-4">
              <p className="text-sm text-slate-400 mb-2">Confidenza</p>
              <ConfidenceBar value={prediction.confidence} />
            </div>
          </div>
          <div className="mb-3">
            <h3 className="text-sm font-semibold text-slate-300 mb-3">Condizioni meteo lungo il percorso</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#334155]">
                    <th className="text-left py-2 px-3 font-medium text-slate-400">Localita</th>
                    <th className="text-left py-2 px-3 font-medium text-slate-400">Km</th>
                    <th className="text-left py-2 px-3 font-medium text-slate-400">Condizioni</th>
                    <th className="text-left py-2 px-3 font-medium text-slate-400">Temperatura</th>
                    <th className="text-left py-2 px-3 font-medium text-slate-400">Impatto</th>
                  </tr>
                </thead>
                <tbody>
                  {prediction.weatherConditions.map((wp, idx) => (
                    <tr key={idx} className="border-b border-[#334155]">
                      <td className="py-2 px-3 text-white">{wp.location}</td>
                      <td className="py-2 px-3 text-slate-400">{wp.km}</td>
                      <td className="py-2 px-3">
                        <span className="mr-1">{weatherEmoji[wp.condition as WeatherCondition]}</span>
                        <span className="text-slate-400">{wp.condition.replace('_', ' ')}</span>
                      </td>
                      <td className="py-2 px-3 text-slate-400">{wp.temperature}°C</td>
                      <td className="py-2 px-3">
                        {wp.impactMinutes > 0 ? (
                          <span className="text-orange-400 font-medium">+{wp.impactMinutes} min</span>
                        ) : (
                          <span className="text-emerald-400">Nessuno</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          {prediction.estimatedDelay > 15 && prediction.alternativeRoute && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 mb-3">
              <h3 className="text-sm font-semibold text-emerald-400 mb-2">Percorso alternativo consigliato</h3>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-emerald-300"><span className="font-medium">{prediction.alternativeRoute.name}</span> &mdash; {prediction.alternativeRoute.distance} km</p>
                  <p className="text-sm text-emerald-400">Ritardo stimato: +{prediction.alternativeRoute.estimatedDelay} min</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-emerald-400">-{prediction.alternativeRoute.savings} min</p>
                  <p className="text-xs text-emerald-400">risparmio</p>
                </div>
              </div>
            </div>
          )}
          <div className="bg-[#334155] rounded-xl p-4 mb-3">
            <div className="flex items-center gap-6">
              <div>
                <p className="text-xs text-slate-400">ETA originale</p>
                <p className="text-sm font-medium text-slate-300">{formatDateTime(prediction.originalETA)}</p>
              </div>
              <span className="text-slate-500">&rarr;</span>
              <div>
                <p className="text-xs text-slate-400">ETA corretta</p>
                <p className="text-sm font-semibold text-white">{formatDateTime(prediction.correctedETA)}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* API result (real users) */}
      {!isDemo && showResult && !loading && result && (
        <div className="card-accent bg-[#1e293b] rounded-2xl border border-[#334155] p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-white">{submittedOrigin} &rarr; {submittedDestination}</h2>
              <p className="text-sm text-slate-500">{submittedDeparture.replace('T', ' ')}</p>
            </div>
          </div>

          {/* ETA — da partenza a arrivo */}
          {departureDate && correctedETA && (
            <div className="bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border border-emerald-500/20 rounded-2xl p-5 mb-4">
              <div className="flex items-center gap-6">
                <div>
                  <p className="text-xs text-slate-500">Partenza</p>
                  <p className="text-2xl font-bold text-white">{formatDateTime(departureDate)}</p>
                </div>
                <span className="text-slate-500 text-2xl">&rarr;</span>
                <div>
                  <p className="text-xs text-slate-500">Arrivo</p>
                  <p className="text-2xl font-bold text-white">{formatDateTime(correctedETA)}</p>
                </div>
              </div>
              {result.total_delay_minutes > 0 && (
                <p className="text-sm text-slate-400 mt-2">
                  Ritardo meteo: <span className="text-red-400 font-semibold">+{Math.round(result.total_delay_minutes)} min</span>
                </p>
              )}
            </div>
          )}

          {/* Delay + Confidence + Distanza */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
            <div className="bg-[#334155] rounded-xl p-4">
              <p className="text-sm text-slate-400 mb-1">Ritardo stimato</p>
              <p className={`text-4xl font-bold ${result.total_delay_minutes > 0 ? 'text-red-400' : 'text-emerald-400'}`}>+{Math.round(result.total_delay_minutes)} min</p>
            </div>
            <div className="bg-[#334155] rounded-xl p-4">
              <p className="text-sm text-slate-400 mb-2">Confidenza</p>
              <ConfidenceBar value={result.confidence.overall} />
              <p className="text-xs text-slate-500 mt-1">Livello: {confidenceLevelIT[result.confidence.level] || result.confidence.level}</p>
            </div>
            <div className="bg-[#334155] rounded-xl p-4">
              <p className="text-sm text-slate-400 mb-1">Distanza totale</p>
              <p className="text-2xl font-bold text-white">{Math.round(totalDistanceKm)} km</p>
            </div>
          </div>

          {/* Segments */}
          <div className="mb-3">
            <h3 className="text-sm font-semibold text-slate-300 mb-3">Segmenti del percorso</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#334155]">
                    <th className="text-left py-2 px-3 font-medium text-slate-400">#</th>
                    <th className="text-left py-2 px-3 font-medium text-slate-400">Distanza</th>
                    <th className="text-left py-2 px-3 font-medium text-slate-400">Tipo strada</th>
                    <th className="text-left py-2 px-3 font-medium text-slate-400">Altitudine</th>
                    <th className="text-left py-2 px-3 font-medium text-slate-400">Meteo</th>
                    <th className="text-left py-2 px-3 font-medium text-slate-400">Ritardo</th>
                    <th className="text-left py-2 px-3 font-medium text-slate-400">Orario</th>
                  </tr>
                </thead>
                <tbody>
                  {result.segments.map((seg) => (
                    <tr key={seg.index} className="border-b border-[#334155]">
                      <td className="py-2 px-3 text-slate-400">{seg.index + 1}</td>
                      <td className="py-2 px-3 text-white">{seg.length_km.toFixed(1)} km</td>
                      <td className="py-2 px-3 text-slate-400">{roadTypeIT[seg.factors.road_type as string] || seg.factors.road_type || '—'}</td>
                      <td className="py-2 px-3 text-slate-400">{Math.round(seg.factors.altitude_m)} m</td>
                      <td className="py-2 px-3">
                        {seg.weather.length > 0 ? seg.weather.map((w, i) => (
                          <span key={i} className="inline-flex items-center gap-1 mr-2">
                            <span>{weatherEmoji[w.type] || '\u2600\uFE0F'}</span>
                            <span className={`text-xs ${getWeatherColor(w.severity)}`}>{translateWeather(w.type, w.severity)}</span>
                          </span>
                        )) : (
                          <span className="text-emerald-400 text-xs">
                            {getClearEmoji(seg.estimated_arrival)} Sereno
                          </span>
                        )}
                      </td>
                      <td className="py-2 px-3">
                        {seg.delay_minutes > 0 ? (
                          <span className="font-semibold text-red-400">+{seg.delay_minutes.toFixed(1)} min</span>
                        ) : (
                          <span className="text-emerald-400">0 min</span>
                        )}
                      </td>
                      <td className="py-2 px-3 text-slate-400 text-xs">{new Date(seg.estimated_arrival).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mappa del percorso */}
          <div className="mb-3">
            <h3 className="text-sm font-semibold text-slate-300 mb-3">Mappa del percorso</h3>
            <RouteMap key={result.id} segments={result.segments} />
          </div>

          {/* Suggerisci orario migliore */}
          {result.total_delay_minutes > 5 && (
            <div className="mb-3">
              <button
                onClick={handleSuggestBestTime}
                disabled={bestTimeLoading}
                className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-cyan-700 text-white font-medium rounded-xl hover:from-cyan-600 hover:to-cyan-800 transition-colors disabled:opacity-60 text-sm"
              >
                {bestTimeLoading ? 'Analisi orari in corso...' : 'Suggerisci orario migliore'}
              </button>
            </div>
          )}

          {bestTimeResult && (
            <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-2xl p-4 mb-3">
              <h3 className="text-sm font-semibold text-cyan-400 mb-3">Analisi orari alternativi</h3>
              <div className="space-y-2">
                {bestTimeResult.all.map((entry, i) => {
                  const isBest = entry.time === bestTimeResult.time
                  const isCurrent = entry.time === submittedDeparture
                  return (
                    <div key={i} className={`flex items-center justify-between px-3 py-2 rounded-xl ${isBest ? 'bg-emerald-500/15 border border-emerald-500/30' : 'bg-[#334155]'}`}>
                      <div className="flex items-center gap-2">
                        {isBest && <span className="text-emerald-400 text-xs font-bold">MIGLIORE</span>}
                        {isCurrent && !isBest && <span className="text-slate-500 text-xs">(attuale)</span>}
                        <span className="text-sm text-white">{entry.time.replace('T', ' ')}</span>
                      </div>
                      <span className={`text-sm font-semibold ${entry.delay > 5 ? 'text-red-400' : 'text-emerald-400'}`}>
                        +{Math.round(entry.delay)} min
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Alternatives */}
          {result.alternatives && result.alternatives.length > 0 && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 mb-3">
              <h3 className="text-sm font-semibold text-emerald-400 mb-3">Percorsi alternativi</h3>
              <div className="space-y-3">
                {result.alternatives.map((alt) => (
                  <div key={alt.route_index} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-emerald-300 font-medium">{alt.summary}</p>
                      <p className="text-xs text-slate-400">{Math.round(alt.distance_km)} km &mdash; {Math.round(alt.duration_minutes)} min</p>
                      <p className="text-xs text-emerald-400">Ritardo: +{Math.round(alt.total_delay_minutes)} min</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-emerald-400">-{Math.round(alt.delay_savings_minutes)} min</p>
                      <p className="text-xs text-emerald-400">risparmio</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
