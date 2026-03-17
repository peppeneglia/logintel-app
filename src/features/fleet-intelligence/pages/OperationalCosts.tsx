import { useState, useEffect, useCallback } from 'react'
import { Modal } from '../../../components/Modal'
import { useAuthStore } from '../../../stores/authStore'
import { useCredits } from '../../../hooks/useCredits'
import { CREDIT_COSTS } from '../../../lib/creditCosts'
import { getOperationalCosts, addOperationalCost, updateOperationalCost, deleteOperationalCost } from '../../../services/fleet'
import type { OperationalCostRow, OperationalCostInput } from '../../../services/fleet'
import { mockOperationalCosts } from '../../../data/mockFleetData'
import { isValidYear, isValidKm, isValidCost } from '../../../lib/validation'
import type { ValidationError } from '../../../lib/validation'
import { Field, NumericInput, inputCls } from '../../../components/FormFields'

function euro(value: number): string {
  return value.toLocaleString('it-IT', { style: 'currency', currency: 'EUR' })
}

const EMPTY_FORM: OperationalCostInput = {
  user_id: '',
  vehicle_id: '',
  month: new Date().getMonth() + 1,
  year: new Date().getFullYear(),
  fuel_cost: 0,
  maintenance_cost: 0,
  toll_cost: 0,
  driver_cost: 0,
  total_km: 0,
}

/** Map old mock shape to OperationalCostRow for demo mode */
function mapMockToRow(m: (typeof mockOperationalCosts)[number], idx: number): OperationalCostRow {
  return {
    id: `mock-${idx}`,
    user_id: 'demo-user',
    vehicle_id: m.vehiclePlate,
    month: 2,
    year: 2026,
    fuel_cost: m.fuelCost,
    maintenance_cost: m.maintenanceCost,
    toll_cost: m.tollCost,
    driver_cost: m.insuranceCost,
    total_km: m.km,
    created_at: new Date().toISOString(),
  }
}

function computeTotalCost(row: { fuel_cost: number; maintenance_cost: number; toll_cost: number; driver_cost: number }): number {
  return row.fuel_cost + row.maintenance_cost + row.toll_cost + row.driver_cost
}

function computeCostPerKm(row: { fuel_cost: number; maintenance_cost: number; toll_cost: number; driver_cost: number; total_km: number }): number {
  const total = computeTotalCost(row)
  return row.total_km > 0 ? total / row.total_km : 0
}

