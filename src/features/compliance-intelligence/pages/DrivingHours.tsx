import { useState, useEffect, useCallback, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Clock, Plus, Pencil, Trash2 } from 'lucide-react'
import { mockDrivingHours } from '../../../data/mockComplianceData'
import { useAuthStore } from '../../../stores/authStore'
import { useCredits } from '../../../hooks/useCredits'
import { CREDIT_COSTS } from '../../../lib/creditCosts'
import { Modal } from '../../../components/Modal'
import { CreditConfirmModal } from '../../../components/CreditConfirmModal'
import {
  getDrivingHours, addDrivingHoursRecord, updateDrivingHoursRecord, deleteDrivingHoursRecord,
  checkDrivingViolation, MAX_DAILY_DRIVING_MINUTES,
} from '../../../services/compliance'
import type { DrivingHoursRow, DrivingHoursInput } from '../../../services/compliance'
import { validateDrivingHoursForm } from '../../../lib/validation'
import type { ValidationError } from '../../../lib/validation'
import { Field, NumericInput, inputCls } from '../../../components/FormFields'

// ── Status maps ──

const statusBadge: Record<string, string> = {
  ok: 'bg-emerald-500/10 text-emerald-400',
  warning: 'bg-amber-500/10 text-amber-400',
  violation: 'bg-red-500/10 text-red-400',
  // legacy mock statuses
  compliant: 'bg-emerald-500/10 text-emerald-400',
}

const statusLabel: Record<string, string> = {
  ok: 'Conforme',
  warning: 'Attenzione',
  violation: 'Violazione',
  compliant: 'Conforme',
}

// ── Unified display type ──

interface DisplayRecord {
  id: string
  driver: string
  date: string
  driving_minutes: number
  break_minutes: number
  start_time: string
  end_time: string
  rest_minutes_after: number
  status: string
}

function mockToDisplay(r: (typeof mockDrivingHours)[number]): DisplayRecord {
  return {
    id: r.id,
    driver: r.driver,
    date: r.date,
    driving_minutes: r.drivingMinutes,
    break_minutes: r.restMinutes,
    start_time: '06:00',
    end_time: '18:00',
    rest_minutes_after: r.remainingDrivingMinutes > 0 ? 600 : 300,
    status: r.status === 'compliant' ? 'ok' : r.status,
  }
}

function rowToDisplay(r: DrivingHoursRow): DisplayRecord {
  const status = checkDrivingViolation(r.driving_minutes, r.rest_minutes_after)
  return {
    id: r.id,
    driver: r.driver,
    date: r.date,
    driving_minutes: r.driving_minutes,
    break_minutes: r.break_minutes,
    start_time: r.start_time,
    end_time: r.end_time,
    rest_minutes_after: r.rest_minutes_after,
    status,
  }
}

// ── Helpers ──

function formatMinutes(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return `${h}:${m.toString().padStart(2, '0')}`
}

// ── Empty form defaults ──

const emptyForm: DisplayRecord = {
  id: '',
  driver: '',
  date: new Date().toISOString().slice(0, 10),
  driving_minutes: 0,
  break_minutes: 0,
  start_time: '06:00',
  end_time: '15:00',
  rest_minutes_after: 660,
  status: 'ok',
}

// ── Main component ──

