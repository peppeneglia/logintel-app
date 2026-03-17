import { useState, useEffect, useCallback, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { TrendingUp, TrendingDown, Minus, Plus, Pencil, Trash2, Leaf } from 'lucide-react'
import { Modal } from '../../../components/Modal'
import { CreditConfirmModal } from '../../../components/CreditConfirmModal'
import { useAuthStore } from '../../../stores/authStore'
import { useCredits } from '../../../hooks/useCredits'
import { CREDIT_COSTS } from '../../../lib/creditCosts'
import { mockRouteEmissions } from '../../../data/mockCarbonData'
import {
  getEmissionsRecords,
  addEmissionsRecord,
  updateEmissionsRecord,
  deleteEmissionsRecord,
  computeEmissions,
  CO2_FACTORS,
} from '../../../services/carbon'
import type { EmissionsRecordRow, EmissionsRecordInput } from '../../../services/carbon'
import { validateEmissionsForm } from '../../../lib/validation'
import type { ValidationError } from '../../../lib/validation'
import { Field, NumericInput, AutocompleteInput, EURO_CLASS_OPTIONS, inputCls } from '../../../components/FormFields'

// ── Trend helpers ──

function TrendIcon({ trend }: { trend: 'up' | 'down' | 'stable' }) {
  if (trend === 'up') return <TrendingUp size={16} className="text-red-400" />
  if (trend === 'down') return <TrendingDown size={16} className="text-emerald-400" />
  return <Minus size={16} className="text-slate-400" />
}

function trendColor(trend: 'up' | 'down' | 'stable') {
  if (trend === 'up') return 'text-red-400'
  if (trend === 'down') return 'text-emerald-400'
  return 'text-slate-400'
}

// ── Unified display type ──

interface DisplayRow {
  id: string
  route: string
  km: number
  co2Kg: number
  co2PerKm: number
  fuelLiters: number
  trips: number
  trend: 'up' | 'down' | 'stable'
  euro_class: string
  vehicle_id: string
  date: string
}

function mockToDisplay(
  v: (typeof mockRouteEmissions)[number],
  idx: number,
): DisplayRow {
  return {
    id: `mock-${idx}`,
    route: v.route,
    km: v.distance,
    co2Kg: v.co2Kg,
    co2PerKm: v.co2PerKm,
    fuelLiters: v.fuelLiters,
    trips: v.trips,
    trend: v.trend,
    euro_class: 'Euro 6D',
    vehicle_id: '',
    date: new Date().toISOString().slice(0, 10),
  }
}

function rowToDisplay(r: EmissionsRecordRow): DisplayRow {
  return {
    id: r.id,
    route: r.route,
    km: r.km,
    co2Kg: r.co2_kg,
    co2PerKm: r.km > 0 ? r.co2_kg / r.km : 0,
    fuelLiters: 0,
    trips: 1,
    trend: 'stable' as const,
    euro_class: r.euro_class,
    vehicle_id: r.vehicle_id ?? '',
    date: r.date,
  }
}

// ── Euro class options (from CO2_FACTORS for the select) ──

const euroClassSelectOptions = Object.keys(CO2_FACTORS)

// ── Form defaults ──

const emptyForm = {
  route: '',
  km: 0,
  euro_class: 'Euro 6D',
  date: new Date().toISOString().slice(0, 10),
  vehicle_id: '',
}

// ── Main component ──

export function RouteEmissions() {
  const isDemo = useAuthStore((s) => s.isDemo)
  const userId = useAuthStore((s) => s.user?.id)
  const navigate = useNavigate()
  const { creditsRemaining, dailyLimit, extraCredits, canAfford, consume } = useCredits()

  const [supabaseData, setSupabaseData] = useState<EmissionsRecordRow[]>([])
  const [loading, setLoading] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<ValidationError[]>([])
  const [showCreditModal, setShowCreditModal] = useState(false)
  const [pendingCreditCost, setPendingCreditCost] = useState(0)

  // ── Fetch from Supabase ──

  const fetchData = useCallback(async () => {
    if (isDemo || !userId) return
    setLoading(true)
    try {
      const rows = await getEmissionsRecords(userId)
      setSupabaseData(rows)
      await consume(CREDIT_COSTS.CARBON_EMISSIONS_LOAD, 'CARBON_EMISSIONS_LOAD')
    } finally {
      setLoading(false)
    }
  }, [isDemo, userId])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // ── Display rows ──

  const rows: DisplayRow[] = isDemo
    ? mockRouteEmissions.map(mockToDisplay)
    : supabaseData.map(rowToDisplay)

  // ── CO2 preview ──

  const co2Preview = computeEmissions(form.km, form.euro_class)

  // ── Modal handlers ──

  function openAdd() {
    setEditingId(null)
    setForm(emptyForm)
    setErrors([])
    setModalOpen(true)
  }

  function openEdit(row: DisplayRow) {
    setEditingId(row.id)
    setForm({
      route: row.route,
      km: row.km,
      euro_class: row.euro_class,
      date: row.date,
      vehicle_id: row.vehicle_id,
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

  function updateField<K extends keyof typeof emptyForm>(key: K, value: (typeof emptyForm)[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!userId) return

    const validationErrors = validateEmissionsForm(form)
    if (validationErrors.length > 0) { setErrors(validationErrors); return }
    setErrors([])

    setSaving(true)
    try {
      const co2Kg = computeEmissions(form.km, form.euro_class)
      const input: EmissionsRecordInput = {
        user_id: userId,
        route: form.route.trim(),
        km: Number(form.km),
        euro_class: form.euro_class,
        co2_kg: co2Kg,
        date: form.date,
        vehicle_id: form.vehicle_id.trim() || null,
      }
      if (editingId) {
        await updateEmissionsRecord(editingId, input)
      } else {
        if (!canAfford(CREDIT_COSTS.CARBON_EMISSIONS_ADD)) {
          setPendingCreditCost(CREDIT_COSTS.CARBON_EMISSIONS_ADD)
          setShowCreditModal(true)
          setSaving(false)
          return
        }
        await addEmissionsRecord(input)
        await consume(CREDIT_COSTS.CARBON_EMISSIONS_ADD, 'CARBON_EMISSIONS_ADD')
      }
      closeModal()
      await fetchData()
    } catch (err) {
      console.error('Errore salvataggio registrazione:', err)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm('Eliminare questa registrazione? L\'operazione non è reversibile.')) return
    try {
      await deleteEmissionsRecord(id)
      await fetchData()
    } catch (err) {
      console.error('Errore eliminazione registrazione:', err)
    }
  }

  // ── Render ──

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-400 to-cyan-500 bg-clip-text text-transparent">
          Emissioni per Rotta
        </h1>
        <button
          onClick={openAdd}
          className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-700 text-white rounded-xl text-sm font-medium hover:from-emerald-600 hover:to-emerald-800 transition-colors"
        >
          <Plus size={16} /> Aggiungi registrazione
        </button>
      </div>

      <div className="bg-[#1e293b] rounded-2xl border border-[#334155] p-6">
        {loading ? (
          <p className="text-sm text-slate-500 py-8 text-center">Caricamento...</p>
        ) : rows.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-14 h-14 rounded-2xl bg-slate-800 flex items-center justify-center mb-4">
              <Leaf size={28} className="text-slate-600" />
            </div>
            <p className="text-white font-semibold mb-1">Nessuna registrazione emissioni</p>
            <p className="text-sm text-slate-500 mb-5 max-w-xs">
              Aggiungi la prima registrazione per iniziare a monitorare le emissioni CO2 per rotta.
            </p>
            <button
              onClick={openAdd}
              className="flex items-center gap-1.5 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-700 text-white rounded-xl text-sm font-medium hover:from-emerald-600 hover:to-emerald-800 transition-colors"
            >
              <Plus size={16} /> Aggiungi registrazione
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#334155]">
                  <th className="text-left py-3 px-3 font-medium text-slate-400">Rotta</th>
                  <th className="text-right py-3 px-3 font-medium text-slate-400">Km</th>
                  <th className="text-right py-3 px-3 font-medium text-slate-400">CO2 (kg)</th>
                  <th className="text-right py-3 px-3 font-medium text-slate-400">CO2/km</th>
                  <th className="text-right py-3 px-3 font-medium text-slate-400">Fuel (L)</th>
                  <th className="text-right py-3 px-3 font-medium text-slate-400">Viaggi</th>
                  <th className="text-center py-3 px-3 font-medium text-slate-400">Trend</th>
                  <th className="text-center py-3 px-3 font-medium text-slate-400">Azioni</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b border-[#334155] last:border-b-0 cursor-pointer hover:bg-[#253347] transition-colors"
                    onClick={() => openEdit(row)}
                  >
                    <td className="py-3 px-3 text-white font-medium">{row.route}</td>
                    <td className="py-3 px-3 text-slate-300 text-right">{row.km.toLocaleString('it-IT')}</td>
                    <td className="py-3 px-3 text-slate-300 text-right">{row.co2Kg.toLocaleString('it-IT')}</td>
                    <td className="py-3 px-3 text-slate-300 text-right">{row.co2PerKm.toFixed(2)}</td>
                    <td className="py-3 px-3 text-slate-300 text-right">{row.fuelLiters > 0 ? row.fuelLiters : '\u2014'}</td>
                    <td className="py-3 px-3 text-slate-300 text-right">{row.trips}</td>
                    <td className="py-3 px-3">
                      <div className="flex items-center justify-center gap-1.5">
                        <TrendIcon trend={row.trend} />
                        <span className={`text-xs font-medium ${trendColor(row.trend)}`}>
                          {row.trend === 'up' ? 'In aumento' : row.trend === 'down' ? 'In calo' : 'Stabile'}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={(e) => { e.stopPropagation(); openEdit(row) }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#334155] transition-colors"
                          title="Modifica"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDelete(row.id) }}
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
        title={editingId ? 'Modifica registrazione' : 'Nuova registrazione'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Rotta" error={fieldError('route')}>
            <input
              required
              value={form.route}
              onChange={(e) => updateField('route', e.target.value)}
              placeholder="es. Milano → Roma"
              className={`${inputCls} ${fieldError('route') ? 'border-red-500' : ''}`}
            />
          </Field>

          <div className="grid grid-cols-3 gap-4">
            <Field label="Km" error={fieldError('km')}>
              <NumericInput
                value={form.km}
                onChange={(val) => updateField('km', val)}
                max={9999999}
                maxLength={7}
                integer
                required
                placeholder="es. 580"
                className={`${inputCls} ${fieldError('km') ? 'border-red-500' : ''}`}
              />
            </Field>
            <Field label="Classe Euro" error={fieldError('euro_class')}>
              <AutocompleteInput
                value={form.euro_class}
                onChange={(val) => updateField('euro_class', val)}
                options={[...new Set([...EURO_CLASS_OPTIONS, ...euroClassSelectOptions])]}
                placeholder="es. Euro 6D"
                className={`${inputCls} ${fieldError('euro_class') ? 'border-red-500' : ''}`}
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
          </div>

          <Field label="Veicolo (ID)">
            <input
              value={form.vehicle_id}
              onChange={(e) => updateField('vehicle_id', e.target.value)}
              placeholder="opzionale"
              className={inputCls}
            />
          </Field>

          {/* CO2 preview */}
          <div className="bg-[#334155]/50 rounded-xl p-3 flex items-center justify-between">
            <span className="text-sm text-slate-400">CO2 (kg) — calcolata automaticamente</span>
            <span className="text-lg font-bold text-emerald-400">{co2Preview.toFixed(2)}</span>
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
