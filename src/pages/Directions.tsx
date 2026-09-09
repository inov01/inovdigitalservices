import { useState, useEffect } from "react"
import { Link } from "react-router"
import { ArrowLeft, ArrowUpRight, Check, Sparkles } from "lucide-react"

// ─────────────────────────────────────────────────────────────────────────────
// /directions — page d'exploration créative (NON reliée au site public).
// Elle présente 3 directions visuelles rendues grandeur nature pour qu'INOV
// choisisse celle à appliquer sur tout le site. À supprimer une fois le choix
// fait (route + import de polices dans index.css).
// ─────────────────────────────────────────────────────────────────────────────

const IMG = (id: string, w: number, h: number) =>
  `https://images.unsplash.com/photo-${id}?w=${w}&h=${h}&fit=crop&auto=format&q=80`

// Images Unsplash
const IMG_GLASS = "1788543733005-db4baae369f4" // blocs de verre colorés
const IMG_PAPER = "1770975765735-616533b15cde" // papier gradient rose/vert
const IMG_DESK = "1717078279011-b0e9ae2a3a71" // bureau / cartes

const CONCEPTS = [
  { id: "kreyol", n: "01", name: "Zafè Kreyòl", tag: "Éditorial · Caribéen · Chaleureux" },
  { id: "studio", n: "02", name: "Studio Bold", tag: "Brutaliste · Graphique · Énergique" },
  { id: "nocturne", n: "03", name: "Nocturne", tag: "Immersif · Sombre · Premium" },
]

