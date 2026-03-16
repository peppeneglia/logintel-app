import { useState } from 'react'
import { mockWeeklyPlan } from '../../../data/mockData'
import { useAuthStore } from '../../../stores/authStore'
import { ConfidenceBar } from '../../../components/ConfidenceBar'
import { RiskBadge } from '../../../components/RiskBadge'
import { predictRoute } from '../../../services/api'

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

interface RouteInput {
  origin: string
  destination: string
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
}

export function WeeklyPlan() {
  const isDemo = useAuthStore((s) => s.isDemo)
  const [showResults, setShowResults] = useState(isDemo)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [apiResults, setApiResults] = useState<WeeklyResult[]>([])

  const [routes, setRoutes] = useState<RouteInput[]>([
    { origin: 'Milano', destination: 'Roma', day: 'Lunedi', time: '06:00' },
    { origin: 'Torino', destination: 'Napoli', day: 'Martedi', time: '05:30' },
    { origin: 'Bologna', destination: 'Bari', day: 'Mercoledi', time: '07:00' },
  ])

  const updateRoute = (idx: number, field: keyof RouteInput, value: string) => {
    setRoutes((prev) => prev.map((r, i) => i === idx ? { ...r, [field]: value } : r))
  }

  const handleGenerate = async () => {
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
      const results = await Promise.all(
        routes.map(async (r) => {
          const departureTime = getNextDateForDay(r.day, r.time)
          const pred = await predictRoute(r.origin, r.destination, departureTime, false)
          return {
            origin: r.origin,
            destination: r.destination,
            dayOfWeek: r.day,
            departureTime: r.time,
            delay: Math.round(pred.total_delay_minutes),
            confidence: pred.confidence.overall,
          }
        })
      )
      setApiResults(results)
      setShowResults(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore nella generazione del piano')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-400 to-cyan-500 bg-clip-text text-transparent mb-3">Piano Settimanale</h1>

      <div className="bg-[#1e293b] rounded-2xl border border-[#334155] p-6 mb-3">
        <h2 className="text-sm font-semibold text-slate-300 mb-4">Rotte da analizzare</h2>
        <div className="space-y-3 mb-4">
          {routes.map((route, idx) => (
            <div key={idx} className="grid grid-cols-4 gap-3">
              <input type="text" value={route.origin} onChange={(e) => updateRoute(idx, 'origin', e.target.value)} placeholder="Origine" className="px-3 py-2 bg-[#334155] border border-slate-600 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500/30" />
              <input type="text" value={route.destination} onChange={(e) => updateRoute(idx, 'destination', e.target.value)} placeholder="Destinazione" className="px-3 py-2 bg-[#334155] border border-slate-600 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500/30" />
              <input type="text" value={route.day} onChange={(e) => updateRoute(idx, 'day', e.target.value)} placeholder="Giorno" className="px-3 py-2 bg-[#334155] border border-slate-600 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500/30" />
              <input type="text" value={route.time} onChange={(e) => updateRoute(idx, 'time', e.target.value)} placeholder="Ora" className="px-3 py-2 bg-[#334155] border border-slate-600 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500/30" />
            </div>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setRoutes((prev) => [...prev, { origin: '', destination: '', day: '', time: '' }])}
            className="px-4 py-2 border border-slate-600 rounded-xl text-sm font-medium text-slate-300 hover:bg-[#334155] transition-colors"
          >
            Aggiungi rotta
          </button>
          <button
            onClick={handleGenerate}
            disabled={loading}
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
                  <th className="text-left py-3 px-3 font-medium text-slate-400 min-w-[140px]">Confidence</th>
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
                      <td className="py-3 px-3"><span className={`font-semibold ${delay < 10 ? 'text-emerald-400' : delay <= 30 ? 'text-amber-400' : 'text-red-400'}`}>+{delay} min</span></td>
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
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#334155]">
                  <th className="text-left py-3 px-3 font-medium text-slate-400">Rotta</th>
                  <th className="text-left py-3 px-3 font-medium text-slate-400">Giorno</th>
                  <th className="text-left py-3 px-3 font-medium text-slate-400">Partenza</th>
                  <th className="text-left py-3 px-3 font-medium text-slate-400">Ritardo Previsto</th>
                  <th className="text-left py-3 px-3 font-medium text-slate-400 min-w-[140px]">Confidence</th>
                  <th className="text-left py-3 px-3 font-medium text-slate-400">Rischio</th>
                </tr>
              </thead>
              <tbody>
                {apiResults.map((r, idx) => {
                  const risk = getRiskLevel(r.delay)
                  return (
                    <tr key={idx} className={`border-b border-[#334155] ${getRowBg(r.delay)}`}>
                      <td className="py-3 px-3 text-white font-medium">{r.origin} &rarr; {r.destination}</td>
                      <td className="py-3 px-3 text-slate-400">{r.dayOfWeek}</td>
                      <td className="py-3 px-3 text-slate-400">{r.departureTime}</td>
                      <td className="py-3 px-3"><span className={`font-semibold ${r.delay < 10 ? 'text-emerald-400' : r.delay <= 30 ? 'text-amber-400' : 'text-red-400'}`}>+{r.delay} min</span></td>
                      <td className="py-3 px-3"><ConfidenceBar value={r.confidence} size="sm" /></td>
                      <td className="py-3 px-3"><RiskBadge risk={risk} delay={r.delay} /></td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
