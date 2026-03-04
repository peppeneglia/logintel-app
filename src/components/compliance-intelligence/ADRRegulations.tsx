import { mockADRShipments } from '../../data/mockComplianceData'

const statusBadge: Record<string, string> = {
  compliant: 'bg-emerald-500/10 text-emerald-400',
  pending_review: 'bg-amber-500/10 text-amber-400',
  issue: 'bg-red-500/10 text-red-400',
}

const statusLabel: Record<string, string> = {
  compliant: 'Conforme',
  pending_review: 'In revisione',
  issue: 'Problema',
}

export function ADRRegulations() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-3">Normative ADR</h1>

      <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
        <h2 className="text-sm font-semibold text-gray-300 mb-4">Spedizioni merci pericolose</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left py-3 px-3 font-medium text-gray-400">UN</th>
                <th className="text-left py-3 px-3 font-medium text-gray-400">Classe</th>
                <th className="text-left py-3 px-3 font-medium text-gray-400">Descrizione</th>
                <th className="text-left py-3 px-3 font-medium text-gray-400">Veicolo</th>
                <th className="text-left py-3 px-3 font-medium text-gray-400">Autista</th>
                <th className="text-left py-3 px-3 font-medium text-gray-400">Rotta</th>
                <th className="text-left py-3 px-3 font-medium text-gray-400">Data</th>
                <th className="text-left py-3 px-3 font-medium text-gray-400">Stato</th>
              </tr>
            </thead>
            <tbody>
              {mockADRShipments.map((shipment) => (
                <tr key={shipment.id} className="border-b border-gray-800">
                  <td className="py-3 px-3 text-white font-medium font-mono text-xs">{shipment.unNumber}</td>
                  <td className="py-3 px-3 text-gray-300">{shipment.adrClass}</td>
                  <td className="py-3 px-3 text-gray-300">{shipment.description}</td>
                  <td className="py-3 px-3 text-gray-400">{shipment.vehiclePlate}</td>
                  <td className="py-3 px-3 text-gray-300">{shipment.driver}</td>
                  <td className="py-3 px-3 text-gray-400">{shipment.route}</td>
                  <td className="py-3 px-3 text-gray-400">{shipment.date}</td>
                  <td className="py-3 px-3">
                    <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${statusBadge[shipment.status]}`}>
                      {statusLabel[shipment.status]}
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
