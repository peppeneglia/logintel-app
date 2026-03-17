import { useState, useEffect, useCallback } from 'react'
import { FileBarChart } from 'lucide-react'
import { useAuthStore } from '../../../stores/authStore'
import { useCredits } from '../../../hooks/useCredits'
import { CREDIT_COSTS } from '../../../lib/creditCosts'
import { mockESGMetrics, mockEmissionsHistory } from '../../../data/mockCarbonData'
import type { ESGMetrics, EmissionsMonthly } from '../../../data/mockCarbonData'
import { getEmissionsRecords } from '../../../services/carbon'
import type { EmissionsRecordRow } from '../../../services/carbon'

// ── Constants ──

const ANNUAL_TARGET_TONS = 600
const MONTHLY_TARGET_TONS = 50

// ── Compute ESG metrics from records ──

function computeMetrics(records: EmissionsRecordRow[]): ESGMetrics {
  if (records.length === 0) {
    return { totalEmissionsTons: 0, reductionPercent: 0, targetTons: ANNUAL_TARGET_TONS, fleetEfficiency: 0, greenTripsPercent: 0 }
  }
  const totalCo2Kg = records.reduce((s, r) => s + r.co2_kg, 0)
  const totalKm = records.reduce((s, r) => s + r.km, 0)
  const avgCo2PerKm = totalKm > 0 ? totalCo2Kg / totalKm : 0
  const greenTrips = records.filter((r) => r.km > 0 && (r.co2_kg / r.km) * 1000 < 700).length
  const greenPercent = Math.round((greenTrips / records.length) * 100)

  return {
    totalEmissionsTons: Math.round((totalCo2Kg / 1000) * 10) / 10,
    reductionPercent: 0, // Would need prior year data
    targetTons: ANNUAL_TARGET_TONS,
    fleetEfficiency: Math.round(avgCo2PerKm * 100) / 100,
    greenTripsPercent: greenPercent,
  }
}

// ── Aggregate records by month ──

function aggregateHistory(records: EmissionsRecordRow[]): EmissionsMonthly[] {
  const map = new Map<string, number>()
  for (const r of records) {
    const ym = r.date.slice(0, 7)
    map.set(ym, (map.get(ym) || 0) + r.co2_kg)
  }
  const sorted = [...map.entries()].sort((a, b) => a[0].localeCompare(b[0]))
  const monthNames = ['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu', 'Lug', 'Ago', 'Set', 'Ott', 'Nov', 'Dic']
  return sorted.map(([ym, co2Kg]) => {
    const [year, monthNum] = ym.split('-')
    return {
      month: `${monthNames[parseInt(monthNum, 10) - 1]} ${year}`,
      co2Tons: Math.round((co2Kg / 1000) * 10) / 10,
      target: MONTHLY_TARGET_TONS,
    }
  })
}

// ── Empty metrics fallback ──

const emptyMetrics: ESGMetrics = {
  totalEmissionsTons: 0,
  reductionPercent: 0,
  targetTons: 0,
  fleetEfficiency: 0,
  greenTripsPercent: 0,
}

// ── Main component ──

