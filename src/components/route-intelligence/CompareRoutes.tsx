import React, { useState } from 'react'
import { mockRouteComparisons } from '../../data/mockData'
import { RiskBadge } from '../ui/RiskBadge'

function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return `${h}h ${m}min`
}

export function CompareRoutes() {
  const [origin, setOrigin] = useState('Bologna')
  const [destination, setDestination] = useState('Napoli')
  const [departureTime, setDepartureTime] = useState('')
  const [showResults, setShowResults] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setShowResults(true)
  }

  return (
    <div>
      <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-400 to-cyan-500 bg-clip-text text-transparent mb-3">Confronta Percorsi</h1>

      {/* Input */}
      <form onSubmit={handleSubmit} className="bg-[#1e293b] rounded-2xl border border-[#334155] p-6 mb-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Origine</label>
            <input
              type="text"
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              className="w-full px-3 py-2 bg-[#334155] border border-slate-600 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Destinazione</label>
            <input
              type="text"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="w-full px-3 py-2 bg-[#334155] border border-slate-600 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Data/ora partenza</label>
            <input
              type="datetime-local"
              value={departureTime}
              onChange={(e) => setDepartureTime(e.target.value)}
              className="w-full px-3 py-2 bg-[#334155] border border-slate-600 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500"
            />
          </div>
        </div>
        <button
          type="submit"
          className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-700 text-white font-medium rounded-xl hover:from-emerald-600 hover:to-emerald-800 transition-colors text-sm"
        >
          Confronta percorsi
        </button>
      </form>

      {/* Results */}
      {showResults && (
        <div className="card-accent bg-[#1e293b] rounded-2xl border border-[#334155] p-6">
          <h2 className="text-sm font-semibold text-slate-300 mb-4">
            {origin} &rarr; {destination} &mdash; Confronto percorsi
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#334155]">
                  <th className="text-left py-3 px-3 font-medium text-slate-400">Percorso</th>
                  <th className="text-left py-3 px-3 font-medium text-slate-400">Distanza</th>
                  <th className="text-left py-3 px-3 font-medium text-slate-400">Durata base</th>
                  <th className="text-left py-3 px-3 font-medium text-slate-400">Ritardo meteo</th>
                  <th className="text-left py-3 px-3 font-medium text-slate-400">Rischio</th>
                  <th className="text-left py-3 px-3 font-medium text-slate-400">ETA</th>
                </tr>
              </thead>
              <tbody>
                {mockRouteComparisons.map((route, idx) => (
                  <tr
                    key={idx}
                    className={`border-b border-[#334155] ${route.recommended ? 'bg-emerald-500/5' : ''}`}
                  >
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <span className="text-white font-medium">{route.name}</span>
                        {route.recommended && (
                          <span className="inline-flex items-center rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-xs font-semibold text-emerald-400">
                            Consigliato
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-3 text-slate-400">{route.distance} km</td>
                    <td className="py-3 px-3 text-slate-400">{formatDuration(route.baseDuration)}</td>
                    <td className="py-3 px-3">
                      <span className={`font-semibold ${route.weatherDelay < 10 ? 'text-emerald-400' : route.weatherDelay <= 30 ? 'text-amber-400' : 'text-red-400'}`}>
                        +{route.weatherDelay} min
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <RiskBadge risk={route.risk} delay={route.weatherDelay} />
                    </td>
                    <td className="py-3 px-3 text-white font-medium">{route.eta}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  )
}
