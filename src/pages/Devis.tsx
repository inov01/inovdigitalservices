import { useEffect } from "react"
import { Link } from "react-router"
import { ArrowLeft } from "lucide-react"
import Pricing from "../components/Pricing"
import { useSettings } from "../context/AppSettings"
import { applyPageMeta } from "../lib/seo"
import { track } from "../lib/analytics"

// Localized copy for the standalone quote page. Keeps the same 8-language
// coverage as the rest of the site; falls back to French.
const UI: Record<string, { title: string; sub: string; back: string }> = {
  fr: { title: "Configurez votre devis", sub: "Composez votre projet, obtenez un prix instantané, puis recevez votre proforma par e-mail ou commandez sur WhatsApp.", back: "Retour à l'accueil" },
  en: { title: "Build your quote", sub: "Configure your project, get an instant price, then receive your proforma by e-mail or order on WhatsApp.", back: "Back to home" },
  es: { title: "Configura tu presupuesto", sub: "Arma tu proyecto, obtén un precio al instante y recibe tu proforma por correo o pide por WhatsApp.", back: "Volver al inicio" },
  ht: { title: "Konfigire devi ou", sub: "Konpoze pwojè ou, jwenn yon pri touswit, epi resevwa pwofòma ou pa imèl oswa kòmande sou WhatsApp.", back: "Retounen nan akèy" },
  pt: { title: "Monte seu orçamento", sub: "Configure seu projeto, obtenha um preço instantâneo e receba sua proforma por e-mail ou peça pelo WhatsApp.", back: "Voltar ao início" },
  it: { title: "Configura il tuo preventivo", sub: "Componi il tuo progetto, ottieni un prezzo immediato e ricevi la proforma via e-mail o ordina su WhatsApp.", back: "Torna alla home" },
  de: { title: "Angebot zusammenstellen", sub: "Stellen Sie Ihr Projekt zusammen, erhalten Sie sofort einen Preis und bekommen Sie Ihre Proforma per E-Mail oder bestellen Sie per WhatsApp.", back: "Zurück zur Startseite" },
  ar: { title: "أنشئ عرض السعر الخاص بك", sub: "قم بتكوين مشروعك، واحصل على سعر فوري، ثم استلم فاتورتك المبدئية عبر البريد الإلكتروني أو اطلب عبر واتساب.", back: "العودة إلى الرئيسية" },
}

export default function Devis() {
  const { lang } = useSettings()
  const ui = UI[lang] ?? UI.fr

  useEffect(() => {
    applyPageMeta({
      title: `${ui.title} — INOV Digital Services`,
      description: ui.sub,
      type: "website",
    })
    track("view_devis_page")
    window.scrollTo(0, 0)
  }, [ui.title, ui.sub])

  return (
    <section style={{ background: "var(--ds-bg-sec)", padding: "64px 0 40px", minHeight: "70vh" }}>
      <div style={{ maxWidth: 1180, margin: "0 auto", padding: "0 var(--section-px)" }}>
        <div style={{ marginBottom: 20 }}>
          <Link
            to="/"
            style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "9px 16px", borderRadius: "var(--r-full)",
              background: "var(--ds-bg-card)", border: "1px solid var(--ds-border)",
              fontFamily: "'Outfit', sans-serif", fontSize: 14, fontWeight: 700,
              color: "var(--ds-text)", textDecoration: "none",
            }}
          >
            <ArrowLeft size={16} /> {ui.back}
          </Link>
        </div>
        <h1
          style={{
            fontFamily: "'Outfit', sans-serif", fontWeight: 800,
            fontSize: "clamp(28px, 4vw, 44px)", lineHeight: 1.1,
            color: "var(--ds-text)", margin: "0 0 12px",
          }}
        >
          {ui.title}
        </h1>
        <p
          style={{
            fontFamily: "'Outfit', sans-serif", fontSize: 17, lineHeight: 1.6,
            color: "var(--ds-text-sec)", maxWidth: 620, margin: 0,
          }}
        >
          {ui.sub}
        </p>
      </div>
      <Pricing />
    </section>
  )
}
