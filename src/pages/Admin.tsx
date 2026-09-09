import { useEffect, useMemo, useRef, useState } from "react"
import {
  LayoutDashboard, Inbox, Mail, Settings as SettingsIcon, LogOut,
  Trash2, RefreshCw, Download, ExternalLink, Loader2, ShieldCheck, Wallet,
  Search, TrendingUp, Users, Bell, ArrowUpDown, Phone, X, Copy, Check, Receipt,
  KeyRound, Smartphone, FileText, Tags, Plus, Send,
  Package, Image as ImageIcon, Eye, EyeOff, LayoutGrid, Newspaper, Link2,
} from "lucide-react"
import {
  pricingServices, tierValues, TIER_KEYS,
  type PricingService, type TierKey,
} from "../data/services"
import { albums as portfolioAlbums } from "../data/portfolio"
import { ARTICLES, ARTICLE_SLUG, ARTICLE_IMAGE, type Article } from "../components/Blog"
import { LANGS, type Lang } from "../i18n/translations"
import { REGIONS, type RegionCode } from "../data/regions"

// Public site + stable (non-hashed) logo assets for branding e-mails.
const SITE_URL = "https://inovdigitalservices.com"
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
  fr: { empty: "Bonjour,\n\nVoici nos derniers conseils pour faire grandir votre marque 👇", single: (t, e) => `Bonjour,\n\n${e}\n\nNous en parlons en détail dans notre article « ${t} » 👇`, multi: (n) => `Bonjour,\n\nVoici ${n} nouveaux conseils pour faire grandir votre marque 👇` },
  en: { empty: "Hello,\n\nHere are our latest tips to grow your brand 👇", single: (t, e) => `Hello,\n\n${e}\n\nWe cover it in detail in our article "${t}" 👇`, multi: (n) => `Hello,\n\nHere are ${n} fresh tips to grow your brand 👇` },
  es: { empty: "Hola,\n\nAquí tienes nuestros últimos consejos para hacer crecer tu marca 👇", single: (t, e) => `Hola,\n\n${e}\n\nLo explicamos en detalle en nuestro artículo «${t}» 👇`, multi: (n) => `Hola,\n\nAquí tienes ${n} nuevos consejos para hacer crecer tu marca 👇` },
  ht: { empty: "Bonjou,\n\nMen dènye konsèy nou yo pou fè mak ou grandi 👇", single: (t, e) => `Bonjou,\n\n${e}\n\nNou pale sou li an detay nan atik nou an « ${t} » 👇`, multi: (n) => `Bonjou,\n\nMen ${n} nouvo konsèy pou fè mak ou grandi 👇` },
  pt: { empty: "Olá,\n\nAqui estão nossas últimas dicas para fazer sua marca crescer 👇", single: (t, e) => `Olá,\n\n${e}\n\nFalamos disso em detalhe no nosso artigo «${t}» 👇`, multi: (n) => `Olá,\n\nAqui estão ${n} novas dicas para fazer sua marca crescer 👇` },
  it: { empty: "Ciao,\n\nEcco i nostri ultimi consigli per far crescere il tuo brand 👇", single: (t, e) => `Ciao,\n\n${e}\n\nNe parliamo in dettaglio nel nostro articolo «${t}» 👇`, multi: (n) => `Ciao,\n\nEcco ${n} nuovi consigli per far crescere il tuo brand 👇` },
  de: { empty: "Hallo,\n\nHier sind unsere neuesten Tipps für Ihr Markenwachstum 👇", single: (t, e) => `Hallo,\n\n${e}\n\nWir gehen darauf ausführlich in unserem Artikel „${t}“ ein 👇`, multi: (n) => `Hallo,\n\nHier sind ${n} neue Tipps für Ihr Markenwachstum 👇` },
  ar: { empty: "مرحبًا،\n\nإليك أحدث نصائحنا لتنمية علامتك التجارية 👇", single: (t, e) => `مرحبًا،\n\n${e}\n\nنتناول ذلك بالتفصيل في مقالنا «${t}» 👇`, multi: (n) => `مرحبًا،\n\nإليك ${n} نصائح جديدة لتنمية علامتك التجارية 👇` },
}

