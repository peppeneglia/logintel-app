import { useNavigate } from 'react-router-dom'
import { Bell, Settings, CreditCard, LogOut } from 'lucide-react'
import { useAuthStore } from '../stores/authStore'

export function SidebarFooter() {
  const navigate = useNavigate()
  const { profile, signOut } = useAuthStore()

  const handleSignOut = async () => {
    await signOut()
    navigate('/login', { replace: true })
  }

  const displayName = profile?.name || 'Utente'
  const displayCompany = profile?.company || ''
  const initials = displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <div className="mt-auto p-3 flex flex-col gap-2">
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
          onClick={() => navigate('/settings/plan')}
          className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-600 rounded-lg transition-colors"
          title="Piano e Crediti"
        >
          <CreditCard size={16} />
        </button>
        <button
          onClick={() => navigate('/settings/notifications')}
          className="relative p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-600 rounded-lg transition-colors"
          title="Notifiche"
        >
          <Bell size={16} />
          <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-primary-400 rounded-full" />
        </button>
        <button
          onClick={handleSignOut}
          className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-600 rounded-lg transition-colors"
          title="Esci"
        >
          <LogOut size={16} />
        </button>
      </div>

      <div
        className="bg-[#334155] rounded-xl p-3 flex items-center justify-center gap-3 cursor-pointer hover:bg-slate-600 transition-colors"
        onClick={() => navigate('/settings/profile')}
      >
        {profile?.avatar_url ? (
          <img
            src={profile.avatar_url}
            alt={displayName}
            className="w-9 h-9 rounded-full shrink-0"
          />
        ) : (
          <div className="w-9 h-9 rounded-full shrink-0 bg-primary-500/20 flex items-center justify-center">
            <span className="text-xs font-semibold text-primary-400">{initials}</span>
          </div>
        )}
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
