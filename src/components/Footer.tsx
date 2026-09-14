import { Link } from "react-router"
import { SiInstagram, SiTiktok, SiFacebook, SiYoutube, SiPinterest, SiWhatsapp } from "./SocialIcons"
import { Mail, MapPin } from "lucide-react"
import logoDark from "../imports/logo_pour_fond_noir.webp"
import { useSettings } from "../context/AppSettings"
import { renderRich } from "../i18n/renderRich"
import { FOOTER_NAV_ITEMS } from "../data/nav"

type SvgIcon = (props: { size?: number; color?: string }) => React.ReactElement
const socials: { label: string; icon: SvgIcon; href: string }[] = [
  { label: "Instagram", icon: SiInstagram, href: "https://www.instagram.com/inov_digital_services" },
  { label: "TikTok", icon: SiTiktok, href: "https://www.tiktok.com/@inovdigitalservices" },
  { label: "Facebook", icon: SiFacebook, href: "https://www.facebook.com/INOV" },
  { label: "YouTube", icon: SiYoutube, href: "https://www.youtube.com/channel/UCrVqEGifia6oc6uzKyKpVKw" },
  { label: "Pinterest", icon: SiPinterest, href: "https://www.pinterest.com/inov01contact" },
  { label: "WhatsApp", icon: SiWhatsapp, href: "https://wa.me/50936255920" },
]

// "Espace client" column — real internal routes (SEO + navigation).
const CLIENT_LABELS: Record<string, { title: string; account: string; quote: string; ambassador: string; pay: string; formation: string }> = {
  fr: { title: "Espace client", account: "Mon compte", quote: "Devis gratuit", ambassador: "Programme ambassadeur", pay: "Payer en ligne", formation: "Formations" },
  en: { title: "Client area", account: "My account", quote: "Free quote", ambassador: "Ambassador program", pay: "Pay online", formation: "Training" },
  es: { title: "Área de cliente", account: "Mi cuenta", quote: "Presupuesto gratis", ambassador: "Programa de embajadores", pay: "Pagar en línea", formation: "Formación" },
  ht: { title: "Espas kliyan", account: "Kont mwen", quote: "Devi gratis", ambassador: "Pwogram anbasadè", pay: "Peye anliy", formation: "Fòmasyon" },
  pt: { title: "Área do cliente", account: "Minha conta", quote: "Orçamento grátis", ambassador: "Programa de embaixadores", pay: "Pagar online", formation: "Formação" },
  it: { title: "Area cliente", account: "Il mio account", quote: "Preventivo gratuito", ambassador: "Programma ambasciatori", pay: "Paga online", formation: "Formazione" },
  de: { title: "Kundenbereich", account: "Mein Konto", quote: "Kostenloses Angebot", ambassador: "Botschafter-Programm", pay: "Online bezahlen", formation: "Weiterbildung" },
  ar: { title: "منطقة العميل", account: "حسابي", quote: "عرض سعر مجاني", ambassador: "برنامج السفراء", pay: "الدفع عبر الإنترنت", formation: "التدريب" },
}

const LEGAL_LABELS: Record<string, { blog: string; terms: string; privacy: string; pay: string; collaborateur: string; soon: string }> = {
  fr: { blog: "Blog", terms: "Mentions légales", privacy: "Confidentialité", pay: "Payer", collaborateur: "Devenir collaborateur", soon: "Bientôt" },
  en: { blog: "Blog", terms: "Legal notice", privacy: "Privacy", pay: "Pay", collaborateur: "Become a collaborator", soon: "Soon" },
  es: { blog: "Blog", terms: "Aviso legal", privacy: "Privacidad", pay: "Pagar", collaborateur: "Ser colaborador", soon: "Pronto" },
  ht: { blog: "Blog", terms: "Mansyon legal", privacy: "Konfidansyalite", pay: "Peye", collaborateur: "Vin kolaboratè", soon: "Talè" },
  pt: { blog: "Blog", terms: "Aviso legal", privacy: "Privacidade", pay: "Pagar", collaborateur: "Seja colaborador", soon: "Em breve" },
  it: { blog: "Blog", terms: "Note legali", privacy: "Privacy", pay: "Paga", collaborateur: "Diventa collaboratore", soon: "Presto" },
  de: { blog: "Blog", terms: "Impressum", privacy: "Datenschutz", pay: "Bezahlen", collaborateur: "Kollaborateur werden", soon: "Bald" },
  ar: { blog: "المدونة", terms: "إشعار قانوني", privacy: "الخصوصية", pay: "ادفع", collaborateur: "كن متعاوناً", soon: "قريبًا" },
}

