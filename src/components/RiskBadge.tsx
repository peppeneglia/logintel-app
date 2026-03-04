interface RiskBadgeProps {
  risk: 'low' | 'medium' | 'high'
  delay: number
}

export function RiskBadge({ risk, delay }: RiskBadgeProps) {
  const getStyles = () => {
    switch (risk) {
      case 'low':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
      case 'medium':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20'
      case 'high':
        return 'bg-red-500/10 text-red-400 border-red-500/20'
    }
  }

  const getLabel = () => {
    switch (risk) {
      case 'low':
        return 'Basso'
      case 'medium':
        return 'Medio'
      case 'high':
        return 'Alto'
    }
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold border ${getStyles()}`}
    >
      <span>{getLabel()}</span>
      <span className="opacity-75">·</span>
      <span>{delay} min</span>
    </span>
  )
}
