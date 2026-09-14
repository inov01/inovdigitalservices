import { useMemo, useState, useRef } from "react"
import { createPortal } from "react-dom"
import { X, Check, Share2, Sparkles } from "lucide-react"
import { SiWhatsapp } from "./SocialIcons"
import useModal from "../hooks/useModal"
import { track } from "../lib/analytics"
import { api } from "../lib/api"
import { useSettings } from "../context/AppSettings"
import type { Lang } from "../i18n/translations"
import { tierValues, type PricingService, type TierKey } from "../data/services"
import {
  optionsFor,
  defaultSelection,
  selectionDelta,
  selectionSummary,
  type ServiceOptionGroup,
} from "../data/serviceOptions"

// Local copy so the 8 translation files stay untouched (same pattern as Pricing).
type CfgKey =
  | "customize" | "options" | "estimated" | "priceNote" | "designOnly"
  | "order" | "share" | "shared" | "copied" | "close" | "from" | "included"
const L: Record<Lang, Record<CfgKey, string>> = {
  fr: { customize: "Personnaliser", options: "Configurez votre commande", estimated: "Estimation", priceNote: "Estimation indicative — le devis final est confirmé après le brief.", designOnly: "Prix du design uniquement", order: "Commander sur WhatsApp", share: "Partager", shared: "Partagé", copied: "Lien copié", close: "Fermer", from: "à partir de", included: "inclus" },
  en: { customize: "Customize", options: "Configure your order", estimated: "Estimate", priceNote: "Indicative estimate — the final quote is confirmed after the brief.", designOnly: "Design price only", order: "Order on WhatsApp", share: "Share", shared: "Shared", copied: "Link copied", close: "Close", from: "from", included: "included" },
  es: { customize: "Personalizar", options: "Configura tu pedido", estimated: "Estimación", priceNote: "Estimación indicativa — el presupuesto final se confirma tras el brief.", designOnly: "Solo precio del diseño", order: "Pedir por WhatsApp", share: "Compartir", shared: "Compartido", copied: "Enlace copiado", close: "Cerrar", from: "desde", included: "incluido" },
  ht: { customize: "Pèsonalize", options: "Konfigire kòmann ou", estimated: "Estimasyon", priceNote: "Estimasyon endikatif — devi final la konfime apre brief la.", designOnly: "Pri design lan sèlman", order: "Kòmande sou WhatsApp", share: "Pataje", shared: "Pataje", copied: "Lyen kopye", close: "Fèmen", from: "apati", included: "enkli" },
  pt: { customize: "Personalizar", options: "Configure o seu pedido", estimated: "Estimativa", priceNote: "Estimativa indicativa — o orçamento final é confirmado após o briefing.", designOnly: "Apenas preço do design", order: "Pedir no WhatsApp", share: "Partilhar", shared: "Partilhado", copied: "Link copiado", close: "Fechar", from: "a partir de", included: "incluído" },
  it: { customize: "Personalizza", options: "Configura il tuo ordine", estimated: "Stima", priceNote: "Stima indicativa — il preventivo finale è confermato dopo il brief.", designOnly: "Solo prezzo del design", order: "Ordina su WhatsApp", share: "Condividi", shared: "Condiviso", copied: "Link copiato", close: "Chiudi", from: "da", included: "incluso" },
  de: { customize: "Anpassen", options: "Bestellung konfigurieren", estimated: "Schätzung", priceNote: "Richtwert — das endgültige Angebot wird nach dem Briefing bestätigt.", designOnly: "Nur Designpreis", order: "Auf WhatsApp bestellen", share: "Teilen", shared: "Geteilt", copied: "Link kopiert", close: "Schließen", from: "ab", included: "inklusive" },
  ar: { customize: "تخصيص", options: "اضبط طلبك", estimated: "تقدير", priceNote: "تقدير إرشادي — يتم تأكيد العرض النهائي بعد الموجز.", designOnly: "سعر التصميم فقط", order: "اطلب عبر واتساب", share: "مشاركة", shared: "تمت المشاركة", copied: "تم نسخ الرابط", close: "إغلاق", from: "ابتداءً من", included: "متضمّن" },
}

