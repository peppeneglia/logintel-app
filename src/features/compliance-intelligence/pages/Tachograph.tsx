import { useState, useEffect, useCallback } from 'react'
import { mockTachographRecords } from '../../../data/mockComplianceData'
import { useAuthStore } from '../../../stores/authStore'
import { getDrivingHours, checkDrivingViolation } from '../../../services/compliance'
import type { DrivingHoursRow } from '../../../services/compliance'

// ── Status maps ──

const downloadBadge: Record<string, string> = {
  current: 'bg-emerald-500/10 text-emerald-400',
  pending: 'bg-amber-500/10 text-amber-400',
  overdue: 'bg-red-500/10 text-red-400',
}

const downloadLabel: Record<string, string> = {
  current: 'Aggiornato',
  pending: 'In attesa',
  overdue: 'Scaduto',
}

// ── Unified display type ──

interface DisplayTachograph {
  id: string
  driver: string
  vehiclePlate: string
  date: string
  drivingMinutes: number
  restMinutes: number
  otherWorkMinutes: number
  violations: number
  downloadStatus: string
}

function mockToDisplay(r: (typeof mockTachographRecords)[number]): DisplayTachograph {
  return {
    id: r.id,
    driver: r.driver,
    vehiclePlate: r.vehiclePlate,
    date: r.date,
    drivingMinutes: r.drivingMinutes,
    restMinutes: r.restMinutes,
    otherWorkMinutes: r.otherWorkMinutes,
    violations: r.violations,
    downloadStatus: r.downloadStatus,
  }
}

function rowToDisplay(r: DrivingHoursRow): DisplayTachograph {
  const status = checkDrivingViolation(r.driving_minutes, r.rest_minutes_after)
  return {
    id: r.id,
    driver: r.driver,
    vehiclePlate: '\u2014',
    date: r.date,
    drivingMinutes: r.driving_minutes,
    restMinutes: r.rest_minutes_after,
    otherWorkMinutes: r.break_minutes,
    violations: status === 'violation' ? 1 : 0,
    downloadStatus: status === 'violation' ? 'overdue' : status === 'warning' ? 'pending' : 'current',
  }
}

// ── Helpers ──

function formatMinutes(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return `${h}:${m.toString().padStart(2, '0')}`
}

// ── Main component ──

export function Tachograph() {
  const isDemo = useAuthStore((s) => s.isDemo)
  const userId = useAuthStore((s) => s.user?.id)

  const [supabaseData, setSupabaseData] = useState<DrivingHoursRow[]>([])
  const [loading, setLoading] = useState(false)

  // ── Fetch from Supabase ──

  const fetchData = useCallback(async () => {
    if (isDemo || !userId) return
    setLoading(true)
    try {
      const rows = await getDrivingHours(userId)
      setSupabaseData(rows)
    } finally {
      setLoading(false)
    }
  }, [isDemo, userId])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // ── Display records ──

  const records: DisplayTachograph[] = isDemo
    ? mockTachographRecords.map(mockToDisplay)
    : supabaseData.map(rowToDisplay)

  // ── Render ──

  return (
    <div>
      <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-400 to-cyan-500 bg-clip-text text-transparent mb-3">
        Tachigrafo
      </h1>

      <div className="bg-[#1e293b] rounded-2xl border border-[#334155] p-6">
        <h2 className="text-sm font-semibold text-slate-300 mb-4">Registrazioni tachigrafo</h2>

        {loading ? (
          <p className="text-sm text-slate-500 py-8 text-center">Caricamento...</p>
        ) : records.length === 0 ? (
          <p className="text-sm text-slate-500 py-6 text-center">Nessun dato disponibile.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#334155]">
                  <th className="text-left py-3 px-3 font-medium text-slate-400">Autista</th>
                  <th className="text-left py-3 px-3 font-medium text-slate-400">Veicolo</th>
                  <th className="text-left py-3 px-3 font-medium text-slate-400">Data</th>
                  <th className="text-left py-3 px-3 font-medium text-slate-400">Guida</th>
                  <th className="text-left py-3 px-3 font-medium text-slate-400">Riposo</th>
                  <th className="text-left py-3 px-3 font-medium text-slate-400">Altro lavoro</th>
                  <th className="text-left py-3 px-3 font-medium text-slate-400">Violazioni</th>
                  <th className="text-left py-3 px-3 font-medium text-slate-400">Download</th>
                </tr>
              </thead>
              <tbody>
                {records.map((record) => (
                  <tr key={record.id} className="border-b border-[#334155]">
                    <td className="py-3 px-3 text-white font-medium">{record.driver}</td>
                    <td className="py-3 px-3 text-slate-300">{record.vehiclePlate}</td>
                    <td className="py-3 px-3 text-slate-400">{record.date}</td>
                    <td className="py-3 px-3 text-slate-300">{formatMinutes(record.drivingMinutes)}</td>
                    <td className="py-3 px-3 text-slate-300">{formatMinutes(record.restMinutes)}</td>
                    <td className="py-3 px-3 text-slate-300">{formatMinutes(record.otherWorkMinutes)}</td>
                    <td className="py-3 px-3">
                      <span className={`font-semibold ${record.violations > 0 ? 'text-red-400' : 'text-slate-400'}`}>
                        {record.violations}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${downloadBadge[record.downloadStatus] || 'bg-slate-500/10 text-slate-400'}`}>
                        {downloadLabel[record.downloadStatus] || record.downloadStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
