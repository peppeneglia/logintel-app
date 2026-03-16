import { useState, useRef, useEffect, useCallback } from 'react'

export interface CitySelection {
  name: string
  lat: number
  lon: number
}

interface NominatimResult {
  display_name: string
  lat: string
  lon: string
  address?: {
    city?: string
    town?: string
    village?: string
    municipality?: string
    county?: string
    state?: string
    country?: string
  }
}

interface Props {
  value: string
  onChange: (value: string, coords: CitySelection | null) => void
  placeholder?: string
  className?: string
}

export function CityAutocomplete({ value, onChange, placeholder, className }: Props) {
  const [suggestions, setSuggestions] = useState<NominatimResult[]>([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const abortRef = useRef<AbortController | null>(null)

  const fetchSuggestions = useCallback(async (query: string) => {
    if (query.trim().length < 2) {
      setSuggestions([])
      setOpen(false)
      return
    }

    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    setLoading(true)
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5&featuretype=city&addressdetails=1`,
        {
          headers: { 'User-Agent': 'Logintel/1.0' },
          signal: controller.signal,
        }
      )
      if (!res.ok) return
      const data: NominatimResult[] = await res.json()
      setSuggestions(data)
      setOpen(data.length > 0)
    } catch {
      // abort or network error — ignore
    } finally {
      setLoading(false)
    }
  }, [])

  const handleInput = (text: string) => {
    onChange(text, null)

    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => fetchSuggestions(text), 300)
  }

  const handleSelect = (item: NominatimResult) => {
    const cityName = item.address?.city || item.address?.town || item.address?.village || item.address?.municipality || item.display_name.split(',')[0]
    const country = item.address?.country || ''
    const label = country ? `${cityName}, ${country}` : cityName

    onChange(label, {
      name: label,
      lat: parseFloat(item.lat),
      lon: parseFloat(item.lon),
    })
    setSuggestions([])
    setOpen(false)
  }

  const formatLabel = (item: NominatimResult): string => {
    const city = item.address?.city || item.address?.town || item.address?.village || item.address?.municipality || item.display_name.split(',')[0]
    const state = item.address?.state || ''
    const country = item.address?.country || ''
    const parts = [city, state, country].filter(Boolean)
    return parts.join(', ')
  }

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Cleanup
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
      abortRef.current?.abort()
    }
  }, [])

  return (
    <div ref={wrapperRef} className="relative">
      <input
        type="text"
        value={value}
        onChange={(e) => handleInput(e.target.value)}
        onFocus={() => { if (suggestions.length > 0) setOpen(true) }}
        placeholder={placeholder}
        className={className}
      />
      {loading && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          <div className="animate-spin w-3.5 h-3.5 border-2 border-slate-500 border-t-transparent rounded-full" />
        </div>
      )}
      {open && suggestions.length > 0 && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-[#1e293b] border border-[#334155] rounded-xl shadow-xl overflow-hidden">
          {suggestions.map((item, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSelect(item)}
              className="w-full text-left px-3 py-2.5 text-sm text-slate-300 hover:bg-[#334155] hover:text-white transition-colors border-b border-[#334155] last:border-b-0"
            >
              {formatLabel(item)}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
