import { Outlet } from 'react-router-dom'
import { Sidebar } from '../../../app/Sidebar'
import type { SidebarItem } from '../../../app/Sidebar'
import { LayoutDashboard, Wrench, Shuffle, DollarSign, FileWarning } from 'lucide-react'

const sidebarItems: SidebarItem[] = [
  { label: 'Panoramica Flotta', path: '/fleet-intelligence/overview', icon: LayoutDashboard },
  { label: 'Manutenzione Predittiva', path: '/fleet-intelligence/maintenance', icon: Wrench },
  { label: 'Allocazione Veicoli', path: '/fleet-intelligence/allocation', icon: Shuffle },
  { label: 'Costi Operativi', path: '/fleet-intelligence/costs', icon: DollarSign },
  { label: 'Scadenze & Documenti', path: '/fleet-intelligence/documents', icon: FileWarning },
]

export function FleetIntelligencePage() {
  return (
    <div className="flex flex-1 min-h-0 gap-3">
      <Sidebar items={sidebarItems} />
      <div className="flex-1 overflow-y-auto pl-8 pr-11 -mr-3 pb-3">
        <Outlet />
      </div>
    </div>
  )
}
