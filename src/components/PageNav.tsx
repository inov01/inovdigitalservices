import { useState, useEffect } from "react"
import { ChevronUp, ChevronDown } from "lucide-react"
import { useSettings } from "../context/AppSettings"
import { NAV_ITEMS } from "../data/nav"

export default function PageNav() {
  const { t } = useSettings()
  const [active, setActive] = useState("home")
  const [hoveredDot, setHoveredDot] = useState<string | null>(null)

  const sections = NAV_ITEMS.map((i) => ({ id: i.id, label: t.nav[i.key] }))

  useEffect(() => {
    // Track each section's current visibility ratio so that when several are on
    // screen at once we activate the most-visible (topmost) one deterministically,
    // rather than whichever fired last.
    const ratios = new Map<string, number>()
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          ratios.set(e.target.id, e.isIntersecting ? e.intersectionRatio : 0)
        })
        let best: string | null = null
        let bestRatio = 0
        // Iterate in document order so ties resolve to the topmost section.
        sections.forEach((s) => {
          const r = ratios.get(s.id) ?? 0
          if (r > bestRatio) {
            bestRatio = r
            best = s.id
          }
        })
        if (best) setActive(best)
      },
      { threshold: [0.25, 0.5, 0.75] }
    )
    sections.forEach((s) => {
      const el = document.getElementById(s.id)
      if (el) observer.observe(el)
    })
    return () => observer.disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const currentIdx = sections.findIndex((s) => s.id === active)

  function scrollTo(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" })
  }

  function goUp() {
    if (currentIdx > 0) scrollTo(sections[currentIdx - 1].id)
  }
  function goDown() {
    if (currentIdx < sections.length - 1) scrollTo(sections[currentIdx + 1].id)
  }

  return (
    <nav
      aria-label={t.footer.navigation}
      className="page-nav"
      style={{
        position: "fixed",
        right: 20,
        top: "50%",
        transform: "translateY(-50%)",
        zIndex: 900,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 6,
      }}
    >
      {/* Up arrow */}
      <button
        onClick={goUp}
        disabled={currentIdx === 0}
        aria-label={currentIdx > 0 ? sections[currentIdx - 1].label : undefined}
        title={currentIdx > 0 ? sections[currentIdx - 1].label : undefined}
        style={{
          width: 32, height: 32, borderRadius: "50%",
          background: currentIdx === 0 ? "rgba(0,0,0,0.08)" : "#000",
          color: currentIdx === 0 ? "rgba(0,0,0,0.3)" : "#fff",
          border: "none", cursor: currentIdx === 0 ? "default" : "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          transition: "all 0.2s", boxShadow: currentIdx === 0 ? "none" : "0 2px 8px rgba(0,0,0,0.2)",
        }}
        onMouseEnter={(e) => { if (currentIdx > 0) e.currentTarget.style.background = "var(--ds-accent)" }}
        onMouseLeave={(e) => { if (currentIdx > 0) e.currentTarget.style.background = "#000" }}
      >
        <ChevronUp size={16} aria-hidden="true" />
      </button>

      {/* Section dots */}
      {sections.map((s) => (
        <div key={s.id} style={{ position: "relative" }}>
          {/* Tooltip */}
          {hoveredDot === s.id && (
            <div style={{
              position: "absolute", right: 42, top: "50%", transform: "translateY(-50%)",
              background: "#000", color: "#fff", borderRadius: "var(--r-sm)",
              padding: "5px 10px", fontFamily: "'Outfit', sans-serif", fontSize: 12, fontWeight: 600,
              whiteSpace: "nowrap", pointerEvents: "none",
              boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
            }}>
              {s.label}
              <span style={{ position: "absolute", right: -5, top: "50%", transform: "translateY(-50%)", width: 0, height: 0, borderTop: "5px solid transparent", borderBottom: "5px solid transparent", borderLeft: "5px solid #000" }} />
            </div>
          )}
          <button
            onClick={() => scrollTo(s.id)}
            onMouseEnter={() => setHoveredDot(s.id)}
            onMouseLeave={() => setHoveredDot(null)}
            onFocus={() => setHoveredDot(s.id)}
            onBlur={() => setHoveredDot(null)}
            aria-label={s.label}
            aria-current={active === s.id ? "true" : undefined}
            title={s.label}
            style={{
              width: 24, height: 24, padding: 0, border: "none",
              background: "transparent", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            <span
              aria-hidden="true"
              style={{
                width: active === s.id ? 10 : 7,
                height: active === s.id ? 10 : 7,
                borderRadius: "50%",
                background: active === s.id ? "var(--ds-accent-grad)" : "rgba(0,0,0,0.25)",
                border: active === s.id ? "2px solid var(--ds-accent-hover)" : "none",
                transition: "all 0.25s ease",
                boxShadow: active === s.id ? "0 0 0 3px var(--ds-accent-a20)" : "none",
              }}
            />
          </button>
        </div>
      ))}

      {/* Down arrow */}
      <button
        onClick={goDown}
        disabled={currentIdx === sections.length - 1}
        aria-label={currentIdx < sections.length - 1 ? sections[currentIdx + 1].label : undefined}
        title={currentIdx < sections.length - 1 ? sections[currentIdx + 1].label : undefined}
        style={{
          width: 32, height: 32, borderRadius: "50%",
          background: currentIdx === sections.length - 1 ? "rgba(0,0,0,0.08)" : "#000",
          color: currentIdx === sections.length - 1 ? "rgba(0,0,0,0.3)" : "#fff",
          border: "none", cursor: currentIdx === sections.length - 1 ? "default" : "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          transition: "all 0.2s", boxShadow: currentIdx === sections.length - 1 ? "none" : "0 2px 8px rgba(0,0,0,0.2)",
        }}
        onMouseEnter={(e) => { if (currentIdx < sections.length - 1) e.currentTarget.style.background = "var(--ds-accent)" }}
        onMouseLeave={(e) => { if (currentIdx < sections.length - 1) e.currentTarget.style.background = "#000" }}
      >
        <ChevronDown size={16} aria-hidden="true" />
      </button>
    </nav>
  )
}
