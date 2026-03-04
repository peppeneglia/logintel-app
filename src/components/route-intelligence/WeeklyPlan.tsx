import { useState } from 'react'
import { mockWeeklyPlan } from '../../data/mockData'
import { ConfidenceBar } from '../ui/ConfidenceBar'
import { RiskBadge } from '../ui/RiskBadge'
import { CreditConfirmModal } from '../ui/CreditConfirmModal'

function getRiskLevel(delay: number): 'low' | 'medium' | 'high' {
  if (delay < 10) return 'low'
  if (delay <= 30) return 'medium'
  return 'high'
}

function getRowBg(delay: number): string {
  if (delay < 10) return 'bg-emerald-500/5'
  if (delay <= 30) return 'bg-amber-500/5'
  return 'bg-red-500/5'
}

export function WeeklyPlan() {
  const [showModal, setShowModal] = useState(false)
  const [showResults, setShowResults] = useState(false)

  const [routes] = useState([
    { origin: 'Milano', destination: 'Roma', day: 'Lunedi', time: '06:00' },
    { origin: 'Torino', destination: 'Napoli', day: 'Martedi', time: '05:30' },
    { origin: 'Bologna', destination: 'Bari', day: 'Mercoledi', time: '07:00' },
  ])

  const handleGenerate = () => {
    setShowModal(true)
  }

  const handleConfirm = () => {
    setShowModal(false)
    setShowResults(true)
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-3">Piano Settimanale</h1>

      {/* Input section */}
      <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6 mb-3">
        <h2 className="text-sm font-semibold text-gray-300 mb-4">Rotte da analizzare</h2>
        <div className="space-y-3 mb-4">
          {routes.map((route, idx) => (
            <div key={idx} className="grid grid-cols-4 gap-3">
              <input
                type="text"
                value={route.origin}
                readOnly
                className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-xl text-sm text-gray-300"
              />
              <input
                type="text"
                value={route.destination}
                readOnly
                className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-xl text-sm text-gray-300"
              />
              <input
                type="text"
                value={route.day}
                readOnly
                className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-xl text-sm text-gray-300"
              />
              <input
                type="text"
                value={route.time}
                readOnly
                className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-xl text-sm text-gray-300"
              />
            </div>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <button className="px-4 py-2 border border-gray-700 rounded-xl text-sm font-medium text-gray-300 hover:bg-gray-800 transition-colors">
            Carica CSV
          </button>
          <button
            onClick={handleGenerate}
            className="px-6 py-2.5 bg-primary-500 text-white font-medium rounded-xl hover:bg-primary-600 transition-colors text-sm"
          >
            Genera piano (1 credito per rotta)
          </button>
        </div>
      </div>

      {/* Results */}
      {showResults && (
        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
          <h2 className="text-sm font-semibold text-gray-300 mb-4">Risultati piano settimanale</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="text-left py-3 px-3 font-medium text-gray-400">Rotta</th>
                  <th className="text-left py-3 px-3 font-medium text-gray-400">Giorno</th>
                  <th className="text-left py-3 px-3 font-medium text-gray-400">Partenza</th>
                  <th className="text-left py-3 px-3 font-medium text-gray-400">Ritardo Previsto</th>
                  <th className="text-left py-3 px-3 font-medium text-gray-400 min-w-[140px]">Confidence</th>
                  <th className="text-left py-3 px-3 font-medium text-gray-400">Rischio</th>
                </tr>
              </thead>
              <tbody>
                {mockWeeklyPlan.map((entry) => {
                  const delay = entry.prediction?.estimatedDelay ?? 0
                  const confidence = entry.prediction?.confidence ?? 0
                  const risk = getRiskLevel(delay)

                  return (
                    <tr key={entry.id} className={`border-b border-gray-800 ${getRowBg(delay)}`}>
                      <td className="py-3 px-3 text-white font-medium">
                        {entry.origin} &rarr; {entry.destination}
                      </td>
                      <td className="py-3 px-3 text-gray-400">{entry.dayOfWeek}</td>
                      <td className="py-3 px-3 text-gray-400">{entry.departureTime}</td>
                      <td className="py-3 px-3">
                        <span className={`font-semibold ${delay < 10 ? 'text-emerald-400' : delay <= 30 ? 'text-amber-400' : 'text-red-400'}`}>
                          +{delay} min
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <ConfidenceBar value={confidence} size="sm" />
                      </td>
                      <td className="py-3 px-3">
                        <RiskBadge risk={risk} delay={delay} />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <CreditConfirmModal
        isOpen={showModal}
        creditsRemaining={142}
        onConfirm={handleConfirm}
        onCancel={() => setShowModal(false)}
      />
    </div>
  )
}
