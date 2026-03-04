import { useState } from 'react'
import { mockPredictionHistory } from '../../data/mockData'
import type { WeatherCondition } from '../../types'

const weatherLabels: Record<WeatherCondition, string> = {
  clear: 'Sereno',
  rain_light: 'Pioggia leggera',
  rain_heavy: 'Pioggia forte',
  snow: 'Neve',
  fog: 'Nebbia',
  wind: 'Vento',
  storm: 'Temporale',
}

function formatDateIT(date: Date): string {
  return date.toLocaleDateString('it-IT', {
    day: '2-digit',
    month: '2-digit',
  }) + ' ' + date.toLocaleTimeString('it-IT', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

function summarizeWeather(conditions: { condition: WeatherCondition }[]): string {
  if (conditions.length === 0) return 'N/D'
  const unique = [...new Set(conditions.map((c) => c.condition))]
  return unique.map((c) => weatherLabels[c]).join(', ')
}

export function ETAReport() {
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [format, setFormat] = useState('pdf')

  const reportData = mockPredictionHistory.slice(0, 5)

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-3">Report ETA</h1>

      {/* Filters */}
      <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6 mb-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Data inizio</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Data fine</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Formato</label>
            <select
              value={format}
              onChange={(e) => setFormat(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500"
            >
              <option value="pdf">PDF</option>
              <option value="csv">CSV</option>
            </select>
          </div>
        </div>
        <button className="px-6 py-2.5 bg-primary-500 text-white font-medium rounded-xl hover:bg-primary-600 transition-colors text-sm">
          Genera report
        </button>
      </div>

      {/* Report preview */}
      <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-gray-300">Anteprima report</h2>
          <button className="px-4 py-2 border border-gray-700 rounded-xl text-sm font-medium text-gray-300 hover:bg-gray-800 transition-colors">
            Scarica report
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left py-3 px-3 font-medium text-gray-400">Rotta</th>
                <th className="text-left py-3 px-3 font-medium text-gray-400">Partenza</th>
                <th className="text-left py-3 px-3 font-medium text-gray-400">ETA Originale</th>
                <th className="text-left py-3 px-3 font-medium text-gray-400">ETA Corretta</th>
                <th className="text-left py-3 px-3 font-medium text-gray-400">Ritardo</th>
                <th className="text-left py-3 px-3 font-medium text-gray-400">Condizioni</th>
              </tr>
            </thead>
            <tbody>
              {reportData.map((item) => (
                <tr key={item.id} className="border-b border-gray-800">
                  <td className="py-3 px-3 text-white font-medium">
                    {item.origin} &rarr; {item.destination}
                  </td>
                  <td className="py-3 px-3 text-gray-400">
                    {formatDateIT(item.departureTime)}
                  </td>
                  <td className="py-3 px-3 text-gray-400">
                    {formatDateIT(item.originalETA)}
                  </td>
                  <td className="py-3 px-3 text-white font-medium">
                    {formatDateIT(item.correctedETA)}
                  </td>
                  <td className="py-3 px-3">
                    <span className={`font-semibold ${item.estimatedDelay < 10 ? 'text-emerald-400' : item.estimatedDelay <= 30 ? 'text-amber-400' : 'text-red-400'}`}>
                      +{item.estimatedDelay} min
                    </span>
                  </td>
                  <td className="py-3 px-3 text-gray-400">
                    {summarizeWeather(item.weatherConditions)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
