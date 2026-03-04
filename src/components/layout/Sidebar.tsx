import { type ElementType } from 'react'
import { useLocation, Link } from 'react-router-dom'
import { SidebarFooter } from '../ui/SidebarFooter'

export interface SidebarItem {
  label: string
  path: string
  icon: ElementType
}

interface SidebarProps {
  items: SidebarItem[]
}

export function Sidebar({ items }: SidebarProps) {
  const location = useLocation()

  return (
    <aside className="w-72 shrink-0 bg-[#1e293b] border border-[#334155] rounded-2xl flex flex-col overflow-y-auto select-none mb-3">
      <nav className="flex flex-col gap-1 p-3">
        {items.map((item) => {
          const isActive = location.pathname === item.path
          const Icon = item.icon
          return (
            <Link
              key={item.path}
              to={item.path}
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
    </aside>
  )
}
