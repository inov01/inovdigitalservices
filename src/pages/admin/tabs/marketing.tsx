// Marketing: newsletter, campagnes e-mail, liens a partager.
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

function NewsletterTab({ subs, loading, onChange }: { subs: Subscriber[]; loading: boolean; onChange: () => void }) {
  const [query, setQuery] = useState("")
  const view = useMemo(
    () => subs.filter((s) => !query || s.email.toLowerCase().includes(query.toLowerCase())),
    [subs, query],
  )

  async function remove(email: string) {
    if (!confirm(`Retirer ${email} ?`)) return
    await adminApi.deleteSubscriber(email)
    onChange()
  }
  function exportCsv() {
    downloadCsv("newsletter-inov.csv", [["email", "lang", "createdAt"], ...view.map((s) => [s.email, s.lang, s.createdAt])])
  }

  if (loading && subs.length === 0) return <ListSkeleton />

  return (
    <div style={{ ...card, padding: 0, overflow: "hidden" }}>
      <div style={{ display: "flex", gap: 10, alignItems: "center", padding: 14, borderBottom: "1px solid var(--ds-border)", flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
          <Search size={16} style={{ position: "absolute", top: "50%", insetInlineStart: 12, transform: "translateY(-50%)", color: "var(--ds-text-faint)" }} />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Rechercher un e-mail…" style={{ ...input, paddingInlineStart: 36 }} />
        </div>
        <span style={{ fontSize: 12.5, color: "var(--ds-text-faint)", fontWeight: 600 }}>{view.length} abonné{view.length > 1 ? "s" : ""}</span>
        <button style={btn} className="adm-iconbtn" onClick={exportCsv}><Download size={15} /> Exporter en CSV</button>
      </div>
      {view.length === 0 ? (
        <div style={{ padding: 40, textAlign: "center", color: "var(--ds-text-muted)" }}>
          {query ? "Aucun e-mail correspondant." : "Aucun abonné à la newsletter pour l'instant."}
        </div>
      ) : view.map((s) => (
        <div key={s.email} className="adm-row" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "12px 18px", borderBottom: "1px solid var(--ds-border)" }}>
          <div>
            <div style={{ fontWeight: 600, fontSize: 14.5 }}>{s.email}</div>
            <div style={{ fontSize: 12, color: "var(--ds-text-faint)" }}>
              {s.lang ? s.lang.toUpperCase() + " · " : ""}{new Date(s.createdAt).toLocaleDateString("fr-FR")}
            </div>
          </div>
          <button onClick={() => remove(s.email)} style={{ ...btn, padding: "6px 10px", color: "var(--ds-danger)", borderColor: "var(--ds-danger-a40)" }}>
            <Trash2 size={14} />
          </button>
        </div>
      ))}
    </div>
  )
}

// ── Client reviews moderation tab ─────────────────────────────────────────────

