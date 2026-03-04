import { mockETAAccuracy } from '../../data/mockDeliveryData'

export function ETAAccuracy() {
  const totalPredictions = mockETAAccuracy.reduce((sum, r) => sum + r.totalPredictions, 0)
  const weightedError = mockETAAccuracy.reduce((sum, r) => sum + r.avgErrorMinutes * r.totalPredictions, 0)
  const avgError = totalPredictions > 0 ? (weightedError / totalPredictions).toFixed(1) : '0'

  const weightedAccuracy = mockETAAccuracy.reduce((sum, r) => sum + r.accuracyPercent * r.totalPredictions, 0)
  const avgAccuracy = totalPredictions > 0 ? Math.round(weightedAccuracy / totalPredictions) : 0

  const weightedW5 = mockETAAccuracy.reduce((sum, r) => sum + r.within5min * r.totalPredictions, 0)
  const avgW5 = totalPredictions > 0 ? Math.round(weightedW5 / totalPredictions) : 0

  const weightedW15 = mockETAAccuracy.reduce((sum, r) => sum + r.within15min * r.totalPredictions, 0)
  const avgW15 = totalPredictions > 0 ? Math.round(weightedW15 / totalPredictions) : 0

  const summaryCards = [
    { label: 'Media errore', value: `${avgError} min`, color: 'text-amber-400' },
    { label: 'Accuracy', value: `${avgAccuracy}%`, color: 'text-emerald-400' },
    { label: 'Entro 5 min', value: `${avgW5}%`, color: 'text-white' },
    { label: 'Entro 15 min', value: `${avgW15}%`, color: 'text-white' },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-3">ETA Accuracy</h1>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
        {summaryCards.map((card) => (
          <div key={card.label} className="bg-gray-900 rounded-2xl border border-gray-800 p-4">
            <p className="text-xs text-gray-400">{card.label}</p>
            <p className={`text-lg font-bold ${card.color}`}>{card.value}</p>
          </div>
        ))}
      </div>

      {/* Per-route table */}
      <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
        <h2 className="text-sm font-semibold text-gray-300 mb-4">Accuracy per rotta</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left py-3 px-3 font-medium text-gray-400">Rotta</th>
                <th className="text-left py-3 px-3 font-medium text-gray-400">Predizioni</th>
                <th className="text-left py-3 px-3 font-medium text-gray-400">Errore medio</th>
                <th className="text-left py-3 px-3 font-medium text-gray-400">Accuracy</th>
                <th className="text-left py-3 px-3 font-medium text-gray-400">Entro 5 min</th>
                <th className="text-left py-3 px-3 font-medium text-gray-400">Entro 15 min</th>
              </tr>
            </thead>
            <tbody>
              {mockETAAccuracy.map((r) => (
                <tr key={r.route} className="border-b border-gray-800">
                  <td className="py-3 px-3 text-white font-medium">{r.route}</td>
                  <td className="py-3 px-3 text-gray-300">{r.totalPredictions}</td>
                  <td className="py-3 px-3">
                    <span className={`font-semibold ${r.avgErrorMinutes <= 5 ? 'text-emerald-400' : r.avgErrorMinutes <= 10 ? 'text-amber-400' : 'text-red-400'}`}>
                      {r.avgErrorMinutes} min
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <span className={`font-semibold ${r.accuracyPercent >= 85 ? 'text-emerald-400' : r.accuracyPercent >= 70 ? 'text-amber-400' : 'text-red-400'}`}>
                      {r.accuracyPercent}%
                    </span>
                  </td>
                  <td className="py-3 px-3 text-gray-300">{r.within5min}%</td>
                  <td className="py-3 px-3 text-gray-300">{r.within15min}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
