import type { CSSProperties, ReactNode } from "react"
import { useScrollReveal } from "../hooks/useScrollReveal"

type Props = {
  children: ReactNode
  delay?: number   // ms
  distance?: number // px translateY start
  style?: CSSProperties
  className?: string
}

export default function RevealSection({ children, delay = 0, distance = 18, style, className }: Props) {
  const { ref, visible } = useScrollReveal(0.1)

  return (
    <div
      ref={ref as React.RefObject<HTMLDivElement>}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : `translateY(${distance}px)`,
        transition: `opacity 0.35s ease ${delay}ms, transform 0.35s cubic-bezier(0.22,1,0.36,1) ${delay}ms`,
        // Only hint the compositor while an element is still animating in. Leaving
        // willChange on permanently keeps layers promoted and churning, which
        // starves the Make canvas source-data resolver.
        willChange: visible ? "auto" : "opacity, transform",
        ...style,
      }}
    >
      {children}
    </div>
  )
}
