import { useState, useEffect } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabaseClient'

export function useSupabaseAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then((res: any) => {
      const session = res?.data?.session ?? null;
      setSession(session)
      setUser((session as any)?.user ?? null)
      setLoading(false)
    }).catch(() => setLoading(false))

    // Listen for auth changes
    const subscriptionResult: any = supabase.auth.onAuthStateChange((_: any, session: any) => {
      setSession(session)
      setUser((session as any)?.user ?? null)
      setLoading(false)
    })

    // Unsubscribe if available
    try {
      const subscription = subscriptionResult?.data?.subscription ?? subscriptionResult?.subscription ?? null;
      return () => subscription?.unsubscribe && subscription.unsubscribe()
    } catch {
      return () => {}
    }
  }, [])

  // Sign in with email and password
  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { data, error }
  }

  // Sign up with email and password
  const signUp = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })
    return { data, error }
  }

  // Sign out
  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    return { error }
  }

  return {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
  }
}
