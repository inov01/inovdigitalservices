// Outils & IA: procedures, assistant, rappels, eventualites.
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
import { adminApi, api, type Lead, type LeadItem, type Subscriber, type SiteSettings, type Campaign, type AdminService, type AdminWork, type AdminAlbum, type AdminBlog, type AssistantMessage, type Testimonial, type Formation, type Collaborateur, type Eventualite, type EventualiteInput } from "../../../lib/api"
import { useSettings } from "../../../context/AppSettings"
import logoDark from "../../../imports/logo_pour_fond_noir.webp"
import logoLight from "../../../imports/logo.webp"
import { SITE_URL, EMAIL_LOGO_DARK, NL_LANGS, NL_INTRO, STATUSES, STATUS_LABEL, STATUS_COLOR, PAY_STATUS_LABEL, SORT_LABEL, TIER_FR, shell, card, btn, btnPrimary, input, STYLE, sectionTitle, smallLabel, Stat, Toolbar, Chip, matchLead, sortLeads, downloadCsv, withLocalAmounts, esc, fmtMoney, receiptNo, localMultiplier, svcLineAmount, firstName, replyGreeting, amountLabel, mailtoReply, waReply, waServiceReply, buildReceiptHtml, printReceipt, buildProformaHtml, buildDeliveryHtml, printDoc, ListSkeleton, Field, BriefAttachments, EditField, ProcedureCard, Empty, buildNewsletterHtml, AdminStyle, type SortKey, type SvcLine, type NlArticle } from "../shared"

function ProceduresTab() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 860 }}>
      <div style={{ ...card }}>
        <h2 style={sectionTitle}>Procédures conseillées par service</h2>
        <p style={{ margin: "8px 0 0", fontSize: 13.5, color: "var(--ds-text-muted)", lineHeight: 1.55 }}>
          La méthode recommandée à communiquer au client pour chaque service : ce qu'il doit fournir,
          le déroulé du projet, les délais, les révisions et les livrables. Cliquez sur « Copier pour
          un client » pour obtenir un texte prêt à envoyer par WhatsApp ou e-mail.
        </p>
      </div>
      {serviceProcedures.map((p) => <ProcedureCard key={p.key} p={p} />)}
    </div>
  )
}

// ── Assistant tab: private AI helper (Google Gemini) for the owner ─────────────
// Drafts client replies, quotes, follow-ups, summaries and translations. Calls
// the server /assistant route, which relays to Gemini using the GEMINI_API_KEY
// secret. The key never touches the browser.

const ASSISTANT_SUGGESTIONS = [
  "Rédige une réponse chaleureuse à un client qui demande un devis pour un logo.",
  "Résume mes dernières demandes et dis-moi lesquelles relancer en priorité.",
  "Écris un message de relance poli pour un devis resté sans réponse depuis 5 jours.",
  "Traduis ce message en anglais et en espagnol : « Votre logo est prêt, souhaitez-vous une révision ? »",
]

