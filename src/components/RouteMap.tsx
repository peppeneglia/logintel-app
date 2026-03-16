import { MapContainer, TileLayer, Polyline, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import type { Segment } from '../services/api'

const weatherEmoji: Record<string, string> = {
  rain: '\uD83C\uDF27\uFE0F',
  snow: '\u2744\uFE0F',
  fog: '\uD83C\uDF2B\uFE0F',
  wind: '\uD83D\uDCA8',
}

const roadTypeIT: Record<string, string> = {
  highway: 'Autostrada',
  state_road: 'Strada statale',
  provincial: 'Provinciale',
  mountain: 'Montagna',
}

function isNight(dateStr: string): boolean {
  const h = new Date(dateStr).getHours()
  return h < 6 || h >= 21
}

function makeIcon(emoji: string): L.DivIcon {
  return L.divIcon({
    html: `<span style="font-size:20px;line-height:1">${emoji}</span>`,
    className: '',
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  })
}

interface Props {
  segments: Segment[]
}

export function RouteMap({ segments }: Props) {
  if (segments.length === 0) return null

  const points: [number, number][] = segments.map((s) => [s.start_point.lat, s.start_point.lon])
  points.push([segments[segments.length - 1].end_point.lat, segments[segments.length - 1].end_point.lon])

  const bounds = L.latLngBounds(points.map((p) => L.latLng(p[0], p[1])))

  return (
    <div className="rounded-2xl overflow-hidden border border-[#334155]" style={{ height: 400 }}>
      <MapContainer
        bounds={bounds}
        boundsOptions={{ padding: [30, 30] }}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>'
        />

        {/* Polyline per segmento — verde = ok, rosso = ritardo */}
        {segments.map((seg, i) => (
          <Polyline
            key={i}
            positions={[
              [seg.start_point.lat, seg.start_point.lon],
              [seg.end_point.lat, seg.end_point.lon],
            ]}
            pathOptions={{
              color: seg.delay_minutes > 0 ? '#ef4444' : '#10b981',
              weight: 4,
              opacity: 0.8,
            }}
          />
        ))}

        {/* Marker meteo per ogni segmento */}
        {segments.map((seg, i) => {
          const emoji = seg.weather.length > 0
            ? (weatherEmoji[seg.weather[0].type] || '\u2600\uFE0F')
            : isNight(seg.estimated_arrival) ? '\uD83C\uDF19' : '\u2600\uFE0F'

          const road = roadTypeIT[seg.factors.road_type as string] || seg.factors.road_type || ''

          return (
            <Marker
              key={i}
              position={[seg.start_point.lat, seg.start_point.lon]}
              icon={makeIcon(emoji)}
            >
              <Popup>
                <div style={{ color: '#e2e8f0', background: '#1e293b', padding: '4px 8px', borderRadius: 8, fontSize: 12 }}>
                  <strong>Segmento {i + 1}</strong><br />
                  {road && <>{road} — </>}{seg.length_km.toFixed(1)} km<br />
                  Altitudine: {Math.round(seg.factors.altitude_m)} m<br />
                  {seg.delay_minutes > 0 && <span style={{ color: '#ef4444' }}>Ritardo: +{seg.delay_minutes.toFixed(1)} min</span>}
                  {seg.delay_minutes === 0 && <span style={{ color: '#10b981' }}>Nessun ritardo</span>}
                </div>
              </Popup>
            </Marker>
          )
        })}

        {/* Marker partenza e arrivo */}
        <Marker
          position={[segments[0].start_point.lat, segments[0].start_point.lon]}
          icon={makeIcon('\uD83D\uDFE2')}
        >
          <Popup><span style={{ color: '#e2e8f0', background: '#1e293b', padding: '4px 8px', borderRadius: 8, fontSize: 12 }}>Partenza</span></Popup>
        </Marker>
        <Marker
          position={[segments[segments.length - 1].end_point.lat, segments[segments.length - 1].end_point.lon]}
          icon={makeIcon('\uD83D\uDD34')}
        >
          <Popup><span style={{ color: '#e2e8f0', background: '#1e293b', padding: '4px 8px', borderRadius: 8, fontSize: 12 }}>Arrivo</span></Popup>
        </Marker>
      </MapContainer>
    </div>
  )
}
