import { useState, useEffect, useCallback } from 'react'
import { Lightbulb } from 'lucide-react'
import { useAuthStore } from '../../../stores/authStore'
import { mockCO2Optimizations } from '../../../data/mockCarbonData'
import type { CO2Optimization as CO2OptType } from '../../../data/mockCarbonData'
import { getEmissionsRecords } from '../../../services/carbon'
import type { EmissionsRecordRow } from '../../../services/carbon'

// ── LocalStorage key ──

const LS_KEY = 'logintel_co2_opt_state'

// ── Badge helpers ──

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

function statusBadgeEl(status: CO2OptType['status']) {
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

// ── Generate suggestions from real data ──

function generateSuggestions(records: EmissionsRecordRow[]): CO2OptType[] {
  const suggestions: CO2OptType[] = []
  let idx = 0

  // Aggregate per vehicle
  const vehicleMap = new Map<string, { totalKm: number; totalCo2: number }>()
  for (const r of records) {
    const key = r.vehicle_id || r.route
    const existing = vehicleMap.get(key)
    if (existing) {
      existing.totalKm += r.km
      existing.totalCo2 += r.co2_kg
    } else {
      vehicleMap.set(key, { totalKm: r.km, totalCo2: r.co2_kg })
    }
  }

  // Check if any vehicle has co2/km > 800 g/km
  let hasHighEmitter = false
  vehicleMap.forEach((val) => {
    if (val.totalKm > 0 && (val.totalCo2 / val.totalKm) * 1000 > 800) {
      hasHighEmitter = true
    }
  })
  if (hasHighEmitter) {
    suggestions.push({
      id: `gen-${idx++}`,
      suggestion: 'Considera il rinnovo dei veicoli Euro 4/5 con elevate emissioni per km',
      category: 'vehicle',
      potentialSavingKg: 890,
      difficulty: 'hard',
      status: 'pending',
    })
  }

  // Avg co2/km across all records
  const totalKm = records.reduce((s, r) => s + r.km, 0)
  const totalCo2 = records.reduce((s, r) => s + r.co2_kg, 0)
  const avgCo2PerKmG = totalKm > 0 ? (totalCo2 / totalKm) * 1000 : 0
  if (avgCo2PerKmG > 750) {
    suggestions.push({
      id: `gen-${idx++}`,
      suggestion: 'Ottimizza i percorsi per ridurre le emissioni medie della flotta',
      category: 'route',
      potentialSavingKg: 450,
      difficulty: 'medium',
      status: 'pending',
    })
  }

  // Check if total monthly km is increasing (compare first half vs second half)
  if (records.length >= 4) {
    const sorted = [...records].sort((a, b) => a.date.localeCompare(b.date))
    const mid = Math.floor(sorted.length / 2)
    const firstHalfKm = sorted.slice(0, mid).reduce((s, r) => s + r.km, 0)
    const secondHalfKm = sorted.slice(mid).reduce((s, r) => s + r.km, 0)
    if (secondHalfKm > firstHalfKm * 1.1) {
      suggestions.push({
        id: `gen-${idx++}`,
        suggestion: 'Consolida le spedizioni per ridurre i viaggi — il chilometraggio mensile è in aumento',
        category: 'route',
        potentialSavingKg: 320,
        difficulty: 'easy',
        status: 'pending',
      })
    }
  }

  // Always show eco-driving suggestion
  suggestions.push({
    id: `gen-${idx++}`,
    suggestion: 'Formazione eco-driving per gli autisti: riduzione consumi stimata 5-10%',
    category: 'driving',
    potentialSavingKg: 380,
    difficulty: 'easy',
    status: 'pending',
  })

  return suggestions
}

// ── Load/save localStorage state ──

function loadOptState(): Record<string, CO2OptType['status']> {
  try {
    const raw = localStorage.getItem(LS_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function saveOptState(state: Record<string, CO2OptType['status']>) {
  localStorage.setItem(LS_KEY, JSON.stringify(state))
}

// ── Main component ──

export function CO2Optimization() {
  const isDemo = useAuthStore((s) => s.isDemo)
  const userId = useAuthStore((s) => s.user?.id)

  const [supabaseData, setSupabaseData] = useState<EmissionsRecordRow[]>([])
  const [loading, setLoading] = useState(false)
  const [optState, setOptState] = useState<Record<string, CO2OptType['status']>>(loadOptState)

  const fetchData = useCallback(async () => {
    if (isDemo || !userId) return
    setLoading(true)
    try {
      const rows = await getEmissionsRecords(userId)
      setSupabaseData(rows)
    } finally {
      setLoading(false)
    }
  }, [isDemo, userId])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // ── Build optimizations list ──

  const baseSuggestions: CO2OptType[] = isDemo
    ? mockCO2Optimizations
    : generateSuggestions(supabaseData)

  const optimizations = baseSuggestions.map((o) => ({
    ...o,
    status: optState[o.id] || o.status,
  }))

  // ── Handlers ──

  function handleImplement(id: string) {
    const next = { ...optState, [id]: 'implemented' as const }
    setOptState(next)
    saveOptState(next)
  }

  function handleDismiss(id: string) {
    const next = { ...optState, [id]: 'dismissed' as const }
    setOptState(next)
    saveOptState(next)
  }

  const totalPotentialSaving = optimizations
    .filter((o) => o.status === 'pending')
    .reduce((sum, o) => sum + o.potentialSavingKg, 0)

  // ── Render ──

  return (
    <div>
      <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-400 to-cyan-500 bg-clip-text text-transparent mb-3">
        Ottimizzazione CO2
      </h1>

      {/* Summary */}
      <div className="bg-[#1e293b] rounded-2xl border border-[#334155] p-6 mb-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-400 mb-1">Risparmio potenziale (suggerimenti attivi)</p>
            <p className="text-3xl font-bold text-emerald-400">
              {totalPotentialSaving.toLocaleString('it-IT')} <span className="text-lg">kg CO2</span>
            </p>
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
      {loading ? (
        <div className="bg-[#1e293b] rounded-2xl border border-[#334155] p-6">
          <p className="text-sm text-slate-500 text-center">Caricamento...</p>
        </div>
      ) : optimizations.length === 0 ? (
        <div className="bg-[#1e293b] rounded-2xl border border-[#334155] p-6">
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-14 h-14 rounded-2xl bg-slate-800 flex items-center justify-center mb-4">
              <Lightbulb size={28} className="text-slate-600" />
            </div>
            <p className="text-white font-semibold mb-1">Nessun suggerimento disponibile</p>
            <p className="text-sm text-slate-500 max-w-xs">
              I suggerimenti vengono generati automaticamente dalle registrazioni emissioni.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {optimizations.map((opt) => (
            <div key={opt.id} className="bg-[#1e293b] rounded-2xl border border-[#334155] p-6">
              <div className="flex items-start justify-between gap-4 mb-3">
                <p className="text-sm text-slate-300 leading-relaxed flex-1">{opt.suggestion}</p>
                {statusBadgeEl(opt.status)}
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
    </div>
  )
}
