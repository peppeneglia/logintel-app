import { useState } from 'react'
import { Truck, Package, Shield, Wallet, Leaf, Construction } from 'lucide-react'
import { comingSoonModules } from '../data/mockData'

const iconMap: Record<string, typeof Truck> = {
  Truck,
  Package,
  Shield,
  Wallet,
  Leaf,
}

interface ComingSoonPageProps {
  moduleKey: string
}

export function ComingSoonPage({ moduleKey }: ComingSoonPageProps) {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const mod = comingSoonModules[moduleKey]

  if (!mod) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-slate-500">Modulo non trovato</p>
      </div>
    )
  }

  const IconComponent = iconMap[mod.icon] || Construction

  function handleSubmit() {
    if (email.trim()) {
      setSubmitted(true)
    }
  }

  return (
    <div className="flex-1 flex items-center justify-center px-6">
      <div className="max-w-md text-center">
        <div className="w-20 h-20 rounded-2xl bg-[#334155] flex items-center justify-center mx-auto mb-3">
          <IconComponent size={36} className="text-slate-500" />
        </div>

        <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-400 to-cyan-500 bg-clip-text text-transparent mb-2">
          {mod.title} — Coming Soon
        </h1>

        <p className="text-slate-400 text-sm leading-relaxed mb-4">
          {mod.description}
        </p>

        <span className="inline-block px-3 py-1 bg-primary-500/10 text-primary-400 rounded-full text-xs font-semibold mb-8">
          In sviluppo — {mod.quarter}
        </span>

        {submitted ? (
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4">
            <p className="text-sm text-emerald-400 font-medium">
              Ti avviseremo quando {mod.title} sarà disponibile.
            </p>
          </div>
        ) : (
          <div>
            <p className="text-sm text-slate-500 mb-3">
              Vuoi essere avvisato quando sarà disponibile?
            </p>
            <div className="flex gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="La tua email"
                className="flex-1 bg-[#334155] border border-slate-600 rounded-xl px-3 py-2 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500"
              />
              <button
                onClick={handleSubmit}
                className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-700 text-white rounded-xl text-sm font-medium hover:from-emerald-600 hover:to-emerald-800 transition-colors"
              >
                Avvisami
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
