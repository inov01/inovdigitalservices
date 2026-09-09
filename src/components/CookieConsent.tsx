import { useState, useEffect } from "react"
import { Cookie, X, Check, XCircle, ChevronDown, ChevronUp, Settings2 } from "lucide-react"
import { useSettings } from "../context/AppSettings"
import { initAnalytics, CONSENT_KEY, CONSENT_ANALYTICS_KEY, CONSENT_MARKETING_KEY } from "../lib/analytics"
import type { Lang } from "../i18n/translations"

const COPY: Record<Lang, {
  title: string; text: string
  accept: string; reject: string; customize: string; save: string
  analyticsLabel: string; analyticsDesc: string
  marketingLabel: string; marketingDesc: string
  required: string
}> = {
  fr: {
    title: "Cookies & confidentialité",
    text: "Nous utilisons des cookies pour mesurer notre audience et améliorer votre expérience. Aucune donnée n'est vendue à des tiers.",
    accept: "Tout accepter", reject: "Tout refuser", customize: "Personnaliser", save: "Enregistrer mes choix",
    analyticsLabel: "Statistiques (Google Analytics 4)", analyticsDesc: "Nous aide à comprendre comment vous naviguez sur le site.",
    marketingLabel: "Marketing (Meta Pixel)", marketingDesc: "Permet d'afficher des publicités pertinentes sur Facebook et Instagram.",
    required: "Nécessaires (toujours actifs)",
  },
  en: {
    title: "Cookies & privacy",
    text: "We use cookies to measure our audience and improve your experience. No data is sold to third parties.",
    accept: "Accept all", reject: "Decline all", customize: "Customize", save: "Save my choices",
    analyticsLabel: "Analytics (Google Analytics 4)", analyticsDesc: "Helps us understand how you browse the site.",
    marketingLabel: "Marketing (Meta Pixel)", marketingDesc: "Allows relevant ads to be shown on Facebook and Instagram.",
    required: "Required (always active)",
  },
  es: {
    title: "Cookies y privacidad",
    text: "Usamos cookies para medir nuestra audiencia y mejorar tu experiencia. No se venden datos a terceros.",
    accept: "Aceptar todo", reject: "Rechazar todo", customize: "Personalizar", save: "Guardar mis preferencias",
    analyticsLabel: "Estadísticas (Google Analytics 4)", analyticsDesc: "Nos ayuda a entender cómo navegas por el sitio.",
    marketingLabel: "Marketing (Meta Pixel)", marketingDesc: "Permite mostrar anuncios relevantes en Facebook e Instagram.",
    required: "Necesarias (siempre activas)",
  },
  ht: {
    title: "Cookies & konfidansyalite",
    text: "Nou itilize cookies pou mezire piblik nou epi amelyore eksperyans ou. Pa gen done ki vann bay tièspati.",
    accept: "Aksepte tout", reject: "Refize tout", customize: "Pèsonalize", save: "Anrejistre chwa mwen",
    analyticsLabel: "Estatistik (Google Analytics 4)", analyticsDesc: "Ede nou konprann kijan ou navige sou sit la.",
    marketingLabel: "Maketing (Meta Pixel)", marketingDesc: "Pèmèt montre piblisite ki enpòtan sou Facebook ak Instagram.",
    required: "Nesesè (toujou aktif)",
  },
  pt: {
    title: "Cookies & privacidade",
    text: "Usamos cookies para medir nossa audiência e melhorar sua experiência. Nenhum dado é vendido a terceiros.",
    accept: "Aceitar tudo", reject: "Recusar tudo", customize: "Personalizar", save: "Salvar minhas escolhas",
    analyticsLabel: "Estatísticas (Google Analytics 4)", analyticsDesc: "Nos ajuda a entender como você navega no site.",
    marketingLabel: "Marketing (Meta Pixel)", marketingDesc: "Permite exibir anúncios relevantes no Facebook e Instagram.",
    required: "Necessários (sempre ativos)",
  },
  it: {
    title: "Cookie e privacy",
    text: "Utilizziamo cookie per misurare il nostro pubblico e migliorare la tua esperienza. Nessun dato viene venduto a terzi.",
    accept: "Accetta tutto", reject: "Rifiuta tutto", customize: "Personalizza", save: "Salva le mie scelte",
    analyticsLabel: "Statistiche (Google Analytics 4)", analyticsDesc: "Ci aiuta a capire come navighi sul sito.",
    marketingLabel: "Marketing (Meta Pixel)", marketingDesc: "Consente di mostrare annunci pertinenti su Facebook e Instagram.",
    required: "Necessari (sempre attivi)",
  },
  de: {
    title: "Cookies & Datenschutz",
    text: "Wir verwenden Cookies, um unsere Reichweite zu messen und Ihre Erfahrung zu verbessern. Keine Daten werden an Dritte verkauft.",
    accept: "Alle akzeptieren", reject: "Alle ablehnen", customize: "Anpassen", save: "Meine Auswahl speichern",
    analyticsLabel: "Statistiken (Google Analytics 4)", analyticsDesc: "Hilft uns zu verstehen, wie Sie die Website nutzen.",
    marketingLabel: "Marketing (Meta Pixel)", marketingDesc: "Ermöglicht relevante Werbung auf Facebook und Instagram.",
    required: "Erforderlich (immer aktiv)",
  },
  ar: {
    title: "ملفات تعريف الارتباط والخصوصية",
    text: "نستخدم ملفات تعريف الارتباط لقياس جمهورنا وتحسين تجربتك. لا تُباع أي بيانات لأطراف ثالثة.",
    accept: "قبول الكل", reject: "رفض الكل", customize: "تخصيص", save: "حفظ خياراتي",
    analyticsLabel: "الإحصاءات (Google Analytics 4)", analyticsDesc: "يساعدنا على فهم كيفية تصفحك للموقع.",
    marketingLabel: "التسويق (Meta Pixel)", marketingDesc: "يتيح عرض إعلانات ذات صلة على Facebook وInstagram.",
    required: "ضرورية (نشطة دائماً)",
  },
}

