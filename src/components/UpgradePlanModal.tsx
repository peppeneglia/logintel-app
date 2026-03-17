import { useState } from 'react'
import { Modal } from './Modal'
import { Check, CreditCard, Loader2, Sparkles } from 'lucide-react'
import { useAuthStore } from '../stores/authStore'
import { PLAN_DAILY_LIMITS } from '../lib/creditCosts'

interface UpgradePlanModalProps {
  open: boolean
  onClose: () => void
}

type PlanKey = 'free' | 'pro' | 'team'
type BillingCycle = 'monthly' | 'annual'
type Step = 'select' | 'payment' | 'confirmation'

interface PlanOption {
  key: PlanKey
  name: string
  monthlyPrice: number
  credits: string
  features: string[]
  badge?: string
  perUser?: boolean
  minUsers?: number
}

const PLANS: PlanOption[] = [
  {
    key: 'free',
    name: 'Free',
    monthlyPrice: 0,
    credits: '500 crediti/giorno',
    features: ['Route Intelligence base', '1 utente', 'Supporto community'],
  },
  {
    key: 'pro',
    name: 'Pro',
    monthlyPrice: 49,
    credits: '5.000 crediti/giorno',
    features: ['Tutti i moduli Intelligence', '1 utente', 'Supporto prioritario', 'Export CSV/PDF'],
    badge: 'Più popolare',
  },
  {
    key: 'team',
    name: 'Team',
    monthlyPrice: 39,
    credits: '10.000 crediti/giorno',
    features: ['Tutti i moduli Intelligence', 'Min 3 utenti', 'Supporto dedicato', 'API access', 'SSO'],
    perUser: true,
    minUsers: 3,
  },
]

