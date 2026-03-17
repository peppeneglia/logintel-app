import { supabase } from '../lib/supabase'

// ── Types ──

export interface EmissionsRecordRow {
  id: string
  user_id: string
  vehicle_id: string | null
  route: string
  km: number
  euro_class: string
  co2_kg: number
  date: string
  created_at: string
}

export type EmissionsRecordInput = Omit<EmissionsRecordRow, 'id' | 'created_at'>

// ── EEA 2024 emission factors (g CO2/km) ──

export const CO2_FACTORS: Record<string, number> = {
  'Euro 6E': 690,
  'Euro 6D': 710,
  'Euro 6C': 740,
  'Euro 6B': 780,
  'Euro 5': 850,
  'Euro 4': 920,
}

export function computeEmissions(km: number, euroClass: string): number {
  const factor = CO2_FACTORS[euroClass] || 780
  return Math.round((km * factor) / 1000 * 100) / 100
}

export function carbonScore(co2PerKm: number): 'A' | 'B' | 'C' | 'D' {
  if (co2PerKm < 700) return 'A'
  if (co2PerKm < 750) return 'B'
  if (co2PerKm < 800) return 'C'
  return 'D'
}

// ── Emissions Records ──

export async function getEmissionsRecords(userId: string): Promise<EmissionsRecordRow[]> {
  const { data, error } = await supabase
    .from('emissions_records')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false })
  if (error) { console.error('getEmissionsRecords:', error.message); return [] }
  return (data || []) as EmissionsRecordRow[]
}

export async function addEmissionsRecord(data: EmissionsRecordInput): Promise<EmissionsRecordRow | null> {
  const { data: row, error } = await supabase
    .from('emissions_records')
    .insert(data)
    .select()
    .single()
  if (error) throw error
  return row as EmissionsRecordRow
}

export async function updateEmissionsRecord(id: string, data: Partial<EmissionsRecordInput>): Promise<EmissionsRecordRow | null> {
  const { data: row, error } = await supabase
    .from('emissions_records')
    .update(data)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return row as EmissionsRecordRow
}

export async function deleteEmissionsRecord(id: string): Promise<void> {
  const { error } = await supabase.from('emissions_records').delete().eq('id', id)
  if (error) throw error
}
