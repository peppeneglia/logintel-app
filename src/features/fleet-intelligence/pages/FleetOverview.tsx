import { useState, useEffect, useCallback, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Truck, CheckCircle, Wrench, XCircle, Plus, Pencil, Trash2 } from 'lucide-react'
import { mockFleetVehicles } from '../../../data/mockFleetData'
import { useAuthStore } from '../../../stores/authStore'
import { Modal } from '../../../components/Modal'
import { getVehicles, addVehicle, updateVehicle, deleteVehicle } from '../../../services/fleet'
import type { VehicleRow, VehicleInput } from '../../../services/fleet'
import { validateVehicleForm, isItalianPlateFormat } from '../../../lib/validation'
import type { ValidationError } from '../../../lib/validation'
import { useCredits } from '../../../hooks/useCredits'
import { CREDIT_COSTS } from '../../../lib/creditCosts'
import { CreditConfirmModal } from '../../../components/CreditConfirmModal'

// ── Status maps ──

const statusBadge: Record<string, string> = {
  ok: 'bg-emerald-500/10 text-emerald-400',
  warning: 'bg-amber-500/10 text-amber-400',
  alert: 'bg-red-500/10 text-red-400',
  // legacy mock statuses
  active: 'bg-emerald-500/10 text-emerald-400',
  maintenance: 'bg-amber-500/10 text-amber-400',
  inactive: 'bg-red-500/10 text-red-400',
}

const statusLabel: Record<string, string> = {
  ok: 'Operativo',
  warning: 'Attenzione',
  alert: 'Critico',
  active: 'Attivo',
  maintenance: 'Manutenzione',
  inactive: 'Inattivo',
}

const statusOptions = [
  { value: 'ok', label: 'Operativo' },
  { value: 'warning', label: 'Attenzione' },
  { value: 'alert', label: 'Critico' },
]

// ── Unified display type ──

interface DisplayVehicle {
  id: string
  plate: string
  brand: string
  model: string
  year: number
  euro_class: string
  total_km: number
  monthly_km: number
  fuel_consumption_per_100km: number
  status: string
  driver: string
  notes: string
}

function mockToDisplay(v: (typeof mockFleetVehicles)[number]): DisplayVehicle {
  const [brand, ...rest] = v.model.split(' ')
  return {
    id: v.id,
    plate: v.plate,
    brand: brand || '',
    model: rest.join(' ') || '',
    year: 2022,
    euro_class: 'Euro 6',
    total_km: v.mileage,
    monthly_km: 0,
    fuel_consumption_per_100km: 0,
    status: v.status === 'active' ? 'ok' : v.status === 'maintenance' ? 'warning' : 'alert',
    driver: v.driver,
    notes: '',
  }
}

function rowToDisplay(v: VehicleRow): DisplayVehicle {
  return {
    id: v.id,
    plate: v.plate,
    brand: v.brand,
    model: v.model,
    year: v.year,
    euro_class: v.euro_class,
    total_km: v.total_km,
    monthly_km: v.monthly_km,
    fuel_consumption_per_100km: v.fuel_consumption_per_100km,
    status: v.status,
    driver: v.driver ?? '',
    notes: v.notes ?? '',
  }
}

// ── Empty form defaults ──

const emptyForm: DisplayVehicle = {
  id: '',
  plate: '',
  brand: '',
  model: '',
  year: new Date().getFullYear(),
  euro_class: 'Euro 6',
  total_km: 0,
  monthly_km: 0,
  fuel_consumption_per_100km: 0,
  status: 'ok',
  driver: '',
  notes: '',
}

// ── Form components ──

import { Field, NumericInput, AutocompleteInput, EURO_CLASS_OPTIONS, VEHICLE_BRAND_OPTIONS, inputCls } from '../../../components/FormFields'

// ── Main component ──

