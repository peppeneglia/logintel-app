import { useState, useEffect, useCallback } from 'react'
import { BarChart3 } from 'lucide-react'
import { mockETAAccuracy } from '../../../data/mockDeliveryData'
import { useAuthStore } from '../../../stores/authStore'
import { useCredits } from '../../../hooks/useCredits'
import { CREDIT_COSTS } from '../../../lib/creditCosts'
import { getDeliveries } from '../../../services/delivery'
import type { DeliveryRow } from '../../../services/delivery'

// ── Display type ──

interface DisplayAccuracy {
  route: string
  totalPredictions: number
  avgErrorMinutes: number
  accuracyPercent: number
  within5min: number
  within15min: number
}

function computeAccuracyFromDeliveries(rows: DeliveryRow[]): DisplayAccuracy[] {
  const routeMap = new Map<string, { delays: number[]; count: number }>()

  for (const d of rows) {
    if (!d.actual_delivery_date) continue
    const route = `${d.origin} \u2192 ${d.destination}`
    const scheduled = new Date(d.scheduled_delivery_date).getTime()
    const actual = new Date(d.actual_delivery_date).getTime()
    const diffMinutes = Math.abs(actual - scheduled) / 60000

    if (!routeMap.has(route)) {
      routeMap.set(route, { delays: [], count: 0 })
    }
    const entry = routeMap.get(route)!
    entry.delays.push(diffMinutes)
    entry.count++
  }

  const results: DisplayAccuracy[] = []
  for (const [route, { delays, count }] of routeMap) {
    const avgError = delays.reduce((s, d) => s + d, 0) / count
    const w5 = Math.round((delays.filter((d) => d <= 5).length / count) * 100)
    const w15 = Math.round((delays.filter((d) => d <= 15).length / count) * 100)
    const accuracy = Math.round((delays.filter((d) => d <= 10).length / count) * 100)

    results.push({
      route,
      totalPredictions: count,
      avgErrorMinutes: Number(avgError.toFixed(1)),
      accuracyPercent: accuracy,
      within5min: w5,
      within15min: w15,
    })
  }

  return results.sort((a, b) => b.totalPredictions - a.totalPredictions)
}

// ── Main component ──

export function ETAAccuracy() {
  const isDemo = useAuthStore((s) => s.isDemo)
  const userId = useAuthStore((s) => s.user?.id)
  const { consume } = useCredits()

  const [supabaseData, setSupabaseData] = useState<DisplayAccuracy[]>([])
  const [loading, setLoading] = useState(false)

  const fetchData = useCallback(async () => {
    if (isDemo || !userId) return
    setLoading(true)
    try {
      const rows = await getDeliveries(userId)
      setSupabaseData(computeAccuracyFromDeliveries(rows))
      await consume(CREDIT_COSTS.DELIVERY_ETA_LOAD, 'DELIVERY_ETA_LOAD')
    } finally {
      setLoading(false)
    }
  }, [isDemo, userId])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const data: DisplayAccuracy[] = isDemo ? mockETAAccuracy : supabaseData

  // ── KPI ──

  const totalPredictions = data.reduce((sum, r) => sum + r.totalPredictions, 0)
  const weightedError = data.reduce((sum, r) => sum + r.avgErrorMinutes * r.totalPredictions, 0)
  const avgError = totalPredictions > 0 ? (weightedError / totalPredictions).toFixed(1) : '0'

  const weightedAccuracy = data.reduce((sum, r) => sum + r.accuracyPercent * r.totalPredictions, 0)
  const avgAccuracy = totalPredictions > 0 ? Math.round(weightedAccuracy / totalPredictions) : 0

  const weightedW5 = data.reduce((sum, r) => sum + r.within5min * r.totalPredictions, 0)
  const avgW5 = totalPredictions > 0 ? Math.round(weightedW5 / totalPredictions) : 0

  const weightedW15 = data.reduce((sum, r) => sum + r.within15min * r.totalPredictions, 0)
  const avgW15 = totalPredictions > 0 ? Math.round(weightedW15 / totalPredictions) : 0

  const summaryCards = [
    { label: 'Media errore', value: `${avgError} min`, color: 'text-amber-400' },
    { label: 'Accuracy', value: `${avgAccuracy}%`, color: 'text-emerald-400' },
    { label: 'Entro 5 min', value: `${avgW5}%`, color: 'text-white' },
    { label: 'Entro 15 min', value: `${avgW15}%`, color: 'text-white' },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-400 to-cyan-500 bg-clip-text text-transparent mb-3">
        ETA Accuracy
      </h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
        {summaryCards.map((card) => (
          <div key={card.label} className="bg-[#1e293b] rounded-2xl border border-[#334155] p-4">
            <p className="text-xs text-slate-400">{card.label}</p>
            <p className={`text-lg font-bold ${card.color}`}>{card.value}</p>
          </div>
        ))}
      </div>

      {/* Per-route table */}
      <div className="bg-[#1e293b] rounded-2xl border border-[#334155] p-6">
        <h2 className="text-sm font-semibold text-slate-300 mb-4">Accuracy per rotta</h2>

        {loading ? (
          <p className="text-sm text-slate-500 py-8 text-center">Caricamento...</p>
        ) : data.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-14 h-14 rounded-2xl bg-slate-800 flex items-center justify-center mb-4">
              <BarChart3 size={28} className="text-slate-600" />
            </div>
            <p className="text-white font-semibold mb-1">Nessun dato disponibile</p>
            <p className="text-sm text-slate-500 max-w-xs">
              I dati di accuracy verranno calcolati dalle consegne con data effettiva registrata.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#334155]">
                  <th className="text-left py-3 px-3 font-medium text-slate-400">Rotta</th>
                  <th className="text-left py-3 px-3 font-medium text-slate-400">Predizioni</th>
                  <th className="text-left py-3 px-3 font-medium text-slate-400">Errore medio</th>
                  <th className="text-left py-3 px-3 font-medium text-slate-400">Accuracy</th>
                  <th className="text-left py-3 px-3 font-medium text-slate-400">Entro 5 min</th>
                  <th className="text-left py-3 px-3 font-medium text-slate-400">Entro 15 min</th>
                </tr>
              </thead>
              <tbody>
                {data.map((r) => (
                  <tr key={r.route} className="border-b border-[#334155]">
                    <td className="py-3 px-3 text-white font-medium">{r.route}</td>
                    <td className="py-3 px-3 text-slate-300">{r.totalPredictions}</td>
                    <td className="py-3 px-3">
                      <span className={`font-semibold ${r.avgErrorMinutes <= 5 ? 'text-emerald-400' : r.avgErrorMinutes <= 10 ? 'text-amber-400' : 'text-red-400'}`}>
                        {r.avgErrorMinutes} min
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span className={`font-semibold ${r.accuracyPercent >= 85 ? 'text-emerald-400' : r.accuracyPercent >= 70 ? 'text-amber-400' : 'text-red-400'}`}>
                        {r.accuracyPercent}%
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-300">{r.within5min}%</td>
                    <td className="py-3 px-3 text-slate-300">{r.within15min}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