import { registerStepUpVerifier } from "../lib/stepup"
import { useAdminAuth } from "../hooks/useAdminAuth"
import { useSessionTimeout, ADMIN_SESSION_POLICY } from "../hooks/useSessionTimeout"
import { supabase } from "../lib/supabaseClient"
import { adminApi, api, type Lead, type LeadItem, type Subscriber, type SiteSettings, type Campaign, type AdminService, type AdminWork, type AdminAlbum, type AdminBlog } from "../lib/api"
import { useSettings } from "../context/AppSettings"
import logoDark from "../imports/logo_pour_fond_noir.webp"
import logoLight from "../imports/logo.webp"

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
  .adm-row { transition: background 0.12s; }
  .adm-row:hover { background: var(--ds-bg-sec); }
  .adm-chip { transition: all 0.12s; }
  .adm-iconbtn:hover { filter: brightness(1.06); }
  .adm-skel { background: linear-gradient(90deg, var(--ds-bg-sec) 25%, var(--ds-border) 37%, var(--ds-bg-sec) 63%); background-size: 400% 100%; animation: admShimmer 1.3s ease-in-out infinite; border-radius: var(--r-md); }
  @keyframes admShimmer { 0% { background-position: 100% 0 } 100% { background-position: 0 0 } }
  .adm-layout { display: grid; grid-template-columns: 232px 1fr; gap: 22px; align-items: start; }
  .adm-nav { position: sticky; top: 88px; display: flex; flex-direction: column; gap: 4px; }
  @media (max-width: 900px) {
    .adm-layout { grid-template-columns: 1fr; }
    .adm-nav { position: static; flex-direction: row; overflow-x: auto; gap: 8px; padding-bottom: 6px; scrollbar-width: none; }
    .adm-nav::-webkit-scrollbar { display: none; }
    .adm-navbtn { white-space: nowrap; }
    .adm-navcount { display: none; }
    .adm-doc-grid { grid-template-columns: 1fr !important; }
  }
