import { mockComplianceScores } from '../../../data/mockComplianceData'

const statusColor: Record<string, string> = {
  good: 'bg-emerald-500',
  attention: 'bg-amber-500',
  critical: 'bg-red-500',
}

const statusTrack: Record<string, string> = {
  good: 'bg-emerald-500/20',
  attention: 'bg-amber-500/20',
  critical: 'bg-red-500/20',
}

const statusBadge: Record<string, string> = {
  good: 'bg-emerald-500/10 text-emerald-400',
  attention: 'bg-amber-500/10 text-amber-400',
  critical: 'bg-red-500/10 text-red-400',
}

const statusLabel: Record<string, string> = {
  good: 'Buono',
  attention: 'Attenzione',
  critical: 'Critico',
}

export function ComplianceReport() {
  const totalScore = mockComplianceScores.reduce((sum, s) => sum + s.score, 0)
  const totalMax = mockComplianceScores.reduce((sum, s) => sum + s.maxScore, 0)
  const overallPercentage = Math.round((totalScore / totalMax) * 100)

  const overallStatus =
    overallPercentage >= 85 ? 'good' : overallPercentage >= 70 ? 'attention' : 'critical'

  return (
    <div>
      <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-400 to-cyan-500 bg-clip-text text-transparent mb-3">Report Conformità</h1>

      {/* Overall score */}
      <div className="bg-[#1e293b] rounded-2xl border border-[#334155] p-4 mb-3">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs text-slate-400">Conformità complessiva</p>
            <p className="text-4xl font-bold text-white">{overallPercentage}%</p>
          </div>
          <span className={`inline-block px-3 py-1.5 rounded-full text-sm font-medium ${statusBadge[overallStatus]}`}>
            {statusLabel[overallStatus]}
          </span>
        </div>
        <div className={`w-full h-3 rounded-full ${statusTrack[overallStatus]}`}>
          <div
            className={`h-3 rounded-full transition-all ${statusColor[overallStatus]}`}
            style={{ width: `${overallPercentage}%` }}
          />
        </div>
      </div>

      {/* Category scores */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {mockComplianceScores.map((item) => {
          const pct = Math.round((item.score / item.maxScore) * 100)
          return (
            <div key={item.category} className="bg-[#1e293b] rounded-2xl border border-[#334155] p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-white">{item.category}</h3>
                <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${statusBadge[item.status]}`}>
                  {statusLabel[item.status]}
                </span>
              </div>
              <div className="flex items-end gap-2 mb-3">
                <span className="text-lg font-bold text-white">{item.score}</span>
                <span className="text-sm text-slate-400 mb-0.5">/ {item.maxScore}</span>
              </div>
              <div className={`w-full h-2 rounded-full ${statusTrack[item.status]}`}>
                <div
                  className={`h-2 rounded-full transition-all ${statusColor[item.status]}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
