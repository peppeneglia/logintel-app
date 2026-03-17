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
    console.error('getProfile:', error.message)
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

/**
 * Consume credits from the user's balance.
 * Accepts current balance from store to avoid an extra getProfile round-trip.
 * Runs update + insert in parallel.
 */
export async function consumeCredits(
  userId: string,
  amount: number,
  actionType: string,
  currentRemaining?: number,
  currentExtra?: number
): Promise<{ success: boolean; balanceAfter: number; newRemaining: number; newExtra: number }> {
  // Use provided values or fetch from DB
  let remaining = currentRemaining
  let extra = currentExtra
  if (remaining === undefined || extra === undefined) {
    const profile = await getProfile(userId)
    if (!profile) return { success: false, balanceAfter: 0, newRemaining: 0, newExtra: 0 }
    remaining = profile.credits_remaining
    extra = profile.extra_credits
  }

  const totalAvailable = remaining + extra
  if (totalAvailable < amount) {
    return { success: false, balanceAfter: totalAvailable, newRemaining: remaining, newExtra: extra }
  }

  // Deduct from daily credits first, then extra
  let deduction = amount
  let newRemaining = remaining
  let newExtra = extra
  let usedExtra = false

  if (newRemaining >= deduction) {
    newRemaining -= deduction
  } else {
    deduction -= newRemaining
    newRemaining = 0
    newExtra -= deduction
    usedExtra = true
  }

  const balanceAfter = newRemaining + newExtra
  const logActionType = usedExtra ? `${actionType}_EXTRA` : actionType

  // Run update + insert in parallel
  const [{ error: profileError }, { error: txError }] = await Promise.all([
    supabase
      .from('profiles')
      .update({ credits_remaining: newRemaining, extra_credits: newExtra })
      .eq('id', userId),
    supabase
      .from('credit_transactions')
      .insert({
        user_id: userId,
        amount: -amount,
        action_type: logActionType,
        balance_after: balanceAfter,
      }),
  ])

  if (profileError) throw profileError
  if (txError) console.error('consumeCredits log:', txError.message)

  return { success: true, balanceAfter, newRemaining, newExtra }
}

/**
 * Reset daily credits if the reset date has passed (new day UTC).
 */
export async function resetDailyCreditsIfNeeded(userId: string): Promise<Profile | null> {
  const profile = await getProfile(userId)
  if (!profile) return null

  const resetAt = new Date(profile.credits_reset_at)
  const now = new Date()

  // Check if we're past the reset time (midnight UTC of the reset day)
  const todayMidnight = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))

  if (resetAt < todayMidnight) {
    // Reset daily credits
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        credits_remaining: profile.credits_daily_limit,
        credits_reset_at: todayMidnight.toISOString(),
      })
      .eq('id', userId)

    if (profileError) {
      console.error('resetDailyCredits:', profileError.message)
      return profile
    }

    // Log the reset transaction
    await supabase.from('credit_transactions').insert({
      user_id: userId,
      amount: profile.credits_daily_limit,
      action_type: 'DAILY_RESET',
      balance_after: profile.credits_daily_limit + profile.extra_credits,
    })

    // Expire extra credits if past expiry date
    if (profile.extra_credits_expire_at && new Date(profile.extra_credits_expire_at) < now) {
      await supabase
        .from('profiles')
        .update({ extra_credits: 0, extra_credits_expire_at: null })
        .eq('id', userId)
    }

    return await getProfile(userId)
  }

  return profile
}
