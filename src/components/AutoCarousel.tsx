import { useState, useEffect, useRef, useCallback, type ReactNode } from "react"
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react"
import useReducedMotion from "../hooks/useReducedMotion"
import { useSettings } from "../context/AppSettings"

interface Props {
  children: ReactNode[]
  visibleCount?: number
  interval?: number
  showDots?: boolean
  showArrows?: boolean
  mobileVisibleCount?: number
  /** Fast spin on first scroll-into-view. Off by default — only useful where the
   *  quick preview of every card adds value (e.g. the services carousel). */
  burst?: boolean
}

export default function AutoCarousel({
  children,
  visibleCount = 3,
  interval = 3500,
  showDots = true,
  showArrows = true,
  mobileVisibleCount,
  burst = false,
}: Props) {
  const reduced = useReducedMotion()
  const { t } = useSettings()
  const items = children as ReactNode[]
  const total = items.length
  // Visible play/pause toggle — lets keyboard/touch users stop the motion (WCAG 2.2.2).
  const [playing, setPlaying] = useState(true)

  // Clone first `visibleCount` at end for seamless loop
  const allItems = [...items, ...items.slice(0, visibleCount)]

  const [idx, setIdx] = useState(0)
  const [animated, setAnimated] = useState(true)
  // On first scroll-into-view the track spins one full loop very fast, then
  // settles back into its normal cadence.
  const [bursting, setBursting] = useState(false)
  const hasBurst = useRef(false)
  const paused = useRef(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const [containerWidth, setContainerWidth] = useState(0)
  const [isMobile, setIsMobile] = useState(false)

  const effectiveVisible = isMobile && mobileVisibleCount ? mobileVisibleCount : visibleCount

  // On mobile, reveal a sliver of the next card so it reads as swipeable.
  const PEEK = 0.15
  const showPeek = isMobile && effectiveVisible === 1
  const touchStartX = useRef<number | null>(null)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768)
    check()
    window.addEventListener("resize", check)
    return () => window.removeEventListener("resize", check)
  }, [])

  useEffect(() => {
    if (!containerRef.current) return
    const ro = new ResizeObserver((entries) => setContainerWidth(entries[0].contentRect.width))
    ro.observe(containerRef.current)
    return () => ro.disconnect()
  }, [])

  const itemWidth = containerWidth / (effectiveVisible + (showPeek ? PEEK : 0))

  function onTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX
    paused.current = true
  }
  function onTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null) return
    const dx = e.changedTouches[0].clientX - touchStartX.current
    if (dx <= -40) next()
    else if (dx >= 40) prev()
    touchStartX.current = null
    paused.current = false
  }

  // Reset when we overflow into clones
  useEffect(() => {
    if (idx >= total) {
      const t = setTimeout(() => {
        setAnimated(false)
        setIdx(idx - total)
        requestAnimationFrame(() => requestAnimationFrame(() => setAnimated(true)))
      }, 430)
      return () => clearTimeout(t)
    }
  }, [idx, total])

  const advance = useCallback(() => {
    if (!paused.current) setIdx((i) => i + 1)
  }, [])

  const prev = useCallback(() => {
    setIdx((i) => (i <= 0 ? total - 1 : i - 1))
  }, [total])

  const next = useCallback(() => {
    setIdx((i) => i + 1)
  }, [])

  // Trigger the fast burst the first time the carousel scrolls into view.
  useEffect(() => {
    if (!burst || reduced || hasBurst.current || !containerRef.current) return
    const el = containerRef.current
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasBurst.current) {
          hasBurst.current = true
          io.disconnect()
          setBursting(true)
        }
      },
      { threshold: 0.5 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [burst, reduced])

  // The burst itself: advance one full loop at a rapid pace, then release.
  useEffect(() => {
    if (!bursting) return
    let ticks = 0
    const timer = setInterval(() => {
      setIdx((i) => i + 1)
      ticks += 1
      if (ticks >= total) {
        clearInterval(timer)
        setBursting(false)
      }
    }, 130)
    return () => clearInterval(timer)
  }, [bursting, total])

  // Normal cadence — suspended while the intro burst is playing.
  useEffect(() => {
    if (reduced || !playing || bursting) return
    const timer = setInterval(advance, interval)
    return () => clearInterval(timer)
  }, [advance, interval, reduced, playing, bursting])

  const dotIdx = idx % total

  return (
    <div
      style={{ position: "relative" }}
      onMouseEnter={() => { paused.current = true }}
      onMouseLeave={() => { paused.current = false }}
    >
      {/* Track viewport */}
      <div
        ref={containerRef}
        style={{ overflow: "hidden", borderRadius: "var(--r-lg)", touchAction: "pan-y" }}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <div
          style={{
            display: "flex",
            width: `${(allItems.length * itemWidth)}px`,
            transform: `translateX(-${idx * itemWidth}px)`,
            transition: animated
              ? (bursting ? "transform 0.13s linear" : "transform 0.45s cubic-bezier(0.4,0,0.2,1)")
              : "none",
          }}
        >
          {allItems.map((item, i) => (
            <div
              key={i}
              style={{ width: `${itemWidth}px`, flexShrink: 0, padding: "0 10px", boxSizing: "border-box" }}
            >
              {item}
            </div>
          ))}
        </div>
      </div>

      {/* Arrows */}
      {showArrows && (
        <>
          <button
            onClick={prev}
            aria-label={t.a11y.prev}
            style={{
              position: "absolute", insetInlineStart: -18, top: "50%", transform: "translateY(-50%)",
              width: 40, height: 40, borderRadius: "50%", background: "var(--ds-bg-card)",
              border: "1.5px solid var(--ds-border)", boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
              cursor: "pointer", color: "var(--ds-text)", display: "flex", alignItems: "center",
              justifyContent: "center", zIndex: 10, transition: "all 0.2s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "var(--ds-accent)"; e.currentTarget.style.color = "#fff" }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "var(--ds-bg-card)"; e.currentTarget.style.color = "var(--ds-text)" }}
          >
            <ChevronLeft size={20} aria-hidden="true" />
          </button>
          <button
            onClick={next}
            aria-label={t.a11y.next}
            style={{
              position: "absolute", insetInlineEnd: -18, top: "50%", transform: "translateY(-50%)",
              width: 40, height: 40, borderRadius: "50%", background: "var(--ds-bg-card)",
              border: "1.5px solid var(--ds-border)", boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
              cursor: "pointer", color: "var(--ds-text)", display: "flex", alignItems: "center",
              justifyContent: "center", zIndex: 10, transition: "all 0.2s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "var(--ds-accent)"; e.currentTarget.style.color = "#fff" }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "var(--ds-bg-card)"; e.currentTarget.style.color = "var(--ds-text)" }}
          >
            <ChevronRight size={20} aria-hidden="true" />
          </button>
        </>
      )}

      {/* Dots + play/pause */}
      {showDots && (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 6, marginTop: 24 }}>
          {!reduced && (
            <button
              onClick={() => setPlaying((p) => !p)}
              aria-label={playing ? t.a11y.pause : t.a11y.play}
              style={{
                width: 24, height: 24, borderRadius: "50%", border: "none",
                background: "var(--ds-bg-card-hover)", color: "var(--ds-text)", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                marginRight: 6, flexShrink: 0, transition: "background 0.2s",
              }}
            >
              {playing ? <Pause size={12} aria-hidden="true" /> : <Play size={12} aria-hidden="true" style={{ marginLeft: 1 }} />}
            </button>
          )}
          {items.map((_, i) => (
            <button
              key={i}
              onClick={() => setIdx(i)}
              aria-label={`${t.a11y.goToSlide} ${i + 1}`}
              aria-current={dotIdx === i ? "true" : undefined}
              style={{
                width: dotIdx === i ? 24 : 8,
                height: 8, borderRadius: "var(--r-full)", border: "none", cursor: "pointer",
                background: dotIdx === i ? "var(--ds-accent)" : "var(--ds-border-strong)",
                transition: "all 0.3s ease", padding: 0,
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}
