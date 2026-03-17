import { supabase } from '../lib/supabase'

// ── Types ──

export interface DrivingHoursRow {
  id: string
  user_id: string
  driver: string
  date: string
  driving_minutes: number
  break_minutes: number
  start_time: string
  end_time: string
  rest_minutes_after: number
  created_at: string
}

export type DrivingHoursInput = Omit<DrivingHoursRow, 'id' | 'created_at'>

export interface ComplianceDocumentRow {
  id: string
  user_id: string
  driver: string
  type: string
  document_number: string | null
  expiry_date: string
  status: string
  created_at: string
}

export type ComplianceDocumentInput = Omit<ComplianceDocumentRow, 'id' | 'created_at'>

export interface ADRShipmentRow {
  id: string
  user_id: string
  delivery_id: string | null
  adr_class: string
  cargo_description: string
  weight_kg: number
  driver: string
  date: string
  compliant: boolean
  created_at: string
}

export type ADRShipmentInput = Omit<ADRShipmentRow, 'id' | 'created_at'>

// ── EU Regulation EC 561/2006 constants ──

export const MAX_DAILY_DRIVING_MINUTES = 9 * 60
export const MAX_WEEKLY_DRIVING_MINUTES = 56 * 60
export const MAX_BIWEEKLY_DRIVING_MINUTES = 90 * 60
export const MIN_DAILY_REST_MINUTES = 9 * 60
export const WEEKLY_WARNING_MINUTES = 48 * 60

export function checkDrivingViolation(drivingMinutes: number, restMinutesAfter: number): 'ok' | 'warning' | 'violation' {
  if (drivingMinutes > MAX_DAILY_DRIVING_MINUTES) return 'violation'
  if (restMinutesAfter < MIN_DAILY_REST_MINUTES) return 'violation'
  if (drivingMinutes > WEEKLY_WARNING_MINUTES) return 'warning'
  return 'ok'
}

export function computeDocumentStatus(expiryDate: string): 'valid' | 'expiring' | 'expired' {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const expiry = new Date(expiryDate)
  expiry.setHours(0, 0, 0, 0)
  const diffDays = Math.floor((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  if (diffDays < 0) return 'expired'
  if (diffDays < 30) return 'expiring'
  return 'valid'
}

// ── Driving Hours ──

export async function getDrivingHours(userId: string): Promise<DrivingHoursRow[]> {
  const { data, error } = await supabase
    .from('driving_hours')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false })
  if (error) { console.error('getDrivingHours:', error.message); return [] }
  return (data || []) as DrivingHoursRow[]
}

export async function addDrivingHoursRecord(data: DrivingHoursInput): Promise<DrivingHoursRow | null> {
  const { data: row, error } = await supabase
    .from('driving_hours')
    .insert(data)
    .select()
    .single()
  if (error) throw error
  return row as DrivingHoursRow
}

export async function updateDrivingHoursRecord(id: string, data: Partial<DrivingHoursInput>): Promise<DrivingHoursRow | null> {
  const { data: row, error } = await supabase
    .from('driving_hours')
    .update(data)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return row as DrivingHoursRow
}

export async function deleteDrivingHoursRecord(id: string): Promise<void> {
  const { error } = await supabase.from('driving_hours').delete().eq('id', id)
  if (error) throw error
}

// ── Compliance Documents ──

export async function getComplianceDocuments(userId: string): Promise<ComplianceDocumentRow[]> {
  const { data, error } = await supabase
    .from('compliance_documents')
    .select('*')
    .eq('user_id', userId)
    .order('expiry_date', { ascending: true })
  if (error) { console.error('getComplianceDocuments:', error.message); return [] }
  return (data || []) as ComplianceDocumentRow[]
}

export async function addComplianceDocument(data: ComplianceDocumentInput): Promise<ComplianceDocumentRow | null> {
  const { data: row, error } = await supabase
    .from('compliance_documents')
    .insert(data)
    .select()
    .single()
  if (error) throw error
  return row as ComplianceDocumentRow
}

export async function updateComplianceDocument(id: string, data: Partial<ComplianceDocumentInput>): Promise<ComplianceDocumentRow | null> {
  const { data: row, error } = await supabase
    .from('compliance_documents')
    .update(data)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return row as ComplianceDocumentRow
}

export async function deleteComplianceDocument(id: string): Promise<void> {
  const { error } = await supabase.from('compliance_documents').delete().eq('id', id)
  if (error) throw error
}

// ── ADR Shipments ──

export async function getADRShipments(userId: string): Promise<ADRShipmentRow[]> {
  const { data, error } = await supabase
    .from('adr_shipments')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false })
  if (error) { console.error('getADRShipments:', error.message); return [] }
  return (data || []) as ADRShipmentRow[]
}

export async function addADRShipment(data: ADRShipmentInput): Promise<ADRShipmentRow | null> {
  const { data: row, error } = await supabase
    .from('adr_shipments')
    .insert(data)
    .select()
    .single()
  if (error) throw error
  return row as ADRShipmentRow
}

export async function updateADRShipment(id: string, data: Partial<ADRShipmentInput>): Promise<ADRShipmentRow | null> {
  const { data: row, error } = await supabase
    .from('adr_shipments')
    .update(data)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return row as ADRShipmentRow
}

export async function deleteADRShipment(id: string): Promise<void> {
  const { error } = await supabase.from('adr_shipments').delete().eq('id', id)
  if (error) throw error
}
