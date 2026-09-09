import { useEffect } from "react"
import { Link } from "react-router"
import { Home, ArrowRight, MessageSquare } from "lucide-react"
import { useSettings } from "../context/AppSettings"
import logo from "../imports/logo.webp"

const COPY: Record<string, {
  label: string
  title: string
  sub: string
  home: string
  contact: string
}> = {
  fr: {
    label: "Page introuvable",
    title: "Cette page n'existe pas",
    sub: "Il se peut que le lien soit erroné, que la page ait été déplacée ou supprimée. Retournez à l'accueil, tout y est.",
    home: "Retour à l'accueil",
    contact: "Nous contacter",
  },
  en: {
    label: "Page not found",
    title: "This page doesn't exist",
    sub: "The link may be wrong, or the page may have been moved or removed. Head back home — everything is there.",
    home: "Back to home",
    contact: "Contact us",
  },
  es: {
    label: "Página no encontrada",
    title: "Esta página no existe",
    sub: "El enlace puede ser incorrecto o la página fue movida. Vuelve al inicio, todo está ahí.",
    home: "Volver al inicio",
    contact: "Contáctenos",
  },
  ht: {
    label: "Paj pa jwenn",
    title: "Paj sa a pa egziste",
    sub: "Lyen an ka mal, osinon yo te retire paj la. Tounen nan akèy la, tout bagay la.",
    home: "Retounen lakay",
    contact: "Kontakte nou",
  },
  pt: {
    label: "Página não encontrada",
    title: "Esta página não existe",
    sub: "O link pode estar errado ou a página foi movida. Volte ao início, tudo está lá.",
    home: "Voltar ao início",
    contact: "Fale conosco",
  },
  it: {
    label: "Pagina non trovata",
    title: "Questa pagina non esiste",
    sub: "Il link potrebbe essere errato o la pagina è stata spostata. Torna alla home, c'è tutto.",
    home: "Torna alla home",
    contact: "Contattaci",
  },
  de: {
    label: "Seite nicht gefunden",
    title: "Diese Seite existiert nicht",
    sub: "Der Link könnte falsch sein oder die Seite wurde verschoben. Zur Startseite — dort finden Sie alles.",
    home: "Zur Startseite",
    contact: "Kontakt aufnehmen",
  },
  ar: {
    label: "الصفحة غير موجودة",
    title: "هذه الصفحة غير موجودة",
    sub: "قد يكون الرابط خاطئاً أو تمت إزالة الصفحة. عد إلى الصفحة الرئيسية، ستجد كل شيء هناك.",
    home: "العودة إلى الرئيسية",
    contact: "تواصل معنا",
  },
}

export default function NotFound() {
  const { lang } = useSettings()
  const c = COPY[lang] ?? COPY.fr
  const isRtl = lang === "ar"

  useEffect(() => {
    document.title = `${c.label} — INOV Digital Services`
  }, [c.label])

  return (
    <section
      style={{
        minHeight: "100vh",
        background: "var(--ds-ink)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "80px clamp(20px, 5vw, 60px)",
        position: "relative",
        overflow: "hidden",
      }}
      dir={isRtl ? "rtl" : undefined}
    >
      {/* Background glow */}
      <div aria-hidden="true" style={{
        position: "absolute", top: "30%", left: "50%",
        transform: "translate(-50%, -50%)",
        width: 600, height: 600,
        background: "radial-gradient(circle, var(--ds-accent-a12) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      {/* Grid lines decoration */}
      <div aria-hidden="true" style={{
        position: "absolute", inset: 0,
        backgroundImage: `
          linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)
        `,
        backgroundSize: "60px 60px",
        pointerEvents: "none",
      }} />

      <div style={{ position: "relative", zIndex: 1, textAlign: "center", maxWidth: 560 }}>
        {/* Logo */}
        <a href="/" style={{ display: "inline-block", marginBottom: 48 }}>
          <img src={logo} alt="INOV Digital Services" style={{ height: 36, width: "auto", objectFit: "contain", filter: "brightness(0) invert(1)", opacity: 0.7 }} />
        </a>

        {/* 404 number */}
        <div
          className="not-found-404"
          aria-hidden="true"
          style={{
            fontFamily: "'Outfit', sans-serif",
            fontSize: "clamp(100px, 20vw, 160px)",
            fontWeight: 900,
            lineHeight: 1,
            background: "linear-gradient(135deg, var(--ds-accent) 0%, var(--ds-accent-hover) 50%, var(--ds-accent-a30) 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            marginBottom: 8,
            letterSpacing: "-4px",
          }}
        >
          404
        </div>

        {/* Status pill */}
        <div style={{ marginBottom: 20 }}>
          <span style={{
            display: "inline-flex", alignItems: "center", gap: 7,
            fontFamily: "'Space Grotesk', sans-serif", fontSize: 12, fontWeight: 700,
            letterSpacing: 1, textTransform: "uppercase",
            color: "rgba(var(--ds-accent-rgb),0.9)",
            background: "var(--ds-accent-a12)",
            border: "1px solid var(--ds-accent-a20)",
            padding: "5px 14px", borderRadius: "var(--r-full)",
          }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--ds-accent)", display: "inline-block", animation: "dot-blink 1.4s ease-in-out infinite" }} />
            {c.label}
          </span>
        </div>

        {/* Title */}
        <h1 style={{
          fontFamily: "'Outfit', sans-serif",
          fontSize: "clamp(22px, 4vw, 32px)",
          fontWeight: 800,
          color: "#fff",
          marginBottom: 16,
          lineHeight: 1.2,
        }}>
          {c.title}
        </h1>

        {/* Description */}
        <p style={{
          fontFamily: "'Outfit', sans-serif",
          fontSize: 16,
          color: "rgba(255,255,255,0.5)",
          lineHeight: 1.75,
          marginBottom: 40,
          maxWidth: 420,
          margin: "0 auto 40px",
        }}>
          {c.sub}
        </p>

        {/* CTAs */}
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <Link
            to="/"
            style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "13px 28px", borderRadius: "var(--r-full)",
              background: "#fff", color: "var(--ds-ink)",
              fontFamily: "'Outfit', sans-serif", fontSize: 14, fontWeight: 700,
              textDecoration: "none",
              boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
              transition: "transform 0.2s, box-shadow 0.2s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 28px rgba(0,0,0,0.4)" }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.3)" }}
          >
            <Home size={16} aria-hidden="true" />
            {c.home}
          </Link>

          <Link
            to="/#contact"
            style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "13px 28px", borderRadius: "var(--r-full)",
              background: "transparent", color: "rgba(255,255,255,0.75)",
              border: "1.5px solid rgba(255,255,255,0.15)",
              fontFamily: "'Outfit', sans-serif", fontSize: 14, fontWeight: 600,
              textDecoration: "none",
              transition: "border-color 0.2s, color 0.2s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.4)"; e.currentTarget.style.color = "#fff" }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)"; e.currentTarget.style.color = "rgba(255,255,255,0.75)" }}
          >
            <MessageSquare size={16} aria-hidden="true" />
            {c.contact}
            <ArrowRight size={14} aria-hidden="true" />
          </Link>
        </div>
      </div>

      <style>{`
        @keyframes dot-blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
        .not-found-404 {
          animation: float-404 4s ease-in-out infinite;
        }
        @keyframes float-404 {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @media (prefers-reduced-motion: reduce) {
          .not-found-404 { animation: none; }
          [style*="dot-blink"] { animation: none; }
        }
      `}</style>
    </section>
  )
}
