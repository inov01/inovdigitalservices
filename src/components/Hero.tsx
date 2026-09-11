import { useState, useEffect, useRef, type CSSProperties } from "react"
import { Link } from "react-router"
import { ArrowRight, Sparkles } from "lucide-react"
import { track } from "../lib/analytics"
import useIsMobile from "../hooks/useIsMobile"
import useReducedMotion from "../hooks/useReducedMotion"
import { useSettings } from "../context/AppSettings"
import { renderRich } from "../i18n/renderRich"

import showcaseFlyer from "../imports/social_flyer.webp"
import showcasePackaging from "../imports/packaging_anana.webp"
import showcaseLabel from "../imports/INOV_Digital_Services__64_.webp"
import showcaseLogo from "../imports/logo-1.webp"

const INTERVAL = 5000

// Animated count-up for the hero stat numbers. Eases from 0 to `end` on mount;
// jumps straight to the value when the user prefers reduced motion.
function CountUp({ end, duration = 1300, reduced }: { end: number; duration?: number; reduced: boolean }) {
  const [n, setN] = useState(reduced ? end : 0)
  useEffect(() => {
    if (reduced) { setN(end); return }
    let raf = 0
    const start = performance.now()
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / duration)
      const eased = 1 - Math.pow(1 - p, 3)
      setN(Math.round(eased * end))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [end, duration, reduced])
  return <>{n}</>
}

// The full pool of service visuals (same images as the "Nos services" section)
// that rotate through the circular coverflow so the animating trio keeps varying.
// Three are visible at a time — left, principal (center, largest), right — while
// the rest wait hidden behind the stack ("celui du bas n'apparaît plus").
const SHOWCASE = [showcaseFlyer, showcaseLogo, showcasePackaging, showcaseLabel]
const SHOWCASE_MS = 3000

function HeroShowcase({ isMobile, reduced }: { isMobile: boolean; reduced: boolean }) {
  const [principal, setPrincipal] = useState(0)

  useEffect(() => {
    if (reduced) return
    const timer = setInterval(() => setPrincipal((p) => (p + 1) % SHOWCASE.length), SHOWCASE_MS)
    return () => clearInterval(timer)
  }, [reduced])

  const cardW = isMobile ? 188 : 256
  const sideX = isMobile ? 110 : 152
  const height = isMobile ? 320 : 500

  const total = SHOWCASE.length

  // Map an image's offset from the principal to a visible position:
  //  offset 0        → center (principal, largest)
  //  offset 1        → right neighbour
  //  offset total-1  → left neighbour (the previous principal, receding)
  //  everything else → hidden behind the stack, faded out
  const slotFor = (offset: number) => {
    if (offset === 0) return { x: 0, y: 0, scale: 1, z: 4, opacity: 1, blur: 0, rot: 0 }
    if (offset === 1) return { x: sideX, y: -6, scale: 0.74, z: 3, opacity: 0.96, blur: 0, rot: -15 }
    if (offset === total - 1) return { x: -sideX, y: -6, scale: 0.74, z: 3, opacity: 0.96, blur: 0, rot: 15 }
    return { x: 0, y: 26, scale: 0.5, z: 0, opacity: 0, blur: 4, rot: 0 }
  }

  const figStyle = (offset: number): CSSProperties => {
    const s = slotFor(offset)
    return {
      position: "absolute",
      top: "50%",
      left: "50%",
      width: cardW,
      margin: 0,
      transformOrigin: "center center",
      transform: `translate(-50%, -50%) translate(${s.x}px, ${s.y}px) scale(${s.scale}) perspective(1000px) rotateY(${s.rot}deg)`,
      opacity: s.opacity,
      zIndex: s.z,
      filter: s.blur ? `blur(${s.blur}px)` : "none",
      transition: reduced
        ? "none"
        : "transform 0.95s cubic-bezier(0.22,1,0.36,1), opacity 0.95s ease, filter 0.95s ease",
      borderRadius: "var(--r-xl)",
      overflow: "hidden",
      background: "#fff",
      boxShadow: "0 30px 68px rgba(0,0,0,0.34), 0 0 0 1px rgba(0,0,0,0.06)",
      willChange: "transform, opacity",
    }
  }

  return (
    <div style={{ position: "relative", height, width: "100%" }} aria-hidden="true">
      {/* Warm glow anchoring the stack */}
      <div style={{
        position: "absolute", top: "8%", left: "10%", width: "80%", height: "82%",
        background: "radial-gradient(circle at 50% 45%, rgba(var(--ds-accent-rgb),0.24), transparent 64%)",
        filter: "blur(12px)", pointerEvents: "none",
      }} />
      {SHOWCASE.map((src, i) => {
        const offset = (i - principal + total) % total
        return (
          <figure key={i} style={figStyle(offset)}>
            <img src={src} alt="" fetchPriority="high" decoding="async" style={{ width: "100%", height: "auto", display: "block" }} />
          </figure>
        )
      })}
    </div>
  )
}

