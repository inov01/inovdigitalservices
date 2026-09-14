// Authentication & 2FA gate screens for the admin.
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
import { SITE_URL, EMAIL_LOGO_DARK, NL_LANGS, NL_INTRO, STATUSES, STATUS_LABEL, STATUS_COLOR, PAY_STATUS_LABEL, SORT_LABEL, TIER_FR, shell, card, btn, btnPrimary, input, STYLE, sectionTitle, smallLabel, Stat, Toolbar, Chip, matchLead, sortLeads, downloadCsv, withLocalAmounts, esc, fmtMoney, receiptNo, localMultiplier, svcLineAmount, firstName, replyGreeting, amountLabel, mailtoReply, waReply, waServiceReply, buildReceiptHtml, printReceipt, buildProformaHtml, buildDeliveryHtml, printDoc, ListSkeleton, Field, BriefAttachments, EditField, ProcedureCard, Empty, buildNewsletterHtml, AdminStyle, type SortKey, type SvcLine, type NlArticle } from "./shared"

function LoginScreen({ onSignIn, expired, onClearExpired }: { onSignIn: (e: string, p: string) => Promise<void>; expired?: boolean; onClearExpired?: () => void }) {
  const [initialized, setInitialized] = useState<boolean | null>(null)
  const [emailV, setEmailV] = useState("")
  const [passV, setPassV] = useState("")
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState("")
  const [setupMode, setSetupMode] = useState(false)

  useEffect(() => {
    api.bootstrapStatus()
      .then((r) => { setInitialized(r.initialized); setSetupMode(!r.initialized) })
      .catch(() => setInitialized(true))
  }, [])

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setErr(""); setBusy(true)
    onClearExpired?.()
    try {
      if (setupMode) {
        await api.bootstrap(emailV, passV)
      }
      await onSignIn(emailV, passV)
    } catch (e: any) {
      setErr(e?.message ?? "Une erreur est survenue.")
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="dark" style={{ ...shell, display: "grid", placeItems: "center", padding: 24 }}>
      <div style={{ width: "100%", maxWidth: 400 }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14, marginBottom: 28 }}>
          <img src={logoDark} alt="INOV Digital Services" style={{ height: 52 }} />
          <div style={{ display: "flex", alignItems: "center", gap: 7, color: "var(--ds-text-muted)", fontSize: 13, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase" }}>
            <ShieldCheck size={15} style={{ color: "var(--ds-accent)" }} /> Espace administrateur
          </div>
        </div>

        <form onSubmit={submit} style={{ ...card, padding: 28, display: "flex", flexDirection: "column", gap: 16 }}>
          <h1 style={{ fontSize: 20, fontWeight: 800, margin: 0, fontFamily: "var(--font-space), sans-serif" }}>
            {setupMode ? "Première configuration" : "Connexion"}
          </h1>
          {setupMode && (
            <p style={{ margin: 0, fontSize: 13.5, color: "var(--ds-text-muted)", lineHeight: 1.5 }}>
              Aucun compte admin n'existe encore. Crée ton compte : il deviendra le seul administrateur du site.
            </p>
          )}
          {expired && (
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--ds-accent)", background: "var(--ds-accent-a12)", border: "1px solid var(--ds-accent-a40, rgba(247,147,30,0.35))", borderRadius: "var(--r-md)", padding: "10px 12px", lineHeight: 1.45 }}>
              Session expirée pour raison de sécurité. Reconnecte-toi.
            </div>
          )}
          <label style={{ fontSize: 13, fontWeight: 600, color: "var(--ds-text-sec)" }}>
            E-mail
            <input style={{ ...input, marginTop: 6 }} type="email" required value={emailV}
              onChange={(e) => setEmailV(e.target.value)} placeholder="admin@inovdigital.ht" autoComplete="email" />
          </label>
          <label style={{ fontSize: 13, fontWeight: 600, color: "var(--ds-text-sec)" }}>
            Mot de passe
            <input style={{ ...input, marginTop: 6 }} type="password" required value={passV}
              onChange={(e) => setPassV(e.target.value)} placeholder={setupMode ? "8 caractères minimum" : "••••••••"}
              autoComplete={setupMode ? "new-password" : "current-password"} minLength={setupMode ? 8 : undefined} />
          </label>

          {err && <div style={{ color: "var(--ds-danger)", fontSize: 13.5, fontWeight: 600 }}>{err}</div>}

          <button type="submit" disabled={busy || initialized === null} style={{ ...btnPrimary, justifyContent: "center", padding: "12px 14px", opacity: busy ? 0.7 : 1 }}>
            {busy ? <Loader2 size={16} style={{ animation: "spin 0.8s linear infinite" }} /> : null}
            {setupMode ? "Créer le compte admin" : "Se connecter"}
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: 18 }}>
          <a href="/" style={{ color: "var(--ds-text-muted)", fontSize: 13, textDecoration: "none" }}>← Retour au site</a>
        </div>
      </div>
    </div>
  )
}

