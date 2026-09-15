import { useEffect, useMemo, useState } from "react"
import { Link, useParams } from "react-router"
import {
  ArrowLeft, GraduationCap, Clock, Wifi, MapPin, Users, CheckCircle2,
  Send, Sparkles, BadgeCheck, Radio, PlayCircle, Download, CalendarPlus,
  ExternalLink, Loader2,
} from "lucide-react"
import { useSettings } from "../context/AppSettings"
import { applyPageMeta } from "../lib/seo"
import { track } from "../lib/analytics"
import { api, type Formation as Course } from "../lib/api"
import ShareButtons from "../components/ShareButtons"
import {
  TR, inputStyle, typeColor, TypeIcon, gcalUrl, toYoutubeEmbed,
  useCountdown, isWithin24h,
} from "./Formation"

export default function FormationDetail() {
  const { slug = "" } = useParams()
  const { lang, fmt, currency, region } = useSettings()
  const s = TR[lang] ?? TR.fr
  const [course, setCourse] = useState<Course | null>(null)
  const [state, setState] = useState<"loading" | "ok" | "missing">("loading")

  useEffect(() => {
    let cancelled = false
    window.scrollTo(0, 0)
    setState("loading")
    api.getFormation(slug)
      .then((r) => {
        if (cancelled) return
        setCourse(r.formation)
        setState("ok")
        const url = `${window.location.origin}/formation/${r.formation.slug ?? slug}`
        applyPageMeta({
          title: `${r.formation.title} — INOV Digital Services`,
          description: r.formation.summary,
          image: r.formation.ogImage || r.formation.image,
          url,
          type: "article",
        })
        track("view_formation_detail", { id: r.formation.id })
      })
      .catch(() => { if (!cancelled) setState("missing") })
    return () => { cancelled = true }
  }, [slug, lang])

  if (state === "loading") {
    return (
      <section style={{ background: "var(--ds-bg-sec)", minHeight: "70vh", display: "grid", placeItems: "center" }}>
        <Loader2 size={30} style={{ animation: "spin 0.8s linear infinite", color: "var(--ds-accent)" }} />
      </section>
    )
  }

  if (state === "missing" || !course) {
    return (
      <section style={{ background: "var(--ds-bg-sec)", minHeight: "70vh", padding: "80px 0", textAlign: "center" }}>
        <div style={{ maxWidth: 520, margin: "0 auto", padding: "0 var(--section-px)" }}>
          <Sparkles size={30} style={{ color: "var(--ds-accent)", marginBottom: 12 }} />
          <h1 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 24, fontWeight: 800, color: "var(--ds-text)", margin: "0 0 8px" }}>{s.empty}</h1>
          <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: 15, color: "var(--ds-text-muted)", margin: "0 0 22px" }}>{s.emptyHint}</p>
          <Link to="/formation" className="btn-orange" style={{ display: "inline-flex", alignItems: "center", gap: 7 }}>
            <ArrowLeft size={16} /> {s.eyebrow}
          </Link>
        </div>
      </section>
    )
  }

  const c = course
  const { bg, color } = typeColor(c.type)
  const cover = c.ogImage || c.image
  const fmtLabel = c.format === "presentiel" ? s.presential : c.format === "hybride" ? s.hybrid : s.online
  const fmtIcon = c.format === "presentiel" ? <MapPin size={14} /> : <Wifi size={14} />
  const lvlLabel = c.level === "avance" ? s.advanced : c.level === "intermediaire" ? s.intermediate : s.beginner
  const typeLabel = c.type === "live" ? s.live : c.type === "conference" ? s.conference : c.type === "replay" ? s.replay : s.cours
  const shareUrl = `${window.location.origin}/formation/${c.slug ?? slug}`

  return (
    <section style={{ background: "var(--ds-bg-sec)", padding: "48px 0 96px", minHeight: "70vh" }}>
      <div style={{ maxWidth: 940, margin: "0 auto", padding: "0 var(--section-px)" }}>
        <Link to="/formation" style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "var(--ds-text-muted)", fontSize: 14, fontFamily: "'Outfit', sans-serif", textDecoration: "none", marginBottom: 22 }}>
          <ArrowLeft size={16} /> {s.eyebrow}
        </Link>

        {cover && (
          <div style={{ aspectRatio: "16/9", overflow: "hidden", borderRadius: "var(--r-xl)", background: "var(--ds-bg-card-hover)", marginBottom: 24 }}>
            <img src={cover} alt={c.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
        )}

        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 14 }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 11px", borderRadius: "var(--r-full)", fontSize: 12.5, fontWeight: 700, fontFamily: "'Outfit', sans-serif", background: bg, color }}>
            <TypeIcon type={c.type} /> {typeLabel}
          </span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 11px", borderRadius: "var(--r-full)", fontSize: 12.5, fontWeight: 700, fontFamily: "'Outfit', sans-serif", background: c.free ? "rgba(22,163,74,0.12)" : "var(--ds-accent-a12)", color: c.free ? "#16A34A" : "var(--ds-accent)" }}>
            <BadgeCheck size={13} /> {c.free ? s.free : fmt(c.price)}
          </span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 11px", borderRadius: "var(--r-full)", fontSize: 12.5, fontWeight: 700, fontFamily: "'Outfit', sans-serif", background: "var(--ds-bg-card-hover)", color: "var(--ds-text-muted)" }}>
            {lvlLabel}
          </span>
        </div>

        <h1 style={{ fontFamily: "'Outfit', sans-serif", fontSize: "clamp(26px, 4.5vw, 40px)", fontWeight: 800, lineHeight: 1.1, color: "var(--ds-text)", margin: "0 0 12px", letterSpacing: "-0.02em" }}>
          {c.title}
        </h1>
        <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: 17, lineHeight: 1.6, color: "var(--ds-text-muted)", margin: "0 0 20px" }}>{c.summary}</p>

        <div style={{ marginBottom: 24 }}>
          <ShareButtons url={shareUrl} title={c.title} />
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 16, fontSize: 14, color: "var(--ds-text-muted)", fontFamily: "'Outfit', sans-serif", marginBottom: 28, paddingBottom: 24, borderBottom: "1px solid var(--ds-border)" }}>
          {c.durationHours > 0 && <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><Clock size={15} /> {c.durationHours}{s.hours}</span>}
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>{fmtIcon} {fmtLabel}</span>
          {c.seats ? <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><Users size={15} /> {c.seats} {s.seats}</span> : null}
          {c.startDate && <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><CalendarPlus size={15} /> {s.starts} {c.startDate}</span>}
          {c.instructor && <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><GraduationCap size={15} /> {c.instructor}</span>}
        </div>

        <div style={{ display: "grid", gap: 40, gridTemplateColumns: "minmax(0, 1fr)", alignItems: "start" }}>
          <div>
            {c.description && (
              <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: 15.5, lineHeight: 1.7, color: "var(--ds-text-muted)", margin: "0 0 26px", whiteSpace: "pre-wrap" }}>{c.description}</p>
            )}

            {c.syllabus?.length > 0 && (
              <div style={{ marginBottom: 28 }}>
                <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: 13, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.04em", color: "var(--ds-text)", margin: "0 0 12px" }}>{s.program}</p>
                <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 10 }}>
                  {c.syllabus.map((m, i) => (
                    <li key={i} style={{ display: "flex", gap: 10, fontFamily: "'Outfit', sans-serif", fontSize: 15, color: "var(--ds-text-muted)" }}>
                      <CheckCircle2 size={17} style={{ color: "var(--ds-accent)", flexShrink: 0, marginTop: 2 }} /> {m}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {c.type === "replay" && c.replayUrl && (
              <div style={{ marginBottom: 28, borderRadius: "var(--r-lg)", overflow: "hidden", aspectRatio: "16/9" }}>
                <iframe src={toYoutubeEmbed(c.replayUrl)} title={c.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen
                  style={{ width: "100%", height: "100%", border: "none" }} />
              </div>
            )}
          </div>

          <EnrollForm course={c} s={s} lang={lang} currency={currency} region={region} />
        </div>
      </div>
    </section>
  )
}

// ── Inline enrollment form (shareable-page variant of the modal) ────────────────
function EnrollForm({ course, s, lang, currency, region }: {
  course: Course; s: typeof TR["fr"]; lang: string; currency: string; region: string
}) {
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" })
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState("")
  const calUrl = gcalUrl(course)
  const within24h = isWithin24h(course.startDateTime)
  const countdown = useCountdown(within24h ? course.startDateTime : undefined)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    if (!form.name.trim() || !form.email.trim()) { setError(s.required); return }
    setBusy(true)
    try {
      await api.enrollFormation({
        formationId: course.id, name: form.name.trim(), email: form.email.trim(),
        phone: form.phone.trim(), message: form.message.trim(), lang, currency, region,
      })
      track("formation_enroll", { id: course.id, free: course.free })
      setDone(true)
    } catch {
      setError(s.error)
    } finally {
      setBusy(false)
    }
  }

  const wrap: React.CSSProperties = {
    background: "var(--ds-bg-card)", border: "1px solid var(--ds-border)",
    borderRadius: "var(--r-xl)", padding: 24,
  }

  if (done) {
    return (
      <div style={{ ...wrap, textAlign: "center" }}>
        <CheckCircle2 size={42} style={{ color: "var(--ds-success)", marginBottom: 12 }} />
        <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: 16, fontWeight: 700, color: "var(--ds-text)", lineHeight: 1.5, margin: "0 0 18px" }}>
          {course.free ? s.okFree : s.okPaid}
        </p>
        <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
          {(course.type === "live" || course.type === "conference") && course.liveUrl && (
            <a href={course.liveUrl} target="_blank" rel="noopener noreferrer" className="btn-orange" style={{ display: "inline-flex", alignItems: "center", gap: 7 }}>
              <ExternalLink size={15} /> {s.joinLive}
            </a>
          )}
          {calUrl && (course.type === "live" || course.type === "conference") && (
            <a href={calUrl} target="_blank" rel="noopener noreferrer"
              style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "10px 16px", borderRadius: "var(--r-md)", background: "var(--ds-bg-sec)", border: "1px solid var(--ds-border)", color: "var(--ds-text)", fontFamily: "'Outfit', sans-serif", fontSize: 14, fontWeight: 700, textDecoration: "none" }}>
              <CalendarPlus size={15} /> {s.addCalendar}
            </a>
          )}
          {course.resourcesUrl && (
            <a href={course.resourcesUrl} target="_blank" rel="noopener noreferrer"
              style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "10px 16px", borderRadius: "var(--r-md)", background: "var(--ds-bg-sec)", border: "1px solid var(--ds-border)", color: "var(--ds-text)", fontFamily: "'Outfit', sans-serif", fontSize: 14, fontWeight: 700, textDecoration: "none" }}>
              <Download size={15} /> {s.downloadRes}
            </a>
          )}
          {!course.free && (
            <Link to="/paiement" className="btn-orange" style={{ display: "inline-flex", alignItems: "center", gap: 7 }}>
              {s.payCta}
            </Link>
          )}
        </div>
      </div>
    )
  }

  return (
    <div style={wrap}>
      <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 18, fontWeight: 800, color: "var(--ds-text)", margin: "0 0 4px" }}>{s.enroll}</h2>
      {within24h && countdown && !course.isLive && (
        <div style={{ display: "flex", alignItems: "center", gap: 7, margin: "12px 0", padding: "8px 12px", borderRadius: "var(--r-md)", background: "rgba(220,38,38,0.08)", border: "1px solid rgba(220,38,38,0.2)" }}>
          <Radio size={14} style={{ color: "#DC2626", flexShrink: 0 }} />
          <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 13, fontWeight: 700, color: "#DC2626" }}>{s.startsIn} {countdown}</span>
        </div>
      )}
      <form onSubmit={submit} style={{ display: "grid", gap: 12, marginTop: 14 }}>
        <input style={inputStyle} placeholder={s.name} value={form.name} aria-label={s.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required />
        <input style={inputStyle} type="email" placeholder={s.email} value={form.email} aria-label={s.email}
          onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} required />
        <input style={inputStyle} placeholder={s.whatsapp} value={form.phone} aria-label={s.whatsapp}
          onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
        <textarea style={{ ...inputStyle, minHeight: 80, resize: "vertical" }} placeholder={s.msgPh} value={form.message} aria-label={s.msg}
          onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))} />
        {error && <p role="alert" style={{ color: "var(--ds-danger)", fontSize: 13.5, fontFamily: "'Outfit', sans-serif", margin: 0 }}>{error}</p>}
        <button type="submit" className="btn-orange" disabled={busy} style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 4, opacity: busy ? 0.7 : 1 }}>
          <Send size={16} /> {busy ? s.sending : s.submit}
        </button>
      </form>
    </div>
  )
}