export default function Hero() {
  const isMobile = useIsMobile()
  const reduced = useReducedMotion()
  const { t } = useSettings()
  const slides = t.hero.slides
  const [active, setActive] = useState(0)
  const [animKey, setAnimKey] = useState(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  function goTo(i: number) {
    setActive(i)
    setAnimKey((k) => k + 1)
    if (timerRef.current) clearInterval(timerRef.current)
    if (!reduced) timerRef.current = setInterval(advance, INTERVAL)
  }

  function advance() {
    setActive((a) => (a + 1) % slides.length)
    setAnimKey((k) => k + 1)
  }

  useEffect(() => {
    if (reduced) return
    timerRef.current = setInterval(advance, INTERVAL)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced, slides.length])

  const s = slides[active]
  const anim = (cls: string) => (reduced ? undefined : cls)

  return (
    <section
      id="home"
      style={{
        background: "linear-gradient(180deg, var(--ds-bg) 0%, var(--ds-bg-sec) 100%)",
        paddingTop: isMobile ? 32 : 56,
        paddingBottom: isMobile ? 48 : 80,
        overflow: "hidden",
        position: "relative",
      }}
    >
      <style>{`
        @keyframes pf-progress { from { transform: scaleX(0) } to { transform: scaleX(1) } }
        @keyframes hero-fade-up {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes hero-float { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-14px) } }
        @keyframes glow-pulse { 0%,100% { opacity: 0.55 } 50% { opacity: 0.85 } }
        .hero-slide-in { animation: hero-fade-up 0.35s cubic-bezier(0.22,1,0.36,1) both; }
        .hero-slide-in-delay { animation: hero-fade-up 0.35s cubic-bezier(0.22,1,0.36,1) 0.06s both; }
        .hero-slide-in-delay2 { animation: hero-fade-up 0.35s cubic-bezier(0.22,1,0.36,1) 0.12s both; }
        .hero-slide-in-delay3 { animation: hero-fade-up 0.35s cubic-bezier(0.22,1,0.36,1) 0.18s both; }
        .hero-btn-primary {
          display: inline-flex; align-items: center; justify-content: center; gap: 9px;
          padding: 15px 30px;
          background: rgba(var(--ds-accent-rgb),0.62);
          backdrop-filter: blur(14px) saturate(1.6);
          -webkit-backdrop-filter: blur(14px) saturate(1.6);
          color: #fff;
          text-shadow: 0 1px 2px rgba(0,0,0,0.25);
          border-radius: var(--r-full);
          border: 1.5px solid rgba(255,255,255,0.4); cursor: pointer;
          font-family: var(--font-outfit); font-size: 15px; font-weight: 700;
          text-decoration: none; white-space: nowrap;
          box-shadow: 0 8px 32px rgba(var(--ds-accent-rgb),0.28), inset 0 1px 0 rgba(255,255,255,0.4);
          transition: all 0.25s ease;
        }
        .hero-btn-primary:hover { background: rgba(var(--ds-accent-rgb),0.75); transform: translateY(-2px); box-shadow: 0 14px 40px rgba(var(--ds-accent-rgb),0.4), inset 0 1px 0 rgba(255,255,255,0.5); }
        .hero-btn-ghost {
          display: inline-flex; align-items: center; justify-content: center; gap: 9px;
          padding: 14px 28px;
          background: transparent;
          color: var(--ds-text);
          border-radius: var(--r-full); border: 1.5px solid var(--ds-border-strong); cursor: pointer;
          font-family: var(--font-outfit); font-size: 15px; font-weight: 600;
          text-decoration: none; white-space: nowrap;
          transition: all 0.25s ease;
        }
        .hero-btn-ghost:hover { background: var(--ds-bg-card-hover); border-color: var(--ds-text); color: var(--ds-text); transform: translateY(-2px); }
        .hero-tag {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 6px 16px;
          border: 1.5px solid rgba(255,255,255,0.22);
          border-radius: var(--r-full);
          background: rgba(17,17,17,0.72);
          backdrop-filter: blur(6px);
          font-family: var(--font-outfit);
          font-size: 11.5px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase;
          color: #fff;
        }
        .hero-stat-divider { width: 1px; height: 40px; background: var(--ds-border); align-self: center; }
      `}</style>

      {/* Background decoration — orange radial glow */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          top: isMobile ? "5%" : "10%",
          right: isMobile ? "-20%" : "2%",
          width: isMobile ? "70vw" : "48vw",
          height: isMobile ? "70vw" : "48vw",
          background: "radial-gradient(circle, var(--ds-accent-a18) 0%, transparent 68%)",
          animation: reduced ? undefined : "glow-pulse 6s ease-in-out infinite",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          maxWidth: 1280,
          margin: "0 auto",
          padding: isMobile ? "0 20px" : "0 32px",
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "1.1fr 0.9fr",
          gap: isMobile ? 44 : 64,
          alignItems: "center",
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* ── Left: slide content */}
        <div>
          {/* Tag */}
          <div key={`tag-${animKey}`} className={anim("hero-slide-in")} style={{ marginBottom: isMobile ? 22 : 30 }}>
            <span className="hero-tag">
              <Sparkles size={12} aria-hidden="true" />
              {s.tag}
            </span>
          </div>

          {/* Title */}
          <h1
            key={`title-${animKey}`}
            className={`hero-title ${anim("hero-slide-in-delay") ?? ""}`.trim()}
            style={{
              maxWidth: 780,
              marginBottom: isMobile ? 18 : 24,
              color: "var(--ds-text)",
              fontSize: isMobile ? "clamp(2rem, 8vw, 3rem)" : "clamp(2.2rem, 5vw, 4rem)",
            }}
          >
            {renderRich(s.title)}
          </h1>

          {/* Subtitle */}
          <p
            key={`sub-${animKey}`}
            className={anim("hero-slide-in-delay2")}
            style={{
              fontFamily: "var(--font-outfit)",
              fontSize: isMobile ? 15.5 : 18,
              fontWeight: 400,
              lineHeight: 1.7,
              color: "var(--ds-text-sec)",
              maxWidth: 540,
              marginBottom: isMobile ? 30 : 40,
            }}
          >
            {s.sub}
          </p>

          {/* Mobile showcase — circular coverflow of the service visuals */}
          {isMobile && (
            <div style={{ marginBottom: 36 }}>
              <HeroShowcase isMobile reduced={reduced} />
              <div style={{ display: "flex", justifyContent: "center", marginTop: 8 }}>
                <div className="glass-dark" style={{ color: "#fff", borderRadius: "var(--r-md)", padding: "10px 18px", display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontFamily: "var(--font-outfit)", fontSize: 26, fontWeight: 900, color: "var(--ds-accent)", lineHeight: 1 }}>80+</span>
                  <span style={{ fontFamily: "var(--font-outfit)", fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.7)", lineHeight: 1.3 }}>{t.hero.statVisuals}</span>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div
            key={`cta-${animKey}`}
            className={anim("hero-slide-in-delay2")}
            style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: isMobile ? 40 : 52 }}
          >
            <Link
              to="/devis"
              className="hero-btn-primary"
              onClick={() => track("quote_cta_click", { source: "hero" })}
              style={isMobile ? { flex: "1 1 100%", justifyContent: "center" } : undefined}
            >
              {t.hero.ctaQuote} <ArrowRight size={17} />
            </Link>
            <a href="#pricing" className="hero-btn-ghost" style={isMobile ? { flex: "1 1 100%", justifyContent: "center" } : undefined}>
              {t.hero.ctaPricing}
            </a>
          </div>

          {/* Stats */}
          <div
            key={`stats-${animKey}`}
            className={anim("hero-slide-in-delay3")}
            style={{
              borderTop: "1px solid var(--ds-border)",
              paddingTop: isMobile ? 28 : 36,
              display: "flex",
              gap: isMobile ? 28 : 40,
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            <div key="stat-brands">
              <div style={{ fontFamily: "var(--font-outfit)", fontSize: isMobile ? 34 : 44, fontWeight: 900, color: "var(--ds-text)", lineHeight: 1, letterSpacing: "-0.02em" }}>
                <span style={{ color: "var(--ds-accent)" }}><CountUp end={20} reduced={reduced} /></span>
                <span style={{ color: "var(--ds-accent)", fontSize: isMobile ? 28 : 36 }}>+</span>
              </div>
              <div style={{ fontFamily: "var(--font-outfit)", fontSize: 13, color: "var(--ds-text-muted)", marginTop: 6, fontWeight: 500, letterSpacing: "0.01em" }}>{t.hero.statBrands}</div>
            </div>
            <div key="stat-divider" className="hero-stat-divider" />
            <div key="stat-visuals">
              <div style={{ fontFamily: "var(--font-outfit)", fontSize: isMobile ? 34 : 44, fontWeight: 900, color: "var(--ds-text)", lineHeight: 1, letterSpacing: "-0.02em" }}>
                <span style={{ color: "var(--ds-accent)" }}><CountUp end={80} reduced={reduced} /></span>
                <span style={{ color: "var(--ds-accent)", fontSize: isMobile ? 28 : 36 }}>+</span>
              </div>
              <div style={{ fontFamily: "var(--font-outfit)", fontSize: 13, color: "var(--ds-text-muted)", marginTop: 6, fontWeight: 500, letterSpacing: "0.01em" }}>{t.hero.statVisuals}</div>
            </div>
          </div>

          {/* Slide indicators */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: isMobile ? 32 : 44 }}>
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                aria-label={`Slide ${i + 1}`}
                style={{
                  position: "relative",
                  height: 3,
                  width: i === active ? (isMobile ? 44 : 56) : 16,
                  borderRadius: "var(--r-full)",
                  border: "none",
                  background: i === active ? "var(--ds-border-strong)" : "var(--ds-border)",
                  padding: 0,
                  cursor: "pointer",
                  overflow: "hidden",
                  transition: "width 0.35s cubic-bezier(0.4,0,0.2,1)",
                  flexShrink: 0,
                }}
              >
                {i === active && !reduced && (
                  <span
                    key={animKey}
                    style={{
                      position: "absolute",
                      inset: 0,
                      background: "var(--ds-accent)",
                      borderRadius: "var(--r-full)",
                      transformOrigin: "left center",
                      animation: `pf-progress ${INTERVAL}ms linear forwards`,
                    }}
                  />
                )}
                {i === active && reduced && (
                  <span style={{ position: "absolute", inset: 0, background: "var(--ds-accent)", borderRadius: "var(--r-full)" }} />
                )}
              </button>
            ))}
            <span style={{ fontFamily: "var(--font-outfit)", fontSize: 12, fontWeight: 600, color: "var(--ds-text-faint)", marginLeft: 6 }}>
              {active + 1} / {slides.length}
            </span>
          </div>
        </div>

        {/* ── Right: circular coverflow of the service visuals */}
        {!isMobile && (
          <div style={{ position: "relative", height: 530 }}>
            <HeroShowcase isMobile={false} reduced={reduced} />

            {/* Floating badge */}
            <div className="glass-dark" style={{
              position: "absolute", bottom: 8, left: 20, zIndex: 6,
              color: "#fff", borderRadius: "var(--r-lg)", padding: "14px 20px",
              display: "flex", alignItems: "center", gap: 14,
            }}>
              <div style={{ width: 44, height: 44, borderRadius: "var(--r-md)", background: "var(--ds-accent-a18)", border: "1px solid var(--ds-accent-a30)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <span style={{ fontFamily: "var(--font-outfit)", fontSize: 22, fontWeight: 900, color: "var(--ds-accent)", lineHeight: 1 }}>80</span>
              </div>
              <div>
                <div style={{ fontFamily: "var(--font-outfit)", fontSize: 13.5, fontWeight: 700, color: "#fff", lineHeight: 1.2 }}>
                  {t.hero.statVisuals}
                </div>
                <div style={{ fontFamily: "var(--font-outfit)", fontSize: 11, fontWeight: 500, color: "rgba(255,255,255,0.45)", marginTop: 3 }}>
                  visuels livrés
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
