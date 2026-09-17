import { type ElementType } from 'react'
import { useLocation, Link } from 'react-router-dom'
import { X } from 'lucide-react'
import { SidebarFooter } from '../components/SidebarFooter'

export interface SidebarItem {
  label: string
  path: string
  icon: ElementType
}

interface SidebarProps {
  items: SidebarItem[]
  mobileOpen?: boolean
  onMobileClose?: () => void
}

export function Sidebar({ items, mobileOpen, onMobileClose }: SidebarProps) {
  const location = useLocation()

  const nav = (
    <>
      <nav className="flex flex-col gap-1 p-3">
        {items.map((item) => {
          const isActive = location.pathname === item.path
          const Icon = item.icon
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={onMobileClose}
              className={`flex items-center gap-3 py-2.5 px-3 text-[15px] rounded-xl transition-colors ${
                isActive
                  ? 'bg-primary-500/15 text-primary-400 font-medium'
                  : 'text-slate-400 hover:bg-[#334155] hover:text-slate-200'
              }`}
            >
              <Icon size={20} className="shrink-0" />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      <SidebarFooter />
    </>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-72 shrink-0 bg-[#1e293b] border border-[#334155] rounded-2xl flex-col overflow-y-auto select-none mb-3">
        {nav}
      </aside>

      {/* Mobile overlay sidebar */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/60" onClick={onMobileClose} />
          <aside className="relative w-72 max-w-[85vw] bg-[#1e293b] border-r border-[#334155] flex flex-col overflow-y-auto select-none">
            <button
              onClick={onMobileClose}
              className="absolute top-3 right-3 p-1.5 text-slate-400 hover:text-slate-200 hover:bg-[#334155] rounded-lg transition-colors z-10"
            >
              <X size={18} />
            </button>
            {nav}
          </aside>
        </div>
      )}
    </>
  )
}