function AssistantTab() {
  const [messages, setMessages] = useState<AssistantMessage[]>([])
  const [draft, setDraft] = useState("")
  const [withLeads, setWithLeads] = useState(false)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState("")
  const scroller = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: "smooth" })
  }, [messages, busy])

  async function send(text?: string) {
    const content = (text ?? draft).trim()
    if (!content || busy) return
    setErr("")
    const next = [...messages, { role: "user" as const, content }]
    setMessages(next)
    setDraft("")
    setBusy(true)
    try {
      const r = await adminApi.assistant(next, withLeads)
      setMessages([...next, { role: "assistant", content: r.reply }])
    } catch (e) {
      const msg = String((e as any)?.message ?? e)
      setErr(
        msg.includes("gemini_not_configured")
          ? "La clé Gemini n'est pas encore configurée. Ajoutez le secret GEMINI_API_KEY côté serveur, puis redéployez la fonction Supabase."
          : `Échec de l'assistant : ${msg}`,
      )
      setMessages(messages) // roll back the optimistic user message
      setDraft(content)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 860 }}>
      <div style={{ ...card }}>
        <h2 style={sectionTitle}>Assistant IA (Gemini)</h2>
        <p style={{ margin: "8px 0 0", fontSize: 13.5, color: "var(--ds-text-muted)", lineHeight: 1.55 }}>
          Votre assistant privé : rédaction de réponses clients, devis, relances, résumés de demandes
          et traductions dans les 8 langues du site. Réservé à l'administrateur — jamais visible par les clients.
        </p>
        <label style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 14, fontSize: 13, color: "var(--ds-text-sec)", cursor: "pointer" }}>
          <input type="checkbox" checked={withLeads} onChange={(e) => setWithLeads(e.target.checked)} />
          Donner à l'assistant le contexte de mes dernières demandes (leads)
        </label>
      </div>

      <div style={{ ...card, padding: 0, overflow: "hidden", display: "flex", flexDirection: "column", height: 520 }}>
        <div ref={scroller} style={{ flex: 1, overflowY: "auto", padding: 18, display: "flex", flexDirection: "column", gap: 12 }}>
          {messages.length === 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ fontSize: 13, color: "var(--ds-text-faint)", marginBottom: 2 }}>Suggestions pour démarrer :</div>
              {ASSISTANT_SUGGESTIONS.map((s, i) => (
                <button key={i} onClick={() => send(s)} disabled={busy}
                  style={{ ...btn, textAlign: "start", justifyContent: "flex-start", fontWeight: 600, whiteSpace: "normal", lineHeight: 1.4 }}>
                  <Sparkles size={14} style={{ flexShrink: 0, color: "var(--ds-accent)" }} /> {s}
                </button>
              ))}
            </div>
          )}
          {messages.map((m, i) => (
            <div key={i} style={{
              alignSelf: m.role === "user" ? "flex-end" : "flex-start",
              maxWidth: "86%",
              background: m.role === "user" ? "var(--ds-accent-a12)" : "var(--ds-bg-sec)",
              border: "1px solid var(--ds-border)",
              borderRadius: "var(--r-lg)", padding: "10px 14px",
              fontSize: 14, lineHeight: 1.6, color: "var(--ds-text)", whiteSpace: "pre-wrap",
            }}>
              {m.content}
              {m.role === "assistant" && (
                <div style={{ marginTop: 8 }}>
                  <button onClick={() => navigator.clipboard?.writeText(m.content).catch(() => {})}
                    style={{ ...btn, padding: "5px 10px", fontSize: 12 }}>
                    <Copy size={13} /> Copier
                  </button>
                </div>
              )}
            </div>
          ))}
          {busy && (
            <div style={{ alignSelf: "flex-start", display: "flex", alignItems: "center", gap: 8, color: "var(--ds-text-muted)", fontSize: 13 }}>
              <Loader2 size={15} style={{ animation: "spin 0.8s linear infinite" }} /> L'assistant réfléchit…
            </div>
          )}
        </div>

        {err && (
          <div style={{ padding: "10px 16px", fontSize: 13, color: "#fca5a5", borderTop: "1px solid var(--ds-border)", background: "color-mix(in srgb, red 8%, transparent)" }}>
            {err}
          </div>
        )}

        <div style={{ display: "flex", gap: 10, padding: 14, borderTop: "1px solid var(--ds-border)" }}>
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send() } }}
            placeholder="Écrivez votre demande… (Entrée pour envoyer, Maj+Entrée pour un saut de ligne)"
            rows={2}
            style={{ ...input, flex: 1, resize: "none", fontFamily: "inherit" }}
          />
          <button onClick={() => send()} disabled={busy || !draft.trim()} style={{ ...btnPrimary, alignSelf: "stretch", padding: "0 18px" }}>
            <Send size={16} /> Envoyer
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Reminders tab: local reminders / appointments + calendar (.ics) export ─────
const REMINDER_KINDS: { value: ReminderKind; label: string }[] = [
  { value: "rappel", label: "Rappel" },
  { value: "rendez-vous", label: "Rendez-vous" },
  { value: "relance", label: "Relance client" },
]

// Convert an ISO date to the value a <input type="datetime-local"> expects.

