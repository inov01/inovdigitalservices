import { useState, useRef, useEffect } from "react"
import { createPortal } from "react-dom"
import { ShoppingCart, FileText, X, PartyPopper, Rocket, Mail, CheckCircle, ChevronDown, Clock, RefreshCw, Package, PlayCircle, Eye, Coins, Check, ShieldCheck } from "lucide-react"
import { SiWhatsapp } from "./SocialIcons"
import { smoothScrollToId } from "../lib/smoothScroll"
import { pricingServices, tierValues, TIER_KEYS, type PricingService, type TierKey } from "../data/services"
import { tierFeatureList } from "../data/tierFeatures"
import { useSettings, CURRENCIES, type CurrencyCode } from "../context/AppSettings"
import type { Lang } from "../i18n/translations"
import useModal from "../hooks/useModal"
import { track } from "../lib/analytics"
import { api } from "../lib/api"
import logo from "../imports/logo.webp"

// Tier labels live here (local, like CookieConsent) so the same service can be
// offered at three chosen levels without touching the 8 translation files.
const TIER_LABELS: Record<Lang, { formula: string } & Record<TierKey, string>> = {
  fr: { formula: "Formule", essentiel: "Essentiel", standard: "Standard", premium: "Premium" },
  en: { formula: "Plan", essentiel: "Essential", standard: "Standard", premium: "Premium" },
  es: { formula: "Plan", essentiel: "Esencial", standard: "Estándar", premium: "Premium" },
  ht: { formula: "Fòmil", essentiel: "Esansyèl", standard: "Estanda", premium: "Premium" },
  pt: { formula: "Plano", essentiel: "Essencial", standard: "Padrão", premium: "Premium" },
  it: { formula: "Formula", essentiel: "Essenziale", standard: "Standard", premium: "Premium" },
  de: { formula: "Paket", essentiel: "Basis", standard: "Standard", premium: "Premium" },
  ar: { formula: "الباقة", essentiel: "أساسي", standard: "قياسي", premium: "بريميوم" },
}

// UX / marketing-psychology copy — kept local (like TIER_LABELS) so the 8
// translation files stay untouched. {amt} is replaced with a formatted amount.
type UxKey =
  | "popular" | "premiumValue" | "youSave"
  | "trustDeposit" | "trustRevisions" | "trustSatisfaction"
  | "reply24h" | "socialProof"
const UX_LABELS: Record<Lang, Record<UxKey, string>> = {
  fr: { popular: "Populaire", premiumValue: "Premium", youSave: "économisez ~{amt}", trustDeposit: "Acompte 70%, solde à la livraison", trustRevisions: "Révisions incluses", trustSatisfaction: "Satisfait ou ajusté", reply24h: "Réponse sous 24h", socialProof: "20+ marques accompagnées · Satisfait ou ajusté" },
  en: { popular: "Popular", premiumValue: "Premium", youSave: "save ~{amt}", trustDeposit: "70% deposit, balance on delivery", trustRevisions: "Revisions included", trustSatisfaction: "Satisfied or adjusted", reply24h: "Reply within 24h", socialProof: "20+ brands served · Satisfied or adjusted" },
  es: { popular: "Popular", premiumValue: "Premium", youSave: "ahorra ~{amt}", trustDeposit: "Anticipo 70%, saldo a la entrega", trustRevisions: "Revisiones incluidas", trustSatisfaction: "Satisfecho o ajustado", reply24h: "Respuesta en 24h", socialProof: "20+ marcas atendidas · Satisfecho o ajustado" },
  ht: { popular: "Popilè", premiumValue: "Premium", youSave: "ekonomize ~{amt}", trustDeposit: "Akont 70%, rès la lè n livre", trustRevisions: "Revizyon enkli", trustSatisfaction: "Satisfè oswa n ajiste", reply24h: "Repons nan 24è", socialProof: "20+ mak akonpaye · Satisfè oswa n ajiste" },
  pt: { popular: "Popular", premiumValue: "Premium", youSave: "poupe ~{amt}", trustDeposit: "Sinal de 70%, saldo na entrega", trustRevisions: "Revisões incluídas", trustSatisfaction: "Satisfeito ou ajustado", reply24h: "Resposta em 24h", socialProof: "20+ marcas atendidas · Satisfeito ou ajustado" },
  it: { popular: "Popolare", premiumValue: "Premium", youSave: "risparmia ~{amt}", trustDeposit: "Acconto 70%, saldo alla consegna", trustRevisions: "Revisioni incluse", trustSatisfaction: "Soddisfatto o adeguato", reply24h: "Risposta entro 24h", socialProof: "20+ brand serviti · Soddisfatto o adeguato" },
  de: { popular: "Beliebt", premiumValue: "Premium", youSave: "spare ~{amt}", trustDeposit: "70% Anzahlung, Rest bei Lieferung", trustRevisions: "Revisionen inklusive", trustSatisfaction: "Zufrieden oder angepasst", reply24h: "Antwort in 24 Std.", socialProof: "20+ betreute Marken · Zufrieden oder angepasst" },
  ar: { popular: "الأكثر طلبًا", premiumValue: "بريميوم", youSave: "وفّر ~{amt}", trustDeposit: "دفعة 70%، والباقي عند التسليم", trustRevisions: "تعديلات مشمولة", trustSatisfaction: "راضٍ أو نعدّل لك", reply24h: "ردّ خلال 24 ساعة", socialProof: "أكثر من 20 علامة تجارية · راضٍ أو نعدّل لك" },
}

// WhatsApp number field copy — kept local (like TIER_LABELS) so the 8 translation
// files stay untouched. Optional field so it never blocks the proforma flow.
const WA_LABELS: Record<Lang, { label: string; placeholder: string }> = {
  fr: { label: "Numéro WhatsApp (optionnel)", placeholder: "+509 3625 5920" },
  en: { label: "WhatsApp number (optional)", placeholder: "+1 555 012 3456" },
  es: { label: "Número de WhatsApp (opcional)", placeholder: "+34 612 345 678" },
  ht: { label: "Nimewo WhatsApp (opsyonèl)", placeholder: "+509 3625 5920" },
  pt: { label: "Número de WhatsApp (opcional)", placeholder: "+351 912 345 678" },
  it: { label: "Numero WhatsApp (facoltativo)", placeholder: "+39 345 123 4567" },
  de: { label: "WhatsApp-Nummer (optional)", placeholder: "+49 151 23456789" },
  ar: { label: "رقم واتساب (اختياري)", placeholder: "+509 3625 5920" },
}

