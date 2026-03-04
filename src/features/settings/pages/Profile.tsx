import { useState, useEffect } from 'react'
import { useAuthStore } from '../../../stores/authStore'

export function Profile() {
  const { profile, updateProfile } = useAuthStore()

  const [form, setForm] = useState({
    name: '',
    email: '',
    company: '',
    role: '',
    fleet_size: '0',
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (profile) {
      setForm({
        name: profile.name || '',
        email: profile.email || '',
        company: profile.company || '',
        role: profile.role || '',
        fleet_size: String(profile.fleet_size || 0),
      })
    }
  }, [profile])

  const handleSave = async () => {
    setSaving(true)
    setSaved(false)
    try {
      await updateProfile({
        name: form.name,
        company: form.company || null,
        role: form.role || null,
        fleet_size: parseInt(form.fleet_size) || 0,
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch {
      // errore gestito dallo store
    } finally {
      setSaving(false)
    }
  }

  const fields = [
    { label: 'Nome', key: 'name' as const, type: 'text' },
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
    </div>
  )
}
