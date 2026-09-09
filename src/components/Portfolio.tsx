import { useState, useEffect, useRef, useCallback, useMemo } from "react"
import { createPortal } from "react-dom"
// Portfolio albums — logo albums drive the carousel; others go to "Autres réalisations".
import { Building2, Eye, Images, FolderOpen, Flame, X, MessageSquare, ChevronLeft, ChevronRight, Play, Pause } from "lucide-react"
import useIsMobile from "../hooks/useIsMobile"
import useReducedMotion from "../hooks/useReducedMotion"
import useModal from "../hooks/useModal"
import SmartImage from "./SmartImage"
import { useSettings } from "../context/AppSettings"
import { smoothScrollToId } from "../lib/smoothScroll"

import { albums as staticAlbums, ytThumb, workPoster, onThumbError, type Work, type Album } from "../data/portfolio"
import { api, type AdminAlbum } from "../lib/api"

const AUTOPLAY_MS = 4200

// Map an admin-added portfolio item onto the render-time Album shape.
function adminToAlbum(a: AdminAlbum): Album {
  return {
    id: a.id,
    client: a.client,
    ceo: a.ceo,
    logo: a.group === "client" ? (a.logo || null) : null,
    tagline: a.tagline,
    accent: a.accent,
    impact: a.impact,
    serviceIds: [],
    serviceLabels: a.serviceLabels ?? [],
    works: a.works.map((w) => ({ img: w.img, videoId: w.videoId, title: w.title, category: w.category, desc: w.desc })),
  }
}

function requestSimilarProject(serviceIds: number[]) {
  smoothScrollToId("pricing")
  window.dispatchEvent(new CustomEvent("preselect-services", { detail: serviceIds }))
}

// Desktop: 2 full cards + half peek. Mobile: 2 full cards + 5% peek of next.
const CARD_WIDTH_DESKTOP = 37
const CARD_WIDTH_MOBILE = 46
const GAP_DESKTOP = 20
const GAP_MOBILE = 12

