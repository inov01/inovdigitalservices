import {
  Inbox, Bell, Wallet, TrendingUp, Check, Users, ArrowRight, MessageSquareQuote,
  FileText, Send, Sparkles,
} from "lucide-react"
import { NAV_GROUPS, type Tab } from "./nav"

const card: React.CSSProperties = {
  background: "var(--ds-bg-card)", border: "1px solid var(--ds-border)",
  borderRadius: "var(--r-lg)", padding: 20,
}

export interface HomeStats {
  total: number; newCount: number; pipeline: number; won: number; subs: number; payPending: number
}

// Overview landing view: the six headline metrics as prominent cards, priority
// call-outs (new leads / payments / pending reviews) that deep-link, and the full
// grouped section index so nothing is more than one click away.
export default function HomeTab({ stats, pendingReviews, onGo }: {
  stats: HomeStats
  pendingReviews: number
  onGo: (key: Tab) => void
}) {
  const metrics: { icon: React.ReactNode; label: string; value: string | number; accent?: boolean; go: Tab }[] = [
    { icon: <Inbox size={17} />, label: "Leads au total", value: stats.total, go: "leads" },
    { icon: <Bell size={17} />, label: "Nouveaux leads", value: stats.newCount, accent: stats.newCount > 0, go: "leads" },
    { icon: <Wallet size={17} />, label: "Paiements à vérifier", value: stats.payPending, accent: stats.payPending > 0, go: "payments" },
    { icon: <TrendingUp size={17} />, label: "Pipeline (USD)", value: `$${stats.pipeline.toLocaleString("en-US")}`, go: "leads" },
    { icon: <Check size={17} />, label: "Gagné (USD)", value: `$${stats.won.toLocaleString("en-US")}`, go: "leads" },
    { icon: <Users size={17} />, label: "Abonnés newsletter", value: stats.subs, go: "newsletter" },
  ]

  const priorities: { show: boolean; icon: React.ReactNode; text: string; go: Tab }[] = ([
    { show: stats.newCount > 0, icon: <Inbox size={16} />, text: `${stats.newCount} nouveau${stats.newCount > 1 ? "x" : ""} lead${stats.newCount > 1 ? "s" : ""} à traiter`, go: "leads" as Tab },
    { show: stats.payPending > 0, icon: <Wallet size={16} />, text: `${stats.payPending} paiement${stats.payPending > 1 ? "s" : ""} en attente de vérification`, go: "payments" as Tab },
    { show: pendingReviews > 0, icon: <MessageSquareQuote size={16} />, text: `${pendingReviews} avis client${pendingReviews > 1 ? "s" : ""} à modérer`, go: "reviews" as Tab },
  ]).filter((p) => p.show)

  const quick: { icon: React.ReactNode; label: string; go: Tab }[] = [
    { icon: <FileText size={16} />, label: "Générer une proforma", go: "documents" },
    { icon: <Send size={16} />, label: "Lancer une campagne", go: "campaigns" },
    { icon: <Sparkles size={16} />, label: "Ouvrir l'assistant IA", go: "assistant" },
  ]

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 26 }}>
      <div>
        <h1 style={{ fontSize: 26, fontWeight: 800, fontFamily: "var(--font-space), sans-serif", margin: 0 }}>Tableau de bord</h1>
        <p style={{ color: "var(--ds-text-muted)", margin: "6px 0 0", fontSize: 14.5 }}>
          Vue d'ensemble de l'activité. Astuce&nbsp;: appuyez sur <kbd style={kbd}>⌘K</kbd> pour aller à n'importe quelle section.
        </p>
      </div>

      {/* Priority call-outs */}
      {priorities.length > 0 && (
        <div style={{ display: "grid", gap: 10 }}>
          {priorities.map((p, i) => (
            <button key={i} onClick={() => onGo(p.go)} className="adm-row" style={{
              display: "flex", alignItems: "center", gap: 12, cursor: "pointer", textAlign: "start",
              border: "1px solid var(--ds-accent-a30, var(--ds-border))", background: "var(--ds-accent-a10)",
              borderRadius: "var(--r-md)", padding: "13px 16px", fontFamily: "inherit",
            }}>
              <span style={{ color: "var(--ds-accent)", display: "inline-flex" }}>{p.icon}</span>
              <span style={{ fontWeight: 700, fontSize: 14.5, color: "var(--ds-accent-text)" }}>{p.text}</span>
              <ArrowRight size={16} style={{ marginInlineStart: "auto", color: "var(--ds-accent)" }} />
            </button>
          ))}
        </div>
      )}

      {/* Headline metrics */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14 }}>
        {metrics.map((m, i) => (
          <button key={i} onClick={() => onGo(m.go)} className="adm-row" style={{
            ...card, padding: "18px 20px", display: "flex", flexDirection: "column", gap: 12,
            cursor: "pointer", textAlign: "start", fontFamily: "inherit",
          }}>
            <span style={{
              display: "inline-flex", alignItems: "center", justifyContent: "center", width: 36, height: 36,
              borderRadius: "var(--r-md)", background: m.accent ? "var(--ds-accent-a12)" : "var(--ds-bg-sec)",
              color: m.accent ? "var(--ds-accent)" : "var(--ds-text-muted)",
            }}>{m.icon}</span>
            <span>
              <span style={{ display: "block", fontSize: 28, fontWeight: 800, fontFamily: "var(--font-space), sans-serif", lineHeight: 1, color: m.accent ? "var(--ds-accent)" : "var(--ds-text)" }}>{m.value}</span>
              <span style={{ display: "block", fontSize: 12.5, color: "var(--ds-text-muted)", fontWeight: 600, marginTop: 7 }}>{m.label}</span>
            </span>
          </button>
        ))}
      </div>

      {/* Quick actions */}
      <div>
        <h2 style={hd}>Actions rapides</h2>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {quick.map((a, i) => (
            <button key={i} onClick={() => onGo(a.go)} className="adm-iconbtn" style={{
              display: "inline-flex", alignItems: "center", gap: 9, cursor: "pointer",
              border: "1px solid var(--ds-border)", background: "var(--ds-bg-sec)", color: "var(--ds-text)",
              borderRadius: "var(--r-md)", padding: "11px 15px", fontSize: 14, fontWeight: 700, fontFamily: "inherit",
            }}>
              <span style={{ color: "var(--ds-accent)", display: "inline-flex" }}>{a.icon}</span>{a.label}
            </button>
          ))}
        </div>
      </div>

      {/* Section index */}
      <div>
        <h2 style={hd}>Toutes les sections</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))", gap: 16 }}>
          {NAV_GROUPS.map((g) => (
            <div key={g.label} style={{ ...card, padding: 16 }}>
              <div style={{ fontSize: 11.5, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--ds-text-faint)", marginBottom: 10 }}>{g.label}</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {g.items.map((it) => (
                  <button key={it.key} onClick={() => onGo(it.key)} className="adm-row" style={{
                    display: "flex", alignItems: "center", gap: 10, cursor: "pointer", textAlign: "start",
                    border: "none", background: "transparent", color: "var(--ds-text-sec)",
                    borderRadius: "var(--r-sm, 8px)", padding: "8px 9px", fontSize: 14, fontWeight: 600, fontFamily: "inherit",
                  }}>
                    <span style={{ display: "inline-flex", color: "var(--ds-text-muted)" }}>{it.icon}</span>{it.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

const hd: React.CSSProperties = { fontSize: 15, fontWeight: 800, margin: "0 0 12px", color: "var(--ds-text)" }
const kbd: React.CSSProperties = {
  fontFamily: "var(--font-space), monospace", fontSize: 12, fontWeight: 700,
  border: "1px solid var(--ds-border)", borderRadius: 6, padding: "1px 6px", color: "var(--ds-text-sec)",
}
