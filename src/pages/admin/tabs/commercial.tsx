// Commercial: devis & contacts, paiements, avis, documents.
import { useEffect, useMemo, useRef, useState } from "react"
import {
  LayoutDashboard, Inbox, Mail, Settings as SettingsIcon, LogOut,
  Trash2, RefreshCw, Download, ExternalLink, Loader2, ShieldCheck, Wallet,
  Search, TrendingUp, Users, Bell, ArrowUpDown, Phone, X, Copy, Check, Receipt,
  KeyRound, Smartphone, FileText, Tags, Plus, Send,
  Package, Image as ImageIcon, Eye, EyeOff, LayoutGrid, Newspaper, Link2,
  ClipboardList, CalendarClock, Sparkles, Star, MessageSquareQuote,
  GraduationCap, Handshake, Clock, MapPin, AtSign, Globe, MessageCircle, CheckCircle2,
  ChevronDown,
} from "lucide-react"
import { pricingServices, tierValues, TIER_KEYS, type PricingService, type TierKey } from "../../../data/services"
import { albums as portfolioAlbums } from "../../../data/portfolio"
import { serviceProcedures, procedureToText, type ServiceProcedure } from "../../../data/serviceProcedures"
import { loadReminders, saveReminders, newReminderId, kindLabel, downloadICS, ensureNotificationPermission, fireNotification, type Reminder, type ReminderKind } from "../../../lib/reminders"
import { ARTICLES, ARTICLE_SLUG, ARTICLE_IMAGE, type Article } from "../../../components/Blog"
import { LANGS, type Lang } from "../../../i18n/translations"
import { REGIONS, type RegionCode } from "../../../data/regions"
import { registerStepUpVerifier } from "../../../lib/stepup"
import { useAdminAuth } from "../../../hooks/useAdminAuth"
import { useSessionTimeout, ADMIN_SESSION_POLICY } from "../../../hooks/useSessionTimeout"
import { supabase } from "../../../lib/supabaseClient"
import { adminApi, api, type Lead, type LeadItem, type Subscriber, type SiteSettings, type PaymentConfig, type Campaign, type AdminService, type AdminWork, type AdminAlbum, type AdminBlog, type AssistantMessage, type Testimonial, type Formation, type Collaborateur, type Eventualite, type EventualiteInput } from "../../../lib/api"
import { useSettings } from "../../../context/AppSettings"
import logoDark from "../../../imports/logo_pour_fond_noir.webp"
import logoLight from "../../../imports/logo.webp"
import { SITE_URL, EMAIL_LOGO_DARK, NL_LANGS, NL_INTRO, STATUSES, STATUS_LABEL, STATUS_COLOR, PAY_STATUS_LABEL, SORT_LABEL, TIER_FR, shell, card, btn, btnPrimary, input, STYLE, sectionTitle, smallLabel, Stat, Toolbar, Chip, matchLead, sortLeads, downloadCsv, withLocalAmounts, esc, fmtMoney, receiptNo, localMultiplier, svcLineAmount, firstName, replyGreeting, amountLabel, mailtoReply, waReply, waServiceReply, buildReceiptHtml, printReceipt, buildProformaHtml, buildDeliveryHtml, printDoc, ListSkeleton, Field, BriefAttachments, EditField, ProcedureCard, Empty, buildNewsletterHtml, AdminStyle, type SortKey, type SvcLine, type NlArticle } from "../shared"

