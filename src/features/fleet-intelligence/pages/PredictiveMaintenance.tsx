import { mockMaintenanceAlerts } from '../../../data/mockFleetData'

const riskBadge: Record<string, string> = {
  low: 'bg-emerald-500/10 text-emerald-400',
  medium: 'bg-amber-500/10 text-amber-400',
  high: 'bg-red-500/10 text-red-400',
}

const riskLabel: Record<string, string> = {
  low: 'Basso',
  medium: 'Medio',
  high: 'Alto',
}

const statusBadge: Record<string, string> = {
  pending: 'bg-amber-500/10 text-amber-400',
  scheduled: 'bg-primary-500/10 text-primary-400',
  resolved: 'bg-emerald-500/10 text-emerald-400',
}

const statusLabel: Record<string, string> = {
  pending: 'In Attesa',
  scheduled: 'Pianificato',
  resolved: 'Risolto',
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('it-IT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

export function PredictiveMaintenance() {
  const highCount = mockMaintenanceAlerts.filter((a) => a.risk === 'high').length
  const mediumCount = mockMaintenanceAlerts.filter((a) => a.risk === 'medium').length
  const pendingCount = mockMaintenanceAlerts.filter((a) => a.status === 'pending').length

  return (
    <div>
      <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-400 to-cyan-500 bg-clip-text text-transparent mb-3">Manutenzione Predittiva</h1>

      {/* Summary Row */}
      <div className="grid grid-cols-3 gap-4 mb-3">
        <div className="bg-[#1e293b] rounded-2xl border border-[#334155] p-4">
          <p className="text-xs text-slate-400">Rischio Alto</p>
          <p className="text-lg font-bold text-red-400">{highCount}</p>
        </div>
        <div className="bg-[#1e293b] rounded-2xl border border-[#334155] p-4">
          <p className="text-xs text-slate-400">Rischio Medio</p>
          <p className="text-lg font-bold text-amber-400">{mediumCount}</p>
        </div>
        <div className="bg-[#1e293b] rounded-2xl border border-[#334155] p-4">
          <p className="text-xs text-slate-400">In Attesa</p>
          <p className="text-lg font-bold text-white">{pendingCount}</p>
        </div>
      </div>

      {/* Alerts Table */}
      <div className="bg-[#1e293b] rounded-2xl border border-[#334155] p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Avvisi Manutenzione</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#334155]">
                <th className="text-left py-2 px-3 font-medium text-slate-400">Veicolo</th>
                <th className="text-left py-2 px-3 font-medium text-slate-400">Componente</th>
                <th className="text-left py-2 px-3 font-medium text-slate-400">Rischio</th>
                <th className="text-left py-2 px-3 font-medium text-slate-400">Data Prevista</th>
                <th className="text-right py-2 px-3 font-medium text-slate-400">Km al Guasto</th>
                <th className="text-left py-2 px-3 font-medium text-slate-400">Stato</th>
              </tr>
            </thead>
            <tbody>
              {mockMaintenanceAlerts.map((alert) => (
                <tr key={alert.id} className="border-b border-[#334155]">
                  <td className="py-2.5 px-3 font-medium text-white">{alert.vehiclePlate}</td>
                  <td className="py-2.5 px-3 text-slate-300">{alert.component}</td>
                  <td className="py-2.5 px-3">
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${riskBadge[alert.risk]}`}>
                      {riskLabel[alert.risk]}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-300">{formatDate(alert.predictedDate)}</td>
                  <td className="py-2.5 px-3 text-right text-slate-300">
                    {alert.mileageToFailure.toLocaleString('it-IT')} km
                  </td>
                  <td className="py-2.5 px-3">
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${statusBadge[alert.status]}`}>
                      {statusLabel[alert.status]}
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
