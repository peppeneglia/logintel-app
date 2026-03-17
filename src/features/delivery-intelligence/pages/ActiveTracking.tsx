import { useState, useEffect, useCallback } from 'react'
import { MapPin } from 'lucide-react'
import { mockActiveTrackings } from '../../../data/mockDeliveryData'
import { useAuthStore } from '../../../stores/authStore'
import { useCredits } from '../../../hooks/useCredits'
import { CREDIT_COSTS } from '../../../lib/creditCosts'
import { getDeliveries } from '../../../services/delivery'
import type { DeliveryRow } from '../../../services/delivery'

// ── Status config ──

const trackingStatusConfig: Record<string, { label: string; style: string }> = {
  on_schedule: { label: 'In orario', style: 'bg-emerald-500/10 text-emerald-400' },
  delayed: { label: 'In ritardo', style: 'bg-red-500/10 text-red-400' },
  ahead: { label: 'In anticipo', style: 'bg-emerald-500/10 text-emerald-400' },
  in_transit: { label: 'In transito', style: 'bg-amber-500/10 text-amber-400' },
}

function TrackingStatusBadge({ status }: { status: string }) {
  const { label, style } = trackingStatusConfig[status] ?? { label: status, style: 'bg-slate-500/10 text-slate-400' }
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${style}`}>
      {label}
    </span>
  )
}

function ProgressBar({ percent, status }: { percent: number; status: string }) {
  const barColor = status === 'delayed' ? 'bg-red-400' : status === 'ahead' ? 'bg-emerald-400' : 'bg-primary-400'
  return (
    <div className="w-full bg-[#334155] rounded-full h-2">
      <div
        className={`h-2 rounded-full transition-all ${barColor}`}
        style={{ width: `${percent}%` }}
      />
    </div>
  )
}

// ── Display type for Supabase rows filtered as in-transit ──

interface DisplayTracking {
  id: string
  vehiclePlate: string
  driver: string
  origin: string
  destination: string
  currentLocation: string
  progressPercent: number
  eta: string
  status: string
}

function rowToTracking(r: DeliveryRow): DisplayTracking {
  return {
    id: r.id,
    vehiclePlate: r.vehicle_id ?? '',
    driver: r.driver ?? '',
    origin: r.origin,
    destination: r.destination,
    currentLocation: '\u2014',
    progressPercent: 50,
    eta: r.scheduled_delivery_date,
    status: 'in_transit',
  }
}

// ── Main component ──

export function ActiveTracking() {
  const isDemo = useAuthStore((s) => s.isDemo)
  const userId = useAuthStore((s) => s.user?.id)
  const { consume } = useCredits()

  const [supabaseData, setSupabaseData] = useState<DeliveryRow[]>([])
  const [loading, setLoading] = useState(false)

  const fetchData = useCallback(async () => {
    if (isDemo || !userId) return
    setLoading(true)
    try {
      const rows = await getDeliveries(userId)
      setSupabaseData(rows.filter((r) => r.status === 'in_transit'))
      await consume(CREDIT_COSTS.DELIVERY_LOAD, 'DELIVERY_LOAD')
    } finally {
      setLoading(false)
    }
  }, [isDemo, userId])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const trackings: DisplayTracking[] = isDemo
    ? mockActiveTrackings
    : supabaseData.map(rowToTracking)

  return (
    <div>
      <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-400 to-cyan-500 bg-clip-text text-transparent mb-3">
        Tracking Attivo
      </h1>

      {loading ? (
        <div className="bg-[#1e293b] rounded-2xl border border-[#334155] p-6">
          <p className="text-sm text-slate-500 text-center">Caricamento...</p>
        </div>
      ) : trackings.length === 0 ? (
        <div className="bg-[#1e293b] rounded-2xl border border-[#334155] p-6">
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-14 h-14 rounded-2xl bg-slate-800 flex items-center justify-center mb-4">
              <MapPin size={28} className="text-slate-600" />
            </div>
            <p className="text-white font-semibold mb-1">Nessun veicolo in transito</p>
            <p className="text-sm text-slate-500 max-w-xs">
              I veicoli con stato "In transito" appariranno qui automaticamente.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {trackings.map((t) => (
            <div key={t.id} className="bg-[#1e293b] rounded-2xl border border-[#334155] p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-white">{t.vehiclePlate}</span>
                  <TrackingStatusBadge status={t.status} />
                </div>
                <span className="text-xs text-slate-400">
                  ETA: <span className="text-white font-medium">{t.eta}</span>
                </span>
              </div>

              <p className="text-sm text-slate-400 mb-1">
                Autista: <span className="text-slate-300">{t.driver}</span>
              </p>

              <p className="text-sm text-slate-400 mb-1">
                <span className="text-slate-300">{t.origin}</span>
                <span className="text-slate-500 mx-1">&rarr;</span>
                <span className="text-slate-300">{t.destination}</span>
              </p>

              <p className="text-sm text-slate-400 mb-3">
                Posizione: <span className="text-white font-medium">{t.currentLocation}</span>
              </p>

              <ProgressBar percent={t.progressPercent} status={t.status} />
              <p className="text-xs text-slate-500 mt-1 text-right">{t.progressPercent}%</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
