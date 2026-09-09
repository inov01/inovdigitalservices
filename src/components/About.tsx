import { Fragment, useState, type ReactNode } from "react"
import { ChevronDown, Quote, MapPin, Globe, Check, Users, Sparkles, User } from "lucide-react"
import { useSettings } from "../context/AppSettings"
import { renderRich } from "../i18n/renderRich"
import logo from "../imports/logo.webp"
import founderPhoto from "../imports/their_is_your_receipt__4_.webp"

// Flags are language-independent; labels come from translations (t.about.regions).
const regionFlags = ["🇭🇹", "🇨🇦", "🇻🇪", "🇺🇸", "🌍"]

// Renders a title string, swapping the {logo} marker for the INOV logo inline.
function renderTitleWithLogo(str: string) {
  return str.split(/(\{logo\})/g).map((part, i) =>
    part === "{logo}" ? (
      <img
        key={i}
        src={logo}
        alt="INOV Digital Services"
        style={{ height: "0.82em", width: "auto", display: "inline-block", verticalAlign: "baseline", margin: "0 0.08em", transform: "translateY(0.06em)" }}
      />
    ) : (
      <Fragment key={i}>{part}</Fragment>
    ),
  )
}

function Accordion({
  title, icon, defaultOpen = false, nested = false, children,
}: {
  title: string
  icon: ReactNode
  defaultOpen?: boolean
  nested?: boolean
  children: ReactNode
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div style={{
      background: nested ? "var(--ds-bg-sec)" : "var(--ds-bg-card)",
      border: "1px solid var(--ds-border)",
      borderRadius: nested ? "var(--r-lg)" : "var(--r-xl)",
      overflow: "hidden",
      boxShadow: nested ? "none" : "0 6px 28px rgba(0,0,0,0.05)",
    }}>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        style={{
          width: "100%", display: "flex", alignItems: "center", gap: 14,
          padding: nested ? "18px 22px" : "22px 28px",
          background: "transparent", border: "none", cursor: "pointer", textAlign: "left",
        }}
      >
        <span style={{
          width: nested ? 38 : 46, height: nested ? 38 : 46, borderRadius: nested ? "var(--r-sm)" : "var(--r-md)", flexShrink: 0,
          background: nested ? "var(--ds-accent-a10)" : "var(--ds-text)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          {icon}
        </span>
        <span style={{ flex: 1, fontFamily: "'Outfit', sans-serif", fontSize: nested ? 17 : 20, fontWeight: 800, color: "var(--ds-text)" }}>
          {title}
        </span>
        <ChevronDown size={20} aria-hidden="true" style={{ flexShrink: 0, color: "var(--ds-text-muted)", transform: open ? "rotate(180deg)" : "none", transition: "transform 0.3s" }} />
      </button>
      <div style={{ display: "grid", gridTemplateRows: open ? "1fr" : "0fr", transition: "grid-template-rows 0.35s ease" }}>
        <div style={{ overflow: "hidden" }}>
          <div style={{ padding: nested ? "0 22px 22px" : "0 28px 28px" }}>
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function About() {
  const { t } = useSettings()
  const a = t.about

  return (
    <section id="about" style={{ background: "var(--ds-bg-card)", padding: "96px 0" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 var(--section-px)" }}>
        {/* Heading */}
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <div style={{ marginBottom: 20 }}>
            <span className="section-tag"><span className="dot-pulse" />{a.tag}</span>
          </div>
          <h2 className="section-title" style={{ marginBottom: 16 }}>{renderTitleWithLogo(a.title)}</h2>
          <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: 17.6, color: "var(--ds-text-sec)", maxWidth: 620, margin: "0 auto", lineHeight: 1.7 }}>
            {renderRich(a.intro)}
          </p>
        </div>

        {/* Accordions */}
        <div style={{ maxWidth: 880, margin: "0 auto" }}>
          <Accordion
            title={a.companyHeading}
            icon={<Globe size={22} color="var(--ds-bg)" strokeWidth={2} aria-hidden="true" />}
          >
            {/* Origin story */}
            <div style={{ background: "var(--ds-bg-sec)", borderRadius: "var(--r-lg)", padding: "22px 24px", marginBottom: 24 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                <Sparkles size={18} color="var(--ds-accent)" strokeWidth={2.2} aria-hidden="true" />
                <h4 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 16, fontWeight: 800, color: "var(--ds-text)", margin: 0 }}>
                  {a.originTitle}
                </h4>
              </div>
              <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: 15, color: "var(--ds-text-sec)", lineHeight: 1.75, margin: 0 }}>
                {renderRich(a.originStory)}
              </p>
            </div>

            {/* Reach */}
            <h4 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 18, fontWeight: 800, color: "var(--ds-text)", marginBottom: 10 }}>
              {a.reachTitle}
            </h4>
            <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: 15, color: "var(--ds-text-sec)", lineHeight: 1.7, marginBottom: 18 }}>
              {renderRich(a.reachBody)}
            </p>

            {/* Regions served */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 20 }}>
              {a.regions.map((r, i) => (
                <span
                  key={r}
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 8,
                    fontFamily: "'Outfit', sans-serif", fontSize: 14, fontWeight: 600, color: "var(--ds-text)",
                    background: "var(--ds-bg-sec)", border: "1.5px solid var(--ds-border)",
                    padding: "8px 14px", borderRadius: "var(--r-full)",
                  }}
                >
                  <span style={{ fontSize: 16, lineHeight: 1 }} aria-hidden="true">{regionFlags[i] ?? "🌍"}</span>
                  {r}
                  <Check size={14} color="var(--ds-accent)" strokeWidth={3} aria-hidden="true" />
                </span>
              ))}
            </div>

            {/* Team model note */}
            <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 24, padding: "14px 16px", background: "var(--ds-bg-sec)", borderRadius: "var(--r-md)" }}>
              <Users size={18} color="var(--ds-accent)" strokeWidth={2.2} style={{ flexShrink: 0, marginTop: 2 }} aria-hidden="true" />
              <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: 13.5, color: "var(--ds-text-sec)", lineHeight: 1.6, margin: 0 }}>
                {a.teamNote}
              </p>
            </div>

            {/* Address */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, paddingTop: 20, borderTop: "1px solid var(--ds-border)", marginBottom: 24 }}>
              <div style={{
                width: 44, height: 44, borderRadius: "var(--r-md)", background: "var(--ds-accent-a10)",
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
              }}>
                <MapPin size={20} color="var(--ds-accent)" strokeWidth={2.2} aria-hidden="true" />
              </div>
              <div>
                <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 12, color: "var(--ds-text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  {a.addressLabel}
                </div>
                <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 15, fontWeight: 700, color: "var(--ds-text)", marginTop: 2 }}>
                  {a.address}
                </div>
              </div>
            </div>

            {/* Nested accordion: founder */}
            <Accordion
              title={a.founderHeading}
              nested
              icon={<User size={18} color="var(--ds-accent)" strokeWidth={2.2} aria-hidden="true" />}
            >
              {/* Founder header */}
              <div style={{ display: "flex", alignItems: "center", gap: 18, marginBottom: 22 }}>
                <img
                  src={founderPhoto}
                  alt={a.founderName}
                  loading="lazy"
                  decoding="async"
                  style={{ width: 96, height: 96, borderRadius: "var(--r-xl)", flexShrink: 0, objectFit: "cover", boxShadow: "0 8px 24px var(--ds-accent-a18)" }}
                />
                <div>
                  <h4 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 20, fontWeight: 800, color: "var(--ds-text)", marginBottom: 6 }}>
                    {a.founderName}
                  </h4>
                  <span style={{
                    display: "inline-block", fontFamily: "'Outfit', sans-serif", fontSize: 12, fontWeight: 700,
                    color: "var(--ds-accent)", background: "var(--ds-accent-a10)", padding: "4px 12px", borderRadius: "var(--r-full)",
                    textTransform: "uppercase", letterSpacing: "0.06em",
                  }}>
                    {a.founderLabel}
                  </span>
                </div>
              </div>

              <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: 15, color: "var(--ds-text-sec)", lineHeight: 1.7, marginBottom: 22 }}>
                {renderRich(a.founderBio)}
              </p>

              {/* Quote */}
              <div style={{ position: "relative", background: "var(--ds-bg-card)", borderRadius: "var(--r-lg)", padding: "22px 24px", marginBottom: 28, borderStyle: "solid", borderTopWidth: 1, borderRightWidth: 1, borderBottomWidth: 1, borderLeftWidth: 4, borderTopColor: "var(--ds-border)", borderRightColor: "var(--ds-border)", borderBottomColor: "var(--ds-border)", borderLeftColor: "var(--ds-accent)" }}>
                <Quote size={22} color="var(--ds-accent)" style={{ marginBottom: 8 }} aria-hidden="true" />
                <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: 16, fontStyle: "italic", fontWeight: 600, color: "var(--ds-text)", lineHeight: 1.6, margin: 0 }}>
                  &ldquo;{a.quote}&rdquo;
                </p>
              </div>

              {/* Journey — vertical timeline */}
              <h5 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 16, fontWeight: 800, color: "var(--ds-text)", marginBottom: 18 }}>
                {a.journeyTitle}
              </h5>
              <div style={{ display: "flex", flexDirection: "column" }}>
                {a.journey.map((step, i) => {
                  const last = i === a.journey.length - 1
                  return (
                    <div key={i} style={{ display: "flex", gap: 16 }}>
                      {/* Marker column */}
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
                        <div style={{
                          width: 34, height: 34, borderRadius: "50%", background: "var(--ds-accent)", color: "#fff",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: 14,
                        }}>
                          {i + 1}
                        </div>
                        {!last && <div style={{ flex: 1, width: 2, background: "var(--ds-border)", marginTop: 4, marginBottom: 4, minHeight: 20 }} />}
                      </div>
                      {/* Content */}
                      <div style={{ paddingBottom: last ? 0 : 20 }}>
                        <h6 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 15.5, fontWeight: 800, color: "var(--ds-text)", margin: "6px 0 4px" }}>
                          {step.title}
                        </h6>
                        <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: 13.5, color: "var(--ds-text-sec)", lineHeight: 1.6, margin: 0 }}>
                          {step.desc}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </Accordion>
          </Accordion>
        </div>
      </div>
    </section>
  )
}