export default function ServiceConfigurator({
  service, name, tier, tierLabel, onClose,
}: {
  service: PricingService
  name: string
  tier: TierKey
  tierLabel: string
  onClose: () => void
}) {
  const { fmt, priceFor, lang, currency, region } = useSettings()
  const l = L[lang] ?? L.fr
  const dialogRef = useModal<HTMLDivElement>(true, onClose)

  const groups: ServiceOptionGroup[] = useMemo(() => optionsFor(service.id, service.type), [service.id, service.type])
  const [sel, setSel] = useState<Record<string, string[]>>(() => defaultSelection(groups))
  const [shareMsg, setShareMsg] = useState("")
  const shareTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const basePrice = tierValues(service, tier).price
  const deltaUsd = selectionDelta(groups, sel)
  const totalUsd = basePrice + deltaUsd
  const totalDisplay = fmt(priceFor(totalUsd))

  function toggle(g: ServiceOptionGroup, optId: string) {
    setSel((prev) => {
      const cur = prev[g.id] ?? []
      if (g.kind === "single") return { ...prev, [g.id]: [optId] }
      const next = cur.includes(optId) ? cur.filter((x) => x !== optId) : [...cur, optId]
      return { ...prev, [g.id]: next }
    })
  }

  function summaryLines(): string[] {
    return selectionSummary(groups, sel)
  }

  function shareUrl(): string {
    const base = `${window.location.origin}/devis`
    return `${base}?service=${service.id}`
  }

  function captureLead() {
    const p = Math.round(priceFor(totalUsd))
    api.submitLead({
      source: "quote",
      name: "",
      phone: "",
      lang, currency, region,
      total: p,
      deposit: Math.round(p * 0.7),
      items: [{ name: `${name} (${tierLabel})`, tier: tierLabel, qty: 1, price: p }],
      message: `${name} (${tierLabel}) — ${l.estimated}: ${totalDisplay}\n${summaryLines().join("\n")}`,
      meta: { configurator: true, serviceId: service.id },
    })
  }

  function order() {
    const lines = summaryLines()
    const noteLine = service.priceNote ? `\n(${service.priceNote})` : ""
    const msg = `Bonjour INOV Digital Services 👋\n\nJe souhaite commander : ${name} (${tierLabel})\n\n${lines.map((x) => `• ${x}`).join("\n")}\n\n${l.estimated} : ${totalDisplay} (${currency})${noteLine}`
    track("configurator_order", { service: service.id, value: priceFor(totalUsd), currency })
    captureLead()
    window.open(`https://wa.me/50936255920?text=${encodeURIComponent(msg)}`, "_blank")
  }

  async function share() {
    const url = shareUrl()
    const text = `${name} — ${l.from} ${totalDisplay} · INOV Digital Services`
    try {
      if (navigator.share) {
        await navigator.share({ title: name, text, url })
        flash(l.shared)
      } else {
        await navigator.clipboard.writeText(`${text}\n${url}`)
        flash(l.copied)
      }
      track("configurator_share", { service: service.id })
    } catch {
      /* user cancelled — no-op */
    }
  }

  function flash(m: string) {
    setShareMsg(m)
    if (shareTimer.current) clearTimeout(shareTimer.current)
    shareTimer.current = setTimeout(() => setShareMsg(""), 2000)
  }

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${l.customize} — ${name}`}
      style={{
        position: "fixed", inset: 0, zIndex: 1000, display: "flex", alignItems: "flex-end", justifyContent: "center",
        background: "rgba(15,15,20,0.55)", backdropFilter: "blur(3px)", padding: "0",
      }}
      onClick={onClose}
    >
      <div
        ref={dialogRef}
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%", maxWidth: 520, maxHeight: "92vh", display: "flex", flexDirection: "column",
          background: "var(--ds-bg)", borderRadius: "20px 20px 0 0", overflow: "hidden",
          boxShadow: "0 -12px 48px rgba(0,0,0,0.28)",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "18px 20px 14px", borderBottom: "1px solid var(--ds-border)" }}>
          <div style={{ flexShrink: 0, width: 38, height: 38, borderRadius: 11, background: "var(--ds-accent-a14)", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
            <Sparkles size={19} color="var(--ds-accent-text)" aria-hidden="true" />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--ds-accent-text)" }}>{l.options}</div>
            <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 17, fontWeight: 800, color: "var(--ds-text)", lineHeight: 1.2, marginTop: 2 }}>{name}</div>
            <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 12.5, color: "var(--ds-text-muted)", marginTop: 1 }}>{tierLabel}</div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={l.close}
            style={{ flexShrink: 0, width: 34, height: 34, borderRadius: "50%", border: "none", cursor: "pointer", background: "var(--ds-bg-sec)", display: "inline-flex", alignItems: "center", justifyContent: "center", color: "var(--ds-text-sec)" }}
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        {/* Options — scrollable */}
        <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px 20px", display: "flex", flexDirection: "column", gap: 20 }}>
          {groups.map((g) => (
            <fieldset key={g.id} style={{ border: "none", margin: 0, padding: 0 }}>
              <legend style={{ fontFamily: "'Outfit', sans-serif", fontSize: 13.5, fontWeight: 700, color: "var(--ds-text)", padding: 0, marginBottom: 8 }}>{g.label}</legend>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {g.options.map((opt) => {
                  const checked = (sel[g.id] ?? []).includes(opt.id)
                  return (
                    <label
                      key={opt.id}
                      style={{
                        display: "flex", alignItems: "flex-start", gap: 10, padding: "10px 12px", cursor: "pointer",
                        borderRadius: 12, border: `1.5px solid ${checked ? "var(--ds-accent)" : "var(--ds-border)"}`,
                        background: checked ? "var(--ds-accent-a14)" : "var(--ds-bg)", transition: "border-color 0.15s, background 0.15s",
                      }}
                    >
                      <input
                        type={g.kind === "single" ? "radio" : "checkbox"}
                        name={`${service.id}-${g.id}`}
                        checked={checked}
                        onChange={() => toggle(g, opt.id)}
                        style={{ position: "absolute", opacity: 0, width: 1, height: 1 }}
                      />
                      <span
                        aria-hidden="true"
                        style={{
                          flexShrink: 0, width: 20, height: 20, marginTop: 1,
                          borderRadius: g.kind === "single" ? "50%" : 6,
                          border: `2px solid ${checked ? "var(--ds-accent)" : "var(--ds-border-strong, #ccc)"}`,
                          background: checked ? "var(--ds-accent)" : "transparent",
                          display: "inline-flex", alignItems: "center", justifyContent: "center",
                        }}
                      >
                        {checked && <Check size={13} strokeWidth={3} color="#fff" />}
                      </span>
                      <span style={{ flex: 1, minWidth: 0 }}>
                        <span style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 8 }}>
                          <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 13.5, fontWeight: 600, color: "var(--ds-text)" }}>{opt.label}</span>
                          <span style={{ flexShrink: 0, fontFamily: "'Outfit', sans-serif", fontSize: 12.5, fontWeight: 700, color: opt.delta > 0 ? "var(--ds-accent-text)" : "var(--ds-text-faint)" }}>
                            {opt.delta > 0 ? `+${fmt(priceFor(opt.delta))}` : l.included}
                          </span>
                        </span>
                        {opt.hint && <span style={{ display: "block", fontFamily: "'Outfit', sans-serif", fontSize: 11.5, color: "var(--ds-text-muted)", marginTop: 2, lineHeight: 1.35 }}>{opt.hint}</span>}
                      </span>
                    </label>
                  )
                })}
              </div>
            </fieldset>
          ))}

          {service.priceNote && (
            <p style={{ margin: 0, fontFamily: "'Outfit', sans-serif", fontSize: 12, color: "var(--ds-text-muted)", lineHeight: 1.4, padding: "10px 12px", background: "var(--ds-bg-sec)", borderRadius: 10 }}>
              ⚠︎ {service.priceNote}
            </p>
          )}
        </div>

        {/* Sticky footer — live price + actions */}
        <div style={{ borderTop: "1px solid var(--ds-border)", padding: "14px 20px", background: "var(--ds-bg)", display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 10 }}>
            <div>
              <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 11.5, fontWeight: 600, color: "var(--ds-text-muted)", textTransform: "uppercase", letterSpacing: "0.04em" }}>{l.estimated}</div>
              <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 26, fontWeight: 800, color: "var(--ds-text)", lineHeight: 1 }} aria-live="polite">{totalDisplay}</div>
            </div>
            <div style={{ textAlign: "right", maxWidth: 180 }}>
              <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 10.5, color: "var(--ds-text-faint)", lineHeight: 1.3 }}>{l.priceNote}</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              type="button"
              onClick={share}
              style={{
                flexShrink: 0, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6,
                padding: "12px 16px", borderRadius: 12, border: "1.5px solid var(--ds-border)", cursor: "pointer",
                background: "var(--ds-bg)", color: "var(--ds-text-sec)", fontFamily: "'Outfit', sans-serif", fontSize: 13, fontWeight: 700,
              }}
              aria-label={l.share}
            >
              <Share2 size={16} aria-hidden="true" /> {shareMsg || l.share}
            </button>
            <button
              type="button"
              onClick={order}
              style={{
                flex: 1, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
                padding: "12px 16px", borderRadius: 12, border: "none", cursor: "pointer",
                background: "#25D366", color: "#fff", fontFamily: "'Outfit', sans-serif", fontSize: 14, fontWeight: 800,
              }}
            >
              <SiWhatsapp size={17} /> {l.order}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  )
}
