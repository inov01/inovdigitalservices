import { useState, useEffect, useRef } from "react"
import { Link } from "react-router"
import { FileText, ChevronDown, Globe, UserRound } from "lucide-react"
import logo from "../imports/logo.webp"
import { useSettings } from "../context/AppSettings"
import { LANGS, type Lang } from "../i18n/translations"
import { NAV_ITEMS } from "../data/nav"
import { track } from "../lib/analytics"

// Localized aria-label for the mobile menu toggle.
const MENU_LABEL: Record<Lang, string> = {
  fr: "Menu", en: "Menu", es: "Menú", ht: "Meni",
  pt: "Menu", it: "Menu", de: "Menü", ar: "القائمة",
}

// "Mon compte" internal link — shown in the header on every page.
const ACCOUNT_LABEL: Record<Lang, string> = {
  fr: "Mon compte", en: "My account", es: "Mi cuenta", ht: "Kont mwen",
  pt: "Minha conta", it: "Il mio account", de: "Mein Konto", ar: "حسابي",
}

// Localized aria-label for the language selector.
const LANG_LABEL: Record<Lang, string> = {
  fr: "Langue", en: "Language", es: "Idioma", ht: "Lang",
  pt: "Idioma", it: "Lingua", de: "Sprache", ar: "اللغة",
}