export function ESGReport() {
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
      await consume(CREDIT_COSTS.CARBON_ESG_LOAD, 'CARBON_ESG_LOAD')
    } finally {
      setLoading(false)
    }
  }, [isDemo, userId])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const metrics: ESGMetrics = isDemo
    ? mockESGMetrics
    : supabaseData.length > 0
      ? computeMetrics(supabaseData)
      : emptyMetrics

  const historyData: EmissionsMonthly[] = isDemo
    ? mockEmissionsHistory
    : aggregateHistory(supabaseData)

  const currentVsTarget = metrics.targetTons > 0
    ? ((metrics.totalEmissionsTons / metrics.targetTons) * 100).toFixed(1)
    : '0.0'

  const maxTons = historyData.length > 0
    ? Math.max(...historyData.map((m) => Math.max(m.co2Tons, m.target)))
    : 1

  const isEmpty = !isDemo && supabaseData.length === 0

  return (
    <div>
      <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-400 to-cyan-500 bg-clip-text text-transparent mb-3">
        Report ESG
      </h1>

      {loading ? (
        <div className="bg-[#1e293b] rounded-2xl border border-[#334155] p-6">
          <p className="text-sm text-slate-500 py-8 text-center">Caricamento...</p>
        </div>
      ) : isEmpty ? (
        <div className="bg-[#1e293b] rounded-2xl border border-[#334155] p-6">
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-14 h-14 rounded-2xl bg-slate-800 flex items-center justify-center mb-4">
              <FileBarChart size={28} className="text-slate-600" />
            </div>
            <p className="text-white font-semibold mb-1">Nessun dato per il report ESG</p>
            <p className="text-sm text-slate-500 max-w-xs">
              Il report viene generato automaticamente dalle registrazioni in Emissioni per Rotta.
            </p>
          </div>
        </div>
      ) : (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-3">
            <div className="bg-[#1e293b] rounded-2xl border border-[#334155] p-4">
              <p className="text-xs text-slate-400">Emissioni totali</p>
              <p className="text-xl font-bold text-white">{metrics.totalEmissionsTons} <span className="text-lg text-slate-400">ton</span></p>
            </div>
            <div className="bg-[#1e293b] rounded-2xl border border-[#334155] p-4">
              <p className="text-xs text-slate-400">Riduzione YoY</p>
              <p className="text-xl font-bold text-emerald-400">-{metrics.reductionPercent}%</p>
            </div>
            <div className="bg-[#1e293b] rounded-2xl border border-[#334155] p-4">
              <p className="text-xs text-slate-400">Target annuale</p>
              <p className="text-xl font-bold text-white">{metrics.targetTons} <span className="text-lg text-slate-400">ton</span></p>
            </div>
            <div className="bg-[#1e293b] rounded-2xl border border-[#334155] p-4">
              <p className="text-xs text-slate-400">Efficienza flotta</p>
              <p className="text-xl font-bold text-white">{metrics.fleetEfficiency} <span className="text-lg text-slate-400">kg/km</span></p>
            </div>
            <div className="bg-[#1e293b] rounded-2xl border border-[#334155] p-4">
              <p className="text-xs text-slate-400">Viaggi green</p>
              <p className="text-xl font-bold text-emerald-400">{metrics.greenTripsPercent}%</p>
            </div>
          </div>

          {/* Progress bar toward target */}
          <div className="bg-[#1e293b] rounded-2xl border border-[#334155] p-6 mb-3">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-semibold text-white">Progresso verso target</h2>
              <span className="text-sm text-slate-400">
                {metrics.totalEmissionsTons} / {metrics.targetTons} ton ({currentVsTarget}%)
              </span>
            </div>
            <div className="w-full bg-[#334155] rounded-full h-4 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  metrics.targetTons === 0 || metrics.totalEmissionsTons <= metrics.targetTons ? 'bg-emerald-500' : 'bg-amber-500'
                }`}
                style={{ width: `${metrics.targetTons > 0 ? Math.min(100, (metrics.totalEmissionsTons / metrics.targetTons) * 100) : 0}%` }}
              />
            </div>
            <div className="flex justify-between mt-2">
              <span className="text-xs text-slate-400">0 ton</span>
              <span className="text-xs text-slate-400">{metrics.targetTons} ton (target)</span>
            </div>
            {metrics.targetTons > 0 && metrics.totalEmissionsTons > metrics.targetTons ? (
              <p className="text-sm text-amber-400 mt-3">
                Superamento target di {(metrics.totalEmissionsTons - metrics.targetTons).toFixed(1)} tonnellate.
                Necessario ridurre di {(((metrics.totalEmissionsTons - metrics.targetTons) / metrics.totalEmissionsTons) * 100).toFixed(1)}% per rientrare.
              </p>
            ) : metrics.targetTons > 0 ? (
              <p className="text-sm text-emerald-400 mt-3">
                Sotto il target di {(metrics.targetTons - metrics.totalEmissionsTons).toFixed(1)} tonnellate. Ottimo lavoro!
              </p>
            ) : null}
          </div>

          {/* Monthly comparison chart */}
          <div className="bg-[#1e293b] rounded-2xl border border-[#334155] p-6">
            <h2 className="text-base font-semibold text-white mb-4">Confronto mensile emissioni vs target</h2>
            {historyData.length === 0 ? (
              <p className="text-slate-500 text-center py-6">Nessun dato disponibile.</p>
            ) : (
              <>
                <div className="space-y-4">
                  {historyData.map((entry) => {
                    const actualWidth = (entry.co2Tons / maxTons) * 100
                    const targetWidth = (entry.target / maxTons) * 100
                    const isAbove = entry.co2Tons > entry.target

                    return (
                      <div key={entry.month}>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-sm text-slate-300 w-24 shrink-0">{entry.month}</span>
                          <div className="flex items-center gap-3 text-xs">
                            <span className={isAbove ? 'text-red-400' : 'text-emerald-400'}>
                              {entry.co2Tons} ton
                            </span>
                            <span className="text-slate-500">target: {entry.target} ton</span>
                          </div>
                        </div>
                        <div className="relative">
                          <div
                            className="h-3 bg-slate-600 rounded-full"
                            style={{ width: `${targetWidth}%` }}
                          />
                          <div
                            className={`absolute top-0 h-3 rounded-full ${isAbove ? 'bg-red-500/70' : 'bg-emerald-500/70'}`}
                            style={{ width: `${actualWidth}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
                <div className="flex items-center gap-6 mt-4 pt-4 border-t border-[#334155]">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-emerald-500/70" />
                    <span className="text-xs text-slate-400">Emissioni (sotto target)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500/70" />
                    <span className="text-xs text-slate-400">Emissioni (sopra target)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-slate-600" />
                    <span className="text-xs text-slate-400">Target</span>
                  </div>
                </div>
              </>
            )}
          </div>
        </>
      )}
    </div>
  )
}
