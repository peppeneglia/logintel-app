import { useState, useRef, useEffect } from 'react'
import { inputCls } from '../lib/formConstants'

// ── Field wrapper ──

export function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-300 mb-1">{label}</label>
      {children}
      {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
    </div>
  )
}

// ── Numeric input that handles "0" properly ──
// Uses text input internally, parses to number on blur/submit

interface NumericInputProps {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  maxLength?: number
  step?: number
  placeholder?: string
  required?: boolean
  className?: string
  integer?: boolean
}

export function NumericInput({
  value,
  onChange,
  min = 0,
  max,
  maxLength,
  step,
  placeholder,
  required,
  className,
  integer = false,
}: NumericInputProps) {
  const [text, setText] = useState(value === 0 ? '' : String(value))
  const lastValueRef = useRef(value)

  // Sync external value changes (e.g., form reset)
  useEffect(() => {
    if (value !== lastValueRef.current) {
      setText(value === 0 ? '' : String(value))
      lastValueRef.current = value
    }
  }, [value])

  function handleChange(raw: string) {
    // Enforce maxLength on the raw string
    if (maxLength && raw.length > maxLength) return

    // Allow empty
    if (raw === '') {
      setText('')
      onChange(0)
      lastValueRef.current = 0
      return
    }

    // Allow partial decimal input like "12."
    if (!integer && /^\d*\.?\d*$/.test(raw)) {
      setText(raw)
      const num = parseFloat(raw)
      if (!isNaN(num)) {
        const clamped = max !== undefined ? Math.min(num, max) : num
        onChange(clamped < min ? min : clamped)
        lastValueRef.current = clamped < min ? min : clamped
      }
      return
    }

    // Integer only
    if (integer && /^\d*$/.test(raw)) {
      setText(raw)
      const num = parseInt(raw, 10)
      if (!isNaN(num)) {
        const clamped = max !== undefined ? Math.min(num, max) : num
        onChange(clamped < min ? min : clamped)
        lastValueRef.current = clamped < min ? min : clamped
      }
    }
  }

  function handleBlur() {
    // Clean up display on blur
    if (text === '' || text === '.') {
      setText('')
      onChange(0)
      lastValueRef.current = 0
      return
    }
    const num = parseFloat(text)
    if (!isNaN(num)) {
      const display = integer ? String(Math.round(num)) : step && step < 1 ? num.toFixed(1) : String(num)
      setText(display)
    }
  }

  return (
    <input
      type="text"
      inputMode={integer ? 'numeric' : 'decimal'}
      value={text}
      onChange={(e) => handleChange(e.target.value)}
      onBlur={handleBlur}
      placeholder={placeholder || '0'}
      required={required}
      className={className || inputCls}
    />
  )
}

// ── Autocomplete input with suggestions dropdown ──
// Case-insensitive matching. User can type freely without selecting.

interface AutocompleteInputProps {
  value: string
  onChange: (value: string) => void
  options: string[]
  placeholder?: string
  required?: boolean
  className?: string
}

export function AutocompleteInput({
  value,
  onChange,
  options,
  placeholder,
  required,
  className,
}: AutocompleteInputProps) {
  const [open, setOpen] = useState(false)
  const [focused, setFocused] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)

  const filtered = value.trim()
    ? options.filter((opt) => opt.toLowerCase().includes(value.toLowerCase()) && opt.toLowerCase() !== value.toLowerCase())
    : options

  const showDropdown = focused && open && filtered.length > 0

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div ref={wrapperRef} className="relative">
      <input
        type="text"
        value={value}
        onChange={(e) => {
          onChange(e.target.value)
          setOpen(true)
        }}
        onFocus={() => {
          setFocused(true)
          setOpen(true)
        }}
        onBlur={() => setFocused(false)}
        placeholder={placeholder}
        required={required}
        className={className || inputCls}
      />
      {showDropdown && (
        <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-[#1e293b] border border-[#334155] rounded-xl shadow-lg max-h-40 overflow-y-auto">
          {filtered.map((opt) => (
            <button
              key={opt}
              type="button"
              onMouseDown={(e) => {
                e.preventDefault()
                onChange(opt)
                setOpen(false)
              }}
              className="w-full text-left px-3 py-2 text-sm text-slate-300 hover:bg-[#334155] hover:text-white transition-colors first:rounded-t-xl last:rounded-b-xl"
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
