import { useState, useEffect, useCallback, type FormEvent } from 'react'
import { FileText, Plus, Pencil, Trash2 } from 'lucide-react'
import { mockComplianceDocuments } from '../../../data/mockComplianceData'
import { useAuthStore } from '../../../stores/authStore'
import { Modal } from '../../../components/Modal'
import {
  getComplianceDocuments, addComplianceDocument, updateComplianceDocument, deleteComplianceDocument,
  computeDocumentStatus,
} from '../../../services/compliance'
import type { ComplianceDocumentRow, ComplianceDocumentInput } from '../../../services/compliance'
import type { ValidationError } from '../../../lib/validation'
import { Field, inputCls } from '../../../components/FormFields'

// ── Status maps ──

const statusBadge: Record<string, string> = {
  valid: 'bg-emerald-500/10 text-emerald-400',
  expiring: 'bg-amber-500/10 text-amber-400',
  expired: 'bg-red-500/10 text-red-400',
}

const statusLabel: Record<string, string> = {
  valid: 'Valido',
  expiring: 'In Scadenza',
  expired: 'Scaduto',
}

// ── Type options ──

const typeOptions = [
  { value: 'license', label: 'Patente' },
  { value: 'CQC', label: 'CQC' },
  { value: 'ADR', label: 'ADR' },
  { value: 'tachograph', label: 'Tachigrafo' },
]

const typeLabel: Record<string, string> = {
  license: 'Patente',
  CQC: 'CQC',
  ADR: 'ADR',
  tachograph: 'Tachigrafo',
}

// ── Unified display type ──

interface DisplayDocument {
  id: string
  driver: string
  type: string
  document_number: string
  expiry_date: string
  status: string
}

function mockToDisplay(d: (typeof mockComplianceDocuments)[number]): DisplayDocument {
  return {
    id: d.id,
    driver: d.holder,
    type: d.documentType,
    document_number: d.number,
    expiry_date: d.expiryDate,
    status: d.status,
  }
}

function rowToDisplay(d: ComplianceDocumentRow): DisplayDocument {
  return {
    id: d.id,
    driver: d.driver,
    type: d.type,
    document_number: d.document_number || '',
    expiry_date: d.expiry_date,
    status: computeDocumentStatus(d.expiry_date),
  }
}

// ── Helpers ──

function daysToExpiry(expiryDate: string): number {
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const expiry = new Date(expiryDate)
  expiry.setHours(0, 0, 0, 0)
  return Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
}

// ── Empty form defaults ──

const emptyForm = {
  driver: '',
  type: 'license',
  document_number: '',
  expiry_date: '',
}

// ── Main component ──

