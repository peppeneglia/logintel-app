import { useState, useEffect, useCallback, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Clock, Plus, Pencil, Trash2 } from 'lucide-react'
import { mockDeliveryWindows } from '../../../data/mockDeliveryData'
import { useAuthStore } from '../../../stores/authStore'
import { useCredits } from '../../../hooks/useCredits'
import { CREDIT_COSTS } from '../../../lib/creditCosts'
import { Modal } from '../../../components/Modal'
import { CreditConfirmModal } from '../../../components/CreditConfirmModal'
import {
  getDeliveries,
  getDeliveryWindows,
  addDeliveryWindow,
  updateDeliveryWindow,
  deleteDeliveryWindow,
} from '../../../services/delivery'
import type { DeliveryRow, DeliveryWindowRow, DeliveryWindowInput } from '../../../services/delivery'
import { isDateAfter } from '../../../lib/validation'
import type { ValidationError } from '../../../lib/validation'
import { Field, inputCls } from '../../../components/FormFields'

// ── Unified display type ──

interface DisplayWindow {
  id: string
  delivery_id: string
  delivery_label: string
  window_start: string
  window_end: string
  met: boolean
  notes: string
}

function mockToDisplay(w: (typeof mockDeliveryWindows)[number]): DisplayWindow {
  return {
    id: w.id,
    delivery_id: '',
    delivery_label: w.client,
    window_start: w.windowStart,
    window_end: w.windowEnd,
    met: w.status === 'confirmed',
    notes: '',
  }
}

function rowToDisplay(r: DeliveryWindowRow, deliveryLabel: string): DisplayWindow {
  return {
    id: r.id,
    delivery_id: r.delivery_id,
    delivery_label: deliveryLabel,
    window_start: r.window_start,
    window_end: r.window_end,
    met: r.met,
    notes: r.notes ?? '',
  }
}

// ── Empty form ──

const emptyForm = {
  id: '',
  delivery_id: '',
  window_start: '',
  window_end: '',
  met: false,
  notes: '',
}

type FormState = typeof emptyForm

// ── Main component ──

