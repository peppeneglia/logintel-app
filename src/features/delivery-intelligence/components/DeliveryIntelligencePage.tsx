import { Outlet } from 'react-router-dom'
import { Sidebar } from '../../../app/Sidebar'
import type { SidebarItem } from '../../../app/Sidebar'
import { TrendingUp, MapPin, Clock, Send, Crosshair } from 'lucide-react'

const sidebarItems: SidebarItem[] = [
  { label: 'Performance Consegne', path: '/delivery-intelligence/performance', icon: TrendingUp },
  { label: 'Tracking Attivo', path: '/delivery-intelligence/tracking', icon: MapPin },
  { label: 'Finestre di Consegna', path: '/delivery-intelligence/windows', icon: Clock },
  { label: 'Notifiche Clienti', path: '/delivery-intelligence/notifications', icon: Send },
  { label: 'ETA Accuracy', path: '/delivery-intelligence/accuracy', icon: Crosshair },
]

export function DeliveryIntelligencePage() {
  return (
    <div className="flex flex-1 min-h-0 gap-3">
      <Sidebar items={sidebarItems} />
      <div className="flex-1 overflow-y-auto pl-8 pr-11 -mr-3 pb-3">
        <Outlet />
      </div>
    </div>
  )
}
