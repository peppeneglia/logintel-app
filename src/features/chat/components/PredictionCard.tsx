import type { PredictionResult, WeatherCondition } from '../../../types'

interface PredictionCardProps {
  prediction: PredictionResult
}

const weatherEmoji: Record<WeatherCondition, string> = {
  clear: '\u2600\ufe0f',
  rain_light: '\ud83c\udf26\ufe0f',
  rain_heavy: '\ud83c\udf27\ufe0f',
  snow: '\u2744\ufe0f',
  fog: '\ud83c\udf2b\ufe0f',
  wind: '\ud83d\udca8',
  storm: '\u26c8\ufe0f',
}

function formatTime(date: Date): string {
  return new Date(date).toLocaleTimeString('it-IT', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatDateTime(date: Date): string {
  const d = new Date(date)
  return d.toLocaleDateString('it-IT', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }) + ' \u2022 ' + formatTime(d)
}

function getDelayColor(delay: number): string {
  if (delay < 10) return 'text-emerald-400'
  if (delay < 30) return 'text-amber-400'
  if (delay < 60) return 'text-orange-400'
  return 'text-red-400'
}

export function PredictionCard({ prediction }: PredictionCardProps) {
  const {
    origin,
    destination,
    departureTime,
    estimatedDelay,
    confidence,
    originalETA,
    correctedETA,
    weatherConditions,
    alternativeRoute,
  } = prediction

  return (
    <div className="border border-slate-600 rounded-2xl overflow-hidden bg-[#334155] max-w-lg mt-3">
      {/* Header */}
      <div className="bg-[#1e293b] text-white p-4">
        <div className="text-lg font-semibold">
          {origin} &rarr; {destination}
        </div>
        <div className="text-sm text-slate-300 mt-1">
          Partenza: {formatDateTime(departureTime)}
        </div>
      </div>

      {/* Delay section */}
      <div className="p-4">
        <div className="flex items-baseline gap-2">
          <span className={`text-4xl font-bold ${getDelayColor(estimatedDelay)}`}>
            {estimatedDelay}
          </span>
          <span className="text-slate-400 text-sm">minuti di ritardo stimato</span>
        </div>
      </div>

      {/* Confidence */}
      <div className="px-4 pb-4">
        <div className="flex items-center justify-between text-sm mb-1">
          <span className="text-slate-400">Affidabilit&agrave;</span>
          <span className="font-medium text-slate-100">{confidence}%</span>
        </div>
        <div className="w-full bg-slate-600 rounded-full h-2">
          <div
            className="bg-primary-500 h-2 rounded-full transition-all"
            style={{ width: `${confidence}%` }}
          />
        </div>
      </div>

      {/* Weather along route */}
      {weatherConditions.length > 0 && (
        <div className="px-4 pb-4">
          <div className="text-sm font-medium text-slate-300 mb-2">
            Meteo lungo il percorso
          </div>
          <div className="grid gap-2">
            {weatherConditions.map((wp) => (
              <div
                key={wp.km}
                className="flex items-center justify-between text-sm bg-[#1e293b] rounded-xl px-3 py-2"
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">{weatherEmoji[wp.condition]}</span>
                  <span className="text-slate-300">{wp.location}</span>
                  <span className="text-slate-500 text-xs">km {wp.km}</span>
                </div>
                <div className="flex items-center gap-3 text-slate-400">
                  <span>{wp.temperature}&deg;C</span>
                  {wp.impactMinutes > 0 && (
                    <span className="text-orange-400 font-medium">
                      +{wp.impactMinutes} min
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ETA comparison */}
      <div className="px-4 pb-4">
        <div className="flex items-center gap-3 text-sm">
          <div className="text-center">
            <div className="text-slate-500 text-xs">ETA originale</div>
            <div className="font-semibold text-slate-300">{formatTime(originalETA)}</div>
          </div>
          <span className="text-slate-500">&rarr;</span>
          <div className="text-center">
            <div className="text-slate-500 text-xs">ETA corretta</div>
            <div className={`font-semibold ${getDelayColor(estimatedDelay)}`}>
              {formatTime(correctedETA)}
            </div>
          </div>
        </div>
      </div>

      {/* Alternative route */}
      {alternativeRoute && (
        <div className="px-4 pb-4">
          <div className="bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-xl">
            <div className="text-sm font-medium text-emerald-400">
              Percorso alternativo: {alternativeRoute.name}
            </div>
            <div className="text-sm text-emerald-300/80 mt-1">
              Risparmio stimato:{' '}
              <span className="font-semibold">{alternativeRoute.savings} minuti</span>
              {' '}&bull; {alternativeRoute.distance} km
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
