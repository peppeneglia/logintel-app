import { Outlet } from 'react-router-dom'
import { Sidebar } from '../layout/Sidebar'
import { Settings, User, Bell, CreditCard, Key, Users, Receipt } from 'lucide-react'
import type { SidebarItem } from '../layout/Sidebar'

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
  return (
    <div className="flex flex-1 min-h-0 gap-3">
      <Sidebar items={sidebarItems} />
      <div className="flex-1 overflow-y-auto pl-8 pr-11 -mr-3 pb-3">
        <Outlet />
      </div>
    </div>
  )
}
