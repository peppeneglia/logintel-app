import { mockVehicleEmissions } from '../../../data/mockCarbonData'

function euroClassBadge(euroClass: string) {
  if (euroClass === 'Euro 6') return 'bg-emerald-500/10 text-emerald-400'
  if (euroClass === 'Euro 5') return 'bg-amber-500/10 text-amber-400'
  return 'bg-red-500/10 text-red-400'
}

export function VehicleEmissions() {
  return (
    <div>
      <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-400 to-cyan-500 bg-clip-text text-transparent mb-3">Emissioni per Veicolo</h1>

      <div className="bg-[#1e293b] rounded-2xl border border-[#334155] p-6">
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
              </tr>
            </thead>
            <tbody>
              {mockVehicleEmissions.map((v) => (
                <tr key={v.vehiclePlate} className="border-b border-[#334155] last:border-b-0">
                  <td className="py-3 px-3 text-white font-medium">{v.vehiclePlate}</td>
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
