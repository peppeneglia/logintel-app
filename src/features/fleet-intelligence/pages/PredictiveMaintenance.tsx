import { useState, useEffect, useCallback } from 'react'
import { Plus } from 'lucide-react'
import { Modal } from '../../../components/Modal'
import { useAuthStore } from '../../../stores/authStore'
import { mockMaintenanceAlerts } from '../../../data/mockFleetData'
import type { MaintenanceAlert } from '../../../data/mockFleetData'
import {
  getMaintenanceAlerts,
  addMaintenanceAlert,
  updateMaintenanceAlert,
  deleteMaintenanceAlert,
} from '../../../services/fleet'
import type { MaintenanceAlertRow, MaintenanceAlertInput } from '../../../services/fleet'

// ── Display types ────────────────────────────────────

interface DisplayAlert {
  id: string
  vehicle_id: string
  type: string
  description: string
  urgency: string
  km_threshold: number | null
  due_date: string | null
  resolved: boolean
}

function fromMock(m: MaintenanceAlert): DisplayAlert {
  return {
    id: m.id,
    vehicle_id: m.vehiclePlate,
    type: m.component,
    description: '',
    urgency: m.risk === 'high' ? 'high' : m.risk === 'medium' ? 'medium' : 'low',
    km_threshold: m.mileageToFailure,
    due_date: m.predictedDate,
    resolved: m.status === 'resolved',
  }
}

function fromRow(r: MaintenanceAlertRow): DisplayAlert {
  return {
    id: r.id,
    vehicle_id: r.vehicle_id,
    type: r.type,
    description: r.description ?? '',
    urgency: r.urgency,
    km_threshold: r.km_threshold,
    due_date: r.due_date,
    resolved: r.resolved,
  }
}

// ── Lookups ──────────────────────────────────────────

const urgencyBadge: Record<string, string> = {
  low: 'bg-emerald-500/10 text-emerald-400',
  medium: 'bg-amber-500/10 text-amber-400',
  high: 'bg-red-500/10 text-red-400',
  critical: 'bg-red-500/20 text-red-300',
}

const urgencyLabel: Record<string, string> = {
  low: 'Bassa',
  medium: 'Media',
  high: 'Alta',
  critical: 'Critica',
}

