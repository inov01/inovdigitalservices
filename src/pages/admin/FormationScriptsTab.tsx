import { useMemo, useState } from "react"
import { Copy, Check, Download, Eye, Search, X, GraduationCap, Presentation, Gift, Lock, Clock, Tag } from "lucide-react"
import { FORMATION_SCRIPTS, DISCIPLINES, type FormationScript, type ScriptCategory } from "../../data/formationScripts"

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
const btnPrimary: React.CSSProperties = { ...btn, border: "none", background: "var(--ds-accent-grad)", color: "#fff" }
const input: React.CSSProperties = {
  width: "100%", padding: "12px 14px", borderRadius: "var(--r-md)",
  border: "1px solid var(--ds-border)", background: "var(--ds-bg-sec)",
  color: "var(--ds-text)", fontSize: 15, fontFamily: "inherit", outline: "none",
}

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
}

// Plain-text version for the clipboard (easy to paste into notes/teleprompter).
function scriptText(s: FormationScript): string {
  const lines: string[] = []
  lines.push(s.title.toUpperCase())
  lines.push(`${s.category === "gratuite" ? "FORMATION GRATUITE" : "FORMATION PAYANTE"} · ${s.format === "cours" ? "Cours" : "Conférence"} · ${s.discipline}`)
  lines.push(`Public : ${s.audience} · Niveau : ${s.level} · Durée : ${s.duration}`)
  if (s.price) lines.push(`Prix : ${s.price}`)
  lines.push("")
  lines.push("ACCROCHE")
  lines.push(s.hook)
  lines.push("")
  lines.push("INTRODUCTION — CE QUE COUVRE LA FORMATION")
  s.intro.announce.forEach((a) => lines.push(`• ${a}`))
  lines.push("")
  lines.push("INTRODUCTION — POURQUOI LA SUIVRE")
  s.intro.interest.forEach((i) => lines.push(`• ${i}`))
  lines.push("")
  lines.push("OBJECTIFS")
  s.objectives.forEach((o) => lines.push(`• ${o}`))
  lines.push("")
  s.sessions.forEach((sec) => {
    lines.push(`${sec.title.toUpperCase()}  (${sec.duration})`)
    sec.points.forEach((p) => lines.push(`  - ${p}`))
    lines.push("")
  })
  lines.push("APPEL À L'ACTION")
  lines.push(s.cta)
  return lines.join("\n")
}

function scriptHtml(s: FormationScript): string {
  const badge = s.category === "gratuite" ? "FORMATION GRATUITE" : "FORMATION PAYANTE"
  return `<!doctype html><html lang="fr"><head><meta charset="utf-8"><title>${esc(s.title)}</title>
  <style>
    @page{margin:22mm}
    body{font-family:Georgia,'Times New Roman',serif;color:#1a1a1a;line-height:1.55;max-width:720px;margin:0 auto;padding:24px}
    .kicker{font-family:Arial,sans-serif;font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:#f7601b;font-weight:700}
    h1{font-size:26px;margin:6px 0 4px}
    .meta{font-family:Arial,sans-serif;font-size:12px;color:#666;margin-bottom:22px}
    h2{font-family:Arial,sans-serif;font-size:14px;text-transform:uppercase;letter-spacing:.05em;color:#111;border-bottom:2px solid #f7601b;padding-bottom:4px;margin:26px 0 10px}
    .hook{font-style:italic;background:#fff5ef;border-left:3px solid #f7601b;padding:10px 14px;border-radius:6px}
    ul{margin:6px 0 0;padding-left:20px}
    li{margin:4px 0}
    .cta{font-family:Arial,sans-serif;background:#111;color:#fff;padding:14px 16px;border-radius:8px;margin-top:26px;font-size:13px}
    .foot{font-family:Arial,sans-serif;font-size:11px;color:#999;margin-top:26px;text-align:center}
  </style></head><body>
  <div class="kicker">${badge} · ${s.format === "cours" ? "Cours" : "Conférence"} · ${esc(s.discipline)}</div>
  <h1>${esc(s.title)}</h1>
  <div class="meta">Public : ${esc(s.audience)} &nbsp;·&nbsp; Niveau : ${esc(s.level)} &nbsp;·&nbsp; Durée : ${esc(s.duration)}${s.price ? ` &nbsp;·&nbsp; Prix : ${esc(s.price)}` : ""}</div>
  <h2>Accroche</h2><p class="hook">${esc(s.hook)}</p>
  <h2>Introduction — ce que couvre la formation</h2><ul>${s.intro.announce.map((a) => `<li>${esc(a)}</li>`).join("")}</ul>
  <h2>Introduction — pourquoi la suivre</h2><ul>${s.intro.interest.map((i) => `<li>${esc(i)}</li>`).join("")}</ul>
  <h2>Objectifs</h2><ul>${s.objectives.map((o) => `<li>${esc(o)}</li>`).join("")}</ul>
  ${s.sessions.map((sec) => `<h2>${esc(sec.title)} <span style="color:#999;font-weight:400">— ${esc(sec.duration)}</span></h2><ul>${sec.points.map((p) => `<li>${esc(p)}</li>`).join("")}</ul>`).join("")}
  <div class="cta">${esc(s.cta)}</div>
  <div class="foot">INOV Digital Services — Script de formation</div>
  </body></html>`
}

