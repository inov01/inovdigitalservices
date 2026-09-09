import { Component, type ReactNode } from "react"

const COPY: Record<string, { title: string; sub: string; retry: string; home: string }> = {
  fr: {
    title: "Une erreur est survenue",
    sub: "Quelque chose d'inattendu s'est produit. Réessayez ou revenez à l'accueil.",
    retry: "Réessayer",
    home: "Retour à l'accueil",
  },
  en: {
    title: "Something went wrong",
    sub: "An unexpected error occurred. Please try again or go back home.",
    retry: "Try again",
    home: "Back to home",
  },
  es: {
    title: "Algo salió mal",
    sub: "Ocurrió un error inesperado. Inténtalo de nuevo o vuelve al inicio.",
    retry: "Reintentar",
    home: "Volver al inicio",
  },
  ht: {
    title: "Gen yon erè ki rive",
    sub: "Yon bagay inatandi rive. Eseye ankò oswa retounen nan akèy la.",
    retry: "Eseye ankò",
    home: "Retounen lakay",
  },
  pt: {
    title: "Algo deu errado",
    sub: "Ocorreu um erro inesperado. Tente novamente ou volte ao início.",
    retry: "Tentar novamente",
    home: "Voltar ao início",
  },
  it: {
    title: "Si è verificato un errore",
    sub: "Si è verificato un errore imprevisto. Riprova o torna alla home.",
    retry: "Riprova",
    home: "Torna alla home",
  },
  de: {
    title: "Ein Fehler ist aufgetreten",
    sub: "Ein unerwarteter Fehler ist aufgetreten. Bitte versuchen Sie es erneut oder gehen Sie zur Startseite.",
    retry: "Erneut versuchen",
    home: "Zur Startseite",
  },
  ar: {
    title: "حدث خطأ ما",
    sub: "حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى أو العودة إلى الصفحة الرئيسية.",
    retry: "حاول مرة أخرى",
    home: "العودة إلى الرئيسية",
  },
}

function detectLang(): string {
  try {
    return localStorage.getItem("inov-lang") ?? "fr"
  } catch {
    return "fr"
  }
}

interface Props { children: ReactNode }
interface State { hasError: boolean }

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  // Errors are intentionally not exposed to the user. In production, wire this
  // to your logging/monitoring service (e.g. Sentry).
  componentDidCatch() {}

  render() {
    if (!this.state.hasError) return this.props.children

    const lang = detectLang()
    const c = COPY[lang] ?? COPY.fr
    const isRtl = lang === "ar"

    return (
      <div
        dir={isRtl ? "rtl" : undefined}
        style={{
          minHeight: "100vh",
          background: "var(--ds-ink)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px 24px",
          fontFamily: "'Outfit', sans-serif",
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Subtle background glow */}
        <div aria-hidden="true" style={{
          position: "absolute", top: "40%", left: "50%",
          transform: "translate(-50%, -50%)",
          width: 500, height: 500,
          background: "radial-gradient(circle, var(--ds-accent-a10) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />

        <div style={{ position: "relative", zIndex: 1, maxWidth: 480 }}>
          {/* Icon */}
          <div style={{
            width: 72, height: 72, borderRadius: "var(--r-xl)", margin: "0 auto 28px",
            background: "var(--ds-accent-a12)",
            border: "1.5px solid var(--ds-accent-a25)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--ds-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
          </div>

          <h1 style={{
            fontSize: "clamp(22px, 4vw, 28px)",
            fontWeight: 800,
            color: "#fff",
            marginBottom: 14,
            lineHeight: 1.2,
          }}>
            {c.title}
          </h1>

          <p style={{
            fontSize: 15,
            color: "rgba(255,255,255,0.5)",
            lineHeight: 1.75,
            marginBottom: 36,
          }}>
            {c.sub}
          </p>

          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <button
              onClick={() => this.setState({ hasError: false })}
              style={{
                padding: "12px 26px", borderRadius: "var(--r-full)",
                background: "transparent", color: "rgba(255,255,255,0.8)",
                border: "1.5px solid rgba(255,255,255,0.18)",
                fontSize: 14, fontWeight: 600, cursor: "pointer",
                fontFamily: "'Outfit', sans-serif",
                transition: "border-color 0.2s, color 0.2s",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.4)"; e.currentTarget.style.color = "#fff" }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.18)"; e.currentTarget.style.color = "rgba(255,255,255,0.8)" }}
            >
              {c.retry}
            </button>

            <a
              href="/"
              style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                padding: "12px 28px", borderRadius: "var(--r-full)",
                background: "#fff", color: "var(--ds-ink)",
                fontSize: 14, fontWeight: 700,
                textDecoration: "none",
                fontFamily: "'Outfit', sans-serif",
                transition: "opacity 0.2s",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.9" }}
              onMouseLeave={(e) => { e.currentTarget.style.opacity = "1" }}
            >
              {c.home}
            </a>
          </div>
        </div>
      </div>
    )
  }
}
