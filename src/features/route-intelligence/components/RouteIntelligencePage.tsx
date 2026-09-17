import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from '../../../app/Sidebar'
import { Target, CalendarDays, ArrowLeftRight, BarChart3, History, Menu } from 'lucide-react'
import type { SidebarItem } from '../../../app/Sidebar'

const sidebarItems: SidebarItem[] = [
  { label: 'Predizione Singola', path: '/route-intelligence/single', icon: Target },
  { label: 'Piano Settimanale', path: '/route-intelligence/weekly', icon: CalendarDays },
  { label: 'Confronta Percorsi', path: '/route-intelligence/compare', icon: ArrowLeftRight },
  { label: 'Report ETA', path: '/route-intelligence/report', icon: BarChart3 },
  { label: 'Storico Predizioni', path: '/route-intelligence/history', icon: History },
]

export function RouteIntelligencePage() {
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
