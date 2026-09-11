import { useEffect, useMemo, useRef, useState } from "react"
import { Link, useParams } from "react-router"
import { ArrowLeft, Paperclip, X, CheckCircle2, Send } from "lucide-react"
import { useSettings } from "../context/AppSettings"
import { applyPageMeta } from "../lib/seo"
import { track } from "../lib/analytics"
import { api, type BriefAttachment } from "../lib/api"
import { supabase } from "../lib/supabaseClient"
import {
  serviceBySlug, fieldsFor, briefStr, type BriefField,
} from "../data/briefs"

type Answer = string | string[]

function humanSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function Brief() {
  const { service = "" } = useParams()
  const { lang } = useSettings()
  const t = briefStr(lang)
  const svc = serviceBySlug(service)

  const fields = useMemo(() => (svc ? fieldsFor(svc) : []), [svc])
  const [answers, setAnswers] = useState<Record<string, Answer>>({})
  const [contact, setContact] = useState({ name: "", email: "", whatsapp: "" })
  const [files, setFiles] = useState<File[]>([])
  const [busy, setBusy] = useState(false)
  const [phase, setPhase] = useState<"idle" | "uploading" | "sending">("idle")
  const [error, setError] = useState("")
  const [done, setDone] = useState(false)
  const fileInput = useRef<HTMLInputElement | null>(null)

  const svcName = svc ? t(`svc.${svc.slug}.name`) : ""

  useEffect(() => {
    applyPageMeta({
      title: `${svcName || t("ui.title")} — INOV Digital Services`,
      description: svc ? t(`svc.${svc.slug}.intro`) : "",
      type: "website",
    })
    if (svc) track("view_brief", { service: svc.slug })
    window.scrollTo(0, 0)
  }, [svcName, svc, t])

  if (!svc) {
    return (
      <section style={{ background: "var(--ds-bg-sec)", padding: "80px 0", minHeight: "60vh" }}>
        <div style={{ maxWidth: 720, margin: "0 auto", padding: "0 var(--section-px)", textAlign: "center" }}>
          <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: 18, color: "var(--ds-text)" }}>{t("ui.notFound")}</p>
          <Link to="/" className="btn-orange" style={{ marginTop: 20, display: "inline-flex" }}>{t("ui.back")}</Link>
        </div>
      </section>
    )
  }

  const setAns = (id: string, v: Answer) => setAnswers((p) => ({ ...p, [id]: v }))
  const toggle = (id: string, v: string) =>
    setAnswers((p) => {
      const cur = Array.isArray(p[id]) ? (p[id] as string[]) : []
      return { ...p, [id]: cur.includes(v) ? cur.filter((x) => x !== v) : [...cur, v] }
    })

  const addFiles = (list: FileList | null) => {
    if (!list) return
    setFiles((p) => [...p, ...Array.from(list)])
  }
  const removeFile = (i: number) => setFiles((p) => p.filter((_, x) => x !== i))

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!svc) return
    setError("")
    // Required-field check (contact email + fields flagged required).
    if (!contact.name.trim() || !contact.email.trim()) { setError(t("ui.required")); return }
    for (const f of fields) {
      if (!f.required) continue
      const a = answers[f.id]
      const empty = a == null || (Array.isArray(a) ? a.length === 0 : String(a).trim() === "")
      if (empty) { setError(t("ui.required")); return }
    }

    setBusy(true)
    try {
      // 1) Upload attachments directly to Storage via one-shot signed URLs.
      const attachments: BriefAttachment[] = []
      if (files.length) {
        setPhase("uploading")
        for (const file of files) {
          const { path, token, bucket } = await api.briefUploadUrl({
            filename: file.name, contentType: file.type || "application/octet-stream", size: file.size,
          })
          const { error: upErr } = await supabase.storage.from(bucket).uploadToSignedUrl(path, token, file)
          if (upErr) throw new Error("file")
          attachments.push({ path, name: file.name, size: file.size, type: file.type })
        }
      }

      // 2) Build a readable summary for the admin inbox.
      const rendered = fields
        .map((f) => {
          const a = answers[f.id]
          if (a == null || (Array.isArray(a) && a.length === 0) || String(a).trim() === "") return null
          const val = Array.isArray(a)
            ? a.map((v) => t(`opt.${f.id}.${v}`)).join(", ")
            : f.options ? t(`opt.${f.id}.${a}`) : String(a)
          return `${t(`f.${f.id}.label`)}: ${val}`
        })
        .filter(Boolean)
        .join("\n")

      setPhase("sending")
      await api.submitLead({
        source: `brief:${svc.slug}`,
        name: contact.name.trim(),
        email: contact.email.trim(),
        phone: contact.whatsapp.trim(),
        lang,
        message: rendered,
        meta: { brief: { service: svc.slug, serviceName: svcName, answers }, attachments },
      })
      track("brief_submit", { service: svc.slug, files: attachments.length })
      setDone(true)
      window.scrollTo(0, 0)
    } catch (err) {
      setError(err instanceof Error && err.message === "file" ? t("ui.errorFile") : t("ui.errorSubmit"))
    } finally {
      setBusy(false)
      setPhase("idle")
    }
  }

  if (done) {
    return (
      <section style={{ background: "var(--ds-bg-sec)", padding: "88px 0", minHeight: "70vh" }}>
        <div style={{ maxWidth: 560, margin: "0 auto", padding: "0 var(--section-px)", textAlign: "center" }}>
          <div style={{ display: "inline-flex", padding: 18, borderRadius: "var(--r-full)", background: "color-mix(in srgb, var(--ds-orange) 14%, transparent)", marginBottom: 20 }}>
            <CheckCircle2 size={40} style={{ color: "var(--ds-orange)" }} />
          </div>
          <h1 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: "clamp(24px,3.4vw,34px)", color: "var(--ds-text)", margin: "0 0 12px" }}>{t("ui.successTitle")}</h1>
          <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: 16, lineHeight: 1.6, color: "var(--ds-text-sec)", margin: "0 0 28px" }}>{t("ui.successBody")}</p>
          <Link to="/" className="btn-orange" style={{ display: "inline-flex" }}>{t("ui.successCta")}</Link>
        </div>
      </section>
    )
  }

  return (
    <section style={{ background: "var(--ds-bg-sec)", padding: "56px 0 64px", minHeight: "70vh" }}>
      <div style={{ maxWidth: 760, margin: "0 auto", padding: "0 var(--section-px)" }}>
        <div style={{ marginBottom: 20 }}>
          <Link to="/" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "9px 16px", borderRadius: "var(--r-full)", background: "var(--ds-bg-card)", border: "1px solid var(--ds-border)", fontFamily: "'Outfit', sans-serif", fontSize: 14, fontWeight: 700, color: "var(--ds-text)", textDecoration: "none" }}>
            <ArrowLeft size={16} /> {t("ui.back")}
          </Link>
        </div>

        <span className="section-tag" style={{ display: "inline-block", marginBottom: 12 }}>{t("ui.badge")}</span>
        <h1 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: "clamp(28px,4vw,44px)", lineHeight: 1.1, color: "var(--ds-text)", margin: "0 0 10px" }}>{svcName}</h1>
        <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: 16, lineHeight: 1.6, color: "var(--ds-text-sec)", margin: "0 0 32px" }}>{t(`svc.${svc.slug}.intro`)}</p>

        <form onSubmit={submit} className="card" style={{ padding: "clamp(20px,3vw,34px)", display: "grid", gap: 22 }}>
          {fields.map((f) => <Field key={f.id} f={f} t={t} value={answers[f.id]} onText={(v) => setAns(f.id, v)} onToggle={(v) => toggle(f.id, v)} />)}

          {/* Attachments */}
          <div style={{ display: "grid", gap: 8 }}>
            <label style={labelStyle}>{t("ui.attachments")} <span style={optStyle}>· {t("ui.optional")}</span></label>
            <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: 13, color: "var(--ds-text-sec)", margin: 0 }}>{t("ui.attachmentsHelp")}</p>
            <input ref={fileInput} type="file" multiple onChange={(e) => addFiles(e.target.files)} style={{ display: "none" }} />
            <button type="button" onClick={() => fileInput.current?.click()} style={{ display: "inline-flex", alignItems: "center", gap: 8, alignSelf: "start", padding: "10px 16px", borderRadius: "var(--r-full)", background: "var(--ds-bg-sec)", border: "1px dashed var(--ds-border)", fontFamily: "'Outfit', sans-serif", fontSize: 14, fontWeight: 700, color: "var(--ds-text)", cursor: "pointer" }}>
              <Paperclip size={16} /> {t("ui.addFiles")}
            </button>
            {files.length > 0 && (
              <ul style={{ listStyle: "none", padding: 0, margin: "4px 0 0", display: "grid", gap: 6 }}>
                {files.map((file, i) => (
                  <li key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", borderRadius: 10, background: "var(--ds-bg-sec)", border: "1px solid var(--ds-border)" }}>
                    <span style={{ flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontFamily: "'Outfit', sans-serif", fontSize: 13, color: "var(--ds-text)" }}>{file.name}</span>
                    <span style={{ fontFamily: "'Space Grotesk', monospace", fontSize: 12, color: "var(--ds-text-sec)" }}>{humanSize(file.size)}</span>
                    <button type="button" aria-label={t("ui.remove")} onClick={() => removeFile(i)} style={{ display: "inline-flex", padding: 4, border: "none", background: "transparent", color: "var(--ds-text-sec)", cursor: "pointer" }}><X size={15} /></button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Contact */}
          <div style={{ borderTop: "1px solid var(--ds-border)", paddingTop: 22, display: "grid", gap: 16 }}>
            <h2 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: 18, color: "var(--ds-text)", margin: 0 }}>{t("ui.stepContact")}</h2>
            <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
              <div style={{ display: "grid", gap: 8 }}>
                <label htmlFor="brief-contact-name" style={labelStyle}>{t("ui.name")} <span style={reqStyle}>*</span></label>
                <input id="brief-contact-name" autoComplete="name" value={contact.name} onChange={(e) => setContact({ ...contact, name: e.target.value })} style={inputStyle} />
              </div>
              <div style={{ display: "grid", gap: 8 }}>
                <label htmlFor="brief-contact-email" style={labelStyle}>{t("ui.email")} <span style={reqStyle}>*</span></label>
                <input id="brief-contact-email" type="email" autoComplete="email" value={contact.email} onChange={(e) => setContact({ ...contact, email: e.target.value })} style={inputStyle} />
              </div>
              <div style={{ display: "grid", gap: 8 }}>
                <label htmlFor="brief-contact-whatsapp" style={labelStyle}>{t("ui.whatsapp")} <span style={optStyle}>· {t("ui.optional")}</span></label>
                <input id="brief-contact-whatsapp" type="tel" autoComplete="tel" value={contact.whatsapp} onChange={(e) => setContact({ ...contact, whatsapp: e.target.value })} style={inputStyle} />
              </div>
            </div>
          </div>

          {error && <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: 14, fontWeight: 600, color: "#dc2626", margin: 0 }}>{error}</p>}

          <button type="submit" disabled={busy} className="btn-orange" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, opacity: busy ? 0.7 : 1, cursor: busy ? "wait" : "pointer" }}>
            <Send size={16} /> {phase === "uploading" ? t("ui.uploading") : busy ? t("ui.submitting") : t("ui.submit")}
          </button>
        </form>
      </div>
    </section>
  )
}

