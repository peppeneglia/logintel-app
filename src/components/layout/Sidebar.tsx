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
    <aside className="w-72 shrink-0 bg-gray-900 border border-gray-800 rounded-2xl flex flex-col overflow-y-auto select-none mb-3">
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
                  : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
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
