import { useState, useEffect, useCallback } from 'react'
import { useAuthStore } from '../../../stores/authStore'
import { useCredits } from '../../../hooks/useCredits'
import { CREDIT_COSTS } from '../../../lib/creditCosts'
import { getOperationalCosts } from '../../../services/fleet'
import type { OperationalCostRow } from '../../../services/fleet'
import { mockCostPerKm } from '../../../data/mockFinanceData'

function euro(value: number): string {
  return value.toLocaleString('it-IT', { style: 'currency', currency: 'EUR' })
}

/** Map old mock shape to a normalised row for display */
interface CostDisplayRow {
  id: string
  vehicle: string
  period: string
  fuel: number
  tolls: number
  maintenance: number
  insurance: number
  total: number
  costPerKm: number
}

function mapMockToDisplay(m: (typeof mockCostPerKm)[number]): CostDisplayRow {
  return {
    id: m.id,
    vehicle: m.veicolo,
    period: m.periodo,
    fuel: m.carburante,
    tolls: m.pedaggi,
    maintenance: m.manutenzione,
    insurance: m.assicurazione,
    total: m.totale,
    costPerKm: m.costoPerKm,
  }
}

function mapSupabaseToDisplay(r: OperationalCostRow): CostDisplayRow {
  const total = r.fuel_cost + r.maintenance_cost + r.toll_cost + r.driver_cost
  const costPerKm = r.total_km > 0 ? total / r.total_km : 0
  const monthNames = ['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu', 'Lug', 'Ago', 'Set', 'Ott', 'Nov', 'Dic']
  return {
    id: r.id,
    vehicle: r.vehicle_id,
    period: `${monthNames[r.month - 1]} ${r.year}`,
    fuel: r.fuel_cost,
    tolls: r.toll_cost,
    maintenance: r.maintenance_cost,
    insurance: r.driver_cost,
    total,
    costPerKm,
  }
}

export function CostAnalysis() {
  const { isDemo, user } = useAuthStore()
  const userId = user?.id ?? null
  const { consume } = useCredits()

  const [supabaseData, setSupabaseData] = useState<OperationalCostRow[]>([])

  const fetchData = useCallback(async () => {
    if (isDemo || !userId) return
    const rows = await getOperationalCosts(userId)
    setSupabaseData(rows)
    await consume(CREDIT_COSTS.FINANCE_COSTS_LOAD, 'FINANCE_COSTS_LOAD')
  }, [isDemo, userId])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const displayRows: CostDisplayRow[] = isDemo
    ? mockCostPerKm.map(mapMockToDisplay)
    : supabaseData.map(mapSupabaseToDisplay)

  // KPI totals
  const avgCostPerKm = displayRows.length
    ? displayRows.reduce((sum, r) => sum + r.costPerKm, 0) / displayRows.length
    : 0
  const totalCosts = displayRows.reduce((sum, r) => sum + r.total, 0)
  const totalFuel = displayRows.reduce((sum, r) => sum + r.fuel, 0)

  return (
    <div>
      <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-400 to-cyan-500 bg-clip-text text-transparent mb-3">
        Costi per Km
      </h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
        <div className="bg-[#1e293b] rounded-2xl border border-[#334155] p-4">
          <p className="text-xs text-slate-400">Costo medio / km</p>
          <p className="text-xl font-bold text-primary-400">{euro(avgCostPerKm)}</p>
        </div>
        <div className="bg-[#1e293b] rounded-2xl border border-[#334155] p-4">
          <p className="text-xs text-slate-400">Costi totali flotta</p>
          <p className="text-xl font-bold text-white">{euro(totalCosts)}</p>
        </div>
        <div className="bg-[#1e293b] rounded-2xl border border-[#334155] p-4">
          <p className="text-xs text-slate-400">Carburante totale</p>
          <p className="text-xl font-bold text-amber-400">{euro(totalFuel)}</p>
        </div>
      </div>

      {/* Info banner for real mode */}
      {!isDemo && (
        <div className="bg-[#1e293b] rounded-2xl border border-[#334155] p-4 mb-3">
          <p className="text-sm text-slate-400">
            I dati di questa pagina provengono dai <span className="text-primary-400 font-medium">Costi Operativi</span> della sezione Fleet Intelligence.
          </p>
        </div>
      )}

      {/* Table */}
      <div className="bg-[#1e293b] rounded-2xl border border-[#334155] p-6">
        <h2 className="text-sm font-semibold text-slate-300 mb-4">Dettaglio costi per veicolo</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#334155]">
                <th className="text-left py-3 px-3 font-medium text-slate-400">Veicolo</th>
                <th className="text-left py-3 px-3 font-medium text-slate-400">Periodo</th>
                <th className="text-right py-3 px-3 font-medium text-slate-400">Carburante</th>
                <th className="text-right py-3 px-3 font-medium text-slate-400">Pedaggi</th>
                <th className="text-right py-3 px-3 font-medium text-slate-400">Manutenzione</th>
                <th className="text-right py-3 px-3 font-medium text-slate-400">Autista</th>
                <th className="text-right py-3 px-3 font-medium text-slate-400">Totale</th>
                <th className="text-right py-3 px-3 font-medium text-slate-400">/km</th>
              </tr>
            </thead>
            <tbody>
              {displayRows.length > 0 ? (
                displayRows.map((r) => (
                  <tr key={r.id} className="border-b border-[#334155]">
                    <td className="py-3 px-3 text-white font-medium">{r.vehicle}</td>
                    <td className="py-3 px-3 text-slate-400">{r.period}</td>
                    <td className="py-3 px-3 text-slate-300 text-right">{euro(r.fuel)}</td>
                    <td className="py-3 px-3 text-slate-300 text-right">{euro(r.tolls)}</td>
                    <td className="py-3 px-3 text-slate-300 text-right">{euro(r.maintenance)}</td>
                    <td className="py-3 px-3 text-slate-300 text-right">{euro(r.insurance)}</td>
                    <td className="py-3 px-3 text-white text-right font-medium">{euro(r.total)}</td>
                    <td className="py-3 px-3 text-right">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${
                        r.costPerKm <= 1.35 ? 'bg-emerald-500/10 text-emerald-400' :
                        r.costPerKm <= 1.50 ? 'bg-amber-500/10 text-amber-400' :
                        'bg-red-500/10 text-red-400'
                      }`}>
                        {euro(r.costPerKm)}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-sm text-slate-500">
                    {isDemo
                      ? 'Nessun dato disponibile.'
                      : 'Nessun costo operativo registrato. Inserisci i dati nella sezione Fleet Intelligence → Costi Operativi.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