function openPdf(s: FormationScript) {
  const w = window.open("", "_blank", "width=820,height=940")
  if (!w) { alert("Autorise les fenêtres pop-up pour générer le PDF."); return }
  w.document.write(scriptHtml(s)); w.document.close(); w.focus()
  setTimeout(() => { try { w.print() } catch { /* ignore */ } }, 350)
}

function CatBadge({ cat }: { cat: ScriptCategory }) {
  const free = cat === "gratuite"
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11.5, fontWeight: 800,
      padding: "3px 9px", borderRadius: "var(--r-full)",
      background: free ? "color-mix(in srgb, #15803D 18%, transparent)" : "var(--ds-accent-a12)",
      color: free ? "#22c55e" : "var(--ds-accent)",
    }}>
      {free ? <Gift size={13} /> : <Lock size={13} />} {free ? "Gratuite" : "Payante"}
    </span>
  )
}

function ScriptCard({ s }: { s: FormationScript }) {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  async function copy() {
    try { await navigator.clipboard.writeText(scriptText(s)); setCopied(true); setTimeout(() => setCopied(false), 1800) } catch { /* blocked */ }
  }
  return (
    <div style={{ ...card, padding: 18 }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12, flexWrap: "wrap" }}>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
            <CatBadge cat={s.category} />
            <span style={tag}>{s.format === "cours" ? <><GraduationCap size={12} /> Cours</> : <><Presentation size={12} /> Conférence</>}</span>
            <span style={tag}>{s.discipline}</span>
            <span style={tag}>{s.level}</span>
            {s.price && (
              <span style={{ ...tag, background: "var(--ds-accent-a12)", color: "var(--ds-accent)", fontWeight: 800 }}>
                <Tag size={12} /> {s.price}
              </span>
            )}
          </div>
          <div style={{ fontSize: 16.5, fontWeight: 800, fontFamily: "var(--font-space), sans-serif", lineHeight: 1.25 }}>{s.title}</div>
          <div style={{ fontSize: 12.5, color: "var(--ds-text-faint)", marginTop: 5, display: "inline-flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
            {s.audience} · <Clock size={12} /> {s.duration} · {s.sessions.length} séances
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button style={{ ...btn, padding: "7px 12px", fontSize: 12.5 }} onClick={() => setOpen((o) => !o)}><Eye size={14} /> {open ? "Masquer" : "Aperçu"}</button>
          <button style={{ ...btn, padding: "7px 12px", fontSize: 12.5 }} onClick={copy}>{copied ? <Check size={14} /> : <Copy size={14} />} {copied ? "Copié" : "Copier"}</button>
          <button style={{ ...btnPrimary, padding: "7px 12px", fontSize: 12.5 }} onClick={() => openPdf(s)}><Download size={14} /> PDF</button>
        </div>
      </div>

      <p style={{ margin: "12px 0 0", fontStyle: "italic", fontSize: 13.5, color: "var(--ds-text-sec)", background: "var(--ds-accent-a10)", borderInlineStart: "3px solid var(--ds-accent)", padding: "9px 13px", borderRadius: 8 }}>
        {s.hook}
      </p>

      {open && (
        <div style={{ marginTop: 14, borderTop: "1px solid var(--ds-border)", paddingTop: 14 }}>
          <div style={secHd}>Introduction — ce que couvre la formation</div>
          <ul style={ul}>{s.intro.announce.map((a, i) => <li key={i} style={li}>{a}</li>)}</ul>
          <div style={{ ...secHd, marginTop: 14 }}>Introduction — pourquoi la suivre</div>
          <ul style={ul}>{s.intro.interest.map((it, i) => <li key={i} style={li}>{it}</li>)}</ul>
          <div style={{ ...secHd, marginTop: 14 }}>Objectifs</div>
          <ul style={ul}>{s.objectives.map((o, i) => <li key={i} style={li}>{o}</li>)}</ul>
          {s.sessions.map((sec, i) => (
            <div key={i} style={{ marginTop: 14 }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap" }}>
                <span style={secHd}>{sec.title}</span>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11.5, fontWeight: 700, color: "var(--ds-text-faint)" }}><Clock size={11} /> {sec.duration}</span>
              </div>
              <ul style={ul}>{sec.points.map((p, j) => <li key={j} style={li}>{p}</li>)}</ul>
            </div>
          ))}
          <div style={{ ...secHd, marginTop: 16 }}>Appel à l'action</div>
          <p style={{ margin: "4px 0 0", fontSize: 13.5, color: "var(--ds-text-sec)" }}>{s.cta}</p>
        </div>
      )}
    </div>
  )
}