export default function Portfolio() {
  const isMobile = useIsMobile()
  const reduced = useReducedMotion()
  const { t } = useSettings()
  const [activeAlbum, setActiveAlbum] = useState<Album | null>(null)
  const [current, setCurrent] = useState(0)
  const [paused, setPaused] = useState(false)
  // Explicit play/pause toggle (independent of hover pausing) — WCAG 2.2.2.
  const [userPaused, setUserPaused] = useState(false)
  // On first scroll-into-view the carousel spins one full loop very fast, then
  // settles into its normal autoplay cadence.
  const [bursting, setBursting] = useState(false)
  const hasBurst = useRef(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Admin-managed overrides (hidden built-ins + added albums), fetched once.
  const [addedAlbums, setAddedAlbums] = useState<Album[]>([])
  const [removedIds, setRemovedIds] = useState<string[]>([])
  useEffect(() => {
    api.getSettings()
      .then((r) => {
        const s = r.settings
        if (!s) return
        if (Array.isArray(s.albumsRemoved)) setRemovedIds(s.albumsRemoved)
        if (Array.isArray(s.albumsAdded)) setAddedAlbums(s.albumsAdded.map(adminToAlbum))
      })
      .catch(() => {})
  }, [])

  const albums = useMemo(() => {
    const removed = new Set(removedIds)
    return [...staticAlbums.filter((a) => !removed.has(a.id)), ...addedAlbums]
  }, [addedAlbums, removedIds])
  const logoAlbums = useMemo(() => albums.filter((a) => a.logo), [albums])
  const otherAlbums = useMemo(() => albums.filter((a) => !a.logo), [albums])
  const total = logoAlbums.length

  const cardWidthPct = isMobile ? CARD_WIDTH_MOBILE : CARD_WIDTH_DESKTOP
  const gap = isMobile ? GAP_MOBILE : GAP_DESKTOP
  // Measure the viewport so the slide step (card width + gap) is exact in px,
  // instead of the old approximate "%-of-unknown-width" that drifted over time.
  const viewportRef = useRef<HTMLDivElement>(null)
  const [viewportW, setViewportW] = useState(0)
  useEffect(() => {
    if (!viewportRef.current) return
    const ro = new ResizeObserver((entries) => setViewportW(entries[0].contentRect.width))
    ro.observe(viewportRef.current)
    return () => ro.disconnect()
  }, [])
  const stepPx = (viewportW * cardWidthPct) / 100 + gap

  const next = useCallback(() => setCurrent((c) => (c + 1) % total), [total])
  const prev = useCallback(() => setCurrent((c) => (c - 1 + total) % total), [total])

  // Touch swipe (mobile)
  const touchX = useRef<number | null>(null)
  const onTouchStart = (e: React.TouchEvent) => { touchX.current = e.touches[0].clientX; setPaused(true) }
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchX.current === null) return
    const dx = e.changedTouches[0].clientX - touchX.current
    if (dx < -40) next()
    else if (dx > 40) prev()
    touchX.current = null
    setPaused(false)
  }

  // Trigger the burst the first time the carousel scrolls into view.
  useEffect(() => {
    if (reduced || hasBurst.current || !viewportRef.current) return
    const el = viewportRef.current
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
  }, [reduced])

  // The burst itself: advance one full loop rapidly, then release.
  useEffect(() => {
    if (!bursting) return
    let ticks = 0
    const timer = setInterval(() => {
      next()
      ticks += 1
      // Stop one short of a full loop so the burst never does the fast
      // reverse-wrap; the normal (slow) autoplay handles the return to 0.
      if (ticks >= total - 1) {
        clearInterval(timer)
        setBursting(false)
      }
    }, 150)
    return () => clearInterval(timer)
  }, [bursting, next, total])

  useEffect(() => {
    if (paused || userPaused || reduced || bursting) return
    timerRef.current = setInterval(next, AUTOPLAY_MS)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [paused, userPaused, next, reduced, bursting])

  // Open a specific album when requested from elsewhere (e.g. founder bio link).
  useEffect(() => {
    function onOpenAlbum(e: Event) {
      const id = (e as CustomEvent<string>).detail
      const album = albums.find((a) => a.id === id)
      if (album) setActiveAlbum(album)
    }
    window.addEventListener("open-album", onOpenAlbum)
    return () => window.removeEventListener("open-album", onOpenAlbum)
  }, [])

  const totalVisuals = albums.reduce((n, a) => n + a.works.length, 0)

  return (
    <section id="portfolio" style={{ background: "var(--ds-bg-card)", padding: isMobile ? "60px 0" : "96px 0", overflow: "hidden" }}>
      <style>{`
        @keyframes pf-rise { from { opacity: 0; transform: translateY(28px) } to { opacity: 1; transform: translateY(0) } }
        @keyframes pf-progress { from { transform: scaleX(0) } to { transform: scaleX(1) } }
        @keyframes pf-pop { 0% { opacity: 0; transform: scale(0.92) } 100% { opacity: 1; transform: scale(1) } }
        @keyframes pf-slideup { 0% { opacity: 0; transform: translateY(100%) } 100% { opacity: 1; transform: translateY(0) } }
        .pf-reveal { animation: pf-rise 0.7s cubic-bezier(0.22,1,0.36,1) both }
      `}</style>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: isMobile ? "0 16px" : "0 32px" }}>

        {/* Section header */}
        <div style={{ textAlign: "center", marginBottom: 32 }} className="pf-reveal">
          <div style={{ marginBottom: 20 }}>
            <span className="section-tag"><span className="dot-pulse" />{t.portfolio.tag}</span>
          </div>
          <h2 className="section-title" style={{ marginBottom: 16 }}>{t.portfolio.title}</h2>
          <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: 17.6, color: "var(--ds-text-sec)", maxWidth: 540, margin: "0 auto", lineHeight: 1.7 }}>
            {t.portfolio.subtitle}
          </p>
        </div>

        {/* Trust strip — quick credibility signals */}
        <div
          className="pf-reveal"
          style={
            isMobile
              ? { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, marginBottom: 40 }
              : { display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 0, marginBottom: 56 }
          }
        >
          {t.portfolio.trust.map((s, i) => (
            <div
              key={s.l}
              style={
                isMobile
                  ? { textAlign: "center", background: "var(--ds-bg-sec)", borderRadius: "var(--r-md)", padding: "16px 10px" }
                  : { display: "flex", alignItems: "center" }
              }
            >
              {!isMobile && i > 0 && <span style={{ width: 1, height: 30, background: "var(--ds-border)", margin: "0 22px" }} />}
              <div style={{ textAlign: "center" }}>
                <div style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: 24, color: "var(--ds-accent)", lineHeight: 1 }}>{s.n}</div>
                <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 11.5, color: "var(--ds-text-muted)", marginTop: 5, letterSpacing: "0.02em" }}>{s.l}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Carousel */}
        <div
          style={{ position: "relative" }}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          {/* Track — overflow visible so partial next card peeks */}
          <div ref={viewportRef} style={{ overflow: "hidden" }} onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
            <div
              style={{
                display: "flex",
                gap,
                transition: bursting
                  ? "transform 0.16s linear"
                  : "transform 0.55s cubic-bezier(0.4,0,0.2,1)",
                transform: `translateX(-${current * stepPx}px)`,
              }}
            >
              {logoAlbums.map((album) => (
                <div
                  key={album.id}
                  style={{ minWidth: `${cardWidthPct}%`, maxWidth: `${cardWidthPct}%` }}
                >
                  <AlbumCard album={album} onOpen={() => setActiveAlbum(album)} />
                </div>
              ))}
            </div>
          </div>

          {/* Arrows — desktop only; mobile uses swipe + dots */}
          {!isMobile && (
            <>
              <button
                onClick={prev}
                aria-label={t.a11y.prev}
                style={{
                  position: "absolute", top: "50%", insetInlineStart: -18, transform: "translateY(-50%)",
                  width: 40, height: 40, borderRadius: "50%",
                  background: "var(--ds-bg-card)", border: "1.5px solid var(--ds-border)",
                  boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
                  cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                  color: "var(--ds-text)", zIndex: 10, transition: "transform 0.2s",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-50%) scale(1.12)" }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(-50%)" }}
              ><ChevronLeft size={20} aria-hidden="true" /></button>
              <button
                onClick={next}
                aria-label={t.a11y.next}
                style={{
                  position: "absolute", top: "50%", insetInlineEnd: -18, transform: "translateY(-50%)",
                  width: 40, height: 40, borderRadius: "50%",
                  background: "var(--ds-bg-card)", border: "1.5px solid var(--ds-border)",
                  boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
                  cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                  color: "var(--ds-text)", zIndex: 10, transition: "transform 0.2s",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-50%) scale(1.12)" }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(-50%)" }}
              ><ChevronRight size={20} aria-hidden="true" /></button>
            </>
          )}

          {/* Dots + play/pause */}
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 8, marginTop: 24 }}>
            {!reduced && (
              <button
                onClick={() => setUserPaused((p) => !p)}
                aria-label={userPaused ? t.a11y.play : t.a11y.pause}
                style={{
                  width: 24, height: 24, borderRadius: "50%", border: "none",
                  background: "var(--ds-border)", color: "var(--ds-text)", cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  marginRight: 4, flexShrink: 0, transition: "background 0.2s",
                }}
              >
                {userPaused ? <Play size={12} aria-hidden="true" style={{ marginLeft: 1 }} /> : <Pause size={12} aria-hidden="true" />}
              </button>
            )}
            {logoAlbums.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                aria-label={`${t.a11y.goToSlide} ${i + 1}`}
                style={{
                  width: i === current ? 28 : 8, height: 8, borderRadius: "var(--r-full)",
                  background: i === current ? "var(--ds-accent)" : "var(--ds-border-strong)",
                  border: "none", padding: 0, cursor: "pointer",
                  transition: "width 0.35s, background 0.35s",
                }}
              />
            ))}
          </div>

          {/* Swipe hint — mobile only */}
          {isMobile && (
            <div style={{ textAlign: "center", marginTop: 12, fontFamily: "'Outfit', sans-serif", fontSize: 11.5, fontWeight: 600, color: "var(--ds-text-muted)", letterSpacing: "0.04em" }}>
              {t.portfolio.swipeHint}
            </div>
          )}

          {/* Autoplay progress bar — restarts each slide, freezes on hover (hidden when reduced motion) */}
          {!reduced && (
            <div style={{ width: 180, height: 3, borderRadius: "var(--r-full)", background: "var(--ds-border)", margin: "16px auto 0", overflow: "hidden" }}>
              <div
                key={`${current}-${paused}-${userPaused}`}
                style={{
                  height: "100%", borderRadius: "var(--r-full)",
                  background: "linear-gradient(90deg,var(--ds-accent),var(--ds-accent-light))",
                  transformOrigin: "left",
                  animation: `pf-progress ${AUTOPLAY_MS}ms linear forwards`,
                  animationPlayState: paused || userPaused ? "paused" : "running",
                }}
              />
            </div>
          )}
        </div>

        {/* ── "Autre" section — projects without a client logo yet */}
        {otherAlbums.length > 0 && (
          <div style={{ marginTop: isMobile ? 64 : 88 }}>
            <div style={{ textAlign: "center", marginBottom: 32 }}>
              <h3 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: isMobile ? 24 : 30, color: "var(--ds-text)", marginBottom: 10 }}>
                {t.portfolio.otherTitle}
              </h3>
              <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: 15.5, color: "var(--ds-text-sec)", maxWidth: 480, margin: "0 auto", lineHeight: 1.6 }}>
                {t.portfolio.otherSubtitle}
              </p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(3, 1fr)", gap: isMobile ? 12 : 20, alignItems: "start" }}>
              {otherAlbums.map((album) => (
                <AlbumCard key={album.id} album={album} onOpen={() => setActiveAlbum(album)} />
              ))}
            </div>
          </div>
        )}

        {/* CTA */}
        <div style={{ textAlign: "center", marginTop: 48 }}>
          <a href="https://www.instagram.com/inov_digital_services" target="_blank" rel="noreferrer" className="btn-secondary">
            {t.portfolio.seeAllInstagram}
          </a>
        </div>
      </div>

      {/* Album modal */}
      {activeAlbum && (
        <AlbumModal album={activeAlbum} onClose={() => setActiveAlbum(null)} />
      )}
    </section>
  )
}

