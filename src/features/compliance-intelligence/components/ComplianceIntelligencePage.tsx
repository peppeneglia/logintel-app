import { Outlet } from 'react-router-dom'
import { Sidebar } from '../../../app/Sidebar'
import type { SidebarItem } from '../../../app/Sidebar'
import { Timer, Gauge, FileText, AlertTriangle, ClipboardList } from 'lucide-react'

const sidebarItems: SidebarItem[] = [
  { label: 'Ore Guida & Riposo', path: '/compliance-intelligence/hours', icon: Timer },
  { label: 'Tachigrafo', path: '/compliance-intelligence/tachograph', icon: Gauge },
  { label: 'Documenti & Scadenze', path: '/compliance-intelligence/documents', icon: FileText },
  { label: 'Normative ADR', path: '/compliance-intelligence/adr', icon: AlertTriangle },
  { label: 'Report Conformità', path: '/compliance-intelligence/report', icon: ClipboardList },
]

export function ComplianceIntelligencePage() {
  return (
    <div className="flex flex-1 min-h-0 gap-3">
      <Sidebar items={sidebarItems} />
      <div className="flex-1 overflow-y-auto pl-8 pr-11 -mr-3 pb-3">
        <Outlet />
      </div>
    </div>
  )
}
