import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { mockRouteEmissions } from '../../../data/mockCarbonData'

function TrendIcon({ trend }: { trend: 'up' | 'down' | 'stable' }) {
  if (trend === 'up') return <TrendingUp size={16} className="text-red-400" />
  if (trend === 'down') return <TrendingDown size={16} className="text-emerald-400" />
  return <Minus size={16} className="text-slate-400" />
}

function trendLabel(trend: 'up' | 'down' | 'stable') {
  if (trend === 'up') return 'text-red-400'
  if (trend === 'down') return 'text-emerald-400'
  return 'text-slate-400'
}

export function RouteEmissions() {
  return (
    <div>
      <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-400 to-cyan-500 bg-clip-text text-transparent mb-3">Emissioni per Rotta</h1>

      <div className="bg-[#1e293b] rounded-2xl border border-[#334155] p-6">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#334155]">
                <th className="text-left py-3 px-3 font-medium text-slate-400">Rotta</th>
                <th className="text-right py-3 px-3 font-medium text-slate-400">Distanza (km)</th>
                <th className="text-right py-3 px-3 font-medium text-slate-400">CO2 (kg)</th>
                <th className="text-right py-3 px-3 font-medium text-slate-400">CO2/km</th>
                <th className="text-right py-3 px-3 font-medium text-slate-400">Fuel (L)</th>
                <th className="text-right py-3 px-3 font-medium text-slate-400">Viaggi</th>
                <th className="text-center py-3 px-3 font-medium text-slate-400">Trend</th>
              </tr>
            </thead>
            <tbody>
              {mockRouteEmissions.map((row) => (
                <tr key={row.route} className="border-b border-[#334155] last:border-b-0">
                  <td className="py-3 px-3 text-white font-medium">{row.route}</td>
                  <td className="py-3 px-3 text-slate-300 text-right">{row.distance}</td>
                  <td className="py-3 px-3 text-slate-300 text-right">{row.co2Kg.toLocaleString('it-IT')}</td>
                  <td className="py-3 px-3 text-slate-300 text-right">{row.co2PerKm.toFixed(2)}</td>
                  <td className="py-3 px-3 text-slate-300 text-right">{row.fuelLiters}</td>
                  <td className="py-3 px-3 text-slate-300 text-right">{row.trips}</td>
                  <td className="py-3 px-3">
                    <div className="flex items-center justify-center gap-1.5">
                      <TrendIcon trend={row.trend} />
                      <span className={`text-xs font-medium ${trendLabel(row.trend)}`}>
                        {row.trend === 'up' ? 'In aumento' : row.trend === 'down' ? 'In calo' : 'Stabile'}
                      </span>
                    </div>
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
