import { useState } from "react"
import { Share2, Link2, Check, Send, Mail } from "lucide-react"
import { SiWhatsapp, SiFacebook } from "./SocialIcons"
import { useSettings } from "../context/AppSettings"
import { track } from "../lib/analytics"
import type { Lang } from "../i18n/translations"

const LABELS: Record<Lang, { share: string; copy: string; copied: string }> = {
  fr: { share: "Partager", copy: "Copier le lien", copied: "Lien copié !" },
  en: { share: "Share", copy: "Copy link", copied: "Link copied!" },
  es: { share: "Compartir", copy: "Copiar enlace", copied: "¡Enlace copiado!" },
  ht: { share: "Pataje", copy: "Kopye lyen an", copied: "Lyen kopye !" },
  pt: { share: "Partilhar", copy: "Copiar link", copied: "Link copiado!" },
  it: { share: "Condividi", copy: "Copia link", copied: "Link copiato!" },
  de: { share: "Teilen", copy: "Link kopieren", copied: "Link kopiert!" },
  ar: { share: "مشاركة", copy: "نسخ الرابط", copied: "تم نسخ الرابط!" },
}

// X (Twitter) + LinkedIn glyphs — lucide has no brand marks, so tiny inline ones keep it on-brand.
function XGlyph({ size = 17 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24h-6.66l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.45-6.231Zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77Z" />
    </svg>
  )
}
function LinkedInGlyph({ size = 17 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.07 2.07 0 1 1 0-4.13 2.07 2.07 0 0 1 0 4.13ZM7.12 20.45H3.55V9h3.57v11.45ZM22.22 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.72V1.72C24 .77 23.2 0 22.22 0Z" />
    </svg>
  )
}

type Btn = { key: string; label: string; icon: React.ReactNode; href: string; bg: string }

export default function ShareBar({ title, text }: { title: string; text?: string }) {
  const { lang } = useSettings()
  const l = LABELS[lang] ?? LABELS.fr
  const [copied, setCopied] = useState(false)

  const url = (() => {
    if (typeof window === "undefined") return ""
    const u = new URL(window.location.href)
    if (lang && lang !== "fr") u.searchParams.set("lang", lang)
    else u.searchParams.delete("lang")
    return u.toString()
  })()
  const shareText = text ?? title
  const eUrl = encodeURIComponent(url)
  const eText = encodeURIComponent(shareText)
  const eTitle = encodeURIComponent(title)

  const canNativeShare = typeof navigator !== "undefined" && typeof navigator.share === "function"

  const nativeShare = async () => {
    try {
      await navigator.share({ title, text: shareText, url })
      track("article_share", { channel: "native" })
    } catch {
      /* user cancelled — no-op */
    }
  }

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url)
    } catch {
      // Fallback for older browsers / insecure contexts
      const ta = document.createElement("textarea")
      ta.value = url
      ta.style.position = "fixed"
      ta.style.opacity = "0"
      document.body.appendChild(ta)
      ta.select()
      try { document.execCommand("copy") } catch {}
      document.body.removeChild(ta)
    }
    setCopied(true)
    track("article_share", { channel: "copy" })
    window.setTimeout(() => setCopied(false), 2000)
  }

  const buttons: Btn[] = [
    { key: "whatsapp", label: "WhatsApp", icon: <SiWhatsapp size={17} />, href: `https://wa.me/?text=${eText}%20${eUrl}`, bg: "#25D366" },
    { key: "facebook", label: "Facebook", icon: <SiFacebook size={17} />, href: `https://www.facebook.com/sharer/sharer.php?u=${eUrl}`, bg: "#1877F2" },
    { key: "x", label: "X", icon: <XGlyph />, href: `https://twitter.com/intent/tweet?text=${eText}&url=${eUrl}`, bg: "#0A0A0F" },
    { key: "linkedin", label: "LinkedIn", icon: <LinkedInGlyph />, href: `https://www.linkedin.com/sharing/share-offsite/?url=${eUrl}`, bg: "#0A66C2" },
    { key: "telegram", label: "Telegram", icon: <Send size={17} />, href: `https://t.me/share/url?url=${eUrl}&text=${eText}`, bg: "#26A5E4" },
    { key: "email", label: "Email", icon: <Mail size={17} />, href: `mailto:?subject=${eTitle}&body=${eText}%0A%0A${eUrl}`, bg: "#6B6B78" },
  ]

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
      <span style={{ display: "inline-flex", alignItems: "center", gap: 7, fontFamily: "'Outfit', sans-serif", fontSize: 13.5, fontWeight: 700, color: "var(--ds-text-faint)" }}>
        <Share2 size={16} /> {l.share}
      </span>

      {canNativeShare && (
        <button
          onClick={nativeShare}
          aria-label={l.share}
          className="share-btn btn-orange"
          style={{ color: "#fff" }}
        >
          <Share2 size={17} />
        </button>
      )}

      {buttons.map((b) => (
        <a
          key={b.key}
          href={b.href}
          target="_blank"
          rel="noreferrer"
          aria-label={b.label}
          className="share-btn"
          onClick={() => track("article_share", { channel: b.key })}
          style={{ background: b.bg, color: "#fff" }}
        >
          {b.icon}
        </a>
      ))}

      <button
        onClick={copyLink}
        aria-label={copied ? l.copied : l.copy}
        className="share-btn share-btn--copy"
        style={{
          width: "auto", padding: "0 14px", gap: 7,
          background: copied ? "rgba(34,197,94,0.12)" : "rgba(10,10,15,0.05)",
          color: copied ? "var(--ds-success)" : "var(--ds-text-sec)",
          border: copied ? "1.5px solid rgba(34,197,94,0.4)" : "1.5px solid rgba(10,10,15,0.1)",
        }}
      >
        {copied ? <Check size={16} /> : <Link2 size={16} />}
        <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 13, fontWeight: 700 }}>{copied ? l.copied : l.copy}</span>
      </button>

      <style>{`
        .share-btn {
          height: 40px; min-width: 40px; border-radius: var(--r-md); border: none; cursor: pointer;
          display: inline-flex; align-items: center; justify-content: center;
          text-decoration: none; transition: transform 0.15s ease, box-shadow 0.15s ease, filter 0.15s ease;
        }
        .share-btn:hover { transform: translateY(-2px); filter: brightness(1.05); box-shadow: 0 6px 16px rgba(0,0,0,0.16); }
        .share-btn:active { transform: translateY(0); }
      `}</style>
    </div>
  )
}
