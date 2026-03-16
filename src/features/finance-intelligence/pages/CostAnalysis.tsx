import { mockCostPerKm } from '../../../data/mockFinanceData'
import { useUnavailable } from '../../../hooks/useUnavailable'
import { UnavailableToast } from '../../../components/UnavailableToast'

export function CostAnalysis() {
  const { isDemo, show, close } = useUnavailable()
  const data = isDemo ? mockCostPerKm : []

  const avgCostPerKm = data.length ? data.reduce((sum, r) => sum + r.costoPerKm, 0) / data.length : 0
  const totalCosts = data.reduce((sum, r) => sum + r.totale, 0)
  const totalFuel = data.reduce((sum, r) => sum + r.carburante, 0)

  return (
    <div>
      <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-400 to-cyan-500 bg-clip-text text-transparent mb-3">Costi per Km</h1>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
        <div className="bg-[#1e293b] rounded-2xl border border-[#334155] p-4">
          <p className="text-xs text-slate-400">Costo medio / km</p>
          <p className="text-xl font-bold text-primary-400">€{avgCostPerKm.toFixed(2)}</p>
        </div>
        <div className="bg-[#1e293b] rounded-2xl border border-[#334155] p-4">
          <p className="text-xs text-slate-400">Costi totali flotta</p>
          <p className="text-xl font-bold text-white">€{totalCosts.toLocaleString('it-IT')}</p>
        </div>
        <div className="bg-[#1e293b] rounded-2xl border border-[#334155] p-4">
          <p className="text-xs text-slate-400">Carburante totale</p>
          <p className="text-xl font-bold text-amber-400">€{totalFuel.toLocaleString('it-IT')}</p>
        </div>
      </div>

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
                <th className="text-right py-3 px-3 font-medium text-slate-400">Assicurazione</th>
                <th className="text-right py-3 px-3 font-medium text-slate-400">Totale</th>
                <th className="text-right py-3 px-3 font-medium text-slate-400">€/km</th>
              </tr>
            </thead>
            <tbody>
              {data.length === 0 ? (
                <tr><td colSpan={8} className="py-6 text-center text-slate-500">Nessun dato disponibile.</td></tr>
              ) : data.map((r) => (
                <tr key={r.id} className="border-b border-[#334155]">
                  <td className="py-3 px-3 text-white font-medium">{r.veicolo}</td>
                  <td className="py-3 px-3 text-slate-400">{r.periodo}</td>
                  <td className="py-3 px-3 text-slate-300 text-right">€{r.carburante.toLocaleString('it-IT')}</td>
                  <td className="py-3 px-3 text-slate-300 text-right">€{r.pedaggi.toLocaleString('it-IT')}</td>
                  <td className="py-3 px-3 text-slate-300 text-right">€{r.manutenzione.toLocaleString('it-IT')}</td>
                  <td className="py-3 px-3 text-slate-300 text-right">€{r.assicurazione.toLocaleString('it-IT')}</td>
                  <td className="py-3 px-3 text-white text-right font-medium">€{r.totale.toLocaleString('it-IT')}</td>
                  <td className="py-3 px-3 text-right">
                    <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${
                      r.costoPerKm <= 1.35 ? 'bg-emerald-500/10 text-emerald-400' :
                      r.costoPerKm <= 1.50 ? 'bg-amber-500/10 text-amber-400' :
                      'bg-red-500/10 text-red-400'
                    }`}>
                      €{r.costoPerKm.toFixed(2)}
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