const labelStyle: React.CSSProperties = { fontFamily: "'Outfit', sans-serif", fontSize: 14, fontWeight: 700, color: "var(--ds-text)" }
const optStyle: React.CSSProperties = { fontWeight: 500, color: "var(--ds-text-sec)", fontSize: 13 }
const reqStyle: React.CSSProperties = { color: "var(--ds-orange)" }
const inputStyle: React.CSSProperties = { width: "100%", padding: "11px 14px", borderRadius: 10, border: "1px solid var(--ds-border)", background: "var(--ds-bg)", fontFamily: "'Outfit', sans-serif", fontSize: 15, color: "var(--ds-text)", outline: "none" }

function Field({ f, t, value, onText, onToggle }: {
  f: BriefField
  t: (k: string) => string
  value: Answer | undefined
  onText: (v: string) => void
  onToggle: (v: string) => void
}) {
  const label = t(`f.${f.id}.label`)
  const ph = t(`f.${f.id}.ph`)
  const placeholder = ph.startsWith("f.") ? "" : ph
  const arr = Array.isArray(value) ? value : []
  const str = typeof value === "string" ? value : ""

  return (
    <div style={{ display: "grid", gap: 8 }}>
      <label htmlFor={`brief-${f.id}`} style={labelStyle}>
        {label} {f.required ? <span style={reqStyle}>*</span> : <span style={optStyle}>· {t("ui.optional")}</span>}
      </label>

      {f.type === "text" && (
        <input id={`brief-${f.id}`} value={str} placeholder={placeholder} onChange={(e) => onText(e.target.value)} style={inputStyle} />
      )}

      {f.type === "textarea" && (
        <textarea id={`brief-${f.id}`} value={str} placeholder={placeholder} onChange={(e) => onText(e.target.value)} rows={3} style={{ ...inputStyle, resize: "vertical", lineHeight: 1.5 }} />
      )}

      {f.type === "select" && (
        <select id={`brief-${f.id}`} value={str} onChange={(e) => onText(e.target.value)} style={{ ...inputStyle, appearance: "auto" }}>
          <option value="">{t("ui.selectPlaceholder")}</option>
          {f.options?.map((o) => <option key={o} value={o}>{t(`opt.${f.id}.${o}`)}</option>)}
        </select>
      )}

      {f.type === "radio" && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {f.options?.map((o) => {
            const on = str === o
            return (
              <button key={o} type="button" onClick={() => onText(o)} style={chipStyle(on)}>{t(`opt.${f.id}.${o}`)}</button>
            )
          })}
        </div>
      )}

      {f.type === "checkbox" && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {f.options?.map((o) => {
            const on = arr.includes(o)
            return (
              <button key={o} type="button" onClick={() => onToggle(o)} style={chipStyle(on)}>{t(`opt.${f.id}.${o}`)}</button>
            )
          })}
        </div>
      )}
    </div>
  )
}

function chipStyle(on: boolean): React.CSSProperties {
  return {
    padding: "9px 16px", borderRadius: "var(--r-full)", cursor: "pointer",
    fontFamily: "'Outfit', sans-serif", fontSize: 14, fontWeight: 700,
    border: on ? "1px solid var(--ds-orange)" : "1px solid var(--ds-border)",
    background: on ? "color-mix(in srgb, var(--ds-orange) 14%, transparent)" : "var(--ds-bg)",
    color: on ? "var(--ds-orange)" : "var(--ds-text)",
    transition: "all .15s ease",
  }
}