export function DocumentsLicenses() {
  const isDemo = useAuthStore((s) => s.isDemo)
  const userId = useAuthStore((s) => s.user?.id)

  const [supabaseData, setSupabaseData] = useState<ComplianceDocumentRow[]>([])
  const [loading, setLoading] = useState(false)
  const [statusFilter, setStatusFilter] = useState<string>('all')
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
      const rows = await getComplianceDocuments(userId)
      setSupabaseData(rows)
    } finally {
      setLoading(false)
    }
  }, [isDemo, userId])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // ── Display documents ──

  const allDocuments: DisplayDocument[] = isDemo
    ? mockComplianceDocuments.map(mockToDisplay)
    : supabaseData.map(rowToDisplay)

  const documents = statusFilter === 'all'
    ? allDocuments
    : allDocuments.filter((d) => d.status === statusFilter)

  // ── Modal handlers ──

  function openAdd() {
    setEditingId(null)
    setForm(emptyForm)
    setErrors([])
    setModalOpen(true)
  }

  function openEdit(d: DisplayDocument) {
    if (isDemo) return
    setEditingId(d.id)
    setForm({
      driver: d.driver,
      type: d.type,
      document_number: d.document_number,
      expiry_date: d.expiry_date,
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
    if (!form.driver.trim()) validationErrors.push({ field: 'driver', message: "L'autista è obbligatorio" })
    if (!form.type.trim()) validationErrors.push({ field: 'type', message: 'Il tipo documento è obbligatorio' })
    if (!form.expiry_date) validationErrors.push({ field: 'expiry_date', message: 'La data scadenza è obbligatoria' })
    if (validationErrors.length > 0) { setErrors(validationErrors); return }
    setErrors([])

    setSaving(true)
    try {
      const input: ComplianceDocumentInput = {
        user_id: userId,
        driver: form.driver.trim(),
        type: form.type,
        document_number: form.document_number.trim() || null,
        expiry_date: form.expiry_date,
        status: computeDocumentStatus(form.expiry_date),
      }
      if (editingId) {
        await updateComplianceDocument(editingId, input)
      } else {
        await addComplianceDocument(input)
      }
      closeModal()
      await fetchData()
    } catch (err) {
      console.error('Errore salvataggio documento:', err)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm('Eliminare questo documento? L\'operazione non è reversibile.')) return
    try {
      await deleteComplianceDocument(id)
      await fetchData()
    } catch (err) {
      console.error('Errore eliminazione documento:', err)
    }
  }

  // ── Render ──

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-400 to-cyan-500 bg-clip-text text-transparent">
          Documenti & Scadenze
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

      {/* Filter */}
      <div className="bg-[#1e293b] rounded-2xl border border-[#334155] p-6 mb-3">
        <label className="block text-sm font-medium text-slate-300 mb-2">Filtra per stato</label>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 bg-[#334155] border border-slate-600 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500"
        >
          <option value="all">Tutti</option>
          <option value="valid">Valido</option>
          <option value="expiring">In Scadenza</option>
          <option value="expired">Scaduto</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-[#1e293b] rounded-2xl border border-[#334155] p-6">
        <h2 className="text-sm font-semibold text-slate-300 mb-4">Elenco documenti</h2>

        {loading ? (
          <p className="text-sm text-slate-500 py-8 text-center">Caricamento...</p>
        ) : documents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-14 h-14 rounded-2xl bg-slate-800 flex items-center justify-center mb-4">
              <FileText size={28} className="text-slate-600" />
            </div>
            <p className="text-white font-semibold mb-1">Nessun documento registrato</p>
            <p className="text-sm text-slate-500 mb-5 max-w-xs">
              Aggiungi il primo documento per monitorare scadenze di patenti, CQC, ADR e tachigrafi.
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
                  <th className="text-left py-3 px-3 font-medium text-slate-400">Autista</th>
                  <th className="text-left py-3 px-3 font-medium text-slate-400">Tipo</th>
                  <th className="text-left py-3 px-3 font-medium text-slate-400">Numero Documento</th>
                  <th className="text-left py-3 px-3 font-medium text-slate-400">Data Scadenza</th>
                  <th className="text-left py-3 px-3 font-medium text-slate-400">Giorni</th>
                  <th className="text-left py-3 px-3 font-medium text-slate-400">Stato</th>
                  {!isDemo && (
                    <th className="text-center py-3 px-3 font-medium text-slate-400">Azioni</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {documents.map((doc) => {
                  const days = daysToExpiry(doc.expiry_date)
                  return (
                    <tr
                      key={doc.id}
                      className={`border-b border-[#334155] ${!isDemo ? 'cursor-pointer hover:bg-[#253347] transition-colors' : ''}`}
                      onClick={() => openEdit(doc)}
                    >
                      <td className="py-3 px-3 text-white font-medium">{doc.driver}</td>
                      <td className="py-3 px-3 text-slate-300">{typeLabel[doc.type] || doc.type}</td>
                      <td className="py-3 px-3 text-slate-400 font-mono text-xs">{doc.document_number || '\u2014'}</td>
                      <td className="py-3 px-3 text-slate-400">{doc.expiry_date}</td>
                      <td className="py-3 px-3">
                        <span
                          className={`font-semibold ${
                            days < 0
                              ? 'text-red-400'
                              : days <= 60
                                ? 'text-amber-400'
                                : 'text-slate-300'
                          }`}
                        >
                          {days}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${statusBadge[doc.status] || 'bg-slate-500/10 text-slate-400'}`}
                        >
                          {statusLabel[doc.status] || doc.status}
                        </span>
                      </td>
                      {!isDemo && (
                        <td className="py-3 px-3 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={(e) => { e.stopPropagation(); openEdit(doc) }}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#334155] transition-colors"
                              title="Modifica"
                            >
                              <Pencil size={15} />
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleDelete(doc.id) }}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                              title="Elimina"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      <Modal
        open={modalOpen}
        onClose={closeModal}
        title={editingId ? 'Modifica documento' : 'Nuovo documento'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <Field label="Autista" error={fieldError('driver')}>
              <input
                required
                value={form.driver}
                onChange={(e) => setForm((p) => ({ ...p, driver: e.target.value }))}
                placeholder="es. Marco Bianchi"
                className={`${inputCls} ${fieldError('driver') ? 'border-red-500' : ''}`}
              />
            </Field>
            <Field label="Tipo" error={fieldError('type')}>
              <select
                value={form.type}
                onChange={(e) => setForm((p) => ({ ...p, type: e.target.value }))}
                className={`${inputCls} ${fieldError('type') ? 'border-red-500' : ''}`}
              >
                {typeOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </Field>
            <Field label="Numero Documento">
              <input
                value={form.document_number}
                onChange={(e) => setForm((p) => ({ ...p, document_number: e.target.value }))}
                placeholder="es. CQC-2021-48271"
                className={inputCls}
              />
            </Field>
          </div>

          <Field label="Data Scadenza" error={fieldError('expiry_date')}>
            <input
              type="date"
              required
              value={form.expiry_date}
              onChange={(e) => setForm((p) => ({ ...p, expiry_date: e.target.value }))}
              className={`${inputCls} ${fieldError('expiry_date') ? 'border-red-500' : ''}`}
            />
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
