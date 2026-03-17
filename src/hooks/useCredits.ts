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
  const updateProfile = useAuthStore((s) => s.updateProfile)

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
      if (isDemo) {
        // Simulate consumption locally in demo mode
        const newRemaining = Math.max(0, creditsRemaining - cost)
        updateProfile({ credits_remaining: newRemaining } as Partial<Profile>)
        return true
      }

      const userId = user?.id
      if (!userId) return false

      try {
        const result = await consumeCredits(userId, cost, actionType)
        if (result.success) {
          // Refresh profile in store
          const fetchProfile = useAuthStore.getState().fetchProfile
          await fetchProfile(userId)
        } else {
          // Supabase returned false (e.g. profile not found) — update locally as fallback
          const newRemaining = Math.max(0, creditsRemaining - cost)
          updateProfile({ credits_remaining: newRemaining } as Partial<Profile>)
        }
        return true
      } catch {
        // Supabase unreachable — update locally as fallback
        const newRemaining = Math.max(0, creditsRemaining - cost)
        updateProfile({ credits_remaining: newRemaining } as Partial<Profile>)
        return true
      }
    },
    [isDemo, creditsRemaining, user, updateProfile]
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
