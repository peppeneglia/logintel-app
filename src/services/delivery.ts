import { supabase } from '../lib/supabase'

// ── Types ──

export interface DeliveryRow {
  id: string
  user_id: string
  customer: string
  origin: string
  destination: string
  departure_date: string
  scheduled_delivery_date: string
  actual_delivery_date: string | null
  weight_kg: number | null
  status: string
  driver: string | null
  vehicle_id: string | null
  created_at: string
}

export type DeliveryInput = Omit<DeliveryRow, 'id' | 'created_at'>

export interface DeliveryWindowRow {
  id: string
  user_id: string
  delivery_id: string
  window_start: string
  window_end: string
  met: boolean
  notes: string | null
  created_at: string
}

export type DeliveryWindowInput = Omit<DeliveryWindowRow, 'id' | 'created_at'>

// ── Deliveries ──

export async function getDeliveries(userId: string): Promise<DeliveryRow[]> {
  const { data, error } = await supabase
    .from('deliveries')
    .select('*')
    .eq('user_id', userId)
    .order('departure_date', { ascending: false })
  if (error) { console.error('getDeliveries:', error.message); return [] }
  return (data || []) as DeliveryRow[]
}

export async function addDelivery(data: DeliveryInput): Promise<DeliveryRow | null> {
  const { data: row, error } = await supabase
    .from('deliveries')
    .insert(data)
    .select()
    .single()
  if (error) throw error
  return row as DeliveryRow
}

export async function updateDelivery(id: string, data: Partial<DeliveryInput>): Promise<DeliveryRow | null> {
  const { data: row, error } = await supabase
    .from('deliveries')
    .update(data)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return row as DeliveryRow
}

export async function deleteDelivery(id: string): Promise<void> {
  const { error } = await supabase.from('deliveries').delete().eq('id', id)
  if (error) throw error
}

// ── Delivery Windows ──

export async function getDeliveryWindows(deliveryId: string): Promise<DeliveryWindowRow[]> {
  const { data, error } = await supabase
    .from('delivery_windows')
    .select('*')
    .eq('delivery_id', deliveryId)
    .order('window_start', { ascending: true })
  if (error) { console.error('getDeliveryWindows:', error.message); return [] }
  return (data || []) as DeliveryWindowRow[]
}

export async function addDeliveryWindow(data: DeliveryWindowInput): Promise<DeliveryWindowRow | null> {
  const { data: row, error } = await supabase
    .from('delivery_windows')
    .insert(data)
    .select()
    .single()
  if (error) throw error
  return row as DeliveryWindowRow
}

export async function updateDeliveryWindow(id: string, data: Partial<DeliveryWindowInput>): Promise<DeliveryWindowRow | null> {
  const { data: row, error } = await supabase
    .from('delivery_windows')
    .update(data)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return row as DeliveryWindowRow
}

export async function deleteDeliveryWindow(id: string): Promise<void> {
  const { error } = await supabase.from('delivery_windows').delete().eq('id', id)
  if (error) throw error
}
