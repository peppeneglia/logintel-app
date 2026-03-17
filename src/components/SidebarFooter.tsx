import { useNavigate } from 'react-router-dom'
import { Bell, Settings, LogOut } from 'lucide-react'
import { useAuthStore } from '../stores/authStore'
import { useCredits } from '../hooks/useCredits'

function creditBarColor(pct: number): string {
  if (pct > 50) return 'bg-emerald-500'
  if (pct > 20) return 'bg-amber-500'
  return 'bg-red-500'
}

export function SidebarFooter() {
  const navigate = useNavigate()
  const { profile, signOut, isDemo } = useAuthStore()
  const { creditsRemaining, dailyLimit, extraCredits } = useCredits()

  const handleSignOut = async () => {
    await signOut()
    navigate('/login', { replace: true })
  }

  const displayName = profile ? `${profile.first_name} ${profile.last_name}`.trim() || 'Utente' : 'Utente'
  const displayCompany = profile?.company || ''
  const initials = displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  const pct = dailyLimit > 0 ? (creditsRemaining / dailyLimit) * 100 : 0

  return (
    <div className="mt-auto p-3 flex flex-col gap-2">
      {/* Credit counter */}
      <button
        onClick={() => navigate('/settings/plan')}
        className="bg-[#334155] rounded-xl px-3 py-2.5 hover:bg-slate-600 transition-colors text-left"
      >
        {isDemo ? (
          <>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs text-slate-400">Modalità demo</span>
              <span className="text-xs font-medium text-white">442 / 500</span>
            </div>
            <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
              <div className="h-full rounded-full bg-emerald-500" style={{ width: '88%' }} />
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs text-slate-400">Crediti oggi</span>
              <span className="text-xs font-medium text-white">
                {creditsRemaining.toLocaleString('it-IT')} / {dailyLimit.toLocaleString('it-IT')}
              </span>
            </div>
            <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${creditBarColor(pct)}`}
                style={{ width: `${Math.min(100, pct)}%` }}
              />
            </div>
            {extraCredits > 0 && (
              <div className="mt-1 text-[10px] text-cyan-400">
                + {extraCredits.toLocaleString('it-IT')} extra
              </div>
            )}
          </>
        )}
      </button>

      {/* Action buttons */}
      <div className="bg-[#334155] rounded-xl p-2 flex items-center">
        <button
          onClick={() => navigate('/settings')}
          className="flex-1 flex items-center gap-2 px-3 py-2 text-slate-300 hover:text-white hover:bg-slate-600 rounded-lg transition-colors text-sm font-medium"
          title="Impostazioni"
        >
          <Settings size={18} />
          <span>Impostazioni</span>
        </button>
        <button
          onClick={() => navigate('/settings/notifications')}
          className="relative p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-600 rounded-lg transition-colors"
          title="Notifiche"
        >
          <Bell size={16} />
          {isDemo && <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-primary-400 rounded-full" />}
        </button>
        <button
          onClick={handleSignOut}
          className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-600 rounded-lg transition-colors"
          title={isDemo ? 'Esci dalla demo' : 'Esci'}
        >
          <LogOut size={16} />
        </button>
      </div>

      {/* User profile */}
      <div
        className="bg-[#334155] rounded-xl p-3 flex items-center justify-center gap-3 cursor-pointer hover:bg-slate-600 transition-colors"
        onClick={() => navigate('/settings/profile')}
      >
        <div className="w-9 h-9 rounded-full shrink-0 bg-primary-500/20 flex items-center justify-center">
          <span className="text-xs font-semibold text-primary-400">{initials}</span>
        </div>
        <div>
          <div className="text-sm font-medium text-white leading-tight">{displayName}</div>
          {displayCompany && (
            <div className="text-xs text-slate-400 leading-tight">{displayCompany}</div>
          )}
        </div>
      </div>
    </div>
  )
}
