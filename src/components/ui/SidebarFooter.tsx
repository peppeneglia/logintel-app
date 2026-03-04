import { useNavigate } from 'react-router-dom'
import { Bell, Settings, CreditCard } from 'lucide-react'

export function SidebarFooter() {
  const navigate = useNavigate()

  return (
    <div className="mt-auto p-3 flex flex-col gap-2">
      <div className="bg-gray-800 rounded-xl p-2 flex items-center">
        <button
          onClick={() => navigate('/settings')}
          className="flex-1 flex items-center gap-2 px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-colors text-sm font-medium"
          title="Impostazioni"
        >
          <Settings size={18} />
          <span>Impostazioni</span>
        </button>
        <button
          onClick={() => navigate('/settings/plan')}
          className="p-2 text-gray-400 hover:text-gray-200 hover:bg-gray-700 rounded-lg transition-colors"
          title="Piano e Crediti"
        >
          <CreditCard size={16} />
        </button>
        <button
          onClick={() => navigate('/settings/notifications')}
          className="relative p-2 text-gray-400 hover:text-gray-200 hover:bg-gray-700 rounded-lg transition-colors"
          title="Notifiche"
        >
          <Bell size={16} />
          <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-primary-400 rounded-full" />
        </button>
      </div>

      <div
        className="bg-gray-800 rounded-xl p-3 flex items-center justify-center gap-3 cursor-pointer hover:bg-gray-700 transition-colors"
        onClick={() => navigate('/settings/profile')}
      >
        <img
          src="https://i.pravatar.cc/36?u=francesco-moretti"
          alt="Francesco Moretti"
          className="w-9 h-9 rounded-full shrink-0"
        />
        <div>
          <div className="text-sm font-medium text-white leading-tight">Francesco Moretti</div>
          <div className="text-xs text-gray-400 leading-tight">Logistica Moretti S.r.l.</div>
        </div>
      </div>
    </div>
  )
}
