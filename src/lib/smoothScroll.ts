// Fixed-duration smooth scroll. The browser's native `scroll-behavior: smooth`
// scales its duration with distance, so long jumps feel slow. This keeps every
// section-to-section scroll snappy and consistent regardless of distance.

const DURATION = 460 // ms — capped so far jumps aren't sluggish

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}

function headerOffset(): number {
  const raw = getComputedStyle(document.documentElement).getPropertyValue("--header-h")
  const px = parseInt(raw, 10)
  return Number.isFinite(px) ? px : 0
}

/** Smoothly scroll the window to a target Y position over a fixed duration. */
export function smoothScrollToY(targetY: number): void {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
  const startY = window.scrollY
  const dest = Math.max(0, targetY)
  const dist = dest - startY

  if (reduce || Math.abs(dist) < 4) {
    window.scrollTo(0, dest)
    return
  }

  const start = performance.now()
  function step(now: number) {
    const p = Math.min(1, (now - start) / DURATION)
    window.scrollTo(0, startY + dist * easeInOutCubic(p))
    if (p < 1) requestAnimationFrame(step)
  }
  requestAnimationFrame(step)
}

/** Smoothly scroll so the element with the given id sits just below the header. */
export function smoothScrollToId(id: string): void {
  const el = document.getElementById(id)
  if (!el) return
  const y = el.getBoundingClientRect().top + window.scrollY - headerOffset()
  smoothScrollToY(y)
}

/**
 * Scroll to an id that may not be mounted yet (lazy sections after a route change).
 * Polls briefly for the element, then smooth-scrolls to it.
 */
export function scrollToIdWhenReady(id: string, tries = 40): void {
  const attempt = (left: number) => {
    const el = document.getElementById(id)
    if (el) { smoothScrollToId(id); return }
    if (left > 0) requestAnimationFrame(() => attempt(left - 1))
  }
  attempt(tries)
}