`

export default function Admin() {
  const { session, loading, signIn, signOut, email } = useAdminAuth()
  const [expired, setExpired] = useState(false)
  // "checking" until we know whether a 2FA step-up is required for this session.
  const [mfa, setMfa] = useState<"checking" | "ok" | "required">("checking")

  // Auto sign-out after inactivity / absolute cap (stricter for the admin).
  useSessionTimeout(!!session, ADMIN_SESSION_POLICY, () => {
    setExpired(true)
    signOut()
  })

  // Whenever a session appears, verify the authenticator assurance level: if the
  // admin enrolled a TOTP factor, the session must be stepped up to AAL2.
  useEffect(() => {
    let cancelled = false
    if (!session) { setMfa("checking"); return }
    setMfa("checking")
    supabase.auth.mfa.getAuthenticatorAssuranceLevel()
      .then(({ data }) => {
        if (cancelled) return
        const stepUp = data?.nextLevel === "aal2" && data?.currentLevel !== "aal2"
        setMfa(stepUp ? "required" : "ok")
      })
      .catch(() => { if (!cancelled) setMfa("ok") })
    return () => { cancelled = true }
  }, [session])

  if (loading) {
    return (
      <div className="dark" style={{ ...shell, display: "grid", placeItems: "center" }}>
        <Loader2 size={28} style={{ animation: "spin 0.8s linear infinite", color: "var(--ds-accent)" }} />
      </div>
    )
  }

  if (!session) return <LoginScreen onSignIn={signIn} expired={expired} onClearExpired={() => setExpired(false)} />

  if (mfa === "checking") {
    return (
      <div className="dark" style={{ ...shell, display: "grid", placeItems: "center" }}>
        <Loader2 size={28} style={{ animation: "spin 0.8s linear infinite", color: "var(--ds-accent)" }} />
      </div>
    )
  }

  if (mfa === "required") {
    return <MfaChallengeScreen onVerified={() => setMfa("ok")} onCancel={signOut} />
  }

  return <Dashboard email={email} onSignOut={signOut} />
}

// ── Login / first-time setup ──────────────────────────────────────────────────
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

// ── Dashboard ─────────────────────────────────────────────────────────────────
type Tab = "leads" | "payments" | "links" | "documents" | "pricing" | "services" | "portfolio" | "blog" | "newsletter" | "campaigns" | "settings"

function Dashboard({ email, onSignOut }: { email: string; onSignOut: () => void }) {
  const [tab, setTab] = useState<Tab>("leads")
  const [leads, setLeads] = useState<Lead[]>([])
  const [subs, setSubs] = useState<Subscriber[]>([])
  const [loading, setLoading] = useState(true)

  async function refresh() {
    setLoading(true)
    try {
      const [l, s] = await Promise.all([adminApi.listLeads(), adminApi.listSubscribers()])
      setLeads(l.leads); setSubs(s.subscribers)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => { refresh() }, [])

  // Payments tab groups declared payments (MonCash/NatCash/BUH) AND Upwork
  // card requests — both need an action from us (verify a payment, or send the
  // Upwork contract link within 24h).
  const payLeads = useMemo(() => leads.filter((l) => l.source === "payment" || l.source === "upwork_request"), [leads])
  const otherLeads = useMemo(() => leads.filter((l) => l.source !== "payment" && l.source !== "upwork_request"), [leads])

  const stats = useMemo(() => {
    const newCount = otherLeads.filter((l) => l.status === "new").length
    const pipeline = otherLeads
      .filter((l) => l.status !== "lost" && typeof l.total === "number")
      .reduce((sum, l) => sum + (l.total ?? 0), 0)
    const won = otherLeads
      .filter((l) => l.status === "won" && typeof l.total === "number")
      .reduce((sum, l) => sum + (l.total ?? 0), 0)
    const payPending = payLeads.filter((l) => l.status === "new" || l.status === "contacted").length
    return { total: otherLeads.length, newCount, pipeline, won, subs: subs.length, payPending }
  }, [otherLeads, payLeads, subs])

  const navItems: { key: Tab; label: string; icon: React.ReactNode; count?: number }[] = [
    { key: "leads", label: "Devis & contacts", icon: <Inbox size={18} />, count: otherLeads.length },
    { key: "payments", label: "Paiements", icon: <Wallet size={18} />, count: payLeads.length },
    { key: "links", label: "Liens à partager", icon: <Link2 size={18} /> },
    { key: "documents", label: "Proforma & reçus", icon: <FileText size={18} /> },
    { key: "pricing", label: "Tarifs", icon: <Tags size={18} /> },
    { key: "services", label: "Cartes de service", icon: <Package size={18} /> },
    { key: "portfolio", label: "Portfolio", icon: <LayoutGrid size={18} /> },
    { key: "blog", label: "Blog", icon: <Newspaper size={18} /> },
    { key: "newsletter", label: "Newsletter", icon: <Mail size={18} />, count: subs.length },
    { key: "campaigns", label: "Campagnes e-mail", icon: <Send size={18} /> },
    { key: "settings", label: "Paramètres", icon: <SettingsIcon size={18} /> },
  ]

  return (
    <div className="dark" style={shell}>
      <style>{STYLE}</style>
      <StepUpModal email={email} />
      {/* Top bar */}
      <header style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "14px 24px", borderBottom: "1px solid var(--ds-border)",
        position: "sticky", top: 0, background: "color-mix(in srgb, var(--ds-bg) 90%, transparent)",
        backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", zIndex: 20,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <img src={logoDark} alt="INOV" style={{ height: 30 }} />
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--ds-accent)" }}>
            <LayoutDashboard size={14} /> Admin
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 13, color: "var(--ds-text-muted)" }} className="adm-navcount">{email}</span>
          <button style={btn} className="adm-iconbtn" onClick={onSignOut}><LogOut size={15} /> Déconnexion</button>
        </div>
      </header>

      <div style={{ maxWidth: 1220, margin: "0 auto", padding: "26px 24px 64px" }}>
        {/* Stat tiles */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(172px, 1fr))", gap: 14, marginBottom: 26 }}>
          <Stat icon={<Inbox size={16} />} label="Leads au total" value={stats.total} />
          <Stat icon={<Bell size={16} />} label="Nouveaux" value={stats.newCount} accent={stats.newCount > 0} />
          <Stat icon={<Wallet size={16} />} label="Paiements à vérifier" value={stats.payPending} accent={stats.payPending > 0} />
          <Stat icon={<TrendingUp size={16} />} label="Pipeline (USD)" value={`$${stats.pipeline.toLocaleString("en-US")}`} />
          <Stat icon={<Check size={16} />} label="Gagné (USD)" value={`$${stats.won.toLocaleString("en-US")}`} />
          <Stat icon={<Users size={16} />} label="Abonnés newsletter" value={stats.subs} />
        </div>

        {/* Sidebar + content */}
        <div className="adm-layout">
          <nav className="adm-nav">
            {navItems.map((n) => {
              const active = tab === n.key
              return (
                <button key={n.key} onClick={() => setTab(n.key)} className="adm-navbtn"
                  style={{
                    display: "flex", alignItems: "center", gap: 11, cursor: "pointer",
                    border: "none", borderRadius: "var(--r-md)", padding: "11px 14px",
                    fontSize: 14.5, fontWeight: 700, fontFamily: "inherit", textAlign: "start",
                    background: active ? "var(--ds-accent-a12)" : "transparent",
                    color: active ? "var(--ds-accent-text)" : "var(--ds-text-sec)",
                    boxShadow: active ? "inset 3px 0 0 var(--ds-accent)" : "none",
                  }}>
                  {n.icon}
                  <span>{n.label}</span>
                  {typeof n.count === "number" && (
                    <span className="adm-navcount" style={{
                      marginLeft: "auto", fontSize: 12, fontWeight: 800,
                      fontFamily: "var(--font-space), monospace",
                      color: active ? "var(--ds-accent)" : "var(--ds-text-faint)",
                      background: active ? "var(--ds-accent-a10)" : "var(--ds-bg-sec)",
                      borderRadius: "var(--r-full)", padding: "1px 9px", minWidth: 22, textAlign: "center",
                    }}>{n.count}</span>
                  )}
                </button>
              )
            })}
            <button style={{ ...btn, marginTop: 8, justifyContent: "center" }} className="adm-iconbtn" onClick={refresh}>
              <RefreshCw size={15} style={loading ? { animation: "spin 0.8s linear infinite" } : undefined} /> Actualiser
            </button>
          </nav>

          <div style={{ minWidth: 0 }}>
            {tab === "leads" && <LeadsTab leads={otherLeads} loading={loading} onChange={refresh} />}
            {tab === "payments" && <PaymentsTab leads={payLeads} loading={loading} onChange={refresh} />}
            {tab === "links" && <LinksTab />}
            {tab === "documents" && <DocumentsTab leads={leads} onChange={refresh} />}
            {tab === "pricing" && <PricingTab />}
            {tab === "services" && <ServicesTab />}
            {tab === "portfolio" && <PortfolioTab />}
            {tab === "blog" && <BlogTab />}
            {tab === "newsletter" && <NewsletterTab subs={subs} loading={loading} onChange={refresh} />}
            {tab === "campaigns" && <CampaignsTab subs={subs} adminEmail={email} />}
            {tab === "settings" && <SettingsTab />}
          </div>
        </div>
      </div>
    </div>
  )
}

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
                      <a href={`https://wa.me/${l.phone.replace(/[^\d]/g, "")}`} target="_blank" rel="noreferrer" style={{ ...btn, padding: "5px 11px", fontSize: 12.5, textDecoration: "none" }}>
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
    setSendingId(l.id)
    try {
      const res = await adminApi.sendReceipt(l.id)
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

// ── Settings tab (announcement banner) ────────────────────────────────────────
// ── Pricing tab: edit service base prices (USD) ───────────────────────────────
const TIER_FR: Record<TierKey, string> = { essentiel: "Essentiel", standard: "Standard", premium: "Premium" }

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
            Branding · Web · Vidéo · Print &nbsp;·&nbsp; (+509) 3625-5920<br>
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
                    <button onClick={() => cancelCampaign(c.id)} style={{ ...btn, padding: "6px 10px", color: "var(--ds-danger)", borderColor: "var(--ds-danger-a40)" }}><X size={14} /></button>
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
              <button onClick={() => setPreview(false)} style={{ ...btn, padding: 8 }}><X size={16} /></button>
            </div>
            <iframe title="preview" srcDoc={html} style={{ flex: 1, border: "none", width: "100%", background: "#f4f4f4" }} />
          </div>
        </div>
      )}
    </div>
  )
}

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
  const [draft, setDraft] = useState<AdminAlbum>({ ...NEW_ALBUM, works: [{ ...NEW_WORK }] })
  const [labelsRaw, setLabelsRaw] = useState("")
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    adminApi.getSettings()
      .then((r) => {
        setSettings(r.settings)
        setRemoved(r.settings.albumsRemoved ?? [])
        setAdded(r.settings.albumsAdded ?? [])
      })
      .catch(() => setSettings({ announcement: { enabled: false, text: "", link: "" } }))
  }, [])

  async function persist(nextRemoved: string[], nextAdded: AdminAlbum[]) {
    if (!settings) return
    setSaving(true); setSaved(false)
    try {
      const r = await adminApi.saveSettings({ ...settings, albumsRemoved: nextRemoved, albumsAdded: nextAdded })
      setSettings(r.settings)
      setRemoved(r.settings.albumsRemoved ?? nextRemoved)
      setAdded(r.settings.albumsAdded ?? nextAdded)
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
    persist(removed, next)
  }

  function setWork(i: number, patch: Partial<AdminWork>) {
    setDraft((d) => ({ ...d, works: d.works.map((w, j) => (j === i ? { ...w, ...patch } : w)) }))
  }

  if (!settings) return <Empty text="Chargement…" />

  const clientBuiltins = portfolioAlbums.filter((a) => a.logo)
  const otherBuiltins = portfolioAlbums.filter((a) => !a.logo)

  const BuiltinRow = ({ a }: { a: (typeof portfolioAlbums)[number] }) => {
    const hidden = removed.includes(a.id)
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 0", borderTop: "1px solid var(--ds-border)", opacity: hidden ? 0.5 : 1 }}>
        <div style={{ minWidth: 0, flex: 1 }}>
          <span style={{ fontSize: 14, fontWeight: 700 }}>{a.client}</span>
          <span style={{ marginLeft: 8, fontSize: 11.5, color: "var(--ds-text-faint)" }}>{a.works.length} visuel{a.works.length > 1 ? "s" : ""}</span>
        </div>
        <button style={{ ...btn, padding: "7px 12px" }} onClick={() => toggleBuiltin(a.id)} disabled={saving}>
          {hidden ? <><Eye size={14} /> Afficher</> : <><EyeOff size={14} /> Masquer</>}
        </button>
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
            <div key={a.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 0", borderTop: "1px solid var(--ds-border)" }}>
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

// ── Blog tab: hide built-in articles & write custom ones ───────────────────────
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
          background: "var(--ds-surface-2, #f6f5f2)", color: "var(--ds-text)",
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
  { label: "Blog (aperçu)", path: "/#blog" },
  { label: "Newsletter", path: "/#newsletter" },
  { label: "Parrainage", path: "/#referral" },
  { label: "FAQ", path: "/#faq" },
  { label: "À propos", path: "/#about" },
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

function Empty({ text }: { text: string }) {
  return (
    <div style={{ ...card, textAlign: "center", padding: 48, color: "var(--ds-text-muted)" }}>{text}</div>
  )
}
