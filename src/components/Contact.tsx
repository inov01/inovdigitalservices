import { useState, useEffect, useRef, useMemo } from "react"
import { useForm, ValidationError } from "@formspree/react"
import { CheckCircle2, ArrowRight, Mail, ChevronDown, X } from "lucide-react"
import { SiWhatsapp, SiInstagram } from "./SocialIcons"
import { useSettings } from "../context/AppSettings"
import { track } from "../lib/analytics"
import { api } from "../lib/api"

const BUDGET_BREAKS_USD = [100, 300, 500, 1000]

export default function Contact() {
  const { t, fmt, priceFor, lang, region, currency } = useSettings()
  const budgets = useMemo(() => [
    `< ${fmt(priceFor(BUDGET_BREAKS_USD[0]))}`,
    ...BUDGET_BREAKS_USD.slice(0, -1).map((n, i) => `${fmt(priceFor(n))} – ${fmt(priceFor(BUDGET_BREAKS_USD[i + 1]))}`),
    `+ ${fmt(priceFor(BUDGET_BREAKS_USD[BUDGET_BREAKS_USD.length - 1]))}`,
  ], [fmt, priceFor])
  const services = t.contact.serviceList
  const [form, setForm] = useState({ name: "", email: "", budget: "", message: "" })
  const [selectedServices, setSelectedServices] = useState<string[]>([])
  const [serviceOpen, setServiceOpen] = useState(false)
  const serviceRef = useRef<HTMLDivElement>(null)
  const [fsState, handleFsSubmit] = useForm("mjybprza")

  useEffect(() => {
    if (!serviceOpen) return
    function handleClick(e: MouseEvent) {
      if (serviceRef.current && !serviceRef.current.contains(e.target as Node)) {
        setServiceOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [serviceOpen])

  function set(field: string, val: string) {
    setForm((f) => ({ ...f, [field]: val }))
  }

  function toggleService(s: string) {
    setSelectedServices((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    )
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    handleFsSubmit(e as any)
    // The lead is recorded in Supabase from the fsState.succeeded effect below.
  }

  useEffect(() => {
    if (fsState.succeeded) {
      track("contact_submit", { budget: form.budget, services: selectedServices.length })
      // Also store the message as a lead in Supabase (visible in /admin).
      api.submitLead({
        source: "contact",
        name: form.name,
        email: form.email,
        lang, region, currency,
        budget: form.budget,
        message: form.message,
        meta: { services: selectedServices },
      })
    }
  }, [fsState.succeeded])

  const state = fsState.submitting ? "loading" : "idle"

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "14px 18px", borderRadius: "var(--r-md)",
    border: "1.5px solid var(--ds-border)", fontFamily: "'Outfit', sans-serif",
    fontSize: 15, color: "var(--ds-text)", background: "var(--ds-bg-card)", outline: "none",
    transition: "border 0.2s",
  }

  return (
    <section id="contact" style={{ background: "var(--ds-bg-sec)", padding: "96px 0" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 var(--section-px)" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "start" }}>
          {/* Left info */}
          <div>
            <div style={{ marginBottom: 20 }}>
              <span className="section-tag"><span className="dot-pulse" />{t.contact.tag}</span>
            </div>
            <h2 className="section-title" style={{ marginBottom: 20 }}>
              {t.contact.title.split("\n").map((line, i) => (
                <span key={i}>{i > 0 && <br />}{line}</span>
              ))}
            </h2>
            <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: 17, color: "var(--ds-text-sec)", lineHeight: 1.7, marginBottom: 40 }}>
              {t.contact.subtitle}
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {[
                { Icon: SiWhatsapp, label: "WhatsApp", val: "+509 3625-5920", href: "https://wa.me/50936255920" },
                { Icon: Mail, label: "Email", val: "inov01contact@gmail.com", href: "mailto:inov01contact@gmail.com" },
                { Icon: SiInstagram, label: "Instagram", val: "@inov_digital_services", href: "https://www.instagram.com/inov_digital_services" },
              ].map((c) => (
                <a key={c.label} href={c.href} target="_blank" rel="noreferrer" style={{ display: "flex", alignItems: "center", gap: 16, textDecoration: "none" }}>
                  <div style={{ width: 48, height: 48, borderRadius: "var(--r-md)", background: "var(--ds-text)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <c.Icon size={20} color="var(--ds-bg)" />
                  </div>
                  <div>
                    <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 12, color: "var(--ds-text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>{c.label}</div>
                    <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 15, fontWeight: 700, color: "var(--ds-text)", marginTop: 2 }}>{c.val}</div>
                  </div>
                </a>
              ))}
            </div>
          </div>

          {/* Form */}
          <div style={{ background: "var(--ds-bg-card)", borderRadius: "var(--r-xl)", padding: 40, border: "1px solid var(--ds-border)" }}>
            {fsState.succeeded ? (
              <div style={{ textAlign: "center", padding: "40px 0" }}>
                <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
                  <CheckCircle2 size={56} color="var(--ds-accent)" strokeWidth={2} />
                </div>
                <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 22, fontWeight: 800, color: "var(--ds-text)", marginBottom: 12 }}>{t.contact.successTitle}</h3>
                <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: 15, color: "var(--ds-text-sec)", lineHeight: 1.6 }}>
                  {t.contact.successBody}
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                <input type="hidden" name="service" value={selectedServices.join(", ")} />
                <input type="hidden" name="budget" value={form.budget ?? ""} />
                <div className="contact-names" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <div>
                    <label htmlFor="contact-name" style={{ fontFamily: "'Outfit', sans-serif", fontSize: 13, fontWeight: 600, color: "var(--ds-text)", display: "block", marginBottom: 6 }}>{t.contact.fullName}</label>
                    <input id="contact-name" name="name" required type="text" value={form.name ?? ""} onChange={(e) => set("name", e.target.value)} placeholder={t.contact.namePlaceholder} style={inputStyle}
                      onFocus={(e) => e.target.style.borderColor = "var(--ds-text)"}
                      onBlur={(e) => e.target.style.borderColor = "var(--ds-border)"}
                    />
                  </div>
                  <div>
                    <label htmlFor="contact-email" style={{ fontFamily: "'Outfit', sans-serif", fontSize: 13, fontWeight: 600, color: "var(--ds-text)", display: "block", marginBottom: 6 }}>{t.contact.email}</label>
                    <input id="contact-email" name="email" required type="email" value={form.email ?? ""} onChange={(e) => set("email", e.target.value)} placeholder={t.contact.emailPlaceholder} style={inputStyle}
                      onFocus={(e) => e.target.style.borderColor = "var(--ds-text)"}
                      onBlur={(e) => e.target.style.borderColor = "var(--ds-border)"}
                    />
                    <ValidationError field="email" errors={fsState.errors} style={{ fontFamily: "'Outfit', sans-serif", fontSize: 12, color: "var(--ds-danger)", marginTop: 4, display: "block" }} />
                  </div>
                </div>
                <div role="group" aria-labelledby="contact-service-label">
                  <span id="contact-service-label" style={{ fontFamily: "'Outfit', sans-serif", fontSize: 13, fontWeight: 600, color: "var(--ds-text)", display: "block", marginBottom: 6 }}>{t.contact.serviceWanted}</span>

                  {/* Tag-input field: chips inline + dropdown below */}
                  <div ref={serviceRef} style={{ position: "relative" }}>
                    <div
                      role="button"
                      tabIndex={0}
                      aria-expanded={serviceOpen}
                      onClick={() => setServiceOpen((o) => !o)}
                      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setServiceOpen((o) => !o)}
                      style={{
                        ...inputStyle,
                        display: "flex", flexWrap: "wrap", alignItems: "center", gap: 6,
                        cursor: "pointer", minHeight: 46, height: "auto", paddingInlineEnd: 36,
                        borderColor: serviceOpen ? "var(--ds-text)" : "var(--ds-border)",
                      }}
                    >
                      {selectedServices.length === 0 && (
                        <span style={{ color: "var(--ds-text-faint)", fontFamily: "'Outfit', sans-serif", fontSize: 14 }}>
                          {t.contact.chooseService}
                        </span>
                      )}
                      {selectedServices.map((s) => (
                        <span key={s} style={{
                          display: "inline-flex", alignItems: "center", gap: 5,
                          padding: "3px 5px 3px 10px", borderRadius: "var(--r-full)",
                          background: "var(--ds-text)", color: "var(--ds-bg)",
                          fontFamily: "'Outfit', sans-serif", fontSize: 12, fontWeight: 600,
                          lineHeight: 1.4,
                        }}>
                          {s}
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); toggleService(s) }}
                            aria-label={`${t.a11y.remove} ${s}`}
                            style={{
                              display: "inline-flex", alignItems: "center", justifyContent: "center",
                              width: 16, height: 16, borderRadius: "50%", border: "none",
                              background: "color-mix(in srgb, var(--ds-bg) 22%, transparent)", color: "var(--ds-bg)", cursor: "pointer", padding: 0,
                            }}
                          >
                            <X size={11} strokeWidth={2.5} aria-hidden="true" />
                          </button>
                        </span>
                      ))}
                      <ChevronDown
                        size={16}
                        aria-hidden="true"
                        style={{
                          position: "absolute", insetInlineEnd: 12, top: "50%", transform: serviceOpen ? "translateY(-50%) rotate(180deg)" : "translateY(-50%)",
                          transition: "transform 0.25s", color: "var(--ds-text-muted)", flexShrink: 0,
                        }}
                      />
                    </div>

                    {/* Dropdown panel — absolutely positioned, never pushes layout */}
                    {serviceOpen && (
                      <div style={{
                        position: "absolute", top: "calc(100% + 6px)", left: 0, right: 0, zIndex: 50,
                        display: "flex", flexWrap: "wrap", gap: 8,
                        padding: 14, borderRadius: "var(--r-md)",
                        border: "1.5px solid var(--ds-border)", background: "var(--ds-bg-card)",
                        boxShadow: "0 8px 32px rgba(0,0,0,0.10)",
                      }}>
                        {services.map((s) => {
                          const active = selectedServices.includes(s)
                          return (
                            <button
                              key={s}
                              type="button"
                              aria-pressed={active}
                              onClick={() => toggleService(s)}
                              style={{
                                display: "inline-flex", alignItems: "center", gap: 6,
                                padding: "7px 13px", borderRadius: "var(--r-full)",
                                border: active ? "1.5px solid var(--ds-text)" : "1.5px solid var(--ds-border)",
                                background: active ? "var(--ds-text)" : "var(--ds-bg-sec)",
                                color: active ? "var(--ds-bg)" : "var(--ds-text-sec)",
                                fontFamily: "'Outfit', sans-serif", fontSize: 13, fontWeight: 600,
                                cursor: "pointer", transition: "all 0.15s",
                              }}
                            >
                              {active && <CheckCircle2 size={14} color="var(--ds-accent)" strokeWidth={2.5} />}
                              {s}
                            </button>
                          )
                        })}
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <label htmlFor="contact-budget" style={{ fontFamily: "'Outfit', sans-serif", fontSize: 13, fontWeight: 600, color: "var(--ds-text)", display: "block", marginBottom: 6 }}>{t.contact.budget}</label>
                  <select id="contact-budget" value={form.budget ?? ""} onChange={(e) => set("budget", e.target.value)} style={{ ...inputStyle, appearance: "none" as const }}>
                    <option value="">{t.contact.chooseBudget}</option>
                    {budgets.map((b) => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
                <div>
                  <label htmlFor="contact-message" style={{ fontFamily: "'Outfit', sans-serif", fontSize: 13, fontWeight: 600, color: "var(--ds-text)", display: "block", marginBottom: 6 }}>{t.contact.projectDesc}</label>
                  <textarea
                    id="contact-message"
                    name="message"
                    required value={form.message ?? ""} onChange={(e) => set("message", e.target.value)}
                    placeholder={t.contact.msgPlaceholder}
                    rows={5}
                    style={{ ...inputStyle, resize: "vertical" }}
                    onFocus={(e) => e.target.style.borderColor = "var(--ds-text)"}
                    onBlur={(e) => e.target.style.borderColor = "var(--ds-border)"}
                  />
                  <ValidationError field="message" errors={fsState.errors} style={{ fontFamily: "'Outfit', sans-serif", fontSize: 12, color: "var(--ds-danger)", marginTop: 4, display: "block" }} />
                </div>

                {fsState.errors && (fsState.errors as any).length > 0 && (
                  <div role="alert" aria-live="assertive" style={{ padding: "12px 16px", background: "var(--ds-danger-a10)", borderRadius: "var(--r-md)", border: "1px solid var(--ds-danger-a15)" }}>
                    <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: 14, color: "var(--ds-danger)", margin: 0 }}>
                      {t.contact.errorMsg}{" "}
                      <a href="https://wa.me/50936255920" target="_blank" rel="noreferrer" style={{ color: "var(--ds-accent-text)", fontWeight: 700 }}>
                        {t.contact.writeWhatsApp}
                      </a>
                    </p>
                  </div>
                )}

                <button type="submit" className="btn-primary" disabled={fsState.submitting} style={{ opacity: fsState.submitting ? 0.7 : 1 }}>
                  {fsState.submitting ? t.contact.sending : <>{t.contact.send} <ArrowRight size={17} /></>}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          #contact > div > div { grid-template-columns: 1fr !important; gap: 40px !important; }
          /* Name + email stack on small phones to avoid cramped fields */
          #contact .contact-names { grid-template-columns: 1fr !important; gap: 18px !important; }
        }
      `}</style>
    </section>
  )
}
