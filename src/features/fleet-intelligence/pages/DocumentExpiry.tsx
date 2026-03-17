import { useState, useEffect, useCallback } from 'react'
import { Modal } from '../../../components/Modal'
import { useAuthStore } from '../../../stores/authStore'
import { useCredits } from '../../../hooks/useCredits'
import { CREDIT_COSTS } from '../../../lib/creditCosts'
import { getDocumentExpiries, addDocumentExpiry, updateDocumentExpiry, deleteDocumentExpiry } from '../../../services/fleet'
import type { DocumentExpiryRow, DocumentExpiryInput } from '../../../services/fleet'
import { mockDocumentExpiries } from '../../../data/mockFleetData'
import type { ValidationError } from '../../../lib/validation'
import { Field, AutocompleteInput, inputCls } from '../../../components/FormFields'

const FLEET_DOC_TYPE_OPTIONS = ['Revisione', 'Assicurazione RCA', 'Autorizzazione conto terzi', 'Patente C', 'Patente CQC', 'Carta tachigrafica', 'Certificato ADR']

const STATUS_BADGE: Record<string, string> = {
  valid: 'bg-emerald-500/10 text-emerald-400',
  expiring: 'bg-amber-500/10 text-amber-400',
  expired: 'bg-red-500/10 text-red-400',
}

const STATUS_LABEL: Record<string, string> = {
  valid: 'Valido',
  expiring: 'In Scadenza',
  expired: 'Scaduto',
}