function formatEur(amount: number): string {
  return amount.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export function UpgradePlanModal({ open, onClose }: UpgradePlanModalProps) {
  const { profile, updateProfile } = useAuthStore()
  const currentPlan = (profile?.plan || 'free') as PlanKey

  const [step, setStep] = useState<Step>('select')
  const [selectedPlan, setSelectedPlan] = useState<PlanKey>('pro')
  const [billing, setBilling] = useState<BillingCycle>('monthly')
  const [paying, setPaying] = useState(false)

  // Payment form fields (mock)
  const [cardName, setCardName] = useState('')
  const [cardNumber, setCardNumber] = useState('')
  const [cardExpiry, setCardExpiry] = useState('')
  const [cardCvv, setCardCvv] = useState('')
  const [termsAccepted, setTermsAccepted] = useState(false)

  function reset() {
    setStep('select')
    setSelectedPlan('pro')
    setBilling('monthly')
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

  function getPrice(plan: PlanOption): number {
    if (plan.monthlyPrice === 0) return 0
    if (billing === 'annual') return plan.monthlyPrice * 10
    return plan.monthlyPrice * (plan.perUser && plan.minUsers ? plan.minUsers : 1)
  }

  function getMonthlyDisplay(plan: PlanOption): string {
    if (plan.monthlyPrice === 0) return 'Gratuito'
    const suffix = plan.perUser ? '/utente/mese' : '/mese'
    return `€${plan.monthlyPrice}${suffix}`
  }

  function getAnnualSavings(plan: PlanOption): number {
    if (plan.monthlyPrice === 0) return 0
    const base = plan.perUser && plan.minUsers ? plan.minUsers : 1
    return plan.monthlyPrice * 2 * base
  }

  function getTotalLabel(): string {
    const plan = PLANS.find((p) => p.key === selectedPlan)!
    const price = getPrice(plan)
    if (billing === 'annual') {
      return `Paga €${formatEur(price)}/anno`
    }
    return `Paga €${formatEur(price)}`
  }

  function isFormValid(): boolean {
    return cardName.trim() !== '' && cardNumber.trim() !== '' && cardExpiry.trim() !== '' && cardCvv.trim() !== '' && termsAccepted
  }

  async function handlePay() {
    setPaying(true)
    await new Promise((r) => setTimeout(r, 2000))
    setPaying(false)

    const newLimit = PLAN_DAILY_LIMITS[selectedPlan] ?? 500
    await updateProfile({
      plan: selectedPlan,
      credits_daily_limit: newLimit,
      credits_remaining: newLimit,
    })

    setStep('confirmation')
  }

  const stepTitle =
    step === 'select'
      ? 'Scegli il tuo piano'
      : step === 'payment'
        ? `Completa il tuo upgrade a ${PLANS.find((p) => p.key === selectedPlan)?.name}`
        : 'Upgrade completato'

  return (
    <Modal open={open} onClose={handleClose} title={stepTitle} width="max-w-3xl">
      {/* ── Step 1: Plan Selection ── */}
      {step === 'select' && (
        <div>
          {/* Billing toggle */}
          <div className="flex items-center justify-center gap-3 mb-6">
            <span className={`text-sm font-medium ${billing === 'monthly' ? 'text-white' : 'text-slate-400'}`}>
              Mensile
            </span>
            <button
              onClick={() => setBilling(billing === 'monthly' ? 'annual' : 'monthly')}
              className={`relative w-12 h-6 rounded-full transition-colors ${billing === 'annual' ? 'bg-emerald-500' : 'bg-slate-600'}`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${billing === 'annual' ? 'translate-x-6' : ''}`}
              />
            </button>
            <span className={`text-sm font-medium ${billing === 'annual' ? 'text-white' : 'text-slate-400'}`}>
              Annuale
            </span>
            {billing === 'annual' && (
              <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                -2 mesi
              </span>
            )}
          </div>

          {/* Plan cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            {PLANS.map((plan) => {
              const isCurrent = plan.key === currentPlan
              const isSelected = plan.key === selectedPlan
              return (
                <div
                  key={plan.key}
                  className={`relative rounded-xl border p-5 transition-all ${
                    isSelected && !isCurrent
                      ? 'border-emerald-500 bg-emerald-500/5'
                      : 'border-[#334155] bg-[#0f172a]'
                  }`}
                >
                  {plan.badge && (
                    <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-[10px] font-bold uppercase tracking-wider bg-gradient-to-r from-emerald-500 to-cyan-500 text-white px-3 py-0.5 rounded-full">
                      {plan.badge}
                    </span>
                  )}
                  {isCurrent && (
                    <span className="absolute -top-2.5 right-3 text-[10px] font-bold uppercase tracking-wider bg-slate-600 text-white px-3 py-0.5 rounded-full">
                      Piano attuale
                    </span>
                  )}

                  <h3 className="text-lg font-bold text-white mt-1">{plan.name}</h3>
                  <p className="text-2xl font-bold text-white mt-2">
                    {getMonthlyDisplay(plan)}
                  </p>
                  {billing === 'annual' && plan.monthlyPrice > 0 && (
                    <p className="text-xs text-emerald-400 mt-1">
                      Risparmi €{formatEur(getAnnualSavings(plan))}
                    </p>
                  )}
                  <p className="text-sm text-slate-400 mt-2">{plan.credits}</p>

                  <ul className="mt-4 space-y-2">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-sm text-slate-300">
                        <Check size={14} className="text-emerald-400 shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>

                  {isCurrent ? (
                    <div className="mt-5 w-full py-2 rounded-xl border border-slate-600 text-center text-sm font-medium text-slate-400">
                      Piano attuale
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setSelectedPlan(plan.key)
                        setStep('payment')
                      }}
                      className="mt-5 w-full py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-700 text-white text-sm font-medium hover:from-emerald-600 hover:to-emerald-800 transition-colors"
                    >
                      Scegli {plan.name}
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── Step 2: Mock Payment Form ── */}
      {step === 'payment' && (
        <div className="max-w-md mx-auto">
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
            <div className="grid grid-cols-2 gap-4">
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
                getTotalLabel()
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
          <h3 className="text-xl font-bold text-white mb-2">Pagamento confermato!</h3>
          <p className="text-sm text-slate-400 mb-6">
            Il tuo piano è stato aggiornato a {PLANS.find((p) => p.key === selectedPlan)?.name}.
            I tuoi nuovi crediti sono disponibili.
          </p>
          <button
            onClick={handleClose}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-700 text-white text-sm font-medium hover:from-emerald-600 hover:to-emerald-800 transition-colors"
          >
            Inizia a usare Logintel {PLANS.find((p) => p.key === selectedPlan)?.name}
          </button>
        </div>
      )}
    </Modal>
  )
}
