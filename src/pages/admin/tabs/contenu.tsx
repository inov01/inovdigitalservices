// Contenu du site: formations, collaborateurs, tarifs, services, portfolio, blog.
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

const emptyFormation: Formation = {
  id: "", published: false, title: "", summary: "", description: "",
  level: "debutant", format: "en-ligne", durationHours: 0, free: true, price: 0,
  image: "", ogImage: "", instructor: "", startDate: "", seats: 0, syllabus: [], order: 0,
  type: "cours", liveUrl: "", replayUrl: "", resourcesUrl: "",
  startDateTime: "", endDateTime: "", isLive: false, recordingDate: "", tags: [],
}
const FMT_LEVEL: Record<Formation["level"], string> = { debutant: "Débutant", intermediaire: "Intermédiaire", avance: "Avancé" }
const FMT_FORMAT: Record<Formation["format"], string> = { "en-ligne": "En ligne", presentiel: "Présentiel", hybride: "Hybride" }
const FMT_TYPE: Record<NonNullable<Formation["type"]>, string> = { cours: "Cours", live: "Live", conference: "Conférence", replay: "Replay / Enregistrement" }
const TYPE_COLOR: Record<NonNullable<Formation["type"]>, string> = { cours: "#1D4ED8", live: "#DC2626", conference: "#7C3AED", replay: "#059669" }

