import { useEffect, useState } from "react"
import { api } from "../lib/api"

type Announcement = { enabled: boolean; text: string; href: string }

/**
 * Site-wide announcement strip driven by the admin panel (Réglages → Bannière).
 * Reads /settings from the Supabase edge function. Renders nothing until an
 * enabled, non-empty announcement is loaded, so it never adds empty space.
 */
export default function AnnouncementBar() {
  const [ann, setAnn] = useState<Announcement | null>(null)

  useEffect(() => {
    let alive = true
    api.getSettings()
      .then((d) => {
        const raw = d.settings?.announcement as { enabled: boolean; text: string; link?: string; href?: string } | undefined
        if (alive && raw) setAnn({ enabled: raw.enabled, text: raw.text, href: raw.href ?? raw.link ?? "" })
      })
      .catch(() => {})
    return () => { alive = false }
  }, [])

  if (!ann?.enabled || !ann.text.trim()) return null

  const content = (
    <span style={{ fontFamily: "var(--font-outfit, 'Outfit', sans-serif)", fontSize: 14, fontWeight: 600, color: "#fff" }}>
      {ann.text}
    </span>
  )

  return (
    <div
      role="region"
      aria-label="Annonce"
      style={{
        width: "100%", textAlign: "center", padding: "10px 16px",
        background: "var(--ds-accent-grad)",
      }}
    >
      {ann.href ? (
        <a href={ann.href} style={{ textDecoration: "none", display: "inline-flex", gap: 8, alignItems: "center" }}>
          {content}
          <span style={{ color: "#fff", fontWeight: 800 }}>→</span>
        </a>
      ) : content}
    </div>
  )
}
