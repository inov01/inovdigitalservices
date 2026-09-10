import { Link } from "react-router"
import { ArrowRight } from "lucide-react"
import { useSettings } from "../context/AppSettings"
import { allBriefServices, briefStr } from "../data/briefs"

// Section heading copy per language. The per-service names come from briefStr().
const COPY: Record<string, { tag: string; title: string; subtitle: string; cta: string }> = {
  fr: { tag: "Formulaires de brief", title: "Démarrez votre projet", subtitle: "Choisissez votre service et remplissez un brief détaillé — nous revenons vers vous avec une proposition sur mesure.", cta: "Remplir le brief" },
  en: { tag: "Project briefs", title: "Start your project", subtitle: "Pick your service and fill in a detailed brief — we get back to you with a tailored proposal.", cta: "Fill the brief" },
  es: { tag: "Formularios de brief", title: "Empieza tu proyecto", subtitle: "Elige tu servicio y completa un brief detallado — te respondemos con una propuesta a medida.", cta: "Completar el brief" },
  ht: { tag: "Fòm brief", title: "Kòmanse pwojè ou", subtitle: "Chwazi sèvis ou epi ranpli yon brief detaye — n ap reponn ou ak yon pwopozisyon sou mezi.", cta: "Ranpli brief la" },
  pt: { tag: "Formulários de brief", title: "Comece o seu projeto", subtitle: "Escolha o seu serviço e preencha um brief detalhado — respondemos com uma proposta personalizada.", cta: "Preencher o brief" },
  it: { tag: "Moduli di brief", title: "Avvia il tuo progetto", subtitle: "Scegli il tuo servizio e compila un brief dettagliato — ti rispondiamo con una proposta su misura.", cta: "Compila il brief" },
  de: { tag: "Projekt-Briefings", title: "Starten Sie Ihr Projekt", subtitle: "Wählen Sie Ihren Service und füllen Sie ein detailliertes Briefing aus — wir melden uns mit einem maßgeschneiderten Angebot.", cta: "Briefing ausfüllen" },
  ar: { tag: "نماذج الموجز", title: "ابدأ مشروعك", subtitle: "اختر خدمتك واملأ موجزًا مفصلاً — سنعود إليك باقتراح مُخصّص.", cta: "املأ الموجز" },
}

export default function BriefLinks() {
  const { lang } = useSettings()
  const c = COPY[lang] ?? COPY.fr
  const t = briefStr(lang)
  const services = allBriefServices()

  return (
    <section id="briefs" style={{ background: "var(--ds-bg)", padding: "96px 0" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 var(--section-px)" }}>
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <div style={{ marginBottom: 20 }}>
            <span className="section-tag"><span className="dot-pulse" />{c.tag}</span>
          </div>
          <h2 className="section-title" style={{ marginBottom: 16 }}>{c.title}</h2>
          <p style={{ fontFamily: "var(--font-outfit)", fontSize: 17.6, color: "var(--ds-text-sec)", maxWidth: 560, margin: "0 auto", lineHeight: 1.7 }}>
            {c.subtitle}
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 18 }}>
          {services.map(({ slug, icon: Icon }) => (
            <Link
              key={slug}
              to={`/brief/${slug}`}
              className="brief-card"
              style={{
                display: "flex", alignItems: "center", gap: 14,
                background: "var(--ds-bg-card)", border: "1px solid var(--ds-border)",
                borderRadius: "var(--r-xl)", padding: "18px 20px", textDecoration: "none",
                transition: "transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-4px)"
                e.currentTarget.style.boxShadow = "0 14px 34px rgba(0,0,0,0.10)"
                e.currentTarget.style.borderColor = "var(--ds-border-strong)"
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = ""
                e.currentTarget.style.boxShadow = ""
                e.currentTarget.style.borderColor = "var(--ds-border)"
              }}
            >
              <span style={{ width: 46, height: 46, flexShrink: 0, borderRadius: "var(--r-md)", background: "var(--ds-accent-a08)", border: "1px solid var(--ds-accent-a18)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon size={22} color="var(--ds-accent)" strokeWidth={2} />
              </span>
              <span style={{ minWidth: 0, flex: 1 }}>
                <span style={{ display: "block", fontFamily: "var(--font-outfit)", fontSize: 15.5, fontWeight: 800, color: "var(--ds-text)", lineHeight: 1.25 }}>
                  {t(`svc.${slug}.name`)}
                </span>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 5, marginTop: 4, fontFamily: "var(--font-outfit)", fontSize: 13, fontWeight: 700, color: "var(--ds-accent-text)" }}>
                  {c.cta} <ArrowRight size={14} />
                </span>
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
