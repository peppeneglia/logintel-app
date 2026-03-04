import { mockDrivingHours } from '../../data/mockComplianceData'

function formatMinutes(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return `${h}:${m.toString().padStart(2, '0')}`
}

const statusBadge: Record<string, string> = {
  compliant: 'bg-emerald-500/10 text-emerald-400',
  warning: 'bg-amber-500/10 text-amber-400',
  violation: 'bg-red-500/10 text-red-400',
}

const statusLabel: Record<string, string> = {
  compliant: 'Conforme',
  warning: 'Attenzione',
  violation: 'Violazione',
}

export function DrivingHours() {
  const compliant = mockDrivingHours.filter((r) => r.status === 'compliant').length
  const warning = mockDrivingHours.filter((r) => r.status === 'warning').length
  const violation = mockDrivingHours.filter((r) => r.status === 'violation').length

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-3">Ore Guida & Riposo</h1>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-4">
          <p className="text-xs text-gray-400">Autisti conformi</p>
          <p className="text-xl font-bold text-emerald-400">{compliant}</p>
        </div>
        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-4">
          <p className="text-xs text-gray-400">In warning</p>
          <p className="text-xl font-bold text-amber-400">{warning}</p>
        </div>
        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-4">
          <p className="text-xs text-gray-400">In violazione</p>
          <p className="text-xl font-bold text-red-400">{violation}</p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
        <h2 className="text-sm font-semibold text-gray-300 mb-4">Dettaglio ore guida giornaliere</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left py-3 px-3 font-medium text-gray-400">Autista</th>
                <th className="text-left py-3 px-3 font-medium text-gray-400">Data</th>
                <th className="text-left py-3 px-3 font-medium text-gray-400">Guida</th>
                <th className="text-left py-3 px-3 font-medium text-gray-400">Riposo</th>
                <th className="text-left py-3 px-3 font-medium text-gray-400">Rimanente</th>
                <th className="text-left py-3 px-3 font-medium text-gray-400">Sett. (h)</th>
                <th className="text-left py-3 px-3 font-medium text-gray-400">Stato</th>
              </tr>
            </thead>
            <tbody>
              {mockDrivingHours.map((record) => (
                <tr key={record.id} className="border-b border-gray-800">
                  <td className="py-3 px-3 text-white font-medium">{record.driver}</td>
                  <td className="py-3 px-3 text-gray-400">{record.date}</td>
                  <td className="py-3 px-3 text-gray-300">{formatMinutes(record.drivingMinutes)}</td>
                  <td className="py-3 px-3 text-gray-300">{formatMinutes(record.restMinutes)}</td>
                  <td className="py-3 px-3 text-gray-300">{formatMinutes(record.remainingDrivingMinutes)}</td>
                  <td className="py-3 px-3 text-gray-300">{record.weeklyDrivingHours}</td>
                  <td className="py-3 px-3">
                    <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${statusBadge[record.status]}`}>
                      {statusLabel[record.status]}
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
