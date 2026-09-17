import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from '../../../app/Sidebar'
import type { SidebarItem } from '../../../app/Sidebar'
import { Timer, Gauge, FileText, AlertTriangle, ClipboardList, Menu } from 'lucide-react'

const sidebarItems: SidebarItem[] = [
  { label: 'Ore Guida & Riposo', path: '/compliance-intelligence/hours', icon: Timer },
  { label: 'Tachigrafo', path: '/compliance-intelligence/tachograph', icon: Gauge },
  { label: 'Documenti & Scadenze', path: '/compliance-intelligence/documents', icon: FileText },
  { label: 'Normative ADR', path: '/compliance-intelligence/adr', icon: AlertTriangle },
  { label: 'Report Conformità', path: '/compliance-intelligence/report', icon: ClipboardList },
]

export function ComplianceIntelligencePage() {
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
