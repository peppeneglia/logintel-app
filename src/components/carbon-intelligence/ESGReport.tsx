import { mockESGMetrics, mockEmissionsHistory } from '../../data/mockCarbonData'

export function ESGReport() {
  const metrics = mockESGMetrics
  const currentVsTarget = ((metrics.totalEmissionsTons / metrics.targetTons) * 100).toFixed(1)

  const maxTons = Math.max(...mockEmissionsHistory.map((m) => Math.max(m.co2Tons, m.target)))

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-3">Report ESG</h1>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-3">
        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-4">
          <p className="text-xs text-gray-400">Emissioni totali</p>
          <p className="text-xl font-bold text-white">{metrics.totalEmissionsTons} <span className="text-lg text-gray-400">ton</span></p>
        </div>
        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-4">
          <p className="text-xs text-gray-400">Riduzione YoY</p>
          <p className="text-xl font-bold text-emerald-400">-{metrics.reductionPercent}%</p>
        </div>
        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-4">
          <p className="text-xs text-gray-400">Target annuale</p>
          <p className="text-xl font-bold text-white">{metrics.targetTons} <span className="text-lg text-gray-400">ton</span></p>
        </div>
        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-4">
          <p className="text-xs text-gray-400">Efficienza flotta</p>
          <p className="text-xl font-bold text-white">{metrics.fleetEfficiency} <span className="text-lg text-gray-400">kg/km</span></p>
        </div>
        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-4">
          <p className="text-xs text-gray-400">Viaggi green</p>
          <p className="text-xl font-bold text-emerald-400">{metrics.greenTripsPercent}%</p>
        </div>
      </div>

      {/* Progress bar toward target */}
      <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6 mb-3">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-white">Progresso verso target</h2>
          <span className="text-sm text-gray-400">
            {metrics.totalEmissionsTons} / {metrics.targetTons} ton ({currentVsTarget}%)
          </span>
        </div>
        <div className="w-full bg-gray-800 rounded-full h-4 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${
              metrics.totalEmissionsTons <= metrics.targetTons ? 'bg-emerald-500' : 'bg-amber-500'
            }`}
            style={{ width: `${Math.min(100, (metrics.totalEmissionsTons / metrics.targetTons) * 100)}%` }}
          />
        </div>
        <div className="flex justify-between mt-2">
          <span className="text-xs text-gray-400">0 ton</span>
          <span className="text-xs text-gray-400">{metrics.targetTons} ton (target)</span>
        </div>
        {metrics.totalEmissionsTons > metrics.targetTons ? (
          <p className="text-sm text-amber-400 mt-3">
            Superamento target di {(metrics.totalEmissionsTons - metrics.targetTons).toFixed(1)} tonnellate.
            Necessario ridurre di {(((metrics.totalEmissionsTons - metrics.targetTons) / metrics.totalEmissionsTons) * 100).toFixed(1)}% per rientrare.
          </p>
        ) : (
          <p className="text-sm text-emerald-400 mt-3">
            Sotto il target di {(metrics.targetTons - metrics.totalEmissionsTons).toFixed(1)} tonnellate. Ottimo lavoro!
          </p>
        )}
      </div>

      {/* Monthly comparison chart */}
      <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
        <h2 className="text-base font-semibold text-white mb-4">Confronto mensile emissioni vs target</h2>
        <div className="space-y-4">
          {mockEmissionsHistory.map((entry) => {
            const actualWidth = (entry.co2Tons / maxTons) * 100
            const targetWidth = (entry.target / maxTons) * 100
            const isAbove = entry.co2Tons > entry.target

            return (
              <div key={entry.month}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm text-gray-300 w-24 shrink-0">{entry.month}</span>
                  <div className="flex items-center gap-3 text-xs">
                    <span className={isAbove ? 'text-red-400' : 'text-emerald-400'}>
                      {entry.co2Tons} ton
                    </span>
                    <span className="text-gray-500">target: {entry.target} ton</span>
                  </div>
                </div>
                <div className="relative">
                  {/* Target bar (background) */}
                  <div
                    className="h-3 bg-gray-700 rounded-full"
                    style={{ width: `${targetWidth}%` }}
                  />
                  {/* Actual bar (overlay) */}
                  <div
                    className={`absolute top-0 h-3 rounded-full ${isAbove ? 'bg-red-500/70' : 'bg-emerald-500/70'}`}
                    style={{ width: `${actualWidth}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
        <div className="flex items-center gap-6 mt-4 pt-4 border-t border-gray-800">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-emerald-500/70" />
            <span className="text-xs text-gray-400">Emissioni (sotto target)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500/70" />
            <span className="text-xs text-gray-400">Emissioni (sopra target)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gray-700" />
            <span className="text-xs text-gray-400">Target</span>
          </div>
        </div>
      </div>
    </div>
  )
}
