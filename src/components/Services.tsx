import type { LucideIcon } from "lucide-react"
import { PenTool, Package, Tag, Image as ImageIcon, ArrowRight } from "lucide-react"
import { Link } from "react-router"
import AutoCarousel from "./AutoCarousel"
import { useSettings } from "../context/AppSettings"

// "See all pricing" contextual link under the services carousel, per language.
const ALL_PRICING: Record<string, string> = {
  fr: "Voir tous les tarifs", en: "See all pricing", es: "Ver todos los precios",
  ht: "Wè tout pri yo", pt: "Ver todos os preços", it: "Vedi tutti i prezzi",
  de: "Alle Preise ansehen", ar: "عرض كل الأسعار",
}
import { logo1, socialFlyer, packagingAnana, etiquetteSimple, dielinesPackaging } from "@/data/servicePreviews"

// Visual/price data; localized title + desc come from the dictionary (t.services.cards) by `card` index.
// Only services with a preview image/gif are shown; the others are hidden until visuals are provided.
const serviceMeta: { icon: LucideIcon; price: number; card: number; preview?: string }[] = [
  { icon: PenTool, price: 72, card: 1, preview: logo1 },
  { icon: Package, price: 54, card: 4, preview: packagingAnana },
  { icon: Tag, price: 27, card: 5, preview: etiquetteSimple },
  { icon: ImageIcon, price: 36, card: 6, preview: socialFlyer },
]

// Extra "Packaging & Dielines" service, kept with its own localized copy here so
// it doesn't require touching every language dictionary. Shown after the cards above.
const dielinesCard: { icon: LucideIcon; price: number; preview: string; copy: Record<string, { title: string; desc: string }> } = {
  icon: Package,
  price: 54,
  preview: dielinesPackaging,
  copy: {
    fr: { title: "Emballage & Dielines", desc: "Gabarit de découpe, boîte, sac cadeau et mockup 3D — un emballage structurel prêt à imprimer pour sublimer votre produit." },
    en: { title: "Packaging & Dielines", desc: "Cut template, box, gift bag and 3D mockup — print-ready structural packaging to make your product shine." },
    es: { title: "Packaging & Dielines", desc: "Plantilla de corte, caja, bolsa de regalo y mockup 3D — packaging estructural listo para imprimir para lucir tu producto." },
    ht: { title: "Anbalaj & Dielines", desc: "Modèl koupe, bwat, sak kado ak mockup 3D — yon anbalaj estriktirèl ki pare pou enprime pou mete pwodwi ou an valè." },
    pt: { title: "Embalagem & Dielines", desc: "Molde de corte, caixa, sacola e mockup 3D — embalagem estrutural pronta para impressão para valorizar o seu produto." },
    it: { title: "Packaging & Dielines", desc: "Fustella, scatola, shopper e mockup 3D — packaging strutturale pronto per la stampa per valorizzare il tuo prodotto." },
    de: { title: "Verpackung & Stanzformen", desc: "Stanzkontur, Schachtel, Geschenktüte und 3D-Mockup — druckfertige Verpackung, die Ihr Produkt hervorhebt." },
    ar: { title: "التغليف والقوالب (Dielines)", desc: "قالب القص وعلبة وحقيبة هدايا ومعاينة ثلاثية الأبعاد — تغليف هيكلي جاهز للطباعة لإبراز منتجك." },
  },
}

