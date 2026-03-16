import { useState } from 'react'
import { mockComplianceDocuments } from '../../../data/mockComplianceData'
import { useUnavailable } from '../../../hooks/useUnavailable'
import { UnavailableToast } from '../../../components/UnavailableToast'

const statusBadge: Record<string, string> = {
  valid: 'bg-emerald-500/10 text-emerald-400',
  expiring: 'bg-amber-500/10 text-amber-400',
  expired: 'bg-red-500/10 text-red-400',
}

const statusLabel: Record<string, string> = {
  valid: 'Valido',
  expiring: 'In scadenza',
  expired: 'Scaduto',
}

function daysToExpiry(expiryDate: string): number {
  const now = new Date()
  const expiry = new Date(expiryDate)
  const diff = expiry.getTime() - now.getTime()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

export function DocumentsLicenses() {
  const { isDemo, show, guard: _guard, close } = useUnavailable()

  const [statusFilter, setStatusFilter] = useState<string>('all')

  const allData = isDemo ? mockComplianceDocuments : []
  const filtered =
    statusFilter === 'all'
      ? allData
      : allData.filter((d) => d.status === statusFilter)

  return (
    <div>
      <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-400 to-cyan-500 bg-clip-text text-transparent mb-3">Documenti & Scadenze</h1>

      {/* Filter */}
      <div className="bg-[#1e293b] rounded-2xl border border-[#334155] p-6 mb-3">
        <label className="block text-sm font-medium text-slate-300 mb-2">Filtra per stato</label>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 bg-[#334155] border border-slate-600 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500"
        >
          <option value="all">Tutti</option>
          <option value="valid">Valido</option>
          <option value="expiring">In scadenza</option>
          <option value="expired">Scaduto</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-[#1e293b] rounded-2xl border border-[#334155] p-6">
        <h2 className="text-sm font-semibold text-slate-300 mb-4">Elenco documenti</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#334155]">
                <th className="text-left py-3 px-3 font-medium text-slate-400">Titolare</th>
                <th className="text-left py-3 px-3 font-medium text-slate-400">Tipo</th>
                <th className="text-left py-3 px-3 font-medium text-slate-400">Numero</th>
                <th className="text-left py-3 px-3 font-medium text-slate-400">Emissione</th>
                <th className="text-left py-3 px-3 font-medium text-slate-400">Scadenza</th>
                <th className="text-left py-3 px-3 font-medium text-slate-400">Giorni</th>
                <th className="text-left py-3 px-3 font-medium text-slate-400">Stato</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={7} className="py-6 px-3 text-center text-slate-500">Nessun dato disponibile.</td></tr>
              ) : filtered.map((doc) => {
                const days = daysToExpiry(doc.expiryDate)
                return (
                  <tr key={doc.id} className="border-b border-[#334155]">
                    <td className="py-3 px-3 text-white font-medium">{doc.holder}</td>
                    <td className="py-3 px-3 text-slate-300">{doc.documentType}</td>
                    <td className="py-3 px-3 text-slate-400 font-mono text-xs">{doc.number}</td>
                    <td className="py-3 px-3 text-slate-400">{doc.issueDate}</td>
                    <td className="py-3 px-3 text-slate-400">{doc.expiryDate}</td>
                    <td className="py-3 px-3">
                      <span
                        className={`font-semibold ${
                          days < 0
                            ? 'text-red-400'
                            : days <= 60
                              ? 'text-amber-400'
                              : 'text-slate-300'
                        }`}
                      >
                        {days < 0 ? `${days}` : `${days}`}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${statusBadge[doc.status]}`}
                      >
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
      <UnavailableToast show={show} onClose={close} />
    </div>
  )
}