const EMPTY_FORM: DocumentExpiryInput = {
  user_id: '',
  vehicle_id: '',
  document_type: '',
  document_number: '',
  expiry_date: '',
  status: 'valid',
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('it-IT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

function computeStatus(expiryDate: string): 'valid' | 'expiring' | 'expired' {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const expiry = new Date(expiryDate)
  expiry.setHours(0, 0, 0, 0)
  if (expiry < today) return 'expired'
  const thirtyDays = new Date(today)
  thirtyDays.setDate(thirtyDays.getDate() + 30)
  if (expiry < thirtyDays) return 'expiring'
  return 'valid'
}

function computeDaysLeft(expiryDate: string): number {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const expiry = new Date(expiryDate)
  expiry.setHours(0, 0, 0, 0)
  return Math.round((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
}

function daysLeftText(days: number): string {
  if (days < 0) return `${Math.abs(days)} gg scaduto`
  if (days === 0) return 'Oggi'
  return `${days} gg`
}

function daysLeftColor(days: number): string {
  if (days < 0) return 'text-red-400 font-semibold'
  if (days <= 14) return 'text-amber-400 font-semibold'
  return 'text-slate-300'
}

/** Map old mock shape to DocumentExpiryRow for demo mode */
function mapMockToRow(m: (typeof mockDocumentExpiries)[number]): DocumentExpiryRow {
  return {
    id: m.id,
    user_id: 'demo-user',
    vehicle_id: m.holder,
    document_type: m.documentType,
    document_number: null,
    expiry_date: m.expiryDate,
    status: m.status,
    created_at: new Date().toISOString(),
  }
}

export function DocumentExpiry() {
  const { isDemo, user } = useAuthStore()
  const userId = user?.id ?? null
  const { canAfford, consume } = useCredits()

  const [supabaseData, setSupabaseData] = useState<DocumentExpiryRow[]>([])
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<DocumentExpiryInput>({ ...EMPTY_FORM })
  const [errors, setErrors] = useState<ValidationError[]>([])

  const rawDocuments: DocumentExpiryRow[] = isDemo
    ? mockDocumentExpiries.map(mapMockToRow)
    : supabaseData

  // Recompute status client-side and sort by days left
  const documents = rawDocuments
    .map((doc) => {
      const status = computeStatus(doc.expiry_date)
      return { ...doc, status, _daysLeft: computeDaysLeft(doc.expiry_date) }
    })
    .sort((a, b) => a._daysLeft - b._daysLeft)

  const fetchData = useCallback(async () => {
    if (isDemo || !userId) return
    const rows = await getDocumentExpiries(userId)
    setSupabaseData(rows)
    await consume(CREDIT_COSTS.FLEET_DOCUMENT_LOAD, 'FLEET_DOCUMENT_LOAD')
  }, [isDemo, userId])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // KPI
  const expiredCount = documents.filter((d) => d.status === 'expired').length
  const expiringCount = documents.filter((d) => d.status === 'expiring').length
  const validCount = documents.filter((d) => d.status === 'valid').length

  // Modal helpers
  function openAdd() {
    setEditingId(null)
    setForm({ ...EMPTY_FORM, user_id: userId ?? '' })
    setErrors([])
    setModalOpen(true)
  }

  function openEdit(row: DocumentExpiryRow) {
    setEditingId(row.id)
    setForm({
      user_id: row.user_id,
      vehicle_id: row.vehicle_id,
      document_type: row.document_type,
      document_number: row.document_number ?? '',
      expiry_date: row.expiry_date,
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
    if (!form.document_type.trim()) validationErrors.push({ field: 'document_type', message: 'Il tipo documento è obbligatorio' })
    if (!form.expiry_date) validationErrors.push({ field: 'expiry_date', message: 'La data scadenza è obbligatoria' })
    if (validationErrors.length > 0) { setErrors(validationErrors); return }
    setErrors([])

    const status = computeStatus(form.expiry_date)
    const payload: DocumentExpiryInput = {
      ...form,
      document_number: form.document_number || null,
      status,
    }
    if (editingId) {
      await updateDocumentExpiry(editingId, payload)
      await consume(CREDIT_COSTS.FLEET_VEHICLE_UPDATE, 'FLEET_VEHICLE_UPDATE')
    } else {
      if (!canAfford(CREDIT_COSTS.FLEET_VEHICLE_ADD)) {
        setErrors([{ field: '', message: 'Crediti insufficienti per aggiungere un documento' }])
        return
      }
      await addDocumentExpiry(payload)
      await consume(CREDIT_COSTS.FLEET_VEHICLE_ADD, 'FLEET_VEHICLE_ADD')
    }
    closeModal()
    await fetchData()
  }

  async function handleDelete(id: string) {
    if (!window.confirm('Eliminare questo documento?')) return
    await deleteDocumentExpiry(id)
    await fetchData()
  }

  function setField<K extends keyof DocumentExpiryInput>(key: K, value: DocumentExpiryInput[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-400 to-cyan-500 bg-clip-text text-transparent">
          Scadenze & Documenti
        </h1>
        <button
          onClick={openAdd}
          disabled={isDemo}
          title={isDemo ? 'Registrati per aggiungere dati' : undefined}
          className="px-4 py-2 rounded-xl text-sm font-medium bg-primary-600 hover:bg-primary-500 text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          + Aggiungi Documento
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-3 gap-4 mb-3">
        <div className="bg-[#1e293b] rounded-2xl border border-[#334155] p-4">
          <p className="text-xs text-slate-400">Scaduti</p>
          <p className="text-lg font-bold text-red-400">{expiredCount}</p>
        </div>
        <div className="bg-[#1e293b] rounded-2xl border border-[#334155] p-4">
          <p className="text-xs text-slate-400">In Scadenza</p>
          <p className="text-lg font-bold text-amber-400">{expiringCount}</p>
        </div>
        <div className="bg-[#1e293b] rounded-2xl border border-[#334155] p-4">
          <p className="text-xs text-slate-400">Validi</p>
          <p className="text-lg font-bold text-emerald-400">{validCount}</p>
        </div>
      </div>

      {/* Documents Table */}
      <div className="bg-[#1e293b] rounded-2xl border border-[#334155] p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Elenco Documenti</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#334155]">
                <th className="text-left py-2 px-3 font-medium text-slate-400">Veicolo (ID)</th>
                <th className="text-left py-2 px-3 font-medium text-slate-400">Tipo Documento</th>
                <th className="text-left py-2 px-3 font-medium text-slate-400">Numero Documento</th>
                <th className="text-left py-2 px-3 font-medium text-slate-400">Data Scadenza</th>
                <th className="text-right py-2 px-3 font-medium text-slate-400">Giorni</th>
                <th className="text-left py-2 px-3 font-medium text-slate-400">Stato</th>
                {!isDemo && <th className="text-right py-2 px-3 font-medium text-slate-400">Azioni</th>}
              </tr>
            </thead>
            <tbody>
              {documents.length > 0 ? (
                documents.map((doc) => {
                  const rowHighlight =
                    doc.status === 'expired'
                      ? 'bg-red-500/5'
                      : doc.status === 'expiring'
                        ? 'bg-amber-500/5'
                        : ''
                  return (
                    <tr
                      key={doc.id}
                      className={`border-b border-[#334155] hover:bg-[#263348] cursor-pointer transition-colors ${rowHighlight}`}
                      onClick={() => !isDemo && openEdit(doc)}
                    >
                      <td className="py-2.5 px-3 font-medium text-white">{doc.vehicle_id}</td>
                      <td className="py-2.5 px-3 text-slate-300">{doc.document_type}</td>
                      <td className="py-2.5 px-3 text-slate-300">{doc.document_number ?? '—'}</td>
                      <td className="py-2.5 px-3 text-slate-300">{formatDate(doc.expiry_date)}</td>
                      <td className={`py-2.5 px-3 text-right ${daysLeftColor(doc._daysLeft)}`}>
                        {daysLeftText(doc._daysLeft)}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_BADGE[doc.status] ?? ''}`}>
                          {STATUS_LABEL[doc.status] ?? doc.status}
                        </span>
                      </td>
                      {!isDemo && (
                        <td className="py-2.5 px-3 text-right">
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDelete(doc.id) }}
                            className="text-red-400 hover:text-red-300 text-xs font-medium"
                          >
                            Elimina
                          </button>
                        </td>
                      )}
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan={isDemo ? 6 : 7} className="py-8 text-center text-sm text-slate-500">
                    Nessun dato disponibile.
                    {!isDemo && (
                      <button onClick={openAdd} className="ml-2 text-primary-400 hover:underline">
                        Aggiungi documento
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
      <Modal open={modalOpen} onClose={closeModal} title={editingId ? 'Modifica Documento' : 'Nuovo Documento'}>
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
            <Field label="Tipo Documento" error={fieldError('document_type')}>
              <AutocompleteInput
                value={form.document_type}
                onChange={(val) => setField('document_type', val)}
                options={FLEET_DOC_TYPE_OPTIONS}
                placeholder="es. Revisione"
                required
                className={`${inputCls} ${fieldError('document_type') ? 'border-red-500' : ''}`}
              />
            </Field>
            <Field label="Numero Documento">
              <input
                type="text"
                value={form.document_number ?? ''}
                onChange={(e) => setField('document_number', e.target.value)}
                className={inputCls}
              />
            </Field>
          </div>
          <Field label="Data Scadenza" error={fieldError('expiry_date')}>
            <input
              type="date"
              required
              value={form.expiry_date}
              onChange={(e) => setField('expiry_date', e.target.value)}
              className={`${inputCls} ${fieldError('expiry_date') ? 'border-red-500' : ''}`}
            />
          </Field>
          {/* Status preview (auto-computed) */}
          {form.expiry_date && (
            <div className="rounded-xl bg-[#0f172a] border border-[#334155] p-3 text-sm flex items-center justify-between">
              <span className="text-slate-400">Stato calcolato</span>
              <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_BADGE[computeStatus(form.expiry_date)]}`}>
                {STATUS_LABEL[computeStatus(form.expiry_date)]}
              </span>
            </div>
          )}
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
