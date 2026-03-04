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
      <h1 className="text-2xl font-bold text-white mb-3">API Key</h1>

      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-3">
        <label className="block text-sm font-medium text-gray-400 mb-2">
          La tua API Key
        </label>
        <div className="bg-gray-800 rounded-xl px-4 py-3 font-mono text-sm text-gray-300 mb-4">
          {MASKED_KEY}
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 px-4 py-2 border border-gray-700 rounded-xl text-sm font-medium text-gray-300 hover:bg-gray-800 transition-colors"
          >
            <Copy size={16} />
            {copied ? 'Copiata!' : 'Copia'}
          </button>
          <button
            onClick={handleRegenerate}
            className="flex items-center gap-2 px-4 py-2 border border-gray-700 rounded-xl text-sm font-medium text-gray-300 hover:bg-gray-800 transition-colors"
          >
            <RefreshCw size={16} />
            Rigenera
          </button>
        </div>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-white mb-2">Documentazione API</h2>
        <p className="text-sm text-gray-400 mb-3">
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
