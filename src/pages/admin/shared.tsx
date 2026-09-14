// Shared admin primitives: types, constants, styles, helpers, components,
// and document (PDF / e-mail HTML) builders.
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
import { pricingServices, tierValues, TIER_KEYS, type PricingService, type TierKey } from "../../data/services"
import { albums as portfolioAlbums } from "../../data/portfolio"
import { serviceProcedures, procedureToText, type ServiceProcedure } from "../../data/serviceProcedures"
import { loadReminders, saveReminders, newReminderId, kindLabel, downloadICS, ensureNotificationPermission, fireNotification, type Reminder, type ReminderKind } from "../../lib/reminders"
import { ARTICLES, ARTICLE_SLUG, ARTICLE_IMAGE, type Article } from "../../components/Blog"
import { LANGS, type Lang } from "../../i18n/translations"
import { REGIONS, type RegionCode } from "../../data/regions"
import { registerStepUpVerifier } from "../../lib/stepup"
import { useAdminAuth } from "../../hooks/useAdminAuth"
import { useSessionTimeout, ADMIN_SESSION_POLICY } from "../../hooks/useSessionTimeout"
import { supabase } from "../../lib/supabaseClient"
import { adminApi, api, type Lead, type LeadItem, type Subscriber, type SiteSettings, type Campaign, type AdminService, type AdminWork, type AdminAlbum, type AdminBlog, type AssistantMessage, type Testimonial, type Formation, type Collaborateur, type Eventualite, type EventualiteInput } from "../../lib/api"
import { useSettings } from "../../context/AppSettings"
import logoDark from "../../imports/logo_pour_fond_noir.webp"
import logoLight from "../../imports/logo.webp"

// Public site + stable (non-hashed) logo assets for branding e-mails.
// Public site URL used to build absolute image/link URLs inside emails. Must be a
// domain that actually serves the assets (the custom domain inovdigitalservices.com
// currently returns 530), otherwise email logos/links break. Update here (and the
// SITE_URL env var of the Supabase function) once the custom domain is live.
const SITE_URL = "https://inov-digital-services.vercel.app"
const EMAIL_LOGO_DARK = `${SITE_URL}/email-logo-dark.webp`
const NL_LANGS: { code: string; label: string }[] = [
  { code: "all", label: "Toutes les langues" },
  { code: "fr", label: "Français" }, { code: "en", label: "English" },
  { code: "es", label: "Español" }, { code: "ht", label: "Kreyòl" },
  { code: "pt", label: "Português" }, { code: "it", label: "Italiano" },
  { code: "de", label: "Deutsch" }, { code: "ar", label: "العربية" },
]
// Per-language newsletter intro templates. The intro is auto-adapted to the
// selected blog article(s) so each newsletter's accompanying message matches the
// blog it promotes (unless the admin edits it manually).
const NL_INTRO: Record<string, { empty: string; single: (t: string, e: string) => string; multi: (n: number) => string }> = {
  fr: { empty: "Bonjour,\n\nVoici nos derniers conseils pour faire grandir votre marque", single: (t, e) => `Bonjour,\n\n${e}\n\nNous en parlons en détail dans notre article « ${t} »`, multi: (n) => `Bonjour,\n\nVoici ${n} nouveaux conseils pour faire grandir votre marque` },
  en: { empty: "Hello,\n\nHere are our latest tips to grow your brand", single: (t, e) => `Hello,\n\n${e}\n\nWe cover it in detail in our article "${t}"`, multi: (n) => `Hello,\n\nHere are ${n} fresh tips to grow your brand` },
  es: { empty: "Hola,\n\nAquí tienes nuestros últimos consejos para hacer crecer tu marca", single: (t, e) => `Hola,\n\n${e}\n\nLo explicamos en detalle en nuestro artículo «${t}»`, multi: (n) => `Hola,\n\nAquí tienes ${n} nuevos consejos para hacer crecer tu marca` },
  ht: { empty: "Bonjou,\n\nMen dènye konsèy nou yo pou fè mak ou grandi", single: (t, e) => `Bonjou,\n\n${e}\n\nNou pale sou li an detay nan atik nou an « ${t} »`, multi: (n) => `Bonjou,\n\nMen ${n} nouvo konsèy pou fè mak ou grandi` },
  pt: { empty: "Olá,\n\nAqui estão nossas últimas dicas para fazer sua marca crescer", single: (t, e) => `Olá,\n\n${e}\n\nFalamos disso em detalhe no nosso artigo «${t}»`, multi: (n) => `Olá,\n\nAqui estão ${n} novas dicas para fazer sua marca crescer` },
  it: { empty: "Ciao,\n\nEcco i nostri ultimi consigli per far crescere il tuo brand", single: (t, e) => `Ciao,\n\n${e}\n\nNe parliamo in dettaglio nel nostro articolo «${t}»`, multi: (n) => `Ciao,\n\nEcco ${n} nuovi consigli per far crescere il tuo brand` },
  de: { empty: "Hallo,\n\nHier sind unsere neuesten Tipps für Ihr Markenwachstum", single: (t, e) => `Hallo,\n\n${e}\n\nWir gehen darauf ausführlich in unserem Artikel „${t}“ ein`, multi: (n) => `Hallo,\n\nHier sind ${n} neue Tipps für Ihr Markenwachstum` },
  ar: { empty: "مرحبًا،\n\nإليك أحدث نصائحنا لتنمية علامتك التجارية", single: (t, e) => `مرحبًا،\n\n${e}\n\nنتناول ذلك بالتفصيل في مقالنا «${t}»`, multi: (n) => `مرحبًا،\n\nإليك ${n} نصائح جديدة لتنمية علامتك التجارية` },
}

const STATUSES: Lead["status"][] = ["new", "contacted", "won", "lost"]
const STATUS_LABEL: Record<Lead["status"], string> = {
  new: "Nouveau", contacted: "Contacté", won: "Gagné", lost: "Perdu",
}
const STATUS_COLOR: Record<Lead["status"], string> = {
  new: "#B45309", contacted: "#1D4ED8", won: "#15803D", lost: "#DC2626",
}
// Payment leads reuse the lead status field, with payment-specific labels.
const PAY_STATUS_LABEL: Record<Lead["status"], string> = {
  new: "En attente", contacted: "Vérification", won: "Payé", lost: "Refusé",
}

type SortKey = "recent" | "oldest" | "amount"
const SORT_LABEL: Record<SortKey, string> = { recent: "Plus récents", oldest: "Plus anciens", amount: "Montant" }

const shell: React.CSSProperties = {
  minHeight: "100vh", background: "var(--ds-bg)", color: "var(--ds-text)",
  fontFamily: "var(--font-outfit), sans-serif",
}
const card: React.CSSProperties = {
  background: "var(--ds-bg-card)", border: "1px solid var(--ds-border)",
  borderRadius: "var(--r-lg)", padding: 20,
}
const btn: React.CSSProperties = {
  display: "inline-flex", alignItems: "center", gap: 8, cursor: "pointer",
  border: "1px solid var(--ds-border)", background: "var(--ds-bg-sec)",
  color: "var(--ds-text)", borderRadius: "var(--r-md)", padding: "9px 14px",
  fontSize: 14, fontWeight: 600, fontFamily: "inherit",
}
const btnPrimary: React.CSSProperties = {
  ...btn, border: "none",
  background: "var(--ds-accent-grad)",
  color: "#fff",
}
const input: React.CSSProperties = {
  width: "100%", padding: "12px 14px", borderRadius: "var(--r-md)",
  border: "1px solid var(--ds-border)", background: "var(--ds-bg-sec)",
  color: "var(--ds-text)", fontSize: 15, fontFamily: "inherit", outline: "none",
}