function LeadsTab({ leads, loading, onChange }: { leads: Lead[]; loading: boolean; onChange: () => void }) {
  const { rates } = useSettings()
  const [open, setOpen] = useState<string | null>(null)
  const [query, setQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<Lead["status"] | "all">("all")
  const [sort, setSort] = useState<SortKey>("recent")

  const view = useMemo(() => {
    let v = leads.filter((l) => matchLead(l, query)).map((l) => withLocalAmounts(l, rates))
    if (statusFilter !== "all") v = v.filter((l) => l.status === statusFilter)
    return sortLeads(v, sort)
  }, [leads, query, statusFilter, sort, rates])

  async function setStatus(id: string, status: Lead["status"]) {
    await adminApi.updateLead(id, { status })
    onChange()
  }
  async function remove(id: string) {
    if (!confirm("Supprimer ce lead définitivement ?")) return
    await adminApi.deleteLead(id)
    onChange()
  }
  function exportCsv() {
    const rows: (string | number)[][] = [
      ["Date", "Statut", "Type", "Nom", "E-mail", "Téléphone", "Total", "Devise", "Budget", "Message"],
      ...view.map((l) => [
        new Date(l.createdAt).toISOString(), STATUS_LABEL[l.status],
        l.source === "quote" ? "Devis" : "Contact", l.name, l.email, l.phone,
        l.total ?? "", l.currency, l.budget, (l.message ?? "").replace(/\n/g, " "),
      ]),
    ]
    downloadCsv("leads-inov.csv", rows)
  }

  if (loading && leads.length === 0) return <ListSkeleton />

  return (
    <>
      <Toolbar
        query={query} setQuery={setQuery}
        statuses={STATUSES} statusLabels={STATUS_LABEL} statusColors={STATUS_COLOR}
        statusFilter={statusFilter} setStatusFilter={setStatusFilter}
        sort={sort} setSort={setSort} onExport={exportCsv} count={view.length}
      />
      {view.length === 0 ? (
        <Empty text={query || statusFilter !== "all" ? "Aucun résultat pour ce filtre." : "Aucun devis ni message pour l'instant."} />
      ) : (
        <div style={{ ...card, padding: 0, overflow: "hidden" }}>
          {view.map((l) => (
            <div key={l.id} style={{ borderBottom: "1px solid var(--ds-border)" }}>
              <div className="adm-row" style={{ display: "grid", gridTemplateColumns: "auto 1fr auto auto", alignItems: "center", gap: 14, padding: "14px 18px", cursor: "pointer" }}
                onClick={() => setOpen(open === l.id ? null : l.id)}>
                <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 9px", borderRadius: "var(--r-xl)", color: "#fff", background: STATUS_COLOR[l.status], whiteSpace: "nowrap" }}>
                  {STATUS_LABEL[l.status]}
                </span>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 15, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {l.name || l.email || "Sans nom"}
                    <span style={{ marginLeft: 8, fontSize: 11, fontWeight: 700, color: "var(--ds-text-faint)", textTransform: "uppercase" }}>
                      {l.source === "quote" ? "Devis" : "Contact"}
                    </span>
                  </div>
                  <div style={{ fontSize: 12.5, color: "var(--ds-text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {l.email}{l.phone ? ` · ${l.phone}` : ""}
                  </div>
                </div>
                <div style={{ textAlign: "right", fontSize: 13 }}>
                  {typeof l.total === "number" && (
                    <div style={{ fontWeight: 800, color: "var(--ds-accent)" }}>{l.total.toLocaleString("en-US")} {l.currency}</div>
                  )}
                  <div style={{ fontSize: 11.5, color: "var(--ds-text-faint)" }}>{new Date(l.createdAt).toLocaleDateString("fr-FR")}</div>
                </div>
                <span style={{ color: "var(--ds-text-faint)", fontSize: 12 }}>{open === l.id ? "▲" : "▼"}</span>
              </div>

              {open === l.id && (
                <div style={{ padding: "0 18px 18px 18px", display: "grid", gap: 14 }}>
                  {l.items.length > 0 && (
                    <div style={{ background: "var(--ds-bg-sec)", borderRadius: "var(--r-md)", padding: 12 }}>
                      {l.items.map((it, i) => (
                        <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: 13.5, padding: "3px 0" }}>
                          <span>{it.name}{it.tier ? ` (${it.tier})` : ""} ×{it.qty}</span>
                          <span style={{ fontWeight: 600 }}>{it.price.toLocaleString("fr-FR")} {l.currency}</span>
                        </div>
                      ))}
                      {typeof l.deposit === "number" && (
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, paddingTop: 8, marginTop: 6, borderTop: "1px solid var(--ds-border)", color: "var(--ds-text-muted)" }}>
                          <span>Acompte</span><span>{l.deposit.toLocaleString("en-US")} {l.currency}</span>
                        </div>
                      )}
                    </div>
                  )}
                  {l.budget && <Field label="Budget" value={l.budget} />}
                  {l.message && <Field label="Message" value={l.message} />}
                  <BriefAttachments meta={l.meta} leadId={l.id} onChange={onChange} />
                  <div style={{ display: "flex", gap: 12, fontSize: 12, color: "var(--ds-text-faint)", flexWrap: "wrap" }}>
                    {l.lang && <span>Langue : {l.lang.toUpperCase()}</span>}
                    {l.region && <span>Région : {l.region}</span>}
                    <span>{new Date(l.createdAt).toLocaleString("fr-FR")}</span>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 12.5, color: "var(--ds-text-muted)", fontWeight: 600 }}>Statut :</span>
                    {STATUSES.map((s) => (
                      <button key={s} onClick={() => setStatus(l.id, s)}
                        style={{ ...btn, padding: "5px 11px", fontSize: 12.5, ...(l.status === s ? { borderColor: STATUS_COLOR[s], color: STATUS_COLOR[s] } : {}) }}>
                        {STATUS_LABEL[s]}
                      </button>
                    ))}
                    {l.email && (
                      <a href={`mailto:${l.email}`} style={{ ...btn, padding: "5px 11px", fontSize: 12.5, textDecoration: "none" }}>
                        <Mail size={13} /> Répondre
                      </a>
                    )}
                    {l.phone && (
                      <a href={waServiceReply(l)} target="_blank" rel="noreferrer" title="Ouvre WhatsApp avec un message pré-rempli selon le service demandé" style={{ ...btn, padding: "5px 11px", fontSize: 12.5, textDecoration: "none" }}>
                        <Phone size={13} /> WhatsApp
                      </a>
                    )}
                    <button onClick={() => printReceipt(l)} style={{ ...btn, padding: "5px 11px", fontSize: 12.5 }}>
                      <Receipt size={13} /> Reçu
                    </button>
                    <button onClick={() => remove(l.id)} style={{ ...btn, padding: "5px 11px", fontSize: 12.5, marginLeft: "auto", color: "var(--ds-danger)", borderColor: "var(--ds-danger-a40)" }}>
                      <Trash2 size={13} /> Supprimer
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </>
  )
}


// Éditeur des coordonnées de paiement (MonCash/NatCash/BUH/Upwork/WhatsApp).
// Ces valeurs NE SONT PLUS codées dans le dépôt : elles vivent dans les réglages
// (KV) et sont servies à la page /payer via GET /settings → settings.payments.
// (À défaut, le serveur retombe sur les secrets Supabase PAY_*.)
const EMPTY_PAYMENTS: PaymentConfig = {
  moncash: { number: "", holder: "" },
  natcash: { number: "", holder: "" },
  buh: { bank: "", account: "", holder: "", type: "" },
  upwork: { email: "" },
  whatsapp: "",
}

function PaymentCoordsCard() {
  const [settings, setSettings] = useState<SiteSettings | null>(null)
  const [p, setP] = useState<PaymentConfig>(EMPTY_PAYMENTS)
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [err, setErr] = useState("")

  useEffect(() => {
    adminApi.getSettings()
      .then((r) => {
        setSettings(r.settings)
        setP({ ...EMPTY_PAYMENTS, ...(r.settings.payments ?? {}) })
      })
      .catch(() => setErr("Impossible de charger les réglages."))
  }, [])

  async function save() {
    if (!settings) return
    setSaving(true); setErr("")
    try {
      // On renvoie l'objet settings COMPLET (le serveur reconstruit tout) : on
      // ne touche qu'à `payments` pour ne rien écraser d'autre.
      const next: SiteSettings = { ...settings, payments: p }
      const r = await adminApi.saveSettings(next)
      setSettings(r.settings)
      setP({ ...EMPTY_PAYMENTS, ...(r.settings.payments ?? {}) })
      setSaved(true); setTimeout(() => setSaved(false), 2000)
    } catch {
      setErr("Échec de l'enregistrement. Réessayez.")
    } finally {
      setSaving(false)
    }
  }

  const F = ({ label, value, onChange, ph }: { label: string; value: string; onChange: (v: string) => void; ph?: string }) => (
    <label style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      <span style={smallLabel}>{label}</span>
      <input style={input} value={value} placeholder={ph} onChange={(e) => onChange(e.target.value)} />
    </label>
  )

  return (
    <div style={{ ...card, marginBottom: 16 }}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", background: "none", border: "none", cursor: "pointer", padding: 0, textAlign: "start" }}
      >
        <Wallet size={16} />
        <span style={{ ...sectionTitle, margin: 0 }}>Coordonnées de paiement</span>
        <ExternalLink size={0} />
        <span style={{ marginInlineStart: "auto", color: "var(--ds-text-faint)", transform: open ? "rotate(180deg)" : "none", transition: "transform .2s" }}>▾</span>
      </button>
      <p style={{ ...smallLabel, marginTop: 8 }}>
        Ces coordonnées s'affichent sur la page de paiement du site. Elles sont stockées ici
        (hors du code) — modifiez-les à tout moment sans redéployer.
      </p>

      {open && (
        <div style={{ display: "grid", gap: 16, marginTop: 12 }}>
          <fieldset style={fs}>
            <legend style={lg}>MonCash</legend>
            <div style={grid2}>
              <F label="Numéro" value={p.moncash.number} ph="+509 …" onChange={(v) => setP((s) => ({ ...s, moncash: { ...s.moncash, number: v } }))} />
              <F label="Titulaire" value={p.moncash.holder} onChange={(v) => setP((s) => ({ ...s, moncash: { ...s.moncash, holder: v } }))} />
            </div>
          </fieldset>
          <fieldset style={fs}>
            <legend style={lg}>NatCash</legend>
            <div style={grid2}>
              <F label="Numéro" value={p.natcash.number} ph="+509 …" onChange={(v) => setP((s) => ({ ...s, natcash: { ...s.natcash, number: v } }))} />
              <F label="Titulaire" value={p.natcash.holder} onChange={(v) => setP((s) => ({ ...s, natcash: { ...s.natcash, holder: v } }))} />
            </div>
          </fieldset>
          <fieldset style={fs}>
            <legend style={lg}>Virement bancaire (BUH)</legend>
            <div style={grid2}>
              <F label="Banque" value={p.buh.bank} ph="Banque de l'Union Haïtienne (BUH)" onChange={(v) => setP((s) => ({ ...s, buh: { ...s.buh, bank: v } }))} />
              <F label="N° de compte" value={p.buh.account} onChange={(v) => setP((s) => ({ ...s, buh: { ...s.buh, account: v } }))} />
              <F label="Titulaire" value={p.buh.holder} onChange={(v) => setP((s) => ({ ...s, buh: { ...s.buh, holder: v } }))} />
              <F label="Type de compte" value={p.buh.type} ph="Épargne · USD" onChange={(v) => setP((s) => ({ ...s, buh: { ...s.buh, type: v } }))} />
            </div>
          </fieldset>
          <fieldset style={fs}>
            <legend style={lg}>Autres</legend>
            <div style={grid2}>
              <F label="E-mail Upwork" value={p.upwork.email} onChange={(v) => setP((s) => ({ ...s, upwork: { email: v } }))} />
              <F label="WhatsApp (chiffres uniquement)" value={p.whatsapp} ph="50936255920" onChange={(v) => setP((s) => ({ ...s, whatsapp: v }))} />
            </div>
          </fieldset>

          {err && <p style={{ color: "var(--ds-danger)", fontSize: 13, margin: 0 }}>{err}</p>}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button type="button" onClick={save} disabled={saving || !settings} style={{ ...btnPrimary, opacity: saving || !settings ? 0.7 : 1 }}>
              {saving ? <Loader2 size={14} className="spin" /> : <ShieldCheck size={14} />} Enregistrer
            </button>
            {saved && <span style={{ color: "var(--ds-accent)", fontSize: 13, fontWeight: 700 }}>Enregistré ✓</span>}
          </div>
        </div>
      )}
    </div>
  )
}
const fs: React.CSSProperties = { border: "1px solid var(--ds-border)", borderRadius: 10, padding: "10px 14px 14px", margin: 0 }
const lg: React.CSSProperties = { fontSize: 12, fontWeight: 800, color: "var(--ds-text-sec)", padding: "0 6px" }
const grid2: React.CSSProperties = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }

function PaymentsTab({ leads, loading, onChange }: { leads: Lead[]; loading: boolean; onChange: () => void }) {
  const [open, setOpen] = useState<string | null>(null)
  const [query, setQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<Lead["status"] | "all">("all")
  const [sort, setSort] = useState<SortKey>("recent")
  const [copied, setCopied] = useState<string | null>(null)
  const [sendingId, setSendingId] = useState<string | null>(null)
  const [notice, setNotice] = useState<{ id: string; ok: boolean; text: string } | null>(null)

  const view = useMemo(() => {
    let v = leads.filter((l) => matchLead(l, query))
    if (statusFilter !== "all") v = v.filter((l) => l.status === statusFilter)
    return sortLeads(v, sort)
  }, [leads, query, statusFilter, sort])

  function flash(id: string, ok: boolean, text: string) {
    setNotice({ id, ok, text })
    setTimeout(() => setNotice((n) => (n && n.id === id ? null : n)), 6000)
  }

  async function setStatus(id: string, status: Lead["status"]) {
    const res = await adminApi.updateLead(id, { status })
    // The server auto-emails the receipt when a payment is validated (→ Payé).
    if (status === "won" && res.receipt) {
      if (res.receipt.sent) flash(id, true, "Reçu envoyé au client par email ✓")
      else if (res.receipt.error) flash(id, false, `Reçu non envoyé : ${res.receipt.error}`)
    }
    onChange()
  }

  async function sendReceipt(l: Lead) {
    if (!l.email) { flash(l.id, false, "Ce client n'a pas d'adresse email."); return }
    // Objet auto-généré, modifiable avant envoi.
    const first = firstName(l)
    const autoSubject = `Merci ${first ? first + " " : ""}! Voici votre reçu ${receiptNo(l)}`
    const subject = window.prompt("Objet de l'e-mail (généré automatiquement — modifiez-le si vous voulez) :", autoSubject)
    if (subject === null) return // annulé
    setSendingId(l.id)
    try {
      const res = await adminApi.sendReceipt(l.id, subject.trim())
      flash(l.id, true, `Reçu envoyé à ${res.sentTo} ✓`)
      onChange()
    } catch (e) {
      flash(l.id, false, `Échec de l'envoi : ${e instanceof Error ? e.message : String(e)}`)
    } finally {
      setSendingId(null)
    }
  }
  async function remove(id: string) {
    if (!confirm("Supprimer ce paiement définitivement ?")) return
    await adminApi.deleteLead(id)
    onChange()
  }
  function copyRef(ref: string, id: string) {
    try { navigator.clipboard?.writeText(ref); setCopied(id); setTimeout(() => setCopied(null), 1500) } catch { /* ignore */ }
  }
  function exportCsv() {
    const rows: (string | number)[][] = [
      ["Date", "Statut", "Moyen", "Nom", "E-mail", "Téléphone", "Référence", "Total", "Devise", "Services"],
      ...view.map((l) => {
        const meta = (l.meta ?? {}) as Record<string, unknown>
        const services = Array.isArray(meta.services)
          ? (meta.services as { name: string; qty: number }[]).map((s) => `${s.name} x${s.qty}`).join(" | ")
          : ""
        return [
          new Date(l.createdAt).toISOString(), PAY_STATUS_LABEL[l.status],
          (meta.paymentMethodLabel as string) || (meta.paymentMethod as string) || "",
          l.name, l.email, l.phone, (meta.reference as string) || "", l.total ?? "", l.currency, services,
        ]
      }),
    ]
    downloadCsv("paiements-inov.csv", rows)
  }

  if (loading && leads.length === 0) return <ListSkeleton />

  return (
    <>
      <PaymentCoordsCard />
      <Toolbar
        query={query} setQuery={setQuery}
        statuses={STATUSES} statusLabels={PAY_STATUS_LABEL} statusColors={STATUS_COLOR}
        statusFilter={statusFilter} setStatusFilter={setStatusFilter}
        sort={sort} setSort={setSort} onExport={exportCsv} count={view.length}
      />
      {view.length === 0 ? (
        <Empty text={query || statusFilter !== "all" ? "Aucun résultat pour ce filtre." : "Aucun paiement ni demande carte pour l'instant."} />
      ) : (
        <div style={{ ...card, padding: 0, overflow: "hidden" }}>
          {view.map((l) => {
            const meta = (l.meta ?? {}) as Record<string, unknown>
            const methodLabel = (meta.paymentMethodLabel as string) || (meta.paymentMethod as string) || "—"
            const reference = (meta.reference as string) || ""
            // Upwork = client requests a card contract link (not yet paid); the rest
            // are declared payments awaiting our verification.
            const isUpwork = l.source === "upwork_request"
            const services = Array.isArray(meta.services)
              ? (meta.services as SvcLine[])
              : []
            const rate = typeof meta.rate === "number" ? (meta.rate as number) : null
            const mult = localMultiplier(services, l.total, rate)
            return (
              <div key={l.id} style={{ borderBottom: "1px solid var(--ds-border)" }}>
                <div className="adm-row" style={{ display: "grid", gridTemplateColumns: "auto 1fr auto auto", alignItems: "center", gap: 14, padding: "14px 18px", cursor: "pointer" }}
                  onClick={() => setOpen(open === l.id ? null : l.id)}>
                  <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 9px", borderRadius: "var(--r-xl)", color: "#fff", background: STATUS_COLOR[l.status], whiteSpace: "nowrap" }}>
                    {PAY_STATUS_LABEL[l.status]}
                  </span>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 15, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {l.name || l.email || "Sans nom"}
                      <span style={{ marginLeft: 8, fontSize: 11, fontWeight: 700, color: "var(--ds-accent)", textTransform: "uppercase" }}>{methodLabel}</span>
                      {isUpwork && (
                        <span style={{ marginLeft: 8, fontSize: 10.5, fontWeight: 700, padding: "2px 8px", borderRadius: "var(--r-xl)", background: "var(--ds-accent-a12)", color: "var(--ds-accent)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                          Demande carte · lien à envoyer
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: 12.5, color: "var(--ds-text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {l.email || "—"}{reference ? ` · réf. ${reference}` : ""}
                    </div>
                  </div>
                  <div style={{ textAlign: "right", fontSize: 13 }}>
                    {typeof l.total === "number" && (
                      <div style={{ fontWeight: 800, color: "var(--ds-accent)" }}>{l.total.toLocaleString("en-US")} {l.currency}</div>
                    )}
                    <div style={{ fontSize: 11.5, color: "var(--ds-text-faint)" }}>{new Date(l.createdAt).toLocaleDateString("fr-FR")}</div>
                  </div>
                  <span style={{ color: "var(--ds-text-faint)", fontSize: 12 }}>{open === l.id ? "▲" : "▼"}</span>
                </div>

                {open === l.id && (
                  <div style={{ padding: "0 18px 18px 18px", display: "grid", gap: 14 }}>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px,1fr))", gap: 10 }}>
                      <Field label="Moyen" value={methodLabel} />
                      {reference && (
                        <div>
                          <div style={{ fontSize: 11.5, fontWeight: 700, color: "var(--ds-text-faint)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Référence</div>
                          <button onClick={() => copyRef(reference, l.id)} style={{ ...btn, marginTop: 4, padding: "5px 10px", fontSize: 13 }}>
                            {copied === l.id ? <Check size={13} style={{ color: "var(--ds-success)" }} /> : <Copy size={13} />} {reference}
                          </button>
                        </div>
                      )}
                      {l.phone && <Field label="Téléphone" value={l.phone} />}
                    </div>
                    {services.length > 0 && (
                      <div style={{ background: "var(--ds-bg-sec)", borderRadius: "var(--r-md)", padding: 12 }}>
                        <div style={{ fontSize: 11.5, fontWeight: 700, color: "var(--ds-text-faint)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>Services choisis</div>
                        {services.map((s, i) => (
                          <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: 13.5, padding: "3px 0" }}>
                            <span>{s.name} ×{s.qty}</span>
                            <span style={{ fontWeight: 600 }}>{svcLineAmount(s, l.currency, mult)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    {l.message && <Field label="Note" value={l.message} />}
                    <div style={{ display: "flex", gap: 12, fontSize: 12, color: "var(--ds-text-faint)", flexWrap: "wrap" }}>
                      {l.lang && <span>Langue : {l.lang.toUpperCase()}</span>}
                      {l.region && <span>Région : {l.region}</span>}
                      <span>{new Date(l.createdAt).toLocaleString("fr-FR")}</span>
                    </div>

                    {l.status !== "won" && (
                      <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", padding: "12px 14px", borderRadius: "var(--r-md)", background: "var(--ds-success-a12, rgba(34,197,94,0.10))", border: "1px solid var(--ds-success-a40, rgba(34,197,94,0.35))" }}>
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <div style={{ fontSize: 13.5, fontWeight: 800, color: "var(--ds-success, #22C55E)" }}>Argent bien reçu&nbsp;?</div>
                          <div style={{ fontSize: 12, color: "var(--ds-text-muted)" }}>
                            Confirme le paiement pour marquer « Payé »{l.email ? " et envoyer le reçu au client par email." : "."}
                          </div>
                        </div>
                        <button onClick={() => setStatus(l.id, "won")} disabled={sendingId === l.id}
                          style={{ display: "inline-flex", alignItems: "center", gap: 8, cursor: "pointer", border: "none", borderRadius: "var(--r-md)", padding: "9px 16px", fontSize: 13.5, fontWeight: 800, fontFamily: "inherit", color: "#fff", background: "var(--ds-success, #22C55E)", whiteSpace: "nowrap" }}>
                          <Check size={15} /> J'ai reçu l'argent
                        </button>
                      </div>
                    )}

                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 12.5, color: "var(--ds-text-muted)", fontWeight: 600 }}>Statut :</span>
                      {(Object.keys(PAY_STATUS_LABEL) as Lead["status"][]).map((s) => (
                        <button key={s} onClick={() => setStatus(l.id, s)}
                          style={{ ...btn, padding: "5px 11px", fontSize: 12.5, ...(l.status === s ? { borderColor: STATUS_COLOR[s], color: STATUS_COLOR[s] } : {}) }}>
                          {PAY_STATUS_LABEL[s]}
                        </button>
                      ))}
                      {l.email && (
                        <a href={mailtoReply(l)} style={{ ...btn, padding: "5px 11px", fontSize: 12.5, textDecoration: "none" }}>
                          <Mail size={13} /> Répondre
                        </a>
                      )}
                      {l.phone && (
                        <a href={waReply(l)} target="_blank" rel="noreferrer" style={{ ...btn, padding: "5px 11px", fontSize: 12.5, textDecoration: "none" }}>
                          <Phone size={13} /> WhatsApp
                        </a>
                      )}
                      <button onClick={() => printReceipt(l)} style={{ ...btn, padding: "5px 11px", fontSize: 12.5 }}>
                        <Receipt size={13} /> Aperçu / PDF
                      </button>
                      <button onClick={() => sendReceipt(l)} disabled={sendingId === l.id || !l.email}
                        style={{ ...btnPrimary, padding: "5px 11px", fontSize: 12.5, opacity: sendingId === l.id || !l.email ? 0.6 : 1 }}>
                        {sendingId === l.id ? <Loader2 size={13} className="spin" /> : <Mail size={13} />}
                        {l.meta?.receiptSentAt ? "Renvoyer le reçu" : "Envoyer le reçu"}
                      </button>
                      <button onClick={() => remove(l.id)} style={{ ...btn, padding: "5px 11px", fontSize: 12.5, marginLeft: "auto", color: "var(--ds-danger)", borderColor: "var(--ds-danger-a40)" }}>
                        <Trash2 size={13} /> Supprimer
                      </button>
                    </div>
                    {notice && notice.id === l.id && (
                      <div style={{ marginTop: 4, fontSize: 12.5, fontWeight: 600, color: notice.ok ? "var(--ds-success, #22C55E)" : "var(--ds-danger)" }}>
                        {notice.text}
                      </div>
                    )}
                    {Boolean(l.meta?.receiptSentAt) && (
                      <div style={{ fontSize: 11.5, color: "var(--ds-text-faint)" }}>
                        Reçu envoyé le {new Date(l.meta.receiptSentAt as string).toLocaleString("fr-FR")}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </>
  )
}

// ── Newsletter tab ────────────────────────────────────────────────────────────

function ReviewsTab({ reviews, loading, onChange }: { reviews: Testimonial[]; loading: boolean; onChange: () => void }) {
  const [busy, setBusy] = useState<string | null>(null)
  const pending = useMemo(() => reviews.filter((r) => r.status === "pending"), [reviews])
  const approved = useMemo(() => reviews.filter((r) => r.status === "approved"), [reviews])

  async function approve(id: string) {
    setBusy(id)
    try { await adminApi.approveTestimonial(id); onChange() }
    catch (e) { console.error(e) }
    finally { setBusy(null) }
  }
  async function remove(id: string) {
    if (!confirm("Supprimer cet avis ? Cette action est définitive.")) return
    setBusy(id)
    try { await adminApi.deleteTestimonial(id); onChange() }
    catch (e) { console.error(e) }
    finally { setBusy(null) }
  }

  if (loading && reviews.length === 0) return <ListSkeleton />

  const Row = ({ r }: { r: Testimonial }) => (
    <div className="adm-row" style={{ display: "flex", alignItems: "flex-start", gap: 14, padding: "14px 18px", borderBottom: "1px solid var(--ds-border)" }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 4 }}>
          <span style={{ fontWeight: 700, fontSize: 14.5 }}>{r.name}</span>
          {(r.role || r.company) && <span style={{ fontSize: 12.5, color: "var(--ds-text-muted)" }}>· {r.role || r.company}</span>}
          <span style={{ display: "inline-flex", gap: 1 }}>
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} size={13} color="var(--ds-accent)" fill={i < r.stars ? "var(--ds-accent)" : "none"} strokeWidth={i < r.stars ? 0 : 1.5} style={{ opacity: i < r.stars ? 1 : 0.35 }} />
            ))}
          </span>
        </div>
        <p style={{ margin: "0 0 6px", fontSize: 14, color: "var(--ds-text-sec)", lineHeight: 1.6 }}>{r.text}</p>
        <div style={{ fontSize: 11.5, color: "var(--ds-text-faint)" }}>
          {(r.lang ? r.lang.toUpperCase() + " · " : "")}{new Date(r.createdAt).toLocaleString("fr-FR")}
        </div>
      </div>
      <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
        {r.status === "pending" && (
          <button onClick={() => approve(r.id)} disabled={busy === r.id} style={{ ...btn, padding: "6px 12px", color: "var(--ds-accent-text)", borderColor: "var(--ds-accent-a45)" }}>
            <Check size={14} /> Approuver
          </button>
        )}
        <button onClick={() => remove(r.id)} disabled={busy === r.id} aria-label="Supprimer l'avis" style={{ ...btn, padding: "6px 10px", color: "var(--ds-danger)", borderColor: "var(--ds-danger-a40)" }}>
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  )

  return (
    <div style={{ display: "grid", gap: 18 }}>
      <div style={{ ...card, padding: 0, overflow: "hidden" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "13px 18px", borderBottom: "1px solid var(--ds-border)" }}>
          <Bell size={16} color="var(--ds-accent)" />
          <span style={{ fontWeight: 800, fontSize: 14.5 }}>En attente de validation</span>
          <span style={{ marginLeft: "auto", fontSize: 12.5, color: "var(--ds-text-faint)", fontWeight: 600 }}>{pending.length}</span>
        </div>
        {pending.length === 0
          ? <div style={{ padding: 34, textAlign: "center", color: "var(--ds-text-muted)" }}>Aucun avis en attente.</div>
          : pending.map((r) => <Row key={r.id} r={r} />)}
      </div>

      <div style={{ ...card, padding: 0, overflow: "hidden" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "13px 18px", borderBottom: "1px solid var(--ds-border)" }}>
          <Check size={16} color="var(--ds-accent)" />
          <span style={{ fontWeight: 800, fontSize: 14.5 }}>Avis publiés</span>
          <span style={{ marginLeft: "auto", fontSize: 12.5, color: "var(--ds-text-faint)", fontWeight: 600 }}>{approved.length}</span>
        </div>
        {approved.length === 0
          ? <div style={{ padding: 34, textAlign: "center", color: "var(--ds-text-muted)" }}>Aucun avis publié pour l'instant.</div>
          : approved.map((r) => <Row key={r.id} r={r} />)}
      </div>
    </div>
  )
}

// ── Formation tab: manage the training catalogue + track enrollments ──────────
const emptyFormation: Formation = {
  id: "", published: false, title: "", summary: "", description: "",
  level: "debutant", format: "en-ligne", durationHours: 0, free: true, price: 0,
  image: "", instructor: "", startDate: "", seats: 0, syllabus: [], order: 0,
  type: "cours", liveUrl: "", replayUrl: "", resourcesUrl: "",
  startDateTime: "", endDateTime: "", isLive: false, recordingDate: "", tags: [],
}
const FMT_LEVEL: Record<Formation["level"], string> = { debutant: "Débutant", intermediaire: "Intermédiaire", avance: "Avancé" }
const FMT_FORMAT: Record<Formation["format"], string> = { "en-ligne": "En ligne", presentiel: "Présentiel", hybride: "Hybride" }
const FMT_TYPE: Record<NonNullable<Formation["type"]>, string> = { cours: "Cours", live: "Live", conference: "Conférence", replay: "Replay / Enregistrement" }
const TYPE_COLOR: Record<NonNullable<Formation["type"]>, string> = { cours: "#1D4ED8", live: "#DC2626", conference: "#7C3AED", replay: "#059669" }


type DocLine = { sid: number; tier: TierKey; qty: number }

function DocumentsTab({ leads, onChange }: { leads: Lead[]; onChange: () => void }) {
  const [overrides, setOverrides] = useState<Record<string, number>>({})
  const [docType, setDocType] = useState<"proforma" | "receipt" | "delivery">("proforma")
  const [clientMode, setClientMode] = useState<"existing" | "new">("existing")
  const [leadId, setLeadId] = useState("")
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [lines, setLines] = useState<DocLine[]>([])
  const [payMethod, setPayMethod] = useState("MonCash")
  const [reference, setReference] = useState("")
  const [deliveryRef, setDeliveryRef] = useState("")
  const [busy, setBusy] = useState<"" | "dl" | "send">("")
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)

  useEffect(() => {
    adminApi.getSettings().then((r) => setOverrides(r.settings.pricing ?? {})).catch(() => {})
  }, [])

  const svc = (id: number): PricingService | undefined => pricingServices.find((s) => s.id === id)
  const basePrice = (s: PricingService) => (typeof overrides[s.id] === "number" ? overrides[s.id] : s.price)
  const selectable = pricingServices.filter((s) => !s.quoteOnly && basePrice(s) > 0)

  const items: LeadItem[] = lines
    .filter((li) => li.qty > 0 && svc(li.sid))
    .map((li) => {
      const s = svc(li.sid)!
      const price = tierValues({ ...s, price: basePrice(s) }, li.tier).price
      return { name: s.name, tier: TIER_FR[li.tier], qty: li.qty, price }
    })

  const total = items.reduce((sum, it) => sum + it.price * it.qty, 0)
  const deposit: number | null =
    docType === "proforma" ? Math.round(total * 0.7) : docType === "receipt" ? total : null
  // Longest revision window across the selected lines (for the delivery note).
  const revisionDays = lines.reduce((max, li) => {
    const s = svc(li.sid)
    return s ? Math.max(max, tierValues({ ...s, price: basePrice(s) }, li.tier).revisionDays) : max
  }, 0)

  function pickLead(id: string) {
    setLeadId(id)
    const l = leads.find((x) => x.id === id)
    if (l) { setName(l.name || ""); setEmail(l.email || ""); setPhone(l.phone || "") }
  }

  function buildLead(): Lead {
    const source = docType === "receipt" ? "payment" : docType
    const meta: Record<string, unknown> =
      docType === "receipt" ? { paymentMethodLabel: payMethod, reference }
      : docType === "delivery" ? { deliveryRef, revisionDays }
      : {}
    return {
      id: "preview", createdAt: new Date().toISOString(),
      status: docType === "proforma" ? "new" : "won",
      source,
      name, email, phone, lang: "fr", currency: "USD", region: "",
      total, deposit,
      items, budget: "", message: "",
      meta,
    }
  }

  const autoMessage =
    docType === "proforma"
      ? `Bonjour ${name || "…"}, voici votre facture proforma d'un montant de ${fmtMoney(total, "USD")}. Un acompte de 70% (${fmtMoney(deposit, "USD")}) est requis pour démarrer. Cette proforma n'est pas un reçu : le reçu officiel vous sera émis après confirmation du paiement.`
    : docType === "receipt"
      ? `Bonjour ${name || "…"}, voici votre reçu officiel confirmant le paiement de ${fmtMoney(total, "USD")} via ${payMethod}${reference ? ` (réf. ${reference})` : ""}. Merci de votre confiance.`
      : `Bonjour ${name || "…"}, votre commande est livrée ! Voici votre bon de livraison.${revisionDays > 0 ? ` Les révisions incluses peuvent être demandées sous ${revisionDays} jour(s).` : ""} Merci de vérifier les livrables.`

  const canGenerate = name.trim() !== "" && items.length > 0
  const canSend = canGenerate && /\S+@\S+\.\S+/.test(email)

  function download() {
    if (!canGenerate) return
    setBusy("dl")
    const l = buildLead()
    if (docType === "proforma") printDoc(buildProformaHtml(l))
    else if (docType === "receipt") printReceipt(l)
    else printDoc(buildDeliveryHtml(l))
    setBusy("")
  }

  async function send() {
    if (!canSend) return
    setBusy("send"); setMsg(null)
    try {
      if (docType === "proforma") {
        const l = buildLead()
        await api.requestProforma({
          name, email, lang: "fr", currency: "USD", region: "",
          proformaNo: `PF-${new Date().toISOString().slice(2, 10).replace(/-/g, "")}`,
          total, deposit: deposit ?? 0, items, html: buildProformaHtml(l),
        })
      } else if (docType === "receipt") {
        const res = await api.submitLead({
          source: "payment", name, email, phone, lang: "fr", currency: "USD",
          total, deposit, items, meta: { paymentMethodLabel: payMethod, reference },
        })
        if (!res?.id) throw new Error("lead_create_failed")
        const patch = await adminApi.updateLead(res.id, { status: "won" })
        if (patch.receipt?.error) throw new Error(patch.receipt.error)
      } else {
        const l = buildLead()
        await adminApi.sendDelivery({
          name, email, currency: "USD",
          deliveryNo: `BL-${new Date().toISOString().slice(2, 10).replace(/-/g, "")}`,
          total, items, html: buildDeliveryHtml(l), meta: { deliveryRef, revisionDays },
        })
      }
      setMsg({ ok: true, text: `Document envoyé à ${email}.` })
      onChange()
    } catch (e) {
      setMsg({ ok: false, text: "Échec de l'envoi. Réessayez." })
    } finally { setBusy("") }
  }

  const seg = (active: boolean): React.CSSProperties => ({
    flex: 1, textAlign: "center", padding: "10px 14px", cursor: "pointer",
    borderRadius: "var(--r-md)", fontSize: 14, fontWeight: 700, border: "none", fontFamily: "inherit",
    background: active ? "var(--ds-accent-a12)" : "transparent",
    color: active ? "var(--ds-accent-text)" : "var(--ds-text-sec)",
    boxShadow: active ? "inset 0 0 0 1.5px var(--ds-accent)" : "inset 0 0 0 1px var(--ds-border)",
  })
  const lbl: React.CSSProperties = { fontSize: 13, fontWeight: 600, color: "var(--ds-text-sec)", marginBottom: 6, display: "block" }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) 300px", gap: 18, alignItems: "start" }} className="adm-doc-grid">
      {/* Builder */}
      <div style={{ ...card, display: "flex", flexDirection: "column", gap: 18 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, fontFamily: "var(--font-space), sans-serif" }}>Générer un document</h2>
          <p style={{ margin: "6px 0 0", fontSize: 13.5, color: "var(--ds-text-muted)", lineHeight: 1.5 }}>
            Composez une proforma ou un reçu à partir des services et formules, puis téléchargez-le ou envoyez-le au client.
          </p>
        </div>

        {/* Type */}
        <div style={{ display: "flex", gap: 8 }}>
          <button style={seg(docType === "proforma")} onClick={() => setDocType("proforma")}><FileText size={15} style={{ verticalAlign: "-2px", marginRight: 6 }} />Proforma</button>
          <button style={seg(docType === "receipt")} onClick={() => setDocType("receipt")}><Receipt size={15} style={{ verticalAlign: "-2px", marginRight: 6 }} />Reçu</button>
          <button style={seg(docType === "delivery")} onClick={() => setDocType("delivery")}><Send size={15} style={{ verticalAlign: "-2px", marginRight: 6 }} />Livraison</button>
        </div>

        {/* Client */}
        <div>
          <span style={lbl}>Client</span>
          <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
            <button style={seg(clientMode === "existing")} onClick={() => setClientMode("existing")}>Depuis la base</button>
            <button style={seg(clientMode === "new")} onClick={() => { setClientMode("new"); setLeadId("") }}>Nouveau</button>
          </div>
          {clientMode === "existing" && (
            <select style={{ ...input, marginBottom: 10 }} value={leadId} onChange={(e) => pickLead(e.target.value)}>
              <option value="">— Choisir un contact —</option>
              {leads.map((l) => (
                <option key={l.id} value={l.id}>{l.name || "Sans nom"}{l.email ? ` · ${l.email}` : ""}</option>
              ))}
            </select>
          )}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <input style={input} placeholder="Nom du client" value={name} onChange={(e) => setName(e.target.value)} />
            <input style={input} placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
        </div>

        {/* Lines */}
        <div>
          <span style={lbl}>Services</span>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {lines.map((li, i) => (
              <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 130px 66px 32px", gap: 8, alignItems: "center" }}>
                <select style={{ ...input, padding: "9px 12px" }} value={li.sid}
                  onChange={(e) => setLines((p) => p.map((x, j) => j === i ? { ...x, sid: Number(e.target.value) } : x))}>
                  {selectable.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
                <select style={{ ...input, padding: "9px 12px" }} value={li.tier}
                  onChange={(e) => setLines((p) => p.map((x, j) => j === i ? { ...x, tier: e.target.value as TierKey } : x))}>
                  {TIER_KEYS.map((tk) => <option key={tk} value={tk}>{TIER_FR[tk]}</option>)}
                </select>
                <input type="number" min={1} style={{ ...input, padding: "9px 10px", textAlign: "center" }} value={li.qty}
                  onChange={(e) => setLines((p) => p.map((x, j) => j === i ? { ...x, qty: Math.max(1, Number(e.target.value) || 1) } : x))} />
                <button style={{ ...btn, padding: 8, justifyContent: "center" }} onClick={() => setLines((p) => p.filter((_, j) => j !== i))}><Trash2 size={15} /></button>
              </div>
            ))}
            <button style={{ ...btn, alignSelf: "flex-start" }}
              onClick={() => setLines((p) => [...p, { sid: selectable[0]?.id ?? pricingServices[0].id, tier: "standard", qty: 1 }])}>
              <Plus size={15} /> Ajouter un service
            </button>
          </div>
        </div>

        {/* Receipt-only payment fields */}
        {docType === "receipt" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div>
              <span style={lbl}>Moyen de paiement</span>
              <select style={input} value={payMethod} onChange={(e) => setPayMethod(e.target.value)}>
                {["MonCash", "NatCash", "BUH", "Carte / Upwork", "Virement", "Espèces", "Autre"].map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <span style={lbl}>Référence / ID transaction</span>
              <input style={input} placeholder="Ex : 4829-XT91" value={reference} onChange={(e) => setReference(e.target.value)} />
            </div>
          </div>
        )}

        {/* Delivery-only field */}
        {docType === "delivery" && (
          <div>
            <span style={lbl}>Accès aux livrables (lien / dossier)</span>
            <input style={input} placeholder="Ex : https://drive.google.com/… ou WeTransfer" value={deliveryRef} onChange={(e) => setDeliveryRef(e.target.value)} />
            {revisionDays > 0 && (
              <span style={{ fontSize: 11.5, color: "var(--ds-text-faint)", marginTop: 6, display: "block" }}>
                Fenêtre de révision incluse : {revisionDays} jour(s).
              </span>
            )}
          </div>
        )}
      </div>

      {/* Summary / actions */}
      <div style={{ ...card, display: "flex", flexDirection: "column", gap: 14, position: "sticky", top: 96 }}>
        <span style={{ fontSize: 12, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--ds-text-faint)" }}>Récapitulatif</span>
        <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
          {items.length === 0 && <span style={{ fontSize: 13, color: "var(--ds-text-faint)" }}>Aucun service ajouté.</span>}
          {items.map((it, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", gap: 10, fontSize: 13 }}>
              <span style={{ color: "var(--ds-text-sec)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{it.name} · {it.tier} ×{it.qty}</span>
              <span style={{ fontWeight: 700, fontFamily: "var(--font-space), monospace", whiteSpace: "nowrap" }}>{fmtMoney(it.price * it.qty, "USD")}</span>
            </div>
          ))}
        </div>
        <div style={{ borderTop: "1px solid var(--ds-border)", paddingTop: 12, display: "flex", flexDirection: "column", gap: 6 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 15, fontWeight: 800 }}>
            <span>Total</span><span style={{ fontFamily: "var(--font-space), monospace" }}>{fmtMoney(total, "USD")}</span>
          </div>
          {deposit !== null && (
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, color: "var(--ds-text-muted)" }}>
              <span>{docType === "proforma" ? "Acompte 70%" : "Montant payé"}</span>
              <span style={{ fontFamily: "var(--font-space), monospace" }}>{fmtMoney(deposit, "USD")}</span>
            </div>
          )}
        </div>

        <div>
          <span style={lbl}>Message automatique</span>
          <textarea readOnly value={autoMessage} rows={5}
            style={{ ...input, resize: "none", fontSize: 12.5, lineHeight: 1.5, color: "var(--ds-text-muted)" }} />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
          <button style={{ ...btn, justifyContent: "center", opacity: canGenerate ? 1 : 0.5 }} disabled={!canGenerate || busy !== ""} onClick={download}>
            {busy === "dl" ? <Loader2 size={15} style={{ animation: "spin 0.8s linear infinite" }} /> : <Download size={15} />} Télécharger
          </button>
          <button style={{ ...btnPrimary, justifyContent: "center", opacity: canSend && busy === "" ? 1 : 0.5 }} disabled={!canSend || busy !== ""} onClick={send}>
            {busy === "send" ? <Loader2 size={15} style={{ animation: "spin 0.8s linear infinite" }} /> : <Send size={15} />} Envoyer au client
          </button>
          {!canSend && canGenerate && <span style={{ fontSize: 11.5, color: "var(--ds-text-faint)", textAlign: "center" }}>Un email valide est requis pour l'envoi.</span>}
          {msg && <span style={{ fontSize: 13, fontWeight: 600, textAlign: "center", color: msg.ok ? "var(--ds-success)" : "#ef4444" }}>{msg.text}</span>}
        </div>
      </div>
    </div>
  )
}

// ── Newsletter campaigns tab ──────────────────────────────────────────────────

export { LeadsTab, PaymentsTab, ReviewsTab, DocumentsTab }
