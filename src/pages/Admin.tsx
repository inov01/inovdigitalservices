import { useEffect, useMemo, useRef, useState } from "react"
import { Loader2 } from "lucide-react"
import { useAdminAuth } from "../hooks/useAdminAuth"
import { useSessionTimeout, ADMIN_SESSION_POLICY } from "../hooks/useSessionTimeout"
import { supabase } from "../lib/supabaseClient"
import { shell } from "./admin/shared"
import { LoginScreen, ForcedMfaSetupScreen, MfaChallengeScreen } from "./admin/auth"
import Dashboard from "./admin/AdminShell"
import NotFound from "./NotFound"

// Anti-scanning: /admin renders a normal 404 for anyone who is not signed in and
// who did not arrive with the unlock token in the URL hash. The hash never hits
// server logs. Bookmark `/admin#<token>` to reveal the login screen. This is
// obscurity to cut bot noise — the real barrier stays login + MFA + allowlist.
// Overridable at build time via VITE_ADMIN_UNLOCK (kept out of the source repo).
const ADMIN_UNLOCK = import.meta.env.VITE_ADMIN_UNLOCK || "hfdJ4HF7Fplo"
const UNLOCK_KEY = "adm_unlocked"

export default function Admin() {
  const { session, loading, signIn, signOut, email } = useAdminAuth()
  // Once unlocked this session, stay unlocked (so the hash can be stripped from
  // the URL). Also unlocks retroactively if a session already exists.
  const [unlocked, setUnlocked] = useState(() => {
    try { return sessionStorage.getItem(UNLOCK_KEY) === "1" } catch { return false }
  })
  useEffect(() => {
    const hash = window.location.hash.replace(/^#/, "")
    if (hash && hash === ADMIN_UNLOCK) {
      try { sessionStorage.setItem(UNLOCK_KEY, "1") } catch { /* ignore */ }
      setUnlocked(true)
      // Strip the token from the address bar without adding a history entry.
      history.replaceState(null, "", window.location.pathname + window.location.search)
    }
  }, [])
  const [expired, setExpired] = useState(false)
  // "checking" until we know whether a 2FA step-up is required for this session.
  const [mfa, setMfa] = useState<"checking" | "ok" | "required">("checking")
  // After mfa is "ok", verify the admin has enrolled a TOTP factor. If not, block with setup screen.
  const [enrollState, setEnrollState] = useState<"checking" | "enrolled" | "needed">("checking")

  // Auto sign-out after inactivity / absolute cap (stricter for the admin).
  useSessionTimeout(!!session, ADMIN_SESSION_POLICY, () => {
    setExpired(true)
    signOut()
  })

  // Whenever a session appears, verify the authenticator assurance level: if the
  // admin enrolled a TOTP factor, the session must be stepped up to AAL2.
  useEffect(() => {
    let cancelled = false
    if (!session) { setMfa("checking"); return }
    setMfa("checking")
    supabase.auth.mfa.getAuthenticatorAssuranceLevel()
      .then(({ data }) => {
        if (cancelled) return
        const stepUp = data?.nextLevel === "aal2" && data?.currentLevel !== "aal2"
        setMfa(stepUp ? "required" : "ok")
      })
      .catch(() => { if (!cancelled) setMfa("ok") })
    return () => { cancelled = true }
  }, [session])

  // Once the AAL check passes, verify the admin has enrolled a verified TOTP factor.
  useEffect(() => {
    if (mfa !== "ok" || !session) { setEnrollState("checking"); return }
    let cancelled = false
    supabase.auth.mfa.listFactors()
      .then(({ data }) => {
        if (cancelled) return
        const has = Boolean(data?.totp?.some((f) => f.status === "verified"))
        setEnrollState(has ? "enrolled" : "needed")
      })
      .catch(() => { if (!cancelled) setEnrollState("needed") })
    return () => { cancelled = true }
  }, [mfa, session])

  if (loading) {
    return (
      <div className="dark" style={{ ...shell, display: "grid", placeItems: "center" }}>
        <Loader2 size={28} style={{ animation: "spin 0.8s linear infinite", color: "var(--ds-accent)" }} />
      </div>
    )
  }

  // Not signed in and no unlock token → look exactly like any missing page.
  if (!session && !unlocked) return <NotFound />

  if (!session) return <LoginScreen onSignIn={signIn} expired={expired} onClearExpired={() => setExpired(false)} />

  if (mfa === "checking") {
    return (
      <div className="dark" style={{ ...shell, display: "grid", placeItems: "center" }}>
        <Loader2 size={28} style={{ animation: "spin 0.8s linear infinite", color: "var(--ds-accent)" }} />
      </div>
    )
  }

  if (mfa === "required") {
    return <MfaChallengeScreen onVerified={() => setMfa("ok")} onCancel={signOut} />
  }

  if (enrollState === "checking") {
    return (
      <div className="dark" style={{ ...shell, display: "grid", placeItems: "center" }}>
        <Loader2 size={28} style={{ animation: "spin 0.8s linear infinite", color: "var(--ds-accent)" }} />
      </div>
    )
  }

  if (enrollState === "needed") {
    return <ForcedMfaSetupScreen onEnrolled={() => setEnrollState("enrolled")} onCancel={signOut} />
  }

  return <Dashboard email={email} onSignOut={signOut} />
}

// ── Login / first-time setup ──────────────────────────────────────────────────