export function FleetOverview() {
  const isDemo = useAuthStore((s) => s.isDemo)
  const userId = useAuthStore((s) => s.user?.id)
  const navigate = useNavigate()
  const { creditsRemaining, dailyLimit, extraCredits, canAfford, consume } = useCredits()

  const [supabaseData, setSupabaseData] = useState<VehicleRow[]>([])
  const [loading] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<DisplayVehicle>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<ValidationError[]>([])
  const [plateWarning, setPlateWarning] = useState('')
  const [showCreditModal, setShowCreditModal] = useState(false)
  const [pendingCreditCost, setPendingCreditCost] = useState(0)

  // ── Fetch from Supabase ──

  const fetchData = useCallback(async () => {
    if (isDemo || !userId) return
    try {
      const rows = await getVehicles(userId)
      setSupabaseData(rows)
      consume(CREDIT_COSTS.FLEET_OVERVIEW_LOAD, 'FLEET_OVERVIEW_LOAD')
    } catch {
      // silently fail on background refresh
    }
  }, [isDemo, userId])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // ── Display vehicles ──

  const vehicles: DisplayVehicle[] = isDemo
    ? mockFleetVehicles.map(mockToDisplay)
    : supabaseData.map(rowToDisplay)

  // ── Summary counts ──

  const totalVehicles = vehicles.length
  const okCount = vehicles.filter((v) => ['ok', 'active'].includes(v.status)).length
  const warningCount = vehicles.filter((v) => ['warning', 'maintenance'].includes(v.status)).length
  const alertCount = vehicles.filter((v) => ['alert', 'inactive'].includes(v.status)).length

  const summaryCards = [
    { label: 'Totale Veicoli', value: totalVehicles, icon: Truck, color: 'text-primary-400' },
    { label: 'Operativi', value: okCount, icon: CheckCircle, color: 'text-emerald-400' },
    { label: 'Attenzione', value: warningCount, icon: Wrench, color: 'text-amber-400' },
    { label: 'Critici', value: alertCount, icon: XCircle, color: 'text-red-400' },
  ]

  // ── Modal handlers ──

  function openAdd() {
    setEditingId(null)
    setForm(emptyForm)
    setErrors([])
    setPlateWarning('')
    setModalOpen(true)
  }

  function openEdit(v: DisplayVehicle) {
    setEditingId(v.id)
    setForm({ ...v })
    setErrors([])
    setPlateWarning('')
    setModalOpen(true)
  }

  function closeModal() {
    setModalOpen(false)
    setEditingId(null)
    setForm(emptyForm)
    setErrors([])
    setPlateWarning('')
  }

  function fieldError(field: string): string | undefined {
    return errors.find((e) => e.field === field)?.message
  }

  function updateField<K extends keyof DisplayVehicle>(key: K, value: DisplayVehicle[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!userId) return

    const validationErrors = validateVehicleForm(form)
    if (validationErrors.length > 0) {
      setErrors(validationErrors)
      return
    }
    setErrors([])

    setSaving(true)
    try {
      const input: VehicleInput = {
        user_id: userId,
        plate: form.plate.trim().toUpperCase(),
        brand: form.brand.trim(),
        model: form.model.trim(),
        year: Number(form.year),
        euro_class: form.euro_class.trim(),
        total_km: Number(form.total_km),
        monthly_km: Number(form.monthly_km),
        fuel_consumption_per_100km: Number(form.fuel_consumption_per_100km),
        status: form.status,
        driver: form.driver.trim() || null,
        notes: form.notes.trim() || null,
      }
      if (editingId) {
        await updateVehicle(editingId, input)
        await consume(CREDIT_COSTS.FLEET_VEHICLE_UPDATE, 'FLEET_VEHICLE_UPDATE')
      } else {
        if (!canAfford(CREDIT_COSTS.FLEET_VEHICLE_ADD)) {
          setPendingCreditCost(CREDIT_COSTS.FLEET_VEHICLE_ADD)
          setShowCreditModal(true)
          setSaving(false)
          return
        }
        await addVehicle(input)
        await consume(CREDIT_COSTS.FLEET_VEHICLE_ADD, 'FLEET_VEHICLE_ADD')
      }
      closeModal()
      await fetchData()
    } catch (err) {
      console.error('Errore salvataggio veicolo:', err)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm('Eliminare questo veicolo? L\'operazione non è reversibile.')) return
    try {
      await deleteVehicle(id)
      await fetchData()
    } catch (err) {
      console.error('Errore eliminazione veicolo:', err)
    }
  }

  // ── Render ──

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-400 to-cyan-500 bg-clip-text text-transparent">
          Panoramica Flotta
        </h1>
        <button
            onClick={openAdd}
            className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-700 text-white rounded-xl text-sm font-medium hover:from-emerald-600 hover:to-emerald-800 transition-colors"
          >
            <Plus size={16} /> Aggiungi veicolo
          </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
        {summaryCards.map((card) => {
          const Icon = card.icon
          return (
            <div
              key={card.label}
              className="bg-[#1e293b] rounded-2xl border border-[#334155] p-4 flex items-center gap-3"
            >
              <Icon size={20} className={`${card.color} shrink-0`} />
              <div>
                <p className="text-lg font-bold text-white leading-tight">{card.value}</p>
                <p className="text-xs text-slate-400">{card.label}</p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Vehicles Table */}
      <div className="bg-[#1e293b] rounded-2xl border border-[#334155] p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Tutti i Veicoli</h2>

        {loading ? (
          <p className="text-sm text-slate-500 py-8 text-center">Caricamento...</p>
        ) : vehicles.length === 0 ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-14 h-14 rounded-2xl bg-slate-800 flex items-center justify-center mb-4">
              <Truck size={28} className="text-slate-600" />
            </div>
            <p className="text-white font-semibold mb-1">Nessun veicolo registrato</p>
            <p className="text-sm text-slate-500 mb-5 max-w-xs">
              Aggiungi il primo veicolo della tua flotta per iniziare a monitorare stato, chilometraggio e consumi.
            </p>
            <button
                onClick={openAdd}
                className="flex items-center gap-1.5 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-700 text-white rounded-xl text-sm font-medium hover:from-emerald-600 hover:to-emerald-800 transition-colors"
              >
                <Plus size={16} /> Aggiungi veicolo
              </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#334155]">
                  <th className="text-left py-2 px-3 font-medium text-slate-400">Targa</th>
                  <th className="text-left py-2 px-3 font-medium text-slate-400">Marca / Modello</th>
                  <th className="text-left py-2 px-3 font-medium text-slate-400">Stato</th>
                  <th className="text-left py-2 px-3 font-medium text-slate-400">Autista</th>
                  <th className="text-right py-2 px-3 font-medium text-slate-400">Km Totali</th>
                  <th className="text-right py-2 px-3 font-medium text-slate-400">Km Mensili</th>
                  <th className="text-right py-2 px-3 font-medium text-slate-400">L/100km</th>
                  <th className="text-center py-2 px-3 font-medium text-slate-400">Azioni</th>
                </tr>
              </thead>
              <tbody>
                {vehicles.map((v) => (
                  <tr
                    key={v.id}
                    className="border-b border-[#334155] cursor-pointer hover:bg-[#253347] transition-colors"
                    onClick={() => openEdit(v)}
                  >
                    <td className="py-2.5 px-3 font-medium text-white">{v.plate}</td>
                    <td className="py-2.5 px-3 text-slate-300">
                      {v.brand} {v.model}
                    </td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${statusBadge[v.status] || 'bg-slate-500/10 text-slate-400'}`}
                      >
                        {statusLabel[v.status] || v.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-300">{v.driver || '\u2014'}</td>
                    <td className="py-2.5 px-3 text-right text-slate-300">
                      {v.total_km.toLocaleString('it-IT')}
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-300">
                      {v.monthly_km.toLocaleString('it-IT')}
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-300">
                      {v.fuel_consumption_per_100km > 0
                        ? v.fuel_consumption_per_100km.toFixed(1)
                        : '\u2014'}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              openEdit(v)
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#334155] transition-colors"
                            title="Modifica"
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDelete(v.id)
                            }}
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
        title={editingId ? 'Modifica veicolo' : 'Nuovo veicolo'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <Field label="Targa" error={fieldError('plate')}>
              <input
                required
                maxLength={10}
                value={form.plate}
                onChange={(e) => {
                  const val = e.target.value.toUpperCase()
                  updateField('plate', val)
                  setPlateWarning(val.length >= 5 && !isItalianPlateFormat(val) ? 'Formato non standard (es. AB 123 CD)' : '')
                  setErrors((prev) => prev.filter((err) => err.field !== 'plate'))
                }}
                placeholder="es. MI 123 AB"
                className={`${inputCls} ${fieldError('plate') ? 'border-red-500' : ''}`}
              />
              {plateWarning && !fieldError('plate') && <p className="text-xs text-amber-400 mt-1">{plateWarning}</p>}
            </Field>
            <Field label="Marca" error={fieldError('brand')}>
              <AutocompleteInput
                value={form.brand}
                onChange={(val) => updateField('brand', val)}
                options={VEHICLE_BRAND_OPTIONS}
                placeholder="es. Iveco"
                required
                className={`${inputCls} ${fieldError('brand') ? 'border-red-500' : ''}`}
              />
            </Field>
            <Field label="Modello" error={fieldError('model')}>
              <input
                required
                value={form.model}
                onChange={(e) => updateField('model', e.target.value)}
                placeholder="es. Daily 35S16"
                className={`${inputCls} ${fieldError('model') ? 'border-red-500' : ''}`}
              />
            </Field>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <Field label="Anno" error={fieldError('year')}>
              <NumericInput
                value={form.year}
                onChange={(val) => updateField('year', val)}
                min={1990}
                max={2099}
                maxLength={4}
                integer
                required
                className={`${inputCls} ${fieldError('year') ? 'border-red-500' : ''}`}
              />
            </Field>
            <Field label="Classe Euro" error={fieldError('euro_class')}>
              <AutocompleteInput
                value={form.euro_class}
                onChange={(val) => updateField('euro_class', val)}
                options={EURO_CLASS_OPTIONS}
                placeholder="es. Euro 6D"
                className={inputCls}
              />
            </Field>
            <Field label="Stato">
              <select
                value={form.status}
                onChange={(e) => updateField('status', e.target.value)}
                className={inputCls}
              >
                {statusOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <Field label="Km Totali" error={fieldError('total_km')}>
              <NumericInput
                value={form.total_km}
                onChange={(val) => updateField('total_km', val)}
                max={9999999}
                maxLength={7}
                integer
                placeholder="es. 87420"
                className={`${inputCls} ${fieldError('total_km') ? 'border-red-500' : ''}`}
              />
            </Field>
            <Field label="Km Mensili" error={fieldError('monthly_km')}>
              <NumericInput
                value={form.monthly_km}
                onChange={(val) => updateField('monthly_km', val)}
                max={99999}
                maxLength={5}
                integer
                placeholder="es. 4500"
                className={`${inputCls} ${fieldError('monthly_km') ? 'border-red-500' : ''}`}
              />
            </Field>
            <Field label="Consumo L/100km" error={fieldError('fuel_consumption_per_100km')}>
              <NumericInput
                value={form.fuel_consumption_per_100km}
                onChange={(val) => updateField('fuel_consumption_per_100km', val)}
                max={100}
                maxLength={5}
                step={0.1}
                placeholder="es. 12.8"
                className={`${inputCls} ${fieldError('fuel_consumption_per_100km') ? 'border-red-500' : ''}`}
              />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Autista">
              <input
                value={form.driver}
                onChange={(e) => updateField('driver', e.target.value)}
                placeholder="es. Marco Bianchi"
                className={inputCls}
              />
            </Field>
            <Field label="Note">
              <input
                value={form.notes}
                onChange={(e) => updateField('notes', e.target.value)}
                placeholder="Note aggiuntive..."
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
