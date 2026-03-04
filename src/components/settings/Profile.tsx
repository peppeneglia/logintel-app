import { mockUser } from '../../data/mockData'

export function Profile() {
  const fields = [
    { label: 'Nome', value: mockUser.name },
    { label: 'Email', value: mockUser.email },
    { label: 'Azienda', value: mockUser.company },
    { label: 'Ruolo', value: mockUser.role },
    { label: 'Veicoli in flotta', value: String(mockUser.fleetSize) },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-400 to-cyan-500 bg-clip-text text-transparent mb-3">Profilo</h1>

      <div className="bg-[#1e293b] border border-[#334155] rounded-2xl p-6">
        <div className="grid gap-5">
          {fields.map((field) => (
            <div key={field.label}>
              <label className="block text-sm font-medium text-slate-400 mb-1">
                {field.label}
              </label>
              <input
                type="text"
                defaultValue={field.value}
                className="w-full bg-[#334155] border border-slate-600 rounded-xl px-3 py-2 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500"
              />
            </div>
          ))}
        </div>

        <button className="mt-6 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-700 text-white rounded-xl text-sm font-medium hover:from-emerald-600 hover:to-emerald-800 transition-colors">
          Salva modifiche
        </button>
      </div>
    </div>
  )
}
