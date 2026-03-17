import { useState, useEffect, useCallback } from 'react'
import { Truck } from 'lucide-react'
import { useAuthStore } from '../../../stores/authStore'
import { useCredits } from '../../../hooks/useCredits'
import { CREDIT_COSTS } from '../../../lib/creditCosts'
import { mockVehicleEmissions } from '../../../data/mockCarbonData'
import { getEmissionsRecords, carbonScore } from '../../../services/carbon'
import type { EmissionsRecordRow } from '../../../services/carbon'

// ── Badge helpers ──

function euroClassBadge(euroClass: string) {
  if (euroClass.includes('6')) return 'bg-emerald-500/10 text-emerald-400'
  if (euroClass.includes('5')) return 'bg-amber-500/10 text-amber-400'
  return 'bg-red-500/10 text-red-400'
}

function scoreBadge(score: 'A' | 'B' | 'C' | 'D') {
  const styles: Record<string, string> = {
    A: 'bg-emerald-500/10 text-emerald-400',
    B: 'bg-emerald-500/10 text-emerald-300',
    C: 'bg-amber-500/10 text-amber-400',
    D: 'bg-red-500/10 text-red-400',
  }
  return styles[score] || styles.D
}

// ── Unified display type ──

interface DisplayVehicle {
  vehicleId: string
  plate: string
  model: string
  euroClass: string
  totalCo2Kg: number
  avgCo2PerKm: number
  trips: number
  totalKm: number
  score: 'A' | 'B' | 'C' | 'D'
}

function mockToDisplay(v: (typeof mockVehicleEmissions)[number]): DisplayVehicle {
  return {
    vehicleId: v.vehiclePlate,
    plate: v.vehiclePlate,
    model: v.model,
    euroClass: v.euroClass,
    totalCo2Kg: v.totalCo2Kg,
    avgCo2PerKm: v.avgCo2PerKm,
    trips: v.trips,
    totalKm: v.totalKm,
    score: carbonScore(v.avgCo2PerKm * 1000),
  }
}

function aggregateByVehicle(records: EmissionsRecordRow[]): DisplayVehicle[] {
  const map = new Map<string, { totalKm: number; totalCo2: number; trips: number; euroClass: string }>()
  for (const r of records) {
    const key = r.vehicle_id || r.route
    const existing = map.get(key)
    if (existing) {
      existing.totalKm += r.km
      existing.totalCo2 += r.co2_kg
      existing.trips += 1
      existing.euroClass = r.euro_class
    } else {
      map.set(key, { totalKm: r.km, totalCo2: r.co2_kg, trips: 1, euroClass: r.euro_class })
    }
  }
  const result: DisplayVehicle[] = []
  map.forEach((val, key) => {
    const avgCo2PerKm = val.totalKm > 0 ? val.totalCo2 / val.totalKm : 0
    result.push({
      vehicleId: key,
      plate: key,
      model: '\u2014',
      euroClass: val.euroClass,
      totalCo2Kg: Math.round(val.totalCo2 * 100) / 100,
      avgCo2PerKm: Math.round(avgCo2PerKm * 100) / 100,
      trips: val.trips,
      totalKm: val.totalKm,
      score: carbonScore(avgCo2PerKm * 1000),
    })
  })
  return result.sort((a, b) => b.totalCo2Kg - a.totalCo2Kg)
}

// ── Main component ──

export function VehicleEmissions() {
  const isDemo = useAuthStore((s) => s.isDemo)
  const userId = useAuthStore((s) => s.user?.id)
  const { consume } = useCredits()

  const [supabaseData, setSupabaseData] = useState<EmissionsRecordRow[]>([])
  const [loading] = useState(false)

  const fetchData = useCallback(async () => {
    if (isDemo || !userId) return
    try {
      const rows = await getEmissionsRecords(userId)
      setSupabaseData(rows)
      consume(CREDIT_COSTS.CARBON_EMISSIONS_LOAD, 'CARBON_EMISSIONS_LOAD')
    } catch {
      // silently fail on background refresh
    }
  }, [isDemo, userId])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const vehicles: DisplayVehicle[] = isDemo
    ? mockVehicleEmissions.map(mockToDisplay)
    : aggregateByVehicle(supabaseData)

  return (
    <div>
      <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-400 to-cyan-500 bg-clip-text text-transparent mb-3">
        Emissioni per Veicolo
      </h1>

      <div className="bg-[#1e293b] rounded-2xl border border-[#334155] p-6">
        {loading ? (
          <p className="text-sm text-slate-500 py-8 text-center">Caricamento...</p>
        ) : vehicles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-14 h-14 rounded-2xl bg-slate-800 flex items-center justify-center mb-4">
              <Truck size={28} className="text-slate-600" />
            </div>
            <p className="text-white font-semibold mb-1">Nessun dato veicoli</p>
            <p className="text-sm text-slate-500 max-w-xs">
              I dati emissioni per veicolo vengono calcolati dalle registrazioni in Emissioni per Rotta.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#334155]">
                  <th className="text-left py-3 px-3 font-medium text-slate-400">Targa</th>
                  <th className="text-left py-3 px-3 font-medium text-slate-400">Modello</th>
                  <th className="text-left py-3 px-3 font-medium text-slate-400">Classe Euro</th>
                  <th className="text-right py-3 px-3 font-medium text-slate-400">CO2 totale (kg)</th>
                  <th className="text-right py-3 px-3 font-medium text-slate-400">CO2/km medio</th>
                  <th className="text-right py-3 px-3 font-medium text-slate-400">Viaggi</th>
                  <th className="text-right py-3 px-3 font-medium text-slate-400">Km totali</th>
                  <th className="text-center py-3 px-3 font-medium text-slate-400">Score</th>
                </tr>
              </thead>
              <tbody>
                {vehicles.map((v) => (
                  <tr key={v.vehicleId} className="border-b border-[#334155] last:border-b-0">
                    <td className="py-3 px-3 text-white font-medium">{v.plate}</td>
                    <td className="py-3 px-3 text-slate-300">{v.model}</td>
                    <td className="py-3 px-3">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${euroClassBadge(v.euroClass)}`}>
                        {v.euroClass}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-300 text-right">{v.totalCo2Kg.toLocaleString('it-IT')}</td>
                    <td className="py-3 px-3 text-slate-300 text-right">{v.avgCo2PerKm.toFixed(2)}</td>
                    <td className="py-3 px-3 text-slate-300 text-right">{v.trips}</td>
                    <td className="py-3 px-3 text-slate-300 text-right">{v.totalKm.toLocaleString('it-IT')}</td>
                    <td className="py-3 px-3 text-center">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${scoreBadge(v.score)}`}>
                        {v.score}
                      </span>
                    </td>
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
