import { useState, useEffect, useRef } from "react"
import { Outlet, useLocation, useNavigate } from "react-router"
import { SiWhatsapp } from "../components/SocialIcons"
import Loader from "../components/Loader"
import Header from "../components/Header"
import Footer from "../components/Footer"
import AnnouncementBar from "../components/AnnouncementBar"
import LeadMagnet from "../components/LeadMagnet"
import CookieConsent from "../components/CookieConsent"
import AnnouncementBanner from "../components/AnnouncementBanner"
import { track, trackPageView } from "../lib/analytics"
import { applySeo } from "../lib/seo"
import { useSettings } from "../context/AppSettings"
import { smoothScrollToId, scrollToIdWhenReady } from "../lib/smoothScroll"
import { captureRefFromUrl } from "../lib/referral"

const SKIP_TO_CONTENT: Record<string, string> = {
  fr: "Aller au contenu",
  en: "Skip to content",
  es: "Saltar al contenido",
  ht: "Ale nan kontni an",
  pt: "Ir para o conteúdo",
  it: "Vai al contenuto",
  de: "Zum Inhalt springen",
  ar: "تخطَّ إلى المحتوى",
}

export default function RootLayout() {
  const [loading, setLoading] = useState(true)
  const location = useLocation()
  const navigate = useNavigate()
  const { lang } = useSettings()
  const skipLabel = SKIP_TO_CONTENT[lang] ?? SKIP_TO_CONTENT.en

  // Restore homepage SEO/OG meta when returning to "/" (article/legal pages set their own).
  useEffect(() => {
    if (location.pathname === "/") applySeo(lang)
  }, [location.pathname, lang])

  useEffect(() => {
    // Hide the loader after the first paint — don't wait on fonts.ready which can hang.
    const raf = requestAnimationFrame(() => setLoading(false))
    return () => cancelAnimationFrame(raf)
  }, [])

  // Reading-progress bar
  const [scrollPct, setScrollPct] = useState(0)
  useEffect(() => {
    const onScroll = () => {
      const el = document.documentElement
      setScrollPct(Math.round((el.scrollTop / (el.scrollHeight - el.clientHeight)) * 100))
    }
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  // Intercept in-page anchor clicks (#section, /#section) for fast, router-aware scroll.
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
      const anchor = (e.target as HTMLElement).closest?.("a") as HTMLAnchorElement | null
      if (!anchor) return
      const href = anchor.getAttribute("href") ?? ""
      const match = href.match(/^\/?#(.+)$/)
      if (!match) return
      const id = match[1]
      e.preventDefault()
      if (location.pathname !== "/") {
        // Coming from a blog/legal page — go home, then scroll once the section mounts.
        navigate(`/#${id}`)
      } else {
        smoothScrollToId(id)
        history.replaceState(null, "", `#${id}`)
      }
    }
    document.addEventListener("click", onClick)
    return () => document.removeEventListener("click", onClick)
  }, [location.pathname, navigate])

  // After navigating to "/#section", scroll to it (waits for lazy sections to mount).
  useEffect(() => {
    if (location.pathname === "/" && location.hash) {
      scrollToIdWhenReady(location.hash.slice(1))
    }
  }, [location.pathname, location.hash])

  // Scroll back to the top on every route change (e.g. a footer/header link
  // followed while scrolled down). Skip when a hash is present — anchor scrolling
  // is handled by the effect above.
  useEffect(() => {
    if (location.hash) return
    window.scrollTo({ top: 0, left: 0, behavior: "auto" })
  }, [location.pathname])

  // Report a GA4/Meta page_view on client-side navigations. The load-time
  // page_view is already sent by initAnalytics(), so skip the first render.
  const firstView = useRef(true)
  useEffect(() => {
    if (firstView.current) { firstView.current = false; return }
    trackPageView(location.pathname + location.search + location.hash)
  }, [location.pathname, location.search, location.hash])

  // Capture an ambassador referral code (?ref=CODE) on first visit.
  useEffect(() => {
    captureRefFromUrl()
  }, [])

  // When user clicks the email link (?guide=1&lang=xx), store a flag for LeadMagnet
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get("guide") === "1") {
      const guideLang = params.get("lang") ?? "fr"
      try { sessionStorage.setItem("inov-guide-requested", guideLang) } catch {}
      window.history.replaceState(null, "", window.location.pathname)
    }
  }, [])

  return (
    <>
      <a href="#main" className="skip-link">{skipLabel}</a>

      <div
        id="progress-bar"
        aria-hidden="true"
        role="presentation"
        style={{ width: `${scrollPct}%`, background: "linear-gradient(90deg, var(--ds-accent), var(--ds-accent-hover))" }}
      />

      <Loader visible={loading} />

      <Header />
      <AnnouncementBanner />
      <main id="main" tabIndex={-1} style={{ paddingTop: "var(--header-h)", outline: "none" }}>
        <AnnouncementBar />
        <Outlet />
      </main>
      <Footer />

      <LeadMagnet />
      <CookieConsent />

      {/* Floating WhatsApp */}
      <a
        href="https://wa.me/50936255920?text=Bonjour%20INOV%20Digital%20Services%20!%20Je%20voudrais%20un%20devis."
        target="_blank"
        rel="noreferrer"
        aria-label="Contacter via WhatsApp"
        className="whatsapp-fab"
        onClick={() => track("whatsapp_click", { source: "floating_button" })}
        style={{
          position: "fixed", bottom: 28, insetInlineEnd: 28, zIndex: 5000,
          width: 60, height: 60, borderRadius: "50%", background: "#128C3E",
          boxShadow: "0 6px 24px rgba(37,211,102,0.45)",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "#fff", textDecoration: "none", transition: "transform 0.2s, box-shadow 0.2s",
        }}
        onMouseEnter={(e) => { e.currentTarget.style.transform = "scale(1.1)"; e.currentTarget.style.boxShadow = "0 8px 32px rgba(37,211,102,0.6)" }}
        onMouseLeave={(e) => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 6px 24px rgba(37,211,102,0.45)" }}
      >
        <SiWhatsapp size={30} />
      </a>
    </>
  )
}
