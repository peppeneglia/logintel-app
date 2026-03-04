import { supabase } from '../lib/supabase'
import type { Database } from '../types/database'

type Profile = Database['public']['Tables']['profiles']['Row']
type ProfileUpdate = Database['public']['Tables']['profiles']['Update']

export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) {
    console.error('Errore caricamento profilo:', error.message)
    return null
  }
  return data as Profile
}

export async function updateProfile(userId: string, updates: ProfileUpdate): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single()

  if (error) throw error
  return data as Profile
}

export async function decrementCredits(userId: string, amount: number = 1): Promise<void> {
  const profile = await getProfile(userId)
  if (profile) {
    await updateProfile(userId, {
      credits_used: profile.credits_used + amount,
    })
  }
}
