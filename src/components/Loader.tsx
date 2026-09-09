import logoDark from "../imports/logo_pour_fond_noir.webp"
import { useSettings } from "../context/AppSettings"

interface LoaderProps {
  visible: boolean
}

export default function Loader({ visible }: LoaderProps) {
  const { t } = useSettings()
  // Fully unmount once hidden so the infinite halo/spin animations stop repainting.
  // A permanently-mounted animated overlay starves the Make canvas source-data
  // resolver (it never sees an idle frame), causing "resolution timed out".
  if (!visible) return null
  return (
    <div
      role="status"
      aria-live="polite"
      aria-hidden={!visible}
      style={{
        position: "fixed",
        inset: 0,
        background: "#0A0A0F",
        zIndex: 99999,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 32,
        transition: "opacity 0.5s ease, visibility 0.5s ease",
        opacity: visible ? 1 : 0,
        visibility: visible ? "visible" : "hidden",
        pointerEvents: visible ? "all" : "none",
      }}
    >
      {/* Halo + logo */}
      <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div
          style={{
            position: "absolute",
            width: 160,
            height: 160,
            borderRadius: "50%",
            background: "radial-gradient(circle, var(--ds-accent-a35) 0%, transparent 70%)",
            animation: "halo-pulse 2s ease-in-out infinite",
          }}
        />
        <img
          src={logoDark}
          alt="INOV Digital Services"
          style={{ height: 72, width: "auto", objectFit: "contain", position: "relative", zIndex: 1 }}
        />
      </div>

      {/* Spinner — brand gradient ring (conic + mask; borders can't carry a gradient) */}
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: "50%",
          background: "conic-gradient(from 0deg, transparent 0deg, var(--ds-accent-hover) 200deg, var(--ds-accent) 320deg, var(--ds-accent) 360deg)",
          WebkitMask: "radial-gradient(farthest-side, transparent calc(100% - 3px), #000 calc(100% - 3px))",
          mask: "radial-gradient(farthest-side, transparent calc(100% - 3px), #000 calc(100% - 3px))",
          animation: "spin 0.8s linear infinite",
        }}
      />

      <p style={{ color: "rgba(255,255,255,0.75)", fontFamily: "'Outfit', sans-serif", fontSize: 14, letterSpacing: "0.1em" }}>
        {t.loader.loading}
      </p>
    </div>
  )
}
