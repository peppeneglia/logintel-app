import { mockRouteMargins } from '../../data/mockFinanceData'

export function RouteMargins() {
  const avgMargin = mockRouteMargins.reduce((sum, r) => sum + r.marginePct, 0) / mockRouteMargins.length
  const totalRevenue = mockRouteMargins.reduce((sum, r) => sum + r.ricavo, 0)
  const totalProfit = mockRouteMargins.reduce((sum, r) => sum + r.margine, 0)

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-3">Marginalità per Rotta</h1>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-4">
          <p className="text-xs text-gray-400">Ricavo totale</p>
          <p className="text-xl font-bold text-white">€{totalRevenue.toLocaleString('it-IT')}</p>
        </div>
        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-4">
          <p className="text-xs text-gray-400">Margine totale</p>
          <p className="text-xl font-bold text-emerald-400">€{totalProfit.toLocaleString('it-IT')}</p>
        </div>
        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-4">
          <p className="text-xs text-gray-400">Margine medio</p>
          <p className="text-xl font-bold text-primary-400">{avgMargin.toFixed(1)}%</p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
        <h2 className="text-sm font-semibold text-gray-300 mb-4">Dettaglio marginalità per rotta</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left py-3 px-3 font-medium text-gray-400">Rotta</th>
                <th className="text-right py-3 px-3 font-medium text-gray-400">Km</th>
                <th className="text-right py-3 px-3 font-medium text-gray-400">Ricavo</th>
                <th className="text-right py-3 px-3 font-medium text-gray-400">Costo</th>
                <th className="text-right py-3 px-3 font-medium text-gray-400">Margine</th>
                <th className="text-right py-3 px-3 font-medium text-gray-400">Margine %</th>
              </tr>
            </thead>
            <tbody>
              {mockRouteMargins.map((r) => (
                <tr key={r.id} className="border-b border-gray-800">
                  <td className="py-3 px-3 text-white font-medium">{r.rotta}</td>
                  <td className="py-3 px-3 text-gray-300 text-right">{r.km}</td>
                  <td className="py-3 px-3 text-gray-300 text-right">€{r.ricavo.toLocaleString('it-IT')}</td>
                  <td className="py-3 px-3 text-gray-300 text-right">€{r.costo.toLocaleString('it-IT')}</td>
                  <td className="py-3 px-3 text-emerald-400 text-right font-medium">€{r.margine.toLocaleString('it-IT')}</td>
                  <td className="py-3 px-3 text-right">
                    <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${
                      r.marginePct >= 30 ? 'bg-emerald-500/10 text-emerald-400' :
                      r.marginePct >= 20 ? 'bg-amber-500/10 text-amber-400' :
                      'bg-red-500/10 text-red-400'
                    }`}>
                      {r.marginePct}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
