import { mockEmissionsHistory } from '../../data/mockCarbonData'

export function EmissionsHistory() {
  return (
    <div>
      <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-400 to-cyan-500 bg-clip-text text-transparent mb-3">Storico Emissioni</h1>

      <div className="bg-[#1e293b] rounded-2xl border border-[#334155] p-6">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#334155]">
                <th className="text-left py-3 px-3 font-medium text-slate-400">Mese</th>
                <th className="text-right py-3 px-3 font-medium text-slate-400">CO2 (ton)</th>
                <th className="text-right py-3 px-3 font-medium text-slate-400">Target (ton)</th>
                <th className="text-right py-3 px-3 font-medium text-slate-400">Delta (ton)</th>
                <th className="text-center py-3 px-3 font-medium text-slate-400">Stato</th>
                <th className="text-left py-3 px-3 font-medium text-slate-400">Indicatore</th>
              </tr>
            </thead>
            <tbody>
              {mockEmissionsHistory.map((entry) => {
                const delta = entry.co2Tons - entry.target
                const isAbove = delta > 0
                const maxVal = Math.max(...mockEmissionsHistory.map((e) => Math.max(e.co2Tons, e.target)))

                return (
                  <tr key={entry.month} className="border-b border-[#334155] last:border-b-0">
                    <td className="py-3 px-3 text-white font-medium">{entry.month}</td>
                    <td className="py-3 px-3 text-slate-300 text-right">{entry.co2Tons.toFixed(1)}</td>
                    <td className="py-3 px-3 text-slate-300 text-right">{entry.target.toFixed(1)}</td>
                    <td className="py-3 px-3 text-right">
                      <span className={isAbove ? 'text-red-400 font-medium' : 'text-emerald-400 font-medium'}>
                        {isAbove ? '+' : ''}{delta.toFixed(1)}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        isAbove ? 'bg-red-500/10 text-red-400' : 'bg-emerald-500/10 text-emerald-400'
                      }`}>
                        {isAbove ? 'Sopra target' : 'Sotto target'}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-[#334155] rounded-full overflow-hidden min-w-[100px]">
                          <div
                            className={`h-full rounded-full ${isAbove ? 'bg-red-500/70' : 'bg-emerald-500/70'}`}
                            style={{ width: `${(entry.co2Tons / maxVal) * 100}%` }}
                          />
                        </div>
                        <div
                          className="w-0.5 h-4 bg-slate-400"
                          title={`Target: ${entry.target} ton`}
                          style={{ marginLeft: `calc(${(entry.target / maxVal) * 100}% - ${(entry.co2Tons / maxVal) * 100}% - 4px)` }}
                        />
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Summary */}
        <div className="mt-6 pt-4 border-t border-[#334155]">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-slate-400 mb-1">Media emissioni</p>
              <p className="text-lg font-semibold text-white">
                {(mockEmissionsHistory.reduce((s, e) => s + e.co2Tons, 0) / mockEmissionsHistory.length).toFixed(1)} ton/mese
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-400 mb-1">Mesi sotto target</p>
              <p className="text-lg font-semibold text-emerald-400">
                {mockEmissionsHistory.filter((e) => e.co2Tons <= e.target).length} / {mockEmissionsHistory.length}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-400 mb-1">Trend ultimi 6 mesi</p>
              <p className="text-lg font-semibold text-emerald-400">
                -{(mockEmissionsHistory[0].co2Tons - mockEmissionsHistory[mockEmissionsHistory.length - 1].co2Tons).toFixed(1)} ton
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
