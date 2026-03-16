interface Coordinates {
  lat: number
  lon: number
}

const cache = new Map<string, Coordinates>()

export async function geocode(city: string): Promise<Coordinates> {
  const key = city.toLowerCase().trim()
  if (cache.has(key)) return cache.get(key)!

  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(city)},Italia&format=json&limit=1`,
    { headers: { 'User-Agent': 'Logintel/1.0' } }
  )

  if (!res.ok) throw new Error(`Geocoding fallito per "${city}"`)

  const data = await res.json()
  if (!data.length) throw new Error(`Città non trovata: "${city}"`)

  const coords: Coordinates = {
    lat: parseFloat(data[0].lat),
    lon: parseFloat(data[0].lon),
  }
  cache.set(key, coords)
  return coords
}
