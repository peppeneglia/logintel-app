import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { mockWeeklyPlan } from '../../../data/mockData'
import { useAuthStore } from '../../../stores/authStore'
import { useCredits } from '../../../hooks/useCredits'
import { CREDIT_COSTS } from '../../../lib/creditCosts'
import { ConfidenceBar } from '../../../components/ConfidenceBar'
import { CreditConfirmModal } from '../../../components/CreditConfirmModal'
import { RiskBadge } from '../../../components/RiskBadge'
import { CityAutocomplete } from '../../../components/CityAutocomplete'
import type { CitySelection } from '../../../components/CityAutocomplete'
import { predictRoute } from '../../../services/api'
import type { PredictionResponse } from '../../../services/api'
import { ChevronDown, ChevronUp, X } from 'lucide-react'

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

const weatherTypeIT: Record<string, string> = {
  rain: 'Pioggia',
  snow: 'Neve',
  wind: 'Vento',
  fog: 'Nebbia',
}

const severityIT: Record<string, string> = {
  light: 'leggera',
  moderate: 'moderata',
  heavy: 'forte',
  very_heavy: 'molto forte',
}

const weatherEmoji: Record<string, string> = {
  rain: '\uD83C\uDF27\uFE0F',
  snow: '\u2744\uFE0F',
  fog: '\uD83C\uDF2B\uFE0F',
  wind: '\uD83D\uDCA8',
}

function getRiskLevel(delay: number): 'low' | 'medium' | 'high' {
  if (delay < 10) return 'low'
  if (delay <= 30) return 'medium'
  return 'high'
}

function getRowBg(delay: number): string {
  if (delay < 10) return 'bg-emerald-500/5'
  if (delay <= 30) return 'bg-amber-500/5'
  return 'bg-red-500/5'
}

function isNightTime(dateStr: string): boolean {
  const h = new Date(dateStr).getHours()
  return h < 6 || h >= 21
}

function getClearEmoji(dateStr: string): string {
  return isNightTime(dateStr) ? '\uD83C\uDF19' : '\u2600\uFE0F'
}

function getWeatherColor(severity: string): string {
  if (severity === 'light' || severity === 'moderate') return 'text-amber-400'
  return 'text-red-400'
}

const DAYS_MAP: Record<string, number> = {
  'Lunedi': 1, 'Lunedì': 1,
  'Martedi': 2, 'Martedì': 2,
  'Mercoledi': 3, 'Mercoledì': 3,
  'Giovedi': 4, 'Giovedì': 4,
  'Venerdi': 5, 'Venerdì': 5,
  'Sabato': 6,
  'Domenica': 0,
}