export function DrivingHours() {
  const isDemo = useAuthStore((s) => s.isDemo)
  const userId = useAuthStore((s) => s.user?.id)
  const navigate = useNavigate()
  const { creditsRemaining, dailyLimit, extraCredits, canAfford, consume } = useCredits()

  const [supabaseData, setSupabaseData] = useState<DrivingHoursRow[]>([])
  const [loading, setLoading] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<DisplayRecord>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<ValidationError[]>([])
  const [showCreditModal, setShowCreditModal] = useState(false)
  const [pendingCreditCost, setPendingCreditCost] = useState(0)

  // ── Fetch from Supabase ──

  const fetchData = useCallback(async () => {
    if (isDemo || !userId) return
    setLoading(true)
    try {
      const rows = await getDrivingHours(userId)
      setSupabaseData(rows)
      await consume(CREDIT_COSTS.COMPLIANCE_HOURS_LOAD, 'COMPLIANCE_HOURS_LOAD')
    } finally {
      setLoading(false)
    }
  }, [isDemo, userId])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // ── Display records ──

  const records: DisplayRecord[] = isDemo
    ? mockDrivingHours.map(mockToDisplay)
    : supabaseData.map(rowToDisplay)

  // ── Summary counts ──

  const okCount = records.filter((r) => r.status === 'ok').length
  const warningCount = records.filter((r) => r.status === 'warning').length
  const violationCount = records.filter((r) => r.status === 'violation').length

  // ── Modal handlers ──

  function openAdd() {
    setEditingId(null)
    setForm(emptyForm)
    setErrors([])
    setModalOpen(true)
  }

  function openEdit(r: DisplayRecord) {
    setEditingId(r.id)
    setForm({ ...r })
    setErrors([])
    setModalOpen(true)
  }

  function closeModal() {
    setModalOpen(false)
    setEditingId(null)
    setForm(emptyForm)
    setErrors([])
  }

  function fieldError(field: string): string | undefined {
    return errors.find((e) => e.field === field)?.message
  }

  function updateField<K extends keyof DisplayRecord>(key: K, value: DisplayRecord[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!userId) return

    const validationErrors = validateDrivingHoursForm(form)
    if (validationErrors.length > 0) { setErrors(validationErrors); return }
    setErrors([])

    setSaving(true)
    try {
      const input: DrivingHoursInput = {
        user_id: userId,
        driver: form.driver.trim(),
        date: form.date,
        driving_minutes: Number(form.driving_minutes),
        break_minutes: Number(form.break_minutes),
        start_time: form.start_time,
        end_time: form.end_time,
        rest_minutes_after: Number(form.rest_minutes_after),
      }
      if (editingId) {
        await updateDrivingHoursRecord(editingId, input)
      } else {
        if (!canAfford(CREDIT_COSTS.COMPLIANCE_HOURS_ADD)) {
          setPendingCreditCost(CREDIT_COSTS.COMPLIANCE_HOURS_ADD)
          setShowCreditModal(true)
          setSaving(false)
          return
        }
        await addDrivingHoursRecord(input)
        await consume(CREDIT_COSTS.COMPLIANCE_HOURS_ADD, 'COMPLIANCE_HOURS_ADD')
      }
      closeModal()
      await fetchData()
    } catch (err) {
      console.error('Errore salvataggio ore guida:', err)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm('Eliminare questo record? L\'operazione non è reversibile.')) return
    try {
      await deleteDrivingHoursRecord(id)
      await fetchData()
    } catch (err) {
      console.error('Errore eliminazione ore guida:', err)
    }
  }

  // ── Render ──

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-400 to-cyan-500 bg-clip-text text-transparent">
          Ore Guida & Riposo
        </h1>
        <button
          onClick={openAdd}
          className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-700 text-white rounded-xl text-sm font-medium hover:from-emerald-600 hover:to-emerald-800 transition-colors"
        >
          <Plus size={16} /> Aggiungi
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
        <div className="bg-[#1e293b] rounded-2xl border border-[#334155] p-4">
          <p className="text-xs text-slate-400">Autisti conformi</p>
          <p className="text-xl font-bold text-emerald-400">{okCount}</p>
        </div>
        <div className="bg-[#1e293b] rounded-2xl border border-[#334155] p-4">
          <p className="text-xs text-slate-400">In warning</p>
          <p className="text-xl font-bold text-amber-400">{warningCount}</p>
        </div>
        <div className="bg-[#1e293b] rounded-2xl border border-[#334155] p-4">
          <p className="text-xs text-slate-400">In violazione</p>
          <p className="text-xl font-bold text-red-400">{violationCount}</p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#1e293b] rounded-2xl border border-[#334155] p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-slate-300">Dettaglio ore guida giornaliere</h2>
          <span className="text-xs text-slate-500">Max giornaliero EU: {formatMinutes(MAX_DAILY_DRIVING_MINUTES)}</span>
        </div>

        {loading ? (
          <p className="text-sm text-slate-500 py-8 text-center">Caricamento...</p>
        ) : records.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-14 h-14 rounded-2xl bg-slate-800 flex items-center justify-center mb-4">
              <Clock size={28} className="text-slate-600" />
            </div>
            <p className="text-white font-semibold mb-1">Nessun record registrato</p>
            <p className="text-sm text-slate-500 mb-5 max-w-xs">
              Aggiungi il primo record di ore guida per monitorare la conformità dei tuoi autisti.
            </p>
            <button
              onClick={openAdd}
              className="flex items-center gap-1.5 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-700 text-white rounded-xl text-sm font-medium hover:from-emerald-600 hover:to-emerald-800 transition-colors"
            >
              <Plus size={16} /> Aggiungi
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#334155]">
                  <th className="text-left py-3 px-3 font-medium text-slate-400">Autista</th>
                  <th className="text-left py-3 px-3 font-medium text-slate-400">Data</th>
                  <th className="text-left py-3 px-3 font-medium text-slate-400">Guida</th>
                  <th className="text-left py-3 px-3 font-medium text-slate-400">Pausa</th>
                  <th className="text-left py-3 px-3 font-medium text-slate-400">Inizio</th>
                  <th className="text-left py-3 px-3 font-medium text-slate-400">Fine</th>
                  <th className="text-left py-3 px-3 font-medium text-slate-400">Riposo Dopo</th>
                  <th className="text-left py-3 px-3 font-medium text-slate-400">Stato</th>
                  <th className="text-center py-3 px-3 font-medium text-slate-400">Azioni</th>
                </tr>
              </thead>
              <tbody>
                {records.map((record) => (
                  <tr
                    key={record.id}
                    className="border-b border-[#334155] cursor-pointer hover:bg-[#253347] transition-colors"
                    onClick={() => openEdit(record)}
                  >
                    <td className="py-3 px-3 text-white font-medium">{record.driver}</td>
                    <td className="py-3 px-3 text-slate-400">{record.date}</td>
                    <td className="py-3 px-3 text-slate-300">{formatMinutes(record.driving_minutes)}</td>
                    <td className="py-3 px-3 text-slate-300">{formatMinutes(record.break_minutes)}</td>
                    <td className="py-3 px-3 text-slate-300">{record.start_time}</td>
                    <td className="py-3 px-3 text-slate-300">{record.end_time}</td>
                    <td className="py-3 px-3 text-slate-300">{formatMinutes(record.rest_minutes_after)}</td>
                    <td className="py-3 px-3">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${statusBadge[record.status] || 'bg-slate-500/10 text-slate-400'}`}>
                        {statusLabel[record.status] || record.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={(e) => { e.stopPropagation(); openEdit(record) }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#334155] transition-colors"
                          title="Modifica"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDelete(record.id) }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                          title="Elimina"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      <Modal
        open={modalOpen}
        onClose={closeModal}
        title={editingId ? 'Modifica record' : 'Nuovo record ore guida'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <Field label="Autista" error={fieldError('driver')}>
              <input
                required
                value={form.driver}
                onChange={(e) => updateField('driver', e.target.value)}
                placeholder="es. Marco Bianchi"
                className={`${inputCls} ${fieldError('driver') ? 'border-red-500' : ''}`}
              />
            </Field>
            <Field label="Data" error={fieldError('date')}>
              <input
                type="date"
                required
                value={form.date}
                onChange={(e) => updateField('date', e.target.value)}
                className={`${inputCls} ${fieldError('date') ? 'border-red-500' : ''}`}
              />
            </Field>
            <Field label="Riposo Dopo (min)">
              <NumericInput
                value={form.rest_minutes_after}
                onChange={(val) => updateField('rest_minutes_after', val)}
                max={1440}
                maxLength={4}
                integer
                required
                className={inputCls}
              />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Minuti Guida" error={fieldError('driving_minutes')}>
              <NumericInput
                value={form.driving_minutes}
                onChange={(val) => updateField('driving_minutes', val)}
                max={1440}
                maxLength={4}
                integer
                required
                className={`${inputCls} ${fieldError('driving_minutes') ? 'border-red-500' : ''}`}
              />
            </Field>
            <Field label="Minuti Pausa" error={fieldError('break_minutes')}>
              <NumericInput
                value={form.break_minutes}
                onChange={(val) => updateField('break_minutes', val)}
                max={1440}
                maxLength={4}
                integer
                required
                className={`${inputCls} ${fieldError('break_minutes') ? 'border-red-500' : ''}`}
              />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Ora Inizio">
              <input
                type="time"
                required
                value={form.start_time}
                onChange={(e) => updateField('start_time', e.target.value)}
                className={inputCls}
              />
            </Field>
            <Field label="Ora Fine">
              <input
                type="time"
                required
                value={form.end_time}
                onChange={(e) => updateField('end_time', e.target.value)}
                className={inputCls}
              />
            </Field>
          </div>

          {errors.length > 0 && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
              <p className="text-sm font-medium text-red-400 mb-1">Correggi i seguenti errori:</p>
              <ul className="text-xs text-red-400 list-disc list-inside">
                {errors.map((err, i) => <li key={i}>{err.message}</li>)}
              </ul>
            </div>
          )}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={closeModal}
              className="px-4 py-2 border border-slate-600 rounded-xl text-sm font-medium text-slate-300 hover:bg-[#334155] transition-colors"
            >
              Annulla
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 bg-gradient-to-r from-emerald-500 to-emerald-700 text-white rounded-xl text-sm font-medium hover:from-emerald-600 hover:to-emerald-800 transition-colors disabled:opacity-50"
            >
              {saving ? 'Salvataggio...' : editingId ? 'Salva modifiche' : 'Aggiungi'}
            </button>
          </div>
        </form>
      </Modal>

      <CreditConfirmModal
        open={showCreditModal}
        creditsRemaining={creditsRemaining}
        dailyLimit={dailyLimit}
        extraCredits={extraCredits}
        cost={pendingCreditCost}
        onConfirm={() => setShowCreditModal(false)}
        onCancel={() => setShowCreditModal(false)}
        onUpgrade={() => { setShowCreditModal(false); navigate('/settings/plan') }}
        onBuyExtra={() => { setShowCreditModal(false); navigate('/settings/plan') }}
      />
    </div>
  )
}