function CampaignsTab({ subs, adminEmail }: { subs: Subscriber[]; adminEmail: string }) {
  const [lang, setLang] = useState("all")
  const [subject, setSubject] = useState("")
  const [intro, setIntro] = useState(NL_INTRO.fr.empty)
  // Once the admin edits the intro by hand we stop auto-adapting it to the selection.
  const [introTouched, setIntroTouched] = useState(false)
  const [selected, setSelected] = useState<string[]>([])
  const [scheduleAt, setScheduleAt] = useState("")
  const [busy, setBusy] = useState<"" | "test" | "send" | "schedule">("")
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [preview, setPreview] = useState(false)
  const [extraBlogs, setExtraBlogs] = useState<AdminBlog[]>([])

  async function loadCampaigns() {
    try { setCampaigns((await adminApi.listCampaigns()).campaigns) } catch { /* ignore */ }
  }
  useEffect(() => { loadCampaigns() }, [])
  useEffect(() => { adminApi.getSettings().then((r) => setExtraBlogs(r.settings.blogsAdded ?? [])).catch(() => {}) }, [])

  const artLang = lang === "all" ? "fr" : lang
  // Static articles for the chosen language + admin-authored blogs (shown in any language).
  const articleList = useMemo(() => {
    const stat = (ARTICLES[artLang as keyof typeof ARTICLES] ?? ARTICLES.fr).map((a) => ({
      id: a.id, tag: a.tag, title: a.title, excerpt: a.excerpt, read: a.read,
      img: ARTICLE_IMAGE[a.id]?.url ?? `${SITE_URL}/og-image.png`,
      slug: ARTICLE_SLUG[a.id] ?? a.id,
    }))
    const extra = extraBlogs.map((b) => ({
      id: b.id, tag: b.tag || "Blog", title: b.title, excerpt: b.excerpt, read: b.read || 3,
      img: b.image || `${SITE_URL}/og-image.png`, slug: b.slug || b.id,
    }))
    return [...stat, ...extra]
  }, [artLang, extraBlogs])
  const recipientCount = lang === "all" ? subs.length : subs.filter((s) => s.lang === lang).length

  // Build an intro adapted to the selected article(s), in the recipients' language.
  function buildIntro(ids: string[]): string {
    const tpl = NL_INTRO[artLang] ?? NL_INTRO.fr
    if (ids.length === 0) return tpl.empty
    if (ids.length === 1) {
      const a = articleList.find((x) => x.id === ids[0])
      if (a) return tpl.single(a.title, a.excerpt)
    }
    return tpl.multi(ids.length)
  }

  // Auto-adapt the intro to the selection (and language) until the admin edits it.
  useEffect(() => {
    if (!introTouched) setIntro(buildIntro(selected))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected, artLang, introTouched, extraBlogs])

  function toggle(id: string) {
    setSelected((p) => p.includes(id) ? p.filter((x) => x !== id) : [...p, id])
  }

  function nlArticles(): NlArticle[] {
    return selected.map((id) => {
      const a = articleList.find((x) => x.id === id)
      return {
        tag: a?.tag ?? "",
        title: a?.title ?? id,
        excerpt: a?.excerpt ?? "",
        img: a?.img ?? `${SITE_URL}/og-image.png`,
        url: `${SITE_URL}/blog/${a?.slug ?? id}`,
      }
    })
  }

  const html = buildNewsletterHtml({ subject: subject || "INOV Digital Services", intro, articles: nlArticles() })
  const ready = subject.trim() !== "" && selected.length > 0

  async function sendTest() {
    setBusy("test"); setMsg(null)
    try {
      const r = await adminApi.sendNewsletter({ subject, html, test: true, testEmail: adminEmail })
      setMsg({ ok: true, text: `Test envoyé à ${adminEmail} (${r.sent} ok).` })
    } catch { setMsg({ ok: false, text: "Échec de l'envoi du test." }) }
    finally { setBusy("") }
  }

  async function sendNow() {
    if (!confirm(`Envoyer cette newsletter à ${recipientCount} abonné(s) maintenant ?`)) return
    setBusy("send"); setMsg(null)
    try {
      const r = await adminApi.sendNewsletter({ subject, html, lang })
      setMsg({ ok: true, text: `Envoyée : ${r.sent} reçu(s)${r.failed ? `, ${r.failed} échec(s)` : ""}.` })
    } catch { setMsg({ ok: false, text: "Échec de l'envoi." }) }
    finally { setBusy("") }
  }

  async function schedule() {
    if (!scheduleAt) { setMsg({ ok: false, text: "Choisissez une date d'envoi." }); return }
    setBusy("schedule"); setMsg(null)
    try {
      await adminApi.scheduleNewsletter({ subject, html, lang, scheduledAt: new Date(scheduleAt).toISOString() })
      setMsg({ ok: true, text: "Campagne programmée." })
      setScheduleAt("")
      loadCampaigns()
    } catch { setMsg({ ok: false, text: "Échec de la programmation." }) }
    finally { setBusy("") }
  }

  async function cancelCampaign(id: string) {
    if (!confirm("Annuler cette campagne programmée ?")) return
    await adminApi.deleteCampaign(id)
    loadCampaigns()
  }

  const lbl: React.CSSProperties = { fontSize: 13, fontWeight: 600, color: "var(--ds-text-sec)", marginBottom: 6, display: "block" }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) 320px", gap: 18, alignItems: "start" }} className="adm-doc-grid">
      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        <div style={{ ...card, display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, fontFamily: "var(--font-space), sans-serif" }}>Composer une newsletter</h2>
            <p style={{ margin: "6px 0 0", fontSize: 13.5, color: "var(--ds-text-muted)", lineHeight: 1.5 }}>
              Choisissez des articles du blog, personnalisez le message, puis envoyez ou programmez l'envoi. Votre logo est ajouté automatiquement.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 220px", gap: 12 }}>
            <div>
              <span style={lbl}>Objet de l'e-mail</span>
              <input style={input} value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Ex : 3 conseils pour une marque qui vend" maxLength={200} />
            </div>
            <div>
              <span style={lbl}>Destinataires</span>
              <select style={input} value={lang} onChange={(e) => setLang(e.target.value)}>
                {NL_LANGS.map((l) => <option key={l.code} value={l.code}>{l.label}</option>)}
              </select>
            </div>
          </div>

          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ ...lbl, marginBottom: 0 }}>Message d'accompagnement</span>
              <button
                type="button"
                onClick={() => { setIntroTouched(false); setIntro(buildIntro(selected)) }}
                style={{ ...btn, padding: "5px 10px", fontSize: 12 }}
                title="Régénère un message adapté à l'article sélectionné"
              >
                <RefreshCw size={13} /> Adapter à l'article
              </button>
            </div>
            <textarea style={{ ...input, minHeight: 96, resize: "vertical", lineHeight: 1.5 }} value={intro} onChange={(e) => { setIntro(e.target.value); setIntroTouched(true) }} />
            <span style={{ fontSize: 11.5, color: "var(--ds-text-faint)" }}>
              {introTouched ? "Message personnalisé — l'adaptation automatique est désactivée." : "Adapté automatiquement à l'article sélectionné."}
            </span>
          </div>

          <div>
            <span style={lbl}>Articles du blog ({selected.length} sélectionné{selected.length > 1 ? "s" : ""})</span>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 340, overflowY: "auto" }}>
              {articleList.map((a) => {
                const on = selected.includes(a.id)
                return (
                  <button key={a.id} onClick={() => toggle(a.id)} style={{
                    display: "flex", alignItems: "center", gap: 12, textAlign: "start", cursor: "pointer",
                    border: on ? "1.5px solid var(--ds-accent)" : "1px solid var(--ds-border)",
                    background: on ? "var(--ds-accent-a12)" : "var(--ds-bg-sec)",
                    borderRadius: "var(--r-md)", padding: 8, fontFamily: "inherit",
                  }}>
                    <img src={a.img} alt="" style={{ width: 64, height: 44, objectFit: "cover", borderRadius: 6, flexShrink: 0, background: "var(--ds-bg)" }} />
                    <span style={{ minWidth: 0, flex: 1 }}>
                      <span style={{ display: "block", fontSize: 13.5, fontWeight: 700, color: "var(--ds-text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.title}</span>
                      <span style={{ display: "block", fontSize: 11.5, color: "var(--ds-text-faint)" }}>{a.tag} · {a.read} min</span>
                    </span>
                    {on && <Check size={17} style={{ color: "var(--ds-accent)", flexShrink: 0 }} />}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Scheduled / sent campaigns */}
        <div style={{ ...card }}>
          <h3 style={{ margin: "0 0 12px", fontSize: 15, fontWeight: 800 }}>Campagnes</h3>
          {campaigns.length === 0 ? (
            <p style={{ fontSize: 13, color: "var(--ds-text-faint)", margin: 0 }}>Aucune campagne programmée ou envoyée.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {campaigns.map((c) => (
                <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", border: "1px solid var(--ds-border)", borderRadius: "var(--r-md)" }}>
                  <span style={{
                    fontSize: 10.5, fontWeight: 800, letterSpacing: "0.05em", textTransform: "uppercase", padding: "3px 8px", borderRadius: "var(--r-full)",
                    color: c.status === "sent" ? "#15803D" : c.status === "failed" ? "#DC2626" : "#B45309",
                    background: c.status === "sent" ? "#15803D18" : c.status === "failed" ? "#DC262618" : "#B4530918",
                  }}>{c.status === "sent" ? "Envoyée" : c.status === "failed" ? "Échec" : "Programmée"}</span>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.subject}</div>
                    <div style={{ fontSize: 11.5, color: "var(--ds-text-faint)" }}>
                      {new Date(c.scheduledAt).toLocaleString("fr-FR")}{c.result?.sent != null ? ` · ${c.result.sent} envoyé(s)` : ""}
                    </div>
                  </div>
                  {c.status === "scheduled" && (
                    <button aria-label="Annuler la campagne programmée" title="Annuler la campagne programmée" onClick={() => cancelCampaign(c.id)} style={{ ...btn, padding: "6px 10px", color: "var(--ds-danger)", borderColor: "var(--ds-danger-a40)" }}><X size={14} aria-hidden="true" /></button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Actions / preview */}
      <div style={{ ...card, display: "flex", flexDirection: "column", gap: 14, position: "sticky", top: 96 }}>
        <span style={{ fontSize: 12, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--ds-text-faint)" }}>Envoi</span>
        <div style={{ fontSize: 13.5, color: "var(--ds-text-sec)" }}>
          <strong style={{ color: "var(--ds-text)", fontSize: 22, fontFamily: "var(--font-space), monospace" }}>{recipientCount}</strong> destinataire(s)
        </div>

        <button style={{ ...btn, justifyContent: "center" }} disabled={!ready || busy !== ""} onClick={() => setPreview(true)}>
          <FileText size={15} /> Aperçu
        </button>
        <button style={{ ...btn, justifyContent: "center", opacity: ready ? 1 : 0.5 }} disabled={!ready || busy !== ""} onClick={sendTest}>
          {busy === "test" ? <Loader2 size={15} style={{ animation: "spin 0.8s linear infinite" }} /> : <Mail size={15} />} Test à moi-même
        </button>
        <button style={{ ...btnPrimary, justifyContent: "center", opacity: ready && recipientCount > 0 ? 1 : 0.5 }} disabled={!ready || recipientCount === 0 || busy !== ""} onClick={sendNow}>
          {busy === "send" ? <Loader2 size={15} style={{ animation: "spin 0.8s linear infinite" }} /> : <Send size={15} />} Envoyer maintenant
        </button>

        <div style={{ borderTop: "1px solid var(--ds-border)", paddingTop: 12 }}>
          <span style={lbl}>Programmer l'envoi</span>
          <input type="datetime-local" style={input} value={scheduleAt} onChange={(e) => setScheduleAt(e.target.value)} />
          <button style={{ ...btn, justifyContent: "center", width: "100%", marginTop: 9, opacity: ready && scheduleAt ? 1 : 0.5 }} disabled={!ready || !scheduleAt || busy !== ""} onClick={schedule}>
            {busy === "schedule" ? <Loader2 size={15} style={{ animation: "spin 0.8s linear infinite" }} /> : <Bell size={15} />} Programmer
          </button>
        </div>

        {msg && <span style={{ fontSize: 13, fontWeight: 600, textAlign: "center", color: msg.ok ? "var(--ds-success)" : "#ef4444" }}>{msg.text}</span>}
      </div>

      {preview && (
        <div onClick={() => setPreview(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 60, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ width: 640, maxWidth: "100%", height: "86vh", background: "#fff", borderRadius: 12, overflow: "hidden", display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", borderBottom: "1px solid #eee" }}>
              <span style={{ fontWeight: 800, color: "#111" }}>Aperçu de l'e-mail</span>
              <button aria-label="Fermer l'aperçu" title="Fermer l'aperçu" onClick={() => setPreview(false)} style={{ ...btn, padding: 8 }}><X size={16} aria-hidden="true" /></button>
            </div>
            <iframe title="preview" srcDoc={html} style={{ flex: 1, border: "none", width: "100%", background: "#f4f4f4" }} />
          </div>
        </div>
      )}
    </div>
  )
}


const SITE_BASE = "https://inovdigitalservices.com"

type LinkItem = { label: string; path: string; hint?: string }

const PAGE_LINKS: LinkItem[] = [
  { label: "Accueil", path: "/", hint: "Page d'accueil complète" },
  { label: "Demander un devis", path: "/devis", hint: "Formulaire de devis" },
  { label: "Paiement", path: "/paiement", hint: "Régler une commande" },
  { label: "Compte client & parrainage", path: "/compte", hint: "Espace client, lien ambassadeur" },
  { label: "Blog", path: "/blog", hint: "Tous les articles" },
  { label: "Directions", path: "/directions", hint: "Nous trouver / itinéraire" },
  { label: "Mentions légales", path: "/mentions-legales" },
  { label: "Confidentialité", path: "/confidentialite" },
]

const SECTION_LINKS: LinkItem[] = [
  { label: "Services", path: "/#services", hint: "Cartes de service" },
  { label: "Pourquoi nous", path: "/#why-us" },
  { label: "Tarifs", path: "/#pricing", hint: "Grille de prix + panier" },
  { label: "Promo en ligne (Haïti)", path: "/#promo-en-ligne", hint: "Visible en Haïti" },
  { label: "Portfolio", path: "/#portfolio", hint: "Réalisations" },
  { label: "Témoignages", path: "/#testimonials" },
  { label: "Blog", path: "/blog", hint: "Page blog dédiée" },
  { label: "FAQ", path: "/#faq" },
  { label: "Contact", path: "/#contact", hint: "Formulaire de contact" },
]

// Tailored per-service brief forms the admin can send to clients so they answer
// the essential questions (and upload references) before a project kicks off.
const BRIEF_LINKS: LinkItem[] = [
  { label: "Brief — Logo", path: "/brief/logo", hint: "Questions ciblées pour un logo" },
  { label: "Brief — Branding & identité", path: "/brief/branding", hint: "Marque de A à Z" },
  { label: "Brief — Site web", path: "/brief/site", hint: "Objectifs, pages, fonctionnalités" },
  { label: "Brief — Montage vidéo", path: "/brief/video", hint: "Montage de vos propres rushes" },
  { label: "Brief — Retouche photo", path: "/brief/retouche", hint: "Retouche de vos propres photos" },
  { label: "Brief — Motion design", path: "/brief/motion", hint: "Animation, style, message" },
  { label: "Brief — Présentation PowerPoint", path: "/brief/powerpoint", hint: "Occasion, slides, format" },
  { label: "Brief — Autre projet", path: "/brief/other", hint: "Besoin sur mesure" },
]

function LinkRow({ label, path, hint }: LinkItem) {
  const [copied, setCopied] = useState(false)
  const url = SITE_BASE + path

  async function copy() {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true); setTimeout(() => setCopied(false), 1800)
    } catch { /* clipboard blocked — the field is still selectable below */ }
  }
  // Friendly, company-branded message so the client instantly knows the sender.
  const waText = `Bonjour ! Voici le lien vers « ${label} » sur INOV Digital Services :\n${url}`
  const waHref = `https://wa.me/?text=${encodeURIComponent(waText)}`

  return (
    <div className="adm-row" style={{
      display: "flex", alignItems: "center", gap: 12, padding: "11px 12px",
      borderTop: "1px solid var(--ds-border)", minWidth: 0,
    }}>
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{ fontSize: 14, fontWeight: 700 }}>{label}</div>
        <div style={{
          fontSize: 11.5, color: "var(--ds-text-faint)", fontFamily: "var(--font-space), monospace",
          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
        }}>{url}{hint ? <span style={{ fontFamily: "inherit", marginLeft: 8, color: "var(--ds-text-muted)" }}>· {hint}</span> : null}</div>
      </div>
      <button onClick={copy} style={{ ...btn, padding: "7px 12px", fontSize: 12.5 }}>
        {copied ? <Check size={14} /> : <Copy size={14} />} {copied ? "Copié" : "Copier"}
      </button>
      <a href={path} target="_blank" rel="noreferrer" style={{ ...btn, padding: "7px 12px", fontSize: 12.5, textDecoration: "none" }}>
        <ExternalLink size={14} /> Ouvrir
      </a>
      <a href={waHref} target="_blank" rel="noreferrer" style={{ ...btn, padding: "7px 12px", fontSize: 12.5, textDecoration: "none" }}>
        <Send size={14} /> WhatsApp
      </a>
    </div>
  )
}

// Build a dedicated link for a given language and/or country: ?lang= sets the
// interface language, ?region=/?currency= pin the pricing to that country so the
// visitor lands already in their language and local prices — no auto-detection.
const LINK_DESTINATIONS: LinkItem[] = [...PAGE_LINKS, ...BRIEF_LINKS]

function LangCountryLinks() {
  const [dest, setDest] = useState("/")
  const [lang, setLang] = useState<Lang | "">("")
  const [region, setRegion] = useState<RegionCode | "">("")
  const [copied, setCopied] = useState(false)

  const q = new URLSearchParams()
  if (lang) q.set("lang", lang)
  if (region) { q.set("region", region); q.set("currency", REGIONS[region].currency) }
  const qs = q.toString()
  const url = `${SITE_BASE}${dest}${qs ? `${dest.includes("?") ? "&" : "?"}${qs}` : ""}`

  async function copy() {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true); setTimeout(() => setCopied(false), 1800)
    } catch { /* clipboard blocked */ }
  }
  const langName = lang ? (LANGS.find((l) => l.code === lang)?.label ?? lang) : ""
  const regionName = region ? REGIONS[region].label : ""
  const waText = `Bonjour ! Voici votre lien INOV Digital Services${langName ? ` en ${langName}` : ""}${regionName ? ` (${regionName})` : ""} :\n${url}`
  const waHref = `https://wa.me/?text=${encodeURIComponent(waText)}`

  const selStyle = { ...input, cursor: "pointer" as const }

  return (
    <div style={{ ...card, padding: 0, overflow: "hidden" }}>
      <div style={{ padding: "16px 16px 4px" }}>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, fontFamily: "var(--font-space), sans-serif" }}>Liens par langue &amp; pays</h2>
        <p style={{ margin: "6px 0 14px", fontSize: 13, color: "var(--ds-text-muted)", lineHeight: 1.5 }}>
          Générez un lien dédié : le client arrive directement dans sa langue et, si vous choisissez un pays, avec les prix affichés dans sa monnaie locale.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 14 }}>
          <div>
            <span style={{ fontSize: 12.5, fontWeight: 700, color: "var(--ds-text-sec)", display: "block", marginBottom: 5 }}>Page</span>
            <select value={dest} onChange={(e) => setDest(e.target.value)} style={selStyle}>
              {LINK_DESTINATIONS.map((l) => <option key={l.path} value={l.path}>{l.label}</option>)}
            </select>
          </div>
          <div>
            <span style={{ fontSize: 12.5, fontWeight: 700, color: "var(--ds-text-sec)", display: "block", marginBottom: 5 }}>Langue</span>
            <select value={lang} onChange={(e) => setLang(e.target.value as Lang | "")} style={selStyle}>
              <option value="">Automatique</option>
              {LANGS.map((l) => <option key={l.code} value={l.code}>{l.flag} {l.label}</option>)}
            </select>
          </div>
          <div>
            <span style={{ fontSize: 12.5, fontWeight: 700, color: "var(--ds-text-sec)", display: "block", marginBottom: 5 }}>Pays / monnaie</span>
            <select value={region} onChange={(e) => setRegion(e.target.value as RegionCode | "")} style={selStyle}>
              <option value="">Automatique</option>
              {(Object.values(REGIONS)).map((r) => <option key={r.code} value={r.code}>{r.flag} {r.label} · {r.currency}</option>)}
            </select>
          </div>
        </div>
        <div style={{
          fontSize: 12, color: "var(--ds-text-faint)", fontFamily: "var(--font-space), monospace",
          padding: "10px 12px", borderRadius: 10, background: "var(--ds-surface-2, rgba(0,0,0,.04))",
          wordBreak: "break-all", marginBottom: 12,
        }}>{url}</div>
        <div style={{ display: "flex", gap: 10, paddingBottom: 16, flexWrap: "wrap" }}>
          <button onClick={copy} style={{ ...btn, padding: "9px 14px", fontSize: 13 }}>
            {copied ? <Check size={15} /> : <Copy size={15} />} {copied ? "Copié" : "Copier le lien"}
          </button>
          <a href={waHref} target="_blank" rel="noreferrer" style={{ ...btn, padding: "9px 14px", fontSize: 13, textDecoration: "none" }}>
            <Send size={15} /> Envoyer par WhatsApp
          </a>
        </div>
      </div>
    </div>
  )
}

function LinksTab() {
  // Custom pre-filled payment link builder (/paiement?amount=&name=&ref=).
  const [amount, setAmount] = useState("")
  const [clientName, setClientName] = useState("")
  const [ref, setRef] = useState("")
  const [copied, setCopied] = useState(false)

  const payQuery = new URLSearchParams()
  if (amount.trim()) payQuery.set("amount", amount.trim())
  if (clientName.trim()) payQuery.set("name", clientName.trim())
  if (ref.trim()) payQuery.set("ref", ref.trim())
  const qs = payQuery.toString()
  const payUrl = `${SITE_BASE}/paiement${qs ? `?${qs}` : ""}`

  async function copyPay() {
    try {
      await navigator.clipboard.writeText(payUrl)
      setCopied(true); setTimeout(() => setCopied(false), 1800)
    } catch { /* clipboard blocked */ }
  }
  const greeting = clientName.trim() ? ` ${clientName.trim().split(/\s+/)[0]}` : ""
  const amtLabel = amount.trim() ? ` (${amount.trim()} USD${ref.trim() ? `, réf. ${ref.trim()}` : ""})` : ""
  const payWaText = `Bonjour${greeting} ! Voici votre lien de paiement sécurisé chez INOV Digital Services${amtLabel} :\n${payUrl}`
  const payWaHref = `https://wa.me/?text=${encodeURIComponent(payWaText)}`

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <div style={{ ...card, padding: 0, overflow: "hidden" }}>
        <div style={{ padding: "16px 16px 4px" }}>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, fontFamily: "var(--font-space), sans-serif" }}>Pages du site</h2>
          <p style={{ margin: "6px 0 8px", fontSize: 13, color: "var(--ds-text-muted)", lineHeight: 1.5 }}>
            Copiez un lien ou envoyez-le directement par WhatsApp pour diriger un client vers la bonne page.
          </p>
        </div>
        {PAGE_LINKS.map((l) => <LinkRow key={l.path} {...l} />)}
      </div>

      <LangCountryLinks />

      <div style={{ ...card, padding: 0, overflow: "hidden" }}>
        <div style={{ padding: "16px 16px 4px" }}>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, fontFamily: "var(--font-space), sans-serif" }}>Formulaires de brief</h2>
          <p style={{ margin: "6px 0 8px", fontSize: 13, color: "var(--ds-text-muted)", lineHeight: 1.5 }}>
            Envoyez le formulaire adapté au service : le client répond aux questions essentielles et peut joindre images, documents ou vidéos. Les réponses arrivent dans « Devis &amp; contacts ».
          </p>
        </div>
        {BRIEF_LINKS.map((l) => <LinkRow key={l.path} {...l} />)}
      </div>

      <div style={{ ...card, padding: 0, overflow: "hidden" }}>
        <div style={{ padding: "16px 16px 4px" }}>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, fontFamily: "var(--font-space), sans-serif" }}>Sections de l'accueil</h2>
          <p style={{ margin: "6px 0 8px", fontSize: 13, color: "var(--ds-text-muted)", lineHeight: 1.5 }}>
            Ces liens ouvrent l'accueil et défilent automatiquement jusqu'à la section voulue.
          </p>
        </div>
        {SECTION_LINKS.map((l) => <LinkRow key={l.path} {...l} />)}
      </div>

      <div style={{ ...card, maxWidth: 620 }}>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, fontFamily: "var(--font-space), sans-serif" }}>Lien de paiement personnalisé</h2>
        <p style={{ margin: "6px 0 16px", fontSize: 13, color: "var(--ds-text-muted)", lineHeight: 1.5 }}>
          Pré-remplit la page de paiement avec le montant, le nom du client et une référence.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div>
            <span style={{ fontSize: 12.5, fontWeight: 700, color: "var(--ds-text-sec)", display: "block", marginBottom: 5 }}>Montant (USD)</span>
            <input type="number" min={0} step={1} value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="150" style={input} />
          </div>
          <div>
            <span style={{ fontSize: 12.5, fontWeight: 700, color: "var(--ds-text-sec)", display: "block", marginBottom: 5 }}>Référence</span>
            <input value={ref} onChange={(e) => setRef(e.target.value)} placeholder="INV-2026-014" style={input} />
          </div>
          <div style={{ gridColumn: "1 / -1" }}>
            <span style={{ fontSize: 12.5, fontWeight: 700, color: "var(--ds-text-sec)", display: "block", marginBottom: 5 }}>Nom du client</span>
            <input value={clientName} onChange={(e) => setClientName(e.target.value)} placeholder="Marie Joseph" style={input} />
          </div>
        </div>
        <div style={{
          marginTop: 14, padding: "10px 12px", borderRadius: "var(--r-md)",
          background: "var(--ds-bg-sec)", border: "1px solid var(--ds-border)",
          fontSize: 12.5, fontFamily: "var(--font-space), monospace", color: "var(--ds-text-sec)",
          wordBreak: "break-all", lineHeight: 1.5,
        }}>{payUrl}</div>
        <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
          <button onClick={copyPay} style={{ ...btnPrimary, padding: "9px 16px", fontSize: 13.5 }}>
            {copied ? <Check size={15} /> : <Copy size={15} />} {copied ? "Copié" : "Copier le lien"}
          </button>
          <a href={payWaHref} target="_blank" rel="noreferrer" style={{ ...btn, textDecoration: "none" }}>
            <Send size={15} /> Envoyer par WhatsApp
          </a>
        </div>
      </div>
    </div>
  )
}


export { NewsletterTab, CampaignsTab, LinksTab }
