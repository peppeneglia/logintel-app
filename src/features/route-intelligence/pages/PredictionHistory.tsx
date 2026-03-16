import { useState } from 'react'
import { mockPredictionHistory } from '../../../data/mockData'
import { useUnavailable } from '../../../hooks/useUnavailable'
import { UnavailableToast } from '../../../components/UnavailableToast'
import { ConfidenceBar } from '../../../components/ConfidenceBar'

function formatDateFull(date: Date): string {
  const day = date.toLocaleDateString('it-IT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
  const time = date.toLocaleTimeString('it-IT', {
    hour: '2-digit',
    minute: '2-digit',
  })
  return `${day} ${time}`
}

export function PredictionHistory() {
  const { isDemo, show, guard, close } = useUnavailable()
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [routeFilter, setRouteFilter] = useState('')
  const [feedbackFilter, setFeedbackFilter] = useState('all')

  const filteredData = mockPredictionHistory.filter((item) => {
    if (routeFilter) {
      const route = `${item.origin} ${item.destination}`.toLowerCase()
      if (!route.includes(routeFilter.toLowerCase())) return false
    }
    if (feedbackFilter === 'with' && !item.feedbackGiven) return false
    if (feedbackFilter === 'without' && item.feedbackGiven) return false
    if (dateFrom) {
      const from = new Date(dateFrom)
      if (item.requestedAt < from) return false
    }
    if (dateTo) {
      const to = new Date(dateTo)
      to.setHours(23, 59, 59, 999)
      if (item.requestedAt > to) return false
    }
    return true
  })

  const handleFilter = () => {
    if (guard()) return
  }

  return (
    <div>
      <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-400 to-cyan-500 bg-clip-text text-transparent mb-3">Storico Predizioni</h1>

      {/* Filters */}
      <div className="bg-[#1e293b] rounded-2xl border border-[#334155] p-6 mb-3">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Data inizio</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full px-3 py-2 bg-[#334155] border border-slate-600 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Data fine</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full px-3 py-2 bg-[#334155] border border-slate-600 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Rotta</label>
            <input
              type="text"
              value={routeFilter}
              onChange={(e) => setRouteFilter(e.target.value)}
              placeholder="es. Milano"
              className="w-full px-3 py-2 bg-[#334155] border border-slate-600 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Feedback</label>
            <select
              value={feedbackFilter}
              onChange={(e) => setFeedbackFilter(e.target.value)}
              className="w-full px-3 py-2 bg-[#334155] border border-slate-600 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500"
            >
              <option value="all">Tutti</option>
              <option value="with">Con feedback</option>
              <option value="without">Senza feedback</option>
            </select>
          </div>
        </div>
        <button
          onClick={handleFilter}
          className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-700 text-white font-medium rounded-xl hover:from-emerald-600 hover:to-emerald-800 transition-colors text-sm"
        >
          Filtra
        </button>
      </div>

      {/* Table */}
      <div className="bg-[#1e293b] rounded-2xl border border-[#334155] p-6">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#334155]">
                <th className="text-left py-3 px-3 font-medium text-slate-400">Data richiesta</th>
                <th className="text-left py-3 px-3 font-medium text-slate-400">Rotta</th>
                <th className="text-left py-3 px-3 font-medium text-slate-400">Ritardo predetto</th>
                <th className="text-left py-3 px-3 font-medium text-slate-400">Ritardo effettivo</th>
                <th className="text-left py-3 px-3 font-medium text-slate-400 min-w-[140px]">Confidence</th>
                <th className="text-left py-3 px-3 font-medium text-slate-400">Accuratezza</th>
                <th className="text-left py-3 px-3 font-medium text-slate-400">Azioni</th>
              </tr>
            </thead>
            <tbody>
              {isDemo ? (
                filteredData.map((item) => {
                  const accuracy = item.feedbackGiven && item.actualDelay !== undefined
                    ? Math.abs(item.estimatedDelay - item.actualDelay)
                    : null

                  return (
                    <tr key={item.id} className="border-b border-[#334155]">
                      <td className="py-3 px-3 text-slate-400">
                        {formatDateFull(item.requestedAt)}
                      </td>
                      <td className="py-3 px-3 text-white font-medium">
                        {item.origin} &rarr; {item.destination}
                      </td>
                      <td className="py-3 px-3">
                        <span className={`font-semibold ${item.estimatedDelay < 10 ? 'text-emerald-400' : item.estimatedDelay <= 30 ? 'text-amber-400' : 'text-red-400'}`}>
                          +{item.estimatedDelay} min
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-400">
                        {item.feedbackGiven && item.actualDelay !== undefined
                          ? `+${item.actualDelay} min`
                          : '\u2014'}
                      </td>
                      <td className="py-3 px-3">
                        <ConfidenceBar value={item.confidence} size="sm" />
                      </td>
                      <td className="py-3 px-3">
                        {accuracy !== null ? (
                          <span className={`font-medium ${accuracy <= 5 ? 'text-emerald-400' : accuracy <= 15 ? 'text-amber-400' : 'text-red-400'}`}>
                            &plusmn;{accuracy} min
                          </span>
                        ) : (
                          <span className="text-slate-500">&mdash;</span>
                        )}
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <button className="px-3 py-1 border border-slate-600 rounded-xl text-xs font-medium text-slate-300 hover:bg-[#334155] transition-colors">
                            Dettaglio
                          </button>
                          {!item.feedbackGiven && (
                            <button className="px-3 py-1 border border-primary-500 rounded-xl text-xs font-medium text-primary-400 hover:bg-primary-500/10 transition-colors">
                              Feedback
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan={7}>
                    <p className="text-sm text-slate-500 py-8 text-center">Nessun dato disponibile.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {isDemo && filteredData.length === 0 && (
          <div className="text-center py-8 text-slate-500 text-sm">
            Nessun risultato trovato con i filtri selezionati.
          </div>
        )}
      </div>

      <UnavailableToast show={show} onClose={close} />
    </div>
  )
}