function toLocalInput(iso: string): string {
  const d = new Date(iso)
  if (isNaN(d.getTime())) return ""
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function RemindersTab() {
  const [list, setList] = useState<Reminder[]>([])
  const [kind, setKind] = useState<ReminderKind>("rappel")
  const [title, setTitle] = useState("")
  const [at, setAt] = useState("")
  const [client, setClient] = useState("")
  const [note, setNote] = useState("")
  const [notifOn, setNotifOn] = useState(false)

  useEffect(() => {
    setList(loadReminders())
    if (typeof Notification !== "undefined") setNotifOn(Notification.permission === "granted")
  }, [])

  // Persist + keep a ref-free copy for the interval below.
  function commit(next: Reminder[]) {
    const sorted = [...next].sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime())
    setList(sorted); saveReminders(sorted)
  }

  // While the dashboard is open, fire a browser notification at each due time.
  useEffect(() => {
    const tick = () => {
      const now = Date.now()
      let changed = false
      const next = list.map((r) => {
        if (!r.done && !r.notified && new Date(r.at).getTime() <= now) {
          fireNotification(r); changed = true
          return { ...r, notified: true }
        }
        return r
      })
      if (changed) commit(next)
    }
    tick()
    const id = setInterval(tick, 30_000)
    return () => clearInterval(id)
  }, [list])

  function add() {
    if (!title.trim() || !at) return
    const r: Reminder = {
      id: newReminderId(),
      kind,
      title: title.trim(),
      at: new Date(at).toISOString(),
      client: client.trim() || undefined,
      note: note.trim() || undefined,
    }
    commit([...list, r])
    setTitle(""); setAt(""); setClient(""); setNote(""); setKind("rappel")
  }
  function remove(id: string) { commit(list.filter((r) => r.id !== id)) }
  function toggleDone(id: string) {
    commit(list.map((r) => (r.id === id ? { ...r, done: !r.done } : r)))
  }
  async function enableNotifs() { setNotifOn(await ensureNotificationPermission()) }

  const now = Date.now()
  const upcoming = list.filter((r) => !r.done)
  const done = list.filter((r) => r.done)

  const fmt = (iso: string) =>
    new Date(iso).toLocaleString("fr-FR", { weekday: "short", day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })

  const Row = ({ r }: { r: Reminder }) => {
    const overdue = !r.done && new Date(r.at).getTime() < now
    return (
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "12px 0", borderTop: "1px solid var(--ds-border)", opacity: r.done ? 0.55 : 1 }}>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <span style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: "0.06em", textTransform: "uppercase", padding: "2px 7px", borderRadius: 999, background: "var(--ds-bg-sec)", border: "1px solid var(--ds-border)", color: "var(--ds-text-muted)" }}>
              {kindLabel(r.kind)}
            </span>
            <span style={{ fontSize: 14.5, fontWeight: 700, textDecoration: r.done ? "line-through" : "none" }}>{r.title}</span>
          </div>
          <div style={{ marginTop: 4, fontSize: 12.5, color: overdue ? "var(--ds-danger, #DC2626)" : "var(--ds-text-faint)", fontWeight: overdue ? 700 : 500 }}>
            {fmt(r.at)}{overdue ? " · en retard" : ""}{r.client ? ` · ${r.client}` : ""}
          </div>
          {r.note && <p style={{ margin: "4px 0 0", fontSize: 12.5, color: "var(--ds-text-muted)", lineHeight: 1.5 }}>{r.note}</p>}
        </div>
        <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
          <button style={{ ...btn, padding: "6px 10px" }} onClick={() => downloadICS(r)} title="Ajouter au calendrier (alarme)">
            <CalendarClock size={14} />
          </button>
          <button style={{ ...btn, padding: "6px 10px" }} onClick={() => toggleDone(r.id)} title={r.done ? "Rouvrir" : "Marquer fait"}>
            {r.done ? <RefreshCw size={14} /> : <Check size={14} />}
          </button>
          <button style={{ ...btn, padding: "6px 10px", color: "var(--ds-danger, #DC2626)" }} onClick={() => remove(r.id)} title="Supprimer">
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 820 }}>
      <div style={{ ...card, display: "flex", flexDirection: "column", gap: 14 }}>
        <div>
          <h2 style={sectionTitle}>Nouveau rappel / rendez-vous</h2>
          <p style={{ margin: "6px 0 0", fontSize: 13, color: "var(--ds-text-muted)", lineHeight: 1.55 }}>
            Créez un rappel pour être notifié, ou un rendez-vous à programmer. Le bouton calendrier
            <CalendarClock size={13} style={{ verticalAlign: "-2px", margin: "0 3px" }} />
            télécharge un fichier .ics : l'événement s'ajoute à votre agenda (téléphone / Google Agenda)
            avec une vraie alarme, même application fermée.
          </p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <EditField label="Type">
            <select style={input} value={kind} onChange={(e) => setKind(e.target.value as ReminderKind)}>
              {REMINDER_KINDS.map((k) => <option key={k.value} value={k.value}>{k.label}</option>)}
            </select>
          </EditField>
          <EditField label="Date & heure">
            <input style={input} type="datetime-local" value={at} onChange={(e) => setAt(e.target.value)} />
          </EditField>
        </div>
        <EditField label="Titre / objet">
          <input style={input} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex : Appeler le client pour valider le logo" />
        </EditField>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <EditField label="Client" hint="Optionnel.">
            <input style={input} value={client} onChange={(e) => setClient(e.target.value)} />
          </EditField>
          <EditField label="Note" hint="Optionnel.">
            <input style={input} value={note} onChange={(e) => setNote(e.target.value)} />
          </EditField>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
          <button style={{ ...btnPrimary, opacity: !title.trim() || !at ? 0.6 : 1 }} onClick={add} disabled={!title.trim() || !at}>
            <Plus size={15} /> Ajouter
          </button>
          {!notifOn && (
            <button style={btn} onClick={enableNotifs}>
              <Bell size={15} /> Activer les notifications
            </button>
          )}
          {notifOn && <span style={{ alignSelf: "center", fontSize: 12.5, color: "var(--ds-success)", fontWeight: 600 }}>Notifications activées ✓</span>}
        </div>
      </div>

      <div style={{ ...card }}>
        <h2 style={{ ...sectionTitle, marginBottom: 4 }}>À venir</h2>
        {upcoming.length === 0
          ? <p style={{ margin: "10px 0 0", fontSize: 13.5, color: "var(--ds-text-muted)" }}>Aucun rappel en attente.</p>
          : upcoming.map((r) => <Row key={r.id} r={r} />)}
      </div>

      {done.length > 0 && (
        <div style={{ ...card }}>
          <h2 style={{ ...sectionTitle, marginBottom: 4 }}>Terminés</h2>
          {done.map((r) => <Row key={r.id} r={r} />)}
        </div>
      )}

      <p style={{ fontSize: 12, color: "var(--ds-text-faint)", lineHeight: 1.5, margin: 0 }}>
        Les rappels sont enregistrés sur cet appareil (ce navigateur). Pour une alarme sur votre
        téléphone, utilisez le bouton calendrier de chaque rappel.
      </p>
    </div>
  )
}

