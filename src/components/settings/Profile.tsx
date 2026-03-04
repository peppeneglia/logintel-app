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
      <h1 className="text-2xl font-bold text-white mb-3">Profilo</h1>

      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
        <div className="grid gap-5">
          {fields.map((field) => (
            <div key={field.label}>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                {field.label}
              </label>
              <input
                type="text"
                defaultValue={field.value}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500"
              />
            </div>
          ))}
        </div>

        <button className="mt-6 px-5 py-2.5 bg-primary-500 text-white rounded-xl text-sm font-medium hover:bg-primary-600 transition-colors">
          Salva modifiche
        </button>
      </div>
    </div>
  )
}
