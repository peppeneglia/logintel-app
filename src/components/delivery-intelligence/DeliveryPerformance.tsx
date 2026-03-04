import { mockDeliveries } from '../../data/mockDeliveryData'

const statusLabel: Record<string, string> = {
  on_time: 'Puntuale',
  late: 'In ritardo',
  early: 'In anticipo',
  in_transit: 'In transito',
  pending: 'In attesa',
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    on_time: 'bg-emerald-500/10 text-emerald-400',
    early: 'bg-emerald-500/10 text-emerald-400',
    late: 'bg-red-500/10 text-red-400',
    in_transit: 'bg-amber-500/10 text-amber-400',
    pending: 'bg-gray-500/10 text-gray-400',
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status] ?? 'bg-gray-500/10 text-gray-400'}`}>
      {statusLabel[status] ?? status}
    </span>
  )
}

export function DeliveryPerformance() {
  const completed = mockDeliveries.filter((d) => d.status === 'on_time' || d.status === 'late' || d.status === 'early')
  const onTime = completed.filter((d) => d.status === 'on_time' || d.status === 'early')
  const late = completed.filter((d) => d.status === 'late')
  const avgDelay = late.length > 0
    ? Math.round(late.reduce((sum, d) => sum + (d.delayMinutes ?? 0), 0) / late.length)
    : 0

  const onTimePercent = completed.length > 0 ? Math.round((onTime.length / completed.length) * 100) : 0
  const latePercent = completed.length > 0 ? Math.round((late.length / completed.length) * 100) : 0

  const summaryCards = [
    { label: 'Totale consegne', value: mockDeliveries.length.toString(), color: 'text-white' },
    { label: 'Puntuali', value: `${onTimePercent}%`, color: 'text-emerald-400' },
    { label: 'In ritardo', value: `${latePercent}%`, color: 'text-red-400' },
    { label: 'Ritardo medio', value: `${avgDelay} min`, color: 'text-amber-400' },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-3">Performance Consegne</h1>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
        {summaryCards.map((card) => (
          <div key={card.label} className="bg-gray-900 rounded-2xl border border-gray-800 p-4">
            <p className="text-xs text-gray-400">{card.label}</p>
            <p className={`text-lg font-bold ${card.color}`}>{card.value}</p>
          </div>
        ))}
      </div>

      {/* Deliveries table */}
      <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
        <h2 className="text-sm font-semibold text-gray-300 mb-4">Consegne recenti</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left py-3 px-3 font-medium text-gray-400">Cliente</th>
                <th className="text-left py-3 px-3 font-medium text-gray-400">Rotta</th>
                <th className="text-left py-3 px-3 font-medium text-gray-400">Prevista</th>
                <th className="text-left py-3 px-3 font-medium text-gray-400">Effettiva</th>
                <th className="text-left py-3 px-3 font-medium text-gray-400">Stato</th>
                <th className="text-left py-3 px-3 font-medium text-gray-400">Ritardo</th>
              </tr>
            </thead>
            <tbody>
              {mockDeliveries.map((d) => (
                <tr key={d.id} className="border-b border-gray-800">
                  <td className="py-3 px-3 text-white font-medium">{d.client}</td>
                  <td className="py-3 px-3 text-gray-300">{d.origin} &rarr; {d.destination}</td>
                  <td className="py-3 px-3 text-gray-400">{d.scheduledDelivery}</td>
                  <td className="py-3 px-3 text-gray-400">{d.actualDelivery ?? '\u2014'}</td>
                  <td className="py-3 px-3"><StatusBadge status={d.status} /></td>
                  <td className="py-3 px-3">
                    {d.delayMinutes !== undefined ? (
                      <span className={`font-semibold ${d.delayMinutes <= 0 ? 'text-emerald-400' : d.delayMinutes <= 15 ? 'text-amber-400' : 'text-red-400'}`}>
                        {d.delayMinutes > 0 ? '+' : ''}{d.delayMinutes} min
                      </span>
                    ) : (
                      <span className="text-gray-500">&mdash;</span>
                    )}
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