export function DeliveryWindows() {
  const isDemo = useAuthStore((s) => s.isDemo)
  const userId = useAuthStore((s) => s.user?.id)
  const navigate = useNavigate()
  const { creditsRemaining, dailyLimit, extraCredits, canAfford, consume } = useCredits()

  const [deliveries, setDeliveries] = useState<DeliveryRow[]>([])
  const [windowRows, setWindowRows] = useState<DeliveryWindowRow[]>([])
  const [loading] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<FormState>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<ValidationError[]>([])
  const [showCreditModal, setShowCreditModal] = useState(false)
  const [pendingCreditCost, setPendingCreditCost] = useState(0)

  // ── Fetch ──

  const fetchData = useCallback(async () => {
    if (isDemo || !userId) return
    try {
      const rows = await getDeliveries(userId)
      setDeliveries(rows)
      // Fetch windows for all deliveries
      const allWindows: DeliveryWindowRow[] = []
      for (const d of rows) {
        const w = await getDeliveryWindows(d.id)
        allWindows.push(...w)
      }
      setWindowRows(allWindows)
      consume(CREDIT_COSTS.DELIVERY_LOAD, 'DELIVERY_LOAD')
    } catch {
      // silently fail on background refresh
    }
  }, [isDemo, userId])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // ── Display data ──

  const deliveryLabelMap = new Map(deliveries.map((d) => [d.id, `${d.customer} (${d.origin} → ${d.destination})`]))

  const windows: DisplayWindow[] = isDemo
    ? mockDeliveryWindows.map(mockToDisplay)
    : windowRows.map((r) => rowToDisplay(r, deliveryLabelMap.get(r.delivery_id) ?? r.delivery_id))

  // ── Modal handlers ──

  function openAdd() {
    setEditingId(null)
    setForm(emptyForm)
    setErrors([])
    setModalOpen(true)
  }

  function openEdit(w: DisplayWindow) {
    setEditingId(w.id)
    setForm({
      id: w.id,
      delivery_id: w.delivery_id,
      window_start: w.window_start,
      window_end: w.window_end,
      met: w.met,
      notes: w.notes,
    })
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

  function updateFormField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!userId) return

    const validationErrors: ValidationError[] = []
    if (!form.delivery_id) validationErrors.push({ field: 'delivery_id', message: 'La consegna è obbligatoria' })
    if (!form.window_start) validationErrors.push({ field: 'window_start', message: "L'inizio finestra è obbligatorio" })
    if (!form.window_end) validationErrors.push({ field: 'window_end', message: 'La fine finestra è obbligatoria' })
    if (form.window_start && form.window_end && !isDateAfter(form.window_end, form.window_start)) {
      validationErrors.push({ field: 'window_end', message: 'La fine finestra deve essere dopo l\'inizio' })
    }
    if (validationErrors.length > 0) { setErrors(validationErrors); return }
    setErrors([])

    setSaving(true)
    try {
      const input: DeliveryWindowInput = {
        user_id: userId,
        delivery_id: form.delivery_id,
        window_start: form.window_start,
        window_end: form.window_end,
        met: form.met,
        notes: form.notes.trim() || null,
      }
      if (editingId) {
        await updateDeliveryWindow(editingId, input)
      } else {
        if (!canAfford(CREDIT_COSTS.DELIVERY_ADD)) {
          setPendingCreditCost(CREDIT_COSTS.DELIVERY_ADD)
          setShowCreditModal(true)
          setSaving(false)
          return
        }
        await addDeliveryWindow(input)
        await consume(CREDIT_COSTS.DELIVERY_ADD, 'DELIVERY_ADD')
      }
      closeModal()
      await fetchData()
    } catch (err) {
      console.error('Errore salvataggio finestra:', err)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm('Eliminare questa finestra di consegna? L\'operazione non è reversibile.')) return
    try {
      await deleteDeliveryWindow(id)
      await fetchData()
    } catch (err) {
      console.error('Errore eliminazione finestra:', err)
    }
  }

  // ── Render ──

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-400 to-cyan-500 bg-clip-text text-transparent">
          Finestre di Consegna
        </h1>
        <button
          onClick={openAdd}
          className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-700 text-white rounded-xl text-sm font-medium hover:from-emerald-600 hover:to-emerald-800 transition-colors"
        >
          <Plus size={16} /> Aggiungi
        </button>
      </div>

      <div className="bg-[#1e293b] rounded-2xl border border-[#334155] p-6">
        {loading ? (
          <p className="text-sm text-slate-500 py-8 text-center">Caricamento...</p>
        ) : windows.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-14 h-14 rounded-2xl bg-slate-800 flex items-center justify-center mb-4">
              <Clock size={28} className="text-slate-600" />
            </div>
            <p className="text-white font-semibold mb-1">Nessuna finestra di consegna</p>
            <p className="text-sm text-slate-500 mb-5 max-w-xs">
              Aggiungi una finestra di consegna per monitorare il rispetto degli slot orari.
            </p>
            <button
              onClick={openAdd}
              className="flex items-center gap-1.5 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-700 text-white rounded-xl text-sm font-medium hover:from-emerald-600 hover:to-emerald-800 transition-colors"
            >
              <Plus size={16} /> Aggiungi finestra
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#334155]">
                  <th className="text-left py-3 px-3 font-medium text-slate-400">Consegna</th>
                  <th className="text-left py-3 px-3 font-medium text-slate-400">Inizio Finestra</th>
                  <th className="text-left py-3 px-3 font-medium text-slate-400">Fine Finestra</th>
                  <th className="text-left py-3 px-3 font-medium text-slate-400">Rispettata</th>
                  <th className="text-left py-3 px-3 font-medium text-slate-400">Note</th>
                  <th className="text-center py-3 px-3 font-medium text-slate-400">Azioni</th>
                </tr>
              </thead>
              <tbody>
                {windows.map((w) => (
                  <tr
                    key={w.id}
                    className="border-b border-[#334155] cursor-pointer hover:bg-[#253347] transition-colors"
                    onClick={() => openEdit(w)}
                  >
                    <td className="py-3 px-3 text-white font-medium">{w.delivery_label}</td>
                    <td className="py-3 px-3 text-slate-400">{w.window_start}</td>
                    <td className="py-3 px-3 text-slate-400">{w.window_end}</td>
                    <td className="py-3 px-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${w.met ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                        {w.met ? 'Sì' : 'No'}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-300 max-w-xs truncate" title={w.notes}>
                      {w.notes || '\u2014'}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={(e) => { e.stopPropagation(); openEdit(w) }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#334155] transition-colors"
                          title="Modifica"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDelete(w.id) }}
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
        title={editingId ? 'Modifica finestra' : 'Nuova finestra di consegna'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Consegna" error={fieldError('delivery_id')}>
            <select
              required
              value={form.delivery_id}
              onChange={(e) => updateFormField('delivery_id', e.target.value)}
              className={`${inputCls} ${fieldError('delivery_id') ? 'border-red-500' : ''}`}
            >
              <option value="">Seleziona una consegna...</option>
              {deliveries.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.customer} ({d.origin} &rarr; {d.destination})
                </option>
              ))}
            </select>
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Inizio Finestra" error={fieldError('window_start')}>
              <input
                type="datetime-local"
                required
                value={form.window_start}
                onChange={(e) => updateFormField('window_start', e.target.value)}
                className={`${inputCls} ${fieldError('window_start') ? 'border-red-500' : ''}`}
              />
            </Field>
            <Field label="Fine Finestra" error={fieldError('window_end')}>
              <input
                type="datetime-local"
                required
                value={form.window_end}
                onChange={(e) => updateFormField('window_end', e.target.value)}
                className={`${inputCls} ${fieldError('window_end') ? 'border-red-500' : ''}`}
              />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Rispettata">
              <select
                value={form.met ? 'true' : 'false'}
                onChange={(e) => updateFormField('met', e.target.value === 'true')}
                className={inputCls}
              >
                <option value="false">No</option>
                <option value="true">Sì</option>
              </select>
            </Field>
            <Field label="Note">
              <textarea
                value={form.notes}
                onChange={(e) => updateFormField('notes', e.target.value)}
                rows={2}
                placeholder="Note aggiuntive..."
                className={inputCls + ' resize-none'}
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
