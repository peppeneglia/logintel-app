import { useAuthStore } from '../../../stores/authStore'
import { mockPenaltyRecords } from '../../../data/mockFinanceData'

function euro(value: number): string {
  return value.toLocaleString('it-IT', { style: 'currency', currency: 'EUR' })
}

const TYPE_BADGE: Record<string, string> = {
  subita: 'bg-red-500/10 text-red-400',
  evitata: 'bg-emerald-500/10 text-emerald-400',
}

const TYPE_LABEL: Record<string, string> = {
  subita: 'Subita',
  evitata: 'Evitata',
}

export function PenaltiesBilling() {
  const { isDemo } = useAuthStore()

  const data = isDemo ? mockPenaltyRecords : []

  const suffered = data.filter((r) => r.tipo === 'subita')
  const avoided = data.filter((r) => r.tipo === 'evitata')
  const totalSuffered = suffered.reduce((sum, r) => sum + r.importo, 0)
  const totalAvoided = avoided.reduce((sum, r) => sum + r.importo, 0)

  return (
    <div>
      <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-400 to-cyan-500 bg-clip-text text-transparent mb-3">
        Penali & Fatturazione
      </h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
        <div className="bg-[#1e293b] rounded-2xl border border-[#334155] p-4">
          <p className="text-xs text-slate-400">Penali subite</p>
          <p className="text-xl font-bold text-red-400">{euro(totalSuffered)}</p>
          <p className="text-xs text-slate-500 mt-1">{suffered.length} eventi</p>
        </div>
        <div className="bg-[#1e293b] rounded-2xl border border-[#334155] p-4">
          <p className="text-xs text-slate-400">Penali evitate</p>
          <p className="text-xl font-bold text-emerald-400">{euro(totalAvoided)}</p>
          <p className="text-xs text-slate-500 mt-1">{avoided.length} eventi</p>
        </div>
        <div className="bg-[#1e293b] rounded-2xl border border-[#334155] p-4">
          <p className="text-xs text-slate-400">Risparmio netto</p>
          <p className="text-xl font-bold text-primary-400">{euro(totalAvoided - totalSuffered)}</p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#1e293b] rounded-2xl border border-[#334155] p-6">
        <h2 className="text-sm font-semibold text-slate-300 mb-4">Registro penali</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#334155]">
                <th className="text-left py-3 px-3 font-medium text-slate-400">Tipo</th>
                <th className="text-left py-3 px-3 font-medium text-slate-400">Cliente</th>
                <th className="text-right py-3 px-3 font-medium text-slate-400">Importo</th>
                <th className="text-left py-3 px-3 font-medium text-slate-400">Motivo</th>
                <th className="text-left py-3 px-3 font-medium text-slate-400">Data</th>
              </tr>
            </thead>
            <tbody>
              {data.length > 0 ? (
                data.map((r) => (
                  <tr key={r.id} className="border-b border-[#334155]">
                    <td className="py-3 px-3">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${TYPE_BADGE[r.tipo]}`}>
                        {TYPE_LABEL[r.tipo]}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-white font-medium">{r.cliente}</td>
                    <td className={`py-3 px-3 text-right font-medium ${r.tipo === 'subita' ? 'text-red-400' : 'text-emerald-400'}`}>
                      {euro(r.importo)}
                    </td>
                    <td className="py-3 px-3 text-slate-300">{r.motivo}</td>
                    <td className="py-3 px-3 text-slate-400">{r.data}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-sm text-slate-500">
                    {isDemo
                      ? 'Nessun dato disponibile.'
                      : 'Collega il tuo sistema di fatturazione per visualizzare penali e addebiti.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
