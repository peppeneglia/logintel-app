import { supabase } from '../lib/supabase'
import { showErrorToast } from '../hooks/useToast'

// ── Types ──

export interface VehicleRow {
  id: string
  user_id: string
  plate: string
  brand: string
  model: string
  year: number
  euro_class: string
  total_km: number
  monthly_km: number
  fuel_consumption_per_100km: number
  status: string
  driver: string | null
  notes: string | null
  created_at: string
}

export type VehicleInput = Omit<VehicleRow, 'id' | 'created_at'>

export interface MaintenanceAlertRow {
  id: string
  user_id: string
  vehicle_id: string
  type: string
  description: string | null
  urgency: string
  km_threshold: number | null
  due_date: string | null
  resolved: boolean
  created_at: string
}

export type MaintenanceAlertInput = Omit<MaintenanceAlertRow, 'id' | 'created_at'>

export interface VehicleAllocationRow {
  id: string
  user_id: string
  vehicle_id: string
  driver: string
  route: string
  start_date: string
  end_date: string | null
  status: string
  created_at: string
}

export type VehicleAllocationInput = Omit<VehicleAllocationRow, 'id' | 'created_at'>

export interface OperationalCostRow {
  id: string
  user_id: string
  vehicle_id: string
  month: number
  year: number
  fuel_cost: number
  maintenance_cost: number
  toll_cost: number
  driver_cost: number
  total_km: number
  created_at: string
}

export type OperationalCostInput = Omit<OperationalCostRow, 'id' | 'created_at'>

export interface DocumentExpiryRow {
  id: string
  user_id: string
  vehicle_id: string
  document_type: string
  document_number: string | null
  expiry_date: string
  status: string
  created_at: string
}

export type DocumentExpiryInput = Omit<DocumentExpiryRow, 'id' | 'created_at'>

// ── Vehicles ──

export async function getVehicles(userId: string): Promise<VehicleRow[]> {
  const { data, error } = await supabase
    .from('fleet_vehicles')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  if (error) {
    showErrorToast('Errore nel caricamento dei dati. Riprova.')
    console.error('getVehicles:', error.message)
    return []
  }
  return (data || []) as VehicleRow[]
}

export async function addVehicle(data: VehicleInput): Promise<VehicleRow | null> {
  const { data: row, error } = await supabase
    .from('fleet_vehicles')
    .insert(data)
    .select()
    .single()
  if (error) {
    showErrorToast('Errore nel salvataggio. Riprova.')
    throw error
  }
  return row as VehicleRow
}

export async function updateVehicle(id: string, data: Partial<VehicleInput>): Promise<VehicleRow | null> {
  const { data: row, error } = await supabase
    .from('fleet_vehicles')
    .update(data)
    .eq('id', id)
    .select()
    .single()
  if (error) {
    showErrorToast('Errore nell\'aggiornamento. Riprova.')
    throw error
  }
  return row as VehicleRow
}

export async function deleteVehicle(id: string): Promise<void> {
  const { error } = await supabase.from('fleet_vehicles').delete().eq('id', id)
  if (error) {
    showErrorToast('Errore nell\'eliminazione. Riprova.')
    throw error
  }
}

// ── Maintenance Alerts ──

export async function getMaintenanceAlerts(userId: string): Promise<MaintenanceAlertRow[]> {
  const { data, error } = await supabase
    .from('maintenance_alerts')
    .select('*')
    .eq('user_id', userId)
    .order('due_date', { ascending: true })
  if (error) {
    showErrorToast('Errore nel caricamento dei dati. Riprova.')
    console.error('getMaintenanceAlerts:', error.message)
    return []
  }
  return (data || []) as MaintenanceAlertRow[]
}

export async function addMaintenanceAlert(data: MaintenanceAlertInput): Promise<MaintenanceAlertRow | null> {
  const { data: row, error } = await supabase
    .from('maintenance_alerts')
    .insert(data)
    .select()
    .single()
  if (error) {
    showErrorToast('Errore nel salvataggio. Riprova.')
    throw error
  }
  return row as MaintenanceAlertRow
}

export async function updateMaintenanceAlert(id: string, data: Partial<MaintenanceAlertInput>): Promise<MaintenanceAlertRow | null> {
  const { data: row, error } = await supabase
    .from('maintenance_alerts')
    .update(data)
    .eq('id', id)
    .select()
    .single()
  if (error) {
    showErrorToast('Errore nell\'aggiornamento. Riprova.')
    throw error
  }
  return row as MaintenanceAlertRow
}

export async function deleteMaintenanceAlert(id: string): Promise<void> {
  const { error } = await supabase.from('maintenance_alerts').delete().eq('id', id)
  if (error) {
    showErrorToast('Errore nell\'eliminazione. Riprova.')
    throw error
  }
}