// Shared style block: hover states, responsive layout, skeleton shimmer.
const STYLE = `
  .adm-navbtn { transition: background 0.15s, color 0.15s; }
  .adm-navbtn:hover { background: var(--ds-bg-sec); }
  /* Keyboard focus: a clear, consistent ring on every interactive admin control.
     :focus-visible only shows for keyboard users, so mouse clicks stay clean. */
  .adm-scope :focus-visible {
    outline: 2px solid var(--ds-accent);
    outline-offset: 2px;
    border-radius: var(--r-sm, 6px);
  }
  .adm-scope button, .adm-scope a, .adm-scope input, .adm-scope select, .adm-scope textarea { outline-color: var(--ds-accent); }
  /* Respect reduced-motion preferences for all admin animations. */
  @media (prefers-reduced-motion: reduce) {
    .adm-navbtn, .adm-row, .adm-chip, .adm-skel { transition: none !important; animation: none !important; }
  }
  .adm-row { transition: background 0.12s; }
  .adm-row:hover { background: var(--ds-bg-sec); }
  .adm-chip { transition: all 0.12s; }
  .adm-iconbtn:hover { filter: brightness(1.06); }
  .adm-skel { background: linear-gradient(90deg, var(--ds-bg-sec) 25%, var(--ds-border) 37%, var(--ds-bg-sec) 63%); background-size: 400% 100%; animation: admShimmer 1.3s ease-in-out infinite; border-radius: var(--r-md); }
  @keyframes admShimmer { 0% { background-position: 100% 0 } 100% { background-position: 0 0 } }
  .adm-layout { display: grid; grid-template-columns: 244px 1fr; gap: 26px; align-items: start; }
  .adm-nav {
    position: sticky; top: 78px; display: flex; flex-direction: column; gap: 2px;
    max-height: calc(100vh - 96px); overflow-y: auto; padding-inline-end: 4px;
    scrollbar-width: thin;
  }
  .adm-navgroup { display: flex; flex-direction: column; }
  .adm-grouphd { transition: color 0.15s; }
  .adm-grouphd:hover { color: var(--ds-text-muted) !important; }
  .adm-crumb { }
  @media (max-width: 1100px) { .adm-email { display: none; } }
  @media (max-width: 820px) {
    .adm-layout { grid-template-columns: 1fr; }
    .adm-nav { position: static; max-height: none; overflow: visible; }
    .adm-lbl { display: none; }
    .adm-crumb > span:not(:last-child) { display: none; }
    .adm-doc-grid { grid-template-columns: 1fr !important; }
  }
`

export function AdminStyle() { return <style>{STYLE}</style> }

const TIER_FR: Record<TierKey, string> = { essentiel: "Essentiel", standard: "Standard", premium: "Premium" }