export default function Header() {
  const { t, lang, setLang } = useSettings()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [langOpen, setLangOpen] = useState(false)
  const settingsRef = useRef<HTMLDivElement>(null)
  const optionRefs = useRef<(HTMLButtonElement | null)[]>([])
  const [activeIdx, setActiveIdx] = useState(0)
  const langLabel = LANG_LABEL[lang] ?? LANG_LABEL.fr

  // On open, point the roving focus at the current language and move focus there.
  useEffect(() => {
    if (!langOpen) return
    const i = LANGS.findIndex((l) => l.code === lang)
    const idx = i >= 0 ? i : 0
    setActiveIdx(idx)
    const raf = requestAnimationFrame(() => optionRefs.current[idx]?.focus())
    return () => cancelAnimationFrame(raf)
  }, [langOpen, lang])

  // Arrow-key navigation within the language listbox (WAI-ARIA listbox pattern).
  function onListKey(e: React.KeyboardEvent<HTMLDivElement>) {
    const last = LANGS.length - 1
    let next = activeIdx
    switch (e.key) {
      case "ArrowDown": next = activeIdx >= last ? 0 : activeIdx + 1; break
      case "ArrowUp": next = activeIdx <= 0 ? last : activeIdx - 1; break
      case "Home": next = 0; break
      case "End": next = last; break
      case "Enter":
      case " ": {
        e.preventDefault()
        const l = LANGS[activeIdx]
        setLang(l.code); setLangOpen(false)
        return
      }
      default: return
    }
    e.preventDefault()
    setActiveIdx(next)
    optionRefs.current[next]?.focus()
  }

  useEffect(() => {
    if (!langOpen) return
    function onDown(e: MouseEvent) {
      if (settingsRef.current && !settingsRef.current.contains(e.target as Node)) setLangOpen(false)
    }
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") setLangOpen(false) }
    document.addEventListener("mousedown", onDown)
    document.addEventListener("keydown", onKey)
    return () => {
      document.removeEventListener("mousedown", onDown)
      document.removeEventListener("keydown", onKey)
    }
  }, [langOpen])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  // Blog links to its own route (/blog) rather than the homepage anchor (#blog)
  const navLinks = NAV_ITEMS.map((i) => ({
    label: t.nav[i.key],
    href: i.key === "blog" ? "/blog" : i.href,
  }))
  const activeLang = LANGS.find((l) => l.code === lang) ?? LANGS[0]
  const accountLabel = ACCOUNT_LABEL[lang] ?? ACCOUNT_LABEL.fr

  return (
    <header
      className="site-header"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        background: scrolled
          ? "color-mix(in srgb, var(--ds-bg) 94%, transparent)"
          : "color-mix(in srgb, var(--ds-bg) 86%, transparent)",
        backdropFilter: "blur(18px) saturate(1.6)",
        WebkitBackdropFilter: "blur(18px) saturate(1.6)",
        borderBottom: "1px solid var(--ds-border)",
        boxShadow: scrolled ? "0 4px 20px rgba(0,0,0,0.06)" : "0 2px 12px rgba(0,0,0,0.04)",
        transition: "background 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease",
      }}
    >
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 clamp(16px, 4vw, 32px)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: "var(--header-h)" }}>

          {/* Logo */}
          <a href="#home" style={{ textDecoration: "none", display: "flex", alignItems: "center", flexShrink: 0 }}>
            <img src={logo} alt="INOV Digital Services" className="site-logo" style={{ width: "auto", display: "block", objectFit: "contain" }} />
          </a>

          {/* Desktop nav — centered, evenly spaced, takes the free space */}
          <nav
            style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 2, flex: 1, margin: "0 12px" }}
            className="hidden-mobile"
          >
            {navLinks.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="nav-link"
                style={{
                  fontFamily: "var(--font-outfit)",
                  fontSize: 13.5,
                  fontWeight: 500,
                  textDecoration: "none",
                  padding: "7px 11px",
                  borderRadius: "var(--r-full)",
                  whiteSpace: "nowrap",
                }}
              >
                {l.label}
              </a>
            ))}
          </nav>

          {/* Right controls */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>

            {/* Language selector */}
            <div style={{ position: "relative" }} ref={settingsRef}>
              {/* Desktop */}
              <button
                onClick={() => setLangOpen((o) => !o)}
                aria-haspopup="listbox"
                aria-expanded={langOpen}
                aria-label={langLabel}
                className="lang-btn-desktop"
                style={{
                  display: "flex", alignItems: "center", gap: 6,
                  fontFamily: "var(--font-outfit)", fontSize: 13, fontWeight: 700,
                  color: "var(--ds-text)",
                  background: "transparent",
                  border: "1.5px solid var(--ds-border-strong)",
                  borderRadius: "var(--r-full)",
                  padding: "5px 12px", cursor: "pointer", transition: "border-color 0.2s",
                }}
              >
                <span style={{ fontSize: 15, lineHeight: 1 }}>{activeLang.flag}</span>
                {activeLang.code.toUpperCase()}
                <span style={{ transform: langOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s", display: "inline-flex" }}>
                  <ChevronDown size={14} aria-hidden="true" />
                </span>
              </button>
              {/* Mobile: globe icon */}
              <button
                onClick={() => setLangOpen((o) => !o)}
                aria-haspopup="listbox"
                aria-expanded={langOpen}
                aria-label={langLabel}
                className="lang-btn-mobile"
                style={{
                  display: "none", alignItems: "center", justifyContent: "center",
                  width: 38, height: 38,
                  background: "transparent", border: "1.5px solid var(--ds-border-strong)", borderRadius: "50%",
                  cursor: "pointer", color: "var(--ds-text)", padding: 0,
                }}
              >
                <Globe size={18} aria-hidden="true" />
              </button>

              {langOpen && (
                <div
                  className="lang-dropdown glass"
                  style={{
                    position: "absolute", top: "calc(100% + 8px)", right: 0, minWidth: 216,
                    borderRadius: "var(--r-md)", padding: 6, zIndex: 1200,
                  }}
                >
                  <div role="listbox" aria-label={langLabel} onKeyDown={onListKey}>
                    {LANGS.map((l, i) => (
                      <button
                        key={l.code}
                        ref={(el) => { optionRefs.current[i] = el }}
                        role="option"
                        aria-selected={l.code === lang}
                        tabIndex={i === activeIdx ? 0 : -1}
                        onClick={() => { setLang(l.code); setLangOpen(false) }}
                        style={{
                          width: "100%", display: "flex", alignItems: "center", gap: 10,
                          fontFamily: "var(--font-outfit)", fontSize: 14, fontWeight: l.code === lang ? 700 : 500,
                          color: l.code === lang ? "var(--ds-text)" : "var(--ds-text-sec)",
                          background: l.code === lang ? "var(--ds-accent-a08)" : "transparent",
                          border: "none", borderRadius: "var(--r-sm)", padding: "9px 12px", cursor: "pointer", textAlign: "left",
                          transition: "background 0.15s",
                        }}
                        onMouseEnter={(e) => { if (l.code !== lang) e.currentTarget.style.background = "var(--ds-bg-sec)" }}
                        onMouseLeave={(e) => { if (l.code !== lang) e.currentTarget.style.background = "transparent" }}
                      >
                        <span style={{ fontSize: 17, lineHeight: 1 }}>{l.flag}</span>
                        {l.label}
                        {l.code === lang && <span style={{ marginLeft: "auto", color: "var(--ds-accent-text)", fontWeight: 800 }}>✓</span>}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Account link (desktop) */}
            <Link
              to="/compte"
              className="nav-link hidden-mobile"
              style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                fontFamily: "var(--font-outfit)", fontSize: 14, fontWeight: 500,
                textDecoration: "none", padding: "6px 12px", borderRadius: "var(--r-full)",
              }}
            >
              <UserRound size={16} strokeWidth={2} />
              {accountLabel}
            </Link>

            {/* CTA */}
            <Link
              to="/devis"
              className="btn-primary"
              onClick={() => track("quote_cta_click", { source: "header" })}
              style={{ padding: "10px 22px", fontSize: 13, display: "inline-flex", alignItems: "center", gap: 7 }}
            >
              <FileText size={15} strokeWidth={2.2} />
              {t.header.quote}
            </Link>

            {/* Burger */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              style={{
                display: "none", flexDirection: "column", gap: 5,
                background: "transparent", border: "none", cursor: "pointer", padding: 6,
              }}
              className="burger-btn"
              aria-label={MENU_LABEL[lang] ?? MENU_LABEL.fr}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
            >
              {[
                menuOpen ? "rotate(45deg) translateY(7px)" : "none",
                undefined,
                menuOpen ? "rotate(-45deg) translateY(-7px)" : "none",
              ].map((transform, i) => (
                <span key={i} style={{
                  width: 22, height: 2,
                  background: "var(--ds-text)",
                  borderRadius: 2, display: "block",
                  transition: "transform 0.2s, opacity 0.2s",
                  transform: transform ?? "none",
                  opacity: i === 1 ? (menuOpen ? 0 : 1) : 1,
                }} />
              ))}
            </button>
          </div>
        </div>

        {/* Mobile menu — fond blanc garanti pour rester lisible sur n'importe quelle section */}
        <div id="mobile-menu" className={`mobile-menu ${menuOpen ? "open" : ""}`} inert={!menuOpen}>
          <nav style={{ display: "flex", flexDirection: "column", paddingBottom: 16 }}>
            {navLinks.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setMenuOpen(false)}
                style={{
                  fontFamily: "var(--font-outfit)",
                  fontSize: 16,
                  fontWeight: 500,
                  color: "var(--ds-text)",
                  textDecoration: "none",
                  padding: "12px 0",
                  borderBottom: "1px solid var(--ds-border)",
                  transition: "color 0.2s",
                }}
              >
                {l.label}
              </a>
            ))}
            <Link
              to="/compte"
              onClick={() => setMenuOpen(false)}
              style={{
                display: "flex", alignItems: "center", gap: 8,
                fontFamily: "var(--font-outfit)", fontSize: 16, fontWeight: 600,
                color: "var(--ds-accent-text)", textDecoration: "none",
                padding: "12px 0", borderBottom: "1px solid var(--ds-border)",
              }}
            >
              <UserRound size={17} strokeWidth={2} />
              {accountLabel}
            </Link>
          </nav>
        </div>
      </div>

      <style>{`
        .site-logo { height: 32px; margin: 6px 8px 6px 0; }
        .lang-btn-mobile { display: none !important; }
        @media (max-width: 768px) {
          .site-header {
            background: color-mix(in srgb, var(--ds-bg) 96%, transparent) !important;
            border-bottom: 1px solid var(--ds-border-strong) !important;
            box-shadow: 0 4px 16px rgba(0,0,0,0.10) !important;
          }
          .burger-btn {
            border: 1.5px solid var(--ds-border-strong) !important;
            border-radius: 10px !important;
            padding: 8px !important;
          }
          .hidden-mobile { display: none !important; }
          .burger-btn { display: flex !important; }
          .site-logo { height: 34px; margin: 6px 6px 6px 0; }
          .lang-btn-desktop { display: none !important; }
          .lang-btn-mobile { display: flex !important; }
          .lang-dropdown { right: auto !important; left: 0 !important; }
        }
      `}</style>
    </header>
  )
}
