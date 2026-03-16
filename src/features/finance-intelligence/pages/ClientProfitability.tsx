import { mockClientProfitability } from '../../../data/mockFinanceData'
import { useUnavailable } from '../../../hooks/useUnavailable'
import { UnavailableToast } from '../../../components/UnavailableToast'

export function ClientProfitability() {
  const { isDemo, show, close } = useUnavailable()
  const data = isDemo ? mockClientProfitability : []

  const totalRevenue = data.reduce((sum, r) => sum + r.ricavoTotale, 0)
  const totalProfit = data.reduce((sum, r) => sum + r.profitto, 0)
  const avgMargin = data.length ? data.reduce((sum, r) => sum + r.marginePct, 0) / data.length : 0

  return (
    <div>
      <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-400 to-cyan-500 bg-clip-text text-transparent mb-3">Profittabilità Clienti</h1>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
        <div className="bg-[#1e293b] rounded-2xl border border-[#334155] p-4">
          <p className="text-xs text-slate-400">Ricavo totale clienti</p>
          <p className="text-xl font-bold text-white">€{totalRevenue.toLocaleString('it-IT')}</p>
        </div>
        <div className="bg-[#1e293b] rounded-2xl border border-[#334155] p-4">
          <p className="text-xs text-slate-400">Profitto totale</p>
          <p className="text-xl font-bold text-emerald-400">€{totalProfit.toLocaleString('it-IT')}</p>
        </div>
        <div className="bg-[#1e293b] rounded-2xl border border-[#334155] p-4">
          <p className="text-xs text-slate-400">Margine medio clienti</p>
          <p className="text-xl font-bold text-primary-400">{avgMargin.toFixed(1)}%</p>
        </div>
      </div>

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
              {data.length === 0 ? (
                <tr><td colSpan={6} className="py-6 text-center text-slate-500">Nessun dato disponibile.</td></tr>
              ) : data.map((r) => (
                <tr key={r.id} className="border-b border-[#334155]">
                  <td className="py-3 px-3 text-white font-medium">{r.cliente}</td>
                  <td className="py-3 px-3 text-slate-300 text-right">{r.tratte}</td>
                  <td className="py-3 px-3 text-slate-300 text-right">€{r.ricavoTotale.toLocaleString('it-IT')}</td>
                  <td className="py-3 px-3 text-slate-300 text-right">€{r.costoTotale.toLocaleString('it-IT')}</td>
                  <td className="py-3 px-3 text-emerald-400 text-right font-medium">€{r.profitto.toLocaleString('it-IT')}</td>
                  <td className="py-3 px-3 text-right">
                    <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${
                      r.marginePct >= 28 ? 'bg-emerald-500/10 text-emerald-400' :
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
      <UnavailableToast show={show} onClose={close} />
    </div>
  )
}
