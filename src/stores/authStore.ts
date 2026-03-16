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
  isDemo: boolean

  initialize: () => Promise<{ unsubscribe: () => void } | undefined>
  setDemo: () => void
  setBypass: () => void
  fetchProfile: (userId: string) => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signUp: (data: authService.SignUpData) => Promise<{ needsConfirmation: boolean }>
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  updateProfile: (data: Partial<Profile>) => Promise<void>
  deleteAccount: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  profile: null,
  loading: true,
  initialized: false,
  isDemo: false,

  setBypass: () => {
    set({
      isDemo: false,
      user: { id: 'bypass-user', email: 'utente@logintel.it' },
      profile: {
        id: 'bypass-user',
        first_name: 'Utente',
        last_name: 'Logintel',
        email: 'utente@logintel.it',
        company: 'Logintel',
        role: 'Fleet Manager',
        fleet_size: 24,
        plan: 'pro',
        credits_used: 0,
        credits_total: 1000,
        avatar_url: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      } as Profile,
      loading: false,
      initialized: true,
    })
  },

  setDemo: () => {
    set({
      isDemo: true,
      user: { id: 'demo-user', email: 'demo@logintel.it' },
      profile: {
        id: 'demo-user',
        first_name: 'Utente',
        last_name: 'Demo',
        email: 'demo@logintel.it',
        company: 'Demo S.r.l.',
        role: 'Fleet Manager',
        fleet_size: 24,
        plan: 'free',
        credits_used: 58,
        credits_total: 200,
        avatar_url: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      } as Profile,
      loading: false,
      initialized: true,
    })
  },

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
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        set({
          user: { id: session.user.id, email: session.user.email || '' },
        })
        await get().fetchProfile(session.user.id)
      } else if (event === 'SIGNED_OUT') {
        set({ user: null, profile: null })
      }
    })

    return subscription
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
      const confirmed = result.user?.email_confirmed_at != null
      if (result.user && result.session && confirmed) {
        set({ user: { id: result.user.id, email: result.user.email || '' } })
        await get().fetchProfile(result.user.id)
      }
      return { needsConfirmation: !confirmed }
    } finally {
      set({ loading: false })
    }
  },

  signInWithGoogle: async () => {
    await authService.signInWithGoogle()
  },

  signOut: async () => {
    const { isDemo } = get()
    if (!isDemo) {
      await authService.signOut()
    }
    set({ user: null, profile: null, isDemo: false })
  },

  resetPassword: async (email: string) => {
    await authService.resetPassword(email)
  },

  updateProfile: async (data: Partial<Profile>) => {
    const { isDemo } = get()
    if (isDemo) {
      // In demo mode, aggiorna solo lo stato locale
      const current = get().profile
      if (current) {
        set({ profile: { ...current, ...data } as Profile })
      }
      return
    }

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

  deleteAccount: async () => {
    const { isDemo } = get()
    if (isDemo) return

    await authService.deleteAccount()
    set({ user: null, profile: null, isDemo: false })
  },
}))
