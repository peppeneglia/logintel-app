import { useEffect } from 'react'
import { useAuthStore } from '../../stores/authStore'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const initialize = useAuthStore((s) => s.initialize)
  const initialized = useAuthStore((s) => s.initialized)
  const loading = useAuthStore((s) => s.loading)

  useEffect(() => {
    initialize()
  }, [initialize])

  // Prima inizializzazione: mostra spinner
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