function getNextDateForDay(dayName: string, time: string): string {
  const dayIndex = DAYS_MAP[dayName] ?? 1
  const now = new Date()
  const currentDay = now.getDay()
  let daysUntil = dayIndex - currentDay
  if (daysUntil <= 0) daysUntil += 7
  const targetDate = new Date(now)
  targetDate.setDate(now.getDate() + daysUntil)
  const yyyy = targetDate.getFullYear()
  const mm = String(targetDate.getMonth() + 1).padStart(2, '0')
  const dd = String(targetDate.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}T${time || '08:00'}`
}

function formatDateTime(date: Date): string {
  return date.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' }) +
    ' ' + date.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })
}

interface RouteInput {
  origin: string
  originCoords: CitySelection | null
  destination: string
  destinationCoords: CitySelection | null
  day: string
  time: string
}

interface WeeklyResult {
  origin: string
  destination: string
  dayOfWeek: string
  departureTime: string
  delay: number
  confidence: number
  confidenceLevel: string
  prediction: PredictionResponse
}

export function WeeklyPlan() {
  const isDemo = useAuthStore((s) => s.isDemo)
  const navigate = useNavigate()
  const { creditsRemaining, dailyLimit, extraCredits, canAfford, consume } = useCredits()
  const [showCreditModal, setShowCreditModal] = useState(false)
  const [pendingCost, setPendingCost] = useState(0)
  const [showResults, setShowResults] = useState(isDemo)
  const [loading, setLoading] = useState(false)
  const [cooldown, setCooldown] = useState(false)
  const [error, setError] = useState('')
  const [apiResults, setApiResults] = useState<WeeklyResult[]>([])
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null)

  const [routes, setRoutes] = useState<RouteInput[]>([
    { origin: '', originCoords: null, destination: '', destinationCoords: null, day: '', time: '' },
  ])

  const updateRoute = (idx: number, field: keyof RouteInput, value: string) => {
    setRoutes((prev) => prev.map((r, i) => i === idx ? { ...r, [field]: value } : r))
  }

  const removeRoute = (idx: number) => {
    setRoutes((prev) => prev.filter((_, i) => i !== idx))
  }

  const handleGenerate = async () => {
    const validRoutes = routes.filter((r) => r.origin.trim() && r.destination.trim() && r.day.trim())
    if (validRoutes.length === 0) return

    const totalCost = CREDIT_COSTS.WEEKLY_PLAN_ROUTE * validRoutes.length
    if (!canAfford(totalCost)) {
      setPendingCost(totalCost)
      setShowCreditModal(true)
      return
    }

    setLoading(true)
    setCooldown(true)
    setTimeout(() => setCooldown(false), 3000)
    setError('')
    setShowResults(false)
    setExpandedIdx(null)

    if (isDemo) {
      await consume(totalCost, 'WEEKLY_PLAN_ROUTE')
      setTimeout(() => {
        setLoading(false)
        setShowResults(true)
      }, 800)
      return
    }

    try {
      const results = await Promise.all(
        validRoutes.map(async (r) => {
          const departureTime = getNextDateForDay(r.day, r.time)
          const originArg = r.originCoords ? { lat: r.originCoords.lat, lon: r.originCoords.lon } : r.origin
          const destArg = r.destinationCoords ? { lat: r.destinationCoords.lat, lon: r.destinationCoords.lon } : r.destination
          const pred = await predictRoute(originArg, destArg, departureTime, false)
          return {
            origin: r.origin,
            destination: r.destination,
            dayOfWeek: r.day,
            departureTime: r.time,
            delay: Math.round(pred.total_delay_minutes),
            confidence: pred.confidence.overall,
            confidenceLevel: pred.confidence.level,
            prediction: pred,
          }
        })
      )
      setApiResults(results)
      setShowResults(true)
      await consume(totalCost, 'WEEKLY_PLAN_ROUTE')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore nella generazione del piano')
    } finally {
      setLoading(false)
    }
  }

  const toggleExpand = (idx: number) => {
    setExpandedIdx(expandedIdx === idx ? null : idx)
  }

  return (
    <div>
      <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-400 to-cyan-500 bg-clip-text text-transparent mb-3">Piano Settimanale</h1>

      <div className="bg-[#1e293b] rounded-2xl border border-[#334155] p-6 mb-3">
        <h2 className="text-sm font-semibold text-slate-300 mb-4">Rotte da analizzare</h2>
        <div className="space-y-3 mb-4">
          {routes.map((route, idx) => (
            <div key={idx} className="flex items-center gap-3">
              <div className="grid grid-cols-4 gap-3 flex-1">
                <CityAutocomplete
                  value={route.origin}
                  onChange={(val, coords) => setRoutes((prev) => prev.map((r, i) => i === idx ? { ...r, origin: val, originCoords: coords ?? r.originCoords } : r))}
                  placeholder="Origine"
                  className="px-3 py-2 bg-[#334155] border border-slate-600 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500/30"
                />
                <CityAutocomplete
                  value={route.destination}
                  onChange={(val, coords) => setRoutes((prev) => prev.map((r, i) => i === idx ? { ...r, destination: val, destinationCoords: coords ?? r.destinationCoords } : r))}
                  placeholder="Destinazione"
                  className="px-3 py-2 bg-[#334155] border border-slate-600 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500/30"
                />
                <input type="text" value={route.day} onChange={(e) => updateRoute(idx, 'day', e.target.value)} placeholder="es. Lunedi" className="px-3 py-2 bg-[#334155] border border-slate-600 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500/30" />
                <input type="text" value={route.time} onChange={(e) => updateRoute(idx, 'time', e.target.value)} placeholder="es. 06:00" className="px-3 py-2 bg-[#334155] border border-slate-600 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500/30" />
              </div>
              {routes.length > 1 && (
                <button onClick={() => removeRoute(idx)} className="p-2 text-slate-500 hover:text-red-400 transition-colors">
                  <X size={16} />
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setRoutes((prev) => [...prev, { origin: '', originCoords: null, destination: '', destinationCoords: null, day: '', time: '' }])}
            className="px-4 py-2 border border-slate-600 rounded-xl text-sm font-medium text-slate-300 hover:bg-[#334155] transition-colors"
          >
            Aggiungi rotta
          </button>
          <button
            onClick={handleGenerate}
            disabled={loading || cooldown}
            className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-700 text-white font-medium rounded-xl hover:from-emerald-600 hover:to-emerald-800 transition-colors text-sm disabled:opacity-60"
          >
            {loading ? 'Generazione in corso...' : 'Genera piano'}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 mb-3">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {loading && (
        <div className="bg-[#1e293b] rounded-2xl border border-[#334155] p-12 text-center">
          <div className="animate-spin w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full mx-auto mb-3" />
          <p className="text-sm text-slate-500">Generazione piano in corso...</p>
        </div>
      )}

      {/* Demo results */}
      {isDemo && showResults && !loading && (
        <div className="card-accent bg-[#1e293b] rounded-2xl border border-[#334155] p-6">
          <h2 className="text-sm font-semibold text-slate-300 mb-4">Risultati piano settimanale</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#334155]">
                  <th className="text-left py-3 px-3 font-medium text-slate-400">Rotta</th>
                  <th className="text-left py-3 px-3 font-medium text-slate-400">Giorno</th>
                  <th className="text-left py-3 px-3 font-medium text-slate-400">Partenza</th>
                  <th className="text-left py-3 px-3 font-medium text-slate-400">Ritardo Previsto</th>
                  <th className="text-left py-3 px-3 font-medium text-slate-400 min-w-[140px]">Confidenza</th>
                  <th className="text-left py-3 px-3 font-medium text-slate-400">Rischio</th>
                </tr>
              </thead>
              <tbody>
                {mockWeeklyPlan.map((entry) => {
                  const delay = entry.prediction?.estimatedDelay ?? 0
                  const confidence = entry.prediction?.confidence ?? 0
                  const risk = getRiskLevel(delay)
                  return (
                    <tr key={entry.id} className={`border-b border-[#334155] ${getRowBg(delay)}`}>
                      <td className="py-3 px-3 text-white font-medium">{entry.origin} &rarr; {entry.destination}</td>
                      <td className="py-3 px-3 text-slate-400">{entry.dayOfWeek}</td>
                      <td className="py-3 px-3 text-slate-400">{entry.departureTime}</td>
                      <td className="py-3 px-3"><span className={`font-semibold ${delay > 0 ? 'text-red-400' : 'text-emerald-400'}`}>+{delay} min</span></td>
                      <td className="py-3 px-3"><ConfidenceBar value={confidence} size="sm" /></td>
                      <td className="py-3 px-3"><RiskBadge risk={risk} delay={delay} /></td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* API results */}
      {!isDemo && showResults && !loading && apiResults.length > 0 && (
        <div className="card-accent bg-[#1e293b] rounded-2xl border border-[#334155] p-6">
          <h2 className="text-sm font-semibold text-slate-300 mb-4">Risultati piano settimanale</h2>
          <div className="space-y-0">
            {apiResults.map((r, idx) => {
              const risk = getRiskLevel(r.delay)
              const isExpanded = expandedIdx === idx
              const pred = r.prediction
              const totalDistanceKm = pred.segments.reduce((sum, s) => sum + s.length_km, 0)
              const lastArrival = pred.segments.length ? new Date(pred.segments[pred.segments.length - 1].estimated_arrival) : null

              return (
                <div key={idx}>
                  {/* Row */}
                  <div
                    onClick={() => toggleExpand(idx)}
                    className={`flex items-center gap-4 px-4 py-3 border-b border-[#334155] cursor-pointer hover:bg-[#334155]/50 transition-colors ${getRowBg(r.delay)}`}
                  >
                    <div className="flex-1 grid grid-cols-6 gap-4 items-center text-sm">
                      <span className="text-white font-medium">{r.origin} &rarr; {r.destination}</span>
                      <span className="text-slate-400">{r.dayOfWeek}</span>
                      <span className="text-slate-400">{r.departureTime}</span>
                      <span className={`font-semibold ${r.delay > 0 ? 'text-red-400' : 'text-emerald-400'}`}>+{r.delay} min</span>
                      <span><ConfidenceBar value={r.confidence} size="sm" /></span>
                      <span><RiskBadge risk={risk} delay={r.delay} /></span>
                    </div>
                    <span className="text-slate-500">
                      {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </span>
                  </div>

                  {/* Expanded detail */}
                  {isExpanded && (
                    <div className="bg-[#0f172a]/50 border-b border-[#334155] px-4 py-5">
                      {/* ETA completo */}
                      {lastArrival && (
                        <div className="bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border border-emerald-500/20 rounded-2xl p-4 mb-4">
                          <p className="text-sm text-slate-400 mb-1">Arrivo previsto (ETA completo)</p>
                          <p className="text-2xl font-bold text-white">{formatDateTime(lastArrival)}</p>
                          {r.delay > 0 && (
                            <p className="text-sm text-slate-400 mt-1">
                              Ritardo meteo: <span className="text-red-400 font-semibold">+{r.delay} min</span>
                            </p>
                          )}
                        </div>
                      )}

                      {/* Stats */}
                      <div className="grid grid-cols-3 gap-3 mb-4">
                        <div className="bg-[#334155] rounded-xl p-3">
                          <p className="text-xs text-slate-400">Distanza</p>
                          <p className="text-lg font-bold text-white">{Math.round(totalDistanceKm)} km</p>
                        </div>
                        <div className="bg-[#334155] rounded-xl p-3">
                          <p className="text-xs text-slate-400">Confidenza</p>
                          <p className="text-lg font-bold text-white">{Math.round(r.confidence)}%</p>
                          <p className="text-xs text-slate-500">{confidenceLevelIT[r.confidenceLevel] || r.confidenceLevel}</p>
                        </div>
                        <div className="bg-[#334155] rounded-xl p-3">
                          <p className="text-xs text-slate-400">Segmenti</p>
                          <p className="text-lg font-bold text-white">{pred.segments.length}</p>
                        </div>
                      </div>

                      {/* Segments table */}
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
                            {pred.segments.map((seg) => (
                              <tr key={seg.index} className="border-b border-[#334155]">
                                <td className="py-2 px-3 text-slate-400">{seg.index + 1}</td>
                                <td className="py-2 px-3 text-white">{seg.length_km.toFixed(1)} km</td>
                                <td className="py-2 px-3 text-slate-400">{roadTypeIT[seg.factors.road_type as string] || seg.factors.road_type || '—'}</td>
                                <td className="py-2 px-3 text-slate-400">{Math.round(seg.factors.altitude_m)} m</td>
                                <td className="py-2 px-3">
                                  {seg.weather.length > 0 ? seg.weather.map((w, i) => (
                                    <span key={i} className="inline-flex items-center gap-1 mr-2">
                                      <span>{weatherEmoji[w.type] || '\u2600\uFE0F'}</span>
                                      <span className={`text-xs ${getWeatherColor(w.severity)}`}>
                                        {(weatherTypeIT[w.type] || w.type) + ' ' + (severityIT[w.severity] || w.severity)}
                                      </span>
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
                                <td className="py-2 px-3 text-slate-400 text-xs">
                                  {new Date(seg.estimated_arrival).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Header labels */}
          <div className="flex items-center gap-4 px-4 py-2 text-xs text-slate-500 border-t border-[#334155] mt-0">
            <span>Clicca su una rotta per vedere i dettagli completi</span>
          </div>
        </div>
      )}
      <CreditConfirmModal
        open={showCreditModal}
        creditsRemaining={creditsRemaining}
        dailyLimit={dailyLimit}
        extraCredits={extraCredits}
        cost={pendingCost}
        onConfirm={() => setShowCreditModal(false)}
        onCancel={() => setShowCreditModal(false)}
        onUpgrade={() => { setShowCreditModal(false); navigate('/settings/plan') }}
        onBuyExtra={() => { setShowCreditModal(false); navigate('/settings/plan') }}
      />
    </div>
  )
}
