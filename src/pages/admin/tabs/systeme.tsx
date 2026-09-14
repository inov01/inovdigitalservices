// Systeme: parametres & securite.
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

function SettingsTab() {
  const [settings, setSettings] = useState<SiteSettings | null>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    adminApi.getSettings().then((r) => setSettings(r.settings)).catch(() => setSettings({ announcement: { enabled: false, text: "", link: "" } }))
  }, [])

  async function save() {
    if (!settings) return
    setSaving(true); setSaved(false)
    try {
      await adminApi.saveSettings(settings)
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } finally {
      setSaving(false)
    }
  }

  if (!settings) return <Empty text="Chargement…" />
  const a = settings.announcement

  return (
    <>
    <div style={{ ...card, display: "flex", flexDirection: "column", gap: 18, maxWidth: 640 }}>
      <div>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, fontFamily: "var(--font-space), sans-serif" }}>Bandeau d'annonce</h2>
        <p style={{ margin: "6px 0 0", fontSize: 13.5, color: "var(--ds-text-muted)", lineHeight: 1.5 }}>
          Affiche une bannière en haut du site public (promo, message important…). Modifiable ici, en direct.
        </p>
      </div>

      {/* Live preview */}
      {a.enabled && a.text && (
        <div style={{ background: "var(--ds-accent-grad)", color: "#fff", borderRadius: "var(--r-md)", padding: "10px 14px", fontSize: 13.5, fontWeight: 600, textAlign: "center" }}>
          {a.text}{a.link ? " →" : ""}
        </div>
      )}

      <label style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
        <input type="checkbox" checked={a.enabled}
          onChange={(e) => setSettings({ ...settings, announcement: { ...a, enabled: e.target.checked } })} />
        Activer le bandeau
      </label>

      <label style={{ fontSize: 13, fontWeight: 600, color: "var(--ds-text-sec)" }}>
        Texte
        <input style={{ ...input, marginTop: 6 }} value={a.text} maxLength={140}
          placeholder="Ex : -20% sur les logos jusqu'au 30 septembre !"
          onChange={(e) => setSettings({ ...settings, announcement: { ...a, text: e.target.value } })} />
        <span style={{ fontSize: 11.5, color: "var(--ds-text-faint)", marginTop: 4, display: "block" }}>{a.text.length}/140</span>
      </label>

      <label style={{ fontSize: 13, fontWeight: 600, color: "var(--ds-text-sec)" }}>
        Lien (optionnel)
        <input style={{ ...input, marginTop: 6 }} value={a.link}
          placeholder="https://wa.me/50936255920 ou #pricing"
          onChange={(e) => setSettings({ ...settings, announcement: { ...a, link: e.target.value } })} />
      </label>

      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <button style={{ ...btnPrimary, opacity: saving ? 0.7 : 1 }} onClick={save} disabled={saving}>
          {saving ? <Loader2 size={15} style={{ animation: "spin 0.8s linear infinite" }} /> : null}
          Enregistrer
        </button>
        {saved && <span style={{ color: "var(--ds-success)", fontSize: 13.5, fontWeight: 600 }}>Enregistré ✓</span>}
        <a href="/" target="_blank" rel="noreferrer" style={{ ...btn, textDecoration: "none", marginLeft: "auto" }}>
          <ExternalLink size={15} /> Voir le site
        </a>
      </div>
    </div>
    <SecurityPanel />
    </>
  )
}

