import { supabase } from '../lib/supabase'
import type { Database } from '../types/database'

type UserSettings = Database['public']['Tables']['user_settings']['Row']
type UserSettingsUpdate = Database['public']['Tables']['user_settings']['Update']

export async function getSettings(userId: string): Promise<UserSettings | null> {
  const { data, error } = await supabase
    .from('user_settings')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error) {
    console.error('Errore caricamento impostazioni:', error.message)
    return null
  }
  return data as UserSettings
}

export async function updateSettings(userId: string, updates: UserSettingsUpdate): Promise<UserSettings | null> {
  const { data, error } = await supabase
    .from('user_settings')
    .update(updates)
    .eq('user_id', userId)
    .select()
    .single()

  if (error) throw error
  return data as UserSettings
}

export async function ensureSettings(userId: string): Promise<UserSettings | null> {
  const existing = await getSettings(userId)
  if (existing) return existing

  const { data, error } = await supabase
    .from('user_settings')
    .insert({ user_id: userId })
    .select()
    .single()

  if (error) {
    console.error('Errore creazione impostazioni:', error.message)
    return null
  }
  return data as UserSettings
}
