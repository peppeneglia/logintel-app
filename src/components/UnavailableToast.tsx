import { useEffect } from 'react'
import { Info } from 'lucide-react'

interface UnavailableToastProps {
  show: boolean
  onClose: () => void
}

export function UnavailableToast({ show, onClose }: UnavailableToastProps) {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(onClose, 3000)
      return () => clearTimeout(timer)
    }
  }, [show, onClose])

  if (!show) return null

  return (
    <div className="fixed bottom-6 right-6 z-50 bg-[#1e293b] border border-amber-500/30 rounded-xl px-5 py-3 flex items-center gap-3 shadow-lg animate-in">
      <Info size={18} className="text-amber-400 shrink-0" />
      <span className="text-sm text-amber-300 font-medium">Funzionalità ancora non disponibile</span>
    </div>
  )
}