function Stat({ icon, label, value, accent }: { icon: React.ReactNode; label: string; value: number | string; accent?: boolean }) {
  return (
    <div style={{ ...card, padding: "16px 18px", display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{
        display: "inline-flex", alignItems: "center", justifyContent: "center", width: 34, height: 34,
        borderRadius: "var(--r-md)", background: accent ? "var(--ds-accent-a12)" : "var(--ds-bg-sec)",
        color: accent ? "var(--ds-accent)" : "var(--ds-text-muted)",
      }}>{icon}</div>
      <div>
        <div style={{ fontSize: 27, fontWeight: 800, fontFamily: "var(--font-space), sans-serif", lineHeight: 1, color: accent ? "var(--ds-accent)" : "var(--ds-text)" }}>
          {value}
        </div>
        <div style={{ fontSize: 12.5, color: "var(--ds-text-muted)", fontWeight: 600, marginTop: 6 }}>{label}</div>
      </div>
    </div>
  )
}

// ── Reusable list toolbar (search + status filter + sort + export) ─────────────
function Toolbar({
  query, setQuery, statuses, statusLabels, statusColors, statusFilter, setStatusFilter,
  sort, setSort, onExport, count,
}: {
  query: string; setQuery: (v: string) => void
  statuses: Lead["status"][]; statusLabels: Record<Lead["status"], string>; statusColors: Record<Lead["status"], string>
  statusFilter: Lead["status"] | "all"; setStatusFilter: (v: Lead["status"] | "all") => void
  sort: SortKey; setSort: (v: SortKey) => void
  onExport: () => void; count: number
}) {
  return (
    <div style={{ ...card, padding: 14, marginBottom: 16, display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
          <Search size={16} style={{ position: "absolute", top: "50%", insetInlineStart: 12, transform: "translateY(-50%)", color: "var(--ds-text-faint)" }} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher nom, e-mail, téléphone, message…"
            style={{ ...input, paddingInlineStart: 36, paddingInlineEnd: query ? 34 : 14 }}
          />
          {query && (
            <button onClick={() => setQuery("")} aria-label="Effacer" style={{ position: "absolute", top: "50%", insetInlineEnd: 8, transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--ds-text-faint)", padding: 4, display: "inline-flex" }}>
              <X size={15} />
            </button>
          )}
        </div>
        <label style={{ ...btn, gap: 6, padding: "0 10px 0 12px" }}>
          <ArrowUpDown size={15} style={{ color: "var(--ds-text-faint)" }} />
          <select value={sort} onChange={(e) => setSort(e.target.value as SortKey)}
            style={{ border: "none", background: "transparent", color: "var(--ds-text)", fontFamily: "inherit", fontSize: 14, fontWeight: 600, cursor: "pointer", padding: "9px 4px", outline: "none" }}>
            {(Object.keys(SORT_LABEL) as SortKey[]).map((k) => <option key={k} value={k}>{SORT_LABEL[k]}</option>)}
          </select>
        </label>
        <button style={btn} className="adm-iconbtn" onClick={onExport}><Download size={15} /> CSV</button>
      </div>

      <div style={{ display: "flex", gap: 7, flexWrap: "wrap", alignItems: "center" }}>
        <Chip active={statusFilter === "all"} onClick={() => setStatusFilter("all")}>Tous</Chip>
        {statuses.map((s) => (
          <Chip key={s} active={statusFilter === s} onClick={() => setStatusFilter(s)} dot={statusColors[s]}>
            {statusLabels[s]}
          </Chip>
        ))}
        <span style={{ marginInlineStart: "auto", fontSize: 12.5, color: "var(--ds-text-faint)", fontWeight: 600 }}>
          {count} résultat{count > 1 ? "s" : ""}
        </span>
      </div>
    </div>
  )
}

function Chip({ active, onClick, children, dot }: { active: boolean; onClick: () => void; children: React.ReactNode; dot?: string }) {
  return (
    <button onClick={onClick} className="adm-chip" style={{
      display: "inline-flex", alignItems: "center", gap: 7, cursor: "pointer",
      border: `1px solid ${active ? "var(--ds-accent)" : "var(--ds-border)"}`,
      background: active ? "var(--ds-accent-a10)" : "var(--ds-bg-sec)",
      color: active ? "var(--ds-accent-text)" : "var(--ds-text-sec)",
      borderRadius: "var(--r-full)", padding: "6px 13px", fontSize: 12.5, fontWeight: 700, fontFamily: "inherit",
    }}>
      {dot && <span style={{ width: 8, height: 8, borderRadius: "50%", background: dot }} />}
      {children}
    </button>
  )
}

// Shared: search over the common lead fields.
function matchLead(l: Lead, q: string): boolean {
  if (!q) return true
  const meta = (l.meta ?? {}) as Record<string, unknown>
  const hay = [l.name, l.email, l.phone, l.message, l.budget, meta.reference, meta.paymentMethodLabel]
    .filter(Boolean).join(" ").toLowerCase()
  return hay.includes(q.toLowerCase())
}
function sortLeads(list: Lead[], sort: SortKey): Lead[] {
  const arr = [...list]
  if (sort === "amount") return arr.sort((a, b) => (b.total ?? -1) - (a.total ?? -1))
  arr.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
  return sort === "oldest" ? arr.reverse() : arr
}
function downloadCsv(filename: string, rows: (string | number)[][]) {
  const csv = rows.map((r) => r.map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`).join(",")).join("\n")
  const url = URL.createObjectURL(new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" }))
  const a = document.createElement("a")
  a.href = url; a.download = filename; a.click()
  URL.revokeObjectURL(url)
}
// Legacy quote leads stored `total`, `deposit` and `items[].price` in region-
// adjusted USD while labelling them with the client's currency — so the rate was
// never applied. New leads carry `meta.rate` and are already in local currency.
// For an old quote lead (no `meta.rate`), convert its amounts with the current
// rate so the admin shows figures consistent with the currency label.
function withLocalAmounts(l: Lead, rates: Record<string, number>): Lead {
  const meta = (l.meta ?? {}) as Record<string, unknown>
  if (typeof meta.rate === "number" || l.source !== "quote") return l
  const r = rates[l.currency] ?? 1
  if (r === 1) return l
  return {
    ...l,
    total: typeof l.total === "number" ? Math.round(l.total * r) : l.total,
    deposit: typeof l.deposit === "number" ? Math.round(l.deposit * r) : l.deposit,
    items: (l.items ?? []).map((it) => ({ ...it, price: Math.round(it.price * r) })),
    meta: { ...meta, rate: r },
  }
}

// ── Receipt generation ─────────────────────────────────────────────────────────
// Branded receipt built in the same visual language as the Pricing proforma
// (white sheet, black hairline borders, Outfit type, rotated logo watermark).
function esc(s: unknown): string {
  return String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c] as string))
}
function fmtMoney(n: number | null | undefined, cur?: string): string {
  return typeof n === "number" ? `${n.toLocaleString("fr-FR")}${cur ? ` ${cur}` : ""}` : "—"
}
function receiptNo(l: Lead): string {
  const y = new Date(l.createdAt).getFullYear()
  return `INOV-${y}-${l.id.slice(-6).toUpperCase()}`
}
// A cart service line, always shown in the lead's own currency (matching the total).
type SvcLine = { name: string; qty: number; usd: number | null; local?: number | null }
// Multiplier that converts a base-USD line amount into the lead's currency.
// We DERIVE it from the lead itself — `total ÷ sum of base USD` — so every line
// is computed with the SAME effective rate that produced the total the client
// actually paid. This keeps the lines and the total perfectly reconciled and
// always reflecting the applied rate, regardless of when the lead was created or
// whether the exchange rate has since changed. Stored `rate` is only a fallback
// when no priced total is available.
function localMultiplier(services: SvcLine[], total: number | null, rate: number | null): number | null {
  const sumUsd = services.reduce((a, s) => a + (typeof s.usd === "number" ? s.usd * s.qty : 0), 0)
  if (typeof total === "number" && sumUsd > 0) return total / sumUsd
  if (rate != null) return rate
  return null
}
function svcLineAmount(s: SvcLine, cur: string, mult: number | null): string {
  if (s.usd == null) return "sur devis"
  // Always recompute from base USD with the shared multiplier so lines sum to
  // the total. Fall back to a stored per-line amount only if no multiplier.
  if (mult != null) return fmtMoney(Math.round(s.usd * s.qty * mult), cur)
  if (typeof s.local === "number") return fmtMoney(s.local, cur)
  return `$${(s.usd * s.qty).toLocaleString("en-US")}`
}

// Personalized, warm-but-professional replies pre-filled for the admin.
function firstName(l: Lead): string {
  return (l.name || "").trim().split(/\s+/)[0] || ""
}
function replyGreeting(l: Lead): string {
  const f = firstName(l)
  return f ? `Bonjour ${f},` : "Bonjour,"
}
function amountLabel(l: Lead): string {
  return typeof l.total === "number" ? `${l.total.toLocaleString("fr-FR")} ${l.currency}` : ""
}
function mailtoReply(l: Lead): string {
  const amt = amountLabel(l)
  const body = [
    replyGreeting(l),
    "",
    amt
      ? `Merci beaucoup pour votre paiement de ${amt} — nous confirmons sa bonne réception. 🙏`
      : "Merci beaucoup pour votre paiement — nous confirmons sa bonne réception. 🙏",
    "",
    "Votre reçu officiel vous a été envoyé. Nous restons à votre entière disposition pour la suite.",
    "",
    "Bien cordialement,",
    "L'équipe INOV Digital Services",
  ].join("\n")
  return `mailto:${l.email}?subject=${encodeURIComponent(`Confirmation de votre paiement — ${receiptNo(l)}`)}&body=${encodeURIComponent(body)}`
}
function waReply(l: Lead): string {
  const f = firstName(l)
  const amt = amountLabel(l)
  const text = [
    f ? `Bonjour ${f} ! 👋` : "Bonjour ! 👋",
    amt
      ? `Merci pour votre paiement de ${amt}, nous confirmons sa bonne réception. 🙏`
      : "Merci pour votre paiement, nous confirmons sa bonne réception. 🙏",
    "Votre reçu est en route. À très vite ! — L'équipe INOV Digital Services",
  ].join("\n")
  return `https://wa.me/${l.phone.replace(/[^\d]/g, "")}?text=${encodeURIComponent(text)}`
}

// ── Pre-recorded WhatsApp messages, per requested service ─────────────────────
// Builds a warm, ready-to-send opener that names the exact service(s) the lead
// asked for, in the lead's own language. The wa.me link targets the client's own
// number so it opens straight into that conversation. The admin can still edit
// the text in WhatsApp before sending.
const WA_SERVICE: Record<
  string,
  { hi: (f: string) => string; one: (s: string) => string; many: (s: string) => string; close: string; sig: string }
> = {
  fr: { hi: (f) => (f ? `Bonjour ${f} ! 👋` : "Bonjour ! 👋"), one: (s) => `Merci pour votre demande concernant *${s}*. Nous serions ravis de la réaliser pour vous. 🎨`, many: (s) => `Merci pour votre demande (${s}). Nous serions ravis de la réaliser pour vous. 🎨`, close: "Pour démarrer, dites-nous simplement quelques détails sur votre projet et nous vous envoyons le devis. On s'occupe de tout !", sig: "— L'équipe INOV Digital Services" },
  en: { hi: (f) => (f ? `Hi ${f}! 👋` : "Hello! 👋"), one: (s) => `Thanks for your request about *${s}*. We'd love to create it for you. 🎨`, many: (s) => `Thanks for your request (${s}). We'd love to create it for you. 🎨`, close: "To get started, just share a few details about your project and we'll send the quote. We'll handle the rest!", sig: "— The INOV Digital Services team" },
  es: { hi: (f) => (f ? `¡Hola ${f}! 👋` : "¡Hola! 👋"), one: (s) => `Gracias por tu solicitud sobre *${s}*. Nos encantaría crearlo para ti. 🎨`, many: (s) => `Gracias por tu solicitud (${s}). Nos encantaría crearlo para ti. 🎨`, close: "Para empezar, cuéntanos algunos detalles de tu proyecto y te enviamos el presupuesto. ¡Nosotros nos encargamos!", sig: "— El equipo de INOV Digital Services" },
  ht: { hi: (f) => (f ? `Bonjou ${f} ! 👋` : "Bonjou ! 👋"), one: (s) => `Mèsi pou demann ou sou *${s}*. Nou ta renmen reyalize l pou ou. 🎨`, many: (s) => `Mèsi pou demann ou (${s}). Nou ta renmen reyalize l pou ou. 🎨`, close: "Pou kòmanse, jis di nou kèk detay sou pwojè w la epi n ap voye devi a ba ou. N ap okipe tout bagay!", sig: "— Ekip INOV Digital Services" },
  pt: { hi: (f) => (f ? `Olá ${f}! 👋` : "Olá! 👋"), one: (s) => `Obrigado pelo seu pedido sobre *${s}*. Teríamos todo o gosto em criá-lo para si. 🎨`, many: (s) => `Obrigado pelo seu pedido (${s}). Teríamos todo o gosto em criá-lo para si. 🎨`, close: "Para começar, conte-nos alguns detalhes do seu projeto e enviamos o orçamento. Tratamos de tudo!", sig: "— A equipa INOV Digital Services" },
  it: { hi: (f) => (f ? `Ciao ${f}! 👋` : "Ciao! 👋"), one: (s) => `Grazie per la tua richiesta su *${s}*. Saremmo felici di realizzarla per te. 🎨`, many: (s) => `Grazie per la tua richiesta (${s}). Saremmo felici di realizzarla per te. 🎨`, close: "Per iniziare, raccontaci qualche dettaglio sul tuo progetto e ti inviamo il preventivo. Pensiamo a tutto noi!", sig: "— Il team INOV Digital Services" },
  de: { hi: (f) => (f ? `Hallo ${f}! 👋` : "Hallo! 👋"), one: (s) => `Vielen Dank für Ihre Anfrage zu *${s}*. Wir würden es gerne für Sie umsetzen. 🎨`, many: (s) => `Vielen Dank für Ihre Anfrage (${s}). Wir würden es gerne für Sie umsetzen. 🎨`, close: "Für den Start nennen Sie uns einfach ein paar Details zu Ihrem Projekt und wir senden Ihnen das Angebot. Wir kümmern uns um den Rest!", sig: "— Ihr INOV Digital Services Team" },
  ar: { hi: (f) => (f ? `مرحبًا ${f}! 👋` : "مرحبًا! 👋"), one: (s) => `شكرًا لطلبك بخصوص *${s}*. يسعدنا تنفيذه لك. 🎨`, many: (s) => `شكرًا لطلبك (${s}). يسعدنا تنفيذه لك. 🎨`, close: "للبدء، أخبرنا ببعض التفاصيل عن مشروعك وسنرسل لك عرض السعر. سنتكفّل بكل شيء!", sig: "— فريق INOV Digital Services" },
}
function waServiceReply(l: Lead): string {
  const t = WA_SERVICE[l.lang] ?? WA_SERVICE.fr
  const names = (l.items || []).map((i) => i.name).filter(Boolean)
  const lines = [t.hi(firstName(l)), ""]
  if (names.length === 1) lines.push(t.one(names[0]))
  else if (names.length > 1) lines.push(t.many(names.join(", ")))
  lines.push("", t.close, "", t.sig)
  return `https://wa.me/${l.phone.replace(/[^\d]/g, "")}?text=${encodeURIComponent(lines.join("\n"))}`
}

function buildReceiptHtml(l: Lead): string {
  const meta = (l.meta ?? {}) as Record<string, unknown>
  const method = (meta.paymentMethodLabel as string) || (meta.paymentMethod as string) || "—"
  const reference = (meta.reference as string) || ""
  const paid = l.status === "won"

  type Row = { label: string; qty: number; amount: string }
  let rows: Row[] = []
  if (l.items && l.items.length > 0) {
    rows = l.items.map((it) => ({
      label: it.name + (it.tier ? ` (${it.tier})` : ""),
      qty: it.qty,
      amount: fmtMoney(it.price, l.currency),
    }))
  } else if (Array.isArray(meta.services)) {
    const svc = meta.services as SvcLine[]
    const rate = typeof meta.rate === "number" ? (meta.rate as number) : null
    const mult = localMultiplier(svc, l.total, rate)
    rows = svc.map((s) => ({
      label: s.name,
      qty: s.qty,
      amount: svcLineAmount(s, l.currency, mult),
    }))
  }

  const balance =
    typeof l.total === "number" && typeof l.deposit === "number" ? l.total - l.deposit : null

  const logoSrc = /^(https?:|data:)/.test(logoLight) ? logoLight : location.origin + logoLight
  const dateStr = new Date(l.createdAt).toLocaleDateString("fr-FR")
  const emittedStr = new Date().toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" })
  const cell = "padding:13px 18px;border:1.5px solid #111;"

  const rowsHtml = rows.length
    ? rows
        .map(
          (r) => `<tr>
            <td style="${cell}font-weight:700;font-size:13px;letter-spacing:0.01em;">${esc(r.label.toUpperCase())}</td>
            <td style="${cell}text-align:center;font-weight:700;font-size:13px;">${esc(r.qty)}</td>
            <td style="${cell}text-align:right;font-weight:800;font-size:13px;white-space:nowrap;">${esc(r.amount)}</td>
          </tr>`,
        )
        .join("")
    : `<tr><td colspan="3" style="${cell}text-align:center;color:#666;font-weight:600;">Aucun détail de service enregistré.</td></tr>`

  const totalsRows = [
    `<tr>
      <td style="padding:9px 22px;border:1.5px solid #111;font-weight:700;font-size:13px;">Total</td>
      <td style="padding:9px 22px;border:1.5px solid #111;font-weight:800;font-size:13px;text-align:right;white-space:nowrap;">${esc(fmtMoney(l.total, l.currency))}</td>
    </tr>`,
    typeof l.deposit === "number"
      ? `<tr>
          <td style="padding:9px 22px;border:1.5px solid #111;font-weight:700;font-size:13px;">Acompte reçu</td>
          <td style="padding:9px 22px;border:1.5px solid #111;font-weight:700;font-size:13px;text-align:right;white-space:nowrap;">${esc(fmtMoney(l.deposit, l.currency))}</td>
        </tr>`
      : "",
    balance !== null
      ? `<tr>
          <td style="padding:9px 22px;border:1.5px solid #111;font-weight:700;font-size:13px;">Solde restant</td>
          <td style="padding:9px 22px;border:1.5px solid #111;font-weight:700;font-size:13px;text-align:right;white-space:nowrap;">${esc(fmtMoney(balance, l.currency))}</td>
        </tr>`
      : "",
    `<tr>
      <td style="padding:13px 22px;border:1.5px solid #111;background:#e2e2e2;font-weight:800;font-size:15px;">Montant ${paid ? "payé" : "dû"}</td>
      <td style="padding:13px 22px;border:1.5px solid #111;background:#e2e2e2;font-weight:900;font-size:15px;text-align:right;white-space:nowrap;">${esc(fmtMoney(typeof l.deposit === "number" && !paid ? l.deposit : l.total, l.currency))}</td>
    </tr>`,
  ].join("")

  const stampColor = paid ? "#16a34a" : "#F7931E"
  const stampText = paid ? "PAYÉ" : "EN ATTENTE"

  return `<!doctype html><html lang="fr"><head><meta charset="utf-8">
<title>Reçu ${esc(receiptNo(l))}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800;900&display=swap" rel="stylesheet">
<style>
  @page { size: A4; margin: 12mm; }
  * { box-sizing: border-box; }
  body { font-family: 'Outfit', sans-serif; color: #111; margin: 0; padding: 24px; background: #f4f4f4; }
  .noprint { text-align: center; margin-bottom: 20px; }
  .noprint button { font: inherit; font-weight: 800; cursor: pointer; background: #F7931E; color: #fff; border: none; padding: 11px 22px; border-radius: 8px; }
  @media print { body { padding: 0; background: #fff; } .noprint { display: none; } .sheet { box-shadow: none !important; } }
  .sheet { width: 780px; margin: 0 auto; background: #fff; box-shadow: 0 8px 40px rgba(0,0,0,0.12); }
</style></head>
<body>
  <div class="noprint"><button onclick="window.print()">Imprimer / Enregistrer en PDF</button></div>
  <div class="sheet">
    <div style="position:relative;font-family:'Outfit',sans-serif;width:780px;margin:0 auto;padding:48px 44px;background:#fff;color:#111;overflow:hidden;">
      <!-- Watermark -->
      <div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;pointer-events:none;overflow:hidden;">
        <img src="${logoSrc}" alt="" style="width:560px;height:auto;object-fit:contain;transform:rotate(-45deg);opacity:0.05;" />
      </div>

      <div style="position:relative;">
        <!-- Header -->
        <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:44px;">
          <div style="height:64px;flex-shrink:0;display:flex;align-items:center;">
            <img src="${logoSrc}" alt="INOV" style="height:64px;width:auto;object-fit:contain;display:block;" />
          </div>
          <div style="text-align:right;">
            <h1 style="font-size:38px;font-weight:900;color:#111;margin:0;letter-spacing:-0.01em;">REÇU</h1>
            <div style="margin-top:6px;font-size:14px;">
              <span style="font-weight:800;color:#111;">N° ${esc(receiptNo(l))}</span>
            </div>
            <div style="margin-top:10px;display:inline-block;padding:5px 16px;border:2.5px solid ${stampColor};color:${stampColor};font-weight:900;font-size:15px;letter-spacing:0.08em;transform:rotate(-3deg);border-radius:4px;">${stampText}</div>
          </div>
        </div>

        <!-- Info boxes -->
        <div style="display:flex;justify-content:space-between;gap:24px;margin-bottom:36px;">
          <table style="border-collapse:collapse;">
            <tr>
              <td style="padding:14px 20px;border:1.5px solid #111;background:#e2e2e2;font-weight:800;font-size:13px;letter-spacing:0.03em;">AU NOM DE</td>
              <td style="padding:14px 20px;border:1.5px solid #111;font-weight:700;font-size:13px;">${esc((l.name || "CLIENT").toUpperCase())}</td>
            </tr>
          </table>
          <table style="border-collapse:collapse;">
            <tr>
              <td style="padding:14px 20px;border:1.5px solid #111;background:#e2e2e2;font-weight:800;font-size:13px;letter-spacing:0.03em;">DATE</td>
              <td style="padding:14px 28px;border:1.5px solid #111;font-weight:700;font-size:13px;text-align:center;">${esc(emittedStr)}</td>
            </tr>
          </table>
        </div>

        <!-- Services table -->
        <table style="width:100%;border-collapse:collapse;margin-bottom:28px;">
          <thead>
            <tr style="background:#111;color:#fff;">
              <th style="padding:13px 18px;border:1.5px solid #111;text-align:left;font-size:13px;font-weight:800;letter-spacing:0.03em;">NOM DU SERVICE OU PRODUIT</th>
              <th style="padding:13px 18px;border:1.5px solid #111;text-align:center;font-size:13px;font-weight:800;letter-spacing:0.03em;width:70px;">QTÉ</th>
              <th style="padding:13px 18px;border:1.5px solid #111;text-align:left;font-size:13px;font-weight:800;letter-spacing:0.03em;width:130px;">PRIX</th>
            </tr>
          </thead>
          <tbody>${rowsHtml}</tbody>
        </table>

        <!-- Payment method -->
        <div style="margin-bottom:32px;font-size:13px;line-height:1.9;">
          <span style="font-weight:800;">Moyen de paiement :</span> ${esc(method)}${reference ? `&nbsp;&nbsp;·&nbsp;&nbsp;<span style="font-weight:800;">Référence :</span> ${esc(reference)}` : ""}<br>
          <span style="font-weight:800;">Date de la commande :</span> ${esc(dateStr)}
        </div>

        <!-- Footer -->
        <div style="display:flex;justify-content:space-between;align-items:flex-end;">
          <div style="font-size:14px;line-height:2;">
            <div style="font-weight:700;display:flex;align-items:center;gap:8px;"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#111" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>@inov_digital_services</div>
            <div style="font-weight:700;display:flex;align-items:center;gap:8px;"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#111" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>(+509) 3625-5920</div>
          </div>
          <div style="text-align:right;">
            <table style="border-collapse:collapse;">${totalsRows}</table>
          </div>
        </div>

        <div style="margin-top:36px;text-align:center;font-size:12px;color:#666;font-weight:600;">Merci de votre confiance. Ce reçu confirme la réception du paiement indiqué ci-dessus.</div>
      </div>
    </div>
  </div>
<script>window.addEventListener("load", function(){ setTimeout(function(){ try { window.print(); } catch(e){} }, 500); });</script>
</body></html>`
}

function printReceipt(l: Lead) {
  const w = window.open("", "_blank", "width=820,height=940")
  if (!w) {
    alert("Autorise les fenêtres pop-up pour générer le reçu.")
    return
  }
  w.document.write(buildReceiptHtml(l))
  w.document.close()
  w.focus()
}

function buildProformaHtml(l: Lead): string {
  const meta = (l.meta ?? {}) as Record<string, unknown>
  const proformaNo = (meta.proformaNo as string) || `PF-${new Date(l.createdAt).toISOString().slice(2, 10).replace(/-/g, "")}`
  const emittedStr = new Date(l.createdAt).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" })
  const validUntil = new Date(new Date(l.createdAt).getTime() + 15 * 86400000).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" })
  const logoSrc = /^(https?:|data:)/.test(logoLight) ? logoLight : location.origin + logoLight
  const cell = "padding:13px 18px;border:1.5px solid #111;"

  const rows = (l.items ?? []).map((it) => ({
    label: it.name + (it.tier ? ` (${it.tier})` : ""),
    qty: it.qty,
    amount: fmtMoney(it.price * it.qty, l.currency),
  }))
  const rowsHtml = rows.length
    ? rows.map((r) => `<tr>
        <td style="${cell}font-weight:700;font-size:13px;letter-spacing:0.01em;">${esc(r.label.toUpperCase())}</td>
        <td style="${cell}text-align:center;font-weight:700;font-size:13px;">${esc(r.qty)}</td>
        <td style="${cell}text-align:right;font-weight:800;font-size:13px;white-space:nowrap;">${esc(r.amount)}</td>
      </tr>`).join("")
    : `<tr><td colspan="3" style="${cell}text-align:center;color:#666;font-weight:600;">Aucun service sélectionné.</td></tr>`

  const totalsRows = [
    `<tr>
      <td style="padding:9px 22px;border:1.5px solid #111;font-weight:700;font-size:13px;">Total</td>
      <td style="padding:9px 22px;border:1.5px solid #111;font-weight:800;font-size:13px;text-align:right;white-space:nowrap;">${esc(fmtMoney(l.total, l.currency))}</td>
    </tr>`,
    typeof l.deposit === "number"
      ? `<tr>
          <td style="padding:13px 22px;border:1.5px solid #111;background:#e2e2e2;font-weight:800;font-size:15px;">Acompte (70%)</td>
          <td style="padding:13px 22px;border:1.5px solid #111;background:#e2e2e2;font-weight:900;font-size:15px;text-align:right;white-space:nowrap;">${esc(fmtMoney(l.deposit, l.currency))}</td>
        </tr>`
      : "",
  ].join("")

  return `<!doctype html><html lang="fr"><head><meta charset="utf-8">
<title>Proforma ${esc(proformaNo)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800;900&display=swap" rel="stylesheet">
<style>
  @page { size: A4; margin: 12mm; }
  * { box-sizing: border-box; }
  body { font-family: 'Outfit', sans-serif; color: #111; margin: 0; padding: 24px; background: #f4f4f4; }
  .noprint { text-align: center; margin-bottom: 20px; }
  .noprint button { font: inherit; font-weight: 800; cursor: pointer; background: #F7931E; color: #fff; border: none; padding: 11px 22px; border-radius: 8px; }
  @media print { body { padding: 0; background: #fff; } .noprint { display: none; } .sheet { box-shadow: none !important; } }
  .sheet { width: 780px; margin: 0 auto; background: #fff; box-shadow: 0 8px 40px rgba(0,0,0,0.12); }
</style></head>
<body>
  <div class="noprint"><button onclick="window.print()">Imprimer / Enregistrer en PDF</button></div>
  <div class="sheet">
    <div style="position:relative;font-family:'Outfit',sans-serif;width:780px;margin:0 auto;padding:48px 44px;background:#fff;color:#111;overflow:hidden;">
      <div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;pointer-events:none;overflow:hidden;">
        <img src="${logoSrc}" alt="" style="width:560px;height:auto;object-fit:contain;transform:rotate(-45deg);opacity:0.05;" />
      </div>
      <div style="position:relative;">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:44px;">
          <div style="height:64px;flex-shrink:0;display:flex;align-items:center;"><img src="${logoSrc}" alt="INOV" style="height:64px;width:auto;object-fit:contain;display:block;" /></div>
          <div style="text-align:right;">
            <h1 style="font-size:34px;font-weight:900;color:#111;margin:0;letter-spacing:-0.01em;">FACTURE PROFORMA</h1>
            <div style="margin-top:6px;font-size:14px;"><span style="font-weight:800;color:#111;">N° ${esc(proformaNo)}</span></div>
            <div style="margin-top:8px;font-size:12.5px;color:#555;">Valable jusqu'au <strong>${esc(validUntil)}</strong></div>
          </div>
        </div>
        <div style="display:flex;justify-content:space-between;gap:24px;margin-bottom:36px;">
          <table style="border-collapse:collapse;"><tr>
            <td style="padding:14px 20px;border:1.5px solid #111;background:#e2e2e2;font-weight:800;font-size:13px;letter-spacing:0.03em;">CLIENT</td>
            <td style="padding:14px 20px;border:1.5px solid #111;font-weight:700;font-size:13px;">${esc((l.name || "CLIENT").toUpperCase())}</td>
          </tr></table>
          <table style="border-collapse:collapse;"><tr>
            <td style="padding:14px 20px;border:1.5px solid #111;background:#e2e2e2;font-weight:800;font-size:13px;letter-spacing:0.03em;">DATE</td>
            <td style="padding:14px 28px;border:1.5px solid #111;font-weight:700;font-size:13px;text-align:center;">${esc(emittedStr)}</td>
          </tr></table>
        </div>
        <table style="width:100%;border-collapse:collapse;margin-bottom:28px;">
          <thead><tr style="background:#111;color:#fff;">
            <th style="padding:13px 18px;border:1.5px solid #111;text-align:left;font-size:13px;font-weight:800;letter-spacing:0.03em;">SERVICE</th>
            <th style="padding:13px 18px;border:1.5px solid #111;text-align:center;font-size:13px;font-weight:800;letter-spacing:0.03em;width:70px;">QTÉ</th>
            <th style="padding:13px 18px;border:1.5px solid #111;text-align:left;font-size:13px;font-weight:800;letter-spacing:0.03em;width:150px;">PRIX</th>
          </tr></thead>
          <tbody>${rowsHtml}</tbody>
        </table>
        <div style="display:flex;justify-content:flex-end;margin-bottom:28px;">
          <table style="border-collapse:collapse;min-width:320px;">${totalsRows}</table>
        </div>
        <div style="margin-top:8px;padding:12px 16px;border:1.5px dashed #111;background:#fafafa;font-size:11.5px;line-height:1.6;color:#333;">
          <strong style="display:block;font-size:12px;color:#111;margin-bottom:3px;text-transform:uppercase;letter-spacing:0.03em;">Important</strong>
          Ce document est une facture proforma : il ne constitue pas un reçu ni une preuve de paiement. Pour obtenir votre reçu officiel, veuillez effectuer le paiement puis nous transmettre une confirmation valable — soit le code / identifiant (ID) de la transaction, soit une capture d'écran lisible du paiement.
        </div>
        <div style="margin-top:24px;text-align:center;font-size:12px;color:#666;font-weight:600;">INOV Digital Services · @inov_digital_services · (+509) 3625-5920</div>
      </div>
    </div>
  </div>
<script>window.addEventListener("load", function(){ setTimeout(function(){ try { window.print(); } catch(e){} }, 500); });</script>
</body></html>`
}

function buildDeliveryHtml(l: Lead): string {
  const meta = (l.meta ?? {}) as Record<string, unknown>
  const deliveryNo = (meta.deliveryNo as string) || `BL-${new Date(l.createdAt).toISOString().slice(2, 10).replace(/-/g, "")}`
  const deliveryRef = (meta.deliveryRef as string) || ""
  const revisionDays = typeof meta.revisionDays === "number" ? (meta.revisionDays as number) : 0
  const emittedStr = new Date(l.createdAt).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" })
  const logoSrc = /^(https?:|data:)/.test(logoLight) ? logoLight : location.origin + logoLight
  const cell = "padding:13px 18px;border:1.5px solid #111;"

  const rows = (l.items ?? []).map((it) => ({ label: it.name + (it.tier ? ` (${it.tier})` : ""), qty: it.qty }))
  const rowsHtml = rows.length
    ? rows.map((r) => `<tr>
        <td style="${cell}font-weight:700;font-size:13px;letter-spacing:0.01em;">${esc(r.label.toUpperCase())}</td>
        <td style="${cell}text-align:center;font-weight:700;font-size:13px;width:90px;">${esc(r.qty)}</td>
        <td style="${cell}text-align:center;font-weight:800;font-size:12px;color:#16a34a;width:130px;">LIVRÉ</td>
      </tr>`).join("")
    : `<tr><td colspan="3" style="${cell}text-align:center;color:#666;font-weight:600;">Aucun livrable.</td></tr>`

  return `<!doctype html><html lang="fr"><head><meta charset="utf-8">
<title>Bon de livraison ${esc(deliveryNo)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800;900&display=swap" rel="stylesheet">
<style>
  @page { size: A4; margin: 12mm; }
  * { box-sizing: border-box; }
  body { font-family: 'Outfit', sans-serif; color: #111; margin: 0; padding: 24px; background: #f4f4f4; }
  .noprint { text-align: center; margin-bottom: 20px; }
  .noprint button { font: inherit; font-weight: 800; cursor: pointer; background: #F7931E; color: #fff; border: none; padding: 11px 22px; border-radius: 8px; }
  @media print { body { padding: 0; background: #fff; } .noprint { display: none; } .sheet { box-shadow: none !important; } }
  .sheet { width: 780px; margin: 0 auto; background: #fff; box-shadow: 0 8px 40px rgba(0,0,0,0.12); }
</style></head>
<body>
  <div class="noprint"><button onclick="window.print()">Imprimer / Enregistrer en PDF</button></div>
  <div class="sheet">
    <div style="position:relative;font-family:'Outfit',sans-serif;width:780px;margin:0 auto;padding:48px 44px;background:#fff;color:#111;overflow:hidden;">
      <div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;pointer-events:none;overflow:hidden;">
        <img src="${logoSrc}" alt="" style="width:560px;height:auto;object-fit:contain;transform:rotate(-45deg);opacity:0.05;" />
      </div>
      <div style="position:relative;">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:44px;">
          <div style="height:64px;flex-shrink:0;display:flex;align-items:center;"><img src="${logoSrc}" alt="INOV" style="height:64px;width:auto;object-fit:contain;display:block;" /></div>
          <div style="text-align:right;">
            <h1 style="font-size:32px;font-weight:900;color:#111;margin:0;letter-spacing:-0.01em;">BON DE LIVRAISON</h1>
            <div style="margin-top:6px;font-size:14px;"><span style="font-weight:800;color:#111;">N° ${esc(deliveryNo)}</span></div>
            <div style="margin-top:10px;display:inline-block;padding:5px 16px;border:2.5px solid #16a34a;color:#16a34a;font-weight:900;font-size:15px;letter-spacing:0.08em;transform:rotate(-3deg);border-radius:4px;">LIVRÉ</div>
          </div>
        </div>
        <div style="display:flex;justify-content:space-between;gap:24px;margin-bottom:36px;">
          <table style="border-collapse:collapse;"><tr>
            <td style="padding:14px 20px;border:1.5px solid #111;background:#e2e2e2;font-weight:800;font-size:13px;letter-spacing:0.03em;">CLIENT</td>
            <td style="padding:14px 20px;border:1.5px solid #111;font-weight:700;font-size:13px;">${esc((l.name || "CLIENT").toUpperCase())}</td>
          </tr></table>
          <table style="border-collapse:collapse;"><tr>
            <td style="padding:14px 20px;border:1.5px solid #111;background:#e2e2e2;font-weight:800;font-size:13px;letter-spacing:0.03em;">DATE DE LIVRAISON</td>
            <td style="padding:14px 28px;border:1.5px solid #111;font-weight:700;font-size:13px;text-align:center;">${esc(emittedStr)}</td>
          </tr></table>
        </div>
        <table style="width:100%;border-collapse:collapse;margin-bottom:28px;">
          <thead><tr style="background:#111;color:#fff;">
            <th style="padding:13px 18px;border:1.5px solid #111;text-align:left;font-size:13px;font-weight:800;letter-spacing:0.03em;">LIVRABLE</th>
            <th style="padding:13px 18px;border:1.5px solid #111;text-align:center;font-size:13px;font-weight:800;letter-spacing:0.03em;">QTÉ</th>
            <th style="padding:13px 18px;border:1.5px solid #111;text-align:center;font-size:13px;font-weight:800;letter-spacing:0.03em;">STATUT</th>
          </tr></thead>
          <tbody>${rowsHtml}</tbody>
        </table>
        ${deliveryRef ? `<div style="margin-bottom:22px;font-size:13px;line-height:1.9;"><span style="font-weight:800;">Accès aux livrables :</span> ${esc(deliveryRef)}</div>` : ""}
        <div style="margin-top:8px;padding:12px 16px;border:1.5px dashed #111;background:#fafafa;font-size:11.5px;line-height:1.6;color:#333;">
          <strong style="display:block;font-size:12px;color:#111;margin-bottom:3px;text-transform:uppercase;letter-spacing:0.03em;">Révisions & acceptation</strong>
          ${revisionDays > 0
            ? `Les révisions incluses peuvent être demandées dans un délai de <strong>${revisionDays} jour(s)</strong> à compter de cette livraison. `
            : ""}Passé ce délai, la livraison est réputée acceptée. Ce bon de livraison atteste de la remise des livrables ci-dessus et ne constitue pas un reçu de paiement.
        </div>
        <div style="margin-top:24px;text-align:center;font-size:12px;color:#666;font-weight:600;">INOV Digital Services · @inov_digital_services · (+509) 3625-5920</div>
      </div>
    </div>
  </div>
<script>window.addEventListener("load", function(){ setTimeout(function(){ try { window.print(); } catch(e){} }, 500); });</script>
</body></html>`
}

function printDoc(html: string) {
  const w = window.open("", "_blank", "width=820,height=940")
  if (!w) { alert("Autorise les fenêtres pop-up pour générer le document."); return }
  w.document.write(html)
  w.document.close()
  w.focus()
}

function ListSkeleton() {
  return (
    <div style={{ ...card, padding: 0, overflow: "hidden" }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, padding: "16px 18px", borderBottom: "1px solid var(--ds-border)" }}>
          <div className="adm-skel" style={{ width: 70, height: 20 }} />
          <div style={{ flex: 1, display: "grid", gap: 7 }}>
            <div className="adm-skel" style={{ width: "38%", height: 14 }} />
            <div className="adm-skel" style={{ width: "55%", height: 11 }} />
          </div>
          <div className="adm-skel" style={{ width: 60, height: 16 }} />
        </div>
      ))}
    </div>
  )
}

// ── Leads tab ─────────────────────────────────────────────────────────────────

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div style={{ fontSize: 11.5, fontWeight: 700, color: "var(--ds-text-faint)", textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</div>
      <div style={{ fontSize: 14, marginTop: 2, whiteSpace: "pre-wrap" }}>{value}</div>
    </div>
  )
}

// Renders client-uploaded brief attachments (from a "brief:*" lead's meta) with
// on-demand short-lived signed download links.
function BriefAttachments({ meta, leadId, onChange }: { meta: Record<string, unknown>; leadId: string; onChange: () => void }) {
  const list = (meta?.attachments as { path: string; name: string; size: number }[] | undefined) ?? []
  const [busy, setBusy] = useState<string | null>(null)
  const [del, setDel] = useState<string | null>(null)
  if (!Array.isArray(list) || list.length === 0) return null

  async function open(path: string) {
    setBusy(path)
    try {
      const { url } = await adminApi.briefFileUrl(path)
      window.open(url, "_blank", "noopener")
    } catch { /* signed-url fetch failed — ignore, admin can retry */ }
    finally { setBusy(null) }
  }
  async function remove(path: string, name: string) {
    if (!window.confirm(`Supprimer définitivement « ${name} » ? Ce fichier sera retiré du stockage Supabase.`)) return
    setDel(path)
    try {
      await adminApi.briefFileDelete(path, leadId)
      onChange()
    } catch { /* delete failed — ignore, admin can retry */ }
    finally { setDel(null) }
  }
  const kb = (n: number) => (n < 1024 * 1024 ? `${Math.round(n / 1024)} KB` : `${(n / 1048576).toFixed(1)} MB`)

  return (
    <div>
      <div style={{ fontSize: 11.5, fontWeight: 700, color: "var(--ds-text-faint)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>
        Fichiers joints ({list.length})
      </div>
      <div style={{ display: "grid", gap: 6 }}>
        {list.map((f) => (
          <div key={f.path} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", borderRadius: "var(--r-md)", background: "var(--ds-bg-sec)", border: "1px solid var(--ds-border)" }}>
            <FileText size={15} style={{ color: "var(--ds-text-muted)", flexShrink: 0 }} />
            <span style={{ flex: 1, minWidth: 0, fontSize: 13.5, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.name}</span>
            <span style={{ fontSize: 12, color: "var(--ds-text-faint)", fontFamily: "var(--font-space), monospace" }}>{kb(f.size)}</span>
            <button onClick={() => open(f.path)} disabled={busy === f.path} style={{ ...btn, padding: "5px 11px", fontSize: 12.5 }}>
              {busy === f.path ? <Loader2 size={13} style={{ animation: "spin 0.8s linear infinite" }} /> : <Download size={13} />} Ouvrir
            </button>
            <button onClick={() => remove(f.path, f.name)} disabled={del === f.path} title="Supprimer du stockage" style={{ ...btn, padding: "5px 9px", fontSize: 12.5, color: "#dc2626", borderColor: "color-mix(in srgb, #dc2626 40%, var(--ds-border))" }}>
              {del === f.path ? <Loader2 size={13} style={{ animation: "spin 0.8s linear infinite" }} /> : <Trash2 size={13} />}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Payments tab ──────────────────────────────────────────────────────────────

type NlArticle = { tag: string; title: string; excerpt: string; img: string; url: string }

function buildNewsletterHtml(args: { subject: string; intro: string; articles: NlArticle[] }): string {
  const { subject, intro, articles } = args
  const introHtml = esc(intro).replace(/\n/g, "<br>")
  const cards = articles.map((a) => `
    <tr><td style="padding:0 0 22px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e6e6e6;border-radius:12px;overflow:hidden;background:#fff;">
        <tr><td>
          <a href="${esc(a.url)}" style="text-decoration:none;color:inherit;">
            <img src="${esc(a.img)}" width="536" alt="${esc(a.title)}" style="display:block;width:100%;max-width:536px;height:auto;background:#eee;" />
          </a>
        </td></tr>
        <tr><td style="padding:20px 22px 22px;">
          <div style="font-size:11px;font-weight:800;letter-spacing:0.08em;text-transform:uppercase;color:#F7931E;margin-bottom:8px;">${esc(a.tag)}</div>
          <a href="${esc(a.url)}" style="text-decoration:none;"><div style="font-family:'Outfit',Arial,sans-serif;font-size:20px;line-height:1.3;font-weight:800;color:#111;margin-bottom:10px;">${esc(a.title)}</div></a>
          <div style="font-size:14.5px;line-height:1.6;color:#555;margin-bottom:18px;">${esc(a.excerpt)}</div>
          <a href="${esc(a.url)}" style="display:inline-block;background:#111;color:#fff;text-decoration:none;font-weight:700;font-size:14px;padding:11px 20px;border-radius:8px;">Lire l'article &rarr;</a>
        </td></tr>
      </table>
    </td></tr>`).join("")

  return `<!doctype html><html lang="fr"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light">
<title>${esc(subject)}</title></head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:'Outfit',Segoe UI,Arial,sans-serif;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${esc(intro).slice(0, 120)}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:24px 12px;">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:600px;max-width:600px;">
        <!-- Header -->
        <tr><td style="background:#111;border-radius:14px 14px 0 0;padding:26px;text-align:center;">
          <img src="${esc(EMAIL_LOGO_DARK)}" alt="INOV Digital Services" height="40" style="height:40px;width:auto;display:inline-block;" />
        </td></tr>
        <!-- Body -->
        <tr><td style="background:#fff;padding:30px 32px 8px;">
          <div style="font-size:15.5px;line-height:1.7;color:#333;margin-bottom:26px;">${introHtml}</div>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${cards}</table>
        </td></tr>
        <!-- Footer -->
        <tr><td style="background:#fff;border-radius:0 0 14px 14px;padding:8px 32px 34px;border-top:1px solid #eee;">
          <div style="font-size:13px;line-height:1.7;color:#888;text-align:center;padding-top:22px;">
            <strong style="color:#111;">INOV Digital Services</strong><br>
            Branding · Logo Design · Social Media Post Design · Design Web &amp; UI/UX · Vidéo &nbsp;·&nbsp; (+509) 3625-5920<br>
            <a href="https://www.instagram.com/inov_digital_services" style="color:#F7931E;text-decoration:none;">Instagram</a> &nbsp;·&nbsp;
            <a href="${esc(SITE_URL)}" style="color:#F7931E;text-decoration:none;">Site web</a><br>
            <span style="font-size:11.5px;color:#aaa;">Vous recevez cet e-mail car vous êtes abonné(e) à notre newsletter.</span>
          </div>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`
}


function EditField({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 5, minWidth: 0 }}>
      <span style={{ fontSize: 12.5, fontWeight: 700, color: "var(--ds-text-sec)" }}>{label}</span>
      {children}
      {hint && <span style={{ fontSize: 11.5, color: "var(--ds-text-faint)", lineHeight: 1.4 }}>{hint}</span>}
    </label>
  )
}

const sectionTitle: React.CSSProperties = {
  margin: 0, fontSize: 18, fontWeight: 800, fontFamily: "var(--font-space), sans-serif",
}
const smallLabel: React.CSSProperties = {
  fontSize: 11, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--ds-text-faint)",
}

// ── Services tab: hide built-in service cards & add custom ones ─────────────────

function ProcedureCard({ p }: { p: ServiceProcedure }) {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  async function copy() {
    try {
      await navigator.clipboard.writeText(procedureToText(p))
      setCopied(true); setTimeout(() => setCopied(false), 2000)
    } catch { /* clipboard bloqué */ }
  }
  const List = ({ title, items, ordered }: { title: string; items: string[]; ordered?: boolean }) => (
    <div>
      <span style={smallLabel}>{title}</span>
      {ordered ? (
        <ol style={{ margin: "6px 0 0", paddingLeft: 20, display: "flex", flexDirection: "column", gap: 4 }}>
          {items.map((x, i) => <li key={i} style={{ fontSize: 13.5, lineHeight: 1.5 }}>{x}</li>)}
        </ol>
      ) : (
        <ul style={{ margin: "6px 0 0", paddingLeft: 20, display: "flex", flexDirection: "column", gap: 4 }}>
          {items.map((x, i) => <li key={i} style={{ fontSize: 13.5, lineHeight: 1.5 }}>{x}</li>)}
        </ul>
      )}
    </div>
  )
  return (
    <div style={{ ...card, display: "flex", flexDirection: "column", gap: open ? 14 : 0 }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
        <button
          onClick={() => setOpen((v) => !v)}
          style={{ background: "none", border: "none", padding: 0, cursor: "pointer", textAlign: "left", flex: 1, minWidth: 0, color: "inherit" }}
        >
          <span style={{ ...sectionTitle, fontSize: 16 }}>{p.name}</span>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--ds-text-muted)", lineHeight: 1.5 }}>{p.intro}</p>
        </button>
        <button style={{ ...btn, padding: "7px 12px" }} onClick={() => setOpen((v) => !v)}>
          {open ? <><EyeOff size={14} /> Réduire</> : <><Eye size={14} /> Détails</>}
        </button>
      </div>

      {open && (
        <>
          <List title="Ce que le client doit fournir" items={p.clientProvides} />
          <List title="Procédure conseillée" items={p.steps} ordered />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div><span style={smallLabel}>Délai indicatif</span><p style={{ margin: "6px 0 0", fontSize: 13.5, lineHeight: 1.5 }}>{p.timeline}</p></div>
            <div><span style={smallLabel}>Révisions</span><p style={{ margin: "6px 0 0", fontSize: 13.5, lineHeight: 1.5 }}>{p.revisions}</p></div>
          </div>
          <List title="Ce que le client reçoit" items={p.deliverables} />
          {p.tips && p.tips.length > 0 && <List title="Conseils" items={p.tips} />}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 2 }}>
            <button style={btnPrimary} onClick={copy}>
              {copied ? <><Check size={15} /> Copié !</> : <><Copy size={15} /> Copier pour un client</>}
            </button>
            {p.brief && (
              <a href={`/brief/${p.brief}`} target="_blank" rel="noreferrer" style={{ ...btn, textDecoration: "none" }}>
                <ExternalLink size={15} /> Ouvrir le formulaire
              </a>
            )}
          </div>
        </>
      )}
    </div>
  )
}


function Empty({ text }: { text: string }) {
  return (
    <div style={{ ...card, textAlign: "center", padding: 48, color: "var(--ds-text-muted)" }}>{text}</div>
  )
}

// ── EventualitesTab ────────────────────────────────────────────────────────────

export type { SortKey, SvcLine, NlArticle }
export {
  SITE_URL, EMAIL_LOGO_DARK, NL_LANGS, NL_INTRO, STATUSES, STATUS_LABEL, STATUS_COLOR, PAY_STATUS_LABEL, SORT_LABEL, TIER_FR, shell, card, btn, btnPrimary, input, STYLE, sectionTitle, smallLabel, Stat, Toolbar, Chip, matchLead, sortLeads, downloadCsv, withLocalAmounts, esc, fmtMoney, receiptNo, localMultiplier, svcLineAmount, firstName, replyGreeting, amountLabel, mailtoReply, waReply, waServiceReply, buildReceiptHtml, printReceipt, buildProformaHtml, buildDeliveryHtml, printDoc, ListSkeleton, Field, BriefAttachments, EditField, ProcedureCard, Empty, buildNewsletterHtml,
}
