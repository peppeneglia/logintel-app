import { mockOperationalCosts } from '../../../data/mockFleetData'

function euro(value: number): string {
  return value.toLocaleString('it-IT', { style: 'currency', currency: 'EUR' })
}

export function OperationalCosts() {
  const totals = mockOperationalCosts.reduce(
    (acc, c) => ({
      fuelCost: acc.fuelCost + c.fuelCost,
      maintenanceCost: acc.maintenanceCost + c.maintenanceCost,
      tollCost: acc.tollCost + c.tollCost,
      insuranceCost: acc.insuranceCost + c.insuranceCost,
      totalCost: acc.totalCost + c.totalCost,
      km: acc.km + c.km,
    }),
    { fuelCost: 0, maintenanceCost: 0, tollCost: 0, insuranceCost: 0, totalCost: 0, km: 0 },
  )

  const avgCostPerKm = totals.km > 0 ? totals.totalCost / totals.km : 0

  return (
    <div>
      <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-400 to-cyan-500 bg-clip-text text-transparent mb-3">Costi Operativi</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
        <div className="bg-[#1e293b] rounded-2xl border border-[#334155] p-4">
          <p className="text-xs text-slate-400">Costo Totale Flotta</p>
          <p className="text-lg font-bold text-white">{euro(totals.totalCost)}</p>
        </div>
        <div className="bg-[#1e293b] rounded-2xl border border-[#334155] p-4">
          <p className="text-xs text-slate-400">Carburante</p>
          <p className="text-lg font-bold text-amber-400">{euro(totals.fuelCost)}</p>
        </div>
        <div className="bg-[#1e293b] rounded-2xl border border-[#334155] p-4">
          <p className="text-xs text-slate-400">Km Totali</p>
          <p className="text-lg font-bold text-primary-400">{totals.km.toLocaleString('it-IT')}</p>
        </div>
        <div className="bg-[#1e293b] rounded-2xl border border-[#334155] p-4">
          <p className="text-xs text-slate-400">Costo Medio /km</p>
          <p className="text-lg font-bold text-emerald-400">{euro(avgCostPerKm)}</p>
        </div>
      </div>

      {/* Costs Table */}
      <div className="bg-[#1e293b] rounded-2xl border border-[#334155] p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Dettaglio per Veicolo &mdash; Feb 2026</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#334155]">
                <th className="text-left py-2 px-3 font-medium text-slate-400">Veicolo</th>
                <th className="text-right py-2 px-3 font-medium text-slate-400">Carburante</th>
                <th className="text-right py-2 px-3 font-medium text-slate-400">Manutenzione</th>
                <th className="text-right py-2 px-3 font-medium text-slate-400">Pedaggi</th>
                <th className="text-right py-2 px-3 font-medium text-slate-400">Assicurazione</th>
                <th className="text-right py-2 px-3 font-medium text-slate-400">Totale</th>
                <th className="text-right py-2 px-3 font-medium text-slate-400">Km</th>
                <th className="text-right py-2 px-3 font-medium text-slate-400">/km</th>
              </tr>
            </thead>
            <tbody>
              {mockOperationalCosts.map((cost) => (
                <tr key={cost.vehiclePlate} className="border-b border-[#334155]">
                  <td className="py-2.5 px-3 font-medium text-white">{cost.vehiclePlate}</td>
                  <td className="py-2.5 px-3 text-right text-slate-300">{euro(cost.fuelCost)}</td>
                  <td className="py-2.5 px-3 text-right text-slate-300">{euro(cost.maintenanceCost)}</td>
                  <td className="py-2.5 px-3 text-right text-slate-300">{euro(cost.tollCost)}</td>
                  <td className="py-2.5 px-3 text-right text-slate-300">{euro(cost.insuranceCost)}</td>
                  <td className="py-2.5 px-3 text-right font-semibold text-white">{euro(cost.totalCost)}</td>
                  <td className="py-2.5 px-3 text-right text-slate-300">{cost.km.toLocaleString('it-IT')}</td>
                  <td className="py-2.5 px-3 text-right text-slate-400">{euro(cost.costPerKm)}</td>
                </tr>
              ))}

              {/* Total Row */}
              <tr className="border-t-2 border-slate-600">
                <td className="py-3 px-3 font-bold text-white">TOTALE</td>
                <td className="py-3 px-3 text-right font-semibold text-white">{euro(totals.fuelCost)}</td>
                <td className="py-3 px-3 text-right font-semibold text-white">{euro(totals.maintenanceCost)}</td>
                <td className="py-3 px-3 text-right font-semibold text-white">{euro(totals.tollCost)}</td>
                <td className="py-3 px-3 text-right font-semibold text-white">{euro(totals.insuranceCost)}</td>
                <td className="py-3 px-3 text-right font-bold text-primary-400">{euro(totals.totalCost)}</td>
                <td className="py-3 px-3 text-right font-semibold text-white">{totals.km.toLocaleString('it-IT')}</td>
                <td className="py-3 px-3 text-right font-semibold text-emerald-400">{euro(avgCostPerKm)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
