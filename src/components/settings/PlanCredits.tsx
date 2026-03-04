import { mockUser, mockCreditUsage } from '../../data/mockData'

export function PlanCredits() {
  const remaining = mockUser.creditsTotal - mockUser.creditsUsed
  const pct = (mockUser.creditsUsed / mockUser.creditsTotal) * 100

  return (
    <div>
      <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-400 to-cyan-500 bg-clip-text text-transparent mb-3">Piano e Crediti</h1>

      {/* Current plan */}
      <div className="bg-[#1e293b] border border-[#334155] rounded-2xl p-6 mb-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">Piano Pro</h2>
            <p className="text-slate-400 text-sm">&euro;79/mese</p>
          </div>
          <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-full text-xs font-semibold">
            Attivo
          </span>
        </div>
      </div>

      {/* Credits */}
      <div className="bg-[#1e293b] border border-[#334155] rounded-2xl p-6 mb-3">
        <h2 className="text-lg font-semibold text-white mb-4">Crediti questo mese</h2>
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-slate-400">{mockUser.creditsUsed}/{mockUser.creditsTotal} utilizzati</span>
          <span className="font-medium text-white">{remaining} rimanenti</span>
        </div>
        <div className="w-full h-3 bg-slate-600 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary-500 rounded-full transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* Usage history */}
      <div className="bg-[#1e293b] border border-[#334155] rounded-2xl p-6 mb-3">
        <h2 className="text-lg font-semibold text-white mb-4">Storico consumi</h2>
        <div className="space-y-3">
          {mockCreditUsage.map((entry) => (
            <div key={entry.month} className="flex items-center gap-3">
              <span className="text-sm text-slate-400 w-24">{entry.month}</span>
              <div className="flex-1 h-5 bg-[#334155] rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary-500 rounded-full transition-all"
                  style={{ width: `${(entry.used / mockUser.creditsTotal) * 100}%` }}
                />
              </div>
              <span className="text-sm font-medium text-white w-10 text-right">
                {entry.used}
              </span>
            </div>
          ))}
        </div>
      </div>

      <button className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-700 text-white rounded-xl text-sm font-medium hover:from-emerald-600 hover:to-emerald-800 transition-colors">
        Upgrade piano
      </button>
    </div>
  )
}
