import { useEffect, useRef } from "react"

/**
 * Shared modal behaviour: Escape to close, background scroll lock, a focus trap
 * that keeps Tab within the dialog, and focus return to the trigger on close.
 *
 * Usage:
 *   const ref = useModal<HTMLDivElement>(open, onClose)
 *   return open ? <div ref={ref} role="dialog" aria-modal="true">…</div> : null
 */
export default function useModal<T extends HTMLElement>(
  isOpen: boolean,
  onClose: () => void,
) {
  const ref = useRef<T>(null)

  useEffect(() => {
    if (!isOpen) return

    const previouslyFocused = document.activeElement as HTMLElement | null

    // Lock background scroll without a layout shift.
    const prevOverflow = document.body.style.overflow
    const prevPadding = document.body.style.paddingRight
    const scrollbar = window.innerWidth - document.documentElement.clientWidth
    document.body.style.overflow = "hidden"
    if (scrollbar > 0) document.body.style.paddingRight = `${scrollbar}px`

    const getFocusable = (): HTMLElement[] => {
      if (!ref.current) return []
      return Array.from(
        ref.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((el) => el.offsetParent !== null || el === document.activeElement)
    }

    // Move focus into the dialog on open.
    const focusables = getFocusable()
    ;(focusables[0] ?? ref.current)?.focus?.()

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation()
        onClose()
        return
      }
      if (e.key !== "Tab") return
      const items = getFocusable()
      if (items.length === 0) {
        e.preventDefault()
        return
      }
      const first = items[0]
      const last = items[items.length - 1]
      const activeEl = document.activeElement as HTMLElement | null
      if (e.shiftKey && (activeEl === first || !ref.current?.contains(activeEl))) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && activeEl === last) {
        e.preventDefault()
        first.focus()
      }
    }

    document.addEventListener("keydown", onKeyDown, true)

    return () => {
      document.removeEventListener("keydown", onKeyDown, true)
      document.body.style.overflow = prevOverflow
      document.body.style.paddingRight = prevPadding
      previouslyFocused?.focus?.()
    }
  }, [isOpen, onClose])

  return ref
}
