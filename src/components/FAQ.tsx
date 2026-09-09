import { useState } from "react"
import { ChevronDown } from "lucide-react"
import { useSettings } from "../context/AppSettings"

export default function FAQ() {
  const { t } = useSettings()
  const [open, setOpen] = useState<number | null>(0)

  return (
    <section id="faq" style={{ background: "var(--ds-bg-card)", padding: "96px 0" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 var(--section-px)" }}>
        <div style={{ textAlign: "center", marginBottom: 64 }}>
          <div style={{ marginBottom: 20 }}>
            <span className="section-tag"><span className="dot-pulse" />{t.faq.tag}</span>
          </div>
          <h2 className="section-title" style={{ marginBottom: 16 }}>{t.faq.title}</h2>
          <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: 17.6, color: "var(--ds-text-sec)", maxWidth: 520, margin: "0 auto", lineHeight: 1.7 }}>
            {t.faq.subtitle}
          </p>
        </div>

        <div style={{ maxWidth: 760, margin: "0 auto", display: "flex", flexDirection: "column", gap: 12 }}>
          {t.faq.items.map((item, i) => (
            <div
              key={i}
              style={{
                borderRadius: "var(--r-lg)",
                border: open === i ? "1.5px solid var(--ds-text)" : "1.5px solid var(--ds-border)",
                overflow: "hidden",
                transition: "border 0.2s",
              }}
            >
              <button
                onClick={() => setOpen(open === i ? null : i)}
                aria-expanded={open === i}
                aria-controls={`faq-panel-${i}`}
                style={{
                  width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "20px 24px", background: open === i ? "#000" : "var(--ds-bg-card)",
                  border: "none", cursor: "pointer", transition: "background 0.2s",
                  textAlign: "left",
                }}
              >
                <span style={{
                  fontFamily: "'Outfit', sans-serif", fontSize: 16, fontWeight: 700,
                  color: open === i ? "#fff" : "var(--ds-text)", lineHeight: 1.3,
                }}>
                  {item.q}
                </span>
                <span style={{
                  color: open === i ? "var(--ds-accent)" : "var(--ds-text)",
                  transform: open === i ? "rotate(180deg)" : "none",
                  transition: "all 0.3s", flexShrink: 0, marginLeft: 16, display: "inline-flex",
                }}>
                  <ChevronDown size={18} aria-hidden="true" />
                </span>
              </button>
              <div id={`faq-panel-${i}`} className={`faq-content ${open === i ? "open" : ""}`}>
                <p style={{
                  fontFamily: "'Outfit', sans-serif", fontSize: 15, color: "var(--ds-text-sec)",
                  lineHeight: 1.7, padding: "16px 24px 20px",
                }}>
                  {item.a}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
