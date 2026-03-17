import { useState, useEffect, useCallback } from 'react'
import { Bell } from 'lucide-react'
import { mockCustomerNotifications } from '../../../data/mockDeliveryData'
import { useAuthStore } from '../../../stores/authStore'
import { getDeliveries } from '../../../services/delivery'
import type { DeliveryRow } from '../../../services/delivery'

// ── Badge configs ──

const typeConfig: Record<string, { label: string; style: string }> = {
  eta_update: { label: 'Aggiornamento ETA', style: 'bg-amber-500/10 text-amber-400' },
  delay_alert: { label: 'Allarme ritardo', style: 'bg-red-500/10 text-red-400' },
  delivered: { label: 'Consegnato', style: 'bg-emerald-500/10 text-emerald-400' },
  departure: { label: 'Partenza', style: 'bg-primary-500/10 text-primary-400' },
}

const channelConfig: Record<string, { label: string; style: string }> = {
  email: { label: 'Email', style: 'bg-blue-500/10 text-blue-400' },
  sms: { label: 'SMS', style: 'bg-purple-500/10 text-purple-400' },
  webhook: { label: 'Webhook', style: 'bg-slate-500/10 text-slate-400' },
}

function TypeBadge({ type }: { type: string }) {
  const { label, style } = typeConfig[type] ?? { label: type, style: 'bg-slate-500/10 text-slate-400' }
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${style}`}>
      {label}
    </span>
  )
}

function ChannelBadge({ channel }: { channel: string }) {
  const { label, style } = channelConfig[channel] ?? { label: channel, style: 'bg-slate-500/10 text-slate-400' }
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${style}`}>
      {label}
    </span>
  )
}

// ── Display type ──

interface DisplayNotification {
  id: string
  client: string
  type: string
  message: string
  sentAt: string
  channel: string
}

function deliveryToNotifications(d: DeliveryRow): DisplayNotification[] {
  const notifications: DisplayNotification[] = []
  if (d.status === 'delivered' || d.status === 'in_transit' || d.status === 'pending') {
    notifications.push({
      id: `${d.id}-status`,
      client: d.customer,
      type: d.status === 'delivered' ? 'delivered' : 'departure',
      message: d.status === 'delivered'
        ? `Consegna completata per ${d.customer}: ${d.origin} → ${d.destination}`
        : `Consegna in corso per ${d.customer}: ${d.origin} → ${d.destination}`,
      sentAt: d.actual_delivery_date ?? d.departure_date,
      channel: 'email',
    })
  }
  return notifications
}

// ── Main component ──

export function CustomerNotifications() {
  const isDemo = useAuthStore((s) => s.isDemo)
  const userId = useAuthStore((s) => s.user?.id)

  const [supabaseNotifications, setSupabaseNotifications] = useState<DisplayNotification[]>([])
  const [loading, setLoading] = useState(false)

  const fetchData = useCallback(async () => {
    if (isDemo || !userId) return
    setLoading(true)
    try {
      const rows = await getDeliveries(userId)
      const derived = rows.flatMap(deliveryToNotifications)
      setSupabaseNotifications(derived)
    } finally {
      setLoading(false)
    }
  }, [isDemo, userId])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const notifications: DisplayNotification[] = isDemo
    ? mockCustomerNotifications
    : supabaseNotifications

  return (
    <div>
      <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-400 to-cyan-500 bg-clip-text text-transparent mb-3">
        Notifiche Clienti
      </h1>

      <div className="bg-[#1e293b] rounded-2xl border border-[#334155] p-6">
        {loading ? (
          <p className="text-sm text-slate-500 py-8 text-center">Caricamento...</p>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-14 h-14 rounded-2xl bg-slate-800 flex items-center justify-center mb-4">
              <Bell size={28} className="text-slate-600" />
            </div>
            <p className="text-white font-semibold mb-1">Nessuna notifica</p>
            <p className="text-sm text-slate-500 max-w-xs">
              Le notifiche verranno generate automaticamente dai cambi di stato delle consegne.
            </p>
          </div>
        ) : (
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
                {notifications.map((n) => (
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
        )}
      </div>
    </div>
  )
}
