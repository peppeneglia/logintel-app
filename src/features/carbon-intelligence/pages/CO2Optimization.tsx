import { useState } from 'react'
import { mockCO2Optimizations } from '../../../data/mockCarbonData'
import type { CO2Optimization as CO2OptType } from '../../../data/mockCarbonData'
import { useUnavailable } from '../../../hooks/useUnavailable'
import { UnavailableToast } from '../../../components/UnavailableToast'

function categoryBadge(category: CO2OptType['category']) {
  const styles: Record<CO2OptType['category'], string> = {
    route: 'bg-blue-500/10 text-blue-400',
    vehicle: 'bg-purple-500/10 text-purple-400',
    driving: 'bg-amber-500/10 text-amber-400',
    fuel: 'bg-emerald-500/10 text-emerald-400',
  }
  const labels: Record<CO2OptType['category'], string> = {
    route: 'Rotta',
    vehicle: 'Veicolo',
    driving: 'Guida',
    fuel: 'Carburante',
  }
  return (
    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[category]}`}>
      {labels[category]}
    </span>
  )
}

function difficultyBadge(difficulty: CO2OptType['difficulty']) {
  const styles: Record<CO2OptType['difficulty'], string> = {
    easy: 'bg-emerald-500/10 text-emerald-400',
    medium: 'bg-amber-500/10 text-amber-400',
    hard: 'bg-red-500/10 text-red-400',
  }
  const labels: Record<CO2OptType['difficulty'], string> = {
    easy: 'Facile',
    medium: 'Media',
    hard: 'Difficile',
  }
  return (
    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[difficulty]}`}>
      {labels[difficulty]}
    </span>
  )
}

function statusBadge(status: CO2OptType['status']) {
  const styles: Record<CO2OptType['status'], string> = {
    pending: 'bg-amber-500/10 text-amber-400',
    implemented: 'bg-emerald-500/10 text-emerald-400',
    dismissed: 'bg-slate-500/10 text-slate-400',
  }
  const labels: Record<CO2OptType['status'], string> = {
    pending: 'In attesa',
    implemented: 'Implementato',
    dismissed: 'Scartato',
  }
  return (
    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status]}`}>
      {labels[status]}
    </span>
  )
}

export function CO2Optimization() {
  const { isDemo, show, guard, close } = useUnavailable()
  const initialData = isDemo ? mockCO2Optimizations : []

  const [optimizations, setOptimizations] = useState(initialData)

  const handleImplement = (id: string) => {
    if (guard()) return
    setOptimizations((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status: 'implemented' as const } : o))
    )
  }

  const handleDismiss = (id: string) => {
    if (guard()) return
    setOptimizations((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status: 'dismissed' as const } : o))
    )
  }

  const totalPotentialSaving = optimizations
    .filter((o) => o.status === 'pending')
    .reduce((sum, o) => sum + o.potentialSavingKg, 0)

  return (
    <div>
      <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-400 to-cyan-500 bg-clip-text text-transparent mb-3">Ottimizzazione CO2</h1>

      {/* Summary */}
      <div className="bg-[#1e293b] rounded-2xl border border-[#334155] p-6 mb-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-400 mb-1">Risparmio potenziale (suggerimenti attivi)</p>
            <p className="text-3xl font-bold text-emerald-400">{totalPotentialSaving.toLocaleString('it-IT')} <span className="text-lg">kg CO2</span></p>
          </div>
          <div className="text-right">
            <p className="text-sm text-slate-400 mb-1">Suggerimenti</p>
            <p className="text-lg font-semibold text-white">
              {optimizations.filter((o) => o.status === 'pending').length} attivi
              <span className="text-slate-500 mx-1">/</span>
              {optimizations.length} totali
            </p>
          </div>
        </div>
      </div>

      {/* Optimization cards */}
      {optimizations.length === 0 ? (
        <div className="bg-[#1e293b] rounded-2xl border border-[#334155] p-6">
          <p className="text-slate-500 text-center">Nessun dato disponibile.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {optimizations.map((opt) => (
            <div key={opt.id} className="bg-[#1e293b] rounded-2xl border border-[#334155] p-6">
              <div className="flex items-start justify-between gap-4 mb-3">
                <p className="text-sm text-slate-300 leading-relaxed flex-1">{opt.suggestion}</p>
                {statusBadge(opt.status)}
              </div>

              <div className="flex flex-wrap items-center gap-3 mb-4">
                {categoryBadge(opt.category)}
                {difficultyBadge(opt.difficulty)}
                <span className="text-sm text-emerald-400 font-medium">
                  -{opt.potentialSavingKg.toLocaleString('it-IT')} kg CO2
                </span>
              </div>

              {opt.status === 'pending' && (
                <div className="flex items-center gap-2 pt-3 border-t border-[#334155]">
                  <button
                    onClick={() => handleImplement(opt.id)}
                    className="px-4 py-1.5 bg-emerald-500/15 text-emerald-400 text-sm font-medium rounded-xl hover:bg-emerald-500/25 transition-colors"
                  >
                    Implementa
                  </button>
                  <button
                    onClick={() => handleDismiss(opt.id)}
                    className="px-4 py-1.5 bg-[#334155] text-slate-400 text-sm font-medium rounded-xl hover:bg-slate-600 transition-colors"
                  >
                    Scarta
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      <UnavailableToast show={show} onClose={close} />
    </div>
  )
}
