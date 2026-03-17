import { AlertTriangle, Zap, ArrowUpCircle, Clock } from 'lucide-react'

interface CreditConfirmModalProps {
  open: boolean
  creditsRemaining: number
  dailyLimit: number
  extraCredits: number
  cost: number
  onConfirm: () => void
  onCancel: () => void
  onUpgrade?: () => void
  onBuyExtra?: () => void
}

export function CreditConfirmModal({
  open,
  creditsRemaining,
  dailyLimit,
  extraCredits,
  cost,
  onConfirm,
  onCancel,
  onUpgrade,
  onBuyExtra,
}: CreditConfirmModalProps) {
  if (!open) return null

  const totalAvailable = creditsRemaining + extraCredits
  const canAfford = totalAvailable >= cost
  const pct = dailyLimit > 0 ? (creditsRemaining / dailyLimit) * 100 : 0

  function barColor(): string {
    if (pct > 50) return 'bg-emerald-500'
    if (pct > 20) return 'bg-amber-500'
    return 'bg-red-500'
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onCancel} />

      <div className="relative bg-[#1e293b] border border-[#334155] rounded-2xl shadow-2xl p-6 w-full max-w-md mx-4">
        {canAfford ? (
          <>
            {/* Can afford — confirmation */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 flex items-center justify-center">
                <Zap size={20} className="text-emerald-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Conferma azione</h3>
                <p className="text-sm text-slate-400">Questa azione consuma crediti</p>
              </div>
            </div>

            {/* Balance bar */}
            <div className="bg-[#0f172a] rounded-xl p-4 mb-4">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-slate-400">Saldo attuale</span>
                <span className="font-semibold text-white">{totalAvailable.toLocaleString('it-IT')} crediti</span>
              </div>
              <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden mb-2">
                <div className={`h-full rounded-full ${barColor()}`} style={{ width: `${pct}%` }} />
              </div>
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>{creditsRemaining.toLocaleString('it-IT')} giornalieri + {extraCredits.toLocaleString('it-IT')} extra</span>
                <span>Limite: {dailyLimit.toLocaleString('it-IT')}/giorno</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={onCancel}
                className="px-4 py-2 rounded-xl border border-slate-600 text-slate-300 text-sm font-medium hover:bg-[#334155] transition-colors"
              >
                Annulla
              </button>
              <button
                onClick={onConfirm}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-700 text-white text-sm font-medium hover:from-emerald-600 hover:to-emerald-800 transition-colors"
              >
                Conferma
              </button>
            </div>
          </>
        ) : (
          <>
            {/* Cannot afford — options */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-red-500/15 flex items-center justify-center">
                <AlertTriangle size={20} className="text-red-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Crediti insufficienti</h3>
                <p className="text-sm text-slate-400">
                  Servono {cost.toLocaleString('it-IT')} crediti — ne hai {totalAvailable.toLocaleString('it-IT')}
                </p>
              </div>
            </div>

            <div className="space-y-2 mb-4">
              {onBuyExtra && (
                <button
                  onClick={onBuyExtra}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-[#334155] text-left hover:bg-[#334155] transition-colors"
                >
                  <Zap size={18} className="text-cyan-400 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-white">Acquista crediti extra</p>
                    <p className="text-xs text-slate-400">A partire da €20 per 1.000 crediti</p>
                  </div>
                </button>
              )}
              {onUpgrade && (
                <button
                  onClick={onUpgrade}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-[#334155] text-left hover:bg-[#334155] transition-colors"
                >
                  <ArrowUpCircle size={18} className="text-emerald-400 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-white">Upgrade piano</p>
                    <p className="text-xs text-slate-400">Pro: 5.000 crediti/giorno a €49/mese</p>
                  </div>
                </button>
              )}
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-[#334155]">
                <Clock size={18} className="text-slate-500 shrink-0" />
                <div>
                  <p className="text-sm text-slate-400">Aspetta il rinnovo</p>
                  <p className="text-xs text-slate-500">I crediti si rinnovano automaticamente a mezzanotte</p>
                </div>
              </div>
            </div>

            <button
              onClick={onCancel}
              className="w-full px-4 py-2 rounded-xl border border-slate-600 text-slate-300 text-sm font-medium hover:bg-[#334155] transition-colors"
            >
              Chiudi
            </button>
          </>
        )}
      </div>
    </div>
  )
}
