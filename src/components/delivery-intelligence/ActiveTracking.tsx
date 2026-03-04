import { mockActiveTrackings } from '../../data/mockDeliveryData'

function TrackingStatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; style: string }> = {
    on_schedule: { label: 'In orario', style: 'bg-emerald-500/10 text-emerald-400' },
    delayed: { label: 'In ritardo', style: 'bg-red-500/10 text-red-400' },
    ahead: { label: 'In anticipo', style: 'bg-emerald-500/10 text-emerald-400' },
  }

  const { label, style } = config[status] ?? { label: status, style: 'bg-slate-500/10 text-slate-400' }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${style}`}>
      {label}
    </span>
  )
}

function ProgressBar({ percent, status }: { percent: number; status: string }) {
  const barColor = status === 'delayed' ? 'bg-red-400' : status === 'ahead' ? 'bg-emerald-400' : 'bg-primary-400'

  return (
    <div className="w-full bg-[#334155] rounded-full h-2">
      <div
        className={`h-2 rounded-full transition-all ${barColor}`}
        style={{ width: `${percent}%` }}
      />
    </div>
  )
}

export function ActiveTracking() {
  return (
    <div>
      <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-400 to-cyan-500 bg-clip-text text-transparent mb-3">Tracking Attivo</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {mockActiveTrackings.map((t) => (
          <div key={t.id} className="bg-[#1e293b] rounded-2xl border border-[#334155] p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-white">{t.vehiclePlate}</span>
                <TrackingStatusBadge status={t.status} />
              </div>
              <span className="text-xs text-slate-400">ETA: <span className="text-white font-medium">{t.eta}</span></span>
            </div>

            <p className="text-sm text-slate-400 mb-1">
              Autista: <span className="text-slate-300">{t.driver}</span>
            </p>

            <p className="text-sm text-slate-400 mb-1">
              <span className="text-slate-300">{t.origin}</span>
              <span className="text-slate-500 mx-1">&rarr;</span>
              <span className="text-slate-300">{t.destination}</span>
            </p>

            <p className="text-sm text-slate-400 mb-3">
              Posizione: <span className="text-white font-medium">{t.currentLocation}</span>
            </p>

            <ProgressBar percent={t.progressPercent} status={t.status} />
            <p className="text-xs text-slate-500 mt-1 text-right">{t.progressPercent}%</p>
          </div>
        ))}
      </div>
    </div>
  )
}
