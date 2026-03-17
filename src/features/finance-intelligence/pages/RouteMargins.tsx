import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Modal } from '../../../components/Modal'
import { CreditConfirmModal } from '../../../components/CreditConfirmModal'
import { useAuthStore } from '../../../stores/authStore'
import { useCredits } from '../../../hooks/useCredits'
import { CREDIT_COSTS } from '../../../lib/creditCosts'
import { getRouteMargins, addRouteMargin, updateRouteMargin, deleteRouteMargin, computeMargin } from '../../../services/finance'
import type { RouteMarginRow, RouteMarginInput } from '../../../services/finance'
import { mockRouteMargins } from '../../../data/mockFinanceData'
import { validateRouteMarginForm } from '../../../lib/validation'
import type { ValidationError } from '../../../lib/validation'
import { Field, NumericInput, inputCls } from '../../../components/FormFields'

function euro(value: number): string {
  return value.toLocaleString('it-IT', { style: 'currency', currency: 'EUR' })
}

const SIGNAL_COLORS: Record<string, string> = {
  green: 'bg-emerald-500/10 text-emerald-400',
  yellow: 'bg-amber-500/10 text-amber-400',
  red: 'bg-red-500/10 text-red-400',
}

const EMPTY_FORM: RouteMarginInput = {
  user_id: '',
  route: '',
  customer: '',
  date: new Date().toISOString().slice(0, 10),
  km: 0,
  driving_hours: 0,
  revenue: 0,
  fuel_cost: 0,
  driver_cost: 0,
  fixed_cost: 0,
  tolls: 0,
  vehicle_id: null,
}

/** Map old mock shape to RouteMarginRow for demo mode */
function mapMockToRow(m: (typeof mockRouteMargins)[number], idx: number): RouteMarginRow {
  return {
    id: `mock-${idx}`,
    user_id: 'demo-user',
    route: m.rotta,
    customer: '',
    date: '2026-02-20',
    km: m.km,
    driving_hours: 0,
    revenue: m.ricavo,
    fuel_cost: m.costo * 0.4,
    driver_cost: m.costo * 0.35,
    fixed_cost: m.costo * 0.15,
    tolls: m.costo * 0.1,
    vehicle_id: null,
    created_at: new Date().toISOString(),
  }
}

