import { useRef, useState, useEffect, useCallback } from 'react'

interface Props {
  date: string        // YYYY-MM-DD
  time: string        // HH:MM
  onDateChange: (v: string) => void
  onTimeChange: (v: string) => void
  className?: string
}

const inputClass =
  'w-full px-3 py-2 bg-[#334155] border border-slate-600 rounded-xl text-sm text-white font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 caret-transparent select-none'

// ── Mask logic ──
// Date mask: DD/MM/YYYY  →  digit positions: 0,1, /2, 3,4, /5, 6,7,8,9
// Time mask: HH:MM       →  digit positions: 0,1, :2, 3,4

const DATE_TEMPLATE = '__/__/____'
const TIME_TEMPLATE = '__:__'

// Maps display position → digit index (skipping separators)
const DATE_DIGIT_POSITIONS = [0, 1, 3, 4, 6, 7, 8, 9] // display positions that are digits
const TIME_DIGIT_POSITIONS = [0, 1, 3, 4]

function digitIndexToDisplayPos(digitIdx: number, positions: number[]): number {
  return positions[digitIdx] ?? positions[positions.length - 1]
}

function displayPosToDigitIndex(displayPos: number, positions: number[]): number {
  const idx = positions.indexOf(displayPos)
  if (idx >= 0) return idx
  // Snap to nearest digit position
  for (let i = 0; i < positions.length; i++) {
    if (positions[i] >= displayPos) return i
  }
  return positions.length - 1
}

function buildDisplay(digits: string[], template: string, positions: number[]): string {
  const chars = template.split('')
  for (let i = 0; i < positions.length; i++) {
    chars[positions[i]] = digits[i] || '_'
  }
  return chars.join('')
}

function isoDateToDigits(iso: string): string[] {
  if (!iso || iso.length < 10) return Array(8).fill('')
  const [yyyy, mm, dd] = iso.split('-')
  return [...dd, ...mm, ...yyyy]
}

function digitsToISODate(digits: string[]): string {
  if (digits.some((d) => !d)) return ''
  const dd = digits[0] + digits[1]
  const mm = digits[2] + digits[3]
  const yyyy = digits[4] + digits[5] + digits[6] + digits[7]
  return `${yyyy}-${mm}-${dd}`
}

function isoTimeToDigits(iso: string): string[] {
  if (!iso || iso.length < 5) return Array(4).fill('')
  return [...iso.replace(':', '')]
}

function digitsToISOTime(digits: string[]): string {
  if (digits.some((d) => !d)) return ''
  return `${digits[0]}${digits[1]}:${digits[2]}${digits[3]}`
}

// ── Masked Input Component ──

