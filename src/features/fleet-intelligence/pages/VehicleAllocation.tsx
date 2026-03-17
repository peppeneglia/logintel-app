import { useState, useEffect, useCallback } from 'react'
import { Modal } from '../../../components/Modal'
import { useAuthStore } from '../../../stores/authStore'
import { getVehicleAllocations, addVehicleAllocation, updateVehicleAllocation, deleteVehicleAllocation } from '../../../services/fleet'
import type { VehicleAllocationRow, VehicleAllocationInput } from '../../../services/fleet'
import { mockVehicleAllocations } from '../../../data/mockFleetData'
import { isDateAfter } from '../../../lib/validation'
import type { ValidationError } from '../../../lib/validation'

const STATUS_BADGE: Record<string, string> = {
  active: 'bg-emerald-500/10 text-emerald-400',
  completed: 'bg-primary-500/10 text-primary-400',
  cancelled: 'bg-red-500/10 text-red-400',
}

const STATUS_LABEL: Record<string, string> = {
  active: 'Attiva',
  completed: 'Completata',
  cancelled: 'Annullata',
}

const STATUS_OPTIONS = ['active', 'completed', 'cancelled'] as const

const EMPTY_FORM: VehicleAllocationInput = {
  user_id: '',
  vehicle_id: '',
  driver: '',
  route: '',
  start_date: '',
  end_date: '',
  status: 'active',
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('it-IT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

/** Map old mock shape to VehicleAllocationRow for demo mode */
function mapMockToRow(m: (typeof mockVehicleAllocations)[number], idx: number): VehicleAllocationRow {
  return {
    id: m.id ?? `mock-${idx}`,
    user_id: 'demo-user',
    vehicle_id: m.vehiclePlate,
    driver: m.driver,
    route: m.route,
    start_date: m.departureDate,
    end_date: null,
    status: m.status === 'in_transit' ? 'active' : m.status === 'scheduled' ? 'active' : m.status,
    created_at: new Date().toISOString(),
  }
}

export function VehicleAllocation() {
  const { isDemo, user } = useAuthStore()
  const userId = user?.id ?? null

  const [supabaseData, setSupabaseData] = useState<VehicleAllocationRow[]>([])
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<VehicleAllocationInput>({ ...EMPTY_FORM })
  const [errors, setErrors] = useState<ValidationError[]>([])

  const allocations: VehicleAllocationRow[] = isDemo
    ? mockVehicleAllocations.map(mapMockToRow)
    : supabaseData

  const fetchData = useCallback(async () => {
    if (isDemo || !userId) return
    const rows = await getVehicleAllocations(userId)
    setSupabaseData(rows)
  }, [isDemo, userId])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // KPI
  const activeCount = allocations.filter((a) => a.status === 'active').length
  const completedCount = allocations.filter((a) => a.status === 'completed').length
  const cancelledCount = allocations.filter((a) => a.status === 'cancelled').length

  // Modal helpers
  function openAdd() {
    setEditingId(null)
    setForm({ ...EMPTY_FORM, user_id: userId ?? '' })
    setErrors([])
    setModalOpen(true)
  }

  function openEdit(row: VehicleAllocationRow) {
    setEditingId(row.id)
    setForm({
      user_id: row.user_id,
      vehicle_id: row.vehicle_id,
      driver: row.driver,
      route: row.route,
      start_date: row.start_date,
      end_date: row.end_date ?? '',
      status: row.status,
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
    if (!form.driver.trim()) validationErrors.push({ field: 'driver', message: "L'autista è obbligatorio" })
    if (!form.route.trim()) validationErrors.push({ field: 'route', message: 'La rotta è obbligatoria' })
    if (!form.start_date) validationErrors.push({ field: 'start_date', message: 'La data inizio è obbligatoria' })
    if (form.end_date && form.start_date && !isDateAfter(form.end_date, form.start_date)) {
      validationErrors.push({ field: 'end_date', message: 'La data fine deve essere dopo la data inizio' })
    }
    if (validationErrors.length > 0) { setErrors(validationErrors); return }
    setErrors([])

    const payload: VehicleAllocationInput = {
      ...form,
      end_date: form.end_date || null,
    }
    if (editingId) {
      await updateVehicleAllocation(editingId, payload)
    } else {
      await addVehicleAllocation(payload)
    }
    closeModal()
    await fetchData()
  }

  async function handleDelete(id: string) {
    if (!window.confirm('Eliminare questa allocazione?')) return
    await deleteVehicleAllocation(id)
    await fetchData()
  }

  function setField<K extends keyof VehicleAllocationInput>(key: K, value: VehicleAllocationInput[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-400 to-cyan-500 bg-clip-text text-transparent">
          Allocazione Veicoli
        </h1>
        <button
          onClick={openAdd}
          disabled={isDemo}
          title={isDemo ? 'Registrati per aggiungere dati' : undefined}
          className="px-4 py-2 rounded-xl text-sm font-medium bg-primary-600 hover:bg-primary-500 text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          + Aggiungi Allocazione
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-3 gap-4 mb-3">
        <div className="bg-[#1e293b] rounded-2xl border border-[#334155] p-4">
          <p className="text-xs text-slate-400">Attive</p>
          <p className="text-lg font-bold text-emerald-400">{activeCount}</p>
        </div>
        <div className="bg-[#1e293b] rounded-2xl border border-[#334155] p-4">
          <p className="text-xs text-slate-400">Completate</p>
          <p className="text-lg font-bold text-primary-400">{completedCount}</p>
        </div>
        <div className="bg-[#1e293b] rounded-2xl border border-[#334155] p-4">
          <p className="text-xs text-slate-400">Annullate</p>
          <p className="text-lg font-bold text-red-400">{cancelledCount}</p>
        </div>
      </div>

      {/* Allocations Table */}
      <div className="bg-[#1e293b] rounded-2xl border border-[#334155] p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Assegnazioni Veicoli-Tratte</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#334155]">
                <th className="text-left py-2 px-3 font-medium text-slate-400">Veicolo (ID)</th>
                <th className="text-left py-2 px-3 font-medium text-slate-400">Autista</th>
                <th className="text-left py-2 px-3 font-medium text-slate-400">Rotta</th>
                <th className="text-left py-2 px-3 font-medium text-slate-400">Data Inizio</th>
                <th className="text-left py-2 px-3 font-medium text-slate-400">Data Fine</th>
                <th className="text-left py-2 px-3 font-medium text-slate-400">Stato</th>
                {!isDemo && <th className="text-right py-2 px-3 font-medium text-slate-400">Azioni</th>}
              </tr>
            </thead>
            <tbody>
              {allocations.length > 0 ? (
                allocations.map((alloc) => (
                  <tr
                    key={alloc.id}
                    className="border-b border-[#334155] hover:bg-[#263348] cursor-pointer transition-colors"
                    onClick={() => !isDemo && openEdit(alloc)}
                  >
                    <td className="py-2.5 px-3 font-medium text-white">{alloc.vehicle_id}</td>
                    <td className="py-2.5 px-3 text-slate-300">{alloc.driver}</td>
                    <td className="py-2.5 px-3 text-slate-300">{alloc.route}</td>
                    <td className="py-2.5 px-3 text-slate-300">{formatDate(alloc.start_date)}</td>
                    <td className="py-2.5 px-3 text-slate-300">{alloc.end_date ? formatDate(alloc.end_date) : '—'}</td>
                    <td className="py-2.5 px-3">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_BADGE[alloc.status] ?? ''}`}>
                        {STATUS_LABEL[alloc.status] ?? alloc.status}
                      </span>
                    </td>
                    {!isDemo && (
                      <td className="py-2.5 px-3 text-right">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDelete(alloc.id) }}
                          className="text-red-400 hover:text-red-300 text-xs font-medium"
                        >
                          Elimina
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={isDemo ? 6 : 7} className="py-8 text-center text-sm text-slate-500">
                    Nessun dato disponibile.
                    {!isDemo && (
                      <button onClick={openAdd} className="ml-2 text-primary-400 hover:underline">
                        Aggiungi allocazione
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
      <Modal open={modalOpen} onClose={closeModal} title={editingId ? 'Modifica Allocazione' : 'Nuova Allocazione'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Veicolo (ID)</label>
            <input
              type="text"
              required
              value={form.vehicle_id}
              onChange={(e) => setField('vehicle_id', e.target.value)}
              className="w-full rounded-xl bg-[#0f172a] border border-[#334155] px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Autista</label>
            <input
              type="text"
              required
              value={form.driver}
              onChange={(e) => setField('driver', e.target.value)}
              className={`w-full rounded-xl bg-[#0f172a] border px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 ${fieldError('driver') ? 'border-red-500' : 'border-[#334155]'}`}
            />
            {fieldError('driver') && <p className="text-xs text-red-400 mt-1">{fieldError('driver')}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Rotta</label>
            <input
              type="text"
              required
              value={form.route}
              onChange={(e) => setField('route', e.target.value)}
              className={`w-full rounded-xl bg-[#0f172a] border px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 ${fieldError('route') ? 'border-red-500' : 'border-[#334155]'}`}
            />
            {fieldError('route') && <p className="text-xs text-red-400 mt-1">{fieldError('route')}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Data Inizio</label>
              <input
                type="date"
                required
                value={form.start_date}
                onChange={(e) => setField('start_date', e.target.value)}
                className={`w-full rounded-xl bg-[#0f172a] border px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 ${fieldError('start_date') ? 'border-red-500' : 'border-[#334155]'}`}
              />
              {fieldError('start_date') && <p className="text-xs text-red-400 mt-1">{fieldError('start_date')}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Data Fine</label>
              <input
                type="date"
                value={form.end_date ?? ''}
                onChange={(e) => setField('end_date', e.target.value)}
                className={`w-full rounded-xl bg-[#0f172a] border px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 ${fieldError('end_date') ? 'border-red-500' : 'border-[#334155]'}`}
              />
              {fieldError('end_date') && <p className="text-xs text-red-400 mt-1">{fieldError('end_date')}</p>}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Stato</label>
            <select
              value={form.status}
              onChange={(e) => setField('status', e.target.value)}
              className="w-full rounded-xl bg-[#0f172a] border border-[#334155] px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>{STATUS_LABEL[s]}</option>
              ))}
            </select>
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
