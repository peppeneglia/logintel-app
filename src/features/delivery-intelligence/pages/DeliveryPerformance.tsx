import { useState, useEffect, useCallback, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Package, Plus, Pencil, Trash2 } from 'lucide-react'
import { mockDeliveries } from '../../../data/mockDeliveryData'
import { useAuthStore } from '../../../stores/authStore'
import { useCredits } from '../../../hooks/useCredits'
import { CREDIT_COSTS } from '../../../lib/creditCosts'
import { Modal } from '../../../components/Modal'
import { CreditConfirmModal } from '../../../components/CreditConfirmModal'
import { getDeliveries, addDelivery, updateDelivery, deleteDelivery } from '../../../services/delivery'
import type { DeliveryRow, DeliveryInput } from '../../../services/delivery'
import { validateDeliveryForm } from '../../../lib/validation'
import type { ValidationError } from '../../../lib/validation'
import { Field, NumericInput } from '../../../components/FormFields'
import { inputCls } from '../../../lib/formConstants'

// ── Status maps ──

const statusBadge: Record<string, string> = {
  pending: 'bg-slate-500/10 text-slate-400',
  in_transit: 'bg-amber-500/10 text-amber-400',
  delivered: 'bg-emerald-500/10 text-emerald-400',
  cancelled: 'bg-red-500/10 text-red-400',
  // legacy mock statuses
  on_time: 'bg-emerald-500/10 text-emerald-400',
  early: 'bg-emerald-500/10 text-emerald-400',
  late: 'bg-red-500/10 text-red-400',
}

const statusLabel: Record<string, string> = {
  pending: 'In attesa',
  in_transit: 'In transito',
  delivered: 'Consegnato',
  cancelled: 'Annullato',
  on_time: 'Puntuale',
  early: 'In anticipo',
  late: 'In ritardo',
}

const statusOptions = [
  { value: 'pending', label: 'In attesa' },
  { value: 'in_transit', label: 'In transito' },
  { value: 'delivered', label: 'Consegnato' },
  { value: 'cancelled', label: 'Annullato' },
]

// ── Unified display type ──

interface DisplayDelivery {
  id: string
  customer: string
  origin: string
  destination: string
  departure_date: string
  scheduled_delivery_date: string
  actual_delivery_date: string
  weight_kg: number
  status: string
  driver: string
}

function mockToDisplay(v: (typeof mockDeliveries)[number]): DisplayDelivery {
  return {
    id: v.id,
    customer: v.client,
    origin: v.origin,
    destination: v.destination,
    departure_date: '',
    scheduled_delivery_date: v.scheduledDelivery,
    actual_delivery_date: v.actualDelivery ?? '',
    weight_kg: 0,
    status: v.status,
    driver: v.driver,
  }
}

function rowToDisplay(r: DeliveryRow): DisplayDelivery {
  return {
    id: r.id,
    customer: r.customer,
    origin: r.origin,
    destination: r.destination,
    departure_date: r.departure_date,
    scheduled_delivery_date: r.scheduled_delivery_date,
    actual_delivery_date: r.actual_delivery_date ?? '',
    weight_kg: r.weight_kg ?? 0,
    status: r.status,
    driver: r.driver ?? '',
  }
}

// ── Empty form ──

const emptyForm: DisplayDelivery = {
  id: '',
  customer: '',
  origin: '',
  destination: '',
  departure_date: '',
  scheduled_delivery_date: '',
  actual_delivery_date: '',
  weight_kg: 0,
  status: 'pending',
  driver: '',
}

// ── Main component ──

