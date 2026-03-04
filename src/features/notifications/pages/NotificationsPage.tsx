import { useState } from 'react'
import { Wrench, ShieldCheck, Package, Monitor, CloudRain } from 'lucide-react'
import { mockNotifications } from '../../../data/mockNotifications'
import type { AppNotification } from '../../../data/mockNotifications'
// TODO: Riabilitare notifiche da Supabase quando configurato
// import { useAuthStore } from '../../../stores/authStore'
// import * as notificationsService from '../../../services/notifications'

type FilterTab = 'all' | 'unread' | 'high'

const typeIcons: Record<AppNotification['type'], typeof Wrench> = {
  maintenance: Wrench,
  compliance: ShieldCheck,
  delivery: Package,
  system: Monitor,
  weather: CloudRain,
}

const priorityColors: Record<AppNotification['priority'], string> = {
  low: 'bg-slate-400',
  medium: 'bg-amber-400',
  high: 'bg-red-400',
}

function formatRelativeTime(timestamp: string): string {
  const now = new Date()
  const date = new Date(timestamp)
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 1) return 'Adesso'
  if (diffMins < 60) return `${diffMins} min fa`
  if (diffHours < 24) return `${diffHours} ore fa`
  if (diffDays === 1) return 'Ieri'
  return `${diffDays} giorni fa`
}

export function NotificationsPage() {
  // TODO: Ripristinare caricamento notifiche da Supabase
  // const { user } = useAuthStore()
  const [filter, setFilter] = useState<FilterTab>('all')
  const [notifications, setNotifications] = useState<AppNotification[]>(mockNotifications)

  // TODO: Riabilitare useEffect per caricare notifiche da Supabase
  // useEffect(() => {
  //   if (!user) return
  //   notificationsService.getNotifications(user.id).then((data) => { ... })
  // }, [user])

  const handleMarkAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    )
    // TODO: Salvare su Supabase con notificationsService.markAsRead(id)
  }

  const filteredNotifications = notifications.filter((n) => {
    if (filter === 'unread') return !n.read
    if (filter === 'high') return n.priority === 'high'
    return true
  })

  const tabs: { key: FilterTab; label: string; count: number }[] = [
    { key: 'all', label: 'Tutte', count: notifications.length },
    { key: 'unread', label: 'Non lette', count: notifications.filter((n) => !n.read).length },
    { key: 'high', label: 'Alta priorita', count: notifications.filter((n) => n.priority === 'high').length },
  ]

  return (
    <>
      <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-400 to-cyan-500 bg-clip-text text-transparent mb-3">Notifiche</h1>

      {/* Filter tabs */}
      <div className="flex items-center gap-2 mb-3">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              filter === tab.key
                ? 'bg-primary-500/15 text-primary-400'
                : 'bg-[#1e293b] text-slate-400 hover:bg-[#334155] hover:text-slate-200'
            }`}
          >
            {tab.label}
            <span className={`ml-1.5 text-xs ${filter === tab.key ? 'text-primary-400/70' : 'text-slate-500'}`}>
              ({tab.count})
            </span>
          </button>
        ))}
      </div>

      {/* Notification list */}
      <div className="space-y-3">
        {filteredNotifications.length === 0 ? (
          <div className="bg-[#1e293b] rounded-2xl border border-[#334155] p-12 text-center">
            <p className="text-slate-500">Nessuna notifica trovata.</p>
          </div>
        ) : (
          filteredNotifications.map((notif) => {
            const Icon = typeIcons[notif.type]
            return (
              <div
                key={notif.id}
                className={`rounded-2xl border p-5 transition-colors ${
                  notif.read
                    ? 'bg-[#1e293b]/50 border-[#334155]'
                    : 'bg-[#1e293b] border-primary-500/30'
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className="shrink-0 mt-0.5 p-2 bg-[#334155] rounded-xl">
                    <Icon size={18} className="text-slate-300" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {/* Priority dot */}
                      <span className={`w-2 h-2 rounded-full shrink-0 ${priorityColors[notif.priority]}`} />
                      <h3 className={`text-sm leading-tight truncate ${notif.read ? 'text-slate-300 font-medium' : 'text-white font-semibold'}`}>
                        {notif.title}
                      </h3>
                    </div>
                    <p className="text-sm text-slate-400 mb-2 leading-relaxed">{notif.message}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-500">{formatRelativeTime(notif.timestamp)}</span>
                      {!notif.read && (
                        <button
                          onClick={() => handleMarkAsRead(notif.id)}
                          className="text-xs text-primary-400 hover:text-primary-300 font-medium transition-colors"
                        >
                          Segna come letta
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </>
  )
}
