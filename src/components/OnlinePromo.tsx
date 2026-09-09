import { useState } from "react"
import { TrendingUp, Eye, Clock, Sparkles, Lock, Plus, ShieldCheck, UserCheck, Link2, BarChart3, Users, ChevronDown, type LucideIcon } from "lucide-react"
import { SiWhatsapp, SiInstagram, SiTiktok, SiFacebook, SiYoutube, SiPinterest } from "./SocialIcons"
import { useSettings } from "../context/AppSettings"
import promoFlyer from "../imports/INOV_Digital_Services__4__png.webp"

const WA = "50936255920"
const waHref = (msg: string) => `https://wa.me/${WA}?text=${encodeURIComponent(msg)}`

const MIN_BUDGET = 50
const FEE_RATE = 0.4

type IconCmp = React.ComponentType<{ size?: number; color?: string }>
const PLATFORMS: { key: string; label: string; Icon: IconCmp | LucideIcon }[] = [
  { key: "instagram", label: "Instagram", Icon: SiInstagram },
  { key: "tiktok", label: "TikTok", Icon: SiTiktok },
  { key: "facebook", label: "Facebook", Icon: SiFacebook },
  { key: "youtube", label: "YouTube", Icon: SiYoutube },
  { key: "pinterest", label: "Pinterest", Icon: SiPinterest },
  { key: "autre", label: "Autre", Icon: Plus },
]

// How we run campaigns without ever asking for the client's password.
const REASSURANCE: { Icon: LucideIcon; title: string; text: string }[] = [
  { Icon: Users, title: "Une audience 100 % réelle", text: "Vos vues et votre portée viennent de vraies personnes, ciblées par centres d'intérêt et localisation — jamais de bots ni de faux comptes. Nous passons par la régie publicitaire officielle des plateformes (Meta, TikTok), la seule qui garantit un trafic authentique." },
  { Icon: UserCheck, title: "Accès partenaire, pas votre mot de passe", text: "Vous nous ajoutez comme partenaire dans Meta Business Suite ou TikTok Business Center. Nous gérons les pubs sans jamais voir vos identifiants." },
  { Icon: Link2, title: "Un simple lien suffit", text: "Pour un boost rapide, envoyez-nous juste le lien de la publication à promouvoir et votre budget — rien d'autre." },
  { Icon: ShieldCheck, title: "Vous gardez le contrôle", text: "Vous restez propriétaire de vos comptes et pouvez révoquer notre accès à tout moment, en un clic." },
  { Icon: BarChart3, title: "Résultats transparents", text: "Vous recevez un suivi clair des performances : portée, vues et engagement de votre campagne." },
]

interface Tier {
  key: string
  name: string
  price: string
  views: string
  duration: string
  featured?: boolean
  note?: string
}

const TIERS: Tier[] = [
  { key: "semaine", name: "Semaine", price: "1 750 HTG", views: "15 000 – 70 000", duration: "7 jours" },
  { key: "mois", name: "Mois", price: "7 500 HTG", views: "70 000 – 300 000", duration: "30 jours", featured: true },
]

