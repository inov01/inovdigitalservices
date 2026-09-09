import { useState, type CSSProperties, type ImgHTMLAttributes } from "react"

type Props = ImgHTMLAttributes<HTMLImageElement> & {
  /** Size of the spinner in px (default 34) */
  spinnerSize?: number
  /** Spinner ring color (default brand orange) */
  spinnerColor?: string
  /** Background shown behind the spinner while loading */
  placeholderBg?: string
  /** Style applied to the wrapper element */
  wrapperStyle?: CSSProperties
}

/**
 * Image with a spinning loader overlay shown until it finishes loading.
 * Keeps visitors patient on large portfolio images. Falls through every
 * standard <img> prop (src, alt, style, onError, loading, decoding…).
 */
export default function SmartImage({
  spinnerSize = 34,
  spinnerColor = "var(--ds-accent)",
  placeholderBg = "rgba(255,255,255,0.04)",
  wrapperStyle,
  style,
  onLoad,
  onError,
  ...imgProps
}: Props) {
  const [loaded, setLoaded] = useState(false)

  return (
    <span
      style={{
        position: "relative",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        ...wrapperStyle,
      }}
    >
      {!loaded && (
        <span
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: placeholderBg,
            zIndex: 1,
          }}
        >
          <span
            style={{
              width: spinnerSize,
              height: spinnerSize,
              borderRadius: "50%",
              border: `3px solid rgba(255,255,255,0.18)`,
              borderTopColor: spinnerColor,
              animation: "spin 0.8s linear infinite",
            }}
          />
        </span>
      )}
      <img
        {...imgProps}
        onLoad={(e) => { setLoaded(true); onLoad?.(e) }}
        onError={(e) => { setLoaded(true); onError?.(e) }}
        style={{
          ...style,
          opacity: loaded ? 1 : 0,
          transition: "opacity 0.4s ease",
        }}
      />
    </span>
  )
}
