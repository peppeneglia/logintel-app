import { Outlet } from 'react-router-dom'
import { Sidebar } from '../../../app/Sidebar'
import { Target, CalendarDays, ArrowLeftRight, BarChart3, History } from 'lucide-react'
import type { SidebarItem } from '../../../app/Sidebar'

const sidebarItems: SidebarItem[] = [
  { label: 'Predizione Singola', path: '/route-intelligence/single', icon: Target },
  { label: 'Piano Settimanale', path: '/route-intelligence/weekly', icon: CalendarDays },
  { label: 'Confronta Percorsi', path: '/route-intelligence/compare', icon: ArrowLeftRight },
  { label: 'Report ETA', path: '/route-intelligence/report', icon: BarChart3 },
  { label: 'Storico Predizioni', path: '/route-intelligence/history', icon: History },
]

export function RouteIntelligencePage() {
  return (
    <div className="flex flex-1 min-h-0 gap-3">
      <Sidebar items={sidebarItems} />
      <div className="flex-1 overflow-y-auto pl-8 pr-11 -mr-3 pb-3">
        <Outlet />
      </div>
    </div>
  )
}
