import { supabase } from '../lib/supabase'

// ── Types ──

export interface RouteMarginRow {
  id: string
  user_id: string
  route: string
  customer: string
  date: string
  km: number
  driving_hours: number
  revenue: number
  fuel_cost: number
  driver_cost: number
  fixed_cost: number
  tolls: number
  vehicle_id: string | null
  created_at: string
}

export type RouteMarginInput = Omit<RouteMarginRow, 'id' | 'created_at'>

// ── Computed fields (client-side) ──

export function computeMargin(r: RouteMarginRow) {
  const totalCost = r.fuel_cost + r.driver_cost + r.fixed_cost + r.tolls
  const marginEur = r.revenue - totalCost
  const marginPct = r.revenue > 0 ? (marginEur / r.revenue) * 100 : 0
  const signal: 'green' | 'yellow' | 'red' =
    marginPct > 18 ? 'green' : marginPct > 10 ? 'yellow' : 'red'
  return { totalCost, marginEur, marginPct, signal }
}

// ── Route Margins ──

export async function getRouteMargins(userId: string): Promise<RouteMarginRow[]> {
  const { data, error } = await supabase
    .from('route_margins')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false })
  if (error) { console.error('getRouteMargins:', error.message); return [] }
  return (data || []) as RouteMarginRow[]
}

export async function addRouteMargin(data: RouteMarginInput): Promise<RouteMarginRow | null> {
  const { data: row, error } = await supabase
    .from('route_margins')
    .insert(data)
    .select()
    .single()
  if (error) throw error
  return row as RouteMarginRow
}

export async function updateRouteMargin(id: string, data: Partial<RouteMarginInput>): Promise<RouteMarginRow | null> {
  const { data: row, error } = await supabase
    .from('route_margins')
    .update(data)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return row as RouteMarginRow
}

export async function deleteRouteMargin(id: string): Promise<void> {
  const { error } = await supabase.from('route_margins').delete().eq('id', id)
  if (error) throw error
}
