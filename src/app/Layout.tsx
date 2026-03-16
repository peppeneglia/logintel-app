import { ReactNode, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { X } from 'lucide-react'
import { Header } from './Header'
import { useAuthStore } from '../stores/authStore'

export function Layout({ children }: { children: ReactNode }) {
  const isDemo = useAuthStore((s) => s.isDemo)
  const navigate = useNavigate()
  const [showBanner, setShowBanner] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    if (!isDemo || dismissed) return
    const timer = setTimeout(() => setShowBanner(true), 120_000)
    return () => clearTimeout(timer)
  }, [isDemo, dismissed])

  return (
    <div className="h-screen bg-[#0f172a] flex flex-col overflow-hidden px-3 pt-3 gap-3">
      <Header />
      <main className="flex-1 flex min-h-0 relative">
        {children}

        {isDemo && showBanner && !dismissed && (
          <div className="absolute bottom-4 right-4 z-50 w-80 bg-[#1e293b] border border-emerald-500/30 rounded-2xl p-4 shadow-xl shadow-black/30 animate-in">
            <button
              onClick={() => setDismissed(true)}
              className="absolute top-3 right-3 text-slate-500 hover:text-slate-300 transition-colors"
            >
              <X size={16} />
            </button>
            <p className="text-sm text-emerald-300 font-medium mb-1">
              Modalit&agrave; demo
            </p>
            <p className="text-xs text-slate-400 mb-3 leading-relaxed">
              Stai usando la modalit&agrave; demo. Registrati per accedere a tutte le funzionalit&agrave; della piattaforma.
            </p>
            <button
              onClick={() => navigate('/register')}
              className="w-full px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-700 hover:from-emerald-600 hover:to-emerald-800 text-white text-sm font-medium rounded-xl transition-colors"
            >
              Registrati
            </button>
          </div>
        )}
      </main>
    </div>
  )
}