export default function Footer() {
  const { t, lang } = useSettings()
  const navLinks = FOOTER_NAV_ITEMS.map((i) => ({ label: t.nav[i.key], href: i.href }))
  const legal = LEGAL_LABELS[lang] ?? LEGAL_LABELS.fr
  const client = CLIENT_LABELS[lang] ?? CLIENT_LABELS.fr
  return (
    <footer style={{ background: "var(--ds-ink)", color: "#fff", padding: "72px 0 0" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 var(--section-px)" }}>
        <div className="footer-grid" style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 48, paddingBottom: 56 }}>
          {/* Brand */}
          <div>
            <div style={{ marginBottom: 16 }}>
              <img src={logoDark} alt="INOV Digital Services" style={{ height: 48, width: "auto", display: "block", objectFit: "contain" }} />
            </div>
            <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: 15, color: "rgba(255,255,255,0.7)", lineHeight: 1.7, maxWidth: 300, marginBottom: 24 }}>
              {t.footer.brandDesc}
            </p>
            <div style={{ display: "flex", gap: 10 }}>
              {socials.map((s) => {
                const Icon = s.icon
                return (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={s.label}
                    style={{
                      width: 40, height: 40, borderRadius: "var(--r-md)", background: "rgba(255,255,255,0.08)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: "#fff", textDecoration: "none",
                      transition: "all 0.2s",
                      border: "1px solid rgba(255,255,255,0.1)",
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = "var(--ds-accent)"; e.currentTarget.style.borderColor = "var(--ds-accent)" }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.08)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)" }}
                  >
                    <Icon size={17} />
                  </a>
                )
              })}
            </div>
          </div>

          {/* Nav */}
          <div>
            <h4 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: 14, color: "rgba(255,255,255,0.7)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 20 }}>
              {t.footer.navigation}
            </h4>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 10 }}>
              {navLinks.map((l) => (
                <li key={l.href}>
                  <a
                    href={l.href}
                    className="footer-link"
                    style={{ fontFamily: "'Outfit', sans-serif", fontSize: 15, textDecoration: "none" }}
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Client area — internal routes */}
          <div>
            <h4 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: 14, color: "rgba(255,255,255,0.7)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 20 }}>
              {client.title}
            </h4>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                { to: "/compte", label: client.account },
                { to: "/devis", label: client.quote },
                { to: "/formation", label: client.formation },
                { to: "/compte", label: client.ambassador },
                { to: "/paiement", label: client.pay },
              ].map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className="footer-link" style={{ fontFamily: "'Outfit', sans-serif", fontSize: 15, textDecoration: "none" }}>
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: 14, color: "rgba(255,255,255,0.7)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 20 }}>
              {t.footer.contact}
            </h4>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <a href="https://wa.me/50936255920" target="_blank" rel="noreferrer" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
                <SiWhatsapp size={18} color="rgba(255,255,255,0.65)" />
                <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 15, color: "rgba(255,255,255,0.75)" }}>+509 3625-5920</span>
              </a>
              <a href="mailto:inov01contact@gmail.com" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
                <Mail size={18} color="rgba(255,255,255,0.65)" />
                <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 14, color: "rgba(255,255,255,0.75)" }}>inov01contact@gmail.com</span>
              </a>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                <MapPin size={18} color="rgba(255,255,255,0.65)" style={{ flexShrink: 0, marginTop: 2 }} />
                <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 14, color: "rgba(255,255,255,0.75)", lineHeight: 1.5 }}>{renderRich(t.footer.location)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", padding: "24px 0", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: 13, color: "rgba(255,255,255,0.72)", margin: 0 }}>
            © {new Date().getFullYear()} INOV Digital Services. {t.footer.rights}
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: 18, flexWrap: "wrap" }}>
            <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 13, color: "rgba(255,255,255,0.72)" }}>{t.footer.tagline}</span>
            <Link to="/paiement" className="footer-link" style={{ fontFamily: "'Outfit', sans-serif", fontSize: 13, textDecoration: "none", color: "rgba(255,255,255,0.72)" }}>{legal.pay}</Link>
            <Link to="/blog" className="footer-link" style={{ fontFamily: "'Outfit', sans-serif", fontSize: 13, textDecoration: "none", color: "rgba(255,255,255,0.72)" }}>{legal.blog}</Link>
            <Link to="/mentions-legales" className="footer-link" style={{ fontFamily: "'Outfit', sans-serif", fontSize: 13, textDecoration: "none", color: "rgba(255,255,255,0.72)" }}>{legal.terms}</Link>
            <Link to="/confidentialite" className="footer-link" style={{ fontFamily: "'Outfit', sans-serif", fontSize: 13, textDecoration: "none", color: "rgba(255,255,255,0.72)" }}>{legal.privacy}</Link>
            <span
              aria-disabled="true"
              aria-label={`${legal.collaborateur} — ${legal.soon}`}
              title={legal.soon}
              style={{
                fontFamily: "'Outfit', sans-serif",
                fontSize: 12.5,
                textDecoration: "none",
                color: "rgba(255,255,255,0.4)",
                cursor: "not-allowed",
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <span aria-hidden="true">{legal.collaborateur}</span>
              <span
                aria-hidden="true"
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: "0.04em",
                  textTransform: "uppercase",
                  color: "rgba(255,255,255,0.55)",
                  border: "1px solid rgba(255,255,255,0.25)",
                  borderRadius: "var(--r-full, 999px)",
                  padding: "1px 6px",
                }}
              >
                {legal.soon}
              </span>
            </span>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .footer-grid { grid-template-columns: 1fr !important; }
        }
        /* Tablet: intermediate 2-column layout instead of jumping 3 → 1 */
        @media (min-width: 769px) and (max-width: 1024px) {
          .footer-grid { grid-template-columns: 1.4fr 1fr !important; row-gap: 40px; }
        }
      `}</style>
    </footer>
  )
}
