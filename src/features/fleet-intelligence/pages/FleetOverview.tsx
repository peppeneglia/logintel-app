import { Truck, CheckCircle, Wrench, XCircle } from 'lucide-react'
import { mockFleetVehicles } from '../../../data/mockFleetData'
import { useUnavailable } from '../../../hooks/useUnavailable'
import { UnavailableToast } from '../../../components/UnavailableToast'

const statusBadge: Record<string, string> = {
  active: 'bg-emerald-500/10 text-emerald-400',
  maintenance: 'bg-amber-500/10 text-amber-400',
  inactive: 'bg-red-500/10 text-red-400',
}

const statusLabel: Record<string, string> = {
  active: 'Attivo',
  maintenance: 'Manutenzione',
  inactive: 'Inattivo',
}

function fuelBarColor(level: number): string {
  if (level >= 60) return 'bg-emerald-500'
  if (level >= 30) return 'bg-amber-500'
  return 'bg-red-500'
}

export function FleetOverview() {
  const { isDemo, show, close } = useUnavailable()
  const vehicles = isDemo ? mockFleetVehicles : []
  const totalVehicles = vehicles.length
  const activeCount = vehicles.filter((v) => v.status === 'active').length
  const maintenanceCount = vehicles.filter((v) => v.status === 'maintenance').length
  const inactiveCount = vehicles.filter((v) => v.status === 'inactive').length

  const summaryCards = [
    { label: 'Totale Veicoli', value: totalVehicles, icon: Truck, color: 'text-primary-400' },
    { label: 'Attivi', value: activeCount, icon: CheckCircle, color: 'text-emerald-400' },
    { label: 'In Manutenzione', value: maintenanceCount, icon: Wrench, color: 'text-amber-400' },
    { label: 'Inattivi', value: inactiveCount, icon: XCircle, color: 'text-red-400' },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-400 to-cyan-500 bg-clip-text text-transparent mb-3">Panoramica Flotta</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
        {summaryCards.map((card) => {
          const Icon = card.icon
          return (
            <div
              key={card.label}
              className="bg-[#1e293b] rounded-2xl border border-[#334155] p-4 flex items-center gap-3"
            >
              <Icon size={20} className={`${card.color} shrink-0`} />
              <div>
                <p className="text-lg font-bold text-white leading-tight">{card.value}</p>
                <p className="text-xs text-slate-400">{card.label}</p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Vehicles Table */}
      <div className="bg-[#1e293b] rounded-2xl border border-[#334155] p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Tutti i Veicoli</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#334155]">
                <th className="text-left py-2 px-3 font-medium text-slate-400">Targa</th>
                <th className="text-left py-2 px-3 font-medium text-slate-400">Modello</th>
                <th className="text-left py-2 px-3 font-medium text-slate-400">Stato</th>
                <th className="text-left py-2 px-3 font-medium text-slate-400">Autista</th>
                <th className="text-right py-2 px-3 font-medium text-slate-400">Km</th>
                <th className="text-left py-2 px-3 font-medium text-slate-400">Carburante</th>
              </tr>
            </thead>
            <tbody>
              {vehicles.length > 0 ? vehicles.map((v) => (
                <tr key={v.id} className="border-b border-[#334155]">
                  <td className="py-2.5 px-3 font-medium text-white">{v.plate}</td>
                  <td className="py-2.5 px-3 text-slate-300">{v.model}</td>
                  <td className="py-2.5 px-3">
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${statusBadge[v.status]}`}>
                      {statusLabel[v.status]}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-300">{v.driver}</td>
                  <td className="py-2.5 px-3 text-right text-slate-300">
                    {v.mileage.toLocaleString('it-IT')}
                  </td>
                  <td className="py-2.5 px-3">
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-2 bg-[#334155] rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${fuelBarColor(v.fuelLevel)}`}
                          style={{ width: `${v.fuelLevel}%` }}
                        />
                      </div>
                      <span className="text-xs text-slate-400">{v.fuelLevel}%</span>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan={6} className="py-8 text-center text-sm text-slate-500">Nessun veicolo registrato.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      <UnavailableToast show={show} onClose={close} />
    </div>
  )
}