export default function Directions() {
  const [picked, setPicked] = useState<string | null>(null)

  // These faces (Fraunces/Anton/Inter/Instrument) are used ONLY on this internal
  // exploration page. Load them here at runtime rather than blocking every
  // visitor's first render with a global @import in index.css.
  useEffect(() => {
    const l = document.createElement("link")
    l.rel = "stylesheet"
    l.href = "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,900&family=Anton&family=Inter:wght@400;500;600;700;800&family=Instrument+Serif:ital@0;1&family=Instrument+Sans:wght@400;500;600;700&display=swap"
    document.head.appendChild(l)
    return () => { document.head.removeChild(l) }
  }, [])

  const jump = (id: string) => {
    document.getElementById(`c-${id}`)?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  return (
    <div style={{ background: "#0b0b0d", minHeight: "100vh" }}>
      <style>{`
        .dir-scroll { scroll-behavior: smooth; }
        .dir-cta { transition: transform .2s ease, box-shadow .2s ease, background .2s ease, color .2s ease; }
        .dir-cta:hover { transform: translateY(-2px); }
        @keyframes dir-marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        .dir-pill { transition: background .2s, color .2s, border-color .2s; }
        .dir-card-hover { transition: transform .35s cubic-bezier(.2,.7,.2,1), box-shadow .35s; }
        .dir-card-hover:hover { transform: translateY(-6px); }
        @media (max-width: 1000px) {
          .dir-hero-grid { grid-template-columns: 1fr !important; }
          .dir-bento { grid-template-columns: 1fr 1fr !important; }
          .dir-display-xl { font-size: clamp(52px, 14vw, 96px) !important; }
        }
      `}</style>

      {/* ── Barre supérieure ─────────────────────────────────────────────── */}
      <header
        style={{
          position: "sticky", top: 0, zIndex: 50,
          background: "rgba(11,11,13,0.72)", backdropFilter: "blur(14px)",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          padding: "14px clamp(16px, 4vw, 40px)",
          display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap",
        }}
      >
        <Link
          to="/"
          style={{
            display: "inline-flex", alignItems: "center", gap: 8, textDecoration: "none",
            color: "rgba(255,255,255,0.85)", fontFamily: "'Inter', sans-serif", fontSize: 13, fontWeight: 600,
          }}
        >
          <ArrowLeft size={16} /> Retour au site
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          {CONCEPTS.map((c) => (
            <button
              key={c.id}
              onClick={() => jump(c.id)}
              className="dir-pill"
              style={{
                display: "inline-flex", alignItems: "center", gap: 7,
                padding: "7px 14px", borderRadius: 100, cursor: "pointer",
                background: picked === c.id ? "#fff" : "rgba(255,255,255,0.06)",
                color: picked === c.id ? "#0b0b0d" : "rgba(255,255,255,0.8)",
                border: "1px solid rgba(255,255,255,0.12)",
                fontFamily: "'Inter', sans-serif", fontSize: 12.5, fontWeight: 600,
              }}
            >
              <span style={{ opacity: 0.5, fontVariantNumeric: "tabular-nums" }}>{c.n}</span>
              {c.name}
              {picked === c.id && <Check size={13} />}
            </button>
          ))}
        </div>
      </header>

      {/* ── Intro ────────────────────────────────────────────────────────── */}
      <section style={{ padding: "clamp(56px, 9vw, 120px) clamp(16px, 4vw, 40px) clamp(40px, 6vw, 72px)", maxWidth: 1000 }}>
        <div
          style={{
            display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 22,
            padding: "6px 14px", borderRadius: 100, border: "1px solid rgba(255,255,255,0.14)",
            color: "rgba(255,255,255,0.7)", fontFamily: "'Inter', sans-serif", fontSize: 12, fontWeight: 600, letterSpacing: ".08em", textTransform: "uppercase",
          }}
        >
          <Sparkles size={13} /> Exploration créative
        </div>
        <h1
          style={{
            fontFamily: "'Instrument Serif', serif", fontWeight: 400,
            fontSize: "clamp(40px, 7vw, 76px)", lineHeight: 1.05, color: "#fff", margin: "0 0 20px", letterSpacing: "-0.01em",
          }}
        >
          Trois directions pour réinventer{" "}
          <span style={{ fontStyle: "italic", color: "#ff7a1a" }}>INOV</span>.
        </h1>
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 18, lineHeight: 1.7, color: "rgba(255,255,255,0.6)", maxWidth: 640, margin: 0 }}>
          Chaque piste ci-dessous est une identité complète — typographie, palette, mise en page.
          Fais défiler, ressens laquelle te ressemble, puis clique <strong style={{ color: "#fff", fontWeight: 700 }}>« Choisir cette direction »</strong>.
          J'applique ensuite la gagnante sur tout le site.
        </p>
      </section>

      {/* ═══════════════ DIRECTION 01 — ZAFÈ KREYÒL (éditorial caribéen) ═══ */}
      <Concept id="kreyol" picked={picked} setPicked={setPicked}>
        <div style={{ background: "#f4ece0", color: "#1c150e", padding: "clamp(40px, 6vw, 80px) clamp(16px, 4vw, 56px)" }}>
          <ConceptLabel n="01" name="Zafè Kreyòl" tag="Éditorial · Caribéen · Chaleureux"
            fonts="Fraunces + Outfit" palette={["#c1502e", "#0e7a6b", "#e0a72e", "#1c150e", "#f4ece0"]} dark={false} />
          <div className="dir-hero-grid" style={{ display: "grid", gridTemplateColumns: "1.15fr 0.85fr", gap: "clamp(24px, 4vw, 56px)", alignItems: "center", marginTop: 40 }}>
            <div>
              <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 13, fontWeight: 700, letterSpacing: ".16em", textTransform: "uppercase", color: "#c1502e", marginBottom: 20 }}>
                Studio créatif · Ayiti → Le monde
              </div>
              <h2 className="dir-display-xl" style={{ fontFamily: "'Fraunces', serif", fontWeight: 600, fontSize: "clamp(46px, 6.4vw, 104px)", lineHeight: 0.98, letterSpacing: "-0.02em", margin: "0 0 24px" }}>
                On donne une <span style={{ fontStyle: "italic", color: "#0e7a6b" }}>âme</span> à ta marque.
              </h2>
              <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: 19, lineHeight: 1.65, color: "#5c5142", maxWidth: 480, margin: "0 0 32px" }}>
                Logos, packaging, réseaux sociaux, sites web. Un design qui raconte ton histoire
                avec la chaleur et l'énergie qui nous ressemblent.
              </p>
              <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
                <span className="dir-cta" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#1c150e", color: "#f4ece0", padding: "15px 28px", borderRadius: 100, fontFamily: "'Outfit', sans-serif", fontSize: 15, fontWeight: 700 }}>
                  Demander un devis <ArrowUpRight size={17} />
                </span>
                <span className="dir-cta" style={{ display: "inline-flex", alignItems: "center", padding: "15px 26px", borderRadius: 100, border: "1.5px solid #1c150e33", color: "#1c150e", fontFamily: "'Outfit', sans-serif", fontSize: 15, fontWeight: 600 }}>
                  Voir nos réalisations
                </span>
              </div>
              <div style={{ display: "flex", gap: 36, marginTop: 44, flexWrap: "wrap" }}>
                {[["+150", "projets livrés"], ["8", "langues"], ["24h", "de réponse"]].map(([a, b]) => (
                  <div key={b}>
                    <div style={{ fontFamily: "'Fraunces', serif", fontWeight: 600, fontSize: 34, lineHeight: 1 }}>{a}</div>
                    <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 13.5, color: "#8a7d6a", marginTop: 4 }}>{b}</div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ position: "relative" }}>
              <div style={{ position: "absolute", inset: "-14px -14px auto auto", width: 120, height: 120, background: "#e0a72e", borderRadius: "50%", zIndex: 0 }} />
              <div style={{ position: "relative", zIndex: 1, borderRadius: 20, overflow: "hidden", boxShadow: "0 30px 60px -20px rgba(28,21,14,0.4)", background: "#ddd", aspectRatio: "4/5" }}>
                <img src={IMG(IMG_PAPER, 720, 900)} alt="Papier aux dégradés colorés" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
              </div>
              <div style={{ position: "absolute", left: -18, bottom: 26, zIndex: 2, background: "#0e7a6b", color: "#fff", padding: "12px 18px", borderRadius: 14, fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: 14, boxShadow: "0 12px 30px rgba(14,122,107,0.4)" }}>
                Branding complet ✦
              </div>
            </div>
          </div>
        </div>
      </Concept>

      {/* ═══════════════ DIRECTION 02 — STUDIO BOLD (néo-brutalist) ═══════ */}
      <Concept id="studio" picked={picked} setPicked={setPicked}>
        <div style={{ background: "#0e0e0e", color: "#f5f3ec", padding: "clamp(40px, 6vw, 72px) clamp(16px, 4vw, 56px) 0", overflow: "hidden" }}>
          <ConceptLabel n="02" name="Studio Bold" tag="Brutaliste · Graphique · Énergique"
            fonts="Anton + Inter" palette={["#0e0e0e", "#f5f3ec", "#d6ff3f", "#ff3d7f"]} dark />
          <div style={{ marginTop: 36 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", marginBottom: 8 }}>
              <span style={{ background: "#d6ff3f", color: "#0e0e0e", padding: "6px 12px", fontFamily: "'Inter', sans-serif", fontWeight: 800, fontSize: 12, letterSpacing: ".04em", transform: "rotate(-2deg)" }}>
                DESIGN · WEB · BRANDING
              </span>
              <span style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: 13, color: "rgba(245,243,236,0.55)" }}>
                Basé en Haïti — disponible partout.
              </span>
            </div>
            <h2 style={{ fontFamily: "'Anton', sans-serif", fontWeight: 400, fontSize: "clamp(60px, 13vw, 200px)", lineHeight: 0.86, letterSpacing: "-0.01em", textTransform: "uppercase", margin: "0 0 4px" }}>
              On fait du<br />
              <span style={{ color: "#d6ff3f" }}>bruit</span> <span style={{ WebkitTextStroke: "2px #f5f3ec", color: "transparent" }}>visuel.</span>
            </h2>
          </div>
          {/* Marquee */}
          <div style={{ borderTop: "2px solid #f5f3ec", borderBottom: "2px solid #f5f3ec", margin: "28px 0", padding: "12px 0", overflow: "hidden", whiteSpace: "nowrap" }}>
            <div style={{ display: "inline-block", animation: "dir-marquee 22s linear infinite", fontFamily: "'Anton', sans-serif", fontSize: 22, textTransform: "uppercase", letterSpacing: ".02em" }}>
              {Array.from({ length: 2 }).map((_, i) => (
                <span key={i}>
                  Logos ✦ Packaging ✦ Sites web ✦ Réseaux sociaux ✦ Flyers ✦ Identité de marque ✦ Motion ✦&nbsp;
                </span>
              ))}
            </div>
          </div>
          <div className="dir-hero-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, paddingBottom: "clamp(40px, 6vw, 72px)" }}>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 18, lineHeight: 1.6, color: "rgba(245,243,236,0.7)", margin: 0, maxWidth: 460 }}>
              Pas de design tiède. On crée des marques qui s'imposent, se retiennent et font vendre.
              Direct, audacieux, efficace.
            </p>
            <div style={{ display: "flex", gap: 14, flexWrap: "wrap", alignItems: "flex-start", justifyContent: "flex-end" }}>
              <span className="dir-cta" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#ff3d7f", color: "#fff", padding: "16px 30px", fontFamily: "'Inter', sans-serif", fontWeight: 800, fontSize: 15, boxShadow: "6px 6px 0 #f5f3ec" }}>
                LANCER MON PROJET <ArrowUpRight size={18} />
              </span>
            </div>
          </div>
        </div>
      </Concept>

      {/* ═══════════════ DIRECTION 03 — NOCTURNE (immersif sombre) ════════ */}
      <Concept id="nocturne" picked={picked} setPicked={setPicked}>
        <div style={{ position: "relative", background: "#07070c", color: "#eef0f7", padding: "clamp(40px, 6vw, 80px) clamp(16px, 4vw, 56px)", overflow: "hidden" }}>
          {/* Mesh glow */}
          <div aria-hidden style={{ position: "absolute", top: "-10%", left: "8%", width: 520, height: 520, background: "radial-gradient(circle, rgba(124,92,255,0.5), transparent 65%)", filter: "blur(20px)", pointerEvents: "none" }} />
          <div aria-hidden style={{ position: "absolute", bottom: "-15%", right: "0%", width: 560, height: 560, background: "radial-gradient(circle, rgba(20,184,166,0.4), transparent 65%)", filter: "blur(20px)", pointerEvents: "none" }} />
          <div style={{ position: "relative", zIndex: 1 }}>
            <ConceptLabel n="03" name="Nocturne" tag="Immersif · Sombre · Premium"
              fonts="Instrument Serif + Instrument Sans" palette={["#07070c", "#7c5cff", "#14b8a6", "#eef0f7"]} dark />
            <div style={{ maxWidth: 820, marginTop: 44 }}>
              <div style={{ fontFamily: "'Instrument Sans', sans-serif", fontSize: 13, fontWeight: 600, letterSpacing: ".18em", textTransform: "uppercase", color: "rgba(238,240,247,0.55)", marginBottom: 22 }}>
                Studio digital · Haïti
              </div>
              <h2 style={{ fontFamily: "'Instrument Sans', sans-serif", fontWeight: 600, fontSize: "clamp(40px, 6vw, 82px)", lineHeight: 1.04, letterSpacing: "-0.02em", margin: "0 0 24px" }}>
                Le design qui fait{" "}
                <span style={{ fontFamily: "'Instrument Serif', serif", fontStyle: "italic", fontWeight: 400, background: "linear-gradient(90deg,#a78bfa,#5eead4)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>
                  passer un cap
                </span>{" "}
                à ta marque.
              </h2>
              <p style={{ fontFamily: "'Instrument Sans', sans-serif", fontSize: 18.5, lineHeight: 1.7, color: "rgba(238,240,247,0.62)", maxWidth: 560, margin: "0 0 34px" }}>
                Identité, sites sur-mesure et contenus qui donnent envie. Une expérience soignée,
                pensée pour convertir et marquer les esprits.
              </p>
              <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
                <span className="dir-cta" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "15px 30px", borderRadius: 12, background: "linear-gradient(90deg,#7c5cff,#14b8a6)", color: "#fff", fontFamily: "'Instrument Sans', sans-serif", fontWeight: 600, fontSize: 15, boxShadow: "0 12px 40px rgba(124,92,255,0.4)" }}>
                  Démarrer un projet <ArrowUpRight size={17} />
                </span>
                <span className="dir-cta" style={{ display: "inline-flex", alignItems: "center", padding: "15px 26px", borderRadius: 12, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.14)", color: "#eef0f7", fontFamily: "'Instrument Sans', sans-serif", fontWeight: 500, fontSize: 15 }}>
                  Voir le portfolio
                </span>
              </div>
            </div>
            {/* Bento */}
            <div className="dir-bento" style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr 1fr", gridAutoRows: "150px", gap: 16, marginTop: 52 }}>
              <BentoImg src={IMG(IMG_GLASS, 700, 700)} alt="Blocs de verre colorés" span2 label="Branding" />
              <BentoStat big="4.9★" small="satisfaction client" />
              <BentoImg src={IMG(IMG_DESK, 500, 500)} alt="Espace de travail créatif" label="Print" />
              <BentoStat big="+150" small="projets livrés" accent />
              <BentoImg src={IMG(IMG_PAPER, 500, 500)} alt="Dégradés colorés" label="Web & Social" />
            </div>
          </div>
        </div>
      </Concept>

      {/* ── Pied de page ─────────────────────────────────────────────────── */}
      <footer style={{ padding: "clamp(48px,7vw,90px) clamp(16px,4vw,40px)", textAlign: "center" }}>
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 16, color: "rgba(255,255,255,0.6)", margin: "0 auto 8px", maxWidth: 520, lineHeight: 1.6 }}>
          {picked
            ? `Super choix — tu penches pour « ${CONCEPTS.find((c) => c.id === picked)?.name} ».`
            : "Une direction te parle ? Clique « Choisir cette direction » sur celle qui te plaît."}
        </p>
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, color: "rgba(255,255,255,0.4)", margin: 0 }}>
          Dis-moi laquelle et je l'applique sur tout le site (ou on mixe le meilleur de plusieurs).
        </p>
      </footer>
    </div>
  )
}

