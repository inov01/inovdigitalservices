// Referral attribution helpers.
//
// When a visitor lands via an ambassador link (…?ref=CODE), we persist the code
// locally so that any lead they submit later (contact, quote, payment…) carries
// it in `meta.ref`. The existing backend already stores `meta`, so attribution
// works without touching the main function.

const KEY = "inov_ref"

// Reads `?ref=` from the current URL and stores it (first-touch wins).
export function captureRefFromUrl(): void {
  try {
    const params = new URLSearchParams(window.location.search)
    const code = (params.get("ref") ?? "").trim().toUpperCase()
    if (!code) return
    // First-touch attribution: don't overwrite an existing code.
    if (!localStorage.getItem(KEY)) {
      localStorage.setItem(KEY, code.slice(0, 16))
    }
  } catch {
    /* localStorage unavailable — ignore */
  }
}

export function getStoredRef(): string | null {
  try {
    return localStorage.getItem(KEY)
  } catch {
    return null
  }
}
