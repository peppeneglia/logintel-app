import { mockPenaltyRecords } from '../../data/mockFinanceData'

const tipoBadge: Record<string, string> = {
  subita: 'bg-red-500/10 text-red-400',
  evitata: 'bg-emerald-500/10 text-emerald-400',
}

const tipoLabel: Record<string, string> = {
  subita: 'Subita',
  evitata: 'Evitata',
}

export function PenaltiesBilling() {
  const penaliSubite = mockPenaltyRecords.filter((r) => r.tipo === 'subita')
  const penaliEvitate = mockPenaltyRecords.filter((r) => r.tipo === 'evitata')
  const totaleSubite = penaliSubite.reduce((sum, r) => sum + r.importo, 0)
  const totaleEvitate = penaliEvitate.reduce((sum, r) => sum + r.importo, 0)

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-3">Penali & Fatturazione</h1>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-4">
          <p className="text-xs text-gray-400">Penali subite</p>
          <p className="text-xl font-bold text-red-400">€{totaleSubite.toLocaleString('it-IT')}</p>
          <p className="text-xs text-gray-500 mt-1">{penaliSubite.length} eventi</p>
        </div>
        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-4">
          <p className="text-xs text-gray-400">Penali evitate</p>
          <p className="text-xl font-bold text-emerald-400">€{totaleEvitate.toLocaleString('it-IT')}</p>
          <p className="text-xs text-gray-500 mt-1">{penaliEvitate.length} eventi</p>
        </div>
        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-4">
          <p className="text-xs text-gray-400">Risparmio netto</p>
          <p className="text-xl font-bold text-primary-400">€{(totaleEvitate - totaleSubite).toLocaleString('it-IT')}</p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
        <h2 className="text-sm font-semibold text-gray-300 mb-4">Registro penali</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left py-3 px-3 font-medium text-gray-400">Tipo</th>
                <th className="text-left py-3 px-3 font-medium text-gray-400">Cliente</th>
                <th className="text-right py-3 px-3 font-medium text-gray-400">Importo</th>
                <th className="text-left py-3 px-3 font-medium text-gray-400">Motivo</th>
                <th className="text-left py-3 px-3 font-medium text-gray-400">Data</th>
              </tr>
            </thead>
            <tbody>
              {mockPenaltyRecords.map((r) => (
                <tr key={r.id} className="border-b border-gray-800">
                  <td className="py-3 px-3">
                    <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${tipoBadge[r.tipo]}`}>
                      {tipoLabel[r.tipo]}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-white font-medium">{r.cliente}</td>
                  <td className={`py-3 px-3 text-right font-medium ${r.tipo === 'subita' ? 'text-red-400' : 'text-emerald-400'}`}>
                    €{r.importo.toLocaleString('it-IT')}
                  </td>
                  <td className="py-3 px-3 text-gray-300">{r.motivo}</td>
                  <td className="py-3 px-3 text-gray-400">{r.data}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
