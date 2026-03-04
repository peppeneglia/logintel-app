import { mockBudgetVsActual } from '../../data/mockFinanceData'

export function BudgetForecast() {
  const totalBudget = mockBudgetVsActual.reduce((sum, r) => sum + r.budget, 0)
  const totalActual = mockBudgetVsActual.reduce((sum, r) => sum + r.actual, 0)
  const overBudgetMonths = mockBudgetVsActual.filter((r) => r.varianza > 0).length

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-3">Budget & Forecast</h1>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-4">
          <p className="text-xs text-gray-400">Budget totale periodo</p>
          <p className="text-xl font-bold text-white">€{totalBudget.toLocaleString('it-IT')}</p>
        </div>
        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-4">
          <p className="text-xs text-gray-400">Spesa effettiva</p>
          <p className="text-xl font-bold text-primary-400">€{totalActual.toLocaleString('it-IT')}</p>
        </div>
        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-4">
          <p className="text-xs text-gray-400">Mesi sopra budget</p>
          <p className="text-xl font-bold text-amber-400">{overBudgetMonths} / {mockBudgetVsActual.length}</p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
        <h2 className="text-sm font-semibold text-gray-300 mb-4">Budget vs Actual mensile</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left py-3 px-3 font-medium text-gray-400">Mese</th>
                <th className="text-right py-3 px-3 font-medium text-gray-400">Budget</th>
                <th className="text-right py-3 px-3 font-medium text-gray-400">Actual</th>
                <th className="text-right py-3 px-3 font-medium text-gray-400">Varianza</th>
                <th className="text-right py-3 px-3 font-medium text-gray-400">Varianza %</th>
              </tr>
            </thead>
            <tbody>
              {mockBudgetVsActual.map((r) => (
                <tr key={r.id} className="border-b border-gray-800">
                  <td className="py-3 px-3 text-white font-medium">{r.mese}</td>
                  <td className="py-3 px-3 text-gray-300 text-right">€{r.budget.toLocaleString('it-IT')}</td>
                  <td className="py-3 px-3 text-gray-300 text-right">€{r.actual.toLocaleString('it-IT')}</td>
                  <td className={`py-3 px-3 text-right font-medium ${r.varianza <= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {r.varianza <= 0 ? '' : '+'}€{r.varianza.toLocaleString('it-IT')}
                  </td>
                  <td className="py-3 px-3 text-right">
                    <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${
                      r.varianzaPct <= 0 ? 'bg-emerald-500/10 text-emerald-400' :
                      r.varianzaPct <= 3 ? 'bg-amber-500/10 text-amber-400' :
                      'bg-red-500/10 text-red-400'
                    }`}>
                      {r.varianzaPct > 0 ? '+' : ''}{r.varianzaPct}%
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
