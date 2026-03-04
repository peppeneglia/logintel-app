interface ConfidenceBarProps {
  value: number
  size?: 'sm' | 'md'
}

export function ConfidenceBar({ value, size = 'md' }: ConfidenceBarProps) {
  const clampedValue = Math.min(100, Math.max(0, value))

  const getColor = () => {
    if (clampedValue >= 80) return 'bg-emerald-500'
    if (clampedValue >= 60) return 'bg-amber-500'
    return 'bg-red-500'
  }

  const getTextColor = () => {
    if (clampedValue >= 80) return 'text-emerald-400'
    if (clampedValue >= 60) return 'text-amber-400'
    return 'text-red-400'
  }

  const barHeight = size === 'sm' ? 'h-1.5' : 'h-2.5'
  const textSize = size === 'sm' ? 'text-xs' : 'text-sm'

  return (
    <div className="flex items-center gap-2">
      <div className={`flex-1 ${barHeight} bg-slate-600 rounded-full overflow-hidden`}>
        <div
          className={`h-full ${getColor()} rounded-full transition-all duration-300`}
          style={{ width: `${clampedValue}%` }}
        />
      </div>
      <span className={`${textSize} font-semibold ${getTextColor()} min-w-[2.5rem] text-right`}>
        {clampedValue}%
      </span>
    </div>
  )
}
