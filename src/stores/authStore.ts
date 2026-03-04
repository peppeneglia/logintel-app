import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import * as authService from '../services/auth'
import type { Database } from '../types/database'

type Profile = Database['public']['Tables']['profiles']['Row']

interface AuthState {
  user: { id: string; email: string } | null
  profile: Profile | null
  loading: boolean
  initialized: boolean

  initialize: () => Promise<void>
  fetchProfile: (userId: string) => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signUp: (data: authService.SignUpData) => Promise<{ needsConfirmation: boolean }>
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  updateProfile: (data: Partial<Profile>) => Promise<void>
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  profile: null,
  loading: true,
  initialized: false,

  initialize: async () => {
    try {
      const session = await authService.getSession()

      if (session?.user) {
        set({
          user: { id: session.user.id, email: session.user.email || '' },
        })
        await get().fetchProfile(session.user.id)
      }
    } catch {
      // Session non valida o Supabase non configurato
    } finally {
      set({ loading: false, initialized: true })
    }

    // Ascolta cambi di stato auth
    supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        set({
          user: { id: session.user.id, email: session.user.email || '' },
        })
        await get().fetchProfile(session.user.id)
      } else if (event === 'SIGNED_OUT') {
        set({ user: null, profile: null })
      }
    })
  },

  fetchProfile: async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (!error && data) {
      set({ profile: data as Profile })
    }
  },

  signIn: async (email: string, password: string) => {
    set({ loading: true })
    try {
      const { user } = await authService.signIn(email, password)
      if (user) {
        set({ user: { id: user.id, email: user.email || '' } })
        await get().fetchProfile(user.id)
      }
    } finally {
      set({ loading: false })
    }
  },

  signUp: async (data: authService.SignUpData) => {
    set({ loading: true })
    try {
      const result = await authService.signUp(data)
      // Se l'email confirmation è abilitata, l'utente deve confermare
      const needsConfirmation = !result.session
      if (result.user && result.session) {
        set({ user: { id: result.user.id, email: result.user.email || '' } })
        await get().fetchProfile(result.user.id)
      }
      return { needsConfirmation }
    } finally {
      set({ loading: false })
    }
  },

  signInWithGoogle: async () => {
    await authService.signInWithGoogle()
    // Il redirect OAuth gestisce il resto
  },

  signOut: async () => {
    await authService.signOut()
    set({ user: null, profile: null })
  },

  resetPassword: async (email: string) => {
    await authService.resetPassword(email)
  },

  updateProfile: async (data: Partial<Profile>) => {
    const userId = get().user?.id
    if (!userId) return

    const { data: updated, error } = await supabase
      .from('profiles')
      .update(data)
      .eq('id', userId)
      .select()
      .single()

    if (!error && updated) {
      set({ profile: updated as Profile })
    }
  },
}))
