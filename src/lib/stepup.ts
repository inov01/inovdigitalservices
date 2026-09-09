// Step-up re-authentication gate for admin writes.
//
// The admin space is security-critical: every change to the site must be backed
// by a fresh proof of identity (password + 2FA code), not just a still-open
// session. Rather than wrap dozens of call sites, the gate is enforced in one
// place — the authenticated API helper — for every mutating request. A short
// grace window keeps a single burst of edits from prompting on every click.
type Verifier = () => Promise<boolean>

let verifier: Verifier | null = null
let verifiedUntil = 0

// How long a successful step-up stays valid before the next write re-prompts.
export const STEP_UP_TTL = 2 * 60_000 // 2 minutes

const MUTATING = new Set(["POST", "PUT", "PATCH", "DELETE"])

// Registered by the admin UI: shows the confirm-identity modal and resolves
// true once the user re-enters their password (and 2FA code), false if cancelled.
export function registerStepUpVerifier(v: Verifier | null) {
  verifier = v
}

// Called by the UI right after a successful verification to open the grace window.
export function markStepUpVerified() {
  verifiedUntil = Date.now() + STEP_UP_TTL
}

// Clears the grace window (e.g. on sign-out) so the next write re-prompts.
export function resetStepUp() {
  verifiedUntil = 0
}

// Guards a request: no-op for reads; for writes, requires a fresh verification.
export async function ensureStepUp(method?: string): Promise<void> {
  const m = (method ?? "GET").toUpperCase()
  if (!MUTATING.has(m)) return
  if (Date.now() < verifiedUntil) return
  if (!verifier) throw new Error("STEP_UP_REQUIRED")
  const ok = await verifier()
  if (!ok) throw new Error("STEP_UP_CANCELLED")
  markStepUpVerified()
}