// ── 2FA setup / management (admin security) ────────────────────────────────────
function SecurityPanel() {
  const [enabled, setEnabled] = useState<boolean | null>(null)
  const [factorId, setFactorId] = useState<string | null>(null)
  // Enrollment flow state.
  const [enroll, setEnroll] = useState<{ id: string; qr: string; secret: string } | null>(null)
  const [code, setCode] = useState("")
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState("")
  const [msg, setMsg] = useState("")

  async function refresh() {
    try {
      const { data } = await supabase.auth.mfa.listFactors()
      const totp = data?.totp?.find((f) => f.status === "verified") ?? data?.totp?.[0]
      setEnabled(Boolean(totp && totp.status === "verified"))
      setFactorId(totp?.id ?? null)
    } catch {
      setEnabled(false)
    }
  }
  useEffect(() => { refresh() }, [])

  async function startEnroll() {
    setErr(""); setMsg(""); setBusy(true)
    try {
      const { data, error } = await supabase.auth.mfa.enroll({ factorType: "totp" })
      if (error) throw error
      setEnroll({ id: data.id, qr: data.totp.qr_code, secret: data.totp.secret })
    } catch (e: any) {
      setErr(e?.message ?? "Impossible de démarrer la configuration.")
    } finally {
      setBusy(false)
    }
  }

  async function confirmEnroll(e: React.FormEvent) {
    e.preventDefault()
    if (!enroll) return
    setErr(""); setBusy(true)
    try {
      const { data: ch, error: cErr } = await supabase.auth.mfa.challenge({ factorId: enroll.id })
      if (cErr) throw cErr
      const { error: vErr } = await supabase.auth.mfa.verify({ factorId: enroll.id, challengeId: ch.id, code: code.trim() })
      if (vErr) throw vErr
      setEnroll(null); setCode(""); setMsg("Vérification en deux étapes activée ✓")
      await refresh()
    } catch (e: any) {
      setErr(e?.message ?? "Code invalide. Réessaie.")
    } finally {
      setBusy(false)
    }
  }

  async function cancelEnroll() {
    if (enroll) { try { await supabase.auth.mfa.unenroll({ factorId: enroll.id }) } catch { /* ignore */ } }
    setEnroll(null); setCode(""); setErr("")
  }

  async function disable() {
    if (!factorId) return
    if (!confirm("Désactiver la vérification en deux étapes ? Ton compte sera moins protégé.")) return
    setBusy(true); setErr("")
    try {
      const { error } = await supabase.auth.mfa.unenroll({ factorId })
      if (error) throw error
      setMsg("Vérification en deux étapes désactivée.")
      await refresh()
    } catch (e: any) {
      setErr(e?.message ?? "Impossible de désactiver.")
    } finally {
      setBusy(false)
    }
  }

  return (
    <div style={{ ...card, display: "flex", flexDirection: "column", gap: 16, maxWidth: 640, marginTop: 18 }}>
      <div>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, fontFamily: "var(--font-space), sans-serif", display: "flex", alignItems: "center", gap: 8 }}>
          <ShieldCheck size={18} style={{ color: "var(--ds-accent)" }} /> Sécurité du compte
        </h2>
        <p style={{ margin: "6px 0 0", fontSize: 13.5, color: "var(--ds-text-muted)", lineHeight: 1.5 }}>
          La vérification en deux étapes (2FA) protège l'espace admin : après ton mot de passe, un code temporaire de ton téléphone sera exigé.
        </p>
      </div>

      {msg && <div style={{ color: "var(--ds-success)", fontSize: 13.5, fontWeight: 600 }}>{msg}</div>}
      {err && <div style={{ color: "var(--ds-danger)", fontSize: 13.5, fontWeight: 600 }}>{err}</div>}

      {enabled === null ? (
        <div style={{ color: "var(--ds-text-muted)", fontSize: 13.5 }}>Chargement…</div>
      ) : enroll ? (
        <form onSubmit={confirmEnroll} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <p style={{ margin: 0, fontSize: 13.5, color: "var(--ds-text-sec)", lineHeight: 1.5 }}>
            1. Scanne ce QR code avec Google Authenticator, Authy ou 1Password.
          </p>
          <div style={{ background: "#fff", borderRadius: "var(--r-md)", padding: 14, width: "fit-content" }}
            dangerouslySetInnerHTML={{ __html: enroll.qr }} />
          <div style={{ fontSize: 12.5, color: "var(--ds-text-muted)" }}>
            Ou saisis la clé manuellement :{" "}
            <code style={{ fontFamily: "monospace", color: "var(--ds-text)", background: "var(--ds-bg-sec)", padding: "2px 6px", borderRadius: 6, wordBreak: "break-all" }}>{enroll.secret}</code>
          </div>
          <label style={{ fontSize: 13, fontWeight: 600, color: "var(--ds-text-sec)" }}>
            2. Entre le code à 6 chiffres généré
            <input style={{ ...input, marginTop: 6, letterSpacing: "0.3em", fontWeight: 700 }} inputMode="numeric"
              autoComplete="one-time-code" maxLength={6} value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))} placeholder="••••••" />
          </label>
          <div style={{ display: "flex", gap: 10 }}>
            <button type="submit" disabled={busy || code.length < 6} style={{ ...btnPrimary, opacity: busy || code.length < 6 ? 0.7 : 1 }}>
              {busy ? <Loader2 size={15} style={{ animation: "spin 0.8s linear infinite" }} /> : null} Activer la 2FA
            </button>
            <button type="button" onClick={cancelEnroll} style={btn}>Annuler</button>
          </div>
        </form>
      ) : enabled ? (
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 7, fontSize: 13.5, fontWeight: 700, color: "var(--ds-success)" }}>
            <Check size={15} /> 2FA activée
          </span>
          <button onClick={disable} disabled={busy} style={{ ...btn, marginLeft: "auto", color: "var(--ds-danger)", borderColor: "var(--ds-danger-a40)" }}>
            {busy ? <Loader2 size={14} style={{ animation: "spin 0.8s linear infinite" }} /> : <X size={14} />} Désactiver
          </button>
        </div>
      ) : (
        <button onClick={startEnroll} disabled={busy} style={{ ...btnPrimary, width: "fit-content", opacity: busy ? 0.7 : 1 }}>
          {busy ? <Loader2 size={15} style={{ animation: "spin 0.8s linear infinite" }} /> : <Smartphone size={15} />} Activer la vérification en deux étapes
        </button>
      )}
    </div>
  )
}

// ── Small labelled-field helper for the editor tabs ────────────────────────────

export { SettingsTab }
