import type { Lang } from "../i18n/translations"

// Per-language <title> + meta description. Google renders JS, so updating these
// on language change genuinely helps international SEO. Keep titles < 60 chars
// and descriptions < 160 chars.
const SEO: Record<Lang, { title: string; description: string; locale: string }> = {
  fr: {
    title: "INOV Digital Services — Branding, Logos & Design",
    description: "Studio de branding en Haïti : logos, packaging, affiches, motion design et sites vitrines. 20+ marques, 80+ visuels livrés. Livraison dès 48h.",
    locale: "fr_FR",
  },
  en: {
    title: "INOV Digital Services — Branding, Logos & Design",
    description: "Branding studio: logos, packaging, posters, motion design and websites. 20+ brands, 80+ visuals delivered. Delivery from 48h.",
    locale: "en_US",
  },
  es: {
    title: "INOV Digital Services — Branding, Logos y Diseño",
    description: "Estudio de branding: logos, packaging, afiches, motion design y sitios web. 20+ marcas, 80+ visuales entregados. Entrega desde 48h.",
    locale: "es_ES",
  },
  ht: {
    title: "INOV Digital Services — Branding, Logo & Design",
    description: "Estidyo branding an Ayiti: logo, anbalaj, afich, motion design ak sit entènèt. 20+ mak, 80+ vizyèl livre. Livrezon depi 48è.",
    locale: "ht_HT",
  },
  pt: {
    title: "INOV Digital Services — Branding, Logos e Design",
    description: "Estúdio de branding: logos, embalagens, cartazes, motion design e sites. 20+ marcas, 80+ visuais entregues. Entrega a partir de 48h.",
    locale: "pt_BR",
  },
  it: {
    title: "INOV Digital Services — Branding, Loghi e Design",
    description: "Studio di branding: loghi, packaging, manifesti, motion design e siti web. 20+ brand, 80+ visual consegnati. Consegna da 48h.",
    locale: "it_IT",
  },
  de: {
    title: "INOV Digital Services — Branding, Logos & Design",
    description: "Branding-Studio: Logos, Verpackung, Poster, Motion Design und Websites. 20+ Marken, 80+ Visuals geliefert. Lieferung ab 48h.",
    locale: "de_DE",
  },
  ar: {
    title: "INOV Digital Services — علامات تجارية وشعارات وتصميم",
    description: "استوديو علامات تجارية: شعارات، تغليف، ملصقات، موشن ديزاين ومواقع ويب. أكثر من 20 علامة و80 تصميماً. التسليم خلال 48 ساعة.",
    locale: "ar_AE",
  },
}

function setMeta(selector: string, attr: "content", value: string) {
  const el = document.querySelector(selector)
  if (el) el.setAttribute(attr, value)
}

const ALL_LANGS: Lang[] = ["fr", "en", "es", "ht", "pt", "it", "de", "ar"]

// The x-default / canonical fallback language (matches the app's default state).
const DEFAULT_LANG: Lang = "en"

/** Distinct, crawlable URL for a language: origin + "/?lang=xx".
 *  Query-param URLs need no server rewrite — "/" always serves index.html and
 *  the app reads ?lang on load — so hreflang points at URLs that truly resolve. */
function urlForLang(origin: string, l: Lang) {
  return `${origin}/?lang=${l}`
}

function setLink(rel: string, href: string, hreflang?: string) {
  const link = document.createElement("link")
  link.rel = rel
  if (hreflang) link.hreflang = hreflang
  link.href = href
  document.head.appendChild(link)
}

function syncHreflang(lang: Lang) {
  if (typeof document === "undefined") return
  const origin = window.location.origin
  // Remove any previously injected alternates + canonical so re-runs stay clean.
  document.querySelectorAll('link[rel="alternate"][hreflang]').forEach(el => el.remove())
  document.querySelectorAll('link[rel="canonical"]').forEach(el => el.remove())

  // Canonical points at the current language's distinct URL.
  setLink("canonical", urlForLang(origin, lang))

  ALL_LANGS.forEach(l => setLink("alternate", urlForLang(origin, l), l))
  setLink("alternate", urlForLang(origin, DEFAULT_LANG), "x-default")
}

/** Update the document title + meta/OG/Twitter + canonical/hreflang for the active language.
 *  Only runs on the home route — page-level routes (blog article, legal…) own their
 *  own meta via applyPageMeta and must not be clobbered when the language changes. */
export function applySeo(lang: Lang) {
  if (typeof document === "undefined") return
  if (window.location.pathname !== "/") return
  const s = SEO[lang] ?? SEO.fr
  const origin = window.location.origin
  const img = `${origin}/og-image.png`
  document.title = s.title
  setMeta('meta[name="description"]', "content", s.description)
  setMeta('meta[property="og:type"]', "content", "website")
  setMeta('meta[property="og:title"]', "content", s.title)
  setMeta('meta[property="og:description"]', "content", s.description)
  setMeta('meta[property="og:locale"]', "content", s.locale)
  setMeta('meta[property="og:url"]', "content", urlForLang(origin, lang))
  setMeta('meta[property="og:image"]', "content", img)
  setMeta('meta[name="twitter:title"]', "content", s.title)
  setMeta('meta[name="twitter:description"]', "content", s.description)
  setMeta('meta[name="twitter:image"]', "content", img)
  syncHreflang(lang)
}

/** Set title + OG/Twitter meta + canonical for a specific page (article, list, legal).
 *  Crawlers that don't run JS (WhatsApp/Facebook) read the static index.html defaults;
 *  this benefits Google and JS-aware share flows, and keeps the browser tab correct. */
export function applyPageMeta(opts: { title: string; description: string; url?: string; image?: string; type?: string; alternatesBase?: string }) {
  if (typeof document === "undefined") return
  const origin = window.location.origin
  const url = opts.url ?? window.location.href
  const image = opts.image ?? `${origin}/og-image.png`
  document.title = opts.title
  setMeta('meta[name="description"]', "content", opts.description)
  setMeta('meta[property="og:type"]', "content", opts.type ?? "article")
  setMeta('meta[property="og:title"]', "content", opts.title)
  setMeta('meta[property="og:description"]', "content", opts.description)
  setMeta('meta[property="og:url"]', "content", url)
  setMeta('meta[property="og:image"]', "content", image)
  setMeta('meta[name="twitter:title"]', "content", opts.title)
  setMeta('meta[name="twitter:description"]', "content", opts.description)
  setMeta('meta[name="twitter:image"]', "content", image)

  document.querySelectorAll('link[rel="canonical"]').forEach((el) => el.remove())
  document.querySelectorAll('link[rel="alternate"][hreflang]').forEach((el) => el.remove())
  const link = document.createElement("link")
  link.rel = "canonical"
  link.href = url
  document.head.appendChild(link)

  // Per-language alternates for pages that exist in every language via ?lang=xx
  // (the SPA reads ?lang on load). Matches the static hreflang in public/blog/*.
  if (opts.alternatesBase) {
    const base = opts.alternatesBase
    ALL_LANGS.forEach((l) => setLink("alternate", `${base}?lang=${l}`, l))
    setLink("alternate", `${base}?lang=${DEFAULT_LANG}`, "x-default")
  }
}