function MaskedField({
  digits,
  onDigitsChange,
  template,
  digitPositions,
  numDigits,
  label,
}: {
  digits: string[]
  onDigitsChange: (digits: string[]) => void
  template: string
  digitPositions: number[]
  numDigits: number
  label: string
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [cursorDigitIdx, setCursorDigitIdx] = useState(0)

  const syncCursor = useCallback(() => {
    const el = inputRef.current
    if (!el) return
    const displayPos = digitIndexToDisplayPos(cursorDigitIdx, digitPositions)
    requestAnimationFrame(() => {
      el.setSelectionRange(displayPos, displayPos + 1)
    })
  }, [cursorDigitIdx, digitPositions])

  useEffect(() => {
    syncCursor()
  }, [cursorDigitIdx, digits, syncCursor])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Tab' || e.key === 'Enter') return // let browser handle

    e.preventDefault()

    if (e.key === 'Backspace') {
      if (digits[cursorDigitIdx]) {
        // Clear current digit
        const next = [...digits]
        next[cursorDigitIdx] = ''
        onDigitsChange(next)
      } else if (cursorDigitIdx > 0) {
        // Move back and clear
        const prev = cursorDigitIdx - 1
        const next = [...digits]
        next[prev] = ''
        onDigitsChange(next)
        setCursorDigitIdx(prev)
      }
      return
    }

    if (e.key === 'Delete') {
      // Clear current digit
      const next = [...digits]
      next[cursorDigitIdx] = ''
      onDigitsChange(next)
      return
    }

    if (e.key === 'ArrowLeft') {
      setCursorDigitIdx(Math.max(0, cursorDigitIdx - 1))
      return
    }

    if (e.key === 'ArrowRight') {
      setCursorDigitIdx(Math.min(numDigits - 1, cursorDigitIdx + 1))
      return
    }

    // Digit input
    if (/^[0-9]$/.test(e.key)) {
      const digit = e.key
      const next = [...digits]

      // Auto-prefix with 0 for date DD (pos 0) and MM (pos 2) and time HH (pos 0)
      if (numDigits === 8) {
        // Date: DD/MM/YYYY
        if (cursorDigitIdx === 0 && parseInt(digit) > 3) {
          // Day > 3 → auto "0X"
          next[0] = '0'
          next[1] = digit
          onDigitsChange(next)
          setCursorDigitIdx(2)
          return
        }
        if (cursorDigitIdx === 2 && parseInt(digit) > 1) {
          // Month > 1 → auto "0X"
          next[2] = '0'
          next[3] = digit
          onDigitsChange(next)
          setCursorDigitIdx(4)
          return
        }
      }
      if (numDigits === 4) {
        // Time: HH:MM
        if (cursorDigitIdx === 0 && parseInt(digit) > 2) {
          // Hour > 2 → auto "0X"
          next[0] = '0'
          next[1] = digit
          onDigitsChange(next)
          setCursorDigitIdx(2)
          return
        }
        if (cursorDigitIdx === 2 && parseInt(digit) > 5) {
          // Minutes tens > 5 → auto "0X"
          next[2] = '0'
          next[3] = digit
          onDigitsChange(next)
          setCursorDigitIdx(Math.min(numDigits - 1, 3))
          return
        }
      }

      next[cursorDigitIdx] = digit
      onDigitsChange(next)
      // Advance cursor
      if (cursorDigitIdx < numDigits - 1) {
        setCursorDigitIdx(cursorDigitIdx + 1)
      }
    }
  }

  const handleClick = () => {
    const el = inputRef.current
    if (!el) return
    const pos = el.selectionStart ?? 0
    const digitIdx = displayPosToDigitIndex(pos, digitPositions)
    setCursorDigitIdx(digitIdx)
  }

  const handleFocus = () => {
    // Find first empty digit, or start at 0
    const firstEmpty = digits.findIndex((d) => !d)
    setCursorDigitIdx(firstEmpty >= 0 ? firstEmpty : 0)
  }

  const display = buildDisplay(digits, template, digitPositions)

  return (
    <div>
      <label className="block text-sm font-medium text-slate-300 mb-1">{label}</label>
      <input
        ref={inputRef}
        type="text"
        inputMode="numeric"
        value={display}
        onKeyDown={handleKeyDown}
        onClick={handleClick}
        onFocus={handleFocus}
        onChange={() => {}}
        className={inputClass}
      />
    </div>
  )
}

// ── Exported Component ──

export function DateTimeInput({ date, time, onDateChange, onTimeChange, className }: Props) {
  const [dateDigits, setDateDigits] = useState<string[]>(() => isoDateToDigits(date))
  const [timeDigits, setTimeDigits] = useState<string[]>(() => isoTimeToDigits(time))

  // Sync from parent on external change
  useEffect(() => {
    const parentDigits = isoDateToDigits(date)
    if (parentDigits.join('') && parentDigits.join('') !== dateDigits.join('')) {
      setDateDigits(parentDigits)
    }
  }, [date])

  useEffect(() => {
    const parentDigits = isoTimeToDigits(time)
    if (parentDigits.join('') && parentDigits.join('') !== timeDigits.join('')) {
      setTimeDigits(parentDigits)
    }
  }, [time])

  const handleDateDigits = (digits: string[]) => {
    setDateDigits(digits)
    const iso = digitsToISODate(digits)
    onDateChange(iso)
  }

  const handleTimeDigits = (digits: string[]) => {
    setTimeDigits(digits)
    const iso = digitsToISOTime(digits)
    onTimeChange(iso)
  }

  return (
    <div className={`grid grid-cols-2 gap-2 ${className || ''}`}>
      <MaskedField
        digits={dateDigits}
        onDigitsChange={handleDateDigits}
        template={DATE_TEMPLATE}
        digitPositions={DATE_DIGIT_POSITIONS}
        numDigits={8}
        label="Data partenza"
      />
      <MaskedField
        digits={timeDigits}
        onDigitsChange={handleTimeDigits}
        template={TIME_TEMPLATE}
        digitPositions={TIME_DIGIT_POSITIONS}
        numDigits={4}
        label="Ora partenza"
      />
    </div>
  )
}