export default function CookieConsent() {
  const { lang } = useSettings()
  const c = COPY[lang] ?? COPY.fr
  const [visible, setVisible] = useState(false)
  const [leaving, setLeaving] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [analytics, setAnalytics] = useState(false)
  const [marketing, setMarketing] = useState(false)

  useEffect(() => {
    try {
      const stored = localStorage.getItem(CONSENT_KEY)
      if (stored === "accept" || stored === "reject" || stored === "custom") {
        initAnalytics()
        return
      }
      const t = setTimeout(() => setVisible(true), 1200)
      return () => clearTimeout(t)
    } catch {}
  }, [])

  function dismiss(choice: "accept" | "reject" | "custom") {
    setLeaving(true)
    setTimeout(() => setVisible(false), 300)
    try {
      localStorage.setItem(CONSENT_KEY, choice)
      if (choice === "custom") {
        localStorage.setItem(CONSENT_ANALYTICS_KEY, analytics ? "1" : "0")
        localStorage.setItem(CONSENT_MARKETING_KEY, marketing ? "1" : "0")
      }
    } catch {}
    initAnalytics()
    try { window.dispatchEvent(new Event("inov-consent-decided")) } catch {}
  }

  if (!visible) return null

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-label={c.title}
      style={{
        position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)",
        zIndex: 9000, width: "calc(100% - 32px)", maxWidth: 680,
        background: "var(--ds-bg-card)", borderRadius: "var(--r-lg)",
        boxShadow: "0 8px 40px rgba(0,0,0,0.18), 0 0 0 1px var(--ds-border)",
        padding: "22px 24px",
        opacity: leaving ? 0 : 1,
        transition: "opacity 0.3s ease",
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
        <div style={{
          width: 40, height: 40, borderRadius: "var(--r-md)", flexShrink: 0,
          background: "var(--ds-accent-grad)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <Cookie size={20} color="#fff" />
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: 14, fontWeight: 800, color: "var(--ds-text)", marginBottom: 6 }}>
            {c.title}
          </p>
          <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: 13, color: "var(--ds-text-sec)", lineHeight: 1.6 }}>
            {c.text}
          </p>
        </div>

        <button
          onClick={() => dismiss("reject")}
          aria-label={c.reject}
          style={{
            flexShrink: 0, width: 30, height: 30, borderRadius: "var(--r-sm)", border: "none",
            background: "var(--ds-bg-sec)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--ds-text-faint)",
          }}
        >
          <X size={16} />
        </button>
      </div>

      {/* Granular options */}
      {expanded && (
        <div style={{
          marginTop: 16, padding: "14px 16px", background: "var(--ds-bg-sec)", borderRadius: "var(--r-md)",
          display: "flex", flexDirection: "column", gap: 12,
        }}>
          {/* Required — always on, disabled */}
          <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "not-allowed", opacity: 0.6 }}>
            <div style={{
              width: 36, height: 20, borderRadius: "var(--r-md)", background: "var(--ds-accent)",
              display: "flex", alignItems: "center", padding: "2px 3px",
            }}>
              <div style={{ width: 16, height: 16, borderRadius: "50%", background: "#fff", marginLeft: "auto" }} />
            </div>
            <div>
              <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: 13, fontWeight: 700, color: "var(--ds-text)" }}>{c.required}</p>
            </div>
          </label>

          {/* Analytics */}
          <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
            <button
              type="button"
              role="switch"
              aria-checked={analytics}
              aria-label={c.analyticsLabel}
              onClick={() => setAnalytics(v => !v)}
              style={{
                marginTop: 2, width: 36, height: 20, borderRadius: "var(--r-md)", flexShrink: 0, border: "none",
                background: analytics ? "var(--ds-accent)" : "var(--ds-border-strong)",
                display: "flex", alignItems: "center", padding: "2px 3px",
                cursor: "pointer", transition: "background 0.2s",
              }}
            >
              <span style={{
                width: 16, height: 16, borderRadius: "50%", background: "#fff",
                marginLeft: analytics ? "auto" : 0, transition: "margin 0.2s",
              }} />
            </button>
            <div>
              <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: 13, fontWeight: 700, color: "var(--ds-text)" }}>{c.analyticsLabel}</p>
              <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: 12, color: "var(--ds-text-muted)", marginTop: 2 }}>{c.analyticsDesc}</p>
            </div>
          </div>

          {/* Marketing */}
          <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
            <button
              type="button"
              role="switch"
              aria-checked={marketing}
              aria-label={c.marketingLabel}
              onClick={() => setMarketing(v => !v)}
              style={{
                marginTop: 2, width: 36, height: 20, borderRadius: "var(--r-md)", flexShrink: 0, border: "none",
                background: marketing ? "var(--ds-accent)" : "var(--ds-border-strong)",
                display: "flex", alignItems: "center", padding: "2px 3px",
                cursor: "pointer", transition: "background 0.2s",
              }}
            >
              <span style={{
                width: 16, height: 16, borderRadius: "50%", background: "#fff",
                marginLeft: marketing ? "auto" : 0, transition: "margin 0.2s",
              }} />
            </button>
            <div>
              <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: 13, fontWeight: 700, color: "var(--ds-text)" }}>{c.marketingLabel}</p>
              <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: 12, color: "var(--ds-text-muted)", marginTop: 2 }}>{c.marketingDesc}</p>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: "flex", gap: 8, marginTop: 16, justifyContent: "flex-end", flexWrap: "wrap", alignItems: "center" }}>
        {/* Customize toggle */}
        <button
          onClick={() => setExpanded(v => !v)}
          style={{
            display: "inline-flex", alignItems: "center", gap: 5, marginRight: "auto",
            padding: "8px 14px", borderRadius: "var(--r-md)", border: "1.5px solid rgba(0,0,0,0.10)",
            background: "transparent", cursor: "pointer", color: "var(--ds-text-muted)",
            fontFamily: "'Outfit', sans-serif", fontSize: 13, fontWeight: 600,
          }}
        >
          <Settings2 size={14} /> {c.customize} {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
        </button>

        {expanded ? (
          <button
            onClick={() => dismiss("custom")}
            style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              padding: "9px 18px", borderRadius: "var(--r-md)", border: "none",
              background: "var(--ds-ink)", cursor: "pointer", color: "#fff",
              fontFamily: "'Outfit', sans-serif", fontSize: 13.5, fontWeight: 700,
            }}
          >
            <Check size={15} /> {c.save}
          </button>
        ) : (
          <>
            <button
              onClick={() => dismiss("reject")}
              style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                padding: "9px 18px", borderRadius: "var(--r-md)", border: "1.5px solid rgba(0,0,0,0.12)",
                background: "transparent", cursor: "pointer", color: "var(--ds-text-sec)",
                fontFamily: "'Outfit', sans-serif", fontSize: 13.5, fontWeight: 700,
              }}
            >
              <XCircle size={15} /> {c.reject}
            </button>
            <button
              onClick={() => dismiss("accept")}
              className="btn-orange"
              style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                padding: "9px 20px", borderRadius: "var(--r-md)", border: "none",
                cursor: "pointer", color: "#fff",
                fontFamily: "'Outfit', sans-serif", fontSize: 13.5, fontWeight: 700,
              }}
            >
              <Check size={15} /> {c.accept}
            </button>
          </>
        )}
      </div>
    </div>
  )
}
