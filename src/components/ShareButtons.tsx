import { useState } from "react"
import { Share2, Check, Link as LinkIcon } from "lucide-react"

// Lightweight social-share row. WhatsApp first (primary channel for the Haitian
// audience), then Facebook, then a copy-to-clipboard fallback that works even
// when the native share sheet is unavailable.
export default function ShareButtons({ url, title, compact = false }: {
  url: string
  title: string
  compact?: boolean
}) {
  const [copied, setCopied] = useState(false)
  const shareText = `${title} — ${url}`
  const wa = `https://wa.me/?text=${encodeURIComponent(shareText)}`
  const fb = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`

  async function copy() {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      // Clipboard blocked (older browsers / insecure context) — fall back to
      // the native share sheet if present, otherwise a prompt.
      if (navigator.share) { try { await navigator.share({ title, url }) } catch { /* cancelled */ } }
      else window.prompt("Copiez le lien :", url)
    }
  }

  const btn: React.CSSProperties = {
    display: "inline-flex", alignItems: "center", gap: 7,
    padding: compact ? "7px 12px" : "9px 14px", borderRadius: "var(--r-md)",
    fontFamily: "'Outfit', sans-serif", fontSize: 13.5, fontWeight: 700,
    textDecoration: "none", border: "1px solid var(--ds-border)", cursor: "pointer",
    whiteSpace: "nowrap",
  }

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
      {!compact && (
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "var(--ds-text-muted)", fontFamily: "'Outfit', sans-serif", fontSize: 13.5, fontWeight: 700 }}>
          <Share2 size={15} /> Partager
        </span>
      )}
      <a href={wa} target="_blank" rel="noopener noreferrer" aria-label="Partager sur WhatsApp"
        style={{ ...btn, background: "rgba(37,211,102,0.12)", color: "#12a150", borderColor: "rgba(37,211,102,0.3)" }}>
        <WhatsAppGlyph /> WhatsApp
      </a>
      <a href={fb} target="_blank" rel="noopener noreferrer" aria-label="Partager sur Facebook"
        style={{ ...btn, background: "rgba(24,119,242,0.12)", color: "#1877F2", borderColor: "rgba(24,119,242,0.3)" }}>
        <FacebookGlyph /> Facebook
      </a>
      <button onClick={copy} type="button" aria-label="Copier le lien"
        style={{ ...btn, background: "var(--ds-bg-card)", color: copied ? "var(--ds-success)" : "var(--ds-text)" }}>
        {copied ? <Check size={15} /> : <LinkIcon size={15} />} {copied ? "Copié !" : "Copier"}
      </button>
    </div>
  )
}

function WhatsAppGlyph() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.61-.92-2.21-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.01-1.04 2.47 0 1.46 1.06 2.87 1.21 3.07.15.2 2.09 3.2 5.07 4.49.71.31 1.26.49 1.69.63.71.22 1.36.19 1.87.12.57-.09 1.76-.72 2.01-1.41.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35zM12.01 2C6.5 2 2.02 6.48 2.02 12c0 1.77.46 3.45 1.34 4.95L2 22l5.2-1.36c1.44.79 3.06 1.2 4.81 1.2h.01c5.5 0 9.98-4.48 9.98-10S17.52 2 12.01 2z"/>
    </svg>
  )
}
function FacebookGlyph() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5.02 3.66 9.18 8.44 9.94v-7.03H7.9v-2.9h2.54V9.85c0-2.52 1.49-3.91 3.78-3.91 1.09 0 2.24.2 2.24.2v2.47h-1.26c-1.24 0-1.63.77-1.63 1.56v1.88h2.78l-.44 2.9h-2.34V22c4.78-.76 8.43-4.92 8.43-9.94z"/>
    </svg>
  )
}