// ── Forced 2FA enrollment (blocks dashboard until TOTP is set up) ─────────────
function ForcedMfaSetupScreen({ onEnrolled, onCancel }: { onEnrolled: () => void; onCancel: () => void }) {
  const [enroll, setEnroll] = useState<{ id: string; qr: string; secret: string } | null>(null)
  const [code, setCode] = useState("")
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState("")

  useEffect(() => {
    let cancelled = false
    setBusy(true)
    supabase.auth.mfa.enroll({ factorType: "totp" })
      .then(({ data, error }) => {
        if (cancelled) return
        if (error) { setErr(error.message); setBusy(false); return }
        setEnroll({ id: data.id, qr: data.totp.qr_code, secret: data.totp.secret })
        setBusy(false)
      })
      .catch((e: any) => { if (!cancelled) { setErr(e?.message ?? "Erreur lors de l'initialisation."); setBusy(false) } })
    return () => { cancelled = true }
  }, [])

  async function confirm(e: React.FormEvent) {
    e.preventDefault()
    if (!enroll) return
    setErr(""); setBusy(true)
    try {
      const { data: ch, error: cErr } = await supabase.auth.mfa.challenge({ factorId: enroll.id })
      if (cErr) throw cErr
      const { error: vErr } = await supabase.auth.mfa.verify({ factorId: enroll.id, challengeId: ch.id, code: code.trim() })
      if (vErr) throw vErr
      onEnrolled()
    } catch (e: any) {
      setErr(e?.message ?? "Code invalide. Réessaie.")
    } finally {
      setBusy(false)
    }
  }

  async function cancel() {
    if (enroll) { try { await supabase.auth.mfa.unenroll({ factorId: enroll.id }) } catch { /* ignore */ } }
    onCancel()
  }

  return (
    <div className="dark" style={{ ...shell, display: "grid", placeItems: "center", padding: 24 }}>
      <div style={{ width: "100%", maxWidth: 440 }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14, marginBottom: 28 }}>
          <img src={logoDark} alt="INOV Digital Services" style={{ height: 52 }} />
          <div style={{ display: "flex", alignItems: "center", gap: 7, color: "var(--ds-text-muted)", fontSize: 13, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase" }}>
            <ShieldCheck size={15} style={{ color: "var(--ds-accent)" }} /> Sécurité obligatoire
          </div>
        </div>

        <div style={{ ...card, padding: 28, display: "flex", flexDirection: "column", gap: 18 }}>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 800, margin: "0 0 8px", fontFamily: "var(--font-space), sans-serif" }}>
              Activer la vérification en 2 étapes
            </h1>
            <p style={{ margin: 0, fontSize: 13.5, color: "var(--ds-text-muted)", lineHeight: 1.55 }}>
              Pour accéder à l'espace admin, vous devez configurer l'authentification à deux facteurs (2FA). C'est obligatoire pour protéger votre compte.
            </p>
          </div>

          {err && <div style={{ color: "var(--ds-danger)", fontSize: 13.5, fontWeight: 600 }}>{err}</div>}

          {busy && !enroll ? (
            <div style={{ display: "flex", alignItems: "center", gap: 10, color: "var(--ds-text-muted)", fontSize: 14 }}>
              <Loader2 size={18} style={{ animation: "spin 0.8s linear infinite" }} /> Génération du QR code…
            </div>
          ) : enroll ? (
            <form onSubmit={confirm} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <p style={{ margin: 0, fontSize: 13.5, color: "var(--ds-text-sec)", lineHeight: 1.5 }}>
                <strong>1.</strong> Scanne ce QR code avec <strong>Google Authenticator</strong>, <strong>Authy</strong> ou <strong>1Password</strong>.
              </p>
              <div style={{ background: "#fff", borderRadius: "var(--r-md)", padding: 14, width: "fit-content" }}
                dangerouslySetInnerHTML={{ __html: enroll.qr }} />
              <div style={{ fontSize: 12.5, color: "var(--ds-text-muted)", lineHeight: 1.5 }}>
                Ou saisis la clé manuellement :{" "}
                <code style={{ fontFamily: "monospace", color: "var(--ds-text)", background: "var(--ds-bg-sec)", padding: "2px 6px", borderRadius: 6, wordBreak: "break-all" }}>{enroll.secret}</code>
              </div>
              <label style={{ fontSize: 13, fontWeight: 600, color: "var(--ds-text-sec)" }}>
                <strong>2.</strong> Entre le code à 6 chiffres affiché
                <input style={{ ...input, marginTop: 8, textAlign: "center", letterSpacing: "0.4em", fontSize: 20, fontWeight: 700 }}
                  inputMode="numeric" autoFocus autoComplete="one-time-code" maxLength={6}
                  value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))} placeholder="••••••" />
              </label>
              {err && <div style={{ color: "var(--ds-danger)", fontSize: 13.5, fontWeight: 600 }}>{err}</div>}
              <div style={{ display: "flex", gap: 10 }}>
                <button type="submit" disabled={busy || code.length < 6}
                  style={{ ...btnPrimary, flex: 1, justifyContent: "center", opacity: busy || code.length < 6 ? 0.7 : 1 }}>
                  {busy ? <Loader2 size={16} style={{ animation: "spin 0.8s linear infinite" }} /> : <KeyRound size={15} />} Activer et accéder
                </button>
                <button type="button" onClick={cancel} style={btn}><LogOut size={15} /></button>
              </div>
            </form>
          ) : null}
        </div>

        <div style={{ textAlign: "center", marginTop: 16 }}>
          <button type="button" onClick={cancel} style={{ background: "none", border: "none", color: "var(--ds-text-muted)", fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>
            ← Annuler et se déconnecter
          </button>
        </div>
      </div>
    </div>
  )
}

