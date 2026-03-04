import { useState, useEffect } from 'react'
import { useAuthStore } from '../../../stores/authStore'
import * as settingsService from '../../../services/settings'

export function General() {
  const { user } = useAuthStore()

  const [form, setForm] = useState({
    language: 'it',
    timezone: 'Europe/Rome',
    date_format: 'dd/MM/yyyy',
    unit_system: 'metric',
    currency: 'EUR',
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (user) {
      settingsService.getSettings(user.id).then((s) => {
        if (s) {
          setForm({
            language: s.language,
            timezone: s.timezone,
            date_format: s.date_format,
            unit_system: s.unit_system,
            currency: s.currency,
          })
        }
      })
    }
  }, [user])

  const handleSave = async () => {
    if (!user) return
    setSaving(true)
    setSaved(false)
    try {
      await settingsService.updateSettings(user.id, form)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch {
      // gestione errore
    } finally {
      setSaving(false)
    }
  }

  const selects = [
    {
      label: 'Lingua',
      key: 'language' as const,
      options: [
        { value: 'it', label: 'Italiano' },
        { value: 'en', label: 'English' },
      ],
    },
    {
      label: 'Fuso orario',
      key: 'timezone' as const,
      options: [
        { value: 'Europe/Rome', label: 'Europa/Roma (CET)' },
        { value: 'Europe/London', label: 'Europa/Londra (GMT)' },
        { value: 'Europe/Berlin', label: 'Europa/Berlino (CET)' },
      ],
    },
    {
      label: 'Formato data',
      key: 'date_format' as const,
      options: [
        { value: 'dd/MM/yyyy', label: 'GG/MM/AAAA' },
        { value: 'MM/dd/yyyy', label: 'MM/GG/AAAA' },
        { value: 'yyyy-MM-dd', label: 'AAAA-MM-GG' },
      ],
    },
    {
      label: 'Unità di misura',
      key: 'unit_system' as const,
      options: [
        { value: 'metric', label: 'Metrico (km, kg)' },
        { value: 'imperial', label: 'Imperiale (mi, lb)' },
      ],
    },
    {
      label: 'Valuta',
      key: 'currency' as const,
      options: [
        { value: 'EUR', label: 'Euro (€)' },
        { value: 'USD', label: 'Dollaro ($)' },
        { value: 'GBP', label: 'Sterlina (£)' },
      ],
    },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-400 to-cyan-500 bg-clip-text text-transparent mb-3">Generali</h1>

      <div className="bg-[#1e293b] border border-[#334155] rounded-2xl p-6 space-y-3">
        {selects.map((s) => (
          <div key={s.key}>
            <label className="block text-sm font-medium text-slate-400 mb-1">{s.label}</label>
            <select
              value={form[s.key]}
              onChange={(e) => setForm((prev) => ({ ...prev, [s.key]: e.target.value }))}
              className="w-full bg-[#334155] border border-slate-600 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500"
            >
              {s.options.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        ))}

        <div className="flex items-center gap-3">
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