export default function Pricing() {
  const { t, fmt, currency, setCurrency, rates, lang, priceFor, region } = useSettings()
  const [services, setServices] = useState<PricingService[]>(pricingServices)
  // Chosen tier per service (defaults to "standard"). Same options for everyone.
  const [tierById, setTierById] = useState<Record<number, TierKey>>({})
  const tierOf = (s: PricingService) => tierById[s.id] ?? "standard"
  const eff = (s: PricingService) => tierValues(s, tierOf(s))
  const tl = TIER_LABELS[lang] ?? TIER_LABELS.fr
  const setTier = (id: number, tier: TierKey) => setTierById((prev) => ({ ...prev, [id]: tier }))
  const [accordionOpen, setAccordionOpen] = useState(false)
  const [otherChecked, setOtherChecked] = useState(false)
  const [otherText, setOtherText] = useState("")
  const [clientName, setClientName] = useState("")
  const [nameError, setNameError] = useState(false)
  const [clientEmail, setClientEmail] = useState("")
  const [emailError, setEmailError] = useState(false)
  const [clientPhone, setClientPhone] = useState("")
  const [cartError, setCartError] = useState(false)
  const nameInputRef = useRef<HTMLInputElement>(null)
  const emailInputRef = useRef<HTMLInputElement>(null)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [sending, setSending] = useState(false)
  const [sentOk, setSentOk] = useState(false)
  const [sentErr, setSentErr] = useState(false)
  const cartRef = useRef<HTMLDivElement>(null)
  const previewBoxRef = useRef<HTMLDivElement>(null)
  const previewInnerRef = useRef<HTMLDivElement>(null)

  // ── Pan/zoom viewer state ──────────────────────────────────
  const PROFORMA_W = 780
  const [view, setView] = useState({ scale: 1, x: 0, y: 0 })
  const baseFitRef = useRef(1) // scale that fits the modal width
  const gestureRef = useRef({
    dragging: false, pinching: false,
    lastX: 0, lastY: 0,
    lastDist: 0,
  })
  // Escape, scroll lock, focus trap + focus return for the proforma modal.
  const previewDialogRef = useModal<HTMLDivElement>(previewOpen, () => setPreviewOpen(false))

  // Localized service text by id (falls back to the data file's French text).
  const svcName = (s: PricingService) => t.pricing.services[s.id]?.name ?? s.name
  const svcDesc = (s: PricingService) => t.pricing.services[s.id]?.desc ?? s.desc
  const svcAdvantage = (s: PricingService) => t.pricing.services[s.id]?.advantage ?? s.advantage

  const totalQty = services.reduce((sum, s) => sum + s.qty, 0)
  const subtotal = services.reduce((sum, s) => sum + priceFor(eff(s).price) * s.qty, 0)
  const discountPct = totalQty >= 10 ? 0.3 : totalQty >= 5 ? 0.1 : 0
  const discount = Math.round(subtotal * discountPct)
  const total = subtotal - discount
  const acompte = Math.round(total * 0.7)

  const ux = UX_LABELS[lang] ?? UX_LABELS.fr

  // Loss-aversion helpers: how far to the next volume tier, and the extra money
  // the client would save by getting there (estimated on the current subtotal).
  const nextAt = totalQty < 5 ? 5 : totalQty < 10 ? 10 : null
  const toNext = nextAt ? nextAt - totalQty : 0
  const nextPct = nextAt === 10 ? 0.3 : 0.1
  const extraSaving = nextAt ? Math.max(0, Math.round(subtotal * nextPct) - discount) : 0
  const progressPct = nextAt ? Math.min(100, Math.round((totalQty / nextAt) * 100)) : 100

  const selectedServices = services.filter((s) => s.qty > 0)

  // Listen for portfolio "Je veux un projet similaire" event
  useEffect(() => {
    function onPreselect(e: Event) {
      const serviceIds = (e as CustomEvent<number[]>).detail
      setServices((prev) =>
        prev.map((s) => serviceIds.includes(s.id) ? { ...s, qty: s.qty > 0 ? s.qty : 1 } : s)
      )
      setAccordionOpen(true)
    }
    window.addEventListener("preselect-services", onPreselect)
    return () => window.removeEventListener("preselect-services", onPreselect)
  }, [])

  // Apply admin overrides from the dashboard: hidden built-in cards, extra
  // admin-added cards, and base-price overrides (all set in the admin "Services"
  // and "Tarifs" tabs). Rebuilds the list from the static data each load.
  useEffect(() => {
    api.getSettings()
      .then((r) => {
        const s = r.settings
        if (!s) return
        const removed = new Set(s.servicesRemoved ?? [])
        const added = (s.servicesAdded ?? []).map((a) => ({ ...a, qty: 0 } as PricingService))
        const pr = s.pricing ?? {}
        const merged = [...pricingServices.filter((sv) => !removed.has(sv.id)), ...added]
          .map((sv) => (typeof pr[sv.id] === "number" ? { ...sv, price: pr[sv.id] } : sv))
        setServices(merged)
      })
      .catch(() => {})
  }, [])

  // ── Viewer: init + mouse/touch/wheel gestures ─────────────
  useEffect(() => {
    if (!previewOpen) return
    const g = gestureRef.current

    // Attendre que le DOM soit peint pour avoir clientWidth réel
    let rafId = 0
    function initView() {
      const el = previewBoxRef.current
      if (!el || el.clientWidth === 0) { rafId = requestAnimationFrame(initView); return }
      const s = Math.min(1, Math.max(0.1, (el.clientWidth - 40) / PROFORMA_W))
      baseFitRef.current = s
      setView({ scale: s, x: Math.max(0, (el.clientWidth - PROFORMA_W * s) / 2), y: 20 })
    }
    rafId = requestAnimationFrame(initView)

    function getEl() { return previewBoxRef.current }

    function onResize() {
      const el = getEl(); if (!el || el.clientWidth === 0) return
      const s = Math.min(1, Math.max(0.1, (el.clientWidth - 40) / PROFORMA_W))
      baseFitRef.current = s
      setView({ scale: s, x: Math.max(0, (el.clientWidth - PROFORMA_W * s) / 2), y: 20 })
    }
    window.addEventListener("resize", onResize)

    // ── Mouse drag ────────────────────────────────────────────
    function onMouseDown(e: MouseEvent) {
      g.dragging = true; g.lastX = e.clientX; g.lastY = e.clientY
      const el = getEl(); if (el) el.style.cursor = "grabbing"
    }
    function onMouseMove(e: MouseEvent) {
      if (!g.dragging) return
      const dx = e.clientX - g.lastX; const dy = e.clientY - g.lastY
      g.lastX = e.clientX; g.lastY = e.clientY
      setView(v => ({ ...v, x: v.x + dx, y: v.y + dy }))
    }
    function onMouseUp() {
      g.dragging = false
      const el = getEl(); if (el) el.style.cursor = "grab"
    }

    // ── Wheel zoom (ancré sur le curseur) ─────────────────────
    function onWheel(e: WheelEvent) {
      e.preventDefault()
      const el = getEl(); if (!el) return
      const rect = el.getBoundingClientRect()
      const cx = e.clientX - rect.left, cy = e.clientY - rect.top
      const factor = e.deltaY < 0 ? 1.15 : 1 / 1.15
      setView(v => {
        const ns = Math.min(4, Math.max(0.2, v.scale * factor))
        const r = ns / v.scale
        return { scale: ns, x: cx - (cx - v.x) * r, y: cy - (cy - v.y) * r }
      })
    }

    // ── Touch: 1 doigt = pan, 2 doigts = pinch ───────────────
    function tdist(a: Touch, b: Touch) { return Math.hypot(b.clientX - a.clientX, b.clientY - a.clientY) }
    function tmid(a: Touch, b: Touch, r: DOMRect) {
      return { x: (a.clientX + b.clientX) / 2 - r.left, y: (a.clientY + b.clientY) / 2 - r.top }
    }
    function onTouchStart(e: TouchEvent) {
      if (e.touches.length === 1) {
        g.dragging = true; g.pinching = false
        g.lastX = e.touches[0].clientX; g.lastY = e.touches[0].clientY
      } else if (e.touches.length >= 2) {
        e.preventDefault()
        g.pinching = true; g.dragging = false
        g.lastDist = tdist(e.touches[0], e.touches[1])
        const el = getEl()
        if (el) {
          const m = tmid(e.touches[0], e.touches[1], el.getBoundingClientRect())
          g.lastX = m.x; g.lastY = m.y
        }
      }
    }
    function onTouchMove(e: TouchEvent) {
      e.preventDefault()
      const el = getEl(); if (!el) return
      if (e.touches.length === 1 && g.dragging && !g.pinching) {
        const dx = e.touches[0].clientX - g.lastX
        const dy = e.touches[0].clientY - g.lastY
        g.lastX = e.touches[0].clientX; g.lastY = e.touches[0].clientY
        setView(v => ({ ...v, x: v.x + dx, y: v.y + dy }))
      } else if (e.touches.length >= 2 && g.pinching) {
        const d = tdist(e.touches[0], e.touches[1])
        const factor = g.lastDist > 0 ? d / g.lastDist : 1
        g.lastDist = d
        const m = tmid(e.touches[0], e.touches[1], el.getBoundingClientRect())
        // Pan simultané au pinch (déplacement du midpoint)
        const panDx = m.x - g.lastX, panDy = m.y - g.lastY
        g.lastX = m.x; g.lastY = m.y
        setView(v => {
          const ns = Math.min(4, Math.max(0.2, v.scale * factor))
          const r = ns / v.scale
          return {
            scale: ns,
            x: m.x - (m.x - v.x) * r + panDx,
            y: m.y - (m.y - v.y) * r + panDy,
          }
        })
      }
    }
    function onTouchEnd(e: TouchEvent) {
      if (e.touches.length === 0) { g.dragging = false; g.pinching = false }
      else if (e.touches.length === 1) { g.pinching = false; g.dragging = true; g.lastX = e.touches[0].clientX; g.lastY = e.touches[0].clientY }
    }

    // Attacher sur window pour mouse (drag qui sort du container)
    // Attacher sur el pour touch/wheel (passive:false obligatoire)
    window.addEventListener("mousemove", onMouseMove)
    window.addEventListener("mouseup", onMouseUp)

    function attachEl() {
      const el = getEl(); if (!el) return
      el.addEventListener("mousedown", onMouseDown)
      el.addEventListener("wheel", onWheel, { passive: false })
      el.addEventListener("touchstart", onTouchStart, { passive: false })
      el.addEventListener("touchmove", onTouchMove, { passive: false })
      el.addEventListener("touchend", onTouchEnd)
    }
    // Attacher après le premier frame (el est sûrement là)
    const attachRaf = requestAnimationFrame(attachEl)

    return () => {
      cancelAnimationFrame(rafId)
      cancelAnimationFrame(attachRaf)
      window.removeEventListener("resize", onResize)
      window.removeEventListener("mousemove", onMouseMove)
      window.removeEventListener("mouseup", onMouseUp)
      const el = getEl()
      if (el) {
        el.removeEventListener("mousedown", onMouseDown)
        el.removeEventListener("wheel", onWheel)
        el.removeEventListener("touchstart", onTouchStart)
        el.removeEventListener("touchmove", onTouchMove)
        el.removeEventListener("touchend", onTouchEnd)
      }
    }
  }, [previewOpen])

  function updateQty(idx: number, delta: number, e: React.MouseEvent) {
    e.stopPropagation()
    if (cartError) setCartError(false)
    setServices((prev) =>
      prev.map((s, i) => i === idx ? { ...s, qty: Math.max(0, s.qty + delta) } : s)
    )
  }

  function removeItem(id: number) {
    setServices((prev) => prev.map((s) => s.id === id ? { ...s, qty: 0 } : s))
  }

  // Require a client name before any send/preview; focuses the field on failure.
  function requireName(): boolean {
    if (!clientName.trim()) {
      setNameError(true)
      nameInputRef.current?.focus()
      nameInputRef.current?.scrollIntoView({ behavior: "smooth", block: "center" })
      return false
    }
    return true
  }

  async function orderWhatsApp() {
    if (!requireName()) return
    const wa = t.pricing.wa
    const lines = selectedServices.map((s) => `• ${svcName(s)}${tierOf(s) !== "standard" ? ` (${tl[tierOf(s)]})` : ""} ×${s.qty} = ${fmt(priceFor(eff(s).price) * s.qty)}`)
    if (otherChecked && otherText) lines.push(`• ${wa.other} : ${otherText}`)
    const discLine = discount > 0 ? `\n${wa.reduction} (${Math.round(discountPct * 100)}%) : -${fmt(discount)}` : ""
    // Sign the message with the client's name so INOV recognizes the sender at a glance.
    const signature = clientName.trim() ? `\n\n— ${clientName.trim()}` : ""
    const msg = `${wa.hello}\n\n${wa.intro}\n\n${lines.join("\n")}${discLine}\n\n${wa.total} : ${fmt(total)} (${currency})\n${wa.deposit} : ${fmt(acompte)}\n\n${wa.thanks}${signature}`
    track("order_click", { value: total, currency, items: selectedServices.length })
    captureQuoteLead()
    window.open(`https://wa.me/50936255920?text=${encodeURIComponent(msg)}`, "_blank")
  }

  // Build the rate-adjusted quote payload. Every amount is converted to the
  // client's currency (like the proforma's fmt()) BEFORE leaving the browser, so
  // the admin — which labels amounts with `currency` — shows figures that already
  // reflect the applied rate instead of raw USD. `meta.rate` records the rate used.
  function quoteLeadPayload() {
    const rate = rates[currency] ?? 1
    const items = selectedServices.map((s) => ({
      name: svcName(s),
      tier: tierOf(s) !== "standard" ? tl[tierOf(s)] : "",
      qty: s.qty,
      price: Math.round(priceFor(eff(s).price) * rate * s.qty),
    }))
    return {
      rate,
      items,
      total: Math.round(total * rate),
      deposit: Math.round(acompte * rate),
    }
  }

  // Save the configured quote as a lead in Supabase (visible in /admin).
  // Fire-and-forget: never blocks the WhatsApp flow if the network fails.
  function captureQuoteLead() {
    const { rate, items, total: t2, deposit } = quoteLeadPayload()
    api.submitLead({
      source: "quote",
      name: clientName,
      phone: clientPhone.trim(),
      lang, currency, region,
      total: t2,
      deposit,
      items,
      message: otherChecked && otherText ? `Autre : ${otherText}` : "",
      meta: { rate },
    })
  }

  // Require a valid client e-mail before requesting the proforma.
  function requireEmail(): boolean {
    const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clientEmail.trim())
    if (!ok) {
      setEmailError(true)
      emailInputRef.current?.focus()
      emailInputRef.current?.scrollIntoView({ behavior: "smooth", block: "center" })
      return false
    }
    return true
  }

  // Email the configured proforma to the client (and notify the team).
  async function requestProforma() {
    setSentOk(false)
    setSentErr(false)
    if (selectedServices.length === 0) { setCartError(true); return }
    if (!requireName()) { setPreviewOpen(false); return }
    if (!requireEmail()) { setPreviewOpen(false); return }
    setSending(true)
    const { items, total: t2, deposit } = quoteLeadPayload()
    try {
      await api.requestProforma({
        name: clientName.trim(),
        email: clientEmail.trim(),
        phone: clientPhone.trim(),
        lang, currency, region,
        proformaNo,
        total: t2,
        deposit,
        items,
        html: buildProformaHtml(),
      })
      track("proforma_request", { value: t2, currency, items: selectedServices.length })
      setSentOk(true)
      setPreviewOpen(false)
    } catch (e) {
      // Surface the real reason (CORS/origin, email_failed, rate limit…) so a
      // failed proforma is diagnosable instead of a silent generic error.
      console.error("[proforma] request failed:", e)
      setSentErr(true)
    } finally {
      setSending(false)
    }
  }

  const now = new Date()
  // Proforma number: year-month-day-hour, two digits each (YY-MM-DD-HH)
  const pad2 = (n: number) => String(n).padStart(2, "0")
  const proformaNo = `${pad2(now.getFullYear() % 100)}-${pad2(now.getMonth() + 1)}-${pad2(now.getDate())}-${pad2(now.getHours())}`

  function buildProformaHtml() {
    const pf = t.pricing.proforma
    const dateStr = now.toLocaleDateString(CURRENCIES[currency].locale)
    // Escape any user-typed text before it enters the innerHTML string, so a
    // name or "other" value can never inject markup into the proforma.
    const esc = (v: string) => v.replace(/[&<>"']/g, (c) => (
      { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c] as string
    ))
    const clientLabel = esc((clientName || pf.client).toUpperCase())

    const slaText = (s: PricingService) => {
      const ev = eff(s)
      const del = t.pricing.slaDelivery.replace("{n}", String(s.deliveryDays))
      const rev = ev.revisions <= 1
        ? t.pricing.slaRevisionsUnlimited
        : t.pricing.slaRevisions.replace("{r}", String(ev.revisions)).replace("{d}", String(ev.revisionDays))
      const formula = `${tl.formula}: ${tl[tierOf(s)]}`
      return `${formula} · ${del} · ${rev}`
    }

    const rows = selectedServices.map((s) => {
      const label = (s.qty > 1 ? `${svcName(s)} (×${s.qty})` : svcName(s)).toUpperCase()
      return `
        <tr>
          <td style="padding:13px 18px;border:1.5px solid #111;font-weight:700;font-size:13px;letter-spacing:0.01em;">${label}<div style="margin-top:4px;font-weight:600;font-size:10.5px;color:var(--ds-accent);letter-spacing:0.01em;">${slaText(s)}</div></td>
          <td style="padding:13px 18px;border:1.5px solid #111;text-align:right;font-weight:800;font-size:13px;white-space:nowrap;">${fmt(priceFor(eff(s).price) * s.qty)}</td>
        </tr>`
    }).join("")

    const otherRow = otherChecked && otherText
      ? `<tr>
          <td style="padding:13px 18px;border:1.5px solid #111;font-weight:700;font-size:13px;">${esc(otherText.toUpperCase())}</td>
          <td style="padding:13px 18px;border:1.5px solid #111;text-align:right;font-weight:800;font-size:13px;white-space:nowrap;">—</td>
        </tr>`
      : ""

    const html = `
      <div dir="${lang === "ar" ? "rtl" : "ltr"}" style="position:relative;font-family:'Outfit',sans-serif;width:780px;margin:0 auto;padding:48px 44px;background:#fff;color:#111;overflow:hidden;">
        <!-- Watermark -->
        <div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;pointer-events:none;overflow:hidden;">
          <img src="${logo}" alt="" style="width:560px;height:auto;object-fit:contain;transform:rotate(-45deg);opacity:0.05;" />
        </div>

        <div style="position:relative;">
          <!-- Header -->
          <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:44px;">
            <div style="height:64px;flex-shrink:0;display:flex;align-items:center;">
              <img src="${logo}" alt="INOV" style="height:64px;width:auto;object-fit:contain;display:block;" />
            </div>
            <div style="text-align:right;">
              <h1 style="font-size:38px;font-weight:900;color:#111;margin:0;letter-spacing:-0.01em;">${pf.docTitle}</h1>
              <div style="margin-top:6px;font-size:14px;">
                <span style="font-weight:800;color:#111;">${pf.no} ${proformaNo}</span>
                <span style="font-weight:800;color:var(--ds-accent);margin-left:16px;">${pf.validity}</span>
              </div>
            </div>
          </div>

          <!-- Info boxes -->
          <div style="display:flex;justify-content:space-between;gap:24px;margin-bottom:36px;">
            <table style="border-collapse:collapse;">
              <tr>
                <td style="padding:14px 20px;border:1.5px solid #111;background:#e2e2e2;font-weight:800;font-size:13px;letter-spacing:0.03em;">${pf.inNameOf}</td>
                <td style="padding:14px 20px;border:1.5px solid #111;font-weight:700;font-size:13px;">${clientLabel}</td>
              </tr>
            </table>
            <table style="border-collapse:collapse;">
              <tr>
                <td style="padding:14px 20px;border:1.5px solid #111;background:#e2e2e2;font-weight:800;font-size:13px;letter-spacing:0.03em;">${pf.date}</td>
                <td style="padding:14px 28px;border:1.5px solid #111;font-weight:700;font-size:13px;text-align:center;">${dateStr}</td>
              </tr>
            </table>
          </div>

          <!-- Services table -->
          <table style="width:100%;border-collapse:collapse;margin-bottom:40px;">
            <thead>
              <tr style="background:#111;color:#fff;">
                <th style="padding:13px 18px;border:1.5px solid #111;text-align:left;font-size:13px;font-weight:800;letter-spacing:0.03em;">${pf.serviceCol}</th>
                <th style="padding:13px 18px;border:1.5px solid #111;text-align:left;font-size:13px;font-weight:800;letter-spacing:0.03em;width:130px;">${pf.priceCol}</th>
              </tr>
            </thead>
            <tbody>${rows}${otherRow}</tbody>
          </table>

          <!-- Footer -->
          <div style="display:flex;justify-content:space-between;align-items:flex-end;">
            <div style="font-size:14px;line-height:2;">
              <div style="font-weight:700;display:flex;align-items:center;gap:8px;"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#111" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>@inov_digital_services</div>
              <div style="font-weight:700;display:flex;align-items:center;gap:8px;"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#111" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>(+509) 3625-5920</div>
            </div>
            <div style="text-align:right;">
              <table style="border-collapse:collapse;">
                ${discount > 0 ? `
                <tr>
                  <td style="padding:9px 22px;border:1.5px solid #111;font-weight:700;font-size:13px;">${t.pricing.subtotal}</td>
                  <td style="padding:9px 22px;border:1.5px solid #111;font-weight:700;font-size:13px;text-align:right;white-space:nowrap;">${fmt(subtotal)}</td>
                </tr>
                <tr>
                  <td style="padding:9px 22px;border:1.5px solid #111;font-weight:700;font-size:13px;color:var(--ds-accent-text);">${t.pricing.discountLabel} -${Math.round(discountPct * 100)}%</td>
                  <td style="padding:9px 22px;border:1.5px solid #111;font-weight:800;font-size:13px;text-align:right;white-space:nowrap;color:var(--ds-accent-text);">-${fmt(discount)}</td>
                </tr>` : ""}
                <tr>
                  <td style="padding:13px 22px;border:1.5px solid #111;background:#e2e2e2;font-weight:800;font-size:15px;">${pf.total}</td>
                  <td style="padding:13px 22px;border:1.5px solid #111;font-weight:900;font-size:15px;text-align:right;white-space:nowrap;">${fmt(total)}</td>
                </tr>
              </table>
              <div style="margin-top:10px;font-weight:800;font-size:15px;color:var(--ds-accent-text);">${pf.deposit70}</div>
              <div style="margin-top:18px;padding:12px 16px;border:1.5px dashed #111;background:#fafafa;font-size:11.5px;line-height:1.6;color:#333;">
                <strong style="display:block;font-size:12px;color:#111;margin-bottom:3px;text-transform:uppercase;letter-spacing:0.03em;">${pf.noticeTitle}</strong>
                ${pf.notReceipt}
              </div>
            </div>
          </div>
        </div>
      </div>`

    return html
  }

  function openPreview() {
    if (selectedServices.length === 0) { setCartError(true); return }
    if (!requireName()) return
    setPreviewOpen(true)
  }

  return (
    <section id="pricing" style={{ background: "var(--ds-bg-card)", padding: "96px 0" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 var(--section-px)" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <div style={{ marginBottom: 20 }}>
            <span className="section-tag"><span className="dot-pulse" />{t.pricing.tag}</span>
          </div>
          <h2 className="section-title" style={{ marginBottom: 16 }}>{t.pricing.title}</h2>
          <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: 17.6, color: "var(--ds-text-sec)", maxWidth: 520, margin: "0 auto", lineHeight: 1.7 }}>
            {t.pricing.subtitle}
          </p>

          {/* Social proof — honest figures reused from the portfolio section */}
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, marginTop: 18, padding: "7px 16px", background: "var(--ds-accent-a08)", border: "1px solid var(--ds-accent-a18)", borderRadius: "var(--r-full)" }}>
            <ShieldCheck size={15} color="var(--ds-accent-text)" aria-hidden="true" />
            <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 13, fontWeight: 700, color: "var(--ds-accent-text)" }}>{ux.socialProof}</span>
          </div>

          {/* Discount badges */}
          <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 24, flexWrap: "wrap" }}>
            <span style={{
              display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 18px",
              background: totalQty >= 5 ? "var(--ds-accent)" : "var(--ds-bg-sec)",
              color: totalQty >= 5 ? "#fff" : "var(--ds-text)",
              borderRadius: "var(--r-full)", fontFamily: "'Outfit', sans-serif", fontSize: 13, fontWeight: 700,
              transition: "all 0.3s",
            }}>
              <PartyPopper size={15} /> {t.pricing.discount5}
            </span>
            <span style={{
              display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 18px",
              background: totalQty >= 10 ? "var(--ds-accent)" : "var(--ds-bg-sec)",
              color: totalQty >= 10 ? "#fff" : "var(--ds-text)",
              borderRadius: "var(--r-full)", fontFamily: "'Outfit', sans-serif", fontSize: 13, fontWeight: 700,
              transition: "all 0.3s",
            }}>
              <Rocket size={15} /> {t.pricing.discount10}
            </span>
          </div>

          {/* Currency selector — moved here from the header so it lives with the prices */}
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, marginTop: 24, padding: "8px 8px 8px 16px", background: "var(--ds-bg-sec)", borderRadius: "var(--r-full)" }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: "'Outfit', sans-serif", fontSize: 13, fontWeight: 600, color: "var(--ds-text-muted)" }}>
              <Coins size={15} aria-hidden="true" /> {t.pricing.currencyLabel}
            </span>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
              aria-label={t.pricing.currencyLabel}
              style={{
                fontFamily: "'Outfit', sans-serif", fontSize: 13.5, fontWeight: 700, color: "var(--ds-text)",
                background: "var(--ds-bg-card)", border: "1.5px solid var(--ds-border)", borderRadius: "var(--r-full)",
                padding: "8px 14px", cursor: "pointer", outline: "none",
              }}
            >
              {(Object.keys(CURRENCIES) as CurrencyCode[]).map((c) => (
                <option key={c} value={c}>{CURRENCIES[c].flag} {c} — {CURRENCIES[c].label}</option>
              ))}
            </select>
          </div>

          {currency !== "USD" && (
            <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: 12, color: "var(--ds-text-muted)", marginTop: 16 }}>
              {t.pricing.rateNote.replace("{rate}", `${rates[currency].toLocaleString(CURRENCIES[currency].locale)} ${CURRENCIES[currency].symbol}`)}
            </p>
          )}
        </div>

        {/* Main layout: services list + cart */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 32, alignItems: "start" }}>
          {/* Services list */}
          <div>
            {/* Accordion toggle — orange call to action */}
            <button
              onClick={() => setAccordionOpen(!accordionOpen)}
              aria-expanded={accordionOpen}
              className="btn-orange"
              style={{
                width: "auto", maxWidth: "100%", display: "inline-flex", alignItems: "center", gap: 14,
                padding: "14px 20px", borderRadius: "var(--r-lg)", border: "none",
                cursor: "pointer", fontFamily: "'Outfit', sans-serif", fontSize: 15, fontWeight: 700,
                color: "#fff", marginBottom: 8,
                boxShadow: "0 6px 18px var(--ds-accent-a28)",
              }}
            >
              <span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
                {t.pricing.seeAllServices} ({services.length})
                {selectedServices.length > 0 && (
                  <span style={{
                    display: "inline-flex", alignItems: "center", justifyContent: "center",
                    minWidth: 22, height: 22, padding: "0 7px", borderRadius: "var(--r-full)",
                    background: "#fff", color: "var(--ds-accent)", fontSize: 12, fontWeight: 800,
                  }}>{selectedServices.length}</span>
                )}
              </span>
              <span style={{ transform: accordionOpen ? "rotate(180deg)" : "none", transition: "transform 0.3s", color: "#fff", display: "inline-flex" }}><ChevronDown size={18} aria-hidden="true" /></span>
            </button>

            {/* Services list — single stable list; rows never reorder when selected */}
            <div>
              {/* When collapsed, keep the current selection visible (stable order, no jump) */}
              {!accordionOpen && services.filter((s) => s.qty > 0).map((s) => (
                <ServiceRow key={s.id} s={s} name={svcName(s)} desc={svcDesc(s)} idx={services.indexOf(s)} updateQty={updateQty} fmt={fmt} tier={tierOf(s)} onTier={(tk) => setTier(s.id, tk)} tl={tl} />
              ))}

              {/* Full list in original order — selecting a row keeps it in place */}
              <div
                className="services-scroll"
                style={{
                  maxHeight: accordionOpen ? 460 : 0,
                  overflowY: accordionOpen ? "auto" : "hidden",
                  overflowX: "hidden",
                  transition: "max-height 0.4s ease",
                  borderRadius: "var(--r-lg)",
                  border: accordionOpen ? "1.5px solid var(--ds-border)" : "none",
                  paddingRight: accordionOpen ? 4 : 0,
                }}
              >
                {services.map((s) => (
                  <ServiceRow key={s.id} s={s} name={svcName(s)} desc={svcDesc(s)} idx={services.indexOf(s)} updateQty={updateQty} fmt={fmt} tier={tierOf(s)} onTier={(tk) => setTier(s.id, tk)} tl={tl} />
                ))}
              </div>

              {/* Other */}
              <div style={{ marginTop: 12, padding: "16px 20px", background: "var(--ds-bg-sec)", borderRadius: "var(--r-lg)" }}>
                <label style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={!!otherChecked}
                    onChange={(e) => setOtherChecked(e.target.checked)}
                    style={{ width: 18, height: 18, cursor: "pointer" }}
                  />
                  <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 15, fontWeight: 600 }}>
                    {t.pricing.otherNeed}
                  </span>
                </label>
                {otherChecked && (
                  <textarea
                    value={otherText ?? ""}
                    onChange={(e) => setOtherText(e.target.value)}
                    placeholder={t.pricing.otherPlaceholder}
                    aria-label={t.pricing.otherNeed}
                    rows={3}
                    style={{
                      width: "100%", marginTop: 12, padding: "12px 16px",
                      borderRadius: "var(--r-md)", border: "1.5px solid var(--ds-border)",
                      fontFamily: "'Outfit', sans-serif", fontSize: 14, resize: "vertical", outline: "none",
                    }}
                  />
                )}
              </div>
            </div>
          </div>

          {/* Sidebar cart */}
          <div ref={cartRef} className="cart-sticky">
            <div style={{ background: "var(--ds-ink)", borderRadius: "var(--r-xl)", padding: 28, color: "#fff" }}>
              <h3 style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: 18, color: "#fff", marginBottom: 20 }}>
                <ShoppingCart size={18} /> {t.pricing.cartTitle}
              </h3>

              {selectedServices.length === 0 ? (
                <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: 14, color: "rgba(255,255,255,0.5)", textAlign: "center", padding: "20px 0" }}>
                  {t.pricing.cartEmpty}
                </p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
                  {selectedServices.map((s) => (
                    <div key={s.id} style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
                      <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 13, color: "rgba(255,255,255,0.85)", flex: 1, lineHeight: 1.4 }}>
                        {svcName(s)} <strong style={{ color: "var(--ds-accent)" }}>×{s.qty}</strong>
                        {tierOf(s) !== "standard" && (
                          <span style={{ display: "block", fontSize: 11, color: "rgba(255,255,255,0.5)" }}>{tl.formula}: {tl[tierOf(s)]}</span>
                        )}
                      </span>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                        <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 13, fontWeight: 700, color: "#fff" }}>
                          {fmt(priceFor(eff(s).price) * s.qty)}
                        </span>
                        <button
                          onClick={() => removeItem(s.id)}
                          aria-label={t.pricing.removeAria}
                          style={{ background: "rgba(255,255,255,0.1)", border: "none", color: "#fff", width: 22, height: 22, borderRadius: "50%", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                        >
                          <X size={12} />
                        </button>
                      </div>
                    </div>
                  ))}
                  {otherChecked && otherText && (
                    <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 13, color: "rgba(255,255,255,0.6)", fontStyle: "italic" }}>
                      + {t.pricing.wa.other} : {otherText}
                    </div>
                  )}
                </div>
              )}

              {/* Totals */}
              <div style={{ borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: 16, marginBottom: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 14, color: "rgba(255,255,255,0.6)" }}>{t.pricing.subtotal}</span>
                  <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 14, color: "#fff" }}>{fmt(subtotal)}</span>
                </div>
                {discount > 0 && (
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                    <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 14, color: "var(--ds-accent)" }}>
                      {t.pricing.discountLabel} -{Math.round(discountPct * 100)}%
                    </span>
                    <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 14, color: "var(--ds-accent)", fontWeight: 700 }}>-{fmt(discount)}</span>
                  </div>
                )}
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 16, fontWeight: 800, color: "#fff" }}>{t.pricing.total}</span>
                  <span key={total} className="total-pulse" style={{ fontFamily: "'Outfit', sans-serif", fontSize: 20, fontWeight: 900, color: "#fff" }}>{fmt(total)}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 13, color: "rgba(255,255,255,0.5)" }}>{t.pricing.deposit}</span>
                  <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 14, fontWeight: 700, color: "var(--ds-accent)" }}>{fmt(acompte)}</span>
                </div>
              </div>

              {/* Quantity progress — visual bar + money the client would save by
                  reaching the next volume tier (loss-aversion framing). */}
              {totalQty > 0 && nextAt && (
                <div style={{ marginBottom: 16, padding: "12px 14px", background: "var(--ds-accent-a14)", borderRadius: "var(--r-md)" }}>
                  <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: 12, fontWeight: 700, color: "var(--ds-accent-text)", margin: 0, display: "flex", justifyContent: "space-between", gap: 8 }}>
                    <span>
                      {t.pricing.addForDiscount
                        .replace("{n}", String(toNext))
                        .replace("{pct}", `-${Math.round(nextPct * 100)}%`)}
                      {nextAt === 10 ? " 🚀" : " 🎉"}
                    </span>
                    {extraSaving > 0 && (
                      <span style={{ whiteSpace: "nowrap", fontWeight: 800 }}>{ux.youSave.replace("{amt}", fmt(extraSaving))}</span>
                    )}
                  </p>
                  <div
                    role="progressbar"
                    aria-valuenow={progressPct}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    style={{ marginTop: 9, height: 6, borderRadius: 999, background: "rgba(255,255,255,0.14)", overflow: "hidden" }}
                  >
                    <div style={{ width: `${progressPct}%`, height: "100%", borderRadius: 999, background: "var(--ds-accent)", transition: "width 0.4s ease" }} />
                  </div>
                </div>
              )}

              {/* Empty-cart error (inline, replaces native alert) */}
              {cartError && (
                <div role="alert" style={{ marginBottom: 12, padding: "10px 14px", background: "var(--ds-danger-on-dark-a12)", border: "1px solid var(--ds-danger-on-dark-a40)", borderRadius: "var(--r-md)" }}>
                  <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: 13, fontWeight: 600, color: "var(--ds-danger-on-dark)", margin: 0 }}>
                    {t.pricing.selectAtLeastOne}
                  </p>
                </div>
              )}

              {/* Client name — asked just before ordering, in context */}
              <div style={{ marginBottom: 16 }}>
                <label htmlFor="pricing-client-name" style={{ fontFamily: "'Outfit', sans-serif", fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.55)", display: "block", marginBottom: 6 }}>
                  {t.pricing.clientNameLabel}
                </label>
                <input
                  id="pricing-client-name"
                  ref={nameInputRef}
                  type="text"
                  value={clientName ?? ""}
                  onChange={(e) => { setClientName(e.target.value); if (nameError) setNameError(false) }}
                  placeholder={t.pricing.clientNamePlaceholder}
                  aria-invalid={nameError}
                  aria-required="true"
                  style={{
                    width: "100%", padding: "11px 14px", borderRadius: "var(--r-md)",
                    border: `1.5px solid ${nameError ? "var(--ds-danger-on-dark)" : "rgba(255,255,255,0.15)"}`,
                    fontFamily: "'Outfit', sans-serif", fontSize: 14,
                    background: "rgba(255,255,255,0.07)", color: "#fff",
                    outline: "none", transition: "border 0.2s",
                  }}
                  onFocus={(e) => { if (!nameError) e.target.style.borderColor = "rgba(255,255,255,0.5)" }}
                  onBlur={(e) => { if (!nameError) e.target.style.borderColor = "rgba(255,255,255,0.15)" }}
                />
                {nameError && (
                  <p style={{ margin: "6px 2px 0", fontFamily: "'Outfit', sans-serif", fontSize: 12, fontWeight: 600, color: "var(--ds-danger-on-dark)" }}>
                    {t.pricing.clientNameRequired}
                  </p>
                )}
              </div>

              {/* Client e-mail — where we send the proforma */}
              <div style={{ marginBottom: 16 }}>
                <label htmlFor="pricing-client-email" style={{ fontFamily: "'Outfit', sans-serif", fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.55)", display: "block", marginBottom: 6 }}>
                  {t.pricing.clientEmailLabel}
                </label>
                <input
                  id="pricing-client-email"
                  ref={emailInputRef}
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  value={clientEmail ?? ""}
                  onChange={(e) => { setClientEmail(e.target.value); if (emailError) setEmailError(false); if (sentOk) setSentOk(false); if (sentErr) setSentErr(false) }}
                  placeholder={t.pricing.clientEmailPlaceholder}
                  aria-invalid={emailError}
                  aria-required="true"
                  style={{
                    width: "100%", padding: "11px 14px", borderRadius: "var(--r-md)",
                    border: `1.5px solid ${emailError ? "var(--ds-danger-on-dark)" : "rgba(255,255,255,0.15)"}`,
                    fontFamily: "'Outfit', sans-serif", fontSize: 14,
                    background: "rgba(255,255,255,0.07)", color: "#fff",
                    outline: "none", transition: "border 0.2s",
                  }}
                  onFocus={(e) => { if (!emailError) e.target.style.borderColor = "rgba(255,255,255,0.5)" }}
                  onBlur={(e) => { if (!emailError) e.target.style.borderColor = "rgba(255,255,255,0.15)" }}
                />
                {emailError && (
                  <p style={{ margin: "6px 2px 0", fontFamily: "'Outfit', sans-serif", fontSize: 12, fontWeight: 600, color: "var(--ds-danger-on-dark)" }}>
                    {t.pricing.clientEmailRequired}
                  </p>
                )}
              </div>

              {/* Client WhatsApp — optional, lets INOV follow up on the quote fast */}
              <div style={{ marginBottom: 16 }}>
                <label htmlFor="pricing-client-phone" style={{ fontFamily: "'Outfit', sans-serif", fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.55)", display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                  <SiWhatsapp size={13} aria-hidden="true" /> {(WA_LABELS[lang] ?? WA_LABELS.fr).label}
                </label>
                <input
                  id="pricing-client-phone"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  value={clientPhone ?? ""}
                  onChange={(e) => setClientPhone(e.target.value)}
                  placeholder={(WA_LABELS[lang] ?? WA_LABELS.fr).placeholder}
                  style={{
                    width: "100%", padding: "11px 14px", borderRadius: "var(--r-md)",
                    border: "1.5px solid rgba(255,255,255,0.15)",
                    fontFamily: "'Outfit', sans-serif", fontSize: 14,
                    background: "rgba(255,255,255,0.07)", color: "#fff",
                    outline: "none", transition: "border 0.2s",
                  }}
                  onFocus={(e) => { e.target.style.borderColor = "rgba(255,255,255,0.5)" }}
                  onBlur={(e) => { e.target.style.borderColor = "rgba(255,255,255,0.15)" }}
                />
              </div>

              {/* Reassurance strip — reduces purchase friction (risk reversal) */}
              <ul style={{ listStyle: "none", margin: "0 0 14px", padding: 0, display: "flex", flexDirection: "column", gap: 7 }}>
                {[
                  { icon: <ShieldCheck size={13} aria-hidden="true" />, label: ux.trustDeposit },
                  { icon: <RefreshCw size={13} aria-hidden="true" />, label: ux.trustRevisions },
                  { icon: <Check size={13} strokeWidth={3} aria-hidden="true" />, label: ux.trustSatisfaction },
                ].map((r, i) => (
                  <li key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: "'Outfit', sans-serif", fontSize: 12, color: "rgba(255,255,255,0.7)" }}>
                    <span style={{ color: "var(--ds-accent)", display: "inline-flex", flexShrink: 0 }}>{r.icon}</span>
                    {r.label}
                  </li>
                ))}
              </ul>

              {/* Action buttons */}
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <button
                  onClick={orderWhatsApp}
                  disabled={selectedServices.length === 0}
                  style={{
                    background: "#25D366", color: "#fff", border: "none", borderRadius: "var(--r-full)",
                    padding: "14px 20px", fontFamily: "'Outfit', sans-serif", fontSize: 14, fontWeight: 700,
                    cursor: selectedServices.length === 0 ? "not-allowed" : "pointer",
                    opacity: selectedServices.length === 0 ? 0.5 : 1, transition: "all 0.2s",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  }}
                >
                  <SiWhatsapp size={16} /> {t.pricing.orderWhatsApp}
                </button>
                <button
                  onClick={requestProforma}
                  disabled={selectedServices.length === 0 || sending}
                  className="btn-orange"
                  style={{
                    color: "#fff", border: "none", borderRadius: "var(--r-full)",
                    padding: "13px 20px", fontFamily: "'Outfit', sans-serif", fontSize: 14, fontWeight: 700,
                    cursor: selectedServices.length === 0 ? "not-allowed" : sending ? "wait" : "pointer",
                    opacity: selectedServices.length === 0 ? 0.5 : sending ? 0.75 : 1, transition: "all 0.2s",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  }}
                >
                  <Mail size={16} /> {sending ? t.pricing.sendingProforma : t.pricing.requestProforma}
                </button>
                <button
                  onClick={openPreview}
                  disabled={selectedServices.length === 0}
                  style={{
                    background: "rgba(255,255,255,0.1)", color: "#fff", border: "1.5px solid rgba(255,255,255,0.2)",
                    borderRadius: "var(--r-full)", padding: "12px 20px", fontFamily: "'Outfit', sans-serif",
                    fontSize: 13, fontWeight: 700, cursor: selectedServices.length === 0 ? "not-allowed" : "pointer",
                    opacity: selectedServices.length === 0 ? 0.4 : 1, transition: "all 0.2s",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  }}
                >
                  <FileText size={16} /> {t.pricing.seeProforma}
                </button>
              </div>

              {sentOk && (
                <p role="status" aria-live="polite" style={{ display: "flex", alignItems: "center", gap: 8, margin: "12px 0 0", padding: "10px 12px", borderRadius: "var(--r-md)", background: "rgba(34,197,94,0.14)", border: "1px solid rgba(34,197,94,0.4)", fontFamily: "'Outfit', sans-serif", fontSize: 13, fontWeight: 600, color: "#bbf7d0" }}>
                  <CheckCircle size={16} aria-hidden="true" /> {t.pricing.proformaSent}
                </p>
              )}
              {sentErr && (
                <p role="alert" style={{ margin: "12px 0 0", padding: "10px 12px", borderRadius: "var(--r-md)", background: "rgba(239,68,68,0.14)", border: "1px solid rgba(239,68,68,0.4)", fontFamily: "'Outfit', sans-serif", fontSize: 13, fontWeight: 600, color: "var(--ds-danger-on-dark)" }}>
                  {t.pricing.proformaError}
                </p>
              )}

              <p style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, margin: "12px 0 0", fontFamily: "'Outfit', sans-serif", fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.55)" }}>
                <Clock size={13} aria-hidden="true" /> {ux.reply24h}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Mobile floating cart bar ─────────────────────────────────────── */}
      {selectedServices.length > 0 && (
        <div
          className="mobile-cart-bar"
          role="status"
          aria-live="polite"
          aria-label={`${selectedServices.length} service(s) sélectionné(s), total ${fmt(total)}`}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
            <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.55)" }}>
              {selectedServices.length} service{selectedServices.length > 1 ? "s" : ""}
            </span>
            <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 18, fontWeight: 900, color: "#fff", lineHeight: 1 }}>
              {fmt(total)}
            </span>
            {discount > 0 && (
              <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 11, fontWeight: 700, color: "var(--ds-accent)" }}>
                -{Math.round(discountPct * 100)}% {t.pricing.discountLabel.toLowerCase()}
              </span>
            )}
          </div>
          <button
            onClick={orderWhatsApp}
            style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "12px 20px", borderRadius: "var(--r-full)",
              background: "#25D366", color: "#fff", border: "none",
              fontFamily: "'Outfit', sans-serif", fontSize: 14, fontWeight: 700,
              cursor: "pointer", whiteSpace: "nowrap",
              boxShadow: "0 4px 16px rgba(37,211,102,0.35)",
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91S17.5 2 12.04 2Zm5.8 14.16c-.24.68-1.42 1.32-1.95 1.36-.5.05-.5.4-3.15-.66-2.65-1.06-4.34-3.76-4.47-3.94-.13-.18-1.08-1.44-1.08-2.74 0-1.3.68-1.94.92-2.2.24-.27.53-.34.7-.34.18 0 .35 0 .5.01.16.01.38-.06.59.45.24.58.8 2.02.87 2.17.07.15.12.32.02.5-.09.18-.14.29-.27.45-.14.15-.29.35-.41.47-.14.14-.28.29-.12.56.16.27.71 1.17 1.53 1.9 1.05.94 1.94 1.23 2.21 1.36.27.14.43.11.59-.07.16-.18.68-.79.86-1.06.18-.27.36-.22.6-.13.24.09 1.54.72 1.8.86.27.13.45.2.51.31.07.11.07.64-.17 1.32Z"/></svg>
            {t.pricing.orderWhatsApp}
          </button>
        </div>
      )}

      <style>{`
        @keyframes total-pulse {
          0% { transform: scale(1); }
          40% { transform: scale(1.12); color: var(--ds-accent); }
          100% { transform: scale(1); }
        }
        .total-pulse { display: inline-block; animation: total-pulse 0.42s ease; }
        @media (prefers-reduced-motion: reduce) { .total-pulse { animation: none; } }
        .mobile-cart-bar {
          display: none;
          position: fixed;
          bottom: 0; left: 0; right: 0;
          z-index: 4000;
          background: #111;
          border-top: 1px solid rgba(255,255,255,0.1);
          padding: 14px 20px 20px;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          box-shadow: 0 -8px 32px rgba(0,0,0,0.35);
        }
        @media (max-width: 900px) {
          #pricing > div > div:last-child {
            grid-template-columns: 1fr !important;
          }
          .cart-sticky { position: static !important; }
          .mobile-cart-bar { display: flex !important; }
          /* Add padding at bottom of pricing section so content isn't hidden under the bar */
          #pricing { padding-bottom: 104px !important; }
        }
      `}</style>

      {/* Proforma preview — rendu via Portal dans document.body pour garantir
          que position:fixed est toujours relatif au vrai viewport,
          indépendamment de tout transform/overflow sur les ancêtres. */}
      {previewOpen && createPortal(
        <>
          {/* Backdrop */}
          <div
            onClick={() => setPreviewOpen(false)}
            style={{
              position: "fixed", inset: 0, zIndex: 10001,
              background: "rgba(0,0,0,0.78)",
            }}
          />

          {/* Dialog — occupe 100% de l'écran moins 20px de marge de chaque côté */}
          <div
            ref={previewDialogRef}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-label={t.pricing.previewTitle}
            style={{
              position: "fixed",
              top: 20, bottom: 20,
              left: "50%", transform: "translateX(-50%)",
              width: "calc(100% - 40px)", maxWidth: 900,
              zIndex: 10002,
              background: "#fff", borderRadius: "var(--r-xl)",
              display: "flex", flexDirection: "column",
              overflow: "hidden",
              boxShadow: "0 30px 80px rgba(0,0,0,0.45)",
            }}
          >
            {/* ── En-tête : boutons TOUJOURS visibles, jamais scrollés ── */}
            <div style={{
              flexShrink: 0,
              display: "flex", alignItems: "center",
              justifyContent: "space-between",
              gap: 12, padding: "14px 20px",
              borderBottom: "1px solid rgba(0,0,0,0.09)",
              background: "#fff",
              flexWrap: "wrap",
            }}>
              <span style={{
                fontFamily: "'Outfit', sans-serif",
                fontWeight: 800, fontSize: 16, color: "#111",
              }}>
                {t.pricing.previewTitle}
              </span>

              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>

                {/* ── Zoom − / % / + ── */}
                <div style={{
                  display: "flex", alignItems: "center",
                  border: "1.5px solid rgba(0,0,0,0.12)", borderRadius: "var(--r-full)",
                  overflow: "hidden", background: "var(--ds-bg-sec)",
                }}>
                  <button
                    onClick={() => {
                      const box = previewBoxRef.current
                      if (!box) return
                      const cx = box.clientWidth / 2, cy = box.clientHeight / 2
                      setView(v => {
                        const ns = Math.max(0.25, v.scale * 0.8)
                        const r = ns / v.scale
                        return { scale: ns, x: cx - (cx - v.x) * r, y: cy - (cy - v.y) * r }
                      })
                    }}
                    aria-label="Zoom out"
                    style={{ width: 32, height: 32, border: "none", background: "transparent", cursor: "pointer", fontSize: 18, fontWeight: 700, color: "#333", display: "flex", alignItems: "center", justifyContent: "center" }}
                  >−</button>
                  <span
                    onClick={() => {
                      const box = previewBoxRef.current
                      if (!box) return
                      const s = baseFitRef.current
                      setView({ scale: s, x: (box.clientWidth - PROFORMA_W * s) / 2, y: 20 })
                    }}
                    title="Réinitialiser"
                    style={{ minWidth: 44, textAlign: "center", fontFamily: "'Outfit', sans-serif", fontSize: 12, fontWeight: 700, color: "#333", cursor: "pointer", userSelect: "none" as const }}
                  >{Math.round(view.scale * 100)}%</span>
                  <button
                    onClick={() => {
                      const box = previewBoxRef.current
                      if (!box) return
                      const cx = box.clientWidth / 2, cy = box.clientHeight / 2
                      setView(v => {
                        const ns = Math.min(4, v.scale * 1.25)
                        const r = ns / v.scale
                        return { scale: ns, x: cx - (cx - v.x) * r, y: cy - (cy - v.y) * r }
                      })
                    }}
                    aria-label="Zoom in"
                    style={{ width: 32, height: 32, border: "none", background: "transparent", cursor: "pointer", fontSize: 18, fontWeight: 700, color: "#333", display: "flex", alignItems: "center", justifyContent: "center" }}
                  >+</button>
                </div>

                {/* ── Demander par e-mail ── */}
                <button
                  onClick={requestProforma}
                  disabled={sending}
                  className="btn-orange"
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 8,
                    color: "#fff", border: "none", borderRadius: "var(--r-full)",
                    padding: "10px 20px",
                    fontFamily: "'Outfit', sans-serif", fontSize: 14, fontWeight: 700,
                    cursor: sending ? "wait" : "pointer",
                    opacity: sending ? 0.7 : 1,
                  }}
                >
                  {sending ? t.pricing.sendingProforma : <><Mail size={15} />{t.pricing.requestProforma}</>}
                </button>

                {/* ── Fermer ── */}
                <button
                  onClick={() => setPreviewOpen(false)}
                  aria-label={t.pricing.close}
                  style={{
                    background: "#F2F2F5", border: "none",
                    width: 36, height: 36, borderRadius: "50%",
                    cursor: "pointer", color: "#111",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* ── Viewer pan/zoom ── */}
            <div
              ref={previewBoxRef}
              style={{
                flex: 1, minHeight: 0,
                overflow: "hidden",
                background: "#EDEDF2",
                position: "relative",
                cursor: "grab",
                userSelect: "none",
                touchAction: "none",   /* bloque le scroll/zoom natif du navigateur */
              }}
            >
              <div
                ref={previewInnerRef}
                style={{
                  position: "absolute",
                  top: 0, left: 0,
                  width: PROFORMA_W,
                  transform: `translate(${view.x}px,${view.y}px) scale(${view.scale})`,
                  transformOrigin: "0 0",
                  boxShadow: "0 8px 30px rgba(0,0,0,0.18)",
                  background: "#fff",
                  willChange: "transform",
                  pointerEvents: "none", /* laisse tous les events remonter au container */
                  userSelect: "none",
                }}
                dangerouslySetInnerHTML={{ __html: buildProformaHtml() }}
              />
            </div>
          </div>
        </>,
        document.body,
      )}
    </section>
  )
}

