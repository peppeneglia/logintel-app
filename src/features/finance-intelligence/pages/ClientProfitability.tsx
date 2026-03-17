import { useState, useEffect, useCallback } from 'react'
import { useAuthStore } from '../../../stores/authStore'
import { getRouteMargins, computeMargin } from '../../../services/finance'
import type { RouteMarginRow } from '../../../services/finance'
import { mockClientProfitability } from '../../../data/mockFinanceData'

function euro(value: number): string {
  return value.toLocaleString('it-IT', { style: 'currency', currency: 'EUR' })
}

interface ClientDisplayRow {
  id: string
  customer: string
  routes: number
  totalRevenue: number
  totalCost: number
  profit: number
  marginPct: number
}

function mapMockToDisplay(m: (typeof mockClientProfitability)[number]): ClientDisplayRow {
  return {
    id: m.id,
    customer: m.cliente,
    routes: m.tratte,
    totalRevenue: m.ricavoTotale,
    totalCost: m.costoTotale,
    profit: m.profitto,
    marginPct: m.marginePct,
  }
}

/** Aggregate route_margins by customer */
function aggregateByCustomer(rows: RouteMarginRow[]): ClientDisplayRow[] {
  const map = new Map<string, { revenue: number; cost: number; count: number }>()

  for (const row of rows) {
    const key = row.customer || 'Senza cliente'
    const existing = map.get(key) || { revenue: 0, cost: 0, count: 0 }
    const { totalCost } = computeMargin(row)
    existing.revenue += row.revenue
    existing.cost += totalCost
    existing.count += 1
    map.set(key, existing)
  }

  return Array.from(map.entries()).map(([customer, agg], idx) => {
    const profit = agg.revenue - agg.cost
    const marginPct = agg.revenue > 0 ? (profit / agg.revenue) * 100 : 0
    return {
      id: `agg-${idx}`,
      customer,
      routes: agg.count,
      totalRevenue: agg.revenue,
      totalCost: agg.cost,
      profit,
      marginPct,
    }
  })
}

export function ClientProfitability() {
  const { isDemo, user } = useAuthStore()
  const userId = user?.id ?? null

  const [supabaseRows, setSupabaseRows] = useState<RouteMarginRow[]>([])

  const fetchData = useCallback(async () => {
    if (isDemo || !userId) return
    const data = await getRouteMargins(userId)
    setSupabaseRows(data)
  }, [isDemo, userId])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const displayRows: ClientDisplayRow[] = isDemo
    ? mockClientProfitability.map(mapMockToDisplay)
    : aggregateByCustomer(supabaseRows)

  // KPI totals
  const totalRevenue = displayRows.reduce((sum, r) => sum + r.totalRevenue, 0)
  const totalProfit = displayRows.reduce((sum, r) => sum + r.profit, 0)
  const avgMarginPct = displayRows.length
    ? displayRows.reduce((sum, r) => sum + r.marginPct, 0) / displayRows.length
    : 0

  return (
    <div>
      <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-400 to-cyan-500 bg-clip-text text-transparent mb-3">
        Profittabilità Clienti
      </h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
        <div className="bg-[#1e293b] rounded-2xl border border-[#334155] p-4">
          <p className="text-xs text-slate-400">Ricavo totale clienti</p>
          <p className="text-xl font-bold text-white">{euro(totalRevenue)}</p>
        </div>
        <div className="bg-[#1e293b] rounded-2xl border border-[#334155] p-4">
          <p className="text-xs text-slate-400">Profitto totale</p>
          <p className="text-xl font-bold text-emerald-400">{euro(totalProfit)}</p>
        </div>
        <div className="bg-[#1e293b] rounded-2xl border border-[#334155] p-4">
          <p className="text-xs text-slate-400">Margine medio clienti</p>
          <p className="text-xl font-bold text-primary-400">{avgMarginPct.toFixed(1)}%</p>
        </div>
      </div>

      {/* Info banner for real mode */}
      {!isDemo && (
        <div className="bg-[#1e293b] rounded-2xl border border-[#334155] p-4 mb-3">
          <p className="text-sm text-slate-400">
            I dati sono aggregati dalle <span className="text-primary-400 font-medium">Marginalità per Rotta</span>, raggruppati per cliente.
          </p>
        </div>
      )}

      {/* Table */}
      <div className="bg-[#1e293b] rounded-2xl border border-[#334155] p-6">
        <h2 className="text-sm font-semibold text-slate-300 mb-4">Profittabilità per cliente</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#334155]">
                <th className="text-left py-3 px-3 font-medium text-slate-400">Cliente</th>
                <th className="text-right py-3 px-3 font-medium text-slate-400">Tratte</th>
                <th className="text-right py-3 px-3 font-medium text-slate-400">Ricavo totale</th>
                <th className="text-right py-3 px-3 font-medium text-slate-400">Costo totale</th>
                <th className="text-right py-3 px-3 font-medium text-slate-400">Profitto</th>
                <th className="text-right py-3 px-3 font-medium text-slate-400">Margine %</th>
              </tr>
            </thead>
            <tbody>
              {displayRows.length > 0 ? (
                displayRows.map((r) => (
                  <tr key={r.id} className="border-b border-[#334155]">
                    <td className="py-3 px-3 text-white font-medium">{r.customer}</td>
                    <td className="py-3 px-3 text-slate-300 text-right">{r.routes}</td>
                    <td className="py-3 px-3 text-slate-300 text-right">{euro(r.totalRevenue)}</td>
                    <td className="py-3 px-3 text-slate-300 text-right">{euro(r.totalCost)}</td>
                    <td className="py-3 px-3 text-emerald-400 text-right font-medium">{euro(r.profit)}</td>
                    <td className="py-3 px-3 text-right">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${
                        r.marginPct >= 28 ? 'bg-emerald-500/10 text-emerald-400' :
                        r.marginPct >= 20 ? 'bg-amber-500/10 text-amber-400' :
                        'bg-red-500/10 text-red-400'
                      }`}>
                        {r.marginPct.toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-sm text-slate-500">
                    {isDemo
                      ? 'Nessun dato disponibile.'
                      : 'Nessun dato. Inserisci le marginalità per rotta con il campo cliente compilato per visualizzare l\'aggregazione.'}
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
