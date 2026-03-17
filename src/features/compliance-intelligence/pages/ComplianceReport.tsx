import { useState, useEffect, useCallback } from 'react'
import { mockComplianceScores } from '../../../data/mockComplianceData'
import { useAuthStore } from '../../../stores/authStore'
import {
  getComplianceDocuments, getDrivingHours, getADRShipments,
  computeDocumentStatus, checkDrivingViolation,
} from '../../../services/compliance'
import type { ComplianceDocumentRow, DrivingHoursRow, ADRShipmentRow } from '../../../services/compliance'

// ── Status maps ──

const statusColor: Record<string, string> = {
  good: 'bg-emerald-500',
  attention: 'bg-amber-500',
  critical: 'bg-red-500',
}

const statusTrack: Record<string, string> = {
  good: 'bg-emerald-500/20',
  attention: 'bg-amber-500/20',
  critical: 'bg-red-500/20',
}

const statusBadge: Record<string, string> = {
  good: 'bg-emerald-500/10 text-emerald-400',
  attention: 'bg-amber-500/10 text-amber-400',
  critical: 'bg-red-500/10 text-red-400',
}

const statusLabel: Record<string, string> = {
  good: 'Buono',
  attention: 'Attenzione',
  critical: 'Critico',
}

// ── Score item type ──

interface ScoreItem {
  category: string
  score: number
  maxScore: number
  status: string
}

function classifyScore(pct: number): string {
  if (pct >= 85) return 'good'
  if (pct >= 70) return 'attention'
  return 'critical'
}

function computeScores(
  docs: ComplianceDocumentRow[],
  hours: DrivingHoursRow[],
  shipments: ADRShipmentRow[],
): ScoreItem[] {
  const scores: ScoreItem[] = []

  // Documents score: % of valid documents
  if (docs.length > 0) {
    const validCount = docs.filter((d) => computeDocumentStatus(d.expiry_date) === 'valid').length
    const pct = Math.round((validCount / docs.length) * 100)
    scores.push({ category: 'Documentazione', score: pct, maxScore: 100, status: classifyScore(pct) })
  } else {
    scores.push({ category: 'Documentazione', score: 0, maxScore: 100, status: 'critical' })
  }

  // Driving hours score: % of records without violations
  if (hours.length > 0) {
    const okCount = hours.filter((h) => checkDrivingViolation(h.driving_minutes, h.rest_minutes_after) === 'ok').length
    const pct = Math.round((okCount / hours.length) * 100)
    scores.push({ category: 'Ore guida', score: pct, maxScore: 100, status: classifyScore(pct) })
  } else {
    scores.push({ category: 'Ore guida', score: 0, maxScore: 100, status: 'critical' })
  }

  // ADR score: % of compliant shipments
  if (shipments.length > 0) {
    const compliantCount = shipments.filter((s) => s.compliant).length
    const pct = Math.round((compliantCount / shipments.length) * 100)
    scores.push({ category: 'ADR', score: pct, maxScore: 100, status: classifyScore(pct) })
  } else {
    scores.push({ category: 'ADR', score: 0, maxScore: 100, status: 'critical' })
  }

  return scores
}

// ── Main component ──

export function ComplianceReport() {
  const isDemo = useAuthStore((s) => s.isDemo)
  const userId = useAuthStore((s) => s.user?.id)

  const [supabaseDocs, setSupabaseDocs] = useState<ComplianceDocumentRow[]>([])
  const [supabaseHours, setSupabaseHours] = useState<DrivingHoursRow[]>([])
  const [supabaseShipments, setSupabaseShipments] = useState<ADRShipmentRow[]>([])
  const [loading, setLoading] = useState(false)

  // ── Fetch from Supabase ──

  const fetchData = useCallback(async () => {
    if (isDemo || !userId) return
    setLoading(true)
    try {
      const [docs, hours, shipments] = await Promise.all([
        getComplianceDocuments(userId),
        getDrivingHours(userId),
        getADRShipments(userId),
      ])
      setSupabaseDocs(docs)
      setSupabaseHours(hours)
      setSupabaseShipments(shipments)
    } finally {
      setLoading(false)
    }
  }, [isDemo, userId])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // ── Display scores ──

  const data: ScoreItem[] = isDemo
    ? mockComplianceScores
    : computeScores(supabaseDocs, supabaseHours, supabaseShipments)

  const totalScore = data.reduce((sum, s) => sum + s.score, 0)
  const totalMax = data.reduce((sum, s) => sum + s.maxScore, 0)
  const overallPercentage = totalMax > 0 ? Math.round((totalScore / totalMax) * 100) : 0

  const overallStatus = classifyScore(overallPercentage)

  // ── Render ──

  return (
    <div>
      <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-400 to-cyan-500 bg-clip-text text-transparent mb-3">
        Report Conformità
      </h1>

      {loading ? (
        <p className="text-sm text-slate-500 py-8 text-center">Caricamento...</p>
      ) : (
        <>
          {/* Overall score */}
          <div className="bg-[#1e293b] rounded-2xl border border-[#334155] p-4 mb-3">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs text-slate-400">Conformità complessiva</p>
                <p className="text-4xl font-bold text-white">{overallPercentage}%</p>
              </div>
              <span className={`inline-block px-3 py-1.5 rounded-full text-sm font-medium ${statusBadge[overallStatus]}`}>
                {statusLabel[overallStatus]}
              </span>
            </div>
            <div className={`w-full h-3 rounded-full ${statusTrack[overallStatus]}`}>
              <div
                className={`h-3 rounded-full transition-all ${statusColor[overallStatus]}`}
                style={{ width: `${overallPercentage}%` }}
              />
            </div>
          </div>

          {/* Category scores */}
          {data.length === 0 ? (
            <div className="bg-[#1e293b] rounded-2xl border border-[#334155] p-6">
              <p className="text-sm text-slate-500">Nessun dato disponibile.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.map((item) => {
                const pct = item.maxScore > 0 ? Math.round((item.score / item.maxScore) * 100) : 0
                return (
                  <div key={item.category} className="bg-[#1e293b] rounded-2xl border border-[#334155] p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-semibold text-white">{item.category}</h3>
                      <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${statusBadge[item.status] || 'bg-slate-500/10 text-slate-400'}`}>
                        {statusLabel[item.status] || item.status}
                      </span>
                    </div>
                    <div className="flex items-end gap-2 mb-3">
                      <span className="text-lg font-bold text-white">{item.score}</span>
                      <span className="text-sm text-slate-400 mb-0.5">/ {item.maxScore}</span>
                    </div>
                    <div className={`w-full h-2 rounded-full ${statusTrack[item.status] || 'bg-slate-500/20'}`}>
                      <div
                        className={`h-2 rounded-full transition-all ${statusColor[item.status] || 'bg-slate-500'}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </>
      )}
    </div>
  )
}
