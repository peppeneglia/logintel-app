import { useState } from 'react'
import { Copy, RefreshCw } from 'lucide-react'

const MASKED_KEY = 'sk-log-xxxx-xxxx-xxxx-xxxx-a8f2'

export function ApiKey() {
  const [copied, setCopied] = useState(false)

  function handleCopy() {
    navigator.clipboard.writeText(MASKED_KEY)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function handleRegenerate() {
    if (window.confirm('Sei sicuro di voler rigenerare la API Key? La chiave attuale smetterà di funzionare.')) {
      alert('API Key rigenerata con successo.')
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-400 to-cyan-500 bg-clip-text text-transparent mb-3">API Key</h1>

      <div className="bg-[#1e293b] border border-[#334155] rounded-2xl p-6 mb-3">
        <label className="block text-sm font-medium text-slate-400 mb-2">
          La tua API Key
        </label>
        <div className="bg-[#334155] rounded-xl px-4 py-3 font-mono text-sm text-slate-300 mb-4">
          {MASKED_KEY}
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 px-4 py-2 border border-slate-600 rounded-xl text-sm font-medium text-slate-300 hover:bg-[#334155] transition-colors"
          >
            <Copy size={16} />
            {copied ? 'Copiata!' : 'Copia'}
          </button>
          <button
            onClick={handleRegenerate}
            className="flex items-center gap-2 px-4 py-2 border border-slate-600 rounded-xl text-sm font-medium text-slate-300 hover:bg-[#334155] transition-colors"
          >
            <RefreshCw size={16} />
            Rigenera
          </button>
        </div>
      </div>

      <div className="bg-[#1e293b] border border-[#334155] rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-white mb-2">Documentazione API</h2>
        <p className="text-sm text-slate-400 mb-3">
          Consulta la documentazione per integrare Logintel nei tuoi sistemi.
        </p>
        <a
          href="#"
          className="text-sm text-primary-400 hover:underline font-medium"
        >
          Vai alla documentazione
        </a>
      </div>
    </div>
  )
}