// Interactive "Sur-mesure" card: the client sets a budget (≥ 50 $US) and picks the
// platforms; we show the 40% fee + total and hand it all off to WhatsApp.
function CustomTier() {
  const [budget, setBudget] = useState<number>(MIN_BUDGET)
  const [platforms, setPlatforms] = useState<string[]>([])
  const [otherText, setOtherText] = useState("")

  const valid = Number.isFinite(budget) && budget >= MIN_BUDGET
  const fee = valid ? Math.round(budget * FEE_RATE) : 0
  const total = valid ? budget + fee : 0
  const otherSelected = platforms.includes("autre")

  function togglePlatform(key: string) {
    setPlatforms((prev) => prev.includes(key) ? prev.filter((p) => p !== key) : [...prev, key])
  }

  const platformLabels = PLATFORMS
    .filter((p) => platforms.includes(p.key) && p.key !== "autre")
    .map((p) => p.label)
  if (otherSelected && otherText.trim()) platformLabels.push(otherText.trim())

  const msg = `Bonjour INOV Digital Services, je veux une Promotion en ligne sur-mesure.\n• Plateformes : ${platformLabels.length ? platformLabels.join(", ") : "à définir"}\n• Budget : ${budget} $US\n• Frais (40 %) : ${fee} $US\n• Total : ${total} $US`

  return (
    <div style={{
      position: "relative", display: "flex", flexDirection: "column",
      padding: 28, borderRadius: "var(--r-lg)", boxSizing: "border-box",
      background: "var(--ds-bg-sec)", border: "1px solid var(--ds-border)",
    }}>
      <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 20, fontWeight: 800, marginBottom: 6 }}>Sur-mesure</h3>
      <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 15, fontWeight: 700, color: "var(--ds-text-sec)", marginBottom: 18 }}>
        Choisissez votre budget & vos plateformes
      </div>

      {/* Platform picker */}
      <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 12.5, fontWeight: 700, color: "var(--ds-text-muted)", marginBottom: 8 }}>Plateformes</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
        {PLATFORMS.map(({ key, label, Icon }) => {
          const active = platforms.includes(key)
          return (
            <button
              key={key}
              type="button"
              onClick={() => togglePlatform(key)}
              aria-pressed={active}
              style={{
                display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 13px", borderRadius: "var(--r-full)",
                fontFamily: "'Outfit', sans-serif", fontSize: 13, fontWeight: 700, cursor: "pointer",
                color: active ? "#fff" : "var(--ds-text-sec)",
                background: active ? "var(--ds-accent-grad)" : "var(--ds-bg-card-hover)",
                border: active ? "1px solid transparent" : "1px solid var(--ds-border-strong)",
                transition: "all 0.18s ease",
              }}
            >
              <Icon size={15} /> {label}
            </button>
          )
        })}
      </div>

      {/* Free-text field for any other platform */}
      {otherSelected && (
        <input
          type="text"
          value={otherText}
          onChange={(e) => setOtherText(e.target.value)}
          placeholder="Quelle plateforme ? (ex. LinkedIn, Google, site web…)"
          aria-label="Autre plateforme à promouvoir"
          style={{
            width: "100%", boxSizing: "border-box", marginBottom: 16,
            background: "var(--ds-bg-sec)", border: "1px solid var(--ds-border-strong)",
            borderRadius: "var(--r-md)", padding: "10px 14px", outline: "none", color: "var(--ds-text)",
            fontFamily: "'Outfit', sans-serif", fontSize: 14,
          }}
        />
      )}

      {/* Budget input */}
      <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 12.5, fontWeight: 700, color: "var(--ds-text-muted)", marginBottom: 8 }}>
        Votre budget (min. {MIN_BUDGET} $US)
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, background: "var(--ds-bg-sec)", border: "1px solid var(--ds-border-strong)", borderRadius: "var(--r-md)", padding: "4px 14px", marginBottom: 16 }}>
        <input
          type="number"
          min={MIN_BUDGET}
          step={10}
          value={Number.isFinite(budget) ? budget : ""}
          onChange={(e) => setBudget(parseInt(e.target.value, 10))}
          aria-label="Budget en dollars US"
          style={{
            flex: 1, minWidth: 0, background: "transparent", border: "none", outline: "none",
            color: "var(--ds-text)", fontFamily: "'Outfit', sans-serif", fontSize: 22, fontWeight: 800,
          }}
        />
        <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 15, fontWeight: 700, color: "var(--ds-accent)" }}>$US</span>
      </div>
      {!valid && (
        <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 12, color: "var(--ds-accent)", marginBottom: 12 }}>
          Le budget minimum est de {MIN_BUDGET} $US.
        </div>
      )}

      {/* Fee breakdown */}
      <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 22, fontFamily: "'Outfit', sans-serif", fontSize: 14, color: "var(--ds-text)" }}>
        <div style={{ display: "flex", justifyContent: "space-between" }}><span>Frais (40 %)</span><strong>{fee} $US</strong></div>
        <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 6, borderTop: "1px solid var(--ds-border)" }}>
          <span>Total à payer</span><strong style={{ color: "var(--ds-accent)", fontSize: 17 }}>{total} $US</strong>
        </div>
      </div>

      <a
        href={valid ? waHref(msg) : undefined}
        target="_blank"
        rel="noreferrer"
        aria-disabled={!valid}
        className="btn-orange"
        onClick={(e) => { if (!valid) e.preventDefault() }}
        style={{
          marginTop: "auto", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          width: "100%", padding: "12px 16px", borderRadius: "var(--r-md)", color: "#fff",
          fontFamily: "'Outfit', sans-serif", fontSize: 14.5, fontWeight: 700, textDecoration: "none", boxSizing: "border-box",
          opacity: valid ? 1 : 0.5, pointerEvents: valid ? "auto" : "none",
        }}
      >
        <SiWhatsapp size={18} /> Commander
      </a>

      {/* Trust note: no password ever required */}
      <div style={{
        display: "flex", alignItems: "flex-start", gap: 8, marginTop: 14,
        fontFamily: "'Outfit', sans-serif", fontSize: 12, lineHeight: 1.5, color: "var(--ds-text-muted)",
      }}>
        <Lock size={14} color="var(--ds-accent)" aria-hidden="true" style={{ flexShrink: 0, marginTop: 1 }} />
        <span>Aucun mot de passe requis — nous lançons votre campagne via un accès partenaire sécurisé (Meta Business, etc.).</span>
      </div>
    </div>
  )
}

