import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from '../../../app/Sidebar'
import type { SidebarItem } from '../../../app/Sidebar'
import { Map, Truck, FileBarChart, Sprout, TrendingDown, Menu } from 'lucide-react'

const sidebarItems: SidebarItem[] = [
  { label: 'Emissioni per Rotta', path: '/carbon-intelligence/routes', icon: Map },
  { label: 'Emissioni per Veicolo', path: '/carbon-intelligence/vehicles', icon: Truck },
  { label: 'Report ESG', path: '/carbon-intelligence/esg', icon: FileBarChart },
  { label: 'Ottimizzazione CO2', path: '/carbon-intelligence/optimization', icon: Sprout },
  { label: 'Storico Emissioni', path: '/carbon-intelligence/history', icon: TrendingDown },
]

export function CarbonIntelligencePage() {
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