function FormationTab() {
  const [items, setItems] = useState<Formation[]>([])
  const [enrollments, setEnrollments] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [draft, setDraft] = useState<Formation | null>(null)
  const [busy, setBusy] = useState(false)

  async function load() {
    setLoading(true)
    try {
      const [f, e] = await Promise.all([adminApi.listFormations(), adminApi.listEnrollments()])
      setItems(f.formations); setEnrollments(e.enrollments)
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  async function save() {
    if (!draft || !draft.title.trim()) return
    setBusy(true)
    try { await adminApi.saveFormation(draft); setDraft(null); await load() }
    catch (e) { console.error(e); alert("Enregistrement impossible.") }
    finally { setBusy(false) }
  }
  async function togglePublish(f: Formation) {
    setBusy(true)
    try { await adminApi.saveFormation({ ...f, published: !f.published }); await load() }
    catch (e) { console.error(e) }
    finally { setBusy(false) }
  }
  async function remove(id: string) {
    if (!confirm("Supprimer cette formation ? Action définitive.")) return
    setBusy(true)
    try { await adminApi.deleteFormation(id); await load() }
    catch (e) { console.error(e) }
    finally { setBusy(false) }
  }

  const enrollFor = (id: string) => enrollments.filter((e) => e.meta?.formationId === id)

  if (loading && items.length === 0) return <ListSkeleton />

  const smallInput: React.CSSProperties = { ...input, padding: "9px 12px", fontSize: 14 }
  const fieldLabel: React.CSSProperties = { display: "block", fontSize: 12.5, fontWeight: 700, color: "var(--ds-text-sec)", marginBottom: 5 }

  return (
    <div style={{ display: "grid", gap: 18 }}>
      {/* Editor */}
      {draft ? (
        <div style={{ ...card }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <GraduationCap size={18} color="var(--ds-accent)" />
            <span style={{ fontWeight: 800, fontSize: 15.5 }}>{draft.id ? "Modifier la formation" : "Nouvelle formation"}</span>
          </div>
          <div style={{ display: "grid", gap: 14 }}>
            <div><label style={fieldLabel}>Titre</label><input style={smallInput} value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} /></div>
            <div><label style={fieldLabel}>Résumé (carte)</label><input style={smallInput} value={draft.summary} onChange={(e) => setDraft({ ...draft, summary: e.target.value })} /></div>
            <div><label style={fieldLabel}>Description complète</label><textarea style={{ ...smallInput, minHeight: 90, resize: "vertical" }} value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} /></div>
            <div className="adm-doc-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
              <div>
                <label style={fieldLabel}>Niveau</label>
                <select style={smallInput} value={draft.level} onChange={(e) => setDraft({ ...draft, level: e.target.value as Formation["level"] })}>
                  {Object.entries(FMT_LEVEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
              <div>
                <label style={fieldLabel}>Format</label>
                <select style={smallInput} value={draft.format} onChange={(e) => setDraft({ ...draft, format: e.target.value as Formation["format"] })}>
                  {Object.entries(FMT_FORMAT).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
              <div><label style={fieldLabel}>Durée (heures)</label><input type="number" min={0} style={smallInput} value={draft.durationHours} onChange={(e) => setDraft({ ...draft, durationHours: Number(e.target.value) })} /></div>
            </div>

            {/* ── Type de session (live / conférence / replay) ── */}
            <div style={{ borderTop: "1px solid var(--ds-border)", paddingTop: 14 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 12 }}>
                <span style={{ fontSize: 12, fontWeight: 800, color: "var(--ds-accent)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Session en direct &amp; enregistrement</span>
              </div>
              <div className="adm-doc-grid" style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 14 }}>
                <div>
                  <label style={fieldLabel}>Type de session</label>
                  <select style={smallInput} value={draft.type ?? "cours"} onChange={(e) => setDraft({ ...draft, type: e.target.value as Formation["type"] })}>
                    {Object.entries(FMT_TYPE).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </div>
                {(draft.type === "live" || draft.type === "conference") && (
                  <div>
                    <label style={fieldLabel}>En direct maintenant</label>
                    <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, cursor: "pointer", marginTop: 10 }}>
                      <input type="checkbox" checked={draft.isLive ?? false} onChange={(e) => setDraft({ ...draft, isLive: e.target.checked })} />
                      Marquer comme LIVE actif
                    </label>
                  </div>
                )}
              </div>

              {(draft.type === "live" || draft.type === "conference") && (
                <div style={{ marginTop: 14, display: "grid", gap: 14 }}>
                  <div><label style={fieldLabel}>Lien de diffusion (Zoom / Meet / YouTube Live)</label><input style={smallInput} placeholder="https://meet.google.com/..." value={draft.liveUrl ?? ""} onChange={(e) => setDraft({ ...draft, liveUrl: e.target.value })} /></div>
                  <div className="adm-doc-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                    <div><label style={fieldLabel}>Date et heure de début</label><input type="datetime-local" style={smallInput} value={draft.startDateTime ?? ""} onChange={(e) => setDraft({ ...draft, startDateTime: e.target.value })} /></div>
                    <div><label style={fieldLabel}>Date et heure de fin</label><input type="datetime-local" style={smallInput} value={draft.endDateTime ?? ""} onChange={(e) => setDraft({ ...draft, endDateTime: e.target.value })} /></div>
                  </div>
                </div>
              )}

              {(draft.type === "replay") && (
                <div style={{ marginTop: 14, display: "grid", gap: 14 }}>
                  <div><label style={fieldLabel}>URL de l'enregistrement (YouTube / mp4)</label><input style={smallInput} placeholder="https://youtube.com/embed/..." value={draft.replayUrl ?? ""} onChange={(e) => setDraft({ ...draft, replayUrl: e.target.value })} /></div>
                  <div className="adm-doc-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                    <div><label style={fieldLabel}>Date d'enregistrement</label><input type="date" style={smallInput} value={draft.recordingDate ?? ""} onChange={(e) => setDraft({ ...draft, recordingDate: e.target.value })} /></div>
                    <div><label style={fieldLabel}>Ressources (PDF / lien)</label><input style={smallInput} placeholder="https://..." value={draft.resourcesUrl ?? ""} onChange={(e) => setDraft({ ...draft, resourcesUrl: e.target.value })} /></div>
                  </div>
                </div>
              )}

              {(draft.type === "cours") && (
                <div style={{ marginTop: 14, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }} className="adm-doc-grid">
                  <div><label style={fieldLabel}>Lien vidéo / replay (optionnel)</label><input style={smallInput} placeholder="https://youtube.com/embed/..." value={draft.replayUrl ?? ""} onChange={(e) => setDraft({ ...draft, replayUrl: e.target.value })} /></div>
                  <div><label style={fieldLabel}>Ressources (PDF / lien)</label><input style={smallInput} placeholder="https://..." value={draft.resourcesUrl ?? ""} onChange={(e) => setDraft({ ...draft, resourcesUrl: e.target.value })} /></div>
                </div>
              )}
            </div>

            <div className="adm-doc-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
              <div>
                <label style={fieldLabel}>Tarif</label>
                <select style={smallInput} value={draft.free ? "free" : "paid"} onChange={(e) => setDraft({ ...draft, free: e.target.value === "free" })}>
                  <option value="free">Gratuite</option>
                  <option value="paid">Payante</option>
                </select>
              </div>
              <div><label style={fieldLabel}>Prix (USD)</label><input type="number" min={0} disabled={draft.free} style={{ ...smallInput, opacity: draft.free ? 0.5 : 1 }} value={draft.price} onChange={(e) => setDraft({ ...draft, price: Number(e.target.value) })} /></div>
              <div><label style={fieldLabel}>Places (0 = illimité)</label><input type="number" min={0} style={smallInput} value={draft.seats ?? 0} onChange={(e) => setDraft({ ...draft, seats: Number(e.target.value) })} /></div>
            </div>
            <div className="adm-doc-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
              <div><label style={fieldLabel}>Formateur</label><input style={smallInput} value={draft.instructor ?? ""} onChange={(e) => setDraft({ ...draft, instructor: e.target.value })} /></div>
              <div><label style={fieldLabel}>Début (texte libre)</label><input style={smallInput} placeholder="Ex. 15 oct." value={draft.startDate ?? ""} onChange={(e) => setDraft({ ...draft, startDate: e.target.value })} /></div>
              <div><label style={fieldLabel}>Ordre d'affichage</label><input type="number" style={smallInput} value={draft.order ?? 0} onChange={(e) => setDraft({ ...draft, order: Number(e.target.value) })} /></div>
            </div>
            <div><label style={fieldLabel}>Image (URL)</label><input style={smallInput} value={draft.image ?? ""} onChange={(e) => setDraft({ ...draft, image: e.target.value })} /></div>
            <div>
              <label style={fieldLabel}>Image d'aperçu de partage (URL, idéalement 1200×630)</label>
              <input style={smallInput} placeholder="Affichée quand le lien est partagé (WhatsApp, Facebook…). À défaut, l'image ci-dessus est utilisée." value={draft.ogImage ?? ""} onChange={(e) => setDraft({ ...draft, ogImage: e.target.value })} />
            </div>
            <div>
              <label style={fieldLabel}>Programme (une ligne par module)</label>
              <textarea style={{ ...smallInput, minHeight: 90, resize: "vertical" }} value={(draft.syllabus ?? []).join("\n")}
                onChange={(e) => setDraft({ ...draft, syllabus: e.target.value.split("\n").map((x) => x.trim()).filter(Boolean) })} />
            </div>
            <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
              <input type="checkbox" checked={draft.published} onChange={(e) => setDraft({ ...draft, published: e.target.checked })} />
              Publier immédiatement (visible sur le site)
            </label>
            <div style={{ display: "flex", gap: 10 }}>
              <button style={btnPrimary} onClick={save} disabled={busy || !draft.title.trim()}><Check size={15} /> Enregistrer</button>
              <button style={btn} onClick={() => setDraft(null)} disabled={busy}><X size={15} /> Annuler</button>
            </div>
          </div>
        </div>
      ) : (
        <button style={{ ...btnPrimary, alignSelf: "flex-start" }} onClick={() => setDraft({ ...emptyFormation })}>
          <Plus size={16} /> Nouvelle formation
        </button>
      )}

      {/* Catalogue */}
      <div style={{ ...card, padding: 0, overflow: "hidden" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "13px 18px", borderBottom: "1px solid var(--ds-border)" }}>
          <GraduationCap size={16} color="var(--ds-accent)" />
          <span style={{ fontWeight: 800, fontSize: 14.5 }}>Catalogue</span>
          <span style={{ marginLeft: "auto", fontSize: 12.5, color: "var(--ds-text-faint)", fontWeight: 600 }}>{items.length}</span>
        </div>
        {items.length === 0
          ? <div style={{ padding: 34, textAlign: "center", color: "var(--ds-text-muted)" }}>Aucune formation. Crée la première ci-dessus.</div>
          : items.map((f) => {
            const en = enrollFor(f.id)
            return (
              <div key={f.id} className="adm-row" style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 18px", borderBottom: "1px solid var(--ds-border)" }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 3 }}>
                    <span style={{ fontWeight: 700, fontSize: 14.5 }}>{f.title}</span>
                    {/* Session type badge */}
                    {f.type && f.type !== "cours" && (
                      <span style={{ fontSize: 11, fontWeight: 800, padding: "1px 8px", borderRadius: "var(--r-full)", background: TYPE_COLOR[f.type] + "22", color: TYPE_COLOR[f.type], letterSpacing: "0.04em", textTransform: "uppercase" }}>
                        {FMT_TYPE[f.type]}
                      </span>
                    )}
                    {/* LIVE pulse dot */}
                    {f.isLive && (
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 800, padding: "1px 9px", borderRadius: "var(--r-full)", background: "#DC262622", color: "#DC2626" }}>
                        <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#DC2626", display: "inline-block", animation: "admShimmer 1s ease-in-out infinite" }} />
                        EN DIRECT
                      </span>
                    )}
                    <span style={{ fontSize: 11.5, fontWeight: 700, padding: "1px 8px", borderRadius: "var(--r-full)", background: f.published ? "var(--ds-accent-a12)" : "var(--ds-bg-sec)", color: f.published ? "var(--ds-accent-text)" : "var(--ds-text-faint)" }}>
                      {f.published ? "Publiée" : "Brouillon"}
                    </span>
                    <span style={{ fontSize: 11.5, fontWeight: 700, padding: "1px 8px", borderRadius: "var(--r-full)", background: "var(--ds-bg-sec)", color: f.free ? "var(--ds-success)" : "var(--ds-text-muted)" }}>
                      {f.free ? "Gratuite" : `$${f.price}`}
                    </span>
                  </div>
                  <div style={{ fontSize: 12, color: "var(--ds-text-faint)" }}>
                    {FMT_LEVEL[f.level]} · {FMT_FORMAT[f.format]}{f.durationHours ? ` · ${f.durationHours}h` : ""}
                    {f.startDateTime ? ` · ${new Date(f.startDateTime).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" })}` : ""}
                    {f.replayUrl ? " · Replay disponible" : ""}
                    {` · ${en.length} inscrit${en.length > 1 ? "s" : ""}`}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                  {/* Toggle live status for live/conference sessions */}
                  {(f.type === "live" || f.type === "conference") && f.liveUrl && (
                    <a href={f.liveUrl} target="_blank" rel="noopener noreferrer" aria-label="Ouvrir le lien de diffusion" style={{ ...btn, padding: "6px 10px", color: f.isLive ? "#DC2626" : "var(--ds-text)", borderColor: f.isLive ? "#DC262640" : "var(--ds-border)", textDecoration: "none" }}>
                      <ExternalLink size={14} />
                    </a>
                  )}
                  {(f.type === "replay") && f.replayUrl && (
                    <a href={f.replayUrl} target="_blank" rel="noopener noreferrer" aria-label="Voir l'enregistrement" style={{ ...btn, padding: "6px 10px", color: "#059669", borderColor: "#05986940", textDecoration: "none" }}>
                      <ExternalLink size={14} />
                    </a>
                  )}
                  <button onClick={() => togglePublish(f)} disabled={busy} aria-label={f.published ? "Dépublier" : "Publier"} style={{ ...btn, padding: "6px 10px" }}>
                    {f.published ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                  <button onClick={() => setDraft(f)} disabled={busy} aria-label="Modifier" style={{ ...btn, padding: "6px 10px" }}><FileText size={14} /></button>
                  <button onClick={() => remove(f.id)} disabled={busy} aria-label="Supprimer" style={{ ...btn, padding: "6px 10px", color: "var(--ds-danger)", borderColor: "var(--ds-danger-a40)" }}><Trash2 size={14} /></button>
                </div>
              </div>
            )
          })}
      </div>

      {/* Enrollments */}
      <div style={{ ...card, padding: 0, overflow: "hidden" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "13px 18px", borderBottom: "1px solid var(--ds-border)" }}>
          <Users size={16} color="var(--ds-accent)" />
          <span style={{ fontWeight: 800, fontSize: 14.5 }}>Inscrits</span>
          <span style={{ marginLeft: "auto", fontSize: 12.5, color: "var(--ds-text-faint)", fontWeight: 600 }}>{enrollments.length}</span>
        </div>
        <div style={{ padding: "10px 18px", fontSize: 12, color: "var(--ds-text-faint)", borderBottom: "1px solid var(--ds-border)" }}>
          Le suivi des paiements (reçu, statut « gagné ») se fait dans l'onglet <strong>Devis &amp; contacts</strong> — chaque inscription y apparaît comme un lead.
        </div>
        {enrollments.length === 0
          ? <div style={{ padding: 34, textAlign: "center", color: "var(--ds-text-muted)" }}>Aucune inscription pour l'instant.</div>
          : enrollments.map((e) => (
            <div key={e.id} className="adm-row" style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 18px", borderBottom: "1px solid var(--ds-border)" }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{e.name || "—"} <span style={{ fontWeight: 500, color: "var(--ds-text-muted)", fontSize: 12.5 }}>· {e.email}</span></div>
                <div style={{ fontSize: 12, color: "var(--ds-text-faint)" }}>{String(e.meta?.formationTitle ?? "—")} · {new Date(e.createdAt).toLocaleDateString("fr-FR")}</div>
              </div>
              <span style={{ fontSize: 11.5, fontWeight: 700, padding: "2px 9px", borderRadius: "var(--r-full)", background: e.status === "won" ? "var(--ds-accent-a12)" : "var(--ds-bg-sec)", color: e.status === "won" ? "var(--ds-accent-text)" : "var(--ds-text-muted)" }}>
                {e.status === "won" ? "Validé" : e.status === "contacted" ? "Contacté" : e.status === "lost" ? "Annulé" : "Nouveau"}
              </span>
            </div>
          ))}
      </div>
    </div>
  )
}

// ── Collaborateurs tab: moderate professional listings for the public gallery ──

function CollaborateursTab() {
  const [items, setItems] = useState<Collaborateur[]>([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState<string | null>(null)

  async function load() {
    setLoading(true)
    try { const r = await adminApi.listCollaborateurs(); setItems(r.collaborateurs) }
    catch (e) { console.error(e) }
    finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  const pending = useMemo(() => items.filter((x) => x.status === "pending"), [items])
  const approved = useMemo(() => items.filter((x) => x.status === "approved"), [items])

  async function approve(id: string) {
    setBusy(id)
    try { await adminApi.approveCollaborateur(id); await load() }
    catch (e) { console.error(e) }
    finally { setBusy(null) }
  }
  async function remove(id: string) {
    if (!confirm("Supprimer ce collaborateur ? Action définitive.")) return
    setBusy(id)
    try { await adminApi.deleteCollaborateur(id); await load() }
    catch (e) { console.error(e) }
    finally { setBusy(null) }
  }

  if (loading && items.length === 0) return <ListSkeleton />

  const Row = ({ x }: { x: Collaborateur }) => {
    const accent = x.accent || "#F7931E"
    const initials = (x.name || "IN").trim().split(/\s+/).slice(0, 2).map((w) => w[0]).join("").toUpperCase()
    return (
      <div className="adm-row" style={{ display: "flex", alignItems: "flex-start", gap: 14, padding: "14px 18px", borderBottom: "1px solid var(--ds-border)" }}>
        <div style={{ width: 46, height: 46, borderRadius: "var(--r-full)", flexShrink: 0, overflow: "hidden",
          background: x.photoUrl ? `center/cover no-repeat url(${x.photoUrl})` : `linear-gradient(135deg, ${accent}, #FF6B35)`,
          display: "grid", placeItems: "center", color: "#fff", fontWeight: 800, fontSize: 16 }}>
          {!x.photoUrl && initials}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 3 }}>
            <span style={{ fontWeight: 700, fontSize: 14.5 }}>{x.name}</span>
            <span style={{ fontSize: 12.5, color: "var(--ds-text-muted)" }}>· {x.profession}</span>
            {x.city && <span style={{ display: "inline-flex", alignItems: "center", gap: 3, fontSize: 12, color: "var(--ds-text-faint)" }}><MapPin size={11} /> {x.city}</span>}
          </div>
          <p style={{ margin: "0 0 5px", fontSize: 13.5, color: "var(--ds-text-sec)", lineHeight: 1.5 }}>
            <strong>{x.service}</strong>{x.description ? ` — ${x.description}` : ""}{x.price ? ` · ${x.price}` : ""}
          </p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", fontSize: 12, color: "var(--ds-text-faint)" }}>
            {x.whatsapp && <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}><MessageCircle size={12} /> {x.whatsapp}</span>}
            {x.email && <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}><Mail size={12} /> {x.email}</span>}
            {x.instagram && <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}><AtSign size={12} /> {x.instagram}</span>}
            {x.website && <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}><Globe size={12} /> {x.website}</span>}
          </div>
          <div style={{ fontSize: 11.5, color: "var(--ds-text-faint)", marginTop: 5 }}>{new Date(x.createdAt).toLocaleString("fr-FR")}</div>
        </div>
        <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
          {x.status === "pending" && (
            <button onClick={() => approve(x.id)} disabled={busy === x.id} style={{ ...btn, padding: "6px 12px", color: "var(--ds-accent-text)", borderColor: "var(--ds-accent-a45)" }}>
              <Check size={14} /> Valider
            </button>
          )}
          <button onClick={() => remove(x.id)} disabled={busy === x.id} aria-label="Supprimer" style={{ ...btn, padding: "6px 10px", color: "var(--ds-danger)", borderColor: "var(--ds-danger-a40)" }}>
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ display: "grid", gap: 18 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
        <span style={{ fontSize: 12.5, color: "var(--ds-text-faint)" }}>Espace public non lié depuis le site (bientôt disponible).</span>
        <a
          href="/collaborateur"
          target="_blank"
          rel="noopener noreferrer"
          style={{ ...btn, padding: "6px 12px", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 6 }}
        >
          <ExternalLink size={14} /> Ouvrir l'espace public
        </a>
      </div>
      <div style={{ ...card, padding: 0, overflow: "hidden" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "13px 18px", borderBottom: "1px solid var(--ds-border)" }}>
          <Bell size={16} color="var(--ds-accent)" />
          <span style={{ fontWeight: 800, fontSize: 14.5 }}>Candidatures à valider</span>
          <span style={{ marginLeft: "auto", fontSize: 12.5, color: "var(--ds-text-faint)", fontWeight: 600 }}>{pending.length}</span>
        </div>
        {pending.length === 0
          ? <div style={{ padding: 34, textAlign: "center", color: "var(--ds-text-muted)" }}>Aucune candidature en attente.</div>
          : pending.map((x) => <Row key={x.id} x={x} />)}
      </div>

      <div style={{ ...card, padding: 0, overflow: "hidden" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "13px 18px", borderBottom: "1px solid var(--ds-border)" }}>
          <Handshake size={16} color="var(--ds-accent)" />
          <span style={{ fontWeight: 800, fontSize: 14.5 }}>Collaborateurs publiés</span>
          <span style={{ marginLeft: "auto", fontSize: 12.5, color: "var(--ds-text-faint)", fontWeight: 600 }}>{approved.length}</span>
        </div>
        {approved.length === 0
          ? <div style={{ padding: 34, textAlign: "center", color: "var(--ds-text-muted)" }}>Aucun collaborateur publié pour l'instant.</div>
          : approved.map((x) => <Row key={x.id} x={x} />)}
      </div>
    </div>
  )
}

