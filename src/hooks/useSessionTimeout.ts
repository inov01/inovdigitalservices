import { useEffect, useRef } from "react"

// Enforces a maximum connection duration on the client side. Supabase refresh
// tokens otherwise keep a session alive indefinitely, so we add two guards:
//  • idle timeout — signed out after a period with no user activity
//  • absolute cap — signed out a fixed time after login, active or not
// The admin is held to a stricter policy than regular client accounts.
export interface SessionPolicy {
  key: string
  idleMs: number
  absoluteMs: number
}

const MIN = 60_000
const HOUR = 60 * MIN

export const ADMIN_SESSION_POLICY: SessionPolicy = {
  key: "admin",
  idleMs: 5 * MIN, // signed out after 5 min inactive
  absoluteMs: 30 * MIN, // and after 30 min max, no matter what
}

export const CLIENT_SESSION_POLICY: SessionPolicy = {
  key: "client",
  idleMs: 30 * MIN,
  absoluteMs: 12 * HOUR,
}

export function useSessionTimeout(
  active: boolean,
  policy: SessionPolicy,
  onExpire: () => void,
) {
  const lastActivity = useRef(Date.now())
  const onExpireRef = useRef(onExpire)
  onExpireRef.current = onExpire
  const startKey = `inov-sess-start-${policy.key}`

  // Clear the absolute-start marker on sign-out so the next login starts fresh.
  useEffect(() => {
    if (!active) {
      try { localStorage.removeItem(startKey) } catch { /* ignore */ }
    }
  }, [active, startKey])

  useEffect(() => {
    if (!active) return

    let start = Number(localStorage.getItem(startKey))
    if (!start || Number.isNaN(start)) {
      start = Date.now()
      try { localStorage.setItem(startKey, String(start)) } catch { /* ignore */ }
    }
    lastActivity.current = Date.now()

    const bump = () => { lastActivity.current = Date.now() }
    const events = ["mousemove", "mousedown", "keydown", "scroll", "touchstart", "click"]
    events.forEach((e) => window.addEventListener(e, bump, { passive: true }))

    const check = () => {
      const now = Date.now()
      if (now - start > policy.absoluteMs || now - lastActivity.current > policy.idleMs) {
        try { localStorage.removeItem(startKey) } catch { /* ignore */ }
        onExpireRef.current()
      }
    }
    const iv = window.setInterval(check, 15_000)

    return () => {
      window.clearInterval(iv)
      events.forEach((e) => window.removeEventListener(e, bump))
    }
  }, [active, policy.idleMs, policy.absoluteMs, startKey])
}
