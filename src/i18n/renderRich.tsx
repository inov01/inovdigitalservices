import { Fragment, type ReactNode } from "react"
import { smoothScrollToId } from "../lib/smoothScroll"

// Opens a portfolio album by id from anywhere in the app.
function openAlbum(id: string) {
  smoothScrollToId("portfolio")
  window.dispatchEvent(new CustomEvent("open-album", { detail: id }))
}

// Only allow safe URL schemes for external links (blocks javascript:, data:,
// vbscript:, etc.). Relative paths and in-page anchors are always allowed.
function isSafeHref(target: string): boolean {
  const t = target.trim().toLowerCase()
  if (t.startsWith("/") || t.startsWith("#") || t.startsWith("./") || t.startsWith("../")) return true
  return /^(https?:|mailto:|tel:)/.test(t)
}

// Splits a plain segment into **word** orange highlights, appending each node
// to `nodes` with a unique sequential key.
function pushHighlights(nodes: ReactNode[], text: string, highlight: string) {
  for (const part of text.split(/(\*\*[^*]+\*\*)/g)) {
    if (part === "") continue
    if (part.startsWith("**") && part.endsWith("**")) {
      nodes.push(<span key={nodes.length} style={{ color: highlight }}>{part.slice(2, -2)}</span>)
    } else {
      nodes.push(<Fragment key={nodes.length}>{part}</Fragment>)
    }
  }
}

// Renders a dictionary string that supports:
//   **word**            -> orange highlight
//   [label](album:id)   -> inline link that opens a portfolio album
//   [label](https://…)  -> external link
//   \n                  -> line break
export function renderRich(str: string, highlight = "var(--ds-accent)"): ReactNode {
  const linkRe = /\[([^\]]+)\]\(([^)]+)\)/g
  return str.split("\n").map((line, li, lines) => {
    const nodes: ReactNode[] = []
    let last = 0
    let m: RegExpExecArray | null
    linkRe.lastIndex = 0
    while ((m = linkRe.exec(line)) !== null) {
      if (m.index > last) pushHighlights(nodes, line.slice(last, m.index), highlight)
      const [, label, target] = m
      const linkStyle = { color: highlight, fontWeight: 700, textDecoration: "underline", textUnderlineOffset: 3 }
      if (target.startsWith("album:")) {
        const id = target.slice(6)
        nodes.push(
          <button
            key={nodes.length}
            type="button"
            onClick={() => openAlbum(id)}
            style={{ ...linkStyle, background: "none", border: "none", padding: 0, cursor: "pointer", font: "inherit" }}
          >
            {label}
          </button>,
        )
      } else if (isSafeHref(target)) {
        nodes.push(
          <a key={nodes.length} href={target} target="_blank" rel="noopener noreferrer" style={linkStyle}>
            {label}
          </a>,
        )
      } else {
        // Unsafe/unknown scheme — render the label as plain text, never as a link.
        pushHighlights(nodes, label, highlight)
      }
      last = m.index + m[0].length
    }
    if (last < line.length) pushHighlights(nodes, line.slice(last), highlight)
    return (
      <Fragment key={li}>
        {nodes}
        {li < lines.length - 1 && <br />}
      </Fragment>
    )
  })
}
