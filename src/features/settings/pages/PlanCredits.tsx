import { useState } from 'react'
import { useAuthStore } from '../../../stores/authStore'
import { mockCreditUsage } from '../../../data/mockData'
import { UpgradePlanModal } from '../../../components/UpgradePlanModal'
import { BuyCreditsModal } from '../../../components/BuyCreditsModal'

const planNames: Record<string, string> = {
  free: 'Free',
  pro: 'Pro',
  team: 'Team',
  enterprise: 'Enterprise',
}

const planLimits: Record<string, string> = {
  free: '500 crediti/giorno',
  pro: '5.000 crediti/giorno',
  team: '10.000 crediti/giorno',
  enterprise: 'Illimitati',
}

const planPrices: Record<string, string> = {
  free: 'Gratuito',
  pro: '€49/mese',
  team: '€39/utente/mese (min 3)',
  enterprise: 'Su misura',
}

function creditBarColor(pct: number): string {
  if (pct > 50) return 'bg-emerald-500'
  if (pct > 20) return 'bg-amber-500'
  return 'bg-red-500'
}

export function PlanCredits() {
  const { profile, isDemo } = useAuthStore()

  const plan = profile?.plan || 'free'
  const creditsRemaining = (profile as Record<string, unknown>)?.credits_remaining as number ?? 500
  const dailyLimit = (profile as Record<string, unknown>)?.credits_daily_limit as number ?? 500
  const extraCredits = (profile as Record<string, unknown>)?.extra_credits as number ?? 0
  const totalAvailable = creditsRemaining + extraCredits
  const usedToday = dailyLimit - creditsRemaining
  const pct = dailyLimit > 0 ? (creditsRemaining / dailyLimit) * 100 : 0

  const [upgradeOpen, setUpgradeOpen] = useState(false)
  const [buyCreditsOpen, setBuyCreditsOpen] = useState(false)

  return (
    <div>
      <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-400 to-cyan-500 bg-clip-text text-transparent mb-3">Piano e Crediti</h1>

      {/* Current plan */}
      <div className="bg-[#1e293b] border border-[#334155] rounded-2xl p-6 mb-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">Piano {planNames[plan] || plan}</h2>
            <p className="text-slate-400 text-sm">{planPrices[plan] || 'Gratuito'}</p>
            <p className="text-slate-500 text-xs mt-1">{planLimits[plan]}</p>
          </div>
          <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-full text-xs font-semibold">
            Attivo
          </span>
        </div>
      </div>

      {/* Credits today */}
      <div className="bg-[#1e293b] border border-[#334155] rounded-2xl p-6 mb-3">
        <h2 className="text-lg font-semibold text-white mb-4">Crediti oggi</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
          <div>
            <p className="text-xs text-slate-400">Disponibili</p>
            <p className="text-xl font-bold text-white">{totalAvailable.toLocaleString('it-IT')}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400">Usati oggi</p>
            <p className="text-xl font-bold text-slate-300">{usedToday.toLocaleString('it-IT')}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400">Limite giornaliero</p>
            <p className="text-xl font-bold text-slate-300">{dailyLimit.toLocaleString('it-IT')}</p>
          </div>
        </div>
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-slate-400">{creditsRemaining.toLocaleString('it-IT')} / {dailyLimit.toLocaleString('it-IT')} giornalieri rimanenti</span>
          <span className="font-medium text-white">{Math.round(pct)}%</span>
        </div>
        <div className="w-full h-3 bg-slate-600 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${creditBarColor(pct)}`}
            style={{ width: `${pct}%` }}
          />
        </div>
        {extraCredits > 0 && (
          <p className="text-xs text-cyan-400 mt-2">
            + {extraCredits.toLocaleString('it-IT')} crediti extra disponibili
          </p>
        )}
      </div>

      {/* Usage history — only in demo */}
      {isDemo && (
        <div className="bg-[#1e293b] border border-[#334155] rounded-2xl p-6 mb-3">
          <h2 className="text-lg font-semibold text-white mb-4">Storico consumi</h2>
          <div className="space-y-3">
            {mockCreditUsage.map((entry) => (
              <div key={entry.month} className="flex items-center gap-3">
                <span className="text-sm text-slate-400 w-24">{entry.month}</span>
                <div className="flex-1 h-5 bg-[#334155] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary-500 rounded-full transition-all"
                    style={{ width: `${(entry.used / dailyLimit) * 100}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-white w-10 text-right">
                  {entry.used}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center gap-3">
        <button
          onClick={() => setUpgradeOpen(true)}
          className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-700 text-white rounded-xl text-sm font-medium hover:from-emerald-600 hover:to-emerald-800 transition-colors"
        >
          Upgrade piano
        </button>
        <button
          onClick={() => setBuyCreditsOpen(true)}
          className="px-5 py-2.5 border border-slate-600 text-slate-300 rounded-xl text-sm font-medium hover:bg-[#334155] transition-colors"
        >
          Acquista crediti extra
        </button>
      </div>

      <UpgradePlanModal open={upgradeOpen} onClose={() => setUpgradeOpen(false)} />
      <BuyCreditsModal open={buyCreditsOpen} onClose={() => setBuyCreditsOpen(false)} />
    </div>
  )
}