function ServiceCard({ icon: Icon, title, desc, preview, orderLabel, waHref }: { icon: LucideIcon; title: string; desc: string; preview?: string; orderLabel: string; waHref: string }) {
  return (
    <div
      style={{
        background: "var(--ds-bg-card)",
        border: "1px solid var(--ds-border)",
        borderRadius: "var(--r-xl)",
        padding: 24,
        height: "100%",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        transition: "all 0.3s ease",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.transform = "translateY(-5px)"
        ;(e.currentTarget as HTMLDivElement).style.boxShadow = "0 16px 40px rgba(0,0,0,0.10)"
        ;(e.currentTarget as HTMLDivElement).style.borderColor = "var(--ds-border-strong)"
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.transform = ""
        ;(e.currentTarget as HTMLDivElement).style.boxShadow = ""
        ;(e.currentTarget as HTMLDivElement).style.borderColor = "var(--ds-border)"
      }}
    >
      {preview ? (
        <div style={{ borderRadius: "var(--r-md)", overflow: "hidden", marginBottom: 18, lineHeight: 0, background: "var(--ds-bg-sec)" }}>
          <img src={preview} alt={`Exemple — ${title}`} loading="lazy" decoding="async" style={{ width: "100%", height: "auto", display: "block", objectFit: "contain" }} />
        </div>
      ) : (
        <div style={{ width: 52, height: 52, borderRadius: "var(--r-md)", background: "var(--ds-accent-a08)", border: "1px solid var(--ds-accent-a18)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 18 }}>
          <Icon size={24} color="var(--ds-accent)" strokeWidth={2} />
        </div>
      )}
      <h3 style={{ fontFamily: "var(--font-outfit)", fontSize: 18, fontWeight: 800, color: "var(--ds-text)", marginBottom: 10, lineHeight: 1.25 }}>
        {title}
      </h3>
      <p style={{ fontFamily: "var(--font-outfit)", fontSize: 14, color: "var(--ds-text-sec)", lineHeight: 1.65, marginBottom: 22, flex: 1 }}>
        {desc}
      </p>

      <a
        href={waHref}
        target="_blank"
        rel="noreferrer"
        className="btn-order btn-orange"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          width: "100%",
          padding: "12px 16px",
          borderRadius: "var(--r-md)",
          color: "#fff",
          fontFamily: "var(--font-outfit)",
          fontSize: 14,
          fontWeight: 700,
          textDecoration: "none",
          boxSizing: "border-box",
        }}
      >
        <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91S17.5 2 12.04 2Zm5.8 14.16c-.24.68-1.42 1.32-1.95 1.36-.5.05-.5.4-3.15-.66-2.65-1.06-4.34-3.76-4.47-3.94-.13-.18-1.08-1.44-1.08-2.74 0-1.3.68-1.94.92-2.2.24-.27.53-.34.7-.34.18 0 .35 0 .5.01.16.01.38-.06.59.45.24.58.8 2.02.87 2.17.07.15.12.32.02.5-.09.18-.14.29-.27.45-.14.15-.29.35-.41.47-.14.14-.28.29-.12.56.16.27.71 1.17 1.53 1.9 1.05.94 1.94 1.23 2.21 1.36.27.14.43.11.59-.07.16-.18.68-.79.86-1.06.18-.27.36-.22.6-.13.24.09 1.54.72 1.8.86.27.13.45.2.51.31.07.11.07.64-.17 1.32Z"/>
        </svg>
        {orderLabel}
      </a>
    </div>
  )
}

export default function Services() {
  const { t, lang } = useSettings()
  const allPricing = ALL_PRICING[lang] ?? ALL_PRICING.fr
  return (
    <section id="services" style={{ background: "var(--ds-bg-sec)", padding: "96px 0" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 var(--section-px)" }}>
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <div style={{ marginBottom: 20 }}>
            <span className="section-tag"><span className="dot-pulse" />{t.services.tag}</span>
          </div>
          <h2 className="section-title" style={{ marginBottom: 16 }}>{t.services.title}</h2>
          <p style={{ fontFamily: "var(--font-outfit)", fontSize: 17.6, color: "var(--ds-text-sec)", maxWidth: 520, margin: "0 auto", lineHeight: 1.7 }}>
            {t.services.subtitle}
          </p>
        </div>

        <AutoCarousel visibleCount={3} mobileVisibleCount={1} interval={3500} burst>
          {[
            ...serviceMeta.map((m, i) => {
              const title = t.services.cards[m.card].title
              const msg = t.services.orderText.replace("{service}", title)
              return (
                <ServiceCard
                  key={i}
                  icon={m.icon}
                  preview={m.preview}
                  title={title}
                  desc={t.services.cards[m.card].desc}
                  orderLabel={t.services.order}
                  waHref={`https://wa.me/50936255920?text=${encodeURIComponent(msg)}`}
                />
              )
            }),
            (() => {
              const c = dielinesCard.copy[lang] ?? dielinesCard.copy.fr
              const msg = t.services.orderText.replace("{service}", c.title)
              return (
                <ServiceCard
                  key="dielines"
                  icon={dielinesCard.icon}
                  preview={dielinesCard.preview}
                  title={c.title}
                  desc={c.desc}
                  orderLabel={t.services.order}
                  waHref={`https://wa.me/50936255920?text=${encodeURIComponent(msg)}`}
                />
              )
            })(),
          ]}
        </AutoCarousel>

        <div style={{ textAlign: "center", marginTop: 40 }}>
          <Link
            to="/#pricing"
            style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              fontFamily: "var(--font-outfit)", fontSize: 15, fontWeight: 700,
              color: "var(--ds-accent-text)", textDecoration: "none",
              padding: "10px 18px", borderRadius: "var(--r-full)",
              border: "1.5px solid var(--ds-border-strong)",
              transition: "border-color 0.2s, background 0.2s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "var(--ds-accent-a08)"; e.currentTarget.style.borderColor = "var(--ds-accent)" }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = "var(--ds-border-strong)" }}
          >
            {allPricing} <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  )
}
