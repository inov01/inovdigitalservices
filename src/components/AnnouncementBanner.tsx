import { useEffect, useState } from "react"
import { X } from "lucide-react"
import { api, type SiteSettings } from "../lib/api"

// Announcement pill driven by the admin Settings tab. Floats just below the
// header so it never disturbs the fixed header / progress-bar layout.
// Dismissible per session; re-appears if the admin changes the text.
export default function AnnouncementBanner() {
  const [ann, setAnn] = useState<SiteSettings["announcement"] | null>(null)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    let alive = true
    api.getSettings()
      .then((r) => {
        if (!alive) return
        const a = r.settings?.announcement
        if (a?.enabled && a.text?.trim()) {
          setAnn(a)
          try {
            // Keyed by text so editing the message clears an old dismissal.
            const key = `inov-ann-dismissed:${a.text}`
            setDismissed(sessionStorage.getItem(key) === "1")
          } catch {}
        }
      })
      .catch(() => {})
    return () => { alive = false }
  }, [])

  if (!ann || dismissed) return null

  function dismiss() {
    setDismissed(true)
    try { sessionStorage.setItem(`inov-ann-dismissed:${ann!.text}`, "1") } catch {}
  }

  const inner = (
    <>
      <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{ann.text}</span>
      {ann.link && (
        <span style={{ fontWeight: 800, textDecoration: "underline", whiteSpace: "nowrap" }}>→</span>
      )}
    </>
  )

  return (
    <div
      role="status"
      style={{
        position: "fixed",
        top: "calc(var(--header-h) + 12px)",
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 4000,
        maxWidth: "min(92vw, 640px)",
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "10px 14px 10px 18px",
        borderRadius: "var(--r-full)",
        background: "var(--ds-accent-grad)",
        color: "#fff",
        boxShadow: "0 10px 30px var(--ds-accent-a35)",
        fontFamily: "var(--font-outfit), sans-serif",
        fontSize: 14,
        fontWeight: 600,
        animation: "ann-in 0.5s cubic-bezier(0.22,1,0.36,1)",
      }}
    >
      <style>{`@keyframes ann-in{from{opacity:0;transform:translateX(-50%) translateY(-8px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}`}</style>
      {ann.link ? (
        <a href={ann.link} style={{ color: "#fff", textDecoration: "none", display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
          {inner}
        </a>
      ) : (
        <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>{inner}</div>
      )}
      <button onClick={dismiss} aria-label="Fermer l'annonce"
        style={{ display: "grid", placeItems: "center", width: 24, height: 24, borderRadius: "50%", border: "none", background: "rgba(255,255,255,0.22)", color: "#fff", cursor: "pointer", flexShrink: 0 }}>
        <X size={14} />
      </button>
    </div>
  )
}