// ── Vehicle Allocations ──

export async function getVehicleAllocations(userId: string): Promise<VehicleAllocationRow[]> {
  const { data, error } = await supabase
    .from('vehicle_allocations')
    .select('*')
    .eq('user_id', userId)
    .order('start_date', { ascending: false })
  if (error) {
    showErrorToast('Errore nel caricamento dei dati. Riprova.')
    console.error('getVehicleAllocations:', error.message)
    return []
  }
  return (data || []) as VehicleAllocationRow[]
}

export async function addVehicleAllocation(data: VehicleAllocationInput): Promise<VehicleAllocationRow | null> {
  const { data: row, error } = await supabase
    .from('vehicle_allocations')
    .insert(data)
    .select()
    .single()
  if (error) {
    showErrorToast('Errore nel salvataggio. Riprova.')
    throw error
  }
  return row as VehicleAllocationRow
}

export async function updateVehicleAllocation(id: string, data: Partial<VehicleAllocationInput>): Promise<VehicleAllocationRow | null> {
  const { data: row, error } = await supabase
    .from('vehicle_allocations')
    .update(data)
    .eq('id', id)
    .select()
    .single()
  if (error) {
    showErrorToast('Errore nell\'aggiornamento. Riprova.')
    throw error
  }
  return row as VehicleAllocationRow
}

export async function deleteVehicleAllocation(id: string): Promise<void> {
  const { error } = await supabase.from('vehicle_allocations').delete().eq('id', id)
  if (error) {
    showErrorToast('Errore nell\'eliminazione. Riprova.')
    throw error
  }
}

// ── Operational Costs ──

export async function getOperationalCosts(userId: string): Promise<OperationalCostRow[]> {
  const { data, error } = await supabase
    .from('operational_costs')
    .select('*')
    .eq('user_id', userId)
    .order('year', { ascending: false })
  if (error) {
    showErrorToast('Errore nel caricamento dei dati. Riprova.')
    console.error('getOperationalCosts:', error.message)
    return []
  }
  return (data || []) as OperationalCostRow[]
}

export async function addOperationalCost(data: OperationalCostInput): Promise<OperationalCostRow | null> {
  const { data: row, error } = await supabase
    .from('operational_costs')
    .insert(data)
    .select()
    .single()
  if (error) {
    showErrorToast('Errore nel salvataggio. Riprova.')
    throw error
  }
  return row as OperationalCostRow
}

export async function updateOperationalCost(id: string, data: Partial<OperationalCostInput>): Promise<OperationalCostRow | null> {
  const { data: row, error } = await supabase
    .from('operational_costs')
    .update(data)
    .eq('id', id)
    .select()
    .single()
  if (error) {
    showErrorToast('Errore nell\'aggiornamento. Riprova.')
    throw error
  }
  return row as OperationalCostRow
}

export async function deleteOperationalCost(id: string): Promise<void> {
  const { error } = await supabase.from('operational_costs').delete().eq('id', id)
  if (error) {
    showErrorToast('Errore nell\'eliminazione. Riprova.')
    throw error
  }
}

// ── Document Expiries ──

export async function getDocumentExpiries(userId: string): Promise<DocumentExpiryRow[]> {
  const { data, error } = await supabase
    .from('document_expiries')
    .select('*')
    .eq('user_id', userId)
    .order('expiry_date', { ascending: true })
  if (error) {
    showErrorToast('Errore nel caricamento dei dati. Riprova.')
    console.error('getDocumentExpiries:', error.message)
    return []
  }
  return (data || []) as DocumentExpiryRow[]
}

export async function addDocumentExpiry(data: DocumentExpiryInput): Promise<DocumentExpiryRow | null> {
  const { data: row, error } = await supabase
    .from('document_expiries')
    .insert(data)
    .select()
    .single()
  if (error) {
    showErrorToast('Errore nel salvataggio. Riprova.')
    throw error
  }
  return row as DocumentExpiryRow
}

export async function updateDocumentExpiry(id: string, data: Partial<DocumentExpiryInput>): Promise<DocumentExpiryRow | null> {
  const { data: row, error } = await supabase
    .from('document_expiries')
    .update(data)
    .eq('id', id)
    .select()
    .single()
  if (error) {
    showErrorToast('Errore nell\'aggiornamento. Riprova.')
    throw error
  }
  return row as DocumentExpiryRow
}

export async function deleteDocumentExpiry(id: string): Promise<void> {
  const { error } = await supabase.from('document_expiries').delete().eq('id', id)
  if (error) {
    showErrorToast('Errore nell\'eliminazione. Riprova.')
    throw error
  }
}
