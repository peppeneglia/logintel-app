import { Outlet } from 'react-router-dom'
import { Sidebar } from '../../../app/Sidebar'
import type { SidebarItem } from '../../../app/Sidebar'
import { TrendingUp, Calculator, PieChart, BarChart3, Receipt } from 'lucide-react'

const sidebarItems: SidebarItem[] = [
  { label: 'Marginalità per Rotta', path: '/finance-intelligence/margins', icon: TrendingUp },
  { label: 'Costi per Km', path: '/finance-intelligence/costs', icon: Calculator },
  { label: 'Profittabilità Clienti', path: '/finance-intelligence/profitability', icon: PieChart },
  { label: 'Budget & Forecast', path: '/finance-intelligence/budget', icon: BarChart3 },
  { label: 'Penali & Fatturazione', path: '/finance-intelligence/penalties', icon: Receipt },
]

export function FinanceIntelligencePage() {
  return (
    <div className="flex flex-1 min-h-0 gap-3">
      <Sidebar items={sidebarItems} />
      <div className="flex-1 overflow-y-auto pl-8 pr-11 -mr-3 pb-3">
        <Outlet />
      </div>
    </div>
  )
}
