import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Menu, X, Home, Navigation, Container, Package, ShieldCheck, Wallet, Leaf } from 'lucide-react'

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
    <header className="bg-[#1e293b] border border-[#334155] rounded-2xl px-8 py-2.5 shrink-0 select-none">
      <div className="flex items-center gap-3">
        {/* w-72 = sidebar width → con px-8 (32px) + gap-3 (12px): nav left = 32+288+12 = 332px = content p-8 left edge */}
        <div
          className="w-72 flex items-center gap-3 cursor-pointer shrink-0"
          onClick={() => navigate('/')}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <defs>
              <linearGradient id="logo-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#34d399" />
                <stop offset="100%" stopColor="#06b6d4" />
              </linearGradient>
            </defs>
            <g stroke="url(#logo-gradient)">
              <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/>
              <path d="M15 18h2"/>
              <path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/>
              <circle cx="17" cy="18" r="2"/>
              <circle cx="7" cy="18" r="2"/>
            </g>
          </svg>
          <span className="text-xl font-bold bg-gradient-to-r from-primary-400 to-cyan-500 bg-clip-text text-transparent">Logintel</span>
        </div>

        <nav className="hidden xl:flex flex-1 items-center justify-between bg-[#334155]/60 rounded-2xl p-1">
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
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-600 cursor-pointer'
                }`}
              >
                <Icon size={16} />
                {active ? (
                  <span className="bg-gradient-to-r from-primary-400 to-cyan-500 bg-clip-text text-transparent">{item.label}</span>
                ) : (
                  item.label
                )}
              </button>
            )
          })}
        </nav>

        <button
          className="xl:hidden ml-auto p-2 text-slate-400 hover:text-slate-200 hover:bg-[#334155] rounded-xl transition-colors"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {mobileMenuOpen && (
        <nav className="xl:hidden mt-2.5 pt-2.5 border-t border-[#334155] flex flex-col gap-1">
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
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-600 cursor-pointer'
                }`}
              >
                <Icon size={15} />
                {active ? (
                  <span className="bg-gradient-to-r from-primary-400 to-cyan-500 bg-clip-text text-transparent">{item.label}</span>
                ) : (
                  item.label
                )}
              </button>
            )
          })}
        </nav>
      )}
    </header>
  )
}
