export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          first_name: string
          last_name: string
          email: string
          company: string | null
          role: string | null
          fleet_size: number
          plan: 'free' | 'starter' | 'pro' | 'enterprise'
          credits_used: number
          credits_total: number
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          first_name: string
          last_name: string
          email: string
          company?: string | null
          role?: string | null
          fleet_size?: number
          plan?: 'free' | 'starter' | 'pro' | 'enterprise'
          credits_used?: number
          credits_total?: number
          avatar_url?: string | null
        }
        Update: {
          first_name?: string
          last_name?: string
          email?: string
          company?: string | null
          role?: string | null
          fleet_size?: number
          plan?: 'free' | 'starter' | 'pro' | 'enterprise'
          credits_used?: number
          credits_total?: number
          avatar_url?: string | null
        }
        Relationships: []
      }
      user_settings: {
        Row: {
          id: string
          user_id: string
          language: string
          timezone: string
          date_format: string
          unit_system: string
          currency: string
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          language?: string
          timezone?: string
          date_format?: string
          unit_system?: string
          currency?: string
        }
        Update: {
          language?: string
          timezone?: string
          date_format?: string
          unit_system?: string
          currency?: string
        }
        Relationships: []
      }
      conversations: {
        Row: {
          id: string
          user_id: string
          title: string
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          title?: string
        }
        Update: {
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          id: string
          conversation_id: string
          role: 'user' | 'assistant'
          content: string
          prediction_json: Record<string, unknown> | null
          created_at: string
        }
        Insert: {
          conversation_id: string
          role: 'user' | 'assistant'
          content: string
          prediction_json?: Record<string, unknown> | null
        }
        Update: {
          content?: string
          prediction_json?: Record<string, unknown> | null
        }
        Relationships: []
      }
      predictions: {
        Row: {
          id: string
          user_id: string
          origin: string
          destination: string
          departure_time: string
          result_json: Record<string, unknown>
          credits_used: number
          feedback_delay: number | null
          feedback_given: boolean
          created_at: string
        }
        Insert: {
          user_id: string
          origin: string
          destination: string
          departure_time: string
          result_json: Record<string, unknown>
          credits_used?: number
          feedback_delay?: number | null
          feedback_given?: boolean
        }
        Update: {
          feedback_delay?: number | null
          feedback_given?: boolean
        }
        Relationships: []
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          type: 'maintenance' | 'compliance' | 'delivery' | 'system' | 'weather'
          title: string
          description: string
          priority: 'low' | 'medium' | 'high'
          read: boolean
          created_at: string
        }
        Insert: {
          user_id: string
          type: 'maintenance' | 'compliance' | 'delivery' | 'system' | 'weather'
          title: string
          description: string
          priority?: 'low' | 'medium' | 'high'
          read?: boolean
        }
        Update: {
          read?: boolean
        }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
