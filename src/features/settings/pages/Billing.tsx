import { useAuthStore } from '../../../stores/authStore'
import { mockInvoices } from '../../../data/mockData'

export function Billing() {
  const isDemo = useAuthStore((s) => s.isDemo)

  return (
    <div>
      <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-400 to-cyan-500 bg-clip-text text-transparent mb-3">Fatturazione</h1>

      {/* Payment method */}
      <div className="bg-[#1e293b] border border-[#334155] rounded-2xl p-6 mb-3">
        <h2 className="text-lg font-semibold text-white mb-3">Metodo di pagamento</h2>
        {isDemo ? (
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-300">
              Visa &bull;&bull;&bull;&bull; 4242 — Scade 12/2027
            </span>
            <button className="px-4 py-2 border border-slate-600 rounded-xl text-sm font-medium text-slate-300 hover:bg-[#334155] transition-colors">
              Modifica
            </button>
          </div>
        ) : (
          <p className="text-sm text-slate-500">Nessun metodo di pagamento configurato.</p>
        )}
      </div>

      {/* Invoice history */}
      <div className="bg-[#1e293b] border border-[#334155] rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Storico fatture</h2>
        {isDemo ? (
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#334155]">
                <th className="text-left text-sm font-medium text-slate-400 pb-3">Numero</th>
                <th className="text-left text-sm font-medium text-slate-400 pb-3">Periodo</th>
                <th className="text-left text-sm font-medium text-slate-400 pb-3">Importo</th>
                <th className="text-left text-sm font-medium text-slate-400 pb-3">Stato</th>
                <th className="text-right text-sm font-medium text-slate-400 pb-3">Azioni</th>
              </tr>
            </thead>
            <tbody>
              {mockInvoices.map((inv) => (
                <tr key={inv.id} className="border-b border-[#334155] last:border-0">
                  <td className="py-3 text-sm text-white font-medium">{inv.id}</td>
                  <td className="py-3 text-sm text-slate-400">{inv.date}</td>
                  <td className="py-3 text-sm text-white">{inv.amount}</td>
                  <td className="py-3">
                    <span className="px-2.5 py-0.5 bg-emerald-500/10 text-emerald-400 rounded-full text-xs font-semibold">
                      {inv.status}
                    </span>
                  </td>
                  <td className="py-3 text-right">
                    <button className="text-sm text-primary-400 hover:underline font-medium">
                      Scarica
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-sm text-slate-500">Nessuna fattura disponibile.</p>
        )}
      </div>
    </div>
  )
}
