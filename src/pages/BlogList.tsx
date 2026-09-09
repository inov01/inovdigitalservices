import { useEffect } from "react"
import { Link } from "react-router"
import { ArrowLeft, ArrowRight, Clock, Globe } from "lucide-react"
import { UI, ARTICLE_ICON, useBlogArticles } from "../components/Blog"
import { useSettings } from "../context/AppSettings"
import { track } from "../lib/analytics"
import { applyPageMeta } from "../lib/seo"
import logo from "../imports/logo.webp"

const BACK_HOME: Record<string, string> = {
  fr: "Retour à l'accueil", en: "Back to home", es: "Volver al inicio",
  ht: "Retounen nan akèy", pt: "Voltar ao início", it: "Torna alla home",
  de: "Zurück zur Startseite", ar: "العودة إلى الرئيسية",
}

export default function BlogList() {
  const { lang } = useSettings()
  const ui = UI[lang] ?? UI.fr
  const { articles, imageFor, slugFor } = useBlogArticles()

  useEffect(() => {
    applyPageMeta({
      title: `${ui.title} — INOV Digital Services`,
      description: ui.sub,
      type: "website",
    })
    window.scrollTo(0, 0)
  }, [ui.title, ui.sub])

  return (
    <section style={{ background: "var(--ds-bg-sec)", padding: "72px 0 96px", minHeight: "70vh" }}>
      <div style={{ maxWidth: 1180, margin: "0 auto", padding: "0 var(--section-px)" }}>
        <div style={{ marginBottom: 36 }}>
          <Link
            to="/"
            style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "9px 16px", borderRadius: "var(--r-full)",
              background: "var(--ds-bg-card)", border: "1px solid var(--ds-border)",
              fontFamily: "'Outfit', sans-serif", fontSize: 14, fontWeight: 700,
              color: "var(--ds-text)", textDecoration: "none",
              boxShadow: "0 2px 8px rgba(0,0,0,0.05)", transition: "all 0.2s ease",
            }}
            onMouseOver={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 6px 16px rgba(0,0,0,0.10)" }}
            onMouseOut={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.05)" }}
          >
            <ArrowLeft size={16} /> {BACK_HOME[lang] ?? BACK_HOME.fr}
          </Link>
        </div>

        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <div style={{ marginBottom: 20 }}>
            <span className="section-tag"><span className="dot-pulse" />{ui.tag}</span>
          </div>
          <h1 className="section-title" style={{ marginBottom: 16 }}>{ui.title}</h1>
          <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: 17.6, color: "var(--ds-text-sec)", maxWidth: 560, margin: "0 auto", lineHeight: 1.7 }}>{ui.sub}</p>
        </div>

        <div className="blog-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }}>
          {articles.map((a) => {
            const Icon = ARTICLE_ICON[a.id] ?? Globe
            return (
              <Link
                key={a.id}
                to={`/blog/${slugFor(a.id)}`}
                className="card"
                onClick={() => track("blog_read", { article: a.id, source: "list" })}
                style={{ cursor: "pointer", display: "flex", flexDirection: "column", boxSizing: "border-box", textDecoration: "none", overflow: "hidden", padding: 0 }}
              >
                {/* Hero image */}
                <div style={{ position: "relative", width: "100%", height: 200, background: "var(--ds-bg-sec)", flexShrink: 0, overflow: "hidden" }}>
                  <img
                    src={imageFor(a.id)?.url}
                    alt={imageFor(a.id)?.alt ?? a.title}
                    loading="lazy"
                    style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", transition: "transform 0.4s ease" }}
                    onMouseOver={(e) => { (e.currentTarget as HTMLImageElement).style.transform = "scale(1.04)" }}
                    onMouseOut={(e) => { (e.currentTarget as HTMLImageElement).style.transform = "scale(1)" }}
                  />
                  {/* Icon badge overlay */}
                  <div style={{
                    position: "absolute", bottom: 14, left: 14,
                    width: 40, height: 40, borderRadius: "var(--r-md)",
                    background: "var(--ds-accent-grad)", color: "#fff",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    boxShadow: "0 4px 14px var(--ds-accent-a45)",
                  }}>
                    <Icon size={20} aria-hidden="true" />
                  </div>
                </div>

                {/* Card body */}
                <div style={{ padding: "24px 28px 28px", display: "flex", flexDirection: "column", flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                    <span style={{
                      fontFamily: "'Space Grotesk', sans-serif", fontSize: 12, fontWeight: 700, letterSpacing: 0.5,
                      textTransform: "uppercase", color: "var(--ds-accent-text)", background: "var(--ds-accent-a10)", padding: "5px 11px", borderRadius: "var(--r-full)",
                    }}>{a.tag}</span>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontFamily: "'Outfit', sans-serif", fontSize: 12.5, color: "var(--ds-text-faint)" }}>
                      <Clock size={13} /> {a.read} {ui.read}
                    </span>
                  </div>
                  <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 19, fontWeight: 800, color: "var(--ds-text)", marginBottom: 10, lineHeight: 1.3 }}>{a.title}</h2>
                  <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: 14, color: "var(--ds-text-sec)", lineHeight: 1.65, marginBottom: 20, flex: 1 }}>{a.excerpt}</p>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "auto" }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 7, fontFamily: "'Outfit', sans-serif", fontSize: 14, fontWeight: 700, color: "var(--ds-accent-text)" }}>
                      {ui.cta} <ArrowRight size={15} />
                    </span>
                    <img src={logo} alt="INOV" style={{ height: 20, width: "auto", objectFit: "contain", opacity: 0.5 }} />
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </div>

      <style>{`
        @media (max-width: 1024px) { .blog-grid { grid-template-columns: repeat(2, 1fr) !important; } }
        @media (max-width: 640px) { .blog-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </section>
  )
}
