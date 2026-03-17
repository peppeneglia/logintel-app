import { useState, useEffect } from 'react'
import { useAuthStore } from '../../../stores/authStore'
import { supabase } from '../../../lib/supabase'
import { UpgradePlanModal } from '../../../components/UpgradePlanModal'

const planNames: Record<string, string> = {
  free: 'Free',
  pro: 'Pro',
  team: 'Team',
  enterprise: 'Enterprise',
}

const planPrices: Record<string, string> = {
  free: 'Gratuito',
  pro: '€49,00/mese',
  team: '€39,00/utente/mese',
  enterprise: 'Su misura',
}

interface MockTransaction {
  id: string
  date: string
  type: 'PLAN_UPGRADE' | 'EXTRA_PURCHASE'
  description: string
  amount: string
}

const mockTransactions: MockTransaction[] = [
  { id: 'TXN-003', date: '15/03/2026', type: 'EXTRA_PURCHASE', description: 'Acquisto 2.500 crediti extra', amount: '€50,00' },
  { id: 'TXN-002', date: '01/02/2026', type: 'PLAN_UPGRADE', description: 'Rinnovo piano Pro — Marzo 2026', amount: '€49,00' },
  { id: 'TXN-001', date: '01/01/2026', type: 'PLAN_UPGRADE', description: 'Upgrade a piano Pro', amount: '€49,00' },
]

function getNextRenewalDate(): string {
  const now = new Date()
  const next = new Date(now.getFullYear(), now.getMonth() + 1, 1)
  return next.toLocaleDateString('it-IT', { day: '2-digit', month: 'long', year: 'numeric' })
}

function transactionTypeBadge(type: MockTransaction['type']): { label: string; cls: string } {
  if (type === 'PLAN_UPGRADE') {
    return { label: 'Piano', cls: 'bg-emerald-500/10 text-emerald-400' }
  }
  return { label: 'Crediti extra', cls: 'bg-cyan-500/10 text-cyan-400' }
}

interface CreditTransaction {
  id: string
  amount: number
  action_type: string
  balance_after: number
  created_at: string
}

const ACTION_LABELS: Record<string, string> = {
  PLAN_UPGRADE_PRO: 'Upgrade a piano Pro',
  PLAN_UPGRADE_TEAM: 'Upgrade a piano Team',
  EXTRA_PURCHASE: 'Acquisto crediti extra',
  DAILY_RESET: 'Rinnovo crediti giornalieri',
}

const ACTION_AMOUNTS: Record<string, string> = {
  PLAN_UPGRADE_PRO: '€49,00',
  PLAN_UPGRADE_TEAM: '€117,00',
  EXTRA_PURCHASE: '—',
}

