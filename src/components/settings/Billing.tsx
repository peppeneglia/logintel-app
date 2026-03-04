import { mockInvoices } from '../../data/mockData'

export function Billing() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-3">Fatturazione</h1>

      {/* Payment method */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-3">
        <h2 className="text-lg font-semibold text-white mb-3">Metodo di pagamento</h2>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-300">
            Visa &bull;&bull;&bull;&bull; 4242 — Scade 12/2027
          </span>
          <button className="px-4 py-2 border border-gray-700 rounded-xl text-sm font-medium text-gray-300 hover:bg-gray-800 transition-colors">
            Modifica
          </button>
        </div>
      </div>

      {/* Invoice history */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Storico fatture</h2>
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-800">
              <th className="text-left text-sm font-medium text-gray-400 pb-3">Numero</th>
              <th className="text-left text-sm font-medium text-gray-400 pb-3">Periodo</th>
              <th className="text-left text-sm font-medium text-gray-400 pb-3">Importo</th>
              <th className="text-left text-sm font-medium text-gray-400 pb-3">Stato</th>
              <th className="text-right text-sm font-medium text-gray-400 pb-3">Azioni</th>
            </tr>
          </thead>
          <tbody>
            {mockInvoices.map((inv) => (
              <tr key={inv.id} className="border-b border-gray-800 last:border-0">
                <td className="py-3 text-sm text-white font-medium">{inv.id}</td>
                <td className="py-3 text-sm text-gray-400">{inv.date}</td>
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
      </div>
    </div>
  )
}
