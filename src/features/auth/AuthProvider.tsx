import { useEffect } from 'react'
import { useAuthStore } from '../../stores/authStore'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const initialize = useAuthStore((s) => s.initialize)
  const setDemo = useAuthStore((s) => s.setDemo)
  const initialized = useAuthStore((s) => s.initialized)
  const loading = useAuthStore((s) => s.loading)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('demo') === 'true') {
      // Forza la demo, ignora qualsiasi sessione attiva
      setDemo()
      // Rimuovi il parametro dall'URL senza ricaricare
      const url = new URL(window.location.href)
      url.searchParams.delete('demo')
      window.history.replaceState({}, '', url.pathname)
      return
    }

    let subscription: { unsubscribe: () => void } | undefined
    initialize().then((sub) => {
      subscription = sub
    })

    return () => {
      subscription?.unsubscribe()
    }
  }, [initialize, setDemo])

  // Se Supabase non è configurato e non siamo in demo, bypass auth con utente fittizio
  // Questo permette di usare la API Railway reale senza autenticazione Supabase
  const user = useAuthStore((s) => s.user)
  const isDemo = useAuthStore((s) => s.isDemo)
  const setBypass = useAuthStore((s) => s.setBypass)

  useEffect(() => {
    if (initialized && !loading && !user && !isDemo) {
      setBypass()
    }
  }, [initialized, loading, user, isDemo, setBypass])

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
