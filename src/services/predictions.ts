import { supabase } from '../lib/supabase'
import type { Database } from '../types/database'

type Prediction = Database['public']['Tables']['predictions']['Row']

export async function getPredictionHistory(userId: string, limit = 20): Promise<Prediction[]> {
  const { data, error } = await supabase
    .from('predictions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Errore caricamento predizioni:', error.message)
    return []
  }
  return (data || []) as Prediction[]
}

export async function savePrediction(
  userId: string,
  origin: string,
  destination: string,
  departureTime: string,
  resultJson: Record<string, unknown>,
  creditsCost = 50
): Promise<Prediction | null> {
  const { data, error } = await supabase
    .from('predictions')
    .insert({
      user_id: userId,
      origin,
      destination,
      departure_time: departureTime,
      result_json: resultJson,
      credits_cost: creditsCost,
    })
    .select()
    .single()

  if (error) throw error
  return data as Prediction
}

export async function submitFeedback(
  predictionId: string,
  actualDelay: number
): Promise<void> {
  const { error } = await supabase
    .from('predictions')
    .update({
      feedback_delay: actualDelay,
      feedback_given: true,
    })
    .eq('id', predictionId)

  if (error) throw error
}