/** Extract a YouTube video id from watch, youtu.be or shorts URLs. Returns null for non-YouTube links. */
function youTubeId(url: string): string | null {
  const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:shorts\/|embed\/|watch\?v=))([A-Za-z0-9_-]{11})/)
  return m ? m[1] : null
}

function ServiceRow({ s, name, desc, idx, updateQty, fmt, tier, onTier, tl }: { s: PricingService; name: string; desc: string; idx: number; updateQty: (i: number, d: number, e: React.MouseEvent) => void; fmt: (usd: number) => string; tier: TierKey; onTier: (t: TierKey) => void; tl: { formula: string } & Record<TierKey, string> }) {
  const { t, priceFor, lang } = useSettings()
  const ux = UX_LABELS[lang] ?? UX_LABELS.fr
  const ev = tierValues(s, tier)
  // Anchor: the premium price, shown struck-through when a cheaper tier is
  // selected so the current choice reads as a deal (price anchoring).
  const premiumPrice = tierValues(s, "premium").price
  const showAnchor = !s.quoteOnly && tier !== "premium" && premiumPrice > ev.price
  const features = tierFeatureList(s.id, tier, lang)
  const videoId = s.projectUrl ? youTubeId(s.projectUrl) : null
  const isShort = !!s.projectUrl && s.projectUrl.includes("/shorts/")
  const [playing, setPlaying] = useState(false)
  const [showImg, setShowImg] = useState(false)
  return (
    <div
      className={`tarifs-row ${s.qty > 0 ? "selected" : ""}`}
      style={{ marginBottom: 6 }}
    >
      {/* Stepper — hidden for quote-only services */}
      {s.quoteOnly ? (
        <div style={{ flexShrink: 0, width: 80 }} />
      ) : (
      <div className="qty-stepper" onClick={(e) => e.stopPropagation()}>
        <button className="qty-btn" aria-label={`− ${name}`} onClick={(e) => updateQty(idx, -1, e)}>−</button>
        <span className="qty-val" aria-live="polite">{s.qty}</span>
        <button className="qty-btn" aria-label={`+ ${name}`} onClick={(e) => updateQty(idx, 1, e)}>+</button>
      </div>
      )}

      {/* Name + desc */}
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 15, fontWeight: 700, color: "var(--ds-text)" }}>{name}</span>
          {s.featured && (
            <span style={{
              display: "inline-flex", alignItems: "center", gap: 4, padding: "2px 9px", borderRadius: "var(--r-full)",
              background: "var(--ds-accent)", color: "#fff", fontFamily: "'Outfit', sans-serif", fontSize: 10.5,
              fontWeight: 800, letterSpacing: "0.06em", textTransform: "uppercase",
            }}>
              <Package size={11} aria-hidden="true" /> {t.pricing.packageBadge}
            </span>
          )}
        </div>
        <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 13, color: "var(--ds-text-muted)", marginTop: 2 }}>{desc}</div>

        {/* Video example — plays inline for YouTube links, external link otherwise */}
        {s.projectUrl && videoId && (
          <div onClick={(e) => e.stopPropagation()}>
            {!playing ? (
              <button
                type="button"
                onClick={() => setPlaying(true)}
                style={{
                  display: "inline-flex", alignItems: "center", gap: 5, marginTop: 8,
                  fontFamily: "'Outfit', sans-serif", fontSize: 12.5, fontWeight: 700,
                  color: "var(--ds-accent-text)", background: "none", border: "none", padding: 0, cursor: "pointer",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.textDecoration = "underline")}
                onMouseLeave={(e) => (e.currentTarget.style.textDecoration = "none")}
              >
                <PlayCircle size={15} aria-hidden="true" /> {t.pricing.watchExample}
              </button>
            ) : (
              <div style={{
                position: "relative", marginTop: 10, width: "100%",
                maxWidth: isShort ? 260 : 440, aspectRatio: isShort ? "9 / 16" : "16 / 9",
                borderRadius: "var(--r-md)", overflow: "hidden", background: "#000",
                boxShadow: "0 8px 30px rgba(0,0,0,0.18)",
              }}>
                <iframe
                  src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&playsinline=1`}
                  title={name}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                  style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: "none" }}
                />
              </div>
            )}
            {playing && (
              <div>
                <a
                  href={`https://www.youtube.com/watch?v=${videoId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 5, marginTop: 6,
                    fontFamily: "'Outfit', sans-serif", fontSize: 11.5, fontWeight: 600,
                    color: "var(--ds-text-faint)", textDecoration: "none",
                  }}
                >
                  {t.pricing.watchExample} ↗
                </a>
              </div>
            )}
          </div>
        )}
        {s.projectUrl && !videoId && (
          <a
            href={s.projectUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            style={{
              display: "inline-flex", alignItems: "center", gap: 5, marginTop: 8,
              fontFamily: "'Outfit', sans-serif", fontSize: 12.5, fontWeight: 700,
              color: "var(--ds-accent-text)", textDecoration: "none",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.textDecoration = "underline")}
            onMouseLeave={(e) => (e.currentTarget.style.textDecoration = "none")}
          >
            <PlayCircle size={15} aria-hidden="true" /> {t.pricing.watchExample}
          </a>
        )}

        {/* Image example — collapsible preview so clients can see what they're buying */}
        {s.exampleImg && (
          <div onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => setShowImg(v => !v)}
              aria-expanded={showImg}
              style={{
                display: "inline-flex", alignItems: "center", gap: 5, marginTop: 8,
                fontFamily: "'Outfit', sans-serif", fontSize: 12.5, fontWeight: 700,
                color: "var(--ds-accent-text)", background: "none", border: "none", padding: 0, cursor: "pointer",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.textDecoration = "underline")}
              onMouseLeave={(e) => (e.currentTarget.style.textDecoration = "none")}
            >
              <Eye size={15} aria-hidden="true" /> {showImg ? t.services.hideExample : t.services.seeExample}
              <ChevronDown size={14} aria-hidden="true" style={{ transform: showImg ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.25s" }} />
            </button>
            <div style={{ display: "grid", gridTemplateRows: showImg ? "1fr" : "0fr", transition: "grid-template-rows 0.35s ease" }}>
              <div style={{ overflow: "hidden" }}>
                <div style={{ marginTop: 10, width: "100%", maxWidth: 280, borderRadius: "var(--r-md)", overflow: "hidden", border: "1px solid #EEE", lineHeight: 0, boxShadow: "0 8px 24px rgba(0,0,0,0.1)" }}>
                  <img src={s.exampleImg} alt={`${name} — ${t.services.seeExample}`} loading="lazy" style={{ width: "100%", height: "auto", display: "block", objectFit: "contain" }} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Delivery + revisions policy */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
          <span style={{
            display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 10px", borderRadius: "var(--r-full)",
            background: "var(--ds-bg-sec)", fontFamily: "'Outfit', sans-serif", fontSize: 11.5, fontWeight: 600, color: "var(--ds-text-sec)",
          }}>
            <Clock size={12} aria-hidden="true" /> {t.pricing.slaDelivery.replace("{n}", String(s.deliveryDays))}
          </span>
          <span style={{
            display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 10px", borderRadius: "var(--r-full)",
            background: "var(--ds-bg-sec)", fontFamily: "'Outfit', sans-serif", fontSize: 11.5, fontWeight: 600, color: "var(--ds-text-sec)",
          }}>
            <RefreshCw size={12} aria-hidden="true" /> {ev.revisions <= 1
              ? t.pricing.slaRevisionsUnlimited
              : t.pricing.slaRevisions.replace("{r}", String(ev.revisions)).replace("{d}", String(ev.revisionDays))}
          </span>
        </div>

        {/* Tier selector — same three formulas for everyone, client's choice. */}
        {!s.quoteOnly && (
          <div
            onClick={(e) => e.stopPropagation()}
            role="group"
            aria-label={tl.formula}
            style={{ display: "inline-flex", alignItems: "center", gap: 4, marginTop: 22, padding: 3, background: "var(--ds-bg-sec)", borderRadius: "var(--r-full)" }}
          >
            {TIER_KEYS.map((tk) => {
              const active = tk === tier
              const recommended = tk === "standard"
              return (
                <button
                  key={tk}
                  type="button"
                  aria-pressed={active}
                  onClick={() => onTier(tk)}
                  style={{
                    position: "relative",
                    border: "none", cursor: "pointer", borderRadius: "var(--r-full)",
                    padding: "4px 12px", fontFamily: "'Outfit', sans-serif",
                    fontSize: 11.5, fontWeight: 700,
                    background: active ? "#000" : "transparent",
                    color: active ? "#fff" : "var(--ds-text-muted)",
                    transition: "background 0.15s, color 0.15s",
                  }}
                >
                  {recommended && (
                    <span style={{
                      position: "absolute", bottom: "calc(100% + 4px)", insetInlineStart: "50%", transform: "translateX(-50%)",
                      display: "inline-flex", alignItems: "center", gap: 3, whiteSpace: "nowrap",
                      padding: "1px 7px", borderRadius: "var(--r-full)",
                      background: "var(--ds-accent)", color: "#fff",
                      fontSize: 9.5, fontWeight: 800, letterSpacing: "0.04em", textTransform: "uppercase",
                    }}>★ {ux.popular}</span>
                  )}
                  {tl[tk]}
                </button>
              )
            })}
          </div>
        )}

        {/* Per-tier advantages — what actually changes between formulas, beyond
            revisions & window. Updates live when the client switches tier. */}
        {!s.quoteOnly && features.length > 0 && (
          <ul style={{ listStyle: "none", margin: "10px 0 0", padding: 0, display: "flex", flexDirection: "column", gap: 5 }}>
            {features.map((f, i) => (
              <li key={i} style={{ display: "flex", alignItems: "center", gap: 7, fontFamily: "'Outfit', sans-serif", fontSize: 12, color: "var(--ds-text-sec)", lineHeight: 1.4 }}>
                <span style={{
                  flexShrink: 0, width: 16, height: 16, borderRadius: "50%",
                  background: tier === "premium" ? "var(--ds-accent)" : "var(--ds-accent-a14)",
                  display: "inline-flex", alignItems: "center", justifyContent: "center",
                }}>
                  <Check size={11} strokeWidth={3} color={tier === "premium" ? "#fff" : "var(--ds-accent-text)"} aria-hidden="true" />
                </span>
                {f}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Price */}
      <div className="tarifs-price-col" style={{ textAlign: "right", flexShrink: 0 }}>
        {s.quoteOnly ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
            <span style={{
              fontFamily: "'Outfit', sans-serif", fontSize: 13, fontWeight: 800,
              color: "var(--ds-accent-text)", letterSpacing: "0.03em", textTransform: "uppercase",
            }}>
              {t.pricing.quoteOnly}
            </span>
            <a
              href="#contact"
              onClick={(e) => { e.preventDefault(); smoothScrollToId("contact") }}
              className="btn-orange"
              style={{
                display: "inline-flex", alignItems: "center", gap: 5,
                fontFamily: "'Outfit', sans-serif", fontSize: 12, fontWeight: 700,
                color: "#fff", borderRadius: "var(--r-full)",
                padding: "5px 14px", textDecoration: "none", whiteSpace: "nowrap",
              }}
            >
              {t.pricing.quoteOnlyCta} →
            </a>
          </div>
        ) : (
          <>
            {showAnchor && (
              <div title={ux.premiumValue} style={{ fontFamily: "'Outfit', sans-serif", fontSize: 11.5, fontWeight: 600, color: "var(--ds-text-faint)", textDecoration: "line-through" }}>
                {fmt(priceFor(premiumPrice))}
              </div>
            )}
            <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 15, fontWeight: 800, color: "var(--ds-text)" }}>
              {s.qty > 1 ? (
                <span style={{ color: "var(--ds-accent-text)" }}>{fmt(priceFor(ev.price) * s.qty)}</span>
              ) : (
                <span>{fmt(priceFor(ev.price))}</span>
              )}
            </div>
            {s.qty > 1 && (
              <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 11, color: "var(--ds-text-muted)" }}>{fmt(priceFor(ev.price))}/{t.pricing.perUnit}</div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
