import { Star, ArrowUpRight, Quote } from "lucide-react"
import AutoCarousel from "./AutoCarousel"
import { testimonials, type Testimonial } from "../data/services"
import { albums } from "../data/portfolio"
import { useSettings } from "../context/AppSettings"

// Map each testimonial's portfolio id → the company (client) name.
const COMPANY_MAP: Record<string, string> = Object.fromEntries(albums.map((a) => [a.id, a.client]))

// Client logo imports — one per portfolio album referenced in testimonials
import logoRosie   from "../imports/Rosie_logo.webp"
import logoPhysio  from "../imports/2.webp"
import logoParrots from "../imports/1_jpg.webp"
import logoRalines from "../imports/1-2.webp"
import logoMKB     from "../imports/5.webp"
import logoTdc     from "../imports/1-4_jpg.webp"

const LOGO_MAP: Record<string, { logo: string; logoBg: string; logoFit: "contain" | "cover" }> = {
  "rosie":              { logo: logoRosie,   logoBg: "#fff5f5", logoFit: "contain" },
  "physio":             { logo: logoPhysio,  logoBg: "#f0f8ff", logoFit: "contain" },
  "parrots":            { logo: logoParrots, logoBg: "#efe9e0", logoFit: "cover"   },
  "ralines-cosmetics":  { logo: logoRalines, logoBg: "#fdf3f8", logoFit: "contain" },
  "moni-k-boutik":      { logo: logoMKB,     logoBg: "#f0faf0", logoFit: "contain" },
  "the-doctor-company": { logo: logoTdc,     logoBg: "#f2f6fb", logoFit: "contain" },
}

type FullTestimonial = Testimonial & { company: string }

function enriched(t: typeof testimonials[0]): FullTestimonial {
  const m = LOGO_MAP[t.portfolioId] ?? { logo: "", logoBg: "#f6f6f9", logoFit: "contain" as const }
  const company = COMPANY_MAP[t.portfolioId] ?? t.name
  return { ...t, ...m, company }
}

function TestimonialCard({ t, role, text }: { t: FullTestimonial; role: string; text: string }) {
  const { logo, logoFit } = t
  const initials = t.company.split(" ").filter(Boolean).slice(0, 2).map((w) => w.charAt(0)).join("")

  return (
    <a
      className="card testimonial-card"
      href="#portfolio"
      aria-label={`Voir le projet ${t.company}`}
      onClick={(e) => {
        e.preventDefault()
        const el = document.getElementById("portfolio")
        if (el) el.scrollIntoView({ behavior: "smooth" })
      }}
      style={{
        padding: 30,
        height: "100%",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        textDecoration: "none",
        position: "relative",
      }}
    >
      {/* Decorative quote mark */}
      <Quote
        size={40}
        aria-hidden="true"
        style={{ color: "var(--ds-accent)", opacity: 0.16, marginBottom: 6, flexShrink: 0 }}
        fill="var(--ds-accent)"
        strokeWidth={0}
      />

      {/* Quote text — natural, unquoted, not italic */}
      <p
        style={{
          fontFamily: "'Outfit', sans-serif",
          fontSize: 15.5,
          color: "var(--ds-text)",
          lineHeight: 1.75,
          flex: 1,
          margin: "0 0 22px",
          letterSpacing: "-0.005em",
        }}
      >
        {text}
      </p>

      {/* Stars */}
      <div style={{ marginBottom: 18, display: "flex", gap: 3 }}>
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            size={15}
            color="var(--ds-accent)"
            fill={i < t.stars ? "var(--ds-accent)" : "none"}
            strokeWidth={i < t.stars ? 0 : 1.5}
            style={{ opacity: i < t.stars ? 1 : 0.35 }}
          />
        ))}
      </div>

      {/* Client identity — person-led, uniform avatar treatment */}
      <div style={{ display: "flex", alignItems: "center", gap: 13, borderTop: "1px solid var(--ds-border)", paddingTop: 18 }}>
        {/* Avatar: brand logo on a uniform neutral ground for visual coherence */}
        <div
          style={{
            width: 46,
            height: 46,
            borderRadius: "50%",
            flexShrink: 0,
            background: "var(--ds-bg-sec)",
            border: "1px solid var(--ds-border)",
            overflow: "hidden",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {logo ? (
            <img
              src={logo}
              alt=""
              aria-hidden="true"
              loading="lazy"
              decoding="async"
              style={{ width: "100%", height: "100%", objectFit: logoFit }}
            />
          ) : (
            <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 16, fontWeight: 700, color: "var(--ds-accent)" }}>
              {initials}
            </span>
          )}
        </div>

        {/* Name (person) + role */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontFamily: "'Outfit', sans-serif",
              fontSize: 14.5,
              fontWeight: 700,
              color: "var(--ds-text)",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {t.company}
          </div>
          <div
            style={{
              fontFamily: "'Outfit', sans-serif",
              fontSize: 12.5,
              color: "var(--ds-text-muted)",
              marginTop: 2,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {role}
          </div>
        </div>

        {/* Subtle affordance toward the project */}
        <ArrowUpRight size={17} color="var(--ds-text-faint)" style={{ flexShrink: 0 }} className="testimonial-arrow" />
      </div>
    </a>
  )
}

export default function Testimonials() {
  const { t } = useSettings()
  const full = testimonials.map(enriched)

  return (
    <section id="testimonials" style={{ background: "var(--ds-bg-sec)", padding: "96px 0" }}>
      <style>{`
        .testimonial-card .testimonial-arrow { transition: color 0.2s ease, transform 0.2s ease; }
        .testimonial-card:hover .testimonial-arrow { color: var(--ds-accent); transform: translate(2px, -2px); }
      `}</style>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 var(--section-px)" }}>
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <div style={{ marginBottom: 20 }}>
            <span className="section-tag">
              <span className="dot-pulse" />
              {t.testimonials.tag}
            </span>
          </div>
          <h2 className="section-title" style={{ marginBottom: 16 }}>
            {t.testimonials.title}
          </h2>
          <p
            style={{
              fontFamily: "'Outfit', sans-serif",
              fontSize: 17.6,
              color: "var(--ds-text-sec)",
              maxWidth: 520,
              margin: "0 auto",
              lineHeight: 1.7,
            }}
          >
            {t.testimonials.subtitle}
          </p>
        </div>

        <AutoCarousel visibleCount={2} mobileVisibleCount={1} interval={5000}>
          {full.map((item) => {
            const tr = t.testimonials.items[item.id]
            return (
              <TestimonialCard
                key={item.id}
                t={item}
                role={tr?.role ?? item.role}
                text={tr?.text ?? item.text}
              />
            )
          })}
        </AutoCarousel>
      </div>
    </section>
  )
}
