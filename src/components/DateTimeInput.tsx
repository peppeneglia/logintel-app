import { useRef } from 'react'

interface Props {
  date: string        // YYYY-MM-DD
  time: string        // HH:MM
  onDateChange: (v: string) => void
  onTimeChange: (v: string) => void
  className?: string
}

const inputClass =
  'w-full px-3 py-2 bg-[#334155] border border-slate-600 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500'

// Masked input: user types digits, mask auto-formats.
// Backspace removes only last digit.

function useMaskedInput(
  mask: string,     // e.g. "DD/MM/YYYY" or "HH:MM"
  value: string,    // raw digits only
  onChange: (raw: string) => void,
  toFormatted: (raw: string) => string,
  maxDigits: number,
) {
  const ref = useRef<HTMLInputElement>(null)

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const digit = e.key
    if (digit === 'Backspace') {
      e.preventDefault()
      if (value.length > 0) {
        onChange(value.slice(0, -1))
      }
      return
    }
    if (digit === 'Delete') {
      e.preventDefault()
      onChange('')
      return
    }
    // Allow tab, enter, arrow keys
    if (['Tab', 'Enter', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(digit)) return

    e.preventDefault()

    // Only accept digits
    if (!/^[0-9]$/.test(digit)) return
    if (value.length >= maxDigits) return

    onChange(value + digit)
  }

  const formatted = toFormatted(value)

  return { ref, formatted, handleKeyDown, placeholder: mask }
}

function formatDate(raw: string): string {
  // raw = digits only, max 8 (DDMMYYYY)
  const d = raw.padEnd(0, '')
  let out = ''
  for (let i = 0; i < d.length && i < 8; i++) {
    if (i === 2 || i === 4) out += '/'
    out += d[i]
  }
  return out
}

function formatTime(raw: string): string {
  // raw = digits only, max 4 (HHMM)
  const d = raw.padEnd(0, '')
  let out = ''
  for (let i = 0; i < d.length && i < 4; i++) {
    if (i === 2) out += ':'
    out += d[i]
  }
  return out
}

// Convert DD/MM/YYYY to YYYY-MM-DD
function toISODate(raw: string): string {
  if (raw.length < 8) return ''
  const dd = raw.slice(0, 2)
  const mm = raw.slice(2, 4)
  const yyyy = raw.slice(4, 8)
  return `${yyyy}-${mm}-${dd}`
}

// Convert YYYY-MM-DD to raw digits DDMMYYYY
function fromISODate(iso: string): string {
  if (!iso || iso.length < 10) return ''
  const [yyyy, mm, dd] = iso.split('-')
  return `${dd}${mm}${yyyy}`
}

// Convert HHMM to HH:MM
function toISOTime(raw: string): string {
  if (raw.length < 4) return ''
  return `${raw.slice(0, 2)}:${raw.slice(2, 4)}`
}

// Convert HH:MM to raw digits HHMM
function fromISOTime(iso: string): string {
  if (!iso) return ''
  return iso.replace(':', '')
}

export function DateTimeInput({ date, time, onDateChange, onTimeChange, className }: Props) {
  const dateRaw = fromISODate(date)
  const timeRaw = fromISOTime(time)

  const dateInput = useMaskedInput(
    'GG/MM/AAAA',
    dateRaw,
    (raw) => onDateChange(toISODate(raw)),
    formatDate,
    8,
  )

  const timeInput = useMaskedInput(
    'HH:MM',
    timeRaw,
    (raw) => onTimeChange(toISOTime(raw)),
    formatTime,
    4,
  )

  return (
    <div className={`grid grid-cols-2 gap-2 ${className || ''}`}>
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1">Data partenza</label>
        <input
          ref={dateInput.ref}
          type="text"
          inputMode="numeric"
          value={dateInput.formatted}
          onKeyDown={dateInput.handleKeyDown}
          onChange={() => {}} // controlled via onKeyDown
          placeholder={dateInput.placeholder}
          className={inputClass}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1">Ora partenza</label>
        <input
          ref={timeInput.ref}
          type="text"
          inputMode="numeric"
          value={timeInput.formatted}
          onKeyDown={timeInput.handleKeyDown}
          onChange={() => {}} // controlled via onKeyDown
          placeholder={timeInput.placeholder}
          className={inputClass}
        />
      </div>
    </div>
  )
}
