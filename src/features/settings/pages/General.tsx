import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { LogOut } from 'lucide-react'
import { useAuthStore } from '../../../stores/authStore'

const STORAGE_KEY = 'logintel-settings'

function loadSettings() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) return JSON.parse(saved)
  } catch { /* ignore */ }
  return null
}

const defaultSettings = {
  language: 'it',
  timezone: 'Europe/Rome',
  date_format: 'dd/MM/yyyy',
  unit_system: 'metric',
  currency: 'EUR',
}

export function General() {
  const navigate = useNavigate()
  const { signOut, isDemo } = useAuthStore()
  const [form, setForm] = useState(defaultSettings)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const stored = loadSettings()
    if (stored) setForm((prev) => ({ ...prev, ...stored }))
  }, [])

  const handleSave = () => {
    setSaving(true)
    setSaved(false)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(form))
    setTimeout(() => {
      setSaved(true)
      setSaving(false)
      setTimeout(() => setSaved(false), 3000)
    }, 300)
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

      {/* Logout */}
      <div className="bg-[#1e293b] border border-[#334155] rounded-2xl p-6 mt-4">
        <button
          onClick={async () => {
            await signOut()
            navigate('/login', { replace: true })
          }}
          className="flex items-center gap-2 px-4 py-2.5 bg-red-500/10 border border-red-500/20 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/20 transition-colors"
        >
          <LogOut size={16} />
          {isDemo ? 'Esci dalla demo' : 'Esci dal tuo account'}
        </button>
      </div>
    </div>
  )
}
