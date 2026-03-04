import { supabase } from '../lib/supabase'
import type { Database } from '../types/database'

type Conversation = Database['public']['Tables']['conversations']['Row']
type Message = Database['public']['Tables']['messages']['Row']

export async function getConversations(userId: string): Promise<Conversation[]> {
  const { data, error } = await supabase
    .from('conversations')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })

  if (error) {
    console.error('Errore caricamento conversazioni:', error.message)
    return []
  }
  return (data || []) as Conversation[]
}

export async function createConversation(userId: string, title?: string): Promise<Conversation | null> {
  const { data, error } = await supabase
    .from('conversations')
    .insert({
      user_id: userId,
      title: title || 'Nuova conversazione',
    })
    .select()
    .single()

  if (error) throw error
  return data as Conversation
}

export async function updateConversationTitle(conversationId: string, title: string): Promise<void> {
  const { error } = await supabase
    .from('conversations')
    .update({ title, updated_at: new Date().toISOString() })
    .eq('id', conversationId)

  if (error) throw error
}

export async function deleteConversation(conversationId: string): Promise<void> {
  const { error } = await supabase
    .from('conversations')
    .delete()
    .eq('id', conversationId)

  if (error) throw error
}

export async function getMessages(conversationId: string): Promise<Message[]> {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Errore caricamento messaggi:', error.message)
    return []
  }
  return (data || []) as Message[]
}

export async function sendMessage(
  conversationId: string,
  role: 'user' | 'assistant',
  content: string,
  predictionJson?: Record<string, unknown>
): Promise<Message | null> {
  const { data, error } = await supabase
    .from('messages')
    .insert({
      conversation_id: conversationId,
      role,
      content,
      prediction_json: predictionJson || null,
    })
    .select()
    .single()

  if (error) throw error

  // Aggiorna updated_at della conversazione
  await supabase
    .from('conversations')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', conversationId)

  return data as Message
}
