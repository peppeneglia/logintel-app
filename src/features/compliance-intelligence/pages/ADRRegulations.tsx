import { useState, useEffect, useCallback, type FormEvent } from 'react'
import { AlertTriangle, Plus, Pencil, Trash2 } from 'lucide-react'
import { mockADRShipments } from '../../../data/mockComplianceData'
import { useAuthStore } from '../../../stores/authStore'
import { Modal } from '../../../components/Modal'
import { getADRShipments, addADRShipment, updateADRShipment, deleteADRShipment } from '../../../services/compliance'
import type { ADRShipmentRow, ADRShipmentInput } from '../../../services/compliance'
import { isValidWeight } from '../../../lib/validation'
import type { ValidationError } from '../../../lib/validation'

// ── Status maps ──

const compliantBadge: Record<string, string> = {
  true: 'bg-emerald-500/10 text-emerald-400',
  false: 'bg-red-500/10 text-red-400',
  // legacy mock statuses
  compliant: 'bg-emerald-500/10 text-emerald-400',
  pending_review: 'bg-amber-500/10 text-amber-400',
  issue: 'bg-red-500/10 text-red-400',
}

const compliantLabel: Record<string, string> = {
  true: 'Conforme',
  false: 'Non Conforme',
  compliant: 'Conforme',
  pending_review: 'In revisione',
  issue: 'Problema',
}

// ── Unified display type ──

interface DisplayShipment {
  id: string
  adr_class: string
  cargo_description: string
  weight_kg: number
  driver: string
  date: string
  compliant: boolean
  badgeKey: string
}

function mockToDisplay(s: (typeof mockADRShipments)[number]): DisplayShipment {
  return {
    id: s.id,
    adr_class: s.adrClass,
    cargo_description: s.description,
    weight_kg: 0,
    driver: s.driver,
    date: s.date,
    compliant: s.status === 'compliant',
    badgeKey: s.status,
  }
}

function rowToDisplay(s: ADRShipmentRow): DisplayShipment {
  return {
    id: s.id,
    adr_class: s.adr_class,
    cargo_description: s.cargo_description,
    weight_kg: s.weight_kg,
    driver: s.driver,
    date: s.date,
    compliant: s.compliant,
    badgeKey: String(s.compliant),
  }
}

// ── Empty form defaults ──

const emptyForm = {
  adr_class: '',
  cargo_description: '',
  weight_kg: 0,
  driver: '',
  date: new Date().toISOString().slice(0, 10),
  compliant: true,
}

// ── Input component ──

const inputCls =
  'w-full px-3 py-2 bg-[#334155] border border-slate-600 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500'

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-300 mb-1">{label}</label>
      {children}
    </div>
  )
}

// ── Main component ──