// Online-promotion offer priced in gourdes — shown to Haitian visitors only.
// Rendered by App conditionally on region === "HT".
export default function OnlinePromo() {
  const [open, setOpen] = useState(false)
  const panelId = "promo-en-ligne-panel"

  return (
    <section id="promo-en-ligne" style={{ background: "var(--ds-bg)", padding: "96px 0", color: "var(--ds-text)" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 var(--section-px)" }}>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls={panelId}
          style={{
            display: "block", width: "100%", textAlign: "center", cursor: "pointer",
            background: "transparent", border: "none", color: "inherit", padding: 0,
            marginBottom: open ? 56 : 0,
          }}
        >
          <div style={{ marginBottom: 20 }}>
            <span style={{
              display: "inline-flex", alignItems: "center", gap: 7, padding: "6px 14px", borderRadius: "var(--r-full)",
              background: "var(--ds-accent-a14)", border: "1px solid var(--ds-accent-a35)",
              fontFamily: "'Outfit', sans-serif", fontSize: 12.5, fontWeight: 700, letterSpacing: "0.04em",
              textTransform: "uppercase", color: "var(--ds-accent)",
            }}>
              <TrendingUp size={14} aria-hidden="true" /> Offre Haïti 🇭🇹
            </span>
          </div>
          <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: "clamp(28px, 5vw, 44px)", fontWeight: 800, lineHeight: 1.1, marginBottom: 16 }}>
            Augmentez votre <span style={{ background: "var(--ds-accent-grad)", WebkitBackgroundClip: "text", backgroundClip: "text", WebkitTextFillColor: "transparent" }}>visibilité en ligne</span>
          </h2>
          <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: 17, color: "var(--ds-text-sec)", maxWidth: 560, margin: "0 auto", lineHeight: 1.7 }}>
            Boostez votre présence sur Instagram, TikTok et Facebook. Des campagnes pensées pour le marché haïtien, à des tarifs en gourdes — devant une audience 100 % réelle, jamais des robots.
          </p>
          <span style={{
            display: "inline-flex", alignItems: "center", gap: 8, marginTop: 22, padding: "9px 18px", borderRadius: "var(--r-full)",
            background: "var(--ds-bg-sec)", border: "1px solid var(--ds-border-strong)",
            fontFamily: "'Outfit', sans-serif", fontSize: 13.5, fontWeight: 700, color: "var(--ds-text)",
          }}>
            {open ? "Réduire" : "Voir les formules & tarifs"}
            <ChevronDown size={16} aria-hidden="true" style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s ease" }} />
          </span>
        </button>

        {!open ? null : (<>
        <div style={{ display: "grid", gap: 20, gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", alignItems: "stretch", marginBottom: 40 }}>
          {TIERS.map((tier) => (
            <div
              key={tier.key}
              style={{
                position: "relative", display: "flex", flexDirection: "column",
                padding: 28, borderRadius: "var(--r-lg)", boxSizing: "border-box",
                background: tier.featured ? "linear-gradient(160deg, var(--ds-accent-a16), color-mix(in srgb, var(--ds-accent-hover) 6%, transparent))" : "var(--ds-bg-sec)",
                border: tier.featured ? "1px solid rgba(var(--ds-accent-rgb),0.5)" : "1px solid var(--ds-border)",
              }}
            >
              {tier.featured && (
                <span style={{
                  position: "absolute", top: 16, right: 16, display: "inline-flex", alignItems: "center", gap: 4,
                  padding: "3px 10px", borderRadius: "var(--r-full)", background: "var(--ds-accent-grad)",
                  fontFamily: "'Outfit', sans-serif", fontSize: 10.5, fontWeight: 800, letterSpacing: "0.06em", textTransform: "uppercase",
                }}>
                  <Sparkles size={11} aria-hidden="true" /> Populaire
                </span>
              )}
              <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 20, fontWeight: 800, marginBottom: 6 }}>{tier.name}</h3>
              <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 26, fontWeight: 800, color: "var(--ds-accent)", marginBottom: 18 }}>{tier.price}</div>

              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 22 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 9, fontFamily: "'Outfit', sans-serif", fontSize: 14, color: "var(--ds-text)" }}>
                  <Eye size={16} color="var(--ds-accent)" aria-hidden="true" /> Vue totale estimée : <strong>{tier.views}</strong>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 9, fontFamily: "'Outfit', sans-serif", fontSize: 14, color: "var(--ds-text)" }}>
                  <Clock size={16} color="var(--ds-accent)" aria-hidden="true" /> Durée : <strong>{tier.duration}</strong>
                </div>
                {tier.note && (
                  <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 12.5, color: "var(--ds-text-muted)", fontStyle: "italic" }}>{tier.note}</div>
                )}
              </div>

              <a
                href={waHref(`Bonjour INOV Digital Services, je suis intéressé par la Promotion en ligne — formule ${tier.name}.`)}
                target="_blank"
                rel="noreferrer"
                className="btn-orange"
                style={{
                  marginTop: "auto", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  width: "100%", padding: "12px 16px", borderRadius: "var(--r-md)", color: "#fff",
                  fontFamily: "'Outfit', sans-serif", fontSize: 14.5, fontWeight: 700, textDecoration: "none", boxSizing: "border-box",
                }}
              >
                <SiWhatsapp size={18} /> Commander
              </a>

              {/* Trust note: no password ever required */}
              <div style={{
                display: "flex", alignItems: "flex-start", gap: 8, marginTop: 14,
                fontFamily: "'Outfit', sans-serif", fontSize: 12, lineHeight: 1.5, color: "var(--ds-text-muted)",
              }}>
                <Lock size={14} color="var(--ds-accent)" aria-hidden="true" style={{ flexShrink: 0, marginTop: 1 }} />
                <span>Aucun mot de passe requis — campagne lancée via un accès partenaire sécurisé (Meta Business, etc.).</span>
              </div>
            </div>
          ))}
          <CustomTier />
        </div>

        <div style={{
          display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "center", gap: 28,
          maxWidth: 900, margin: "0 auto",
        }}>
          <div style={{ flex: "1 1 260px", maxWidth: 360, borderRadius: "var(--r-lg)", overflow: "hidden", lineHeight: 0, border: "1px solid var(--ds-border)" }}>
            <img src={promoFlyer} alt="Promotion en ligne INOV — augmentez votre visibilité" loading="lazy" style={{ width: "100%", height: "auto", display: "block" }} />
          </div>
          <div style={{ flex: "1 1 260px", maxWidth: 420 }}>
            <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: 15.5, color: "var(--ds-text-sec)", lineHeight: 1.7, marginBottom: 18 }}>
              Adaptez votre campagne selon les besoins de votre entreprise. On s'occupe du ciblage, du visuel et du suivi des performances.
            </p>
            <a
              href={waHref("Bonjour INOV Digital Services, je veux discuter d'une campagne de Promotion en ligne sur-mesure.")}
              target="_blank"
              rel="noreferrer"
              style={{
                display: "inline-flex", alignItems: "center", gap: 8, padding: "12px 22px", borderRadius: "var(--r-md)",
                background: "#25D366", color: "var(--ds-ink)", fontFamily: "'Outfit', sans-serif", fontSize: 14.5,
                fontWeight: 800, textDecoration: "none",
              }}
            >
              <SiWhatsapp size={18} /> +509 3625-5920
            </a>
          </div>
        </div>

        {/* Reassurance: how we promote without ever needing the client's password */}
        <div style={{ maxWidth: 900, margin: "56px auto 0" }}>
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 10,
            fontFamily: "'Outfit', sans-serif", fontSize: 22, fontWeight: 800, textAlign: "center",
          }}>
            <ShieldCheck size={22} color="var(--ds-accent)" aria-hidden="true" />
            Sans jamais partager votre mot de passe
          </div>
          <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: 15, color: "var(--ds-text-sec)", lineHeight: 1.7, textAlign: "center", maxWidth: 620, margin: "0 auto 32px" }}>
            Nous promouvons votre compte en toute sécurité : vous gardez le contrôle total, et aucun identifiant ne nous est jamais demandé.
          </p>

          <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))" }}>
            {REASSURANCE.map(({ Icon, title, text }) => (
              <div key={title} style={{
                padding: 22, borderRadius: "var(--r-lg)", background: "var(--ds-bg-sec)",
                border: "1px solid var(--ds-border)",
              }}>
                <div style={{
                  width: 44, height: 44, borderRadius: "var(--r-md)", marginBottom: 14,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  background: "var(--ds-accent-a14)", border: "1px solid var(--ds-accent-a30)",
                }}>
                  <Icon size={22} color="var(--ds-accent)" aria-hidden="true" />
                </div>
                <h4 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 16, fontWeight: 800, marginBottom: 6 }}>{title}</h4>
                <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: 13.5, color: "var(--ds-text-sec)", lineHeight: 1.6 }}>{text}</p>
              </div>
            ))}
          </div>
        </div>
        </>)}
      </div>
    </section>
  )
}
