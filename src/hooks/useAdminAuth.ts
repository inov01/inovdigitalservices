import { useEffect, useState } from "react"
import type { Session } from "@supabase/supabase-js"
import { supabase } from "../lib/supabaseClient"
import { resetStepUp } from "../lib/stepup"

// Tracks the admin Supabase session and keeps it in sync across tabs/refreshes.
export function useAdminAuth() {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setLoading(false)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s))
    return () => sub.subscription.unsubscribe()
  }, [])

  async function signIn(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
  }

  async function signOut() {
    resetStepUp()
    await supabase.auth.signOut()
  }

  return { session, loading, signIn, signOut, email: session?.user?.email ?? "" }
}
