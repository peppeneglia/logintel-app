import { mockDocumentExpiries } from '../../data/mockFleetData'

const statusBadge: Record<string, string> = {
  valid: 'bg-emerald-500/10 text-emerald-400',
  expiring: 'bg-amber-500/10 text-amber-400',
  expired: 'bg-red-500/10 text-red-400',
}

const statusLabel: Record<string, string> = {
  valid: 'Valido',
  expiring: 'In Scadenza',
  expired: 'Scaduto',
}

const holderTypeBadge: Record<string, string> = {
  vehicle: 'bg-primary-500/10 text-primary-400',
  driver: 'bg-gray-700 text-gray-300',
}

const holderTypeLabel: Record<string, string> = {
  vehicle: 'Veicolo',
  driver: 'Autista',
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('it-IT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

function daysLeftText(days: number): string {
  if (days < 0) return `${Math.abs(days)} gg scaduto`
  if (days === 0) return 'Oggi'
  return `${days} gg`
}

function daysLeftColor(days: number): string {
  if (days < 0) return 'text-red-400 font-semibold'
  if (days <= 14) return 'text-amber-400 font-semibold'
  return 'text-gray-300'
}

export function DocumentExpiry() {
  const sorted = [...mockDocumentExpiries].sort((a, b) => a.daysLeft - b.daysLeft)

  const expiredCount = sorted.filter((d) => d.status === 'expired').length
  const expiringCount = sorted.filter((d) => d.status === 'expiring').length
  const validCount = sorted.filter((d) => d.status === 'valid').length

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-3">Scadenze & Documenti</h1>

      {/* Summary Row */}
      <div className="grid grid-cols-3 gap-4 mb-3">
        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-4">
          <p className="text-xs text-gray-400">Scaduti</p>
          <p className="text-lg font-bold text-red-400">{expiredCount}</p>
        </div>
        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-4">
          <p className="text-xs text-gray-400">In Scadenza</p>
          <p className="text-lg font-bold text-amber-400">{expiringCount}</p>
        </div>
        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-4">
          <p className="text-xs text-gray-400">Validi</p>
          <p className="text-lg font-bold text-emerald-400">{validCount}</p>
        </div>
      </div>

      {/* Documents Table */}
      <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Elenco Documenti</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left py-2 px-3 font-medium text-gray-400">Intestatario</th>
                <th className="text-left py-2 px-3 font-medium text-gray-400">Tipo</th>
                <th className="text-left py-2 px-3 font-medium text-gray-400">Documento</th>
                <th className="text-left py-2 px-3 font-medium text-gray-400">Scadenza</th>
                <th className="text-right py-2 px-3 font-medium text-gray-400">Giorni</th>
                <th className="text-left py-2 px-3 font-medium text-gray-400">Stato</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((doc) => {
                const rowHighlight =
                  doc.status === 'expired'
                    ? 'bg-red-500/5'
                    : doc.status === 'expiring'
                      ? 'bg-amber-500/5'
                      : ''
                return (
                  <tr key={doc.id} className={`border-b border-gray-800 ${rowHighlight}`}>
                    <td className="py-2.5 px-3 font-medium text-white">{doc.holder}</td>
                    <td className="py-2.5 px-3">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${holderTypeBadge[doc.holderType]}`}>
                        {holderTypeLabel[doc.holderType]}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-gray-300">{doc.documentType}</td>
                    <td className="py-2.5 px-3 text-gray-300">{formatDate(doc.expiryDate)}</td>
                    <td className={`py-2.5 px-3 text-right ${daysLeftColor(doc.daysLeft)}`}>
                      {daysLeftText(doc.daysLeft)}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${statusBadge[doc.status]}`}>
                        {statusLabel[doc.status]}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