export function ADRRegulations() {
  const isDemo = useAuthStore((s) => s.isDemo)
  const userId = useAuthStore((s) => s.user?.id)

  const [supabaseData, setSupabaseData] = useState<ADRShipmentRow[]>([])
  const [loading, setLoading] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<ValidationError[]>([])

  // ── Fetch from Supabase ──

  const fetchData = useCallback(async () => {
    if (isDemo || !userId) return
    setLoading(true)
    try {
      const rows = await getADRShipments(userId)
      setSupabaseData(rows)
    } finally {
      setLoading(false)
    }
  }, [isDemo, userId])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // ── Display shipments ──

  const shipments: DisplayShipment[] = isDemo
    ? mockADRShipments.map(mockToDisplay)
    : supabaseData.map(rowToDisplay)

  // ── Modal handlers ──

  function openAdd() {
    setEditingId(null)
    setForm(emptyForm)
    setErrors([])
    setModalOpen(true)
  }

  function openEdit(s: DisplayShipment) {
    if (isDemo) return
    setEditingId(s.id)
    setForm({
      adr_class: s.adr_class,
      cargo_description: s.cargo_description,
      weight_kg: s.weight_kg,
      driver: s.driver,
      date: s.date,
      compliant: s.compliant,
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

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!userId) return

    const validationErrors: ValidationError[] = []
    if (!form.adr_class.trim()) validationErrors.push({ field: 'adr_class', message: 'La classe ADR è obbligatoria' })
    if (!form.cargo_description.trim()) validationErrors.push({ field: 'cargo_description', message: 'La descrizione del carico è obbligatoria' })
    if (form.weight_kg <= 0 || !isValidWeight(form.weight_kg)) validationErrors.push({ field: 'weight_kg', message: 'Il peso deve essere maggiore di 0 (max 100.000 kg)' })
    if (!form.driver.trim()) validationErrors.push({ field: 'driver', message: "L'autista è obbligatorio" })
    if (!form.date) validationErrors.push({ field: 'date', message: 'La data è obbligatoria' })
    if (validationErrors.length > 0) { setErrors(validationErrors); return }
    setErrors([])

    setSaving(true)
    try {
      const input: ADRShipmentInput = {
        user_id: userId,
        delivery_id: null,
        adr_class: form.adr_class.trim(),
        cargo_description: form.cargo_description.trim(),
        weight_kg: Number(form.weight_kg),
        driver: form.driver.trim(),
        date: form.date,
        compliant: form.compliant,
      }
      if (editingId) {
        await updateADRShipment(editingId, input)
      } else {
        await addADRShipment(input)
      }
      closeModal()
      await fetchData()
    } catch (err) {
      console.error('Errore salvataggio spedizione ADR:', err)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm('Eliminare questa spedizione? L\'operazione non è reversibile.')) return
    try {
      await deleteADRShipment(id)
      await fetchData()
    } catch (err) {
      console.error('Errore eliminazione spedizione ADR:', err)
    }
  }

  // ── Render ──

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-400 to-cyan-500 bg-clip-text text-transparent">
          Normative ADR
        </h1>
        {isDemo ? (
          <button
            disabled
            title="Disponibile solo con un account registrato"
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-700 text-slate-500 rounded-xl text-sm font-medium cursor-not-allowed"
          >
            <Plus size={16} /> Aggiungi
          </button>
        ) : (
          <button
            onClick={openAdd}
            className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-700 text-white rounded-xl text-sm font-medium hover:from-emerald-600 hover:to-emerald-800 transition-colors"
          >
            <Plus size={16} /> Aggiungi
          </button>
        )}
      </div>

      <div className="bg-[#1e293b] rounded-2xl border border-[#334155] p-6">
        <h2 className="text-sm font-semibold text-slate-300 mb-4">Spedizioni merci pericolose</h2>

        {loading ? (
          <p className="text-sm text-slate-500 py-8 text-center">Caricamento...</p>
        ) : shipments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-14 h-14 rounded-2xl bg-slate-800 flex items-center justify-center mb-4">
              <AlertTriangle size={28} className="text-slate-600" />
            </div>
            <p className="text-white font-semibold mb-1">Nessuna spedizione ADR registrata</p>
            <p className="text-sm text-slate-500 mb-5 max-w-xs">
              Aggiungi la prima spedizione ADR per monitorare la conformità delle merci pericolose.
            </p>
            {!isDemo && (
              <button
                onClick={openAdd}
                className="flex items-center gap-1.5 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-700 text-white rounded-xl text-sm font-medium hover:from-emerald-600 hover:to-emerald-800 transition-colors"
              >
                <Plus size={16} /> Aggiungi
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#334155]">
                  <th className="text-left py-3 px-3 font-medium text-slate-400">Classe ADR</th>
                  <th className="text-left py-3 px-3 font-medium text-slate-400">Descrizione Carico</th>
                  <th className="text-right py-3 px-3 font-medium text-slate-400">Peso (kg)</th>
                  <th className="text-left py-3 px-3 font-medium text-slate-400">Autista</th>
                  <th className="text-left py-3 px-3 font-medium text-slate-400">Data</th>
                  <th className="text-left py-3 px-3 font-medium text-slate-400">Conforme</th>
                  {!isDemo && (
                    <th className="text-center py-3 px-3 font-medium text-slate-400">Azioni</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {shipments.map((shipment) => (
                  <tr
                    key={shipment.id}
                    className={`border-b border-[#334155] ${!isDemo ? 'cursor-pointer hover:bg-[#253347] transition-colors' : ''}`}
                    onClick={() => openEdit(shipment)}
                  >
                    <td className="py-3 px-3 text-white font-medium">{shipment.adr_class}</td>
                    <td className="py-3 px-3 text-slate-300">{shipment.cargo_description}</td>
                    <td className="py-3 px-3 text-right text-slate-300">
                      {shipment.weight_kg > 0 ? shipment.weight_kg.toLocaleString('it-IT') : '\u2014'}
                    </td>
                    <td className="py-3 px-3 text-slate-300">{shipment.driver}</td>
                    <td className="py-3 px-3 text-slate-400">{shipment.date}</td>
                    <td className="py-3 px-3">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${compliantBadge[shipment.badgeKey] || 'bg-slate-500/10 text-slate-400'}`}>
                        {compliantLabel[shipment.badgeKey] || (shipment.compliant ? 'Conforme' : 'Non Conforme')}
                      </span>
                    </td>
                    {!isDemo && (
                      <td className="py-3 px-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={(e) => { e.stopPropagation(); openEdit(shipment) }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#334155] transition-colors"
                            title="Modifica"
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDelete(shipment.id) }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                            title="Elimina"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    )}
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
        title={editingId ? 'Modifica spedizione ADR' : 'Nuova spedizione ADR'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Classe ADR">
              <input
                required
                value={form.adr_class}
                onChange={(e) => setForm((p) => ({ ...p, adr_class: e.target.value }))}
                placeholder="es. 3"
                className={`${inputCls} ${fieldError('adr_class') ? 'border-red-500' : ''}`}
              />
              {fieldError('adr_class') && <p className="text-xs text-red-400 mt-1">{fieldError('adr_class')}</p>}
            </Field>
            <Field label="Peso (kg)">
              <input
                type="number"
                required
                min={0}
                value={form.weight_kg}
                onChange={(e) => setForm((p) => ({ ...p, weight_kg: Number(e.target.value) }))}
                className={`${inputCls} ${fieldError('weight_kg') ? 'border-red-500' : ''}`}
              />
              {fieldError('weight_kg') && <p className="text-xs text-red-400 mt-1">{fieldError('weight_kg')}</p>}
            </Field>
          </div>

          <Field label="Descrizione Carico">
            <input
              required
              value={form.cargo_description}
              onChange={(e) => setForm((p) => ({ ...p, cargo_description: e.target.value }))}
              placeholder="es. Benzina"
              className={`${inputCls} ${fieldError('cargo_description') ? 'border-red-500' : ''}`}
            />
            {fieldError('cargo_description') && <p className="text-xs text-red-400 mt-1">{fieldError('cargo_description')}</p>}
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Autista">
              <input
                required
                value={form.driver}
                onChange={(e) => setForm((p) => ({ ...p, driver: e.target.value }))}
                placeholder="es. Marco Bianchi"
                className={`${inputCls} ${fieldError('driver') ? 'border-red-500' : ''}`}
              />
              {fieldError('driver') && <p className="text-xs text-red-400 mt-1">{fieldError('driver')}</p>}
            </Field>
            <Field label="Data">
              <input
                type="date"
                required
                value={form.date}
                onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))}
                className={`${inputCls} ${fieldError('date') ? 'border-red-500' : ''}`}
              />
              {fieldError('date') && <p className="text-xs text-red-400 mt-1">{fieldError('date')}</p>}
            </Field>
          </div>

          <Field label="Conforme">
            <select
              value={form.compliant ? 'true' : 'false'}
              onChange={(e) => setForm((p) => ({ ...p, compliant: e.target.value === 'true' }))}
              className={inputCls}
            >
              <option value="true">Conforme</option>
              <option value="false">Non Conforme</option>
            </select>
          </Field>

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
    </div>
  )
}
