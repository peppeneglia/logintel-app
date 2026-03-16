import { mockCustomerNotifications } from '../../../data/mockDeliveryData'
import { useUnavailable } from '../../../hooks/useUnavailable'
import { UnavailableToast } from '../../../components/UnavailableToast'

function TypeBadge({ type }: { type: string }) {
  const config: Record<string, { label: string; style: string }> = {
    eta_update: { label: 'Aggiornamento ETA', style: 'bg-amber-500/10 text-amber-400' },
    delay_alert: { label: 'Allarme ritardo', style: 'bg-red-500/10 text-red-400' },
    delivered: { label: 'Consegnato', style: 'bg-emerald-500/10 text-emerald-400' },
    departure: { label: 'Partenza', style: 'bg-primary-500/10 text-primary-400' },
  }

  const { label, style } = config[type] ?? { label: type, style: 'bg-slate-500/10 text-slate-400' }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${style}`}>
      {label}
    </span>
  )
}

function ChannelBadge({ channel }: { channel: string }) {
  const config: Record<string, { label: string; style: string }> = {
    email: { label: 'Email', style: 'bg-blue-500/10 text-blue-400' },
    sms: { label: 'SMS', style: 'bg-purple-500/10 text-purple-400' },
    webhook: { label: 'Webhook', style: 'bg-slate-500/10 text-slate-400' },
  }

  const { label, style } = config[channel] ?? { label: channel, style: 'bg-slate-500/10 text-slate-400' }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${style}`}>
      {label}
    </span>
  )
}

export function CustomerNotifications() {
  const { isDemo, show, guard: _guard, close } = useUnavailable()

  const data = isDemo ? mockCustomerNotifications : []

  return (
    <div>
      <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-400 to-cyan-500 bg-clip-text text-transparent mb-3">Notifiche Clienti</h1>

      <div className="bg-[#1e293b] rounded-2xl border border-[#334155] p-6">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#334155]">
                <th className="text-left py-3 px-3 font-medium text-slate-400">Cliente</th>
                <th className="text-left py-3 px-3 font-medium text-slate-400">Tipo</th>
                <th className="text-left py-3 px-3 font-medium text-slate-400">Messaggio</th>
                <th className="text-left py-3 px-3 font-medium text-slate-400">Inviata il</th>
                <th className="text-left py-3 px-3 font-medium text-slate-400">Canale</th>
              </tr>
            </thead>
            <tbody>
              {data.length === 0 ? (
                <tr><td colSpan={5} className="py-6 px-3 text-center text-slate-500">Nessun dato disponibile.</td></tr>
              ) : data.map((n) => (
                <tr key={n.id} className="border-b border-[#334155]">
                  <td className="py-3 px-3 text-white font-medium">{n.client}</td>
                  <td className="py-3 px-3"><TypeBadge type={n.type} /></td>
                  <td className="py-3 px-3 text-slate-300 max-w-xs truncate" title={n.message}>
                    {n.message}
                  </td>
                  <td className="py-3 px-3 text-slate-400">{n.sentAt}</td>
                  <td className="py-3 px-3"><ChannelBadge channel={n.channel} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <UnavailableToast show={show} onClose={close} />
    </div>
  )
}
