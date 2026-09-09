// ──────────────────────────────────────────────────────────────────────────
// Analytics & conversion tracking (GA4 + Meta Pixel).
//
// ⚠️ DÉPEND DE TOI : renseigne tes identifiants ci-dessous.
//   • GA4_ID       → Google Analytics 4 : format "G-XXXXXXXXXX"
//                    (analytics.google.com → Admin → Flux de données → ID de mesure)
//   • META_PIXEL_ID → Meta / Facebook Pixel : identifiant numérique
//                    (business.facebook.com → Gestionnaire d'événements → Pixel)
//
// Tant que ces champs restent vides, RIEN n'est chargé (aucun impact, aucune
// erreur) — le site fonctionne normalement. Dès que tu les remplis, la mesure
// et le retargeting (Phase 4) s'activent automatiquement.
// ──────────────────────────────────────────────────────────────────────────

export const GA4_ID = "G-WQ2TRQZX3M" // Google Analytics 4
export const META_PIXEL_ID = "944527801290716" // Meta / Facebook Pixel

declare global {
  interface Window {
    dataLayer?: unknown[]
    gtag?: (...args: unknown[]) => void
    fbq?: ((...args: unknown[]) => void) & { queue?: unknown[]; loaded?: boolean; version?: string; push?: unknown }
    _fbq?: unknown
  }
}

export const CONSENT_KEY = "inov-cookie-consent"
// Granular consent keys (used when CONSENT_KEY === "custom")
export const CONSENT_ANALYTICS_KEY = "inov-consent-analytics"
export const CONSENT_MARKETING_KEY = "inov-consent-marketing"

/** Returns true if analytics cookies are consented. */
export function hasConsent(): boolean {
  try {
    const v = localStorage.getItem(CONSENT_KEY)
    if (v === "accept") return true
    if (v === "custom") return localStorage.getItem(CONSENT_ANALYTICS_KEY) === "1"
    return false
  } catch { return false }
}

/** Returns true if marketing cookies (Meta Pixel) are consented. */
export function hasMarketingConsent(): boolean {
  try {
    const v = localStorage.getItem(CONSENT_KEY)
    if (v === "accept") return true
    if (v === "custom") return localStorage.getItem(CONSENT_MARKETING_KEY) === "1"
    return false
  } catch { return false }
}

let analyticsStarted = false
let marketingStarted = false

/** Load GA4 + Meta Pixel based on granular consent. */
export function initAnalytics() {
  if (typeof window === "undefined") return

  // Google Analytics 4
  if (GA4_ID && !analyticsStarted && hasConsent()) {
    analyticsStarted = true
    const s = document.createElement("script")
    s.async = true
    s.src = `https://www.googletagmanager.com/gtag/js?id=${GA4_ID}`
    document.head.appendChild(s)
    window.dataLayer = window.dataLayer || []
    window.gtag = function gtag() {
      window.dataLayer!.push(arguments)
    }
    window.gtag("js", new Date())
    window.gtag("config", GA4_ID)
  }

  // Meta Pixel
  if (META_PIXEL_ID && !marketingStarted && hasMarketingConsent()) {
    marketingStarted = true
    /* eslint-disable */
    ;(function (f: any, b, e, v) {
      if (f.fbq) return
      const n: any = (f.fbq = function () {
        n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments)
      })
      if (!f._fbq) f._fbq = n
      n.push = n
      n.loaded = true
      n.version = "2.0"
      n.queue = []
      const t = b.createElement(e) as HTMLScriptElement
      t.async = true
      t.src = v
      const s = b.getElementsByTagName(e)[0]
      s.parentNode!.insertBefore(t, s)
    })(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js")
    /* eslint-enable */
    window.fbq!("init", META_PIXEL_ID)
    window.fbq!("track", "PageView")
  }
}

/**
 * Report a virtual page view on SPA route changes. GA4's `config` only fires one
 * page_view at load, so client-side navigations are invisible without this.
 * @param path Full path incl. search/hash (e.g. "/devis")
 */
export function trackPageView(path: string) {
  if (typeof window === "undefined") return
  try {
    if (window.gtag) {
      window.gtag("event", "page_view", {
        page_path: path,
        page_location: window.location.href,
        page_title: document.title,
      })
    }
    if (window.fbq) window.fbq("track", "PageView")
  } catch {
    /* never let tracking break the UI */
  }
}

/**
 * Track a conversion event across both providers.
 * @param name   Event name (e.g. "whatsapp_click", "lead_submit", "order_click")
 * @param params Optional extra data (value, currency, service…)
 */
export function track(name: string, params: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return
  try {
    if (window.gtag) window.gtag("event", name, params)
    if (window.fbq) {
      // Map our key events to Meta's standard events for better ad optimization.
      const standard: Record<string, string> = {
        lead_submit: "Lead",
        lead_magnet_submit: "Lead",
        order_click: "InitiateCheckout",
        whatsapp_click: "Contact",
        contact_submit: "Contact",
      }
      const mapped = standard[name]
      if (mapped) window.fbq("track", mapped, params)
      else window.fbq("trackCustom", name, params)
    }
  } catch {
    /* never let tracking break the UI */
  }
}
