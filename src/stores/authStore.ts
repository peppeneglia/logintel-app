import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import * as authService from '../services/auth'
import { resetDailyCreditsIfNeeded } from '../services/profiles'
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

  setDemo: () => {
    // Restore credits from sessionStorage if available (survives page reload)
    const savedCredits = sessionStorage.getItem('logintel-demo-credits')
    const creditsRemaining = savedCredits !== null ? parseInt(savedCredits, 10) : 442

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
        credits_remaining: creditsRemaining,
        credits_daily_limit: 500,
        credits_reset_at: new Date().toISOString(),
        extra_credits: 0,
        extra_credits_expire_at: null,
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
        // "Remember Me" check: if user logged in without "Ricordami",
        // sessionStorage flag was set. On cold start (browser reopened),
        // sessionStorage is cleared, so we check localStorage for the marker.
        const sessionOnly = localStorage.getItem('logintel-no-remember')
        if (sessionOnly && !sessionStorage.getItem('logintel-session-active')) {
          // Browser was closed and reopened without "Ricordami" — sign out
          localStorage.removeItem('logintel-no-remember')
          await supabase.auth.signOut()
          set({ loading: false, initialized: true })
          return undefined
        }
        // Mark this session as active (survives tab refresh, cleared on browser close)
        sessionStorage.setItem('logintel-session-active', '1')

        set({
          user: { id: session.user.id, email: session.user.email || '' },
        })
        await get().fetchProfile(session.user.id)
        // Reset daily credits non-blocking
        resetDailyCreditsIfNeeded(session.user.id)
          .then((updated) => { if (updated) get().fetchProfile(session.user.id) })
          .catch(() => { /* non-blocking */ })
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
        // Single fetchProfile — resetDailyCredits runs non-blocking after
        await get().fetchProfile(session.user.id)
        resetDailyCreditsIfNeeded(session.user.id)
          .then((updated) => { if (updated) get().fetchProfile(session.user.id) })
          .catch(() => { /* non-blocking */ })
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
