import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Menu, X, Truck, Home, Navigation, Container, Package, ShieldCheck, Wallet, Leaf } from 'lucide-react'

interface NavItem {
  label: string
  path: string
  icon: typeof Home
}

const navItems: NavItem[] = [
  { label: 'Logistic Intelligence', path: '/', icon: Home },
  { label: 'Route Intelligence', path: '/route-intelligence', icon: Navigation },
  { label: 'Fleet Intelligence', path: '/fleet-intelligence', icon: Container },
  { label: 'Delivery Intelligence', path: '/delivery-intelligence', icon: Package },
  { label: 'Compliance Intelligence', path: '/compliance-intelligence', icon: ShieldCheck },
  { label: 'Finance Intelligence', path: '/finance-intelligence', icon: Wallet },
  { label: 'Carbon Intelligence', path: '/carbon-intelligence', icon: Leaf },
]

export function Header() {
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const isActive = (item: NavItem) => {
    if (item.path === '/') return location.pathname === '/'
    return location.pathname.startsWith(item.path)
  }

  const handleNavClick = (item: NavItem) => {
    navigate(item.path)
    setMobileMenuOpen(false)
  }

  return (
    <header className="bg-gray-900 border border-gray-800 rounded-2xl px-8 py-2.5 shrink-0 select-none">
      <div className="flex items-center gap-3">
        {/* w-72 = sidebar width → con px-8 (32px) + gap-3 (12px): nav left = 32+288+12 = 332px = content p-8 left edge */}
        <div
          className="w-72 flex items-center gap-3 cursor-pointer shrink-0"
          onClick={() => navigate('/')}
        >
          <Truck size={28} className="text-primary-400" />
          <span className="text-xl font-bold text-white">Logintel</span>
        </div>

        <nav className="hidden xl:flex flex-1 items-center justify-between bg-gray-800/60 rounded-2xl p-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item)
            return (
              <button
                key={item.path}
                onClick={() => handleNavClick(item)}
                className={`flex items-center gap-1.5 whitespace-nowrap rounded-xl px-1.5 py-1.5 text-[13px] font-medium transition-colors ${
                  active
                    ? 'bg-primary-500/15 text-primary-400'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-gray-700 cursor-pointer'
                }`}
              >
                <Icon size={16} />
                {item.label}
              </button>
            )
          })}
        </nav>

        <button
          className="xl:hidden ml-auto p-2 text-gray-400 hover:text-gray-200 hover:bg-gray-800 rounded-xl transition-colors"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {mobileMenuOpen && (
        <nav className="xl:hidden mt-2.5 pt-2.5 border-t border-gray-800 flex flex-col gap-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item)
            return (
              <button
                key={item.path}
                onClick={() => handleNavClick(item)}
                className={`flex items-center gap-1.5 whitespace-nowrap rounded-xl px-3 py-1.5 text-sm font-medium transition-colors ${
                  active
                    ? 'bg-primary-500/15 text-primary-400'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-gray-700 cursor-pointer'
                }`}
              >
                <Icon size={15} />
                {item.label}
              </button>
            )
          })}
        </nav>
      )}
    </header>
  )
}
