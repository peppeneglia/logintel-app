import { supabase } from '../lib/supabase'

export interface SignUpData {
  email: string
  password: string
  firstName: string
  lastName: string
  company?: string
}

export async function signUp({ email, password, firstName, lastName, company }: SignUpData) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { first_name: firstName, last_name: lastName, company: company || '' },
    },
  })
  if (error) throw error
  return data
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  if (error) throw error
  return data
}

export async function signInWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/`,
    },
  })
  if (error) throw error
  return data
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export async function resetPassword(email: string) {
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  })
  if (error) throw error
  return data
}

export async function updatePassword(newPassword: string) {
  const { data, error } = await supabase.auth.updateUser({
    password: newPassword,
  })
  if (error) throw error
  return data
}

export async function getSession() {
  const { data, error } = await supabase.auth.getSession()
  if (error) throw error
  return data.session
}

export async function deleteAccount() {
  // Cancella il profilo dalla tabella profiles (RLS assicura che l'utente cancelli solo il proprio)
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user) throw new Error('Non autenticato')

  const { error: profileError } = await supabase
    .from('profiles')
    .delete()
    .eq('id', session.user.id)

  if (profileError) throw profileError

  // Disconnetti l'utente
  await supabase.auth.signOut()
}

export function onAuthStateChange(callback: (event: string, session: unknown) => void) {
  return supabase.auth.onAuthStateChange(callback)
}