// ── 2FA challenge (step-up to AAL2 on login) ───────────────────────────────────
function MfaChallengeScreen({ onVerified, onCancel }: { onVerified: () => void; onCancel: () => void }) {
  const [code, setCode] = useState("")
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState("")

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setErr(""); setBusy(true)
    try {
      const { data: list, error: lErr } = await supabase.auth.mfa.listFactors()
      if (lErr) throw lErr
      const factor = list?.totp?.[0]
      if (!factor) { onVerified(); return }
      const { data: ch, error: cErr } = await supabase.auth.mfa.challenge({ factorId: factor.id })
      if (cErr) throw cErr
      const { error: vErr } = await supabase.auth.mfa.verify({
        factorId: factor.id, challengeId: ch.id, code: code.trim(),
      })
      if (vErr) throw vErr
      onVerified()
    } catch (e: any) {
      setErr(e?.message ?? "Code invalide. Réessaie.")
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="dark" style={{ ...shell, display: "grid", placeItems: "center", padding: 24 }}>
      <div style={{ width: "100%", maxWidth: 400 }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14, marginBottom: 28 }}>
          <img src={logoDark} alt="INOV Digital Services" style={{ height: 52 }} />
          <div style={{ display: "flex", alignItems: "center", gap: 7, color: "var(--ds-text-muted)", fontSize: 13, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase" }}>
            <KeyRound size={15} style={{ color: "var(--ds-accent)" }} /> Vérification en deux étapes
          </div>
        </div>
        <form onSubmit={submit} style={{ ...card, padding: 28, display: "flex", flexDirection: "column", gap: 16 }}>
          <h1 style={{ fontSize: 20, fontWeight: 800, margin: 0, fontFamily: "var(--font-space), sans-serif" }}>Code d'authentification</h1>
          <p style={{ margin: 0, fontSize: 13.5, color: "var(--ds-text-muted)", lineHeight: 1.5 }}>
            Ouvre ton application d'authentification (Google Authenticator, Authy…) et saisis le code à 6 chiffres.
          </p>
          <input style={{ ...input, textAlign: "center", letterSpacing: "0.4em", fontSize: 20, fontWeight: 700 }}
            inputMode="numeric" autoFocus autoComplete="one-time-code" maxLength={6}
            value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))} placeholder="••••••" />
          {err && <div style={{ color: "var(--ds-danger)", fontSize: 13.5, fontWeight: 600 }}>{err}</div>}
          <button type="submit" disabled={busy || code.length < 6} style={{ ...btnPrimary, justifyContent: "center", padding: "12px 14px", opacity: busy || code.length < 6 ? 0.7 : 1 }}>
            {busy ? <Loader2 size={16} style={{ animation: "spin 0.8s linear infinite" }} /> : null}
            Vérifier
          </button>
          <button type="button" onClick={onCancel} style={{ ...btn, justifyContent: "center" }}>
            <LogOut size={15} /> Annuler et se déconnecter
          </button>
        </form>
      </div>
    </div>
  )
}