// ── Settings tab (announcement banner) ────────────────────────────────────────
// ── Pricing tab: edit service base prices (USD) ───────────────────────────────

function PricingTab() {
  const [settings, setSettings] = useState<SiteSettings | null>(null)
  const [draft, setDraft] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    adminApi.getSettings()
      .then((r) => {
        setSettings(r.settings)
        const d: Record<string, string> = {}
        for (const [k, v] of Object.entries(r.settings.pricing ?? {})) d[k] = String(v)
        setDraft(d)
      })
      .catch(() => setSettings({ announcement: { enabled: false, text: "", link: "" }, pricing: {} }))
  }, [])

  const editable = pricingServices.filter((s) => !s.quoteOnly)

  async function save() {
    if (!settings) return
    setSaving(true); setSaved(false)
    const pricing: Record<string, number> = {}
    for (const s of editable) {
      const raw = draft[s.id]
      if (raw == null || raw === "") continue
      const n = Number(raw)
      if (Number.isFinite(n) && n >= 0 && Math.round(n) !== s.price) pricing[s.id] = Math.round(n)
    }
    try {
      await adminApi.saveSettings({ ...settings, pricing })
      setSaved(true); setTimeout(() => setSaved(false), 2500)
    } finally { setSaving(false) }
  }

  if (!settings) return <Empty text="Chargement…" />

  return (
    <div style={{ ...card, maxWidth: 760, display: "flex", flexDirection: "column", gap: 4 }}>
      <div style={{ marginBottom: 12 }}>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, fontFamily: "var(--font-space), sans-serif" }}>Tarifs des services</h2>
        <p style={{ margin: "6px 0 0", fontSize: 13.5, color: "var(--ds-text-muted)", lineHeight: 1.5 }}>
          Prix de base en USD (formule Standard). Les formules Essentiel (×0,7) et Premium (×3) se recalculent
          automatiquement, ainsi que la conversion en devise locale sur le site public.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 0 }}>
        <div style={{ display: "contents" }}>
          {editable.map((s) => {
            const raw = draft[s.id]
            const eff = raw != null && raw !== "" && Number.isFinite(Number(raw)) ? Number(raw) : s.price
            return (
              <div key={s.id} style={{ display: "contents" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 2, padding: "11px 12px 11px 0", borderTop: "1px solid var(--ds-border)", minWidth: 0 }}>
                  <span style={{ fontSize: 14, fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{s.name}</span>
                  <span style={{ fontSize: 11.5, color: "var(--ds-text-faint)", fontFamily: "var(--font-space), monospace" }}>
                    Essentiel ${Math.round(eff * 0.7)} · Premium ${Math.round(eff * 3)} · défaut ${s.price}
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "11px 0", borderTop: "1px solid var(--ds-border)" }}>
                  <span style={{ color: "var(--ds-text-muted)", fontWeight: 700 }}>$</span>
                  <input
                    type="number" min={0} step={1}
                    value={raw ?? ""} placeholder={String(s.price)}
                    onChange={(e) => setDraft((p) => ({ ...p, [s.id]: e.target.value }))}
                    style={{ ...input, width: 110, padding: "9px 12px", fontFamily: "var(--font-space), monospace", fontWeight: 700 }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 20 }}>
        <button style={{ ...btnPrimary, opacity: saving ? 0.7 : 1 }} onClick={save} disabled={saving}>
          {saving ? <Loader2 size={15} style={{ animation: "spin 0.8s linear infinite" }} /> : null}
          Enregistrer les tarifs
        </button>
        {saved && <span style={{ color: "var(--ds-success)", fontSize: 13.5, fontWeight: 600 }}>Enregistré ✓</span>}
        <span style={{ marginLeft: "auto", fontSize: 12, color: "var(--ds-text-faint)" }}>Laisser vide = tarif par défaut</span>
      </div>
    </div>
  )
}

// ── Documents tab: generate a proforma or receipt, download or email it ────────

const NEW_SERVICE: AdminService = {
  id: 0, name: "", desc: "", price: 100, type: "static", advantage: "",
  deliveryDays: 5, revisions: 6, revisionDays: 7, exampleImg: "", projectUrl: "",
}

function ServicesTab() {
  const [settings, setSettings] = useState<SiteSettings | null>(null)
  const [removed, setRemoved] = useState<number[]>([])
  const [added, setAdded] = useState<AdminService[]>([])
  const [draft, setDraft] = useState<AdminService>({ ...NEW_SERVICE })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    adminApi.getSettings()
      .then((r) => {
        setSettings(r.settings)
        setRemoved(r.settings.servicesRemoved ?? [])
        setAdded(r.settings.servicesAdded ?? [])
      })
      .catch(() => setSettings({ announcement: { enabled: false, text: "", link: "" } }))
  }, [])

  async function persist(nextRemoved: number[], nextAdded: AdminService[]) {
    if (!settings) return
    setSaving(true); setSaved(false)
    try {
      const r = await adminApi.saveSettings({ ...settings, servicesRemoved: nextRemoved, servicesAdded: nextAdded })
      setSettings(r.settings)
      setRemoved(r.settings.servicesRemoved ?? nextRemoved)
      setAdded(r.settings.servicesAdded ?? nextAdded)
      setSaved(true); setTimeout(() => setSaved(false), 2500)
    } finally { setSaving(false) }
  }

  function toggleBuiltin(id: number) {
    const next = removed.includes(id) ? removed.filter((x) => x !== id) : [...removed, id]
    setRemoved(next); persist(next, added)
  }
  function removeAdded(id: number) {
    const next = added.filter((a) => a.id !== id)
    setAdded(next); persist(removed, next)
  }
  function addService() {
    if (!draft.name.trim()) return
    const maxId = Math.max(1000, ...pricingServices.map((s) => s.id), ...added.map((a) => a.id))
    const svc: AdminService = { ...draft, id: maxId + 1, name: draft.name.trim() }
    const next = [...added, svc]
    setAdded(next); setDraft({ ...NEW_SERVICE }); persist(removed, next)
  }

  if (!settings) return <Empty text="Chargement…" />

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18, maxWidth: 820 }}>
      {saving && <span style={{ fontSize: 12.5, color: "var(--ds-text-faint)" }}>Enregistrement…</span>}
      {saved && <span style={{ color: "var(--ds-success)", fontSize: 13.5, fontWeight: 600 }}>Enregistré ✓</span>}

      {/* Built-in services: show / hide */}
      <div style={{ ...card, display: "flex", flexDirection: "column", gap: 4 }}>
        <div style={{ marginBottom: 8 }}>
          <h2 style={sectionTitle}>Cartes de service du site</h2>
          <p style={{ margin: "6px 0 0", fontSize: 13.5, color: "var(--ds-text-muted)", lineHeight: 1.5 }}>
            Masquez une carte pour la retirer du site sans la supprimer. Réaffichez-la à tout moment.
          </p>
        </div>
        {pricingServices.map((s) => {
          const hidden = removed.includes(s.id)
          return (
            <div key={s.id} style={{
              display: "flex", alignItems: "center", gap: 12, padding: "11px 0",
              borderTop: "1px solid var(--ds-border)", opacity: hidden ? 0.5 : 1,
            }}>
              <div style={{ minWidth: 0, flex: 1 }}>
                <span style={{ fontSize: 14, fontWeight: 700 }}>{s.name}</span>
                <span style={{ marginLeft: 8, fontSize: 11.5, color: "var(--ds-text-faint)", fontFamily: "var(--font-space), monospace" }}>${s.price}</span>
              </div>
              <button style={{ ...btn, padding: "7px 12px" }} onClick={() => toggleBuiltin(s.id)} disabled={saving}>
                {hidden ? <><Eye size={14} /> Afficher</> : <><EyeOff size={14} /> Masquer</>}
              </button>
            </div>
          )
        })}
      </div>

      {/* Custom services added by admin */}
      {added.length > 0 && (
        <div style={{ ...card, display: "flex", flexDirection: "column", gap: 4 }}>
          <h2 style={{ ...sectionTitle, marginBottom: 8 }}>Cartes ajoutées</h2>
          {added.map((s) => (
            <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 0", borderTop: "1px solid var(--ds-border)" }}>
              <div style={{ minWidth: 0, flex: 1 }}>
                <span style={{ fontSize: 14, fontWeight: 700 }}>{s.name}</span>
                <span style={{ marginLeft: 8, fontSize: 11.5, color: "var(--ds-text-faint)", fontFamily: "var(--font-space), monospace" }}>{s.quoteOnly ? "sur devis" : `$${s.price}`}</span>
              </div>
              <button style={{ ...btn, padding: "7px 12px", color: "var(--ds-danger, #DC2626)" }} onClick={() => removeAdded(s.id)} disabled={saving}>
                <Trash2 size={14} /> Supprimer
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add new service */}
      <div style={{ ...card, display: "flex", flexDirection: "column", gap: 14 }}>
        <h2 style={sectionTitle}>Ajouter une carte de service</h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <EditField label="Nom du service">
            <input style={input} value={draft.name} onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))} placeholder="Ex : Shooting Photo Produit" />
          </EditField>
          <EditField label="Type">
            <select style={input} value={draft.type} onChange={(e) => setDraft((d) => ({ ...d, type: e.target.value as "static" | "video" }))}>
              <option value="static">Visuel / statique</option>
              <option value="video">Vidéo / animation</option>
            </select>
          </EditField>
        </div>
        <EditField label="Description">
          <textarea style={{ ...input, minHeight: 72, resize: "vertical" }} value={draft.desc} onChange={(e) => setDraft((d) => ({ ...d, desc: e.target.value }))} placeholder="Ce qui est inclus dans la prestation." />
        </EditField>
        <EditField label="Avantage client" hint="Phrase persuasive affichée sur la carte.">
          <input style={input} value={draft.advantage} onChange={(e) => setDraft((d) => ({ ...d, advantage: e.target.value }))} />
        </EditField>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
          <EditField label="Prix (USD)">
            <input type="number" min={0} style={input} value={draft.price} onChange={(e) => setDraft((d) => ({ ...d, price: Number(e.target.value) }))} disabled={draft.quoteOnly} />
          </EditField>
          <EditField label="Délai (jours)">
            <input type="number" min={0} style={input} value={draft.deliveryDays} onChange={(e) => setDraft((d) => ({ ...d, deliveryDays: Number(e.target.value) }))} />
          </EditField>
          <EditField label="Révisions">
            <input type="number" min={0} style={input} value={draft.revisions} onChange={(e) => setDraft((d) => ({ ...d, revisions: Number(e.target.value) }))} />
          </EditField>
          <EditField label="Fenêtre révision (j)">
            <input type="number" min={0} style={input} value={draft.revisionDays} onChange={(e) => setDraft((d) => ({ ...d, revisionDays: Number(e.target.value) }))} />
          </EditField>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <EditField label="Image d'exemple (URL)" hint="Lien https vers une image (optionnel).">
            <input style={input} value={draft.exampleImg ?? ""} onChange={(e) => setDraft((d) => ({ ...d, exampleImg: e.target.value }))} placeholder="https://…" />
          </EditField>
          <EditField label="Lien projet / vidéo (URL)" hint="YouTube, Vimeo… (optionnel).">
            <input style={input} value={draft.projectUrl ?? ""} onChange={(e) => setDraft((d) => ({ ...d, projectUrl: e.target.value }))} placeholder="https://…" />
          </EditField>
        </div>
        <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
          <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13.5, cursor: "pointer" }}>
            <input type="checkbox" checked={!!draft.featured} onChange={(e) => setDraft((d) => ({ ...d, featured: e.target.checked }))} />
            Mettre en avant (carte vedette)
          </label>
          <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13.5, cursor: "pointer" }}>
            <input type="checkbox" checked={!!draft.quoteOnly} onChange={(e) => setDraft((d) => ({ ...d, quoteOnly: e.target.checked }))} />
            Sur devis (pas de prix fixe)
          </label>
        </div>
        <div>
          <button style={{ ...btnPrimary, opacity: !draft.name.trim() || saving ? 0.6 : 1 }} onClick={addService} disabled={!draft.name.trim() || saving}>
            <Plus size={15} /> Ajouter la carte
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Portfolio tab: hide built-in albums & add custom ones ──────────────────────
const NEW_WORK: AdminWork = { title: "", category: "", desc: "", img: "", videoId: "" }
const NEW_ALBUM: AdminAlbum = {
  id: "", group: "client", client: "", ceo: "", logo: "", tagline: "",
  accent: "", impact: "", serviceLabels: [], works: [{ ...NEW_WORK }],
}


