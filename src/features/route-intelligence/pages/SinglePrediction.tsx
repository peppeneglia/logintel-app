import React, { useState } from 'react'
import { mockSinglePrediction } from '../../../data/mockData'
import { ConfidenceBar } from '../../../components/ConfidenceBar'
import type { WeatherCondition } from '../../../types'

const weatherEmoji: Record<WeatherCondition, string> = {
  clear: '\u2600\uFE0F',
  rain_light: '\uD83C\uDF26\uFE0F',
  rain_heavy: '\uD83C\uDF27\uFE0F',
  snow: '\u2744\uFE0F',
  fog: '\uD83C\uDF2B\uFE0F',
  wind: '\uD83D\uDCA8',
  storm: '\u26C8\uFE0F',
}

function getDelayColor(delay: number): string {
  if (delay < 10) return 'text-emerald-400'
  if (delay < 30) return 'text-amber-400'
  if (delay < 60) return 'text-orange-400'
  return 'text-red-400'
}

function formatDateTime(date: Date): string {
  return date.toLocaleDateString('it-IT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }) + ' ' + date.toLocaleTimeString('it-IT', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function SinglePrediction() {
  const [origin, setOrigin] = useState('')
  const [destination, setDestination] = useState('')
  const [departureTime, setDepartureTime] = useState('')
  const [vehicleType, setVehicleType] = useState('truck_standard')
  const [showResult, setShowResult] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      setShowResult(true)
    }, 1000)
  }

  const prediction = mockSinglePrediction

  return (
    <div>
      <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-400 to-cyan-500 bg-clip-text text-transparent mb-3">Predizione Singola</h1>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-[#1e293b] rounded-2xl border border-[#334155] p-6 mb-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Origine</label>
            <input
              type="text"
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              placeholder="es. Milano"
              className="w-full px-3 py-2 bg-[#334155] border border-slate-600 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Destinazione</label>
            <input
              type="text"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="es. Roma"
              className="w-full px-3 py-2 bg-[#334155] border border-slate-600 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Data e ora partenza</label>
            <input
              type="datetime-local"
              value={departureTime}
              onChange={(e) => setDepartureTime(e.target.value)}
              className="w-full px-3 py-2 bg-[#334155] border border-slate-600 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Tipo veicolo</label>
            <select
              value={vehicleType}
              onChange={(e) => setVehicleType(e.target.value)}
              className="w-full px-3 py-2 bg-[#334155] border border-slate-600 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500"
            >
              <option value="truck_standard">Truck standard</option>
              <option value="truck_refrigerato">Truck refrigerato</option>
              <option value="furgone">Furgone</option>
              <option value="altro">Altro</option>
            </select>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="submit"
            className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-700 text-white font-medium rounded-xl hover:from-emerald-600 hover:to-emerald-800 transition-colors"
          >
            Calcola predizione
          </button>
        </div>
      </form>

      {/* Loading */}
      {loading && (
        <div className="bg-[#1e293b] rounded-2xl border border-[#334155] p-12 text-center">
          <div className="animate-spin w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full mx-auto mb-3" />
          <p className="text-sm text-slate-500">Calcolo predizione in corso...</p>
        </div>
      )}

      {/* Result */}
      {showResult && !loading && (
        <div className="card-accent bg-[#1e293b] rounded-2xl border border-[#334155] p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-lg font-semibold text-white">
                {prediction.origin} &rarr; {prediction.destination}
              </h2>
              <p className="text-sm text-slate-500">
                {formatDateTime(prediction.departureTime)}
              </p>
            </div>
          </div>

          {/* Delay + Confidence */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-3">
            <div className="bg-[#334155] rounded-xl p-4">
              <p className="text-sm text-slate-400 mb-1">Ritardo stimato</p>
              <p className={`text-4xl font-bold ${getDelayColor(prediction.estimatedDelay)}`}>
                +{prediction.estimatedDelay} min
              </p>
            </div>
            <div className="bg-[#334155] rounded-xl p-4">
              <p className="text-sm text-slate-400 mb-2">Confidenza</p>
              <ConfidenceBar value={prediction.confidence} />
            </div>
          </div>

          {/* Weather Table */}
          <div className="mb-3">
            <h3 className="text-sm font-semibold text-slate-300 mb-3">Condizioni meteo lungo il percorso</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#334155]">
                    <th className="text-left py-2 px-3 font-medium text-slate-400">Localita</th>
                    <th className="text-left py-2 px-3 font-medium text-slate-400">Km</th>
                    <th className="text-left py-2 px-3 font-medium text-slate-400">Condizioni</th>
                    <th className="text-left py-2 px-3 font-medium text-slate-400">Temperatura</th>
                    <th className="text-left py-2 px-3 font-medium text-slate-400">Impatto</th>
                  </tr>
                </thead>
                <tbody>
                  {prediction.weatherConditions.map((wp, idx) => (
                    <tr key={idx} className="border-b border-[#334155]">
                      <td className="py-2 px-3 text-white">{wp.location}</td>
                      <td className="py-2 px-3 text-slate-400">{wp.km}</td>
                      <td className="py-2 px-3">
                        <span className="mr-1">{weatherEmoji[wp.condition]}</span>
                        <span className="text-slate-400">{wp.condition.replace('_', ' ')}</span>
                      </td>
                      <td className="py-2 px-3 text-slate-400">{wp.temperature}°C</td>
                      <td className="py-2 px-3">
                        {wp.impactMinutes > 0 ? (
                          <span className="text-orange-400 font-medium">+{wp.impactMinutes} min</span>
                        ) : (
                          <span className="text-emerald-400">Nessuno</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Alternative Route */}
          {prediction.estimatedDelay > 15 && prediction.alternativeRoute && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 mb-3">
              <h3 className="text-sm font-semibold text-emerald-400 mb-2">Percorso alternativo consigliato</h3>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-emerald-300">
                    <span className="font-medium">{prediction.alternativeRoute.name}</span>
                    {' '}&mdash; {prediction.alternativeRoute.distance} km
                  </p>
                  <p className="text-sm text-emerald-400">
                    Ritardo stimato: +{prediction.alternativeRoute.estimatedDelay} min
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-emerald-400">
                    -{prediction.alternativeRoute.savings} min
                  </p>
                  <p className="text-xs text-emerald-400">risparmio</p>
                </div>
              </div>
            </div>
          )}

          {/* ETA */}
          <div className="bg-[#334155] rounded-xl p-4 mb-3">
            <div className="flex items-center gap-6">
              <div>
                <p className="text-xs text-slate-400">ETA originale</p>
                <p className="text-sm font-medium text-slate-300">
                  {formatDateTime(prediction.originalETA)}
                </p>
              </div>
              <span className="text-slate-500">&rarr;</span>
              <div>
                <p className="text-xs text-slate-400">ETA corretta</p>
                <p className="text-sm font-semibold text-white">
                  {formatDateTime(prediction.correctedETA)}
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 border border-slate-600 rounded-xl text-sm font-medium text-slate-300 hover:bg-[#334155] transition-colors">
              Esporta PDF
            </button>
            <button className="px-4 py-2 border border-slate-600 rounded-xl text-sm font-medium text-slate-300 hover:bg-[#334155] transition-colors">
              Dai feedback
            </button>
          </div>
        </div>
      )}

    </div>
  )
}