// ── Blog tab: hide built-in articles & write custom ones ───────────────────────

const SEV_COLOR: Record<Eventualite["severity"], { bg: string; color: string; label: string }> = {
  critique: { bg: "rgba(220,38,38,0.12)", color: "#DC2626", label: "Critique" },
  haute:    { bg: "rgba(234,88,12,0.12)", color: "#EA580C", label: "Haute" },
  normale:  { bg: "rgba(202,138,4,0.12)", color: "#CA8A04", label: "Normale" },
  info:     { bg: "rgba(14,165,233,0.12)", color: "#0EA5E9", label: "Info" },
}
const TYPE_LABEL: Record<Eventualite["type"], string> = {
  incident: "Incident", alerte: "Alerte", note: "Note", suivi_client: "Suivi client", paiement: "Paiement",
}
const STATUS_EVT_LABEL: Record<Eventualite["status"], string> = {
  ouverte: "Ouverte", en_cours: "En cours", resolue: "Résolue", archivee: "Archivée",
}
const STATUS_EVT_COLOR: Record<Eventualite["status"], string> = {
  ouverte: "#DC2626", en_cours: "#CA8A04", resolue: "#16A34A", archivee: "var(--ds-text-faint)",
}

const EVT_TYPE_OPTS: Eventualite["type"][] = ["incident", "alerte", "note", "suivi_client", "paiement"]
const EVT_SEV_OPTS: Eventualite["severity"][] = ["critique", "haute", "normale", "info"]
const EVT_STATUS_OPTS: Eventualite["status"][] = ["ouverte", "en_cours", "resolue", "archivee"]