export function RouteMargins() {
  const { isDemo, user } = useAuthStore()
  const userId = user?.id ?? null
  const navigate = useNavigate()
  const { creditsRemaining, dailyLimit, extraCredits, canAfford, consume } = useCredits()

  const [supabaseData, setSupabaseData] = useState<RouteMarginRow[]>([])
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<RouteMarginInput>({ ...EMPTY_FORM })
  const [errors, setErrors] = useState<ValidationError[]>([])
  const [showCreditModal, setShowCreditModal] = useState(false)
  const [pendingCreditCost, setPendingCreditCost] = useState(0)

  const rows: RouteMarginRow[] = isDemo
    ? mockRouteMargins.map(mapMockToRow)
    : supabaseData

  const fetchData = useCallback(async () => {
    if (isDemo || !userId) return
    try {
      const data = await getRouteMargins(userId)
      setSupabaseData(data)
      consume(CREDIT_COSTS.FINANCE_MARGINS_LOAD, 'FINANCE_MARGINS_LOAD')
    } catch {
      // silently fail on background refresh
    }
  }, [isDemo, userId])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Compute margins for each row
  const rowsWithMargin = rows.map((r) => ({ ...r, margin: computeMargin(r) }))

  // KPI totals
  const totalRevenue = rowsWithMargin.reduce((sum, r) => sum + r.revenue, 0)
  const totalMarginEur = rowsWithMargin.reduce((sum, r) => sum + r.margin.marginEur, 0)
  const avgMarginPct = rowsWithMargin.length
    ? rowsWithMargin.reduce((sum, r) => sum + r.margin.marginPct, 0) / rowsWithMargin.length
    : 0

  // Modal helpers
  function openAdd() {
    setEditingId(null)
    setForm({ ...EMPTY_FORM, user_id: userId ?? '' })
    setErrors([])
    setModalOpen(true)
  }

  function openEdit(row: RouteMarginRow) {
    setEditingId(row.id)
    setForm({
      user_id: row.user_id,
      route: row.route,
      customer: row.customer,
      date: row.date,
      km: row.km,
      driving_hours: row.driving_hours,
      revenue: row.revenue,
      fuel_cost: row.fuel_cost,
      driver_cost: row.driver_cost,
      fixed_cost: row.fixed_cost,
      tolls: row.tolls,
      vehicle_id: row.vehicle_id,
    })
    setErrors([])
    setModalOpen(true)
  }

  function closeModal() {
    setModalOpen(false)
    setEditingId(null)
    setErrors([])
  }

  function fieldError(field: string): string | undefined {
    return errors.find((e) => e.field === field)?.message
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const validationErrors = validateRouteMarginForm(form)
    if (validationErrors.length > 0) { setErrors(validationErrors); return }
    setErrors([])

    if (editingId) {
      await updateRouteMargin(editingId, form)
    } else {
      if (!canAfford(CREDIT_COSTS.FINANCE_MARGINS_ADD)) {
        setPendingCreditCost(CREDIT_COSTS.FINANCE_MARGINS_ADD)
        setShowCreditModal(true)
        return
      }
      await addRouteMargin(form)
      await consume(CREDIT_COSTS.FINANCE_MARGINS_ADD, 'FINANCE_MARGINS_ADD')
    }
    closeModal()
    await fetchData()
  }

  async function handleDelete(id: string) {
    if (!window.confirm('Eliminare questo record di marginalità?')) return
    await deleteRouteMargin(id)
    await fetchData()
  }

  function setField<K extends keyof RouteMarginInput>(key: K, value: RouteMarginInput[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  // Preview margin in modal
  const formPreview = computeMargin({
    ...form,
    id: '',
    created_at: '',
  } as RouteMarginRow)

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-400 to-cyan-500 bg-clip-text text-transparent">
          Marginalità per Rotta
        </h1>
        <button
          onClick={openAdd}
          className="px-4 py-2 rounded-xl text-sm font-medium bg-primary-600 hover:bg-primary-500 text-white transition-colors"
        >
          + Aggiungi
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
        <div className="bg-[#1e293b] rounded-2xl border border-[#334155] p-4">
          <p className="text-xs text-slate-400">Ricavo totale</p>
          <p className="text-xl font-bold text-white">{euro(totalRevenue)}</p>
        </div>
        <div className="bg-[#1e293b] rounded-2xl border border-[#334155] p-4">
          <p className="text-xs text-slate-400">Margine totale</p>
          <p className="text-xl font-bold text-emerald-400">{euro(totalMarginEur)}</p>
        </div>
        <div className="bg-[#1e293b] rounded-2xl border border-[#334155] p-4">
          <p className="text-xs text-slate-400">Margine medio</p>
          <p className="text-xl font-bold text-primary-400">{avgMarginPct.toFixed(1)}%</p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#1e293b] rounded-2xl border border-[#334155] p-6">
        <h2 className="text-sm font-semibold text-slate-300 mb-4">Dettaglio marginalità per rotta</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#334155]">
                <th className="text-left py-3 px-3 font-medium text-slate-400">Rotta</th>
                <th className="text-left py-3 px-3 font-medium text-slate-400">Cliente</th>
                <th className="text-left py-3 px-3 font-medium text-slate-400">Data</th>
                <th className="text-right py-3 px-3 font-medium text-slate-400">Km</th>
                <th className="text-right py-3 px-3 font-medium text-slate-400">Ricavo</th>
                <th className="text-right py-3 px-3 font-medium text-slate-400">Costo</th>
                <th className="text-right py-3 px-3 font-medium text-slate-400">Margine</th>
                <th className="text-right py-3 px-3 font-medium text-slate-400">Margine %</th>
                <th className="text-right py-3 px-3 font-medium text-slate-400">Azioni</th>
              </tr>
            </thead>
            <tbody>
              {rowsWithMargin.length > 0 ? (
                rowsWithMargin.map((r) => (
                  <tr
                    key={r.id}
                    className="border-b border-[#334155] hover:bg-[#263348] cursor-pointer transition-colors"
                    onClick={() => openEdit(r)}
                  >
                    <td className="py-3 px-3 text-white font-medium">{r.route}</td>
                    <td className="py-3 px-3 text-slate-300">{r.customer || '—'}</td>
                    <td className="py-3 px-3 text-slate-400">{r.date}</td>
                    <td className="py-3 px-3 text-slate-300 text-right">{r.km}</td>
                    <td className="py-3 px-3 text-slate-300 text-right">{euro(r.revenue)}</td>
                    <td className="py-3 px-3 text-slate-300 text-right">{euro(r.margin.totalCost)}</td>
                    <td className="py-3 px-3 text-emerald-400 text-right font-medium">{euro(r.margin.marginEur)}</td>
                    <td className="py-3 px-3 text-right">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${SIGNAL_COLORS[r.margin.signal]}`}>
                        {r.margin.marginPct.toFixed(1)}%
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDelete(r.id) }}
                        className="text-red-400 hover:text-red-300 text-xs font-medium"
                      >
                        Elimina
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-sm text-slate-500">
                    Nessun dato disponibile.
                    <button onClick={openAdd} className="ml-2 text-primary-400 hover:underline">
                      Aggiungi marginalità
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      <Modal open={modalOpen} onClose={closeModal} title={editingId ? 'Modifica Marginalità' : 'Nuova Marginalità Rotta'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <Field label="Rotta" error={fieldError('route')}>
              <input
                type="text"
                required
                value={form.route}
                onChange={(e) => setField('route', e.target.value)}
                className={`${inputCls} ${fieldError('route') ? 'border-red-500' : ''}`}
              />
            </Field>
            <Field label="Cliente">
              <input
                type="text"
                value={form.customer}
                onChange={(e) => setField('customer', e.target.value)}
                className={inputCls}
              />
            </Field>
            <Field label="Data" error={fieldError('date')}>
              <input
                type="date"
                required
                value={form.date}
                onChange={(e) => setField('date', e.target.value)}
                className={`${inputCls} ${fieldError('date') ? 'border-red-500' : ''}`}
              />
            </Field>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <Field label="Km" error={fieldError('km')}>
              <NumericInput
                value={form.km}
                onChange={(val) => setField('km', val)}
                max={9999999}
                maxLength={7}
                integer
                required
                className={`${inputCls} ${fieldError('km') ? 'border-red-500' : ''}`}
              />
            </Field>
            <Field label="Ore Guida">
              <NumericInput
                value={form.driving_hours}
                onChange={(val) => setField('driving_hours', val)}
                max={999}
                maxLength={5}
                step={0.5}
                className={inputCls}
              />
            </Field>
            <Field label="Ricavo" error={fieldError('revenue')}>
              <NumericInput
                value={form.revenue}
                onChange={(val) => setField('revenue', val)}
                max={999999}
                maxLength={6}
                step={0.01}
                required
                className={`${inputCls} ${fieldError('revenue') ? 'border-red-500' : ''}`}
              />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Costo Carburante" error={fieldError('fuel_cost')}>
              <NumericInput
                value={form.fuel_cost}
                onChange={(val) => setField('fuel_cost', val)}
                max={999999}
                maxLength={6}
                step={0.01}
                required
                className={`${inputCls} ${fieldError('fuel_cost') ? 'border-red-500' : ''}`}
              />
            </Field>
            <Field label="Costo Autista" error={fieldError('driver_cost')}>
              <NumericInput
                value={form.driver_cost}
                onChange={(val) => setField('driver_cost', val)}
                max={999999}
                maxLength={6}
                step={0.01}
                required
                className={`${inputCls} ${fieldError('driver_cost') ? 'border-red-500' : ''}`}
              />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Costi Fissi" error={fieldError('fixed_cost')}>
              <NumericInput
                value={form.fixed_cost}
                onChange={(val) => setField('fixed_cost', val)}
                max={999999}
                maxLength={6}
                step={0.01}
                required
                className={`${inputCls} ${fieldError('fixed_cost') ? 'border-red-500' : ''}`}
              />
            </Field>
            <Field label="Pedaggi" error={fieldError('tolls')}>
              <NumericInput
                value={form.tolls}
                onChange={(val) => setField('tolls', val)}
                max={999999}
                maxLength={6}
                step={0.01}
                required
                className={`${inputCls} ${fieldError('tolls') ? 'border-red-500' : ''}`}
              />
            </Field>
          </div>

          {/* Computed preview */}
          <div className="rounded-xl bg-[#0f172a] border border-[#334155] p-3 text-sm">
            <div className="flex justify-between text-slate-400">
              <span>Costo totale</span>
              <span className="text-white font-semibold">{euro(formPreview.totalCost)}</span>
            </div>
            <div className="flex justify-between text-slate-400 mt-1">
              <span>Margine</span>
              <span className={`font-semibold ${formPreview.marginEur >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {euro(formPreview.marginEur)}
              </span>
            </div>
            <div className="flex justify-between text-slate-400 mt-1">
              <span>Margine %</span>
              <span className={`font-semibold ${SIGNAL_COLORS[formPreview.signal]} px-2 py-0.5 rounded-full text-xs`}>
                {formPreview.marginPct.toFixed(1)}%
              </span>
            </div>
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
            <button type="button" onClick={closeModal} className="px-4 py-2 rounded-xl text-sm font-medium text-slate-300 hover:text-white transition-colors">
              Annulla
            </button>
            <button type="submit" className="px-4 py-2 rounded-xl text-sm font-medium bg-primary-600 hover:bg-primary-500 text-white transition-colors">
              {editingId ? 'Salva' : 'Aggiungi'}
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
