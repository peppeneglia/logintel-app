import { Outlet } from 'react-router-dom'
import { Sidebar } from '../layout/Sidebar'
import type { SidebarItem } from '../layout/Sidebar'
import { Map, Truck, FileBarChart, Sprout, TrendingDown } from 'lucide-react'

const sidebarItems: SidebarItem[] = [
  { label: 'Emissioni per Rotta', path: '/carbon-intelligence/routes', icon: Map },
  { label: 'Emissioni per Veicolo', path: '/carbon-intelligence/vehicles', icon: Truck },
  { label: 'Report ESG', path: '/carbon-intelligence/esg', icon: FileBarChart },
  { label: 'Ottimizzazione CO2', path: '/carbon-intelligence/optimization', icon: Sprout },
  { label: 'Storico Emissioni', path: '/carbon-intelligence/history', icon: TrendingDown },
]

export function CarbonIntelligencePage() {
  return (
    <div className="flex flex-1 min-h-0 gap-3">
      <Sidebar items={sidebarItems} />
      <div className="flex-1 overflow-y-auto pl-8 pr-11 -mr-3 pb-3">
        <Outlet />
      </div>
    </div>
  )
}
