import { mockDeliveryWindows } from '../../../data/mockDeliveryData'

function WindowStatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; style: string }> = {
    confirmed: { label: 'Confermata', style: 'bg-emerald-500/10 text-emerald-400' },
    at_risk: { label: 'A rischio', style: 'bg-amber-500/10 text-amber-400' },
    missed: { label: 'Mancata', style: 'bg-red-500/10 text-red-400' },
  }

  const { label, style } = config[status] ?? { label: status, style: 'bg-slate-500/10 text-slate-400' }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${style}`}>
      {label}
    </span>
  )
}

export function DeliveryWindows() {
  return (
    <div>
      <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-400 to-cyan-500 bg-clip-text text-transparent mb-3">Finestre di Consegna</h1>

      <div className="bg-[#1e293b] rounded-2xl border border-[#334155] p-6">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#334155]">
                <th className="text-left py-3 px-3 font-medium text-slate-400">Cliente</th>
                <th className="text-left py-3 px-3 font-medium text-slate-400">Indirizzo</th>
                <th className="text-left py-3 px-3 font-medium text-slate-400">Finestra</th>
                <th className="text-left py-3 px-3 font-medium text-slate-400">Arrivo stimato</th>
                <th className="text-left py-3 px-3 font-medium text-slate-400">Veicolo</th>
                <th className="text-left py-3 px-3 font-medium text-slate-400">Stato</th>
              </tr>
            </thead>
            <tbody>
              {mockDeliveryWindows.map((w) => (
                <tr key={w.id} className="border-b border-[#334155]">
                  <td className="py-3 px-3 text-white font-medium">{w.client}</td>
                  <td className="py-3 px-3 text-slate-300">{w.address}</td>
                  <td className="py-3 px-3 text-slate-400">{w.windowStart} - {w.windowEnd}</td>
                  <td className="py-3 px-3 text-white font-medium">{w.estimatedArrival}</td>
                  <td className="py-3 px-3 text-slate-400">{w.vehiclePlate}</td>
                  <td className="py-3 px-3"><WindowStatusBadge status={w.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
