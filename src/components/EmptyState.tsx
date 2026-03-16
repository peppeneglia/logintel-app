import { Database } from 'lucide-react'

interface EmptyStateProps {
  title: string
  message?: string
}

export function EmptyState({ title, message = 'Nessun dato disponibile. Collega i tuoi sistemi per iniziare.' }: EmptyStateProps) {
  return (
    <div>
      <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-400 to-cyan-500 bg-clip-text text-transparent mb-3">
        {title}
      </h1>
      <div className="bg-[#1e293b] rounded-2xl border border-[#334155] p-16 text-center">
        <Database size={40} className="text-slate-600 mx-auto mb-4" />
        <p className="text-slate-500 text-sm">{message}</p>
      </div>
    </div>
  )
}
