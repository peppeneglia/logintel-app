import { mockTachographRecords } from '../../data/mockComplianceData'

function formatMinutes(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return `${h}:${m.toString().padStart(2, '0')}`
}

const downloadBadge: Record<string, string> = {
  current: 'bg-emerald-500/10 text-emerald-400',
  pending: 'bg-amber-500/10 text-amber-400',
  overdue: 'bg-red-500/10 text-red-400',
}

const downloadLabel: Record<string, string> = {
  current: 'Aggiornato',
  pending: 'In attesa',
  overdue: 'Scaduto',
}

export function Tachograph() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-3">Tachigrafo</h1>

      <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
        <h2 className="text-sm font-semibold text-gray-300 mb-4">Registrazioni tachigrafo</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left py-3 px-3 font-medium text-gray-400">Autista</th>
                <th className="text-left py-3 px-3 font-medium text-gray-400">Veicolo</th>
                <th className="text-left py-3 px-3 font-medium text-gray-400">Data</th>
                <th className="text-left py-3 px-3 font-medium text-gray-400">Guida</th>
                <th className="text-left py-3 px-3 font-medium text-gray-400">Riposo</th>
                <th className="text-left py-3 px-3 font-medium text-gray-400">Altro lavoro</th>
                <th className="text-left py-3 px-3 font-medium text-gray-400">Violazioni</th>
                <th className="text-left py-3 px-3 font-medium text-gray-400">Download</th>
              </tr>
            </thead>
            <tbody>
              {mockTachographRecords.map((record) => (
                <tr key={record.id} className="border-b border-gray-800">
                  <td className="py-3 px-3 text-white font-medium">{record.driver}</td>
                  <td className="py-3 px-3 text-gray-300">{record.vehiclePlate}</td>
                  <td className="py-3 px-3 text-gray-400">{record.date}</td>
                  <td className="py-3 px-3 text-gray-300">{formatMinutes(record.drivingMinutes)}</td>
                  <td className="py-3 px-3 text-gray-300">{formatMinutes(record.restMinutes)}</td>
                  <td className="py-3 px-3 text-gray-300">{formatMinutes(record.otherWorkMinutes)}</td>
                  <td className="py-3 px-3">
                    <span className={`font-semibold ${record.violations > 0 ? 'text-red-400' : 'text-gray-400'}`}>
                      {record.violations}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${downloadBadge[record.downloadStatus]}`}>
                      {downloadLabel[record.downloadStatus]}
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
