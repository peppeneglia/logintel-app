import { useAuthStore } from '../../../stores/authStore'

const mockTeamMembers = [
  {
    id: 'tm-001',
    name: 'Francesco Moretti',
    email: 'f.moretti@logisticapro.it',
    role: 'Admin',
    status: 'active' as const,
    lastAccess: '2026-02-25',
  },
  {
    id: 'tm-002',
    name: 'Laura Bianchi',
    email: 'l.bianchi@logisticapro.it',
    role: 'Fleet Manager',
    status: 'active' as const,
    lastAccess: '2026-02-25',
  },
  {
    id: 'tm-003',
    name: 'Marco Verdi',
    email: 'm.verdi@logisticapro.it',
    role: 'Dispatcher',
    status: 'active' as const,
    lastAccess: '2026-02-24',
  },
  {
    id: 'tm-004',
    name: 'Giulia Russo',
    email: 'g.russo@logisticapro.it',
    role: 'Analista',
    status: 'active' as const,
    lastAccess: '2026-02-23',
  },
  {
    id: 'tm-005',
    name: 'Andrea Colombo',
    email: 'a.colombo@logisticapro.it',
    role: 'Dispatcher',
    status: 'invited' as const,
    lastAccess: '-',
  },
  {
    id: 'tm-006',
    name: 'Sara Fontana',
    email: 's.fontana@logisticapro.it',
    role: 'Viewer',
    status: 'disabled' as const,
    lastAccess: '2026-01-15',
  },
]

const statusBadge: Record<string, string> = {
  active: 'bg-emerald-500/10 text-emerald-400',
  invited: 'bg-amber-500/10 text-amber-400',
  disabled: 'bg-red-500/10 text-red-400',
}

const statusLabel: Record<string, string> = {
  active: 'Attivo',
  invited: 'Invitato',
  disabled: 'Disabilitato',
}

export function Team() {
  const isDemo = useAuthStore((s) => s.isDemo)

  const members = isDemo ? mockTeamMembers : []
  const active = members.filter((m) => m.status === 'active').length
  const invited = members.filter((m) => m.status === 'invited').length

  return (
    <div>
      <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-400 to-cyan-500 bg-clip-text text-transparent mb-3">Team</h1>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
        <div className="bg-[#1e293b] rounded-2xl border border-[#334155] p-4">
          <p className="text-xs text-slate-400">Membri totali</p>
          <p className="text-xl font-bold text-white">{members.length}</p>
        </div>
        <div className="bg-[#1e293b] rounded-2xl border border-[#334155] p-4">
          <p className="text-xs text-slate-400">Attivi</p>
          <p className="text-xl font-bold text-emerald-400">{active}</p>
        </div>
        <div className="bg-[#1e293b] rounded-2xl border border-[#334155] p-4">
          <p className="text-xs text-slate-400">Inviti in sospeso</p>
          <p className="text-xl font-bold text-amber-400">{invited}</p>
        </div>
      </div>

      {/* Team table */}
      <div className="bg-[#1e293b] rounded-2xl border border-[#334155] p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-slate-300">Membri del team</h2>
          <button className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-700 text-white rounded-xl text-sm font-medium hover:from-emerald-600 hover:to-emerald-800 transition-colors">
            Invita membro
          </button>
        </div>
        {members.length === 0 ? (
          <p className="text-sm text-slate-500 py-4">Nessun membro nel team.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#334155]">
                  <th className="text-left py-3 px-3 font-medium text-slate-400">Nome</th>
                  <th className="text-left py-3 px-3 font-medium text-slate-400">Email</th>
                  <th className="text-left py-3 px-3 font-medium text-slate-400">Ruolo</th>
                  <th className="text-left py-3 px-3 font-medium text-slate-400">Ultimo accesso</th>
                  <th className="text-left py-3 px-3 font-medium text-slate-400">Stato</th>
                </tr>
              </thead>
              <tbody>
                {members.map((member) => (
                  <tr key={member.id} className="border-b border-[#334155]">
                    <td className="py-3 px-3 text-white font-medium">{member.name}</td>
                    <td className="py-3 px-3 text-slate-400">{member.email}</td>
                    <td className="py-3 px-3 text-slate-300">{member.role}</td>
                    <td className="py-3 px-3 text-slate-400">{member.lastAccess}</td>
                    <td className="py-3 px-3">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${statusBadge[member.status]}`}>
                        {statusLabel[member.status]}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
