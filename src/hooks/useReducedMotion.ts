import { useState, useEffect } from "react"

// True when the user has asked the OS to minimize motion. Used to freeze
// auto-advancing carousels and skip large decorative animations.
export default function useReducedMotion() {
  const [reduced, setReduced] = useState(
    typeof window !== "undefined" && window.matchMedia
      ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
      : false,
  )

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
    const onChange = () => setReduced(mq.matches)
    mq.addEventListener("change", onChange)
    return () => mq.removeEventListener("change", onChange)
  }, [])

  return reduced
}
