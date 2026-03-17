import { useEffect, useState } from 'react'
import { useAuthStore } from '../../stores/authStore'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const initialize = useAuthStore((s) => s.initialize)
  const setDemo = useAuthStore((s) => s.setDemo)
  const initialized = useAuthStore((s) => s.initialized)
  const loading = useAuthStore((s) => s.loading)
  const [initError, setInitError] = useState(false)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('demo') === 'true') {
      setDemo()
      const url = new URL(window.location.href)
      url.searchParams.delete('demo')
      window.history.replaceState({}, '', url.pathname)
      return
    }

    let subscription: { unsubscribe: () => void } | undefined
    initialize()
      .then((sub) => {
        subscription = sub
      })
      .catch(() => {
        setInitError(true)
      })

    return () => {
      subscription?.unsubscribe()
    }
  }, [initialize, setDemo])

  // No more auto-bypass. If Supabase fails, show error page.
  if (initError) {
    return (
      <div className="h-screen bg-[#0f172a] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 max-w-md text-center px-4">
          <div className="w-14 h-14 rounded-2xl bg-red-500/15 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-400">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-white">Servizio temporaneamente non disponibile</h1>
          <p className="text-sm text-slate-400">
            Stiamo riscontrando difficoltà tecniche. Riprova tra qualche minuto.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-700 text-white rounded-xl text-sm font-medium hover:from-emerald-600 hover:to-emerald-800 transition-colors"
          >
            Riprova
          </button>
        </div>
      </div>
    )
  }

  if (!initialized || loading) {
    return (
      <div className="h-screen bg-[#0f172a] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full" />
          <p className="text-sm text-slate-500">Caricamento...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
