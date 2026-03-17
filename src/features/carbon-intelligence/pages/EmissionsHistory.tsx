import { useState, useEffect, useCallback } from 'react'
import { BarChart3 } from 'lucide-react'
import { useAuthStore } from '../../../stores/authStore'
import { useCredits } from '../../../hooks/useCredits'
import { CREDIT_COSTS } from '../../../lib/creditCosts'
import { mockEmissionsHistory } from '../../../data/mockCarbonData'
import { getEmissionsRecords } from '../../../services/carbon'
import type { EmissionsRecordRow } from '../../../services/carbon'
import type { EmissionsMonthly } from '../../../data/mockCarbonData'

// ── Constants ──

const MONTHLY_TARGET_TONS = 50

// ── Aggregate records by month ──

function aggregateByMonth(records: EmissionsRecordRow[]): EmissionsMonthly[] {
  const map = new Map<string, number>()
  for (const r of records) {
    const ym = r.date.slice(0, 7) // YYYY-MM
    map.set(ym, (map.get(ym) || 0) + r.co2_kg)
  }
  const months: EmissionsMonthly[] = []
  const sorted = [...map.entries()].sort((a, b) => a[0].localeCompare(b[0]))
  const monthNames = ['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu', 'Lug', 'Ago', 'Set', 'Ott', 'Nov', 'Dic']
  for (const [ym, co2Kg] of sorted) {
    const [year, monthNum] = ym.split('-')
    const label = `${monthNames[parseInt(monthNum, 10) - 1]} ${year}`
    months.push({
      month: label,
      co2Tons: Math.round((co2Kg / 1000) * 10) / 10,
      target: MONTHLY_TARGET_TONS,
    })
  }
  return months
}

// ── Main component ──

export function EmissionsHistory() {
  const isDemo = useAuthStore((s) => s.isDemo)
  const userId = useAuthStore((s) => s.user?.id)
  const { consume } = useCredits()

  const [supabaseData, setSupabaseData] = useState<EmissionsRecordRow[]>([])
  const [loading, setLoading] = useState(false)

  const fetchData = useCallback(async () => {
    if (isDemo || !userId) return
    setLoading(true)
    try {
      const rows = await getEmissionsRecords(userId)
      setSupabaseData(rows)
      await consume(CREDIT_COSTS.CARBON_EMISSIONS_LOAD, 'CARBON_EMISSIONS_LOAD')
    } finally {
      setLoading(false)
    }
  }, [isDemo, userId])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const data: EmissionsMonthly[] = isDemo
    ? mockEmissionsHistory
    : aggregateByMonth(supabaseData)

  return (
    <div>
      <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-400 to-cyan-500 bg-clip-text text-transparent mb-3">
        Storico Emissioni
      </h1>

      <div className="bg-[#1e293b] rounded-2xl border border-[#334155] p-6">
        {loading ? (
          <p className="text-sm text-slate-500 py-8 text-center">Caricamento...</p>
        ) : data.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-14 h-14 rounded-2xl bg-slate-800 flex items-center justify-center mb-4">
              <BarChart3 size={28} className="text-slate-600" />
            </div>
            <p className="text-white font-semibold mb-1">Nessuno storico emissioni</p>
            <p className="text-sm text-slate-500 max-w-xs">
              Lo storico viene calcolato automaticamente dalle registrazioni in Emissioni per Rotta.
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#334155]">
                    <th className="text-left py-3 px-3 font-medium text-slate-400">Mese</th>
                    <th className="text-right py-3 px-3 font-medium text-slate-400">CO2 (ton)</th>
                    <th className="text-right py-3 px-3 font-medium text-slate-400">Target (ton)</th>
                    <th className="text-right py-3 px-3 font-medium text-slate-400">Delta (ton)</th>
                    <th className="text-center py-3 px-3 font-medium text-slate-400">Stato</th>
                    <th className="text-left py-3 px-3 font-medium text-slate-400">Indicatore</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((entry) => {
                    const delta = entry.co2Tons - entry.target
                    const isAbove = delta > 0
                    const maxVal = Math.max(...data.map((e) => Math.max(e.co2Tons, e.target)))

                    return (
                      <tr key={entry.month} className="border-b border-[#334155] last:border-b-0">
                        <td className="py-3 px-3 text-white font-medium">{entry.month}</td>
                        <td className="py-3 px-3 text-slate-300 text-right">{entry.co2Tons.toFixed(1)}</td>
                        <td className="py-3 px-3 text-slate-300 text-right">{entry.target.toFixed(1)}</td>
                        <td className="py-3 px-3 text-right">
                          <span className={isAbove ? 'text-red-400 font-medium' : 'text-emerald-400 font-medium'}>
                            {isAbove ? '+' : ''}{delta.toFixed(1)}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            isAbove ? 'bg-red-500/10 text-red-400' : 'bg-emerald-500/10 text-emerald-400'
                          }`}>
                            {isAbove ? 'Sopra target' : 'Sotto target'}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-2 bg-[#334155] rounded-full overflow-hidden min-w-[100px]">
                              <div
                                className={`h-full rounded-full ${isAbove ? 'bg-red-500/70' : 'bg-emerald-500/70'}`}
                                style={{ width: `${(entry.co2Tons / maxVal) * 100}%` }}
                              />
                            </div>
                            <div
                              className="w-0.5 h-4 bg-slate-400"
                              title={`Target: ${entry.target} ton`}
                              style={{ marginLeft: `calc(${(entry.target / maxVal) * 100}% - ${(entry.co2Tons / maxVal) * 100}% - 4px)` }}
                            />
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Summary */}
            <div className="mt-6 pt-4 border-t border-[#334155]">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-slate-400 mb-1">Media emissioni</p>
                  <p className="text-lg font-semibold text-white">
                    {(data.reduce((s, e) => s + e.co2Tons, 0) / data.length).toFixed(1)} ton/mese
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">Mesi sotto target</p>
                  <p className="text-lg font-semibold text-emerald-400">
                    {data.filter((e) => e.co2Tons <= e.target).length} / {data.length}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">Trend ultimi mesi</p>
                  <p className={`text-lg font-semibold ${
                    data.length >= 2 && data[0].co2Tons > data[data.length - 1].co2Tons
                      ? 'text-emerald-400'
                      : data.length >= 2
                        ? 'text-red-400'
                        : 'text-slate-400'
                  }`}>
                    {data.length >= 2
                      ? `${data[0].co2Tons > data[data.length - 1].co2Tons ? '-' : '+'}${Math.abs(data[0].co2Tons - data[data.length - 1].co2Tons).toFixed(1)} ton`
                      : '\u2014'}
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