// ── Wrapper d'une direction + bouton de sélection ────────────────────────────
function Concept({ id, picked, setPicked, children }: { id: string; picked: string | null; setPicked: (v: string) => void; children: React.ReactNode }) {
  const isPicked = picked === id
  return (
    <section id={`c-${id}`} style={{ position: "relative", scrollMarginTop: 70 }}>
      {children}
      <div style={{ position: "sticky", bottom: 20, zIndex: 30, display: "flex", justifyContent: "center", pointerEvents: "none", marginTop: -34 }}>
        <button
          onClick={() => setPicked(id)}
          className="dir-cta"
          style={{
            pointerEvents: "auto",
            display: "inline-flex", alignItems: "center", gap: 9,
            padding: "13px 26px", borderRadius: 100, cursor: "pointer",
            background: isPicked ? "#22c55e" : "#fff", color: isPicked ? "#fff" : "#0b0b0d",
            border: "none", fontFamily: "'Inter', sans-serif", fontSize: 14.5, fontWeight: 700,
            boxShadow: "0 10px 34px rgba(0,0,0,0.45)",
          }}
        >
          {isPicked ? <><Check size={17} /> Direction choisie</> : "Choisir cette direction"}
        </button>
      </div>
    </section>
  )
}

// ── Bandeau d'infos d'une direction (n°, nom, polices, palette) ──────────────
function ConceptLabel({ n, name, tag, fonts, palette, dark }: { n: string; name: string; tag: string; fonts: string; palette: string[]; dark: boolean }) {
  const sub = dark ? "rgba(255,255,255,0.55)" : "#8a7d6a"
  const line = dark ? "rgba(255,255,255,0.14)" : "rgba(28,21,14,0.14)"
  return (
    <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 24, flexWrap: "wrap", paddingBottom: 20, borderBottom: `1px solid ${line}` }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 16 }}>
        <span style={{ fontFamily: "'Inter', sans-serif", fontWeight: 800, fontSize: 15, color: sub, fontVariantNumeric: "tabular-nums" }}>{n}</span>
        <div>
          <div style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: 20, letterSpacing: "-0.01em" }}>{name}</div>
          <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: sub, marginTop: 3 }}>{tag}</div>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 18, flexWrap: "wrap" }}>
        <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 12.5, color: sub }}>
          <strong style={{ fontWeight: 700 }}>Aa</strong> {fonts}
        </span>
        <div style={{ display: "flex", gap: 6 }}>
          {palette.map((col) => (
            <span key={col} title={col} style={{ width: 22, height: 22, borderRadius: 6, background: col, border: `1px solid ${line}` }} />
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Cellules du bento (direction Nocturne) ───────────────────────────────────
function BentoImg({ src, alt, label, span2 }: { src: string; alt: string; label: string; span2?: boolean }) {
  return (
    <div className="dir-card-hover" style={{ position: "relative", gridColumn: span2 ? "span 2" : undefined, gridRow: span2 ? "span 2" : undefined, borderRadius: 16, overflow: "hidden", background: "#15151f", border: "1px solid rgba(255,255,255,0.08)" }}>
      <img src={src} alt={alt} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
      <span style={{ position: "absolute", left: 14, bottom: 12, background: "rgba(7,7,12,0.6)", backdropFilter: "blur(6px)", color: "#fff", padding: "5px 12px", borderRadius: 100, fontFamily: "'Instrument Sans', sans-serif", fontSize: 12.5, fontWeight: 600 }}>
        {label}
      </span>
    </div>
  )
}

function BentoStat({ big, small, accent }: { big: string; small: string; accent?: boolean }) {
  return (
    <div className="dir-card-hover" style={{ display: "flex", flexDirection: "column", justifyContent: "center", borderRadius: 16, padding: 20, background: accent ? "linear-gradient(135deg,rgba(124,92,255,0.22),rgba(20,184,166,0.18))" : "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)" }}>
      <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: 42, lineHeight: 1, color: "#fff" }}>{big}</div>
      <div style={{ fontFamily: "'Instrument Sans', sans-serif", fontSize: 13.5, color: "rgba(238,240,247,0.6)", marginTop: 6 }}>{small}</div>
    </div>
  )
}