// ── Step-up re-authentication (before every modification) ──────────────────────
// Registers a verifier with the API gate. Any admin write pops this modal and
// resolves only once the user re-enters their password and (if enrolled) their
// 2FA code. A correct password refreshes the session; when a TOTP factor exists
// the challenge re-elevates it to AAL2, so we always end fully verified.
function StepUpModal({ email }: { email: string }) {
  const [open, setOpen] = useState(false)
  const [enrolled, setEnrolled] = useState<boolean | null>(null)
  const [password, setPassword] = useState("")
  const [code, setCode] = useState("")
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState("")
  const resolver = useRef<((v: boolean) => void) | null>(null)

  useEffect(() => {
    registerStepUpVerifier(() => new Promise<boolean>((resolve) => {
      resolver.current = resolve
      setPassword(""); setCode(""); setErr(""); setEnrolled(null); setOpen(true)
      supabase.auth.mfa.listFactors()
        .then(({ data }) => setEnrolled(Boolean(data?.totp?.some((f) => f.status === "verified"))))
        .catch(() => setEnrolled(false))
    }))
    return () => registerStepUpVerifier(null)
  }, [])

  function done(v: boolean) {
    setOpen(false)
    const r = resolver.current
    resolver.current = null
    r?.(v)
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setErr(""); setBusy(true)
    try {
      const { error: pErr } = await supabase.auth.signInWithPassword({ email, password })
      if (pErr) throw new Error("Mot de passe incorrect.")
      if (enrolled) {
        const { data: list } = await supabase.auth.mfa.listFactors()
        const factor = list?.totp?.find((f) => f.status === "verified") ?? list?.totp?.[0]
        if (!factor) throw new Error("Facteur 2FA introuvable.")
        const { data: ch, error: cErr } = await supabase.auth.mfa.challenge({ factorId: factor.id })
        if (cErr) throw cErr
        const { error: vErr } = await supabase.auth.mfa.verify({ factorId: factor.id, challengeId: ch.id, code: code.trim() })
        if (vErr) throw new Error("Code invalide.")
      }
      done(true)
    } catch (e: any) {
      setErr(e?.message ?? "Vérification échouée.")
    } finally {
      setBusy(false)
    }
  }

  if (!open) return null
  const disabled = busy || !password || (enrolled === true && code.length < 6)
  return (
    <div onClick={() => !busy && done(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.72)", zIndex: 80, display: "grid", placeItems: "center", padding: 20 }}>
      <form onClick={(e) => e.stopPropagation()} onSubmit={submit} style={{ ...card, width: "100%", maxWidth: 400, padding: 26, display: "flex", flexDirection: "column", gap: 15 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <ShieldCheck size={20} style={{ color: "var(--ds-accent)" }} />
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, fontFamily: "var(--font-space), sans-serif" }}>Confirmer votre identité</h2>
        </div>
        <p style={{ margin: 0, fontSize: 13.5, color: "var(--ds-text-muted)", lineHeight: 1.5 }}>
          Cette action modifie le site. Ré-entrez votre mot de passe{enrolled ? " et votre code 2FA" : ""} pour continuer.
        </p>
        <label style={{ fontSize: 13, fontWeight: 600, color: "var(--ds-text-sec)" }}>
          Mot de passe
          <input type="password" autoFocus autoComplete="current-password" style={{ ...input, marginTop: 6 }}
            value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
        </label>
        {enrolled && (
          <label style={{ fontSize: 13, fontWeight: 600, color: "var(--ds-text-sec)" }}>
            Code d'authentification
            <input inputMode="numeric" autoComplete="one-time-code" maxLength={6}
              style={{ ...input, marginTop: 6, letterSpacing: "0.3em", fontWeight: 700 }}
              value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))} placeholder="••••••" />
          </label>
        )}
        {enrolled === false && (
          <div style={{ fontSize: 12.5, color: "#f59e0b", lineHeight: 1.5 }}>
            La 2FA n'est pas encore activée. Activez-la dans Paramètres › Sécurité pour une protection maximale.
          </div>
        )}
        {err && <div style={{ color: "var(--ds-danger)", fontSize: 13.5, fontWeight: 600 }}>{err}</div>}
        <div style={{ display: "flex", gap: 10 }}>
          <button type="submit" disabled={disabled} style={{ ...btnPrimary, justifyContent: "center", flex: 1, opacity: disabled ? 0.6 : 1 }}>
            {busy ? <Loader2 size={15} style={{ animation: "spin 0.8s linear infinite" }} /> : <KeyRound size={15} />} Confirmer
          </button>
          <button type="button" onClick={() => done(false)} disabled={busy} style={btn}>Annuler</button>
        </div>
      </form>
    </div>
  )
}

export { LoginScreen, ForcedMfaSetupScreen, MfaChallengeScreen, StepUpModal }