// Pre-written formation & conference scripts — ready to animate, copy or export.
export default function FormationScriptsTab() {
  const [q, setQ] = useState("")
  const [cat, setCat] = useState<"all" | ScriptCategory>("all")
  const [disc, setDisc] = useState<string>("all")

  const results = useMemo(() => {
    const needle = q.trim().toLowerCase()
    return FORMATION_SCRIPTS.filter((s) => {
      if (cat !== "all" && s.category !== cat) return false
      if (disc !== "all" && s.discipline !== disc) return false
      if (!needle) return true
      return (s.title + " " + s.discipline + " " + s.audience + " " + s.hook).toLowerCase().includes(needle)
    })
  }, [q, cat, disc])

  const freeCount = FORMATION_SCRIPTS.filter((s) => s.category === "gratuite").length
  const paidCount = FORMATION_SCRIPTS.length - freeCount

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 800, fontFamily: "var(--font-space), sans-serif", margin: 0 }}>Scripts de formation & conférence</h1>
        <p style={{ color: "var(--ds-text-muted)", margin: "6px 0 0", fontSize: 14 }}>
          Plans de séance prêts à animer. {freeCount} gratuites · {paidCount} payantes. Copiez le texte ou exportez en PDF.
        </p>
      </div>

      {/* Filters */}
      <div style={{ ...card, padding: 14, display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
            <Search size={16} style={{ position: "absolute", top: "50%", insetInlineStart: 12, transform: "translateY(-50%)", color: "var(--ds-text-faint)" }} />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Rechercher un script…" style={{ ...input, paddingInlineStart: 36, paddingInlineEnd: q ? 34 : 14 }} />
            {q && <button onClick={() => setQ("")} aria-label="Effacer" style={{ position: "absolute", top: "50%", insetInlineEnd: 8, transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--ds-text-faint)", padding: 4, display: "inline-flex" }}><X size={15} /></button>}
          </div>
          <label style={{ ...btn, gap: 6, padding: "0 10px" }}>
            <select value={disc} onChange={(e) => setDisc(e.target.value)} style={selStyle}>
              <option value="all">Toutes les disciplines</option>
              {DISCIPLINES.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </label>
        </div>
        <div style={{ display: "flex", gap: 7, flexWrap: "wrap", alignItems: "center" }}>
          {([["all", "Toutes"], ["gratuite", "Gratuites"], ["payante", "Payantes"]] as const).map(([k, label]) => {
            const active = cat === k
            return (
              <button key={k} onClick={() => setCat(k)} className="adm-chip" style={{
                display: "inline-flex", alignItems: "center", gap: 7, cursor: "pointer",
                border: `1px solid ${active ? "var(--ds-accent)" : "var(--ds-border)"}`,
                background: active ? "var(--ds-accent-a10)" : "var(--ds-bg-sec)",
                color: active ? "var(--ds-accent-text)" : "var(--ds-text-sec)",
                borderRadius: "var(--r-full)", padding: "6px 13px", fontSize: 12.5, fontWeight: 700, fontFamily: "inherit",
              }}>{label}</button>
            )
          })}
          <span style={{ marginInlineStart: "auto", fontSize: 12.5, color: "var(--ds-text-faint)", fontWeight: 600 }}>
            {results.length} script{results.length > 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {results.length === 0
        ? <div style={{ ...card, textAlign: "center", color: "var(--ds-text-faint)", padding: 34 }}>Aucun script pour ces filtres.</div>
        : <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>{results.map((s) => <ScriptCard key={s.id} s={s} />)}</div>}
    </div>
  )
}

const tag: React.CSSProperties = {
  display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11.5, fontWeight: 700,
  padding: "3px 8px", borderRadius: "var(--r-full)", background: "var(--ds-bg-sec)", color: "var(--ds-text-muted)",
}
const secHd: React.CSSProperties = { fontSize: 12, fontWeight: 800, letterSpacing: "0.05em", textTransform: "uppercase", color: "var(--ds-accent)" }
const ul: React.CSSProperties = { margin: "6px 0 0", paddingInlineStart: 20, display: "flex", flexDirection: "column", gap: 4 }
const li: React.CSSProperties = { fontSize: 13.5, lineHeight: 1.55, color: "var(--ds-text-sec)" }
const selStyle: React.CSSProperties = { border: "none", background: "transparent", color: "var(--ds-text)", fontFamily: "inherit", fontSize: 14, fontWeight: 600, cursor: "pointer", padding: "9px 4px", outline: "none" }
