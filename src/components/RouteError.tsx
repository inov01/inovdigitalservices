import { useEffect } from "react"
import { useRouteError, isRouteErrorResponse, useNavigate, Link } from "react-router"
import { AlertTriangle, RotateCcw, Home } from "lucide-react"
import { useSettings } from "../context/AppSettings"

// Route-level error UI for react-router's `errorElement`. The class ErrorBoundary
// in main.tsx only catches errors ABOVE the router; the data router intercepts
// route render/loader errors internally, so it needs its own error element to
// avoid react-router's default (unstyled, English) fallback screen.
const COPY: Record<string, { label: string; title: string; sub: string; retry: string; home: string }> = {
  fr: { label: "Erreur", title: "Une erreur est survenue", sub: "Quelque chose d'inattendu s'est produit sur cette page. Réessayez, ou revenez à l'accueil — tout y est.", retry: "Réessayer", home: "Retour à l'accueil" },
  en: { label: "Error", title: "Something went wrong", sub: "An unexpected error occurred on this page. Try again, or head back home — everything is there.", retry: "Try again", home: "Back to home" },
  es: { label: "Error", title: "Algo salió mal", sub: "Ocurrió un error inesperado en esta página. Inténtalo de nuevo o vuelve al inicio, todo está ahí.", retry: "Reintentar", home: "Volver al inicio" },
  ht: { label: "Erè", title: "Gen yon erè ki rive", sub: "Yon bagay inatandi rive sou paj sa a. Eseye ankò, oswa retounen nan akèy la — tout bagay la.", retry: "Eseye ankò", home: "Retounen lakay" },
  pt: { label: "Erro", title: "Algo deu errado", sub: "Ocorreu um erro inesperado nesta página. Tente novamente ou volte ao início, tudo está lá.", retry: "Tentar novamente", home: "Voltar ao início" },
  it: { label: "Errore", title: "Si è verificato un errore", sub: "Si è verificato un errore imprevisto su questa pagina. Riprova o torna alla home, c'è tutto.", retry: "Riprova", home: "Torna alla home" },
  de: { label: "Fehler", title: "Ein Fehler ist aufgetreten", sub: "Auf dieser Seite ist ein unerwarteter Fehler aufgetreten. Versuchen Sie es erneut oder gehen Sie zur Startseite — dort finden Sie alles.", retry: "Erneut versuchen", home: "Zur Startseite" },
  ar: { label: "خطأ", title: "حدث خطأ ما", sub: "حدث خطأ غير متوقع في هذه الصفحة. حاول مرة أخرى أو عد إلى الصفحة الرئيسية، ستجد كل شيء هناك.", retry: "حاول مرة أخرى", home: "العودة إلى الرئيسية" },
}

export default function RouteError() {
  const error = useRouteError()
  const navigate = useNavigate()
  const { lang } = useSettings()
  const c = COPY[lang] ?? COPY.fr
  const isRtl = lang === "ar"

  // Best-effort status code for the pill (e.g. 500). Non-response errors show none.
  const status = isRouteErrorResponse(error) ? error.status : null

  useEffect(() => {
    document.title = `${c.title} — INOV Digital Services`
    // In production, wire this to your logging/monitoring service (e.g. Sentry).
    if (import.meta.env?.DEV) console.error("Route error:", error)
  }, [c.title, error])

  return (
    <section
      dir={isRtl ? "rtl" : undefined}
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
        fontFamily: "'Outfit', sans-serif",
        textAlign: "center",
      }}
    >
      {/* Background glow */}
      <div aria-hidden="true" style={{
        position: "absolute", top: "38%", left: "50%",
        transform: "translate(-50%, -50%)",
        width: 560, height: 560,
        background: "radial-gradient(circle, var(--ds-accent-a12) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      <div style={{ position: "relative", zIndex: 1, maxWidth: 500 }}>
        {/* Icon */}
        <div style={{
          width: 76, height: 76, borderRadius: "var(--r-xl)", margin: "0 auto 28px",
          background: "var(--ds-accent-a12)",
          border: "1.5px solid var(--ds-accent-a25)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <AlertTriangle size={34} color="var(--ds-accent)" strokeWidth={2} aria-hidden="true" />
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
            {status ? `${c.label} · ${status}` : c.label}
          </span>
        </div>

        <h1 style={{ fontSize: "clamp(22px, 4vw, 30px)", fontWeight: 800, color: "#fff", marginBottom: 14, lineHeight: 1.2 }}>
          {c.title}
        </h1>

        <p style={{ fontSize: 16, color: "rgba(255,255,255,0.5)", lineHeight: 1.75, marginBottom: 40, maxWidth: 420, marginInline: "auto" }}>
          {c.sub}
        </p>

        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <button
            onClick={() => navigate(0)}
            style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "13px 28px", borderRadius: "var(--r-full)",
              background: "#fff", color: "var(--ds-ink)",
              fontFamily: "'Outfit', sans-serif", fontSize: 14, fontWeight: 700,
              border: "none", cursor: "pointer",
              boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
              transition: "transform 0.2s, box-shadow 0.2s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 28px rgba(0,0,0,0.4)" }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.3)" }}
          >
            <RotateCcw size={16} aria-hidden="true" />
            {c.retry}
          </button>

          <Link
            to="/"
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
            <Home size={16} aria-hidden="true" />
            {c.home}
          </Link>
        </div>
      </div>
    </section>
  )
}
