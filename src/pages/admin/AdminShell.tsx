// Admin dashboard shell: data fetch, grouped sidebar, header, content switch.
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
import { NAV_GROUPS, HOME_ITEM, ALL_ITEMS, itemFor, groupOf, type Tab } from "./nav"
import CommandPalette from "./CommandPalette"
import HomeTab from "./HomeTab"
import { StepUpModal } from "./auth"
import { LeadsTab, PaymentsTab, ReviewsTab, DocumentsTab } from "./tabs/commercial"
import { FormationTab, CollaborateursTab, PricingTab, ServicesTab, PortfolioTab, BlogTab } from "./tabs/contenu"
import { NewsletterTab, CampaignsTab, LinksTab } from "./tabs/marketing"
import { ProceduresTab, AssistantTab, RemindersTab, EventualitesTab } from "./tabs/outils"
import { SettingsTab } from "./tabs/systeme"
import FormationScriptsTab from "./FormationScriptsTab"

// ── Dashboard ─────────────────────────────────────────────────────────────────
// Section keys + grouped navigation config live in ./admin/nav.
const TAB_KEYS = new Set<Tab>(ALL_ITEMS.map((i) => i.key))

function Dashboard({ email, onSignOut }: { email: string; onSignOut: () => void }) {
  // Deep-linkable: /admin#payments restores the section on load.
  const initialTab = (() => {
    const h = (typeof window !== "undefined" ? window.location.hash.replace(/^#/, "") : "") as Tab
    return TAB_KEYS.has(h) ? h : "home"
  })()
  const [tab, setTabState] = useState<Tab>(initialTab)
  const [paletteOpen, setPaletteOpen] = useState(false)
  // Collapsible groups; auto-open the group holding the active tab. Persisted.
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() => {
    try {
      const raw = localStorage.getItem("adm-open-groups")
      if (raw) return JSON.parse(raw)
    } catch { /* ignore */ }
    return Object.fromEntries(NAV_GROUPS.map((g) => [g.label, true]))
  })

  function setTab(next: Tab) {
    setTabState(next)
    try { window.location.hash = next === "home" ? "" : next } catch { /* ignore */ }
    const main = document.getElementById("adm-content")
    if (main) main.scrollIntoView({ block: "start", behavior: "auto" })
  }

  // Keep sidebar/tab in sync with browser back/forward hash changes.
  useEffect(() => {
    function onHash() {
      const h = window.location.hash.replace(/^#/, "") as Tab
      setTabState(TAB_KEYS.has(h) ? h : "home")
    }
    window.addEventListener("hashchange", onHash)
    return () => window.removeEventListener("hashchange", onHash)
  }, [])

  // ⌘K / Ctrl+K toggles the command palette.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault(); setPaletteOpen((v) => !v)
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  // Ensure the active tab's group is expanded whenever it changes.
  useEffect(() => {
    const g = groupOf(tab)
    if (g) setOpenGroups((prev) => (prev[g] ? prev : { ...prev, [g]: true }))
  }, [tab])
  useEffect(() => {
    try { localStorage.setItem("adm-open-groups", JSON.stringify(openGroups)) } catch { /* ignore */ }
  }, [openGroups])
  const [leads, setLeads] = useState<Lead[]>([])
  const [subs, setSubs] = useState<Subscriber[]>([])
  const [reviews, setReviews] = useState<Testimonial[]>([])
  const [loading, setLoading] = useState(true)

  async function refresh() {
    setLoading(true)
    try {
      const [l, s, r] = await Promise.all([adminApi.listLeads(), adminApi.listSubscribers(), adminApi.listTestimonials()])
      setLeads(l.leads); setSubs(s.subscribers); setReviews(r.testimonials)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => { refresh() }, [])

  const pendingReviews = useMemo(() => reviews.filter((r) => r.status === "pending").length, [reviews])

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

  // Live counts shown as pills next to the relevant sections.
  const counts: Partial<Record<Tab, number>> = {
    leads: otherLeads.length, payments: payLeads.length,
    reviews: pendingReviews, newsletter: subs.length,
  }

  const current = itemFor(tab)
  const currentGroup = groupOf(tab)

  function navBtn(key: Tab, label: string, icon: React.ReactNode, count?: number) {
    const active = tab === key
    return (
      <button key={key} onClick={() => setTab(key)} className="adm-navbtn"
        aria-current={active ? "page" : undefined}
        style={{
          display: "flex", alignItems: "center", gap: 11, cursor: "pointer",
          border: "none", borderRadius: "var(--r-md)", padding: "10px 13px",
          fontSize: 14, fontWeight: 700, fontFamily: "inherit", textAlign: "start", width: "100%",
          background: active ? "var(--ds-accent-a12)" : "transparent",
          color: active ? "var(--ds-accent-text)" : "var(--ds-text-sec)",
          boxShadow: active ? "inset 3px 0 0 var(--ds-accent)" : "none",
        }}>
        {icon}
        <span>{label}</span>
        {typeof count === "number" && count > 0 && (
          <span className="adm-navcount" style={{
            marginLeft: "auto", fontSize: 12, fontWeight: 800,
            fontFamily: "var(--font-space), monospace",
            color: active ? "var(--ds-accent)" : "var(--ds-text-faint)",
            background: active ? "var(--ds-accent-a10)" : "var(--ds-bg-sec)",
            borderRadius: "var(--r-full)", padding: "1px 9px", minWidth: 22, textAlign: "center",
          }}>{count}</span>
        )}
      </button>
    )
  }

  return (
    <div className="dark adm-scope" style={shell}>
      <style>{STYLE}</style>
      <a href="#adm-content" style={{
        position: "absolute", left: 12, top: -60, zIndex: 50, padding: "9px 14px",
        background: "var(--ds-accent)", color: "#fff", borderRadius: "var(--r-md)",
        fontWeight: 700, fontSize: 14, transition: "top 0.15s",
      }} onFocus={(e) => { e.currentTarget.style.top = "12px" }} onBlur={(e) => { e.currentTarget.style.top = "-60px" }}>
        Aller au contenu
      </a>
      <StepUpModal email={email} />
      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} onGo={setTab} />
      {/* Top bar */}
      <header style={{
        display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
        padding: "12px 24px", borderBottom: "1px solid var(--ds-border)",
        position: "sticky", top: 0, background: "color-mix(in srgb, var(--ds-bg) 90%, transparent)",
        backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", zIndex: 20,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
          <img src={logoDark} alt="INOV" style={{ height: 28 }} />
          {/* Breadcrumb: Admin › [group] › current section */}
          <nav aria-label="Fil d'Ariane" style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12.5, fontWeight: 700, minWidth: 0, overflow: "hidden" }} className="adm-crumb">
            <button onClick={() => setTab("home")} style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", fontWeight: 700, fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--ds-accent)" }}>
              <LayoutDashboard size={14} /> Admin
            </button>
            {currentGroup && <><span style={{ color: "var(--ds-text-faint)" }}>/</span><span style={{ color: "var(--ds-text-muted)", whiteSpace: "nowrap" }}>{currentGroup}</span></>}
            {tab !== "home" && <><span style={{ color: "var(--ds-text-faint)" }}>/</span><span style={{ color: "var(--ds-text)", whiteSpace: "nowrap" }}>{current.label}</span></>}
          </nav>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button onClick={() => setPaletteOpen(true)} className="adm-iconbtn" aria-label="Recherche rapide (Ctrl+K)"
            style={{ ...btn, gap: 8, padding: "8px 12px" }}>
            <Search size={15} /> <span className="adm-lbl">Rechercher</span>
            <kbd className="adm-lbl" style={{ fontSize: 11, fontWeight: 800, fontFamily: "var(--font-space), monospace", color: "var(--ds-text-faint)", border: "1px solid var(--ds-border)", borderRadius: 5, padding: "1px 5px" }}>⌘K</kbd>
          </button>
          <button style={{ ...btn, padding: "8px 12px" }} className="adm-iconbtn" onClick={refresh} aria-label="Actualiser les données">
            <RefreshCw size={15} aria-hidden="true" style={loading ? { animation: "spin 0.8s linear infinite" } : undefined} /> <span className="adm-lbl">Actualiser</span>
          </button>
          <span style={{ fontSize: 13, color: "var(--ds-text-muted)" }} className="adm-email">{email}</span>
          <button style={{ ...btn, padding: "8px 12px" }} className="adm-iconbtn" onClick={onSignOut} aria-label="Déconnexion"><LogOut size={15} /> <span className="adm-lbl">Déconnexion</span></button>
        </div>
      </header>

      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "22px 24px 64px" }}>
        {/* Sidebar + content */}
        <div className="adm-layout">
          <nav className="adm-nav" aria-label="Sections de l'administration">
            {navBtn("home", HOME_ITEM.label, HOME_ITEM.icon)}
            {NAV_GROUPS.map((g) => {
              const open = openGroups[g.label] !== false
              return (
                <div key={g.label} className="adm-navgroup">
                  <button
                    className="adm-grouphd"
                    aria-expanded={open}
                    onClick={() => setOpenGroups((p) => ({ ...p, [g.label]: !open }))}
                    style={{
                      display: "flex", alignItems: "center", gap: 6, width: "100%", cursor: "pointer",
                      border: "none", background: "transparent", fontFamily: "inherit",
                      fontSize: 11, fontWeight: 800, letterSpacing: "0.09em", textTransform: "uppercase",
                      color: "var(--ds-text-faint)", padding: "12px 13px 6px",
                    }}>
                    <span>{g.label}</span>
                    <ChevronDown size={14} style={{ marginInlineStart: "auto", transition: "transform 0.15s", transform: open ? "rotate(0deg)" : "rotate(-90deg)" }} />
                  </button>
                  {open && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                      {g.items.map((it) => navBtn(it.key, it.label, it.icon, counts[it.key]))}
                    </div>
                  )}
                </div>
              )
            })}
          </nav>

          <main id="adm-content" style={{ minWidth: 0 }} aria-busy={loading}>
            {tab === "home" && <HomeTab stats={stats} pendingReviews={pendingReviews} onGo={setTab} />}
            {tab === "leads" && <LeadsTab leads={otherLeads} loading={loading} onChange={refresh} />}
            {tab === "payments" && <PaymentsTab leads={payLeads} loading={loading} onChange={refresh} />}
            {tab === "reviews" && <ReviewsTab reviews={reviews} loading={loading} onChange={refresh} />}
            {tab === "links" && <LinksTab />}
            {tab === "assistant" && <AssistantTab />}
            {tab === "reminders" && <RemindersTab />}
            {tab === "procedures" && <ProceduresTab />}
            {tab === "scripts" && <FormationScriptsTab />}
            {tab === "documents" && <DocumentsTab leads={leads} onChange={refresh} />}
            {tab === "pricing" && <PricingTab />}
            {tab === "services" && <ServicesTab />}
            {tab === "portfolio" && <PortfolioTab />}
            {tab === "blog" && <BlogTab />}
            {tab === "formation" && <FormationTab />}
            {tab === "collaborateurs" && <CollaborateursTab />}
            {tab === "eventualites" && <EventualitesTab />}
            {tab === "newsletter" && <NewsletterTab subs={subs} loading={loading} onChange={refresh} />}
            {tab === "campaigns" && <CampaignsTab subs={subs} adminEmail={email} />}
            {tab === "settings" && <SettingsTab />}
          </main>
        </div>
      </div>
    </div>
  )
}


export default Dashboard
