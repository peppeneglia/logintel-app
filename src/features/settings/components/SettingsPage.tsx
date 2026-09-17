import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from '../../../app/Sidebar'
import { Settings, User, Bell, CreditCard, Key, Users, Receipt, Menu } from 'lucide-react'
import type { SidebarItem } from '../../../app/Sidebar'

const sidebarItems: SidebarItem[] = [
  { label: 'Generali', path: '/settings/general', icon: Settings },
  { label: 'Profilo', path: '/settings/profile', icon: User },
  { label: 'Notifiche', path: '/settings/notifications', icon: Bell },
  { label: 'Piano e Crediti', path: '/settings/plan', icon: CreditCard },
  { label: 'API Key', path: '/settings/apikey', icon: Key },
  { label: 'Team', path: '/settings/team', icon: Users },
  { label: 'Fatturazione', path: '/settings/billing', icon: Receipt },
]

export function SettingsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex flex-1 min-h-0 gap-3">
      <Sidebar items={sidebarItems} mobileOpen={sidebarOpen} onMobileClose={() => setSidebarOpen(false)} />
      <div className="flex-1 overflow-y-auto px-3 lg:pl-8 lg:pr-11 lg:-mr-3 pb-3">
        <button
          onClick={() => setSidebarOpen(true)}
          className="lg:hidden flex items-center gap-2 mb-3 px-3 py-2 text-sm text-slate-400 hover:text-slate-200 bg-[#1e293b] border border-[#334155] rounded-xl transition-colors"
        >
          <Menu size={16} />
          Menu
        </button>
        <Outlet />
      </div>
    </div>
  )
}