export function DeliveryPerformance() {
  const isDemo = useAuthStore((s) => s.isDemo)
  const userId = useAuthStore((s) => s.user?.id)
  const navigate = useNavigate()
  const { creditsRemaining, dailyLimit, extraCredits, canAfford, consume } = useCredits()

  const [supabaseData, setSupabaseData] = useState<DeliveryRow[]>([])
  const [loading] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<DisplayDelivery>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<ValidationError[]>([])
  const [showCreditModal, setShowCreditModal] = useState(false)
  const [pendingCreditCost, setPendingCreditCost] = useState(0)

  // ── Fetch from Supabase ──

  const fetchData = useCallback(async () => {
    if (isDemo || !userId) return
    try {
      const rows = await getDeliveries(userId)
      setSupabaseData(rows)
      consume(CREDIT_COSTS.DELIVERY_LOAD, 'DELIVERY_LOAD')
    } catch {
      // silently fail on background refresh
    }
  }, [isDemo, userId, consume])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // ── Display deliveries ──

  const deliveries: DisplayDelivery[] = isDemo
    ? mockDeliveries.map(mockToDisplay)
    : supabaseData.map(rowToDisplay)

  // ── KPI ──

  const completed = deliveries.filter((d) =>
    ['on_time', 'early', 'late', 'delivered'].includes(d.status)
  )
  const onTime = completed.filter((d) =>
    ['on_time', 'early', 'delivered'].includes(d.status)
  )
  const onTimePercent = completed.length > 0
    ? Math.round((onTime.length / completed.length) * 100)
    : 0

  const summaryCards = [
    { label: 'Totale consegne', value: deliveries.length.toString(), color: 'text-white' },
    { label: 'Puntuali', value: `${onTimePercent}%`, color: 'text-emerald-400' },
    { label: 'In ritardo', value: `${completed.length > 0 ? 100 - onTimePercent : 0}%`, color: 'text-red-400' },
  ]

  // ── Modal handlers ──

  function openAdd() {
    setEditingId(null)
    setForm(emptyForm)
    setErrors([])
    setModalOpen(true)
  }

  function openEdit(d: DisplayDelivery) {
    setEditingId(d.id)
    setForm({ ...d })
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

  function updateField<K extends keyof DisplayDelivery>(key: K, value: DisplayDelivery[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!userId) return

    const validationErrors = validateDeliveryForm(form)
    if (validationErrors.length > 0) { setErrors(validationErrors); return }
    setErrors([])

    setSaving(true)
    try {
      const input: DeliveryInput = {
        user_id: userId,
        customer: form.customer.trim(),
        origin: form.origin.trim(),
        destination: form.destination.trim(),
        departure_date: form.departure_date,
        scheduled_delivery_date: form.scheduled_delivery_date,
        actual_delivery_date: form.actual_delivery_date || null,
        weight_kg: form.weight_kg > 0 ? Number(form.weight_kg) : null,
        status: form.status,
        driver: form.driver.trim() || null,
        vehicle_id: null,
      }
      if (editingId) {
        await updateDelivery(editingId, input)
        await consume(CREDIT_COSTS.DELIVERY_UPDATE, 'DELIVERY_UPDATE')
      } else {
        if (!canAfford(CREDIT_COSTS.DELIVERY_ADD)) {
          setPendingCreditCost(CREDIT_COSTS.DELIVERY_ADD)
          setShowCreditModal(true)
          setSaving(false)
          return
        }
        await addDelivery(input)
        await consume(CREDIT_COSTS.DELIVERY_ADD, 'DELIVERY_ADD')
      }
      closeModal()
      await fetchData()
    } catch (err) {
      console.error('Errore salvataggio consegna:', err)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm('Eliminare questa consegna? L\'operazione non è reversibile.')) return
    try {
      await deleteDelivery(id)
      await fetchData()
    } catch (err) {
      console.error('Errore eliminazione consegna:', err)
    }
  }

  // ── Render ──

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-400 to-cyan-500 bg-clip-text text-transparent">
          Performance Consegne
        </h1>
        <button
          onClick={openAdd}
          className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-700 text-white rounded-xl text-sm font-medium hover:from-emerald-600 hover:to-emerald-800 transition-colors"
        >
          <Plus size={16} /> Aggiungi
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-3">
        {summaryCards.map((card) => (
          <div key={card.label} className="bg-[#1e293b] rounded-2xl border border-[#334155] p-4">
            <p className="text-xs text-slate-400">{card.label}</p>
            <p className={`text-lg font-bold ${card.color}`}>{card.value}</p>
          </div>
        ))}
      </div>

      {/* Deliveries Table */}
      <div className="bg-[#1e293b] rounded-2xl border border-[#334155] p-6">
        <h2 className="text-sm font-semibold text-slate-300 mb-4">Consegne recenti</h2>

        {loading ? (
          <p className="text-sm text-slate-500 py-8 text-center">Caricamento...</p>
        ) : deliveries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-14 h-14 rounded-2xl bg-slate-800 flex items-center justify-center mb-4">
              <Package size={28} className="text-slate-600" />
            </div>
            <p className="text-white font-semibold mb-1">Nessuna consegna registrata</p>
            <p className="text-sm text-slate-500 mb-5 max-w-xs">
              Aggiungi la prima consegna per iniziare a monitorare le performance.
            </p>
            <button
              onClick={openAdd}
              className="flex items-center gap-1.5 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-700 text-white rounded-xl text-sm font-medium hover:from-emerald-600 hover:to-emerald-800 transition-colors"
            >
              <Plus size={16} /> Aggiungi consegna
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#334155]">
                  <th className="text-left py-3 px-3 font-medium text-slate-400">Cliente</th>
                  <th className="text-left py-3 px-3 font-medium text-slate-400">Rotta</th>
                  <th className="text-left py-3 px-3 font-medium text-slate-400">Consegna Prevista</th>
                  <th className="text-left py-3 px-3 font-medium text-slate-400">Consegna Effettiva</th>
                  <th className="text-left py-3 px-3 font-medium text-slate-400">Stato</th>
                  <th className="text-left py-3 px-3 font-medium text-slate-400">Autista</th>
                  <th className="text-center py-3 px-3 font-medium text-slate-400">Azioni</th>
                </tr>
              </thead>
              <tbody>
                {deliveries.map((d) => (
                  <tr
                    key={d.id}
                    className="border-b border-[#334155] cursor-pointer hover:bg-[#253347] transition-colors"
                    onClick={() => openEdit(d)}
                  >
                    <td className="py-3 px-3 text-white font-medium">{d.customer}</td>
                    <td className="py-3 px-3 text-slate-300">{d.origin} &rarr; {d.destination}</td>
                    <td className="py-3 px-3 text-slate-400">{d.scheduled_delivery_date}</td>
                    <td className="py-3 px-3 text-slate-400">{d.actual_delivery_date || '\u2014'}</td>
                    <td className="py-3 px-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusBadge[d.status] ?? 'bg-slate-500/10 text-slate-400'}`}>
                        {statusLabel[d.status] ?? d.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-300">{d.driver || '\u2014'}</td>
                    <td className="py-3 px-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={(e) => { e.stopPropagation(); openEdit(d) }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#334155] transition-colors"
                          title="Modifica"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDelete(d.id) }}
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
        title={editingId ? 'Modifica consegna' : 'Nuova consegna'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Field label="Cliente" error={fieldError('customer')}>
              <input
                required
                value={form.customer}
                onChange={(e) => updateField('customer', e.target.value)}
                placeholder="es. Ferrero S.p.A."
                className={`${inputCls} ${fieldError('customer') ? 'border-red-500' : ''}`}
              />
            </Field>
            <Field label="Origine" error={fieldError('origin')}>
              <input
                required
                value={form.origin}
                onChange={(e) => updateField('origin', e.target.value)}
                placeholder="es. Torino"
                className={`${inputCls} ${fieldError('origin') ? 'border-red-500' : ''}`}
              />
            </Field>
            <Field label="Destinazione" error={fieldError('destination')}>
              <input
                required
                value={form.destination}
                onChange={(e) => updateField('destination', e.target.value)}
                placeholder="es. Milano"
                className={`${inputCls} ${fieldError('destination') ? 'border-red-500' : ''}`}
              />
            </Field>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Field label="Data Partenza" error={fieldError('departure_date')}>
              <input
                type="datetime-local"
                required
                value={form.departure_date}
                onChange={(e) => updateField('departure_date', e.target.value)}
                className={`${inputCls} ${fieldError('departure_date') ? 'border-red-500' : ''}`}
              />
            </Field>
            <Field label="Consegna Prevista" error={fieldError('scheduled_delivery_date')}>
              <input
                type="datetime-local"
                required
                value={form.scheduled_delivery_date}
                onChange={(e) => updateField('scheduled_delivery_date', e.target.value)}
                className={`${inputCls} ${fieldError('scheduled_delivery_date') ? 'border-red-500' : ''}`}
              />
            </Field>
            <Field label="Consegna Effettiva" error={fieldError('actual_delivery_date')}>
              <input
                type="datetime-local"
                value={form.actual_delivery_date}
                onChange={(e) => updateField('actual_delivery_date', e.target.value)}
                className={`${inputCls} ${fieldError('actual_delivery_date') ? 'border-red-500' : ''}`}
              />
            </Field>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Field label="Peso (kg)" error={fieldError('weight_kg')}>
              <NumericInput
                value={form.weight_kg}
                onChange={(val) => updateField('weight_kg', val)}
                max={999999}
                maxLength={6}
                step={0.1}
                placeholder="es. 1500"
                className={`${inputCls} ${fieldError('weight_kg') ? 'border-red-500' : ''}`}
              />
            </Field>
            <Field label="Stato">
              <select
                value={form.status}
                onChange={(e) => updateField('status', e.target.value)}
                className={inputCls}
              >
                {statusOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </Field>
            <Field label="Autista">
              <input
                value={form.driver}
                onChange={(e) => updateField('driver', e.target.value)}
                placeholder="es. Marco Bianchi"
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