function PortfolioTab() {
  const [settings, setSettings] = useState<SiteSettings | null>(null)
  const [removed, setRemoved] = useState<string[]>([])
  const [added, setAdded] = useState<AdminAlbum[]>([])
  const [worksRemoved, setWorksRemoved] = useState<string[]>([])
  const [worksAdded, setWorksAdded] = useState<Record<string, AdminWork[]>>({})
  const [draft, setDraft] = useState<AdminAlbum>({ ...NEW_ALBUM, works: [{ ...NEW_WORK }] })
  const [labelsRaw, setLabelsRaw] = useState("")
  const [expanded, setExpanded] = useState<string | null>(null)
  const [workDraft, setWorkDraft] = useState<AdminWork>({ ...NEW_WORK })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    adminApi.getSettings()
      .then((r) => {
        setSettings(r.settings)
        setRemoved(r.settings.albumsRemoved ?? [])
        setAdded(r.settings.albumsAdded ?? [])
        setWorksRemoved(r.settings.worksRemoved ?? [])
        setWorksAdded(r.settings.worksAdded ?? {})
      })
      .catch(() => setSettings({ announcement: { enabled: false, text: "", link: "" } }))
  }, [])

  // Save a merge patch; any field omitted falls back to current state.
  async function persist(next: {
    removed?: string[]; added?: AdminAlbum[]
    wRemoved?: string[]; wAdded?: Record<string, AdminWork[]>
  }) {
    if (!settings) return
    const albumsRemoved = next.removed ?? removed
    const albumsAdded = next.added ?? added
    const nextWorksRemoved = next.wRemoved ?? worksRemoved
    const nextWorksAdded = next.wAdded ?? worksAdded
    setSaving(true); setSaved(false)
    try {
      const r = await adminApi.saveSettings({
        ...settings, albumsRemoved, albumsAdded,
        worksRemoved: nextWorksRemoved, worksAdded: nextWorksAdded,
      })
      setSettings(r.settings)
      setRemoved(r.settings.albumsRemoved ?? albumsRemoved)
      setAdded(r.settings.albumsAdded ?? albumsAdded)
      setWorksRemoved(r.settings.worksRemoved ?? nextWorksRemoved)
      setWorksAdded(r.settings.worksAdded ?? nextWorksAdded)
      setSaved(true); setTimeout(() => setSaved(false), 2500)
    } finally { setSaving(false) }
  }

  function toggleBuiltin(id: string) {
    const next = removed.includes(id) ? removed.filter((x) => x !== id) : [...removed, id]
    setRemoved(next); persist({ removed: next })
  }
  function removeAdded(id: string) {
    const next = added.filter((a) => a.id !== id)
    setAdded(next); persist({ added: next })
  }
  function addAlbum() {
    if (!draft.client.trim()) return
    const works = draft.works.filter((w) => (w.img && w.img.trim()) || (w.videoId && w.videoId.trim()))
    if (works.length === 0) return
    const labels = labelsRaw.split(",").map((s) => s.trim()).filter(Boolean)
    const album: AdminAlbum = {
      ...draft,
      id: `adm-${Date.now()}`,
      client: draft.client.trim(),
      serviceLabels: labels,
      works,
    }
    const next = [...added, album]
    setAdded(next); setDraft({ ...NEW_ALBUM, works: [{ ...NEW_WORK }] }); setLabelsRaw("")
    persist({ added: next })
  }

  // Hide/show a single work inside an album, keyed `${albumId}#${index}`.
  function toggleWork(albumId: string, i: number) {
    const key = `${albumId}#${i}`
    const next = worksRemoved.includes(key)
      ? worksRemoved.filter((x) => x !== key)
      : [...worksRemoved, key]
    setWorksRemoved(next); persist({ wRemoved: next })
  }
  // Append a new work to a specific album (built-in or added).
  function addWorkTo(albumId: string) {
    const w = workDraft
    if (!((w.img && w.img.trim()) || (w.videoId && w.videoId.trim()))) return
    const list = worksAdded[albumId] ?? []
    const next = {
      ...worksAdded,
      [albumId]: [...list, {
        title: w.title.trim(), category: w.category.trim(), desc: w.desc.trim(),
        img: w.img?.trim() || undefined, videoId: w.videoId?.trim() || undefined,
      }],
    }
    setWorksAdded(next); setWorkDraft({ ...NEW_WORK }); persist({ wAdded: next })
  }
  function removeAddedWork(albumId: string, i: number) {
    const list = worksAdded[albumId] ?? []
    const nextList = list.filter((_, j) => j !== i)
    const next = { ...worksAdded }
    if (nextList.length) next[albumId] = nextList
    else delete next[albumId]
    setWorksAdded(next); persist({ wAdded: next })
  }

  function setWork(i: number, patch: Partial<AdminWork>) {
    setDraft((d) => ({ ...d, works: d.works.map((w, j) => (j === i ? { ...w, ...patch } : w)) }))
  }

  if (!settings) return <Empty text="Chargement…" />

  const clientBuiltins = portfolioAlbums.filter((a) => a.logo)
  const otherBuiltins = portfolioAlbums.filter((a) => !a.logo)

  // Per-work manager: lists each base work of an album with a hide/show toggle
  // (keyed `${albumId}#${i}`), the works appended via worksAdded, and a form to
  // append a new visual. Works for built-in and admin-added albums alike.
  const WorksPanel = ({ albumId, baseWorks }: {
    albumId: string
    baseWorks: { title?: string; category?: string; img?: string; videoId?: string }[]
  }) => {
    const open = expanded === albumId
    const extra = worksAdded[albumId] ?? []
    const total = baseWorks.length + extra.length
    const canAdd = (workDraft.img && workDraft.img.trim()) || (workDraft.videoId && workDraft.videoId.trim())
    return (
      <div style={{ paddingBottom: open ? 12 : 0 }}>
        <button style={{ ...btn, padding: "5px 11px", fontSize: 12.5 }} onClick={() => setExpanded(open ? null : albumId)}>
          <ImageIcon size={13} /> {open ? "Fermer les visuels" : `Gérer les visuels (${total})`}
        </button>
        {open && (
          <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 6, paddingLeft: 10, borderLeft: "2px solid var(--ds-border)" }}>
            {baseWorks.map((w, i) => {
              const hidden = worksRemoved.includes(`${albumId}#${i}`)
              return (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, opacity: hidden ? 0.5 : 1 }}>
                  <span style={{ flex: 1, minWidth: 0, fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {w.title || w.category || `Visuel ${i + 1}`}
                  </span>
                  <button style={{ ...btn, padding: "5px 10px" }} onClick={() => toggleWork(albumId, i)} disabled={saving}>
                    {hidden ? <><Eye size={13} /> Afficher</> : <><EyeOff size={13} /> Masquer</>}
                  </button>
                </div>
              )
            })}
            {extra.map((w, i) => (
              <div key={`x${i}`} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ flex: 1, minWidth: 0, fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {w.title || w.category || `Visuel ajouté ${i + 1}`}
                  <span style={{ marginLeft: 6, fontSize: 11, color: "var(--ds-text-faint)" }}>· ajouté</span>
                </span>
                <button style={{ ...btn, padding: "5px 10px", color: "var(--ds-danger, #DC2626)" }} onClick={() => removeAddedWork(albumId, i)} disabled={saving}>
                  <Trash2 size={13} /> Retirer
                </button>
              </div>
            ))}
            <div style={{ marginTop: 8, border: "1px solid var(--ds-border)", borderRadius: "var(--r-md)", padding: 12, display: "flex", flexDirection: "column", gap: 8 }}>
              <span style={smallLabel}>Ajouter un visuel à cet album</span>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                <input style={input} placeholder="Titre" value={workDraft.title} onChange={(e) => setWorkDraft((d) => ({ ...d, title: e.target.value }))} />
                <input style={input} placeholder="Catégorie" value={workDraft.category} onChange={(e) => setWorkDraft((d) => ({ ...d, category: e.target.value }))} />
              </div>
              <input style={input} placeholder="Description" value={workDraft.desc} onChange={(e) => setWorkDraft((d) => ({ ...d, desc: e.target.value }))} />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                <input style={input} placeholder="Image (URL)" value={workDraft.img ?? ""} onChange={(e) => setWorkDraft((d) => ({ ...d, img: e.target.value }))} />
                <input style={input} placeholder="ID vidéo YouTube" value={workDraft.videoId ?? ""} onChange={(e) => setWorkDraft((d) => ({ ...d, videoId: e.target.value }))} />
              </div>
              <button style={{ ...btn, alignSelf: "flex-start", opacity: canAdd && !saving ? 1 : 0.6 }} onClick={() => addWorkTo(albumId)} disabled={!canAdd || saving}>
                <Plus size={14} /> Ajouter le visuel
              </button>
            </div>
          </div>
        )}
      </div>
    )
  }

  const BuiltinRow = ({ a }: { a: (typeof portfolioAlbums)[number] }) => {
    const hidden = removed.includes(a.id)
    return (
      <div style={{ borderTop: "1px solid var(--ds-border)", paddingBottom: 4 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 0", opacity: hidden ? 0.5 : 1 }}>
          <div style={{ minWidth: 0, flex: 1 }}>
            <span style={{ fontSize: 14, fontWeight: 700 }}>{a.client}</span>
            <span style={{ marginLeft: 8, fontSize: 11.5, color: "var(--ds-text-faint)" }}>{a.works.length} visuel{a.works.length > 1 ? "s" : ""}</span>
          </div>
          <button style={{ ...btn, padding: "7px 12px" }} onClick={() => toggleBuiltin(a.id)} disabled={saving}>
            {hidden ? <><Eye size={14} /> Afficher</> : <><EyeOff size={14} /> Masquer</>}
          </button>
        </div>
        {!hidden && <WorksPanel albumId={a.id} baseWorks={a.works} />}
      </div>
    )
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18, maxWidth: 860 }}>
      {saving && <span style={{ fontSize: 12.5, color: "var(--ds-text-faint)" }}>Enregistrement…</span>}
      {saved && <span style={{ color: "var(--ds-success)", fontSize: 13.5, fontWeight: 600 }}>Enregistré ✓</span>}

      <div style={{ ...card, display: "flex", flexDirection: "column", gap: 4 }}>
        <div style={{ marginBottom: 8 }}>
          <h2 style={sectionTitle}>Réalisations par client</h2>
          <p style={{ margin: "6px 0 0", fontSize: 13.5, color: "var(--ds-text-muted)", lineHeight: 1.5 }}>
            Masquez ou réaffichez une réalisation du carrousel client.
          </p>
        </div>
        {clientBuiltins.map((a) => <BuiltinRow key={a.id} a={a} />)}
      </div>

      <div style={{ ...card, display: "flex", flexDirection: "column", gap: 4 }}>
        <h2 style={{ ...sectionTitle, marginBottom: 8 }}>Autres réalisations</h2>
        {otherBuiltins.map((a) => <BuiltinRow key={a.id} a={a} />)}
      </div>

      {added.length > 0 && (
        <div style={{ ...card, display: "flex", flexDirection: "column", gap: 4 }}>
          <h2 style={{ ...sectionTitle, marginBottom: 8 }}>Réalisations ajoutées</h2>
          {added.map((a) => (
            <div key={a.id} style={{ borderTop: "1px solid var(--ds-border)", paddingBottom: 4 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 0" }}>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <span style={{ fontSize: 14, fontWeight: 700 }}>{a.client}</span>
                  <span style={{ marginLeft: 8, fontSize: 11.5, color: "var(--ds-text-faint)" }}>
                    {a.group === "client" ? "Client" : "Autre"} · {a.works.length} visuel{a.works.length > 1 ? "s" : ""}
                  </span>
                </div>
                <button style={{ ...btn, padding: "7px 12px", color: "var(--ds-danger, #DC2626)" }} onClick={() => removeAdded(a.id)} disabled={saving}>
                  <Trash2 size={14} /> Supprimer
                </button>
              </div>
              <WorksPanel albumId={a.id} baseWorks={a.works} />
            </div>
          ))}
        </div>
      )}

      {/* Add new album */}
      <div style={{ ...card, display: "flex", flexDirection: "column", gap: 14 }}>
        <h2 style={sectionTitle}>Ajouter une réalisation</h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <EditField label="Emplacement">
            <select style={input} value={draft.group} onChange={(e) => setDraft((d) => ({ ...d, group: e.target.value as "client" | "other" }))}>
              <option value="client">Réalisations par client (avec logo)</option>
              <option value="other">Autres réalisations</option>
            </select>
          </EditField>
          <EditField label="Nom du client / projet">
            <input style={input} value={draft.client} onChange={(e) => setDraft((d) => ({ ...d, client: e.target.value }))} placeholder="Ex : Boulangerie Délice" />
          </EditField>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <EditField label="Slogan / tagline">
            <input style={input} value={draft.tagline} onChange={(e) => setDraft((d) => ({ ...d, tagline: e.target.value }))} />
          </EditField>
          <EditField label="Responsable / CEO" hint="Optionnel.">
            <input style={input} value={draft.ceo ?? ""} onChange={(e) => setDraft((d) => ({ ...d, ceo: e.target.value }))} />
          </EditField>
        </div>
        {draft.group === "client" && (
          <EditField label="Logo du client (URL)" hint="Requis pour apparaître dans le carrousel client.">
            <input style={input} value={draft.logo ?? ""} onChange={(e) => setDraft((d) => ({ ...d, logo: e.target.value }))} placeholder="https://…" />
          </EditField>
        )}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <EditField label="Couleur d'accent (hex)" hint="Ex : #E8455F (optionnel).">
            <input style={input} value={draft.accent ?? ""} onChange={(e) => setDraft((d) => ({ ...d, accent: e.target.value }))} placeholder="#2E86DE" />
          </EditField>
          <EditField label="Impact / résultat" hint="Chip persuasive (optionnel).">
            <input style={input} value={draft.impact ?? ""} onChange={(e) => setDraft((d) => ({ ...d, impact: e.target.value }))} />
          </EditField>
        </div>
        <EditField label="Services (séparés par des virgules)" hint="Ex : Création de Logo, Flyers & Affiches">
          <input style={input} value={labelsRaw} onChange={(e) => setLabelsRaw(e.target.value)} />
        </EditField>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <span style={smallLabel}>Visuels du projet</span>
          {draft.works.map((w, i) => (
            <div key={i} style={{ border: "1px solid var(--ds-border)", borderRadius: "var(--r-md)", padding: 12, display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: 12.5, fontWeight: 700, color: "var(--ds-text-sec)" }}>Visuel {i + 1}</span>
                {draft.works.length > 1 && (
                  <button style={{ ...btn, padding: "5px 10px" }} onClick={() => setDraft((d) => ({ ...d, works: d.works.filter((_, j) => j !== i) }))}>
                    <Trash2 size={13} /> Retirer
                  </button>
                )}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <EditField label="Titre">
                  <input style={input} value={w.title} onChange={(e) => setWork(i, { title: e.target.value })} />
                </EditField>
                <EditField label="Catégorie">
                  <input style={input} value={w.category} onChange={(e) => setWork(i, { category: e.target.value })} />
                </EditField>
              </div>
              <EditField label="Description">
                <input style={input} value={w.desc} onChange={(e) => setWork(i, { desc: e.target.value })} />
              </EditField>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <EditField label="Image (URL)" hint="Image OU ID vidéo requis.">
                  <input style={input} value={w.img ?? ""} onChange={(e) => setWork(i, { img: e.target.value })} placeholder="https://…" />
                </EditField>
                <EditField label="ID vidéo YouTube" hint="Ex : 8Q-_Aa8AFJ0 (optionnel).">
                  <input style={input} value={w.videoId ?? ""} onChange={(e) => setWork(i, { videoId: e.target.value })} />
                </EditField>
              </div>
            </div>
          ))}
          <button style={{ ...btn, alignSelf: "flex-start" }} onClick={() => setDraft((d) => ({ ...d, works: [...d.works, { ...NEW_WORK }] }))}>
            <Plus size={15} /> Ajouter un visuel
          </button>
        </div>

        <div>
          <button style={{ ...btnPrimary, opacity: !draft.client.trim() || saving ? 0.6 : 1 }} onClick={addAlbum} disabled={!draft.client.trim() || saving}>
            <ImageIcon size={15} /> Ajouter la réalisation
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Procedures tab: recommended method to give clients, per service ────────────

const NEW_BLOG: AdminBlog = { id: "", tag: "", read: 3, title: "", excerpt: "", body: [], image: "", slug: "" }

// ── Video-script generator ───────────────────────────────────────────────────
// Turns a blog article into a production-ready narration script: an attention
// hook, numbered segments with on-screen text cues + estimated timecodes, and a
// closing call-to-action. Available as copy-to-clipboard plain text and as a
// printable PDF (via the browser print dialog). Timecodes assume ~150 words/min.
type ScriptSource = Pick<Article, "tag" | "read" | "title" | "excerpt" | "body">

const SCRIPT_L: Record<Lang, {
  doc: string; est: string; words: string; hook: string; seg: string;
  onscreen: string; narration: string; cta: string; ctaText: string
}> = {
  fr: { doc: "SCRIPT VIDÉO", est: "Durée estimée", words: "mots", hook: "ACCROCHE", seg: "SÉQUENCE", onscreen: "Texte à l'écran", narration: "Voix off", cta: "APPEL À L'ACTION", ctaText: "Prêt à passer à l'action ? Contactez INOV Digital Services dès aujourd'hui — devis gratuit et sans engagement. 👉 inovdigitalservices.com" },
  en: { doc: "VIDEO SCRIPT", est: "Est. duration", words: "words", hook: "HOOK", seg: "SEGMENT", onscreen: "On-screen text", narration: "Voice-over", cta: "CALL TO ACTION", ctaText: "Ready to take the next step? Contact INOV Digital Services today — free, no-obligation quote. 👉 inovdigitalservices.com" },
  es: { doc: "GUION DE VÍDEO", est: "Duración est.", words: "palabras", hook: "GANCHO", seg: "SEGMENTO", onscreen: "Texto en pantalla", narration: "Voz en off", cta: "LLAMADA A LA ACCIÓN", ctaText: "¿Listo para dar el siguiente paso? Contacta con INOV Digital Services hoy — presupuesto gratis y sin compromiso. 👉 inovdigitalservices.com" },
  ht: { doc: "ESKRI VIDEYO", est: "Dire estime", words: "mo", hook: "AKROCH", seg: "SEKANS", onscreen: "Tèks sou ekran", narration: "Vwa", cta: "APÈL POU AKSYON", ctaText: "Ou pare pou fè pwochen etap la ? Kontakte INOV Digital Services jodi a — devi gratis, san angajman. 👉 inovdigitalservices.com" },
  pt: { doc: "GUIÃO DE VÍDEO", est: "Duração est.", words: "palavras", hook: "GANCHO", seg: "SEGMENTO", onscreen: "Texto no ecrã", narration: "Locução", cta: "CHAMADA À AÇÃO", ctaText: "Pronto para o próximo passo? Contacte a INOV Digital Services hoje — orçamento grátis e sem compromisso. 👉 inovdigitalservices.com" },
  it: { doc: "SCRIPT VIDEO", est: "Durata stim.", words: "parole", hook: "GANCIO", seg: "SEGMENTO", onscreen: "Testo a schermo", narration: "Voce fuori campo", cta: "INVITO ALL'AZIONE", ctaText: "Pronto per il prossimo passo? Contatta INOV Digital Services oggi — preventivo gratuito e senza impegno. 👉 inovdigitalservices.com" },
  de: { doc: "VIDEO-SKRIPT", est: "Gesch. Dauer", words: "Wörter", hook: "AUFHÄNGER", seg: "SEGMENT", onscreen: "Bildschirmtext", narration: "Voice-over", cta: "HANDLUNGSAUFRUF", ctaText: "Bereit für den nächsten Schritt? Kontaktieren Sie INOV Digital Services noch heute — kostenloses, unverbindliches Angebot. 👉 inovdigitalservices.com" },
  ar: { doc: "نص الفيديو", est: "المدة التقديرية", words: "كلمة", hook: "الجاذب", seg: "المقطع", onscreen: "نص على الشاشة", narration: "التعليق الصوتي", cta: "دعوة إلى الإجراء", ctaText: "مستعد للخطوة التالية؟ تواصل مع INOV Digital Services اليوم — عرض سعر مجاني وبدون التزام. 👉 inovdigitalservices.com" },
}

type ScriptSeg = { onscreen?: string; text: string }
function scriptSegments(body: string[]): ScriptSeg[] {
  const segs: ScriptSeg[] = []
  let pending: string | undefined
  for (const raw of body) {
    const line = raw.trim()
    if (line.startsWith("## ")) { pending = line.slice(3).trim(); continue }
    segs.push({ onscreen: pending, text: line }); pending = undefined
  }
  if (pending) segs.push({ onscreen: pending, text: "" })
  return segs
}
const countWords = (s: string) => (s.trim() ? s.trim().split(/\s+/).length : 0)
function mmss(sec: number): string {
  const m = Math.floor(sec / 60), s = Math.round(sec % 60)
  return `${m}:${String(s).padStart(2, "0")}`
}

// Plain-text script for copy-paste.
function buildScriptText(a: ScriptSource, lang: Lang): string {
  const L = SCRIPT_L[lang] ?? SCRIPT_L.fr
  const segs = scriptSegments(a.body)
  const totalWords = countWords(a.excerpt) + segs.reduce((n, s) => n + countWords(s.text), 0) + countWords(L.ctaText)
  const totalSec = (totalWords / 150) * 60
  let t = 0
  const rule = "─".repeat(52)
  const lines: string[] = []
  lines.push(`INOV DIGITAL SERVICES — ${L.doc}`)
  lines.push(rule)
  lines.push(a.title)
  lines.push(`${a.tag}  ·  ${L.est} : ~${mmss(totalSec)}  ·  ${totalWords} ${L.words}`)
  lines.push("")
  lines.push(`▶ ${L.hook} (0:00)`)
  lines.push(a.excerpt)
  t += (countWords(a.excerpt) / 150) * 60
  segs.forEach((s, i) => {
    lines.push("")
    lines.push(`▶ ${L.seg} ${i + 1} (${mmss(t)})`)
    if (s.onscreen) lines.push(`[${L.onscreen}] ${s.onscreen}`)
    if (s.text) lines.push(`[${L.narration}] ${s.text}`)
    t += (countWords(s.text) / 150) * 60
  })
  lines.push("")
  lines.push(`▶ ${L.cta} (${mmss(t)})`)
  lines.push(L.ctaText)
  return lines.join("\n")
}

// Printable HTML → PDF via the browser's print dialog.
function buildScriptHtml(a: ScriptSource, lang: Lang): string {
  const L = SCRIPT_L[lang] ?? SCRIPT_L.fr
  const rtl = lang === "ar"
  const segs = scriptSegments(a.body)
  const totalWords = countWords(a.excerpt) + segs.reduce((n, s) => n + countWords(s.text), 0) + countWords(L.ctaText)
  const totalSec = (totalWords / 150) * 60
  let t = 0
  const block = (badge: string, tc: string, onscreen: string | undefined, text: string) => `
    <div style="margin:0 0 18px;padding:14px 16px;border:1px solid #E5E1DA;border-radius:10px;break-inside:avoid;">
      <div style="display:flex;justify-content:space-between;align-items:baseline;gap:12px;margin-bottom:8px;">
        <span style="font:700 12px/1 'Outfit',sans-serif;letter-spacing:.06em;color:#EA580C;text-transform:uppercase;">${esc(badge)}</span>
        <span style="font:600 12px/1 monospace;color:#8A8A8A;">${esc(tc)}</span>
      </div>
      ${onscreen ? `<div style="margin-bottom:6px;font:600 13px/1.4 'Outfit',sans-serif;color:#111;"><span style="color:#8A8A8A;font-weight:700;">${esc(L.onscreen)} · </span>${esc(onscreen)}</div>` : ""}
      ${text ? `<div style="font:400 14px/1.6 Georgia,serif;color:#1A1A1A;"><span style="color:#8A8A8A;font:700 11px 'Outfit',sans-serif;">${esc(L.narration).toUpperCase()} · </span>${esc(text)}</div>` : ""}
    </div>`
  const hookHtml = block(L.hook, "0:00", undefined, a.excerpt)
  t += (countWords(a.excerpt) / 150) * 60
  const segHtml = segs.map((s, i) => {
    const h = block(`${L.seg} ${i + 1}`, mmss(t), s.onscreen, s.text)
    t += (countWords(s.text) / 150) * 60
    return h
  }).join("")
  const ctaHtml = block(L.cta, mmss(t), undefined, L.ctaText)
  return `<!doctype html><html lang="${lang}" dir="${rtl ? "rtl" : "ltr"}"><head><meta charset="utf-8">
<title>${esc(a.title)} — ${esc(L.doc)}</title>
<style>@page{margin:22mm 18mm;} body{margin:0;color:#111;font-family:'Outfit',system-ui,sans-serif;-webkit-print-color-adjust:exact;print-color-adjust:exact;}</style></head>
<body>
  <div style="border-bottom:2px solid #111;padding-bottom:14px;margin-bottom:22px;">
    <div style="font:800 12px/1 'Outfit',sans-serif;letter-spacing:.14em;color:#EA580C;">INOV DIGITAL SERVICES · ${esc(L.doc)}</div>
    <h1 style="margin:10px 0 6px;font:800 26px/1.2 'Outfit',sans-serif;">${esc(a.title)}</h1>
    <div style="font:600 13px/1 'Outfit',sans-serif;color:#8A8A8A;">${esc(a.tag)}  ·  ${esc(L.est)} ~${mmss(totalSec)}  ·  ${totalWords} ${esc(L.words)}</div>
  </div>
  ${hookHtml}${segHtml}${ctaHtml}
<script>window.addEventListener("load",function(){setTimeout(function(){try{window.print();}catch(e){}},400);});</script>
</body></html>`
}

function openScriptPdf(a: ScriptSource, lang: Lang) {
  const w = window.open("", "_blank", "width=820,height=940")
  if (!w) { alert("Autorise les fenêtres pop-up pour générer le PDF."); return }
  w.document.write(buildScriptHtml(a, lang))
  w.document.close()
  w.focus()
}

function ScriptRow({ a, lang }: { a: ScriptSource; lang: Lang }) {
  const [copied, setCopied] = useState(false)
  const [open, setOpen] = useState(false)
  async function copy() {
    try {
      await navigator.clipboard.writeText(buildScriptText(a, lang))
      setCopied(true); setTimeout(() => setCopied(false), 1800)
    } catch { /* clipboard blocked */ }
  }
  return (
    <div style={{ padding: "13px 0", borderTop: "1px solid var(--ds-border)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 700 }}>{a.title}</div>
          <div style={{ fontSize: 11.5, color: "var(--ds-text-faint)" }}>{a.tag} · ~{a.read} min</div>
        </div>
        <button style={{ ...btn, padding: "7px 12px", fontSize: 12.5 }} onClick={() => setOpen((o) => !o)}>
          <Eye size={14} /> {open ? "Masquer" : "Aperçu"}
        </button>
        <button style={{ ...btn, padding: "7px 12px", fontSize: 12.5 }} onClick={copy}>
          {copied ? <Check size={14} /> : <Copy size={14} />} {copied ? "Copié" : "Copier"}
        </button>
        <button style={{ ...btnPrimary, padding: "7px 12px", fontSize: 12.5 }} onClick={() => openScriptPdf(a, lang)}>
          <Download size={14} /> PDF
        </button>
      </div>
      {open && (
        <pre style={{
          marginTop: 10, whiteSpace: "pre-wrap", wordBreak: "break-word",
          fontFamily: "var(--font-space), monospace", fontSize: 12.5, lineHeight: 1.6,
          background: "var(--ds-bg-sec)", color: "var(--ds-text)",
          border: "1px solid var(--ds-border)", borderRadius: 10, padding: 14, maxHeight: 340, overflow: "auto",
        }}>{buildScriptText(a, lang)}</pre>
      )}
    </div>
  )
}

function BlogTab() {
  const [settings, setSettings] = useState<SiteSettings | null>(null)
  const [removed, setRemoved] = useState<string[]>([])
  const [added, setAdded] = useState<AdminBlog[]>([])
  const [draft, setDraft] = useState<AdminBlog>({ ...NEW_BLOG })
  const [bodyRaw, setBodyRaw] = useState("")
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [scriptLang, setScriptLang] = useState<Lang>("fr")
  const [shareLang, setShareLang] = useState<Lang>("fr")
  const [sharePhone, setSharePhone] = useState("")

  useEffect(() => {
    adminApi.getSettings()
      .then((r) => {
        setSettings(r.settings)
        setRemoved(r.settings.blogsRemoved ?? [])
        setAdded(r.settings.blogsAdded ?? [])
      })
      .catch(() => setSettings({ announcement: { enabled: false, text: "", link: "" } }))
  }, [])

  async function persist(nextRemoved: string[], nextAdded: AdminBlog[]) {
    if (!settings) return
    setSaving(true); setSaved(false)
    try {
      const r = await adminApi.saveSettings({ ...settings, blogsRemoved: nextRemoved, blogsAdded: nextAdded })
      setSettings(r.settings)
      setRemoved(r.settings.blogsRemoved ?? nextRemoved)
      setAdded(r.settings.blogsAdded ?? nextAdded)
      setSaved(true); setTimeout(() => setSaved(false), 2500)
    } finally { setSaving(false) }
  }

  function toggleBuiltin(id: string) {
    const next = removed.includes(id) ? removed.filter((x) => x !== id) : [...removed, id]
    setRemoved(next); persist(next, added)
  }
  function removeAdded(id: string) {
    const next = added.filter((a) => a.id !== id)
    setAdded(next); persist(removed, next)
  }
  function addBlog() {
    if (!draft.title.trim()) return
    // Each paragraph is separated by a blank line; a line starting with "## " is a subheading.
    const body = bodyRaw.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean)
    if (body.length === 0) return
    const slugify = (s: string) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80)
    const blog: AdminBlog = {
      ...draft,
      id: `adm-${Date.now()}`,
      title: draft.title.trim(),
      tag: draft.tag.trim() || "Blog",
      slug: (draft.slug || "").trim() || slugify(draft.title),
      body,
    }
    const next = [...added, blog]
    setAdded(next); setDraft({ ...NEW_BLOG }); setBodyRaw(""); persist(removed, next)
  }

  if (!settings) return <Empty text="Chargement…" />

  const builtins = ARTICLES.fr

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18, maxWidth: 860 }}>
      {saving && <span style={{ fontSize: 12.5, color: "var(--ds-text-faint)" }}>Enregistrement…</span>}
      {saved && <span style={{ color: "var(--ds-success)", fontSize: 13.5, fontWeight: 600 }}>Enregistré ✓</span>}

      {/* Built-in articles */}
      <div style={{ ...card, display: "flex", flexDirection: "column", gap: 4 }}>
        <div style={{ marginBottom: 8 }}>
          <h2 style={sectionTitle}>Articles du blog</h2>
          <p style={{ margin: "6px 0 0", fontSize: 13.5, color: "var(--ds-text-muted)", lineHeight: 1.5 }}>
            Masquez un article pour le retirer du site (toutes langues) sans le supprimer.
          </p>
        </div>
        {builtins.map((a) => {
          const hidden = removed.includes(a.id)
          return (
            <div key={a.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 0", borderTop: "1px solid var(--ds-border)", opacity: hidden ? 0.5 : 1 }}>
              <div style={{ minWidth: 0, flex: 1 }}>
                <span style={{ fontSize: 14, fontWeight: 700 }}>{a.title}</span>
                <span style={{ marginLeft: 8, fontSize: 11.5, color: "var(--ds-text-faint)" }}>{a.tag} · {a.read} min</span>
              </div>
              <button style={{ ...btn, padding: "7px 12px" }} onClick={() => toggleBuiltin(a.id)} disabled={saving}>
                {hidden ? <><Eye size={14} /> Afficher</> : <><EyeOff size={14} /> Masquer</>}
              </button>
            </div>
          )
        })}
      </div>

      {/* Added articles */}
      {added.length > 0 && (
        <div style={{ ...card, display: "flex", flexDirection: "column", gap: 4 }}>
          <h2 style={{ ...sectionTitle, marginBottom: 8 }}>Articles ajoutés</h2>
          {added.map((a) => (
            <div key={a.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 0", borderTop: "1px solid var(--ds-border)" }}>
              <div style={{ minWidth: 0, flex: 1 }}>
                <span style={{ fontSize: 14, fontWeight: 700 }}>{a.title}</span>
                <span style={{ marginLeft: 8, fontSize: 11.5, color: "var(--ds-text-faint)" }}>{a.tag} · {a.read} min</span>
              </div>
              <button style={{ ...btn, padding: "7px 12px", color: "var(--ds-danger, #DC2626)" }} onClick={() => removeAdded(a.id)} disabled={saving}>
                <Trash2 size={14} /> Supprimer
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Partager un article par WhatsApp avec message d'accompagnement auto */}
      {(() => {
        const shareList = [
          ...(ARTICLES[shareLang] ?? ARTICLES.fr).filter((a) => !removed.includes(a.id))
            .map((a) => ({ id: a.id, title: a.title, excerpt: a.excerpt, slug: ARTICLE_SLUG[a.id] ?? a.id })),
          ...added.map((a) => ({ id: a.id, title: a.title, excerpt: a.excerpt, slug: a.slug || a.id })),
        ]
        const digits = sharePhone.replace(/[^\d]/g, "")
        const intro = NL_INTRO[shareLang] ?? NL_INTRO.fr
        const buildHref = (title: string, excerpt: string, slug: string) => {
          const url = `${SITE_URL}/blog/${slug}`
          const text = `${intro.single(title, excerpt)}\n\n${url}`
          const base = digits ? `https://wa.me/${digits}` : "https://wa.me/"
          return `${base}?text=${encodeURIComponent(text)}`
        }
        return (
          <div style={{ ...card, display: "flex", flexDirection: "column", gap: 4 }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 8, flexWrap: "wrap" }}>
              <div style={{ minWidth: 0, flex: 1 }}>
                <h2 style={sectionTitle}>Partager par WhatsApp</h2>
                <p style={{ margin: "6px 0 0", fontSize: 13.5, color: "var(--ds-text-muted)", lineHeight: 1.5 }}>
                  Indiquez le numéro du client (avec l'indicatif, ex. 509…) pour ouvrir directement sa conversation. Le message d'accompagnement et le lien de l'article sont générés automatiquement dans la langue choisie — vous pouvez le modifier dans WhatsApp avant l'envoi. Laissez le numéro vide pour choisir le contact dans WhatsApp.
                </p>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <label style={{ fontSize: 12.5, fontWeight: 600, color: "var(--ds-text-muted)" }}>Langue</label>
                <select style={{ ...input, width: "auto", padding: "8px 12px" }} value={shareLang} onChange={(e) => setShareLang(e.target.value as Lang)}>
                  {LANGS.map((l) => <option key={l.code} value={l.code}>{l.flag} {l.label}</option>)}
                </select>
              </div>
            </div>
            <input
              value={sharePhone}
              onChange={(e) => setSharePhone(e.target.value)}
              placeholder="Numéro du client — ex. +509 3625 5920 (optionnel)"
              inputMode="tel"
              style={{ ...input, marginBottom: 8 }}
            />
            {shareList.map((a) => (
              <div key={a.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 0", borderTop: "1px solid var(--ds-border)" }}>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <span style={{ fontSize: 14, fontWeight: 700 }}>{a.title}</span>
                </div>
                <a href={buildHref(a.title, a.excerpt, a.slug)} target="_blank" rel="noreferrer" style={{ ...btn, padding: "7px 12px", textDecoration: "none" }}>
                  <Send size={14} /> WhatsApp
                </a>
              </div>
            ))}
          </div>
        )
      })()}

      {/* Video scripts — copy or download each article formatted for narration */}
      <div style={{ ...card, display: "flex", flexDirection: "column", gap: 4 }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 8, flexWrap: "wrap" }}>
          <div style={{ minWidth: 0, flex: 1 }}>
            <h2 style={sectionTitle}>Scripts vidéo</h2>
            <p style={{ margin: "6px 0 0", fontSize: 13.5, color: "var(--ds-text-muted)", lineHeight: 1.5 }}>
              Chaque article prêt pour tournage : accroche, séquences avec texte à l'écran et minutage, appel à l'action. Copiez-le ou téléchargez le PDF.
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <label style={{ fontSize: 12.5, fontWeight: 600, color: "var(--ds-text-muted)" }}>Langue</label>
            <select style={{ ...input, width: "auto", padding: "8px 12px" }} value={scriptLang} onChange={(e) => setScriptLang(e.target.value as Lang)}>
              {LANGS.map((l) => <option key={l.code} value={l.code}>{l.flag} {l.label}</option>)}
            </select>
          </div>
        </div>
        {(ARTICLES[scriptLang] ?? ARTICLES.fr).filter((a) => !removed.includes(a.id)).map((a) => (
          <ScriptRow key={a.id} a={a} lang={scriptLang} />
        ))}
        {added.map((a) => (
          <ScriptRow key={a.id} a={a} lang={scriptLang} />
        ))}
      </div>

      {/* Add new article */}
      <div style={{ ...card, display: "flex", flexDirection: "column", gap: 14 }}>
        <h2 style={sectionTitle}>Écrire un article</h2>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 120px", gap: 14 }}>
          <EditField label="Titre">
            <input style={input} value={draft.title} onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))} placeholder="Ex : Pourquoi une carte de visite compte encore" />
          </EditField>
          <EditField label="Catégorie / tag">
            <input style={input} value={draft.tag} onChange={(e) => setDraft((d) => ({ ...d, tag: e.target.value }))} placeholder="Branding" />
          </EditField>
          <EditField label="Lecture (min)">
            <input type="number" min={1} style={input} value={draft.read} onChange={(e) => setDraft((d) => ({ ...d, read: Number(e.target.value) }))} />
          </EditField>
        </div>
        <EditField label="Accroche (excerpt)" hint="Résumé affiché sur la carte et dans la newsletter.">
          <textarea style={{ ...input, minHeight: 60, resize: "vertical" }} value={draft.excerpt} onChange={(e) => setDraft((d) => ({ ...d, excerpt: e.target.value }))} />
        </EditField>
        <EditField label="Contenu" hint="Séparez chaque paragraphe par une ligne vide. Commencez une ligne par « ## » pour un sous-titre.">
          <textarea style={{ ...input, minHeight: 220, resize: "vertical", lineHeight: 1.6, fontFamily: "inherit" }} value={bodyRaw} onChange={(e) => setBodyRaw(e.target.value)} placeholder={"Paragraphe d'introduction…\n\n## Un sous-titre\n\nLe paragraphe suivant…"} />
        </EditField>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <EditField label="Image de couverture (URL)" hint="Lien https vers une image (optionnel).">
            <input style={input} value={draft.image ?? ""} onChange={(e) => setDraft((d) => ({ ...d, image: e.target.value }))} placeholder="https://…" />
          </EditField>
          <EditField label="Slug (URL)" hint="Laisser vide = généré depuis le titre.">
            <input style={input} value={draft.slug ?? ""} onChange={(e) => setDraft((d) => ({ ...d, slug: e.target.value }))} placeholder="carte-de-visite" />
          </EditField>
        </div>
        <div>
          <button style={{ ...btnPrimary, opacity: !draft.title.trim() || !bodyRaw.trim() || saving ? 0.6 : 1 }} onClick={addBlog} disabled={!draft.title.trim() || !bodyRaw.trim() || saving}>
            <Plus size={15} /> Publier l'article
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Links tab: copy/share deep links to any page or section of the public site ──
// Client-facing links always point at the canonical production domain, never the
// admin's current origin (which may be a Vercel preview or the Figma sandbox).

export { FormationTab, CollaborateursTab, PricingTab, ServicesTab, PortfolioTab, BlogTab }
