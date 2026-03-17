import { useCallback } from 'react'
import { useAuthStore } from '../stores/authStore'
import { consumeCredits, resetDailyCreditsIfNeeded } from '../services/profiles'
import type { Database } from '../types/database'

type Profile = Database['public']['Tables']['profiles']['Row']

function profileField<K extends keyof Profile>(profile: unknown, key: K, fallback: Profile[K]): Profile[K] {
  if (!profile || typeof profile !== 'object') return fallback
  const val = (profile as Record<string, unknown>)[key]
  return (val ?? fallback) as Profile[K]
}

export function useCredits() {
  const { profile, isDemo, user } = useAuthStore()

  const creditsRemaining = profileField(profile, 'credits_remaining', 500)
  const dailyLimit = profileField(profile, 'credits_daily_limit', 500)
  const extraCredits = profileField(profile, 'extra_credits', 0)
  const plan = profileField(profile, 'plan', 'free')
  const totalAvailable = creditsRemaining + extraCredits

  const canAfford = useCallback(
    (cost: number): boolean => {
      if (isDemo) return true
      return totalAvailable >= cost
    },
    [isDemo, totalAvailable]
  )

  const consume = useCallback(
    async (cost: number, actionType: string): Promise<boolean> => {
      // Update store directly for instant UI feedback (no Supabase round-trip)
      const newRemaining = Math.max(0, creditsRemaining - cost)
      const currentProfile = useAuthStore.getState().profile
      if (currentProfile) {
        useAuthStore.setState({
          profile: { ...currentProfile, credits_remaining: newRemaining } as Profile,
        })
      }

      // Persist demo credits to sessionStorage (survives page reload)
      if (isDemo) {
        sessionStorage.setItem('logintel-demo-credits', String(newRemaining))
        return true
      }

      const userId = user?.id
      if (!userId) return true

      // Fire Supabase update in background — don't block the UI
      consumeCredits(userId, cost, actionType, creditsRemaining, extraCredits)
        .catch(() => { /* Supabase unreachable — local update already applied */ })

      return true
    },
    [isDemo, creditsRemaining, extraCredits, user]
  )

  const resetIfNewDay = useCallback(async () => {
    if (isDemo) return
    const userId = user?.id
    if (!userId) return

    try {
      const updated = await resetDailyCreditsIfNeeded(userId)
      if (updated) {
        const fetchProfile = useAuthStore.getState().fetchProfile
        await fetchProfile(userId)
      }
    } catch (err) {
      console.error('useCredits resetIfNewDay error:', err)
    }
  }, [isDemo, user])

  return {
    creditsRemaining,
    dailyLimit,
    extraCredits,
    totalAvailable,
    plan,
    isDemo,
    canAfford,
    consume,
    resetIfNewDay,
  }
}
