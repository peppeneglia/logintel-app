import { useState, useEffect } from 'react'

interface Props {
  date: string        // YYYY-MM-DD
  time: string        // HH:MM
  onDateChange: (v: string) => void
  onTimeChange: (v: string) => void
  className?: string
}

const inputClass =
  'w-full px-3 py-2 bg-[#334155] border border-slate-600 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500'

function formatDateDigits(raw: string): string {
  let out = ''
  for (let i = 0; i < raw.length && i < 8; i++) {
    if (i === 2 || i === 4) out += '/'
    out += raw[i]
  }
  return out
}

function formatTimeDigits(raw: string): string {
  let out = ''
  for (let i = 0; i < raw.length && i < 4; i++) {
    if (i === 2) out += ':'
    out += raw[i]
  }
  return out
}

function rawToISODate(raw: string): string {
  if (raw.length < 8) return ''
  return `${raw.slice(4, 8)}-${raw.slice(2, 4)}-${raw.slice(0, 2)}`
}

function isoToRawDate(iso: string): string {
  if (!iso || iso.length < 10) return ''
  const [yyyy, mm, dd] = iso.split('-')
  return `${dd}${mm}${yyyy}`
}

function rawToISOTime(raw: string): string {
  if (raw.length < 4) return ''
  return `${raw.slice(0, 2)}:${raw.slice(2, 4)}`
}

function isoToRawTime(iso: string): string {
  if (!iso) return ''
  return iso.replace(':', '')
}

function MaskedInput({
  rawValue,
  onRawChange,
  format,
  maxDigits,
  placeholder,
}: {
  rawValue: string
  onRawChange: (raw: string) => void
  format: (raw: string) => string
  maxDigits: number
  placeholder: string
}) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      e.preventDefault()
      if (rawValue.length > 0) onRawChange(rawValue.slice(0, -1))
      return
    }
    if (e.key === 'Delete') {
      e.preventDefault()
      onRawChange('')
      return
    }
    if (['Tab', 'Enter', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) return
    e.preventDefault()
    if (!/^[0-9]$/.test(e.key)) return
    if (rawValue.length >= maxDigits) return
    onRawChange(rawValue + e.key)
  }

  return (
    <input
      type="text"
      inputMode="numeric"
      value={format(rawValue)}
      onKeyDown={handleKeyDown}
      onChange={() => {}}
      placeholder={placeholder}
      className={inputClass}
    />
  )
}

export function DateTimeInput({ date, time, onDateChange, onTimeChange, className }: Props) {
  // Internal raw digit state — survives partial input
  const [dateRaw, setDateRaw] = useState(() => isoToRawDate(date))
  const [timeRaw, setTimeRaw] = useState(() => isoToRawTime(time))

  // Sync from parent when external value changes (e.g. demo prefill)
  useEffect(() => {
    const parentRaw = isoToRawDate(date)
    if (parentRaw && parentRaw !== dateRaw) setDateRaw(parentRaw)
  }, [date])

  useEffect(() => {
    const parentRaw = isoToRawTime(time)
    if (parentRaw && parentRaw !== timeRaw) setTimeRaw(parentRaw)
  }, [time])

  const handleDateRaw = (raw: string) => {
    setDateRaw(raw)
    const iso = rawToISODate(raw)
    if (iso) onDateChange(iso)
    else if (raw.length === 0) onDateChange('')
  }

  const handleTimeRaw = (raw: string) => {
    setTimeRaw(raw)
    const iso = rawToISOTime(raw)
    if (iso) onTimeChange(iso)
    else if (raw.length === 0) onTimeChange('')
  }

  return (
    <div className={`grid grid-cols-2 gap-2 ${className || ''}`}>
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1">Data partenza</label>
        <MaskedInput
          rawValue={dateRaw}
          onRawChange={handleDateRaw}
          format={formatDateDigits}
          maxDigits={8}
          placeholder="GG/MM/AAAA"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1">Ora partenza</label>
        <MaskedInput
          rawValue={timeRaw}
          onRawChange={handleTimeRaw}
          format={formatTimeDigits}
          maxDigits={4}
          placeholder="HH:MM"
        />
      </div>
    </div>
  )
}
