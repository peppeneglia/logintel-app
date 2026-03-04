import { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'

interface AuthLayoutProps {
  title: string
  subtitle: string
  children: ReactNode
}

export function AuthLayout({ title, subtitle, children }: AuthLayoutProps) {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center px-4 py-8">
      {/* Background subtle glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/3 w-[400px] h-[400px] bg-cyan-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div
          className="flex items-center justify-center gap-3 mb-8 cursor-pointer"
          onClick={() => navigate('/')}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <defs>
              <linearGradient id="auth-logo-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#34d399" />
                <stop offset="100%" stopColor="#06b6d4" />
              </linearGradient>
            </defs>
            <g stroke="url(#auth-logo-gradient)">
              <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/>
              <path d="M15 18h2"/>
              <path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/>
              <circle cx="17" cy="18" r="2"/>
              <circle cx="7" cy="18" r="2"/>
            </g>
          </svg>
          <span className="text-3xl font-bold bg-gradient-to-r from-primary-400 to-cyan-500 bg-clip-text text-transparent">
            Logintel
          </span>
        </div>

        {/* Card */}
        <div className="card-accent bg-[#1e293b] border border-[#334155] rounded-2xl p-8">
          {/* Header */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-white mb-1">{title}</h1>
            <p className="text-sm text-slate-400">{subtitle}</p>
          </div>

          {children}
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-xs text-slate-600">
          &copy; 2026 Logintel &mdash; Logistic Intelligence Platform
        </p>
      </div>
    </div>
  )
}