function EventualitesTab() {
  const [items, setItems] = useState<Eventualite[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState<Eventualite["status"] | "all">("all")
  const [filterSev, setFilterSev] = useState<Eventualite["severity"] | "all">("all")
  const [showForm, setShowForm] = useState(false)
  const [resolveId, setResolveId] = useState<string | null>(null)
  const [resolveNote, setResolveNote] = useState("")
  const [busy, setBusy] = useState(false)

  const [form, setForm] = useState<EventualiteInput>({
    title: "", description: "", type: "note", severity: "normale",
  })

  async function load() {
    setLoading(true)
    try {
      const r = await adminApi.listEventualites()
      setItems(r.eventualites)
    } catch {
      // silently fail — backend may not have this endpoint yet
      setItems([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const filtered = useMemo(() => {
    return items.filter((e) => {
      if (filterStatus !== "all" && e.status !== filterStatus) return false
      if (filterSev !== "all" && e.severity !== filterSev) return false
      return true
    })
  }, [items, filterStatus, filterSev])

  const openCritical = useMemo(() => items.filter((e) => e.severity === "critique" && e.status !== "resolue" && e.status !== "archivee").length, [items])

  const stats = useMemo(() => ({
    critique: items.filter((e) => e.severity === "critique" && e.status !== "resolue" && e.status !== "archivee").length,
    haute: items.filter((e) => e.severity === "haute" && e.status !== "resolue" && e.status !== "archivee").length,
    ouverte: items.filter((e) => e.status === "ouverte").length,
    resolue: items.filter((e) => e.status === "resolue").length,
  }), [items])

  async function create(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title.trim()) return
    setBusy(true)
    try {
      const r = await adminApi.createEventualite(form)
      setItems((prev) => [r.eventualite, ...prev])
      setForm({ title: "", description: "", type: "note", severity: "normale" })
      setShowForm(false)
    } catch {
      // noop — backend endpoint may not exist yet
    } finally {
      setBusy(false)
    }
  }

  async function updateStatus(id: string, status: Eventualite["status"], note?: string) {
    try {
      const patch: Parameters<typeof adminApi.updateEventualite>[1] = { status }
      if (note) patch.resolvedNote = note
      const r = await adminApi.updateEventualite(id, patch)
      setItems((prev) => prev.map((e) => e.id === id ? r.eventualite : e))
    } catch {
      // noop
    }
  }

  async function deleteEvt(id: string) {
    try {
      await adminApi.deleteEventualite(id)
      setItems((prev) => prev.filter((e) => e.id !== id))
    } catch {
      // noop
    }
  }

  function exportCSV() {
    const rows = [
      ["Date", "Titre", "Type", "Sévérité", "Statut", "Description", "Note résolution"],
      ...filtered.map((e) => [
        new Date(e.createdAt).toLocaleDateString("fr"),
        e.title, TYPE_LABEL[e.type], SEV_COLOR[e.severity].label, STATUS_EVT_LABEL[e.status],
        e.description ?? "", e.resolvedNote ?? "",
      ]),
    ]
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n")
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" })
    const a = document.createElement("a")
    a.href = URL.createObjectURL(blob)
    a.download = `eventualites-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h2 style={{ fontFamily: "var(--font-space), monospace", fontSize: 20, fontWeight: 800, margin: "0 0 4px" }}>
            Journal des éventualités
            {openCritical > 0 && (
              <span style={{ marginLeft: 10, display: "inline-flex", alignItems: "center", padding: "2px 9px", borderRadius: "var(--r-full)", background: "rgba(220,38,38,0.15)", color: "#DC2626", fontSize: 13, fontWeight: 800 }}>
                {openCritical} critique{openCritical > 1 ? "s" : ""}
              </span>
            )}
          </h2>
          <p style={{ margin: 0, fontSize: 13.5, color: "var(--ds-text-muted)" }}>Incidents, alertes et notes opérationnelles</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button style={btn} onClick={exportCSV}><Download size={14} /> Exporter CSV</button>
          <button style={btnPrimary} onClick={() => setShowForm((v) => !v)}>
            <Plus size={14} /> Nouvelle éventualité
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 12 }}>
        {[
          { label: "Critiques ouvertes", value: stats.critique, color: "#DC2626" },
          { label: "Hautes ouvertes", value: stats.haute, color: "#EA580C" },
          { label: "Total ouvertes", value: stats.ouverte, color: "var(--ds-text)" },
          { label: "Résolues", value: stats.resolue, color: "#16A34A" },
        ].map(({ label: l, value, color }) => (
          <div key={l} style={{ ...card, padding: 14 }}>
            <p style={{ margin: "0 0 4px", fontSize: 12, fontWeight: 700, color: "var(--ds-text-muted)", textTransform: "uppercase", letterSpacing: "0.04em" }}>{l}</p>
            <p style={{ margin: 0, fontSize: 24, fontWeight: 800, color, fontFamily: "var(--font-space), monospace" }}>{value}</p>
          </div>
        ))}
      </div>

      {/* Creation form */}
      {showForm && (
        <form onSubmit={create} style={{ ...card, display: "grid", gap: 14 }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800 }}>Nouvelle éventualité</h3>
          <input style={input} placeholder="Titre *" value={form.title} required
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: "var(--ds-text-muted)", display: "block", marginBottom: 5 }}>Type</label>
              <select style={input} value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as Eventualite["type"] }))}>
                {EVT_TYPE_OPTS.map((t) => <option key={t} value={t}>{TYPE_LABEL[t]}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: "var(--ds-text-muted)", display: "block", marginBottom: 5 }}>Sévérité</label>
              <select style={input} value={form.severity} onChange={(e) => setForm((f) => ({ ...f, severity: e.target.value as Eventualite["severity"] }))}>
                {EVT_SEV_OPTS.map((s) => <option key={s} value={s}>{SEV_COLOR[s].label}</option>)}
              </select>
            </div>
          </div>
          <textarea style={{ ...input, minHeight: 80, resize: "vertical" }} placeholder="Description (optionnel)"
            value={form.description ?? ""} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
            <button type="button" style={btn} onClick={() => setShowForm(false)}>Annuler</button>
            <button type="submit" style={btnPrimary} disabled={busy}>
              {busy ? <Loader2 size={14} style={{ animation: "spin 0.8s linear infinite" }} /> : <Plus size={14} />}
              Créer
            </button>
          </div>
        </form>
      )}

      {/* Filters */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center" }}>
        <span style={{ fontSize: 12.5, fontWeight: 700, color: "var(--ds-text-muted)" }}>Statut :</span>
        {(["all", ...EVT_STATUS_OPTS] as const).map((s) => (
          <button key={s} onClick={() => setFilterStatus(s)}
            style={{ ...btn, padding: "5px 11px", fontSize: 12.5, background: filterStatus === s ? "var(--ds-accent-a12)" : "var(--ds-bg-sec)", color: filterStatus === s ? "var(--ds-accent)" : "var(--ds-text-muted)", border: filterStatus === s ? "1px solid var(--ds-accent)" : "1px solid var(--ds-border)" }}>
            {s === "all" ? "Tous" : STATUS_EVT_LABEL[s]}
          </button>
        ))}
        <span style={{ fontSize: 12.5, fontWeight: 700, color: "var(--ds-text-muted)", marginLeft: 8 }}>Sévérité :</span>
        {(["all", ...EVT_SEV_OPTS] as const).map((s) => (
          <button key={s} onClick={() => setFilterSev(s)}
            style={{ ...btn, padding: "5px 11px", fontSize: 12.5, background: filterSev === s ? "var(--ds-accent-a12)" : "var(--ds-bg-sec)", color: filterSev === s ? "var(--ds-accent)" : "var(--ds-text-muted)", border: filterSev === s ? "1px solid var(--ds-accent)" : "1px solid var(--ds-border)" }}>
            {s === "all" ? "Toutes" : SEV_COLOR[s as Eventualite["severity"]].label}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: 40 }}>
          <Loader2 size={24} style={{ animation: "spin 0.8s linear infinite", color: "var(--ds-accent)" }} />
        </div>
      ) : filtered.length === 0 ? (
        <Empty text="Aucune éventualité pour ces filtres." />
      ) : (
        <div style={{ display: "grid", gap: 10 }}>
          {filtered.map((e) => {
            const sev = SEV_COLOR[e.severity]
            const isResolving = resolveId === e.id
            return (
              <div key={e.id} className="adm-row" style={{ ...card, padding: 16, gap: 0 }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginBottom: 6 }}>
                      <span style={{ padding: "2px 9px", borderRadius: "var(--r-full)", fontSize: 11.5, fontWeight: 800, background: sev.bg, color: sev.color, textTransform: "uppercase", letterSpacing: "0.04em" }}>{sev.label}</span>
                      <span style={{ padding: "2px 9px", borderRadius: "var(--r-full)", fontSize: 11.5, fontWeight: 700, background: "var(--ds-bg-sec)", color: "var(--ds-text-muted)" }}>{TYPE_LABEL[e.type]}</span>
                      <span style={{ padding: "2px 9px", borderRadius: "var(--r-full)", fontSize: 11.5, fontWeight: 700, background: "var(--ds-bg-sec)", color: STATUS_EVT_COLOR[e.status] }}>{STATUS_EVT_LABEL[e.status]}</span>
                    </div>
                    <p style={{ margin: "0 0 4px", fontWeight: 800, fontSize: 15, color: "var(--ds-text)" }}>{e.title}</p>
                    {e.description && <p style={{ margin: "0 0 4px", fontSize: 13.5, color: "var(--ds-text-muted)", lineHeight: 1.5 }}>{e.description}</p>}
                    {e.resolvedNote && <p style={{ margin: "4px 0 0", fontSize: 13, fontStyle: "italic", color: "#16A34A" }}>✓ {e.resolvedNote}</p>}
                    <p style={{ margin: "6px 0 0", fontSize: 12, color: "var(--ds-text-faint)" }}>{new Date(e.createdAt).toLocaleString("fr")}</p>
                  </div>
                  <div style={{ display: "flex", gap: 6, flexShrink: 0, flexWrap: "wrap" }}>
                    {/* Status progression */}
                    {e.status === "ouverte" && (
                      <button style={{ ...btn, padding: "5px 10px", fontSize: 12.5 }} onClick={() => updateStatus(e.id, "en_cours")}>
                        <ArrowUpDown size={12} /> En cours
                      </button>
                    )}
                    {(e.status === "ouverte" || e.status === "en_cours") && (
                      <button style={{ ...btn, padding: "5px 10px", fontSize: 12.5, color: "#16A34A", borderColor: "#16A34A" }}
                        onClick={() => { setResolveId(e.id); setResolveNote("") }}>
                        <CheckCircle2 size={12} /> Résoudre
                      </button>
                    )}
                    {e.status === "resolue" && (
                      <button style={{ ...btn, padding: "5px 10px", fontSize: 12.5 }} onClick={() => updateStatus(e.id, "archivee")}>
                        Archiver
                      </button>
                    )}
                    <button style={{ ...btn, padding: "5px 10px", fontSize: 12.5, color: "var(--ds-danger)" }} onClick={() => deleteEvt(e.id)}>
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
                {/* Resolve form inline */}
                {isResolving && (
                  <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
                    <input style={{ ...input, flex: 1, fontSize: 13.5, padding: "9px 12px" }} placeholder="Note de résolution (optionnel)"
                      value={resolveNote} onChange={(e) => setResolveNote(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") { updateStatus(resolveId!, "resolue", resolveNote); setResolveId(null) } }} />
                    <button style={btnPrimary} onClick={() => { updateStatus(resolveId!, "resolue", resolveNote); setResolveId(null) }}>
                      <Check size={14} /> Confirmer
                    </button>
                    <button style={btn} onClick={() => setResolveId(null)}>Annuler</button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export { ProceduresTab, AssistantTab, RemindersTab, EventualitesTab }