export function OperationalCosts() {
  const { isDemo, user } = useAuthStore()
  const userId = user?.id ?? null
  const { canAfford, consume } = useCredits()

  const [supabaseData, setSupabaseData] = useState<OperationalCostRow[]>([])
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<OperationalCostInput>({ ...EMPTY_FORM })
  const [errors, setErrors] = useState<ValidationError[]>([])

  const costs: OperationalCostRow[] = isDemo
    ? mockOperationalCosts.map(mapMockToRow)
    : supabaseData

  const fetchData = useCallback(async () => {
    if (isDemo || !userId) return
    const rows = await getOperationalCosts(userId)
    setSupabaseData(rows)
    await consume(CREDIT_COSTS.FLEET_OVERVIEW_LOAD, 'FLEET_OVERVIEW_LOAD')
  }, [isDemo, userId])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // KPI totals
  const totals = costs.reduce(
    (acc, c) => ({
      fuel_cost: acc.fuel_cost + c.fuel_cost,
      maintenance_cost: acc.maintenance_cost + c.maintenance_cost,
      toll_cost: acc.toll_cost + c.toll_cost,
      driver_cost: acc.driver_cost + c.driver_cost,
      total_km: acc.total_km + c.total_km,
    }),
    { fuel_cost: 0, maintenance_cost: 0, toll_cost: 0, driver_cost: 0, total_km: 0 },
  )
  const totalCostAll = computeTotalCost(totals)
  const avgCostPerKm = totals.total_km > 0 ? totalCostAll / totals.total_km : 0

  // Modal helpers
  function openAdd() {
    setEditingId(null)
    setForm({ ...EMPTY_FORM, user_id: userId ?? '' })
    setErrors([])
    setModalOpen(true)
  }

  function openEdit(row: OperationalCostRow) {
    setEditingId(row.id)
    setForm({
      user_id: row.user_id,
      vehicle_id: row.vehicle_id,
      month: row.month,
      year: row.year,
      fuel_cost: row.fuel_cost,
      maintenance_cost: row.maintenance_cost,
      toll_cost: row.toll_cost,
      driver_cost: row.driver_cost,
      total_km: row.total_km,
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

    const validationErrors: ValidationError[] = []
    if (form.month < 1 || form.month > 12) validationErrors.push({ field: 'month', message: 'Il mese deve essere tra 1 e 12' })
    if (!isValidYear(form.year)) validationErrors.push({ field: 'year', message: `Anno non valido (1990-${new Date().getFullYear() + 1})` })
    if (!isValidCost(form.fuel_cost)) validationErrors.push({ field: 'fuel_cost', message: 'Costo carburante non valido' })
    if (!isValidCost(form.maintenance_cost)) validationErrors.push({ field: 'maintenance_cost', message: 'Costo manutenzione non valido' })
    if (!isValidCost(form.toll_cost)) validationErrors.push({ field: 'toll_cost', message: 'Costo pedaggi non valido' })
    if (!isValidCost(form.driver_cost)) validationErrors.push({ field: 'driver_cost', message: 'Costo autista non valido' })
    if (!isValidKm(form.total_km)) validationErrors.push({ field: 'total_km', message: 'Km non validi' })
    if (validationErrors.length > 0) { setErrors(validationErrors); return }
    setErrors([])

    if (editingId) {
      await updateOperationalCost(editingId, form)
      await consume(CREDIT_COSTS.FLEET_VEHICLE_UPDATE, 'FLEET_VEHICLE_UPDATE')
    } else {
      if (!canAfford(CREDIT_COSTS.FLEET_VEHICLE_ADD)) {
        setErrors([{ field: '', message: 'Crediti insufficienti per aggiungere un costo' }])
        return
      }
      await addOperationalCost(form)
      await consume(CREDIT_COSTS.FLEET_VEHICLE_ADD, 'FLEET_VEHICLE_ADD')
    }
    closeModal()
    await fetchData()
  }

  async function handleDelete(id: string) {
    if (!window.confirm('Eliminare questo record di costi?')) return
    await deleteOperationalCost(id)
    await fetchData()
  }

  function setField<K extends keyof OperationalCostInput>(key: K, value: OperationalCostInput[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-400 to-cyan-500 bg-clip-text text-transparent">
          Costi Operativi
        </h1>
        <button
          onClick={openAdd}
          disabled={isDemo}
          title={isDemo ? 'Registrati per aggiungere dati' : undefined}
          className="px-4 py-2 rounded-xl text-sm font-medium bg-primary-600 hover:bg-primary-500 text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          + Aggiungi Costo
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
        <div className="bg-[#1e293b] rounded-2xl border border-[#334155] p-4">
          <p className="text-xs text-slate-400">Costo Totale Flotta</p>
          <p className="text-lg font-bold text-white">{euro(totalCostAll)}</p>
        </div>
        <div className="bg-[#1e293b] rounded-2xl border border-[#334155] p-4">
          <p className="text-xs text-slate-400">Carburante</p>
          <p className="text-lg font-bold text-amber-400">{euro(totals.fuel_cost)}</p>
        </div>
        <div className="bg-[#1e293b] rounded-2xl border border-[#334155] p-4">
          <p className="text-xs text-slate-400">Km Totali</p>
          <p className="text-lg font-bold text-primary-400">{totals.total_km.toLocaleString('it-IT')}</p>
        </div>
        <div className="bg-[#1e293b] rounded-2xl border border-[#334155] p-4">
          <p className="text-xs text-slate-400">Costo Medio /km</p>
          <p className="text-lg font-bold text-emerald-400">{euro(avgCostPerKm)}</p>
        </div>
      </div>

      {/* Costs Table */}
      <div className="bg-[#1e293b] rounded-2xl border border-[#334155] p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Dettaglio per Veicolo</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#334155]">
                <th className="text-left py-2 px-3 font-medium text-slate-400">Veicolo (ID)</th>
                <th className="text-right py-2 px-3 font-medium text-slate-400">Carburante</th>
                <th className="text-right py-2 px-3 font-medium text-slate-400">Manutenzione</th>
                <th className="text-right py-2 px-3 font-medium text-slate-400">Pedaggi</th>
                <th className="text-right py-2 px-3 font-medium text-slate-400">Autista</th>
                <th className="text-right py-2 px-3 font-medium text-slate-400">Totale</th>
                <th className="text-right py-2 px-3 font-medium text-slate-400">Km</th>
                <th className="text-right py-2 px-3 font-medium text-slate-400">/km</th>
                {!isDemo && <th className="text-right py-2 px-3 font-medium text-slate-400">Azioni</th>}
              </tr>
            </thead>
            <tbody>
              {costs.length > 0 ? (
                <>
                  {costs.map((cost) => {
                    const rowTotal = computeTotalCost(cost)
                    const rowCpk = computeCostPerKm(cost)
                    return (
                      <tr
                        key={cost.id}
                        className="border-b border-[#334155] hover:bg-[#263348] cursor-pointer transition-colors"
                        onClick={() => !isDemo && openEdit(cost)}
                      >
                        <td className="py-2.5 px-3 font-medium text-white">{cost.vehicle_id}</td>
                        <td className="py-2.5 px-3 text-right text-slate-300">{euro(cost.fuel_cost)}</td>
                        <td className="py-2.5 px-3 text-right text-slate-300">{euro(cost.maintenance_cost)}</td>
                        <td className="py-2.5 px-3 text-right text-slate-300">{euro(cost.toll_cost)}</td>
                        <td className="py-2.5 px-3 text-right text-slate-300">{euro(cost.driver_cost)}</td>
                        <td className="py-2.5 px-3 text-right font-semibold text-white">{euro(rowTotal)}</td>
                        <td className="py-2.5 px-3 text-right text-slate-300">{cost.total_km.toLocaleString('it-IT')}</td>
                        <td className="py-2.5 px-3 text-right text-slate-400">{euro(rowCpk)}</td>
                        {!isDemo && (
                          <td className="py-2.5 px-3 text-right">
                            <button
                              onClick={(e) => { e.stopPropagation(); handleDelete(cost.id) }}
                              className="text-red-400 hover:text-red-300 text-xs font-medium"
                            >
                              Elimina
                            </button>
                          </td>
                        )}
                      </tr>
                    )
                  })}

                  {/* Total Row */}
                  <tr className="border-t-2 border-slate-600">
                    <td className="py-3 px-3 font-bold text-white">TOTALE</td>
                    <td className="py-3 px-3 text-right font-semibold text-white">{euro(totals.fuel_cost)}</td>
                    <td className="py-3 px-3 text-right font-semibold text-white">{euro(totals.maintenance_cost)}</td>
                    <td className="py-3 px-3 text-right font-semibold text-white">{euro(totals.toll_cost)}</td>
                    <td className="py-3 px-3 text-right font-semibold text-white">{euro(totals.driver_cost)}</td>
                    <td className="py-3 px-3 text-right font-bold text-primary-400">{euro(totalCostAll)}</td>
                    <td className="py-3 px-3 text-right font-semibold text-white">{totals.total_km.toLocaleString('it-IT')}</td>
                    <td className="py-3 px-3 text-right font-semibold text-emerald-400">{euro(avgCostPerKm)}</td>
                    {!isDemo && <td />}
                  </tr>
                </>
              ) : (
                <tr>
                  <td colSpan={isDemo ? 8 : 9} className="py-8 text-center text-sm text-slate-500">
                    Nessun dato disponibile.
                    {!isDemo && (
                      <button onClick={openAdd} className="ml-2 text-primary-400 hover:underline">
                        Aggiungi costo
                      </button>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      <Modal open={modalOpen} onClose={closeModal} title={editingId ? 'Modifica Costo' : 'Nuovo Costo Operativo'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <Field label="Veicolo (ID)">
              <input
                type="text"
                required
                value={form.vehicle_id}
                onChange={(e) => setField('vehicle_id', e.target.value)}
                className={inputCls}
              />
            </Field>
            <Field label="Mese" error={fieldError('month')}>
              <NumericInput
                value={form.month}
                onChange={(val) => setField('month', val)}
                min={1}
                max={12}
                maxLength={2}
                integer
                required
                className={`${inputCls} ${fieldError('month') ? 'border-red-500' : ''}`}
              />
            </Field>
            <Field label="Anno" error={fieldError('year')}>
              <NumericInput
                value={form.year}
                onChange={(val) => setField('year', val)}
                min={2020}
                max={2099}
                maxLength={4}
                integer
                required
                className={`${inputCls} ${fieldError('year') ? 'border-red-500' : ''}`}
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
            <Field label="Costo Manutenzione" error={fieldError('maintenance_cost')}>
              <NumericInput
                value={form.maintenance_cost}
                onChange={(val) => setField('maintenance_cost', val)}
                max={999999}
                maxLength={6}
                step={0.01}
                required
                className={`${inputCls} ${fieldError('maintenance_cost') ? 'border-red-500' : ''}`}
              />
            </Field>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <Field label="Costo Pedaggi" error={fieldError('toll_cost')}>
              <NumericInput
                value={form.toll_cost}
                onChange={(val) => setField('toll_cost', val)}
                max={999999}
                maxLength={6}
                step={0.01}
                required
                className={`${inputCls} ${fieldError('toll_cost') ? 'border-red-500' : ''}`}
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
            <Field label="Km Totali" error={fieldError('total_km')}>
              <NumericInput
                value={form.total_km}
                onChange={(val) => setField('total_km', val)}
                max={9999999}
                maxLength={7}
                integer
                required
                className={`${inputCls} ${fieldError('total_km') ? 'border-red-500' : ''}`}
              />
            </Field>
          </div>
          {/* Computed preview */}
          <div className="rounded-xl bg-[#0f172a] border border-[#334155] p-3 text-sm">
            <div className="flex justify-between text-slate-400">
              <span>Totale calcolato</span>
              <span className="text-white font-semibold">{euro(computeTotalCost(form))}</span>
            </div>
            <div className="flex justify-between text-slate-400 mt-1">
              <span>Costo /km calcolato</span>
              <span className="text-emerald-400 font-semibold">{euro(computeCostPerKm(form))}</span>
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
    </div>
  )
}
