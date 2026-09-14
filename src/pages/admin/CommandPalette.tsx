import { useEffect, useMemo, useRef, useState } from "react"
import { Search, CornerDownLeft } from "lucide-react"
import { ALL_ITEMS, groupOf, type Tab } from "./nav"

// ⌘K / Ctrl+K quick-jump palette. Filters the flat section list by label + hint,
// keyboard-navigable, and calls onGo() with the chosen section key. No new deps.
export default function CommandPalette({ open, onClose, onGo }: {
  open: boolean
  onClose: () => void
  onGo: (key: Tab) => void
}) {
  const [q, setQ] = useState("")
  const [active, setActive] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  const results = useMemo(() => {
    const needle = q.trim().toLowerCase()
    if (!needle) return ALL_ITEMS
    return ALL_ITEMS.filter((i) =>
      (i.label + " " + (i.hint ?? "") + " " + (groupOf(i.key) ?? "")).toLowerCase().includes(needle),
    )
  }, [q])

  useEffect(() => {
    if (open) { setQ(""); setActive(0); setTimeout(() => inputRef.current?.focus(), 20) }
  }, [open])
  useEffect(() => { setActive(0) }, [q])

  if (!open) return null

  function choose(key: Tab) { onGo(key); onClose() }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") { onClose(); return }
    if (e.key === "ArrowDown") { e.preventDefault(); setActive((a) => Math.min(a + 1, results.length - 1)) }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)) }
    else if (e.key === "Enter") { e.preventDefault(); const r = results[active]; if (r) choose(r.key) }
  }

  return (
    <div
      role="dialog" aria-modal="true" aria-label="Recherche rapide des sections"
      onMouseDown={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 60, display: "flex", justifyContent: "center",
        alignItems: "flex-start", paddingTop: "12vh",
        background: "color-mix(in srgb, #000 62%, transparent)",
        backdropFilter: "blur(4px)", WebkitBackdropFilter: "blur(4px)",
      }}
    >
      <div
        onMouseDown={(e) => e.stopPropagation()} onKeyDown={onKeyDown}
        style={{
          width: "min(560px, 92vw)", background: "var(--ds-bg-card)",
          border: "1px solid var(--ds-border)", borderRadius: "var(--r-lg)",
          boxShadow: "0 24px 60px -12px rgba(0,0,0,0.6)", overflow: "hidden",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 16px", borderBottom: "1px solid var(--ds-border)" }}>
          <Search size={18} style={{ color: "var(--ds-text-faint)" }} />
          <input
            ref={inputRef} value={q} onChange={(e) => setQ(e.target.value)}
            placeholder="Aller à une section…"
            style={{ flex: 1, border: "none", background: "transparent", color: "var(--ds-text)", fontFamily: "inherit", fontSize: 16, outline: "none" }}
          />
          <kbd style={{ fontSize: 11, fontWeight: 700, color: "var(--ds-text-faint)", border: "1px solid var(--ds-border)", borderRadius: 6, padding: "2px 6px" }}>ESC</kbd>
        </div>
        <div style={{ maxHeight: "52vh", overflowY: "auto", padding: 8 }}>
          {results.length === 0 && (
            <div style={{ padding: "22px 12px", textAlign: "center", color: "var(--ds-text-faint)", fontSize: 14 }}>Aucune section</div>
          )}
          {results.map((r, i) => {
            const on = i === active
            return (
              <button
                key={r.key} onClick={() => choose(r.key)} onMouseEnter={() => setActive(i)}
                style={{
                  display: "flex", alignItems: "center", gap: 12, width: "100%", textAlign: "start",
                  border: "none", cursor: "pointer", borderRadius: "var(--r-md)", padding: "10px 12px",
                  fontFamily: "inherit", fontSize: 14.5, fontWeight: 600,
                  background: on ? "var(--ds-accent-a12)" : "transparent",
                  color: on ? "var(--ds-accent-text)" : "var(--ds-text-sec)",
                }}
              >
                <span style={{ display: "inline-flex", color: on ? "var(--ds-accent)" : "var(--ds-text-muted)" }}>{r.icon}</span>
                <span>{r.label}</span>
                {groupOf(r.key) && (
                  <span style={{ marginInlineStart: "auto", fontSize: 12, fontWeight: 700, color: "var(--ds-text-faint)" }}>{groupOf(r.key)}</span>
                )}
                {on && <CornerDownLeft size={15} style={{ color: "var(--ds-accent)", marginInlineStart: groupOf(r.key) ? 8 : "auto" }} />}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
