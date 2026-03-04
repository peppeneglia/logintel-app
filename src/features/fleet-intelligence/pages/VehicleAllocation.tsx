import { mockVehicleAllocations } from '../../../data/mockFleetData'

const statusBadge: Record<string, string> = {
  scheduled: 'bg-primary-500/10 text-primary-400',
  in_transit: 'bg-amber-500/10 text-amber-400',
  completed: 'bg-emerald-500/10 text-emerald-400',
}

const statusLabel: Record<string, string> = {
  scheduled: 'Programmato',
  in_transit: 'In Transito',
  completed: 'Completato',
}

function formatDateTime(dateStr: string): string {
  const d = new Date(dateStr)
  return (
    d.toLocaleDateString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }) +
    ' ' +
    d.toLocaleTimeString('it-IT', {
      hour: '2-digit',
      minute: '2-digit',
    })
  )
}

export function VehicleAllocation() {
  const scheduledCount = mockVehicleAllocations.filter((a) => a.status === 'scheduled').length
  const inTransitCount = mockVehicleAllocations.filter((a) => a.status === 'in_transit').length
  const completedCount = mockVehicleAllocations.filter((a) => a.status === 'completed').length

  return (
    <div>
      <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-400 to-cyan-500 bg-clip-text text-transparent mb-3">Allocazione Veicoli</h1>

      {/* Summary Row */}
      <div className="grid grid-cols-3 gap-4 mb-3">
        <div className="bg-[#1e293b] rounded-2xl border border-[#334155] p-4">
          <p className="text-xs text-slate-400">Programmati</p>
          <p className="text-lg font-bold text-primary-400">{scheduledCount}</p>
        </div>
        <div className="bg-[#1e293b] rounded-2xl border border-[#334155] p-4">
          <p className="text-xs text-slate-400">In Transito</p>
          <p className="text-lg font-bold text-amber-400">{inTransitCount}</p>
        </div>
        <div className="bg-[#1e293b] rounded-2xl border border-[#334155] p-4">
          <p className="text-xs text-slate-400">Completati</p>
          <p className="text-lg font-bold text-emerald-400">{completedCount}</p>
        </div>
      </div>

      {/* Allocations Table */}
      <div className="bg-[#1e293b] rounded-2xl border border-[#334155] p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Assegnazioni Veicoli-Tratte</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#334155]">
                <th className="text-left py-2 px-3 font-medium text-slate-400">Veicolo</th>
                <th className="text-left py-2 px-3 font-medium text-slate-400">Tratta</th>
                <th className="text-left py-2 px-3 font-medium text-slate-400">Autista</th>
                <th className="text-left py-2 px-3 font-medium text-slate-400">Partenza</th>
                <th className="text-left py-2 px-3 font-medium text-slate-400">Stato</th>
              </tr>
            </thead>
            <tbody>
              {mockVehicleAllocations.map((alloc) => (
                <tr key={alloc.id} className="border-b border-[#334155]">
                  <td className="py-2.5 px-3 font-medium text-white">{alloc.vehiclePlate}</td>
                  <td className="py-2.5 px-3 text-slate-300">{alloc.route}</td>
                  <td className="py-2.5 px-3 text-slate-300">{alloc.driver}</td>
                  <td className="py-2.5 px-3 text-slate-300">{formatDateTime(alloc.departureDate)}</td>
                  <td className="py-2.5 px-3">
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${statusBadge[alloc.status]}`}>
                      {statusLabel[alloc.status]}
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