// ── Helpers ──────────────────────────────────────────

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('it-IT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

function daysBetween(a: Date, b: Date): number {
  return Math.round((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24))
}

function computeUrgency(dueDate: string | null, kmThreshold: number | null): string | null {
  let computed: string | null = null
  if (dueDate) {
    const days = daysBetween(new Date(), new Date(dueDate))
    if (days < 30) computed = 'high'
  }
  if (kmThreshold != null && kmThreshold < 5000) computed = 'critical'
  return computed
}

// ── Empty form state ─────────────────────────────────

interface FormState {
  vehicle_id: string
  type: string
  description: string
  urgency: string
  km_threshold: string
  due_date: string
  resolved: boolean
}

const emptyForm: FormState = {
  vehicle_id: '',
  type: '',
  description: '',
  urgency: 'low',
  km_threshold: '',
  due_date: '',
  resolved: false,
}

// ── Component ────────────────────────────────────────

export function PredictiveMaintenance() {
  const { isDemo, user } = useAuthStore()
  const userId = user?.id ?? ''

  const [supabaseAlerts, setSupabaseAlerts] = useState<MaintenanceAlertRow[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<FormState>(emptyForm)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  // Fetch from Supabase when not demo
  const fetchAlerts = useCallback(async () => {
    if (isDemo || !userId) return
    setLoading(true)
    try {
      const rows = await getMaintenanceAlerts(userId)
      setSupabaseAlerts(rows)
    } finally {
      setLoading(false)
    }
  }, [isDemo, userId])

  useEffect(() => {
    fetchAlerts()
  }, [fetchAlerts])

  // Build display list
  const alerts: DisplayAlert[] = isDemo
    ? mockMaintenanceAlerts.map(fromMock)
    : supabaseAlerts.map(fromRow)

  // KPI counts
  const criticalCount = alerts.filter((a) => a.urgency === 'critical').length
  const highCount = alerts.filter((a) => a.urgency === 'high').length
  const unresolvedCount = alerts.filter((a) => !a.resolved).length

  // ── Modal helpers ────────────────────────────────

  function openAddModal() {
    setEditingId(null)
    setForm(emptyForm)
    setModalOpen(true)
  }

  function openEditModal(alert: DisplayAlert) {
    if (isDemo) return
    setEditingId(alert.id)
    setForm({
      vehicle_id: alert.vehicle_id,
      type: alert.type,
      description: alert.description,
      urgency: alert.urgency,
      km_threshold: alert.km_threshold != null ? String(alert.km_threshold) : '',
      due_date: alert.due_date ?? '',
      resolved: alert.resolved,
    })
    setModalOpen(true)
  }

  function closeModal() {
    setModalOpen(false)
    setEditingId(null)
    setForm(emptyForm)
  }

  function handleChange(field: keyof FormState, value: string | boolean) {
    setForm((prev) => {
      const next = { ...prev, [field]: value }
      // Auto-compute urgency when due_date or km_threshold change
      if (field === 'due_date' || field === 'km_threshold') {
        const km = field === 'km_threshold' ? (value as string) : next.km_threshold
        const date = field === 'due_date' ? (value as string) : next.due_date
        const auto = computeUrgency(date || null, km ? Number(km) : null)
        if (auto) next.urgency = auto
      }
      return next
    })
  }

  async function handleSave() {
    if (!userId) return
    setSaving(true)
    try {
      const payload: MaintenanceAlertInput = {
        user_id: userId,
        vehicle_id: form.vehicle_id,
        type: form.type,
        description: form.description || null,
        urgency: form.urgency,
        km_threshold: form.km_threshold ? Number(form.km_threshold) : null,
        due_date: form.due_date || null,
        resolved: form.resolved,
      }

      if (editingId) {
        const { user_id: _, ...updateData } = payload
        await updateMaintenanceAlert(editingId, updateData)
      } else {
        await addMaintenanceAlert(payload)
      }

      closeModal()
      await fetchAlerts()
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    setSaving(true)
    try {
      await deleteMaintenanceAlert(id)
      setConfirmDeleteId(null)
      await fetchAlerts()
    } finally {
      setSaving(false)
    }
  }

  // ── Render ───────────────────────────────────────

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-400 to-cyan-500 bg-clip-text text-transparent">
          Manutenzione Predittiva
        </h1>
        <button
          onClick={openAddModal}
          disabled={isDemo}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary-600 hover:bg-primary-500 text-white text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Plus size={16} />
          Aggiungi alert
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-3 gap-4 mb-3">
        <div className="bg-[#1e293b] rounded-2xl border border-[#334155] p-4">
          <p className="text-xs text-slate-400">Urgenza Critica</p>
          <p className="text-lg font-bold text-red-300">{criticalCount}</p>
        </div>
        <div className="bg-[#1e293b] rounded-2xl border border-[#334155] p-4">
          <p className="text-xs text-slate-400">Urgenza Alta</p>
          <p className="text-lg font-bold text-red-400">{highCount}</p>
        </div>
        <div className="bg-[#1e293b] rounded-2xl border border-[#334155] p-4">
          <p className="text-xs text-slate-400">Non Risolti</p>
          <p className="text-lg font-bold text-white">{unresolvedCount}</p>
        </div>
      </div>

      {/* Alerts Table */}
      <div className="bg-[#1e293b] rounded-2xl border border-[#334155] p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Avvisi Manutenzione</h2>

        {loading ? (
          <p className="py-8 text-center text-sm text-slate-500">Caricamento...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#334155]">
                  <th className="text-left py-2 px-3 font-medium text-slate-400">Veicolo (ID)</th>
                  <th className="text-left py-2 px-3 font-medium text-slate-400">Tipo</th>
                  <th className="text-left py-2 px-3 font-medium text-slate-400">Descrizione</th>
                  <th className="text-left py-2 px-3 font-medium text-slate-400">Urgenza</th>
                  <th className="text-right py-2 px-3 font-medium text-slate-400">Soglia Km</th>
                  <th className="text-left py-2 px-3 font-medium text-slate-400">Scadenza</th>
                  <th className="text-left py-2 px-3 font-medium text-slate-400">Risolto</th>
                </tr>
              </thead>
              <tbody>
                {alerts.length > 0 ? (
                  alerts.map((alert) => (
                    <tr
                      key={alert.id}
                      onClick={() => openEditModal(alert)}
                      className={`border-b border-[#334155] ${!isDemo ? 'cursor-pointer hover:bg-[#253347] transition-colors' : ''}`}
                    >
                      <td className="py-2.5 px-3 font-medium text-white">{alert.vehicle_id}</td>
                      <td className="py-2.5 px-3 text-slate-300">{alert.type}</td>
                      <td className="py-2.5 px-3 text-slate-300">{alert.description || '—'}</td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${urgencyBadge[alert.urgency] ?? urgencyBadge.low}`}
                        >
                          {urgencyLabel[alert.urgency] ?? alert.urgency}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right text-slate-300">
                        {alert.km_threshold != null
                          ? `${alert.km_threshold.toLocaleString('it-IT')} km`
                          : '—'}
                      </td>
                      <td className="py-2.5 px-3 text-slate-300">{formatDate(alert.due_date)}</td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            alert.resolved
                              ? 'bg-emerald-500/10 text-emerald-400'
                              : 'bg-amber-500/10 text-amber-400'
                          }`}
                        >
                          {alert.resolved ? 'Si' : 'No'}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-sm text-slate-500">
                      Nessun avviso di manutenzione.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      <Modal
        open={modalOpen}
        onClose={closeModal}
        title={editingId ? 'Modifica Alert' : 'Nuovo Alert Manutenzione'}
      >
        <div className="space-y-4">
          {/* vehicle_id */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Veicolo (ID)</label>
            <input
              type="text"
              value={form.vehicle_id}
              onChange={(e) => handleChange('vehicle_id', e.target.value)}
              className="w-full rounded-xl bg-[#0f172a] border border-[#334155] px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="es. MI 567 CD"
            />
          </div>

          {/* type */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Tipo</label>
            <input
              type="text"
              value={form.type}
              onChange={(e) => handleChange('type', e.target.value)}
              className="w-full rounded-xl bg-[#0f172a] border border-[#334155] px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="es. Pastiglie freno"
            />
          </div>

          {/* description */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Descrizione</label>
            <textarea
              value={form.description}
              onChange={(e) => handleChange('description', e.target.value)}
              rows={2}
              className="w-full rounded-xl bg-[#0f172a] border border-[#334155] px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
              placeholder="Dettagli opzionali..."
            />
          </div>

          {/* urgency */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Urgenza</label>
            <select
              value={form.urgency}
              onChange={(e) => handleChange('urgency', e.target.value)}
              className="w-full rounded-xl bg-[#0f172a] border border-[#334155] px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="low">Bassa</option>
              <option value="medium">Media</option>
              <option value="high">Alta</option>
              <option value="critical">Critica</option>
            </select>
          </div>

          {/* km_threshold */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Soglia Km</label>
            <input
              type="number"
              value={form.km_threshold}
              onChange={(e) => handleChange('km_threshold', e.target.value)}
              className="w-full rounded-xl bg-[#0f172a] border border-[#334155] px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="es. 5000"
            />
          </div>

          {/* due_date */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Scadenza</label>
            <input
              type="date"
              value={form.due_date}
              onChange={(e) => handleChange('due_date', e.target.value)}
              className="w-full rounded-xl bg-[#0f172a] border border-[#334155] px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {/* resolved */}
          <div className="flex items-center gap-2">
            <input
              id="resolved"
              type="checkbox"
              checked={form.resolved}
              onChange={(e) => handleChange('resolved', e.target.checked)}
              className="h-4 w-4 rounded border-[#334155] bg-[#0f172a] text-primary-500 focus:ring-primary-500"
            />
            <label htmlFor="resolved" className="text-sm font-medium text-slate-300">
              Risolto
            </label>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-2">
            <div>
              {editingId && (
                <button
                  type="button"
                  onClick={() => setConfirmDeleteId(editingId)}
                  className="text-sm text-red-400 hover:text-red-300 transition-colors"
                >
                  Elimina
                </button>
              )}
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={closeModal}
                className="px-4 py-2 rounded-xl text-sm text-slate-300 hover:text-white transition-colors"
              >
                Annulla
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving || !form.vehicle_id || !form.type}
                className="px-4 py-2 rounded-xl bg-primary-600 hover:bg-primary-500 text-white text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {saving ? 'Salvataggio...' : editingId ? 'Salva' : 'Aggiungi'}
              </button>
            </div>
          </div>
        </div>
      </Modal>

      {/* Delete confirmation modal */}
      <Modal
        open={confirmDeleteId !== null}
        onClose={() => setConfirmDeleteId(null)}
        title="Conferma eliminazione"
      >
        <p className="text-sm text-slate-300 mb-6">
          Sei sicuro di voler eliminare questo alert di manutenzione? L'azione non può essere annullata.
        </p>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() => setConfirmDeleteId(null)}
            className="px-4 py-2 rounded-xl text-sm text-slate-300 hover:text-white transition-colors"
          >
            Annulla
          </button>
          <button
            type="button"
            onClick={() => confirmDeleteId && handleDelete(confirmDeleteId)}
            disabled={saving}
            className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-sm font-medium transition-colors disabled:opacity-40"
          >
            {saving ? 'Eliminazione...' : 'Elimina'}
          </button>
        </div>
      </Modal>
    </div>
  )
}