export function Billing() {
  const { isDemo, profile, user } = useAuthStore()
  const plan = profile?.plan || 'free'

  const [upgradeOpen, setUpgradeOpen] = useState(false)
  const [realTransactions, setRealTransactions] = useState<CreditTransaction[]>([])

  useEffect(() => {
    if (isDemo || !user?.id) return
    supabase
      .from('credit_transactions')
      .select('*')
      .eq('user_id', user.id)
      .in('action_type', ['PLAN_UPGRADE_PRO', 'PLAN_UPGRADE_TEAM', 'EXTRA_PURCHASE', 'DAILY_RESET'])
      .order('created_at', { ascending: false })
      .limit(10)
      .then(({ data }) => {
        if (data) setRealTransactions(data as CreditTransaction[])
      })
  }, [isDemo, user?.id])

  return (
    <div>
      <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-400 to-cyan-500 bg-clip-text text-transparent mb-3">Fatturazione</h1>

      {/* Current plan card */}
      <div className="bg-[#1e293b] border border-[#334155] rounded-2xl p-6 mb-3">
        <h2 className="text-lg font-semibold text-white mb-3">Piano attuale</h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white font-semibold">{planNames[plan] || plan}</p>
            <p className="text-sm text-slate-400">{planPrices[plan] || 'Gratuito'}</p>
            {plan !== 'free' && (
              <p className="text-xs text-slate-500 mt-1">
                Prossimo rinnovo: {getNextRenewalDate()}
              </p>
            )}
          </div>
          <button
            onClick={() => setUpgradeOpen(true)}
            className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-700 text-white rounded-xl text-sm font-medium hover:from-emerald-600 hover:to-emerald-800 transition-colors"
          >
            Cambia piano
          </button>
        </div>
      </div>

      {/* Payment method */}
      <div className="bg-[#1e293b] border border-[#334155] rounded-2xl p-6 mb-3">
        <h2 className="text-lg font-semibold text-white mb-3">Metodo di pagamento</h2>
        {isDemo ? (
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-300">
              Visa &bull;&bull;&bull;&bull; 4242 — Scade 12/2027
            </span>
            <button className="px-4 py-2 border border-slate-600 rounded-xl text-sm font-medium text-slate-300 hover:bg-[#334155] transition-colors">
              Modifica
            </button>
          </div>
        ) : (
          <p className="text-sm text-slate-500">Nessun metodo di pagamento configurato.</p>
        )}
      </div>

      {/* Recent transactions */}
      <div className="bg-[#1e293b] border border-[#334155] rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Transazioni recenti</h2>
        {isDemo ? (
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#334155]">
                <th className="text-left text-sm font-medium text-slate-400 pb-3">ID</th>
                <th className="text-left text-sm font-medium text-slate-400 pb-3">Data</th>
                <th className="text-left text-sm font-medium text-slate-400 pb-3">Tipo</th>
                <th className="text-left text-sm font-medium text-slate-400 pb-3">Descrizione</th>
                <th className="text-right text-sm font-medium text-slate-400 pb-3">Importo</th>
              </tr>
            </thead>
            <tbody>
              {mockTransactions.map((txn) => {
                const badge = transactionTypeBadge(txn.type)
                return (
                  <tr key={txn.id} className="border-b border-[#334155] last:border-0">
                    <td className="py-3 text-sm text-white font-medium">{txn.id}</td>
                    <td className="py-3 text-sm text-slate-400">{txn.date}</td>
                    <td className="py-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${badge.cls}`}>
                        {badge.label}
                      </span>
                    </td>
                    <td className="py-3 text-sm text-slate-300">{txn.description}</td>
                    <td className="py-3 text-sm text-white font-medium text-right">{txn.amount}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        ) : realTransactions.length > 0 ? (
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#334155]">
                <th className="text-left text-sm font-medium text-slate-400 pb-3">Data</th>
                <th className="text-left text-sm font-medium text-slate-400 pb-3">Descrizione</th>
                <th className="text-right text-sm font-medium text-slate-400 pb-3">Crediti</th>
                <th className="text-right text-sm font-medium text-slate-400 pb-3">Importo</th>
              </tr>
            </thead>
            <tbody>
              {realTransactions.map((txn) => (
                <tr key={txn.id} className="border-b border-[#334155] last:border-0">
                  <td className="py-3 text-sm text-slate-400">
                    {new Date(txn.created_at).toLocaleDateString('it-IT')}
                  </td>
                  <td className="py-3 text-sm text-slate-300">
                    {ACTION_LABELS[txn.action_type] || txn.action_type}
                  </td>
                  <td className="py-3 text-sm text-right font-medium">
                    <span className={txn.amount > 0 ? 'text-emerald-400' : 'text-slate-300'}>
                      {txn.amount > 0 ? '+' : ''}{txn.amount.toLocaleString('it-IT')}
                    </span>
                  </td>
                  <td className="py-3 text-sm text-white font-medium text-right">
                    {ACTION_AMOUNTS[txn.action_type] || '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-sm text-slate-500">Nessuna transazione.</p>
        )}
      </div>

      <UpgradePlanModal open={upgradeOpen} onClose={() => setUpgradeOpen(false)} />
    </div>
  )
}