/* ─── Album Card ─────────────────────────────────────────────── */
function AlbumCard({ album, onOpen }: { album: Album; onOpen: () => void }) {
  const { t } = useSettings()
  const [hovered, setHovered] = useState(false)
  // Touch devices have no hover — reveal the "view album" affordance on touch, then
  // fade it back out shortly after the finger leaves the card.
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const revealOnTouch = () => {
    if (hideTimer.current) clearTimeout(hideTimer.current)
    setHovered(true)
  }
  const scheduleHide = () => {
    if (hideTimer.current) clearTimeout(hideTimer.current)
    hideTimer.current = setTimeout(() => setHovered(false), 300)
  }
  useEffect(() => () => { if (hideTimer.current) clearTimeout(hideTimer.current) }, [])
  const showOverlay = hovered
  const loc = t.portfolio.albums[album.id]
  const cover = { ...album.works[0], ...(loc?.works?.[0] ?? {}) }
  const accent = album.accent ?? "var(--ds-accent)"
  const useLogoCover = !!album.logo
  const coverSrc = album.logo ?? workPoster(cover)
  const coverIsVideo = !album.logo && !!cover.videoId
  // Motion Design card: pin to the same 16:9 cover box as the Montage Vidéo card.
  const fixedVideoCover = album.id === "motion-design"

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onTouchStart={revealOnTouch}
      onTouchEnd={scheduleHide}
      onTouchCancel={scheduleHide}
      style={{
        borderRadius: "var(--r-xl)",
        border: `1.5px solid ${hovered ? accent : "var(--ds-border)"}`,
        overflow: "hidden",
        background: "var(--ds-ink)",
        boxShadow: hovered ? `0 20px 54px ${accent}44` : "0 4px 20px rgba(0,0,0,0.08)",
        transition: "box-shadow 0.35s, border-color 0.35s, transform 0.35s",
        transform: hovered ? "translateY(-6px)" : "translateY(0)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* ── Cover image — 1080×1320 (9:11) cropped */}
      <div
        onClick={onOpen}
        style={{
          cursor: "pointer", position: "relative", overflow: "hidden",
          background: useLogoCover ? (album.logoBg ?? "#fff") : "#000",
          aspectRatio: useLogoCover ? "1 / 1" : fixedVideoCover ? "16 / 9" : undefined,
        }}
      >
        <img
          src={coverSrc}
          alt={useLogoCover ? album.client : cover.title}
          loading="lazy"
          decoding="async"
          onError={coverIsVideo ? (e) => onThumbError(e, cover.videoId) : undefined}
          style={
            useLogoCover
              ? {
                  // Logos: square box, centered. Respect each album's logoFit —
                  // "contain" logos are padded (not cropped) so wordmarks stay legible.
                  width: "100%", height: "100%", display: "block",
                  objectFit: "cover", objectPosition: "center",
                  padding: 0,
                  transition: "transform 0.45s ease",
                  transform: hovered ? "scale(1.05)" : "scale(1)",
                }
              : fixedVideoCover
              ? {
                  // Motion Design: fill the fixed 16:9 box like the Montage Vidéo card
                  width: "100%", height: "100%", display: "block",
                  objectFit: "cover", objectPosition: "center",
                  transition: "transform 0.45s ease",
                  transform: hovered ? "scale(1.05)" : "scale(1)",
                }
              : {
                  // Other images: box follows the image's own ratio, never cropped
                  width: "100%", height: "auto", display: "block",
                  transition: "transform 0.45s ease",
                  transform: hovered ? "scale(1.05)" : "scale(1)",
                }
          }
        />
        {/* Hover overlay */}
        <div style={{
          position: "absolute", inset: 0,
          background: "rgba(0,0,0,0.4)",
          opacity: showOverlay ? 1 : 0, transition: "opacity 0.3s",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <span className="btn-orange" style={{
            display: "inline-flex", alignItems: "center", gap: 7,
            fontFamily: "'Outfit', sans-serif", fontSize: 13, fontWeight: 800,
            color: "#fff", borderRadius: "var(--r-full)", padding: "10px 22px",
          }}>
            <Eye size={16} /> {t.portfolio.viewAlbum.replace("{n}", String(album.works.length))}
          </span>
        </div>
        {/* Category pill */}
        <span style={{
          position: "absolute", top: 10, insetInlineStart: 10,
          background: accent, color: "#fff", borderRadius: "var(--r-full)", padding: "3px 11px",
          fontFamily: "'Outfit', sans-serif", fontSize: 9.5, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase",
        }}>{cover.category}</span>

        {/* Persistent play button for video covers */}
        {coverIsVideo && (
          <span aria-hidden="true" style={{
            position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
            width: 56, height: 56, borderRadius: "50%",
            background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)", border: "2px solid rgba(255,255,255,0.85)",
            display: "flex", alignItems: "center", justifyContent: "center",
            opacity: hovered ? 0 : 1, transition: "opacity 0.3s",
          }}>
            <Play size={22} color="#fff" fill="#fff" style={{ marginLeft: 3 }} />
          </span>
        )}

        {/* Persistent stacked-photos count badge */}
        <div style={{ position: "absolute", top: 10, insetInlineEnd: 10, display: "flex", alignItems: "center" }}>
          <span style={{ width: 24, height: 24, borderRadius: "var(--r-sm)", background: "rgba(255,255,255,0.22)", border: "1.5px solid rgba(255,255,255,0.4)", position: "absolute", insetInlineEnd: 4, top: -3, transform: "rotate(6deg)" }} />
          <span style={{
            position: "relative", display: "flex", alignItems: "center", gap: 5,
            background: "rgba(0,0,0,0.62)", backdropFilter: "blur(6px)",
            border: "1px solid rgba(255,255,255,0.18)",
            color: "#fff", borderRadius: "var(--r-sm)", padding: "4px 9px",
            fontFamily: "'Outfit', sans-serif", fontSize: 11, fontWeight: 800,
          }}>
            <Images size={12} />{album.works.length}
          </span>
        </div>
      </div>

      {/* ── Slim footer: client name + open */}
      <button
        onClick={onOpen}
        style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, width: "100%", padding: "13px 16px", background: "transparent", border: "none", borderTop: "1px solid rgba(255,255,255,0.06)", cursor: "pointer", textAlign: "left" }}
      >
        <span style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: 14, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{album.client}</span>
        <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 30, height: 30, borderRadius: "50%", background: hovered ? accent : "rgba(255,255,255,0.1)", color: "#fff", flexShrink: 0, transition: "background 0.25s" }}>
          <FolderOpen size={15} />
        </span>
      </button>
    </div>
  )
}

