import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { KeyRound, Trash2 } from 'lucide-react'
import { useAuthStore } from '../../../stores/authStore'
import { resetPassword } from '../../../services/auth'

export function Profile() {
  const navigate = useNavigate()
  const { profile, user, updateProfile, deleteAccount, isDemo } = useAuthStore()

  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    company: '',
    role: '',
    fleet_size: '',
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [resetSent, setResetSent] = useState(false)
  const [resetError, setResetError] = useState('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  useEffect(() => {
    if (profile) {
      setForm({
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        email: profile.email || user?.email || '',
        company: profile.company || '',
        role: profile.role || '',
        fleet_size: String(profile.fleet_size || ''),
      })
    } else if (isDemo) {
      setForm({
        first_name: 'Utente',
        last_name: 'Demo',
        email: 'demo@logintel.it',
        company: 'Demo S.r.l.',
        role: 'Fleet Manager',
        fleet_size: '24',
      })
    }
  }, [profile, user, isDemo])

  const handleSave = async () => {
    setSaving(true)
    setSaved(false)
    try {
      await updateProfile({
        first_name: form.first_name,
        last_name: form.last_name,
        company: form.company || null,
        role: form.role || null,
        fleet_size: form.fleet_size ? parseInt(form.fleet_size) : 0,
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } finally {
      setSaving(false)
    }
  }

  const handleResetPassword = async () => {
    if (isDemo) return
    setResetError('')
    try {
      const email = user?.email || form.email
      await resetPassword(email)
      setResetSent(true)
      setTimeout(() => setResetSent(false), 5000)
    } catch (err) {
      setResetError(err instanceof Error ? err.message : 'Errore durante l\'invio')
    }
  }

  const handleDeleteAccount = async () => {
    setDeleting(true)
    setDeleteError('')
    try {
      await deleteAccount()
      navigate('/login', { replace: true })
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Errore durante la cancellazione')
      setDeleting(false)
    }
  }

  const fields = [
    { label: 'Nome', key: 'first_name' as const, type: 'text' },
    { label: 'Cognome', key: 'last_name' as const, type: 'text' },
    { label: 'Email', key: 'email' as const, type: 'email', disabled: true },
    { label: 'Azienda', key: 'company' as const, type: 'text' },
    { label: 'Ruolo', key: 'role' as const, type: 'text' },
    { label: 'Veicoli in flotta', key: 'fleet_size' as const, type: 'number' },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-400 to-cyan-500 bg-clip-text text-transparent mb-3">Profilo</h1>

      <div className="bg-[#1e293b] border border-[#334155] rounded-2xl p-6">
        <div className="grid gap-5">
          {fields.map((field) => (
            <div key={field.key}>
              <label className="block text-sm font-medium text-slate-400 mb-1">
                {field.label}
              </label>
              <input
                type={field.type}
                value={form[field.key]}
                onChange={(e) => setForm((prev) => ({ ...prev, [field.key]: e.target.value }))}
                disabled={field.disabled}
                className="w-full bg-[#334155] border border-slate-600 rounded-xl px-3 py-2 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
          ))}
        </div>

        <div className="flex items-center gap-3 mt-6">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-700 text-white rounded-xl text-sm font-medium hover:from-emerald-600 hover:to-emerald-800 transition-colors disabled:opacity-60"
          >
            {saving ? 'Salvataggio...' : 'Salva modifiche'}
          </button>
          {saved && (
            <span className="text-sm text-emerald-400">Salvato con successo</span>
          )}
        </div>
      </div>

      {/* Sicurezza */}
      <div className="bg-[#1e293b] border border-[#334155] rounded-2xl p-6 mt-4">
        <h2 className="text-lg font-semibold text-white mb-4">Sicurezza</h2>
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleResetPassword}
            disabled={isDemo}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#334155] border border-slate-600 rounded-xl text-sm font-medium text-slate-300 hover:bg-[#3d4f6a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <KeyRound size={16} />
            Cambia password
          </button>
          {resetSent && (
            <span className="text-sm text-emerald-400">Email di reset inviata</span>
          )}
          {resetError && (
            <span className="text-sm text-red-400">{resetError}</span>
          )}
          {isDemo && (
            <span className="text-xs text-slate-500">Non disponibile in modalità demo</span>
          )}
        </div>
      </div>

      {/* Cancella account */}
      <div className="bg-[#1e293b] border border-[#334155] rounded-2xl p-6 mt-4">
        <h2 className="text-lg font-semibold text-white mb-2">Elimina account</h2>
        <p className="text-sm text-slate-400 mb-4">
          Questa azione è irreversibile. Tutti i tuoi dati verranno cancellati permanentemente.
        </p>

        {!showDeleteConfirm ? (
          <button
            onClick={() => isDemo ? undefined : setShowDeleteConfirm(true)}
            disabled={isDemo}
            className="flex items-center gap-2 px-4 py-2.5 bg-red-500/10 border border-red-500/20 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Trash2 size={16} />
            Elimina il mio account
          </button>
        ) : (
          <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-4">
            <p className="text-sm text-red-300 font-medium mb-3">
              Sei sicuro? Questa azione non può essere annullata.
            </p>
            {deleteError && (
              <p className="text-sm text-red-400 mb-3">{deleteError}</p>
            )}
            <div className="flex items-center gap-3">
              <button
                onClick={handleDeleteAccount}
                disabled={deleting}
                className="px-4 py-2 bg-red-600 text-white rounded-xl text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-60"
              >
                {deleting ? 'Eliminazione...' : 'Conferma eliminazione'}
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 bg-[#334155] border border-slate-600 rounded-xl text-sm font-medium text-slate-300 hover:bg-[#3d4f6a] transition-colors"
              >
                Annulla
              </button>
            </div>
          </div>
        )}
        {isDemo && (
          <span className="text-xs text-slate-500 mt-2 block">Non disponibile in modalità demo</span>
        )}
      </div>
    </div>
  )
}
