import type { LucideIcon } from "lucide-react"
import { Zap, Wallet, Award, MessageCircle, Globe, RefreshCw } from "lucide-react"
import AutoCarousel from "./AutoCarousel"
import { useSettings } from "../context/AppSettings"
import logo from "../imports/logo.webp"

const reasonIcons: LucideIcon[] = [Zap, Wallet, Award, MessageCircle, Globe, RefreshCw]

function ReasonCard({ icon: Icon, title, desc }: { icon: LucideIcon; title: string; desc: string }) {
  return (
    <div className="card" style={{ padding: 32, height: "100%", boxSizing: "border-box" }}>
      <div style={{
        width: 52, height: 52, borderRadius: "var(--r-md)", background: "var(--ds-bg-inverse)",
        display: "flex", alignItems: "center", justifyContent: "center",
        marginBottom: 18,
      }}>
        <Icon size={24} color="var(--ds-text-inverse)" strokeWidth={2} />
      </div>
      <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 19, fontWeight: 800, color: "var(--ds-text)", marginBottom: 10 }}>
        {title}
      </h3>
      <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: 14, color: "var(--ds-text-sec)", lineHeight: 1.65 }}>
        {desc}
      </p>
    </div>
  )
}

export default function WhyUs() {
  const { t } = useSettings()
  return (
    <section id="why-us" style={{ background: "var(--ds-bg-sec)", padding: "96px 0" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 var(--section-px)" }}>
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <div style={{ marginBottom: 20 }}>
            <span className="section-tag"><span className="dot-pulse" />{t.whyUs.tag}</span>
          </div>
          <h2 className="section-title" style={{ marginBottom: 16, display: "inline-flex", alignItems: "baseline", flexWrap: "wrap", justifyContent: "center", gap: "0.28em" }}>
            {t.whyUs.title.split("INOV").map((part, i, arr) => (
              <span key={i} style={{ display: "inline-flex", alignItems: "baseline", gap: "0.28em" }}>
                {part.trim() && <span>{part.trim()}</span>}
                {i < arr.length - 1 && (
                  <img
                    src={logo}
                    alt="INOV"
                    style={{ height: "0.82em", width: "auto", transform: "translateY(0.08em)", objectFit: "contain" }}
                  />
                )}
              </span>
            ))}
          </h2>
          <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: 17.6, color: "var(--ds-text-sec)", maxWidth: 520, margin: "0 auto", lineHeight: 1.7 }}>
            {t.whyUs.subtitle}
          </p>
        </div>

        <AutoCarousel visibleCount={3} mobileVisibleCount={1} interval={4000}>
          {t.whyUs.reasons.map((r, i) => <ReasonCard key={i} icon={reasonIcons[i]} title={r.title} desc={r.desc} />)}
        </AutoCarousel>
      </div>
    </section>
  )
}