/* ─── Album Modal ────────────────────────────────────────────── */
function AlbumModal({ album, onClose }: { album: Album; onClose: () => void }) {
  const isMobile = useIsMobile()
  const { t } = useSettings()
  const loc = t.portfolio.albums[album.id]
  const tagline = loc?.tagline ?? album.tagline
  const serviceLabels = loc?.serviceLabels ?? album.serviceLabels
  const [imgIndex, setImgIndex] = useState(0)
  const [playing, setPlaying] = useState(false)
  // Escape, scroll lock, focus trap + focus return handled centrally.
  const dialogRef = useModal<HTMLDivElement>(true, onClose)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") setImgIndex((i) => (i + 1) % album.works.length)
      if (e.key === "ArrowLeft") setImgIndex((i) => (i - 1 + album.works.length) % album.works.length)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [album])

  // Stop any playing video when the visitor navigates to another work.
  useEffect(() => { setPlaying(false) }, [imgIndex])

  const work = { ...album.works[imgIndex], ...(loc?.works?.[imgIndex] ?? {}) }

  // Rendered through a portal to document.body so the fixed overlay centers on the
  // viewport — otherwise the transformed RevealSection ancestor becomes its containing block.
  return createPortal(
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 9000,
        background: "rgba(0,0,0,0.85)", backdropFilter: "blur(8px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: isMobile ? 12 : 24,
      }}
    >
      <div
        ref={dialogRef}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={album.client}
        style={{
          background: "#111",
          borderRadius: isMobile ? 20 : 24,
          overflowY: "auto", overflowX: "hidden",
          maxWidth: 860, width: "100%", maxHeight: isMobile ? "90vh" : "92vh",
          display: "flex", flexDirection: "column",
          boxShadow: "0 32px 80px rgba(0,0,0,0.6)",
          animation: "pf-pop 0.35s cubic-bezier(0.22,1,0.36,1) both",
        }}
      >
        {/* Modal header */}
        <div style={{ padding: "14px 20px", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 11, minWidth: 0 }}>
              {album.logo ? (
                <div style={{ width: 38, height: 38, borderRadius: "var(--r-sm)", background: album.logoBg ?? "#fff", overflow: "hidden", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <img src={album.logo} alt={album.client} loading="lazy" decoding="async" style={{ width: "100%", height: "100%", objectFit: "cover", padding: 0 }} />
                </div>
              ) : (
                <div style={{ width: 38, height: 38, borderRadius: "var(--r-sm)", background: "var(--ds-accent-a20)", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}><Building2 size={17} color="var(--ds-accent)" /></div>
              )}
              <div style={{ minWidth: 0 }}>
                <div style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: 15, color: "#fff", lineHeight: 1.2 }}>{album.client}</div>
                <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 11.5, color: "rgba(255,255,255,0.45)", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{tagline}</div>
                {album.ceo && (
                  <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 11, color: "rgba(255,255,255,0.30)", marginTop: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>PDG · {album.ceo}</div>
                )}
              </div>
            </div>
            {album.origin && (
              <span
                title={album.originNote}
                style={{
                  display: "inline-flex", alignItems: "center", gap: 5, flexShrink: 0,
                  fontFamily: "'Outfit', sans-serif", fontSize: 9.5, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase",
                  color: "rgba(255,255,255,0.75)", background: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.16)", borderRadius: "var(--r-full)", padding: "4px 10px",
                }}
              >
                {album.origin === "modified" ? t.portfolio.originModified : t.portfolio.originClient}
              </span>
            )}
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
              <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 11.5, fontWeight: 700, color: "rgba(255,255,255,0.4)" }}>{imgIndex + 1} / {album.works.length}</span>
              <button onClick={onClose} aria-label={t.pricing.close} style={{ background: "rgba(255,255,255,0.08)", border: "none", color: "#fff", width: 30, height: 30, borderRadius: "50%", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><X size={15} /></button>
            </div>
          </div>
          {/* Service tags */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 11 }}>
            {serviceLabels.map((label) => (
              <span key={label} style={{ fontFamily: "'Outfit', sans-serif", fontSize: 9.5, fontWeight: 700, color: "rgba(255,255,255,0.6)", background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "var(--r-full)", padding: "3px 10px", letterSpacing: "0.06em", textTransform: "uppercase" }}>
                {label}
              </span>
            ))}
          </div>
          {(album.originNote) && (
            <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: 11.5, lineHeight: 1.5, color: "rgba(255,255,255,0.5)", marginTop: 10, marginBottom: 0 }}>
              {album.originNote}
            </p>
          )}
        </div>

        {/* Main image — videos keep a fixed 16:9-ish box; static images shrink-wrap to their own ratio */}
        <div style={{ position: "relative", background: "#000", flexShrink: 0, height: work.videoId ? (isMobile ? "50vh" : "58vh") : "auto", maxHeight: isMobile ? "62vh" : "68vh", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", padding: 8 }}>
          {work.videoId ? (
            playing ? (
              <div style={{ position: "relative", width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <iframe
                  key={work.videoId}
                  src={`https://www.youtube.com/embed/${work.videoId}?autoplay=1&rel=0&modestbranding=1&playsinline=1`}
                  title={work.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                  style={{ width: "100%", aspectRatio: "16 / 9", maxHeight: "100%", border: "none", borderRadius: "var(--r-md)", background: "#000" }}
                />
                <a
                  href={`https://www.youtube.com/watch?v=${work.videoId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ position: "absolute", bottom: 10, insetInlineEnd: 14, fontFamily: "'Outfit', sans-serif", fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.75)", textDecoration: "none", background: "rgba(0,0,0,0.55)", padding: "4px 10px", borderRadius: "var(--r-full)" }}
                >
                  {(t.portfolio.playVideo ?? "Regarder") + " ↗"}
                </a>
              </div>
            ) : (
              <button
                onClick={() => setPlaying(true)}
                aria-label={`${t.portfolio.playVideo ?? "Lire la vidéo"} — ${work.title}`}
                style={{ position: "relative", width: "100%", height: "100%", border: "none", background: "transparent", cursor: "pointer", padding: 0, display: "flex", alignItems: "center", justifyContent: "center" }}
              >
                <SmartImage
                  src={workPoster(work)}
                  alt={work.title}
                  onError={(e) => onThumbError(e, work.videoId)}
                  wrapperStyle={{ maxWidth: "100%", maxHeight: "100%" }}
                  style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain", display: "block" }}
                />
                <span aria-hidden="true" style={{
                  position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
                  width: 74, height: 74, borderRadius: "50%",
                  background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)", border: "2.5px solid rgba(255,255,255,0.9)",
                  display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 8px 30px rgba(0,0,0,0.5)",
                }}>
                  <Play size={30} color="#fff" fill="#fff" style={{ marginLeft: 4 }} />
                </span>
              </button>
            )
          ) : (
            <SmartImage
              key={imgIndex}
              src={work.img}
              alt={work.title}
              spinnerColor="var(--ds-accent)"
              wrapperStyle={{ maxWidth: "100%", maxHeight: "100%", minHeight: 120, minWidth: 120 }}
              style={{ maxWidth: "100%", maxHeight: isMobile ? "58vh" : "64vh", width: "auto", height: "auto", objectFit: "contain", display: "block" }}
            />
          )}
          {album.works.length > 1 && (
            <>
              <button onClick={() => setImgIndex((i) => (i - 1 + album.works.length) % album.works.length)} aria-label={t.a11y.prev} style={{ position: "absolute", insetInlineStart: 10, top: "50%", transform: "translateY(-50%)", width: 36, height: 36, borderRadius: "50%", background: "rgba(0,0,0,0.6)", border: "none", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><ChevronLeft size={20} aria-hidden="true" /></button>
              <button onClick={() => setImgIndex((i) => (i + 1) % album.works.length)} aria-label={t.a11y.next} style={{ position: "absolute", insetInlineEnd: 10, top: "50%", transform: "translateY(-50%)", width: 36, height: 36, borderRadius: "50%", background: "rgba(0,0,0,0.6)", border: "none", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><ChevronRight size={20} aria-hidden="true" /></button>
            </>
          )}
          <span style={{ position: "absolute", top: 10, insetInlineStart: 10, background: "var(--ds-accent)", color: "#fff", borderRadius: "var(--r-full)", padding: "3px 11px", fontFamily: "'Outfit', sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>{work.category}</span>
        </div>

        {/* Info + conversion CTA */}
        <div style={{ padding: "14px 20px", borderTop: "1px solid rgba(255,255,255,0.07)", display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
          <div style={{ flex: "1 1 280px" }}>
            <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 15, fontWeight: 800, color: "#fff", marginBottom: 5 }}>{work.title}</div>
            <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 12.5, color: "rgba(255,255,255,0.5)", lineHeight: 1.6 }}>{work.desc}</div>
          </div>
          <div style={{ display: "flex", gap: 9, flexWrap: "wrap" }}>
            <button
              onClick={() => { onClose(); requestSimilarProject(album.serviceIds) }}
              style={{ display: "inline-flex", alignItems: "center", gap: 7, fontFamily: "'Outfit', sans-serif", fontSize: 13, fontWeight: 800, background: album.accent ?? "var(--ds-accent)", color: "#fff", border: "none", borderRadius: "var(--r-full)", padding: "11px 20px", cursor: "pointer", whiteSpace: "nowrap", boxShadow: `0 8px 24px ${(album.accent ?? "var(--ds-accent)")}55`, transition: "transform 0.2s" }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)" }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)" }}
            >
              <Flame size={15} /> {t.portfolio.iWantLikeThis}
            </button>
            <button
              onClick={() => { onClose(); smoothScrollToId("contact") }}
              style={{ display: "inline-flex", alignItems: "center", gap: 7, fontFamily: "'Outfit', sans-serif", fontSize: 13, fontWeight: 700, background: "rgba(255,255,255,0.08)", color: "#fff", border: "1px solid rgba(255,255,255,0.16)", borderRadius: "var(--r-full)", padding: "11px 18px", cursor: "pointer", whiteSpace: "nowrap", transition: "background 0.2s" }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.15)" }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.08)" }}
            >
              <MessageSquare size={15} /> {t.nav.contact}
            </button>
          </div>
        </div>

        {/* Thumbnail strip */}
        {album.works.length > 1 && (
          <div style={{ display: "flex", gap: 8, padding: "10px 20px 14px", overflowX: "auto", borderTop: "1px solid rgba(255,255,255,0.07)" }}>
            {album.works.map((w, i) => (
              <button key={i} onClick={() => setImgIndex(i)} aria-label={`${w.title}`} aria-current={i === imgIndex ? "true" : undefined} style={{ position: "relative", width: 52, aspectRatio: "1080 / 1320", flexShrink: 0, borderRadius: "var(--r-sm)", overflow: "hidden", border: i === imgIndex ? "2.5px solid var(--ds-accent)" : "2.5px solid transparent", padding: 0, cursor: "pointer", transition: "border-color 0.2s", background: "#000" }}>
                <img src={workPoster(w)} alt={w.title} loading="lazy" decoding="async" onError={w.videoId ? (e) => onThumbError(e, w.videoId) : undefined} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center", display: "block" }} />
                {w.videoId && (
                  <span aria-hidden="true" style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: 20, height: 20, borderRadius: "50%", background: "rgba(0,0,0,0.6)", border: "1.5px solid rgba(255,255,255,0.9)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Play size={9} color="#fff" fill="#fff" style={{ marginLeft: 1 }} />
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>,
    document.body,
  )
}
