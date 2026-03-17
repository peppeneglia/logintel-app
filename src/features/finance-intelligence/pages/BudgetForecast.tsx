import { useState, useEffect, useCallback } from 'react'
import { useAuthStore } from '../../../stores/authStore'
import { useCredits } from '../../../hooks/useCredits'
import { CREDIT_COSTS } from '../../../lib/creditCosts'
import { getOperationalCosts } from '../../../services/fleet'
import type { OperationalCostRow } from '../../../services/fleet'
import { mockBudgetVsActual } from '../../../data/mockFinanceData'

function euro(value: number): string {
  return value.toLocaleString('it-IT', { style: 'currency', currency: 'EUR' })
}

interface BudgetDisplayRow {
  id: string
  month: string
  budget: number
  actual: number
  variance: number
  variancePct: number
}

function mapMockToDisplay(m: (typeof mockBudgetVsActual)[number]): BudgetDisplayRow {
  return {
    id: m.id,
    month: m.mese,
    budget: m.budget,
    actual: m.actual,
    variance: m.varianza,
    variancePct: m.varianzaPct,
  }
}

const MONTH_NAMES = ['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu', 'Lug', 'Ago', 'Set', 'Ott', 'Nov', 'Dic']

/** Default monthly budget target - in a real app this would be configurable */
const DEFAULT_MONTHLY_BUDGET = 195000

/** Build monthly aggregates from operational costs, comparing against a fixed budget target */
function aggregateMonthly(rows: OperationalCostRow[]): BudgetDisplayRow[] {
  const map = new Map<string, number>()

  for (const row of rows) {
    const key = `${row.year}-${String(row.month).padStart(2, '0')}`
    const total = row.fuel_cost + row.maintenance_cost + row.toll_cost + row.driver_cost
    map.set(key, (map.get(key) || 0) + total)
  }

  return Array.from(map.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([key, actual], idx) => {
      const [yearStr, monthStr] = key.split('-')
      const monthIdx = parseInt(monthStr, 10) - 1
      const label = `${MONTH_NAMES[monthIdx]} ${yearStr}`
      const budget = DEFAULT_MONTHLY_BUDGET
      const variance = actual - budget
      const variancePct = budget > 0 ? (variance / budget) * 100 : 0
      return {
        id: `agg-${idx}`,
        month: label,
        budget,
        actual,
        variance,
        variancePct,
      }
    })
}

export function BudgetForecast() {
  const { isDemo, user } = useAuthStore()
  const userId = user?.id ?? null
  const { consume } = useCredits()

  const [supabaseData, setSupabaseData] = useState<OperationalCostRow[]>([])

  const fetchData = useCallback(async () => {
    if (isDemo || !userId) return
    const rows = await getOperationalCosts(userId)
    setSupabaseData(rows)
    await consume(CREDIT_COSTS.FINANCE_BUDGET_LOAD, 'FINANCE_BUDGET_LOAD')
  }, [isDemo, userId])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const displayRows: BudgetDisplayRow[] = isDemo
    ? mockBudgetVsActual.map(mapMockToDisplay)
    : aggregateMonthly(supabaseData)

  // KPI totals
  const totalBudget = displayRows.reduce((sum, r) => sum + r.budget, 0)
  const totalActual = displayRows.reduce((sum, r) => sum + r.actual, 0)
  const overBudgetMonths = displayRows.filter((r) => r.variance > 0).length

  return (
    <div>
      <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-400 to-cyan-500 bg-clip-text text-transparent mb-3">
        Budget & Forecast
      </h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
        <div className="bg-[#1e293b] rounded-2xl border border-[#334155] p-4">
          <p className="text-xs text-slate-400">Budget totale periodo</p>
          <p className="text-xl font-bold text-white">{euro(totalBudget)}</p>
        </div>
        <div className="bg-[#1e293b] rounded-2xl border border-[#334155] p-4">
          <p className="text-xs text-slate-400">Spesa effettiva</p>
          <p className="text-xl font-bold text-primary-400">{euro(totalActual)}</p>
        </div>
        <div className="bg-[#1e293b] rounded-2xl border border-[#334155] p-4">
          <p className="text-xs text-slate-400">Mesi sopra budget</p>
          <p className="text-xl font-bold text-amber-400">{overBudgetMonths} / {displayRows.length}</p>
        </div>
      </div>

      {/* Info banner for real mode */}
      {!isDemo && (
        <div className="bg-[#1e293b] rounded-2xl border border-[#334155] p-4 mb-3">
          <p className="text-sm text-slate-400">
            I dati sono calcolati dai <span className="text-primary-400 font-medium">Costi Operativi</span> aggregati mensilmente, confrontati con un budget target di {euro(DEFAULT_MONTHLY_BUDGET)}/mese.
          </p>
        </div>
      )}

      {/* Table */}
      <div className="bg-[#1e293b] rounded-2xl border border-[#334155] p-6">
        <h2 className="text-sm font-semibold text-slate-300 mb-4">Budget vs Actual mensile</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#334155]">
                <th className="text-left py-3 px-3 font-medium text-slate-400">Mese</th>
                <th className="text-right py-3 px-3 font-medium text-slate-400">Budget</th>
                <th className="text-right py-3 px-3 font-medium text-slate-400">Actual</th>
                <th className="text-right py-3 px-3 font-medium text-slate-400">Varianza</th>
                <th className="text-right py-3 px-3 font-medium text-slate-400">Varianza %</th>
              </tr>
            </thead>
            <tbody>
              {displayRows.length > 0 ? (
                displayRows.map((r) => (
                  <tr key={r.id} className="border-b border-[#334155]">
                    <td className="py-3 px-3 text-white font-medium">{r.month}</td>
                    <td className="py-3 px-3 text-slate-300 text-right">{euro(r.budget)}</td>
                    <td className="py-3 px-3 text-slate-300 text-right">{euro(r.actual)}</td>
                    <td className={`py-3 px-3 text-right font-medium ${r.variance <= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {r.variance <= 0 ? '' : '+'}{euro(r.variance)}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${
                        r.variancePct <= 0 ? 'bg-emerald-500/10 text-emerald-400' :
                        r.variancePct <= 3 ? 'bg-amber-500/10 text-amber-400' :
                        'bg-red-500/10 text-red-400'
                      }`}>
                        {r.variancePct > 0 ? '+' : ''}{r.variancePct.toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-sm text-slate-500">
                    {isDemo
                      ? 'Nessun dato disponibile.'
                      : 'Nessun costo operativo registrato. Inserisci i dati nella sezione Fleet Intelligence → Costi Operativi per generare il confronto budget.'}
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
