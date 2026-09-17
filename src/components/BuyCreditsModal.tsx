import { useState } from 'react'
import { Modal } from './Modal'
import { CreditCard, Loader2, Sparkles, Zap } from 'lucide-react'
import { useAuthStore } from '../stores/authStore'

interface BuyCreditsModalProps {
  open: boolean
  onClose: () => void
}

type Step = 'select' | 'payment' | 'confirmation'

interface CreditPackage {
  credits: number
  price: number
  label: string
  badge?: string
}

const PACKAGES: CreditPackage[] = [
  { credits: 1000, price: 20, label: '1.000 crediti', badge: 'Minimo' },
  { credits: 2500, price: 50, label: '2.500 crediti' },
  { credits: 5000, price: 100, label: '5.000 crediti', badge: 'Più conveniente' },
]

function formatEur(amount: number): string {
  return amount.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export function BuyCreditsModal({ open, onClose }: BuyCreditsModalProps) {
  const { updateProfile, profile } = useAuthStore()

  const [step, setStep] = useState<Step>('select')
  const [selectedPkg, setSelectedPkg] = useState<CreditPackage>(PACKAGES[0])
  const [paying, setPaying] = useState(false)

  // Payment form fields (mock)
  const [cardName, setCardName] = useState('')
  const [cardNumber, setCardNumber] = useState('')
  const [cardExpiry, setCardExpiry] = useState('')
  const [cardCvv, setCardCvv] = useState('')
  const [termsAccepted, setTermsAccepted] = useState(false)

  function reset() {
    setStep('select')
    setSelectedPkg(PACKAGES[0])
    setPaying(false)
    setCardName('')
    setCardNumber('')
    setCardExpiry('')
    setCardCvv('')
    setTermsAccepted(false)
  }

  function handleClose() {
    reset()
    onClose()
  }

  function isFormValid(): boolean {
    return cardName.trim() !== '' && cardNumber.trim() !== '' && cardExpiry.trim() !== '' && cardCvv.trim() !== '' && termsAccepted
  }

  async function handlePay() {
    setPaying(true)
    await new Promise((r) => setTimeout(r, 2000))
    setPaying(false)

    const currentExtra = (profile as Record<string, unknown>)?.extra_credits as number ?? 0
    const expireAt = new Date()
    expireAt.setDate(expireAt.getDate() + 30)

    await updateProfile({
      extra_credits: currentExtra + selectedPkg.credits,
      extra_credits_expire_at: expireAt.toISOString(),
    })

    setStep('confirmation')
  }

  const stepTitle =
    step === 'select'
      ? 'Acquista crediti aggiuntivi'
      : step === 'payment'
        ? 'Completa l\'acquisto'
        : 'Acquisto completato'

  return (
    <Modal open={open} onClose={handleClose} title={stepTitle} width="max-w-lg">
      {/* ── Step 1: Package Selection ── */}
      {step === 'select' && (
        <div>
          <div className="space-y-3 mb-4">
            {PACKAGES.map((pkg) => {
              const isSelected = pkg.credits === selectedPkg.credits
              return (
                <button
                  key={pkg.credits}
                  onClick={() => setSelectedPkg(pkg)}
                  className={`w-full flex items-center justify-between px-5 py-4 rounded-xl border transition-all text-left ${
                    isSelected
                      ? 'border-emerald-500 bg-emerald-500/5'
                      : 'border-[#334155] bg-[#0f172a] hover:bg-[#1e293b]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${isSelected ? 'border-emerald-500' : 'border-slate-500'}`}>
                      {isSelected && <div className="w-2 h-2 rounded-full bg-emerald-500" />}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{pkg.label}</p>
                      {pkg.badge && (
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                          {pkg.badge}
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="text-lg font-bold text-white">€{formatEur(pkg.price)}</span>
                </button>
              )
            })}
          </div>

          <div className="bg-[#0f172a] rounded-xl p-4 mb-4 space-y-2">
            <div className="flex items-start gap-2">
              <Zap size={14} className="text-slate-400 mt-0.5 shrink-0" />
              <p className="text-xs text-slate-400">
                I crediti extra hanno validità 30 giorni e non si rinnovano automaticamente.
              </p>
            </div>
            <div className="flex items-start gap-2">
              <Zap size={14} className="text-cyan-400 mt-0.5 shrink-0" />
              <p className="text-xs text-cyan-400">
                Con 5.000 crediti extra spendi quanto 2 mesi di Pro. Valuta l'upgrade per un risparmio continuativo.
              </p>
            </div>
          </div>

          <button
            onClick={() => setStep('payment')}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-700 text-white text-sm font-medium hover:from-emerald-600 hover:to-emerald-800 transition-colors"
          >
            Acquista {selectedPkg.label} — €{formatEur(selectedPkg.price)}
          </button>
        </div>
      )}

      {/* ── Step 2: Mock Payment Form ── */}
      {step === 'payment' && (
        <div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Nome sulla carta</label>
              <input
                type="text"
                value={cardName}
                onChange={(e) => setCardName(e.target.value)}
                className="w-full px-4 py-2.5 bg-[#0f172a] border border-[#334155] rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500"
                placeholder="Mario Rossi"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Numero carta</label>
              <div className="relative">
                <input
                  type="text"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#0f172a] border border-[#334155] rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 pr-10"
                  placeholder="1234 5678 9012 3456"
                />
                <CreditCard size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500" />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Scadenza MM/AA</label>
                <input
                  type="text"
                  value={cardExpiry}
                  onChange={(e) => setCardExpiry(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#0f172a] border border-[#334155] rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500"
                  placeholder="12/27"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">CVV</label>
                <input
                  type="text"
                  value={cardCvv}
                  onChange={(e) => setCardCvv(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#0f172a] border border-[#334155] rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500"
                  placeholder="&bull;&bull;&bull;"
                />
              </div>
            </div>

            <label className="flex items-start gap-2 cursor-pointer mt-2">
              <input
                type="checkbox"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded border-slate-600 bg-[#0f172a] text-emerald-500 focus:ring-emerald-500/50"
              />
              <span className="text-xs text-slate-400">
                Accetto i Termini di Servizio e la Privacy Policy
              </span>
            </label>
          </div>

          <div className="flex items-center gap-3 mt-6">
            <button
              onClick={() => setStep('select')}
              className="px-4 py-2.5 rounded-xl border border-slate-600 text-slate-300 text-sm font-medium hover:bg-[#334155] transition-colors"
            >
              Indietro
            </button>
            <button
              disabled={!isFormValid() || paying}
              onClick={handlePay}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-700 text-white text-sm font-medium hover:from-emerald-600 hover:to-emerald-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {paying ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Elaborazione...
                </>
              ) : (
                `Paga €${formatEur(selectedPkg.price)}`
              )}
            </button>
          </div>
        </div>
      )}

      {/* ── Step 3: Confirmation ── */}
      {step === 'confirmation' && (
        <div className="text-center py-4">
          <div className="w-16 h-16 rounded-full bg-emerald-500/15 flex items-center justify-center mx-auto mb-4">
            <Sparkles size={32} className="text-emerald-400" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Acquisto confermato!</h3>
          <p className="text-sm text-slate-400 mb-6">
            Hai aggiunto {selectedPkg.label} al tuo account. I crediti extra sono disponibili per 30 giorni.
          </p>
          <button
            onClick={handleClose}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-700 text-white text-sm font-medium hover:from-emerald-600 hover:to-emerald-800 transition-colors"
          >
            Chiudi
          </button>
        </div>
      )}
    </Modal>
  )
}
