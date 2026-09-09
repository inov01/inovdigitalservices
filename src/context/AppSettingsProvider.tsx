import { useState, useEffect, type ReactNode } from "react"
import { translations, type Lang } from "../i18n/translations"
import { Ctx, CURRENCIES, FALLBACK_RATES, LANG_DEFAULT_CURRENCY, RTL_LANGS, type CurrencyCode } from "./AppSettings"
import { REGIONS, regionForCountry, type RegionCode } from "../data/regions"
import { applySeo } from "../lib/seo"

export function AppSettingsProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    // Priority: ?lang= in the URL (shareable, crawlable) → saved choice → default.
    if (typeof window !== "undefined") {
      const urlLang = new URLSearchParams(window.location.search).get("lang")
      if (urlLang && urlLang in translations) return urlLang as Lang
    }
    const saved = typeof localStorage !== "undefined" ? localStorage.getItem("inov-lang") : null
    return saved && saved in translations ? (saved as Lang) : "en"
  })
  const [currency, setCurrencyState] = useState<CurrencyCode>(() => {
    // A dedicated per-country share link (?currency=) wins, then the saved choice.
    if (typeof window !== "undefined") {
      const urlCur = new URLSearchParams(window.location.search).get("currency")
      if (urlCur && urlCur in CURRENCIES) return urlCur as CurrencyCode
    }
    const saved = typeof localStorage !== "undefined" ? localStorage.getItem("inov-currency") : null
    return saved && saved in CURRENCIES ? (saved as CurrencyCode) : "USD"
  })
  const [rates, setRates] = useState<Record<CurrencyCode, number>>(FALLBACK_RATES)
  const [region, setRegionState] = useState<RegionCode>(() => {
    // ?region= on a dedicated per-country link wins, then the saved choice.
    if (typeof window !== "undefined") {
      const urlRegion = new URLSearchParams(window.location.search).get("region")
      if (urlRegion && urlRegion in REGIONS) return urlRegion as RegionCode
    }
    const saved = typeof localStorage !== "undefined" ? localStorage.getItem("inov-region") : null
    return saved && saved in REGIONS ? (saved as RegionCode) : "OTHER"
  })

  // A dedicated share link carrying ?region= / ?currency= counts as an explicit
  // choice: persist it and set the "chosen" flags so auto-detection never
  // overrides the country/currency the admin baked into the link.
  useEffect(() => {
    if (typeof window === "undefined") return
    const q = new URLSearchParams(window.location.search)
    const urlRegion = q.get("region")
    const urlCur = q.get("currency")
    try {
      if (urlRegion && urlRegion in REGIONS) {
        localStorage.setItem("inov-region", urlRegion)
        localStorage.setItem("inov-region-set", "1")
      }
      if (urlCur && urlCur in CURRENCIES) {
        localStorage.setItem("inov-currency", urlCur)
        localStorage.setItem("inov-currency-set", "1")
      }
    } catch {}
  }, [])

  function setRegion(r: RegionCode) {
    setRegionState(r)
    try {
      localStorage.setItem("inov-region", r)
      localStorage.setItem("inov-region-set", "1")
    } catch {}
    // A manual region change also switches to that region's natural currency,
    // and counts as an explicit choice so auto-detection won't override it.
    const cur = REGIONS[r].currency
    setCurrencyState(cur)
    try {
      localStorage.setItem("inov-currency", cur)
      localStorage.setItem("inov-currency-set", "1")
    } catch {}
  }

  function setLang(l: Lang) {
    setLangState(l)
    try { localStorage.setItem("inov-lang", l) } catch {}
    // Reflect the language in the URL (?lang=xx) so it stays shareable and the
    // canonical/hreflang for this view is accurate. replaceState = no history spam.
    try {
      const url = new URL(window.location.href)
      url.searchParams.set("lang", l)
      window.history.replaceState({}, "", url)
    } catch {}
    // Suggest the currency naturally tied to the chosen language — but never
    // override a currency the user has explicitly picked themselves.
    const userChose = typeof localStorage !== "undefined" && localStorage.getItem("inov-currency-set") === "1"
    if (userChose) return
    const suggested = LANG_DEFAULT_CURRENCY[l]
    if (suggested) setCurrencyState(suggested)
  }
  function setCurrency(c: CurrencyCode) {
    setCurrencyState(c)
    try {
      localStorage.setItem("inov-currency", c)
      localStorage.setItem("inov-currency-set", "1")
    } catch {}
  }

  // Keep the document's language + text direction in sync with the active language.
  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = lang
      document.documentElement.dir = RTL_LANGS.includes(lang) ? "rtl" : "ltr"
    }
    // Keep <title> + meta description in sync with the active language (SEO).
    applySeo(lang)
  }, [lang])

  // Fetch the day's exchange rates (free, no key); fall back silently on failure.
  // Deferred until after mount + aborted on timeout so the pending request never
  // stalls the initial render/instrumentation window.
  useEffect(() => {
    const controller = new AbortController()
    const abortTimer = setTimeout(() => controller.abort(), 6000)
    const startTimer = setTimeout(() => {
      fetch("https://open.er-api.com/v6/latest/USD", { signal: controller.signal })
        .then((r) => r.json())
        .then((d) => {
          if (!d || !d.rates) return
          const next = { ...FALLBACK_RATES }
          ;(Object.keys(CURRENCIES) as CurrencyCode[]).forEach((c) => {
            if (typeof d.rates[c] === "number") next[c] = d.rates[c]
          })
          setRates(next)
        })
        .catch(() => {})
    }, 800)
    return () => {
      clearTimeout(startTimer)
      clearTimeout(abortTimer)
      controller.abort()
    }
  }, [])

  // Auto-detect the visitor's region unless they've already chosen one.
  // Privacy-first: try LOCAL signals (timezone, browser locale) — which make no
  // network request and share no data — and only fall back to an IP lookup when
  // those are inconclusive. Silent, deferred, non-blocking.
  useEffect(() => {
    const regionSet = typeof localStorage !== "undefined" && localStorage.getItem("inov-region-set") === "1"
    const currencySet = typeof localStorage !== "undefined" && localStorage.getItem("inov-currency-set") === "1"
    if (regionSet || currencySet) return

    // Has the visitor already picked a language (URL ?lang= or a saved choice)?
    const langChosen = (() => {
      try {
        if (typeof window !== "undefined" && new URLSearchParams(window.location.search).get("lang")) return true
        return typeof localStorage !== "undefined" && !!localStorage.getItem("inov-lang")
      } catch { return false }
    })()

    function applyRegion(r: RegionCode) {
      setRegionState(r)
      try { localStorage.setItem("inov-region", r) } catch {}
      const cur = REGIONS[r].currency
      setCurrencyState(cur)
      try { localStorage.setItem("inov-currency", cur) } catch {}
      // Haiti visitors get the site in French with prices in gourdes by default
      // (currency already set above via REGIONS.HT.currency = HTG).
      if (r === "HT" && !langChosen) {
        setLangState("fr")
        try { localStorage.setItem("inov-lang", "fr") } catch {}
      }
    }

    // 1) Local, no-network detection first.
    function detectLocal(): RegionCode {
      try {
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || ""
        if (tz.includes("Port-au-Prince")) return "HT"
      } catch {}
      const loc = (typeof navigator !== "undefined" && navigator.language) || ""
      const cc = loc.split("-")[1]
      return regionForCountry(cc)
    }

    const local = detectLocal()
    if (local !== "OTHER") {
      applyRegion(local)
      return
    }

    // 2) Only if local signals were inconclusive, do an IP lookup as a last resort.
    const controller = new AbortController()
    const abortTimer = setTimeout(() => controller.abort(), 6000)
    const startTimer = setTimeout(() => {
      fetch("https://ipapi.co/json/", { signal: controller.signal })
        .then((r) => r.json())
        .then((d) => applyRegion(regionForCountry(d && d.country_code)))
        .catch(() => applyRegion("OTHER"))
    }, 800)

    return () => {
      clearTimeout(startTimer)
      clearTimeout(abortTimer)
      controller.abort()
    }
  }, [])

  function fmt(usd: number) {
    const c = CURRENCIES[currency]
    const val = Math.round(usd * (rates[currency] ?? 1))
    return `${val.toLocaleString(c.locale)} ${c.symbol}`
  }

  // Adjust a USD base price by the active region's purchasing-power factor.
  function priceFor(usd: number) {
    return Math.round(usd * REGIONS[region].pppFactor)
  }

  // Purchasing-power pricing adjusts the PRICE only — the service itself is equal
  // everywhere. Every region gets the same revision window and the same number of
  // included revisions, so a cheaper region is never a lesser offer.
  // (To tie terms back to the regional factor, multiply by REGIONS[region].pppFactor.)
  function revisionDaysFor(days: number) {
    return Math.max(1, Math.round(days))
  }

  function revisionsFor(revisions: number) {
    return Math.max(1, Math.round(revisions))
  }

  const t = translations[lang]

  return (
    <Ctx.Provider value={{ lang, setLang, t, currency, setCurrency, rates, fmt, region, setRegion, priceFor, revisionDaysFor, revisionsFor }}>
      {children}
    </Ctx.Provider>
  )
}
