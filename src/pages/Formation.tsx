import { useEffect, useMemo, useState } from "react"
import { Link } from "react-router"
import {
  ArrowLeft, GraduationCap, Clock, Wifi, MapPin, Users, CheckCircle2,
  Send, X, Sparkles, BadgeCheck,
} from "lucide-react"
import { useSettings } from "../context/AppSettings"
import type { Lang } from "../i18n/translations"
import { applyPageMeta } from "../lib/seo"
import { track } from "../lib/analytics"
import { api, type Formation as Course } from "../lib/api"

// Page-local copy (kept out of the central dict). Falls back to French.
type Str = {
  eyebrow: string; title: string; intro: string; back: string
  free: string; paid: string; hours: string; from: string
  online: string; presential: string; hybrid: string
  beginner: string; intermediate: string; advanced: string
  seats: string; program: string; enroll: string; enrolled: string
  instructor: string; empty: string; emptyHint: string; starts: string
  name: string; email: string; whatsapp: string; msg: string
  msgPh: string; submit: string; sending: string
  okFree: string; okPaid: string; payCta: string; required: string; error: string
}
const TR: Record<Lang, Str> = {
  fr: {
    eyebrow: "Espace Formation", title: "Apprends le design avec INOV",
    intro: "Des formations concrètes, animées par des pros haïtiens, pour maîtriser le design, le branding et le web — à ton rythme.",
    back: "Retour à l'accueil", free: "Gratuite", paid: "Payante", hours: "h", from: "À partir de",
    online: "En ligne", presential: "Présentiel", hybrid: "Hybride",
    beginner: "Débutant", intermediate: "Intermédiaire", advanced: "Avancé",
    seats: "places", program: "Au programme", enroll: "S'inscrire", enrolled: "Inscrit",
    instructor: "Formateur", empty: "Bientôt de nouvelles formations",
    emptyHint: "Reviens vite — le catalogue s'enrichit régulièrement.", starts: "Débute le",
    name: "Nom complet", email: "E-mail", whatsapp: "WhatsApp (optionnel)",
    msg: "Message (optionnel)", msgPh: "Une question, un objectif d'apprentissage…",
    submit: "Confirmer mon inscription", sending: "Envoi…",
    okFree: "Inscription confirmée ! On te contacte très vite avec les accès. 🎉",
    okPaid: "Inscription reçue ! Finalise le paiement pour réserver ta place.",
    payCta: "Procéder au paiement", required: "Renseigne au moins ton nom et ton e-mail.",
    error: "Un souci est survenu. Réessaie ou écris-nous sur WhatsApp.",
  },
  en: {
    eyebrow: "Training Space", title: "Learn design with INOV",
    intro: "Hands-on courses led by Haitian pros to master design, branding and the web — at your own pace.",
    back: "Back to home", free: "Free", paid: "Paid", hours: "h", from: "From",
    online: "Online", presential: "In person", hybrid: "Hybrid",
    beginner: "Beginner", intermediate: "Intermediate", advanced: "Advanced",
    seats: "seats", program: "Curriculum", enroll: "Enroll", enrolled: "Enrolled",
    instructor: "Instructor", empty: "New courses coming soon",
    emptyHint: "Check back soon — the catalogue grows regularly.", starts: "Starts",
    name: "Full name", email: "Email", whatsapp: "WhatsApp (optional)",
    msg: "Message (optional)", msgPh: "A question, a learning goal…",
    submit: "Confirm my enrollment", sending: "Sending…",
    okFree: "You're enrolled! We'll reach out shortly with access. 🎉",
    okPaid: "Enrollment received! Complete payment to reserve your seat.",
    payCta: "Proceed to payment", required: "Please add at least your name and email.",
    error: "Something went wrong. Try again or message us on WhatsApp.",
  },
  es: {
    eyebrow: "Espacio Formación", title: "Aprende diseño con INOV",
    intro: "Cursos prácticos con profesionales haitianos para dominar el diseño, el branding y la web — a tu ritmo.",
    back: "Volver al inicio", free: "Gratis", paid: "De pago", hours: "h", from: "Desde",
    online: "En línea", presential: "Presencial", hybrid: "Híbrido",
    beginner: "Principiante", intermediate: "Intermedio", advanced: "Avanzado",
    seats: "plazas", program: "Programa", enroll: "Inscribirse", enrolled: "Inscrito",
    instructor: "Formador", empty: "Próximamente nuevos cursos",
    emptyHint: "Vuelve pronto — el catálogo crece a menudo.", starts: "Empieza el",
    name: "Nombre completo", email: "Correo", whatsapp: "WhatsApp (opcional)",
    msg: "Mensaje (opcional)", msgPh: "Una duda, un objetivo…",
    submit: "Confirmar inscripción", sending: "Enviando…",
    okFree: "¡Inscripción confirmada! Te contactamos pronto con los accesos. 🎉",
    okPaid: "¡Inscripción recibida! Completa el pago para reservar tu plaza.",
    payCta: "Ir al pago", required: "Añade al menos tu nombre y correo.",
    error: "Algo salió mal. Inténtalo de nuevo o escríbenos por WhatsApp.",
  },
  ht: {
    eyebrow: "Espas Fòmasyon", title: "Aprann design ak INOV",
    intro: "Fòmasyon konkrè, anime pa pwofesyonèl ayisyen, pou w metrize design, branding ak entènèt — nan pwòp ritm pa w.",
    back: "Tounen nan akèy", free: "Gratis", paid: "Peye", hours: "è", from: "Apati",
    online: "Sou entènèt", presential: "Anpèsòn", hybrid: "Ibrid",
    beginner: "Debitan", intermediate: "Mwayen", advanced: "Avanse",
    seats: "plas", program: "Sa w ap aprann", enroll: "Enskri", enrolled: "Enskri",
    instructor: "Fòmatè", empty: "Gen lòt fòmasyon k ap vini talè",
    emptyHint: "Tounen vin gade — katalòg la ap grandi souvan.", starts: "Kòmanse",
    name: "Non konplè", email: "Imèl", whatsapp: "WhatsApp (opsyonèl)",
    msg: "Mesaj (opsyonèl)", msgPh: "Yon kesyon, yon objektif…",
    submit: "Konfime enskripsyon m", sending: "N ap voye…",
    okFree: "Ou enskri! N ap kontakte w byen vit ak aksè yo. 🎉",
    okPaid: "Nou resevwa enskripsyon w! Fin peye pou w rezève plas ou.",
    payCta: "Ale peye", required: "Mete omwen non w ak imèl ou.",
    error: "Gen yon pwoblèm. Eseye ankò oswa ekri nou sou WhatsApp.",
  },
  pt: {
    eyebrow: "Espaço Formação", title: "Aprenda design com a INOV",
    intro: "Cursos práticos com profissionais haitianos para dominar design, branding e web — no seu ritmo.",
    back: "Voltar ao início", free: "Grátis", paid: "Pago", hours: "h", from: "A partir de",
    online: "Online", presential: "Presencial", hybrid: "Híbrido",
    beginner: "Iniciante", intermediate: "Intermediário", advanced: "Avançado",
    seats: "vagas", program: "Programa", enroll: "Inscrever-se", enrolled: "Inscrito",
    instructor: "Instrutor", empty: "Novos cursos em breve",
    emptyHint: "Volte logo — o catálogo cresce sempre.", starts: "Começa em",
    name: "Nome completo", email: "E-mail", whatsapp: "WhatsApp (opcional)",
    msg: "Mensagem (opcional)", msgPh: "Uma dúvida, um objetivo…",
    submit: "Confirmar inscrição", sending: "Enviando…",
    okFree: "Inscrição confirmada! Entraremos em contato com os acessos. 🎉",
    okPaid: "Inscrição recebida! Conclua o pagamento para reservar sua vaga.",
    payCta: "Ir para o pagamento", required: "Informe ao menos nome e e-mail.",
    error: "Algo deu errado. Tente novamente ou fale no WhatsApp.",
  },
  it: {
    eyebrow: "Spazio Formazione", title: "Impara il design con INOV",
    intro: "Corsi pratici tenuti da professionisti haitiani per padroneggiare design, branding e web — al tuo ritmo.",
    back: "Torna alla home", free: "Gratis", paid: "A pagamento", hours: "h", from: "Da",
    online: "Online", presential: "In presenza", hybrid: "Ibrido",
    beginner: "Principiante", intermediate: "Intermedio", advanced: "Avanzato",
    seats: "posti", program: "Programma", enroll: "Iscriviti", enrolled: "Iscritto",
    instructor: "Docente", empty: "Nuovi corsi in arrivo",
    emptyHint: "Torna presto — il catalogo cresce spesso.", starts: "Inizia il",
    name: "Nome completo", email: "E-mail", whatsapp: "WhatsApp (facoltativo)",
    msg: "Messaggio (facoltativo)", msgPh: "Una domanda, un obiettivo…",
    submit: "Conferma iscrizione", sending: "Invio…",
    okFree: "Iscrizione confermata! Ti contatteremo presto con gli accessi. 🎉",
    okPaid: "Iscrizione ricevuta! Completa il pagamento per riservare il posto.",
    payCta: "Vai al pagamento", required: "Inserisci almeno nome ed e-mail.",
    error: "Qualcosa è andato storto. Riprova o scrivici su WhatsApp.",
  },
  de: {
    eyebrow: "Weiterbildung", title: "Lerne Design mit INOV",
    intro: "Praxisnahe Kurse von haitianischen Profis, um Design, Branding und Web zu meistern — in deinem Tempo.",
    back: "Zur Startseite", free: "Kostenlos", paid: "Kostenpflichtig", hours: "Std.", from: "Ab",
    online: "Online", presential: "Vor Ort", hybrid: "Hybrid",
    beginner: "Anfänger", intermediate: "Mittelstufe", advanced: "Fortgeschritten",
    seats: "Plätze", program: "Lehrplan", enroll: "Anmelden", enrolled: "Angemeldet",
    instructor: "Dozent", empty: "Bald neue Kurse",
    emptyHint: "Schau bald wieder vorbei — der Katalog wächst stetig.", starts: "Beginnt am",
    name: "Vollständiger Name", email: "E-Mail", whatsapp: "WhatsApp (optional)",
    msg: "Nachricht (optional)", msgPh: "Eine Frage, ein Lernziel…",
    submit: "Anmeldung bestätigen", sending: "Senden…",
    okFree: "Angemeldet! Wir melden uns bald mit den Zugängen. 🎉",
    okPaid: "Anmeldung erhalten! Schließe die Zahlung ab, um deinen Platz zu sichern.",
    payCta: "Zur Zahlung", required: "Bitte mindestens Name und E-Mail angeben.",
    error: "Etwas ist schiefgelaufen. Versuche es erneut oder schreib uns per WhatsApp.",
  },
  ar: {
    eyebrow: "مساحة التدريب", title: "تعلّم التصميم مع INOV",
    intro: "دورات عملية يقدّمها محترفون هايتيون لإتقان التصميم والهوية والويب — على وتيرتك.",
    back: "العودة للرئيسية", free: "مجاني", paid: "مدفوع", hours: "س", from: "ابتداءً من",
    online: "عن بُعد", presential: "حضوري", hybrid: "مختلط",
    beginner: "مبتدئ", intermediate: "متوسط", advanced: "متقدّم",
    seats: "مقاعد", program: "المنهج", enroll: "سجّل", enrolled: "مسجّل",
    instructor: "المدرّب", empty: "دورات جديدة قريباً",
    emptyHint: "عُد قريباً — الكتالوج يتوسّع باستمرار.", starts: "يبدأ في",
    name: "الاسم الكامل", email: "البريد", whatsapp: "واتساب (اختياري)",
    msg: "رسالة (اختياري)", msgPh: "سؤال أو هدف تعليمي…",
    submit: "تأكيد التسجيل", sending: "جارٍ الإرسال…",
    okFree: "تم التسجيل! سنتواصل معك قريباً بالوصول. 🎉",
    okPaid: "تم استلام تسجيلك! أكمل الدفع لحجز مقعدك.",
    payCta: "المتابعة للدفع", required: "أضف اسمك وبريدك على الأقل.",
    error: "حدث خطأ. حاول مجدداً أو راسلنا على واتساب.",
  },
}

const card: React.CSSProperties = {
  background: "var(--ds-bg-card)", border: "1px solid var(--ds-border)",
  borderRadius: "var(--r-xl)", overflow: "hidden", display: "flex", flexDirection: "column",
}
const badge: React.CSSProperties = {
  display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 10px",
  borderRadius: "var(--r-full)", fontSize: 12, fontWeight: 700, fontFamily: "'Outfit', sans-serif",
}
const inputStyle: React.CSSProperties = {
  width: "100%", padding: "12px 14px", borderRadius: "var(--r-md)",
  border: "1px solid var(--ds-border)", background: "var(--ds-bg)",
  color: "var(--ds-text)", fontSize: 15, fontFamily: "'Outfit', sans-serif",
}

export default function Formation() {
  const { lang, fmt, currency, region } = useSettings()
  const s = TR[lang] ?? TR.fr
  const [courses, setCourses] = useState<Course[] | null>(null)
  const [active, setActive] = useState<Course | null>(null)

  useEffect(() => {
    applyPageMeta({ title: `${s.title} — INOV Digital Services`, description: s.intro, type: "website" })
    track("view_formation")
    window.scrollTo(0, 0)
    api.listFormations().then((r) => setCourses(r.formations)).catch(() => setCourses([]))
  }, [s.title, s.intro])

  const fmtLabel = (f: Course["format"]) => f === "presentiel" ? s.presential : f === "hybride" ? s.hybrid : s.online
  const fmtIcon = (f: Course["format"]) => f === "presentiel" ? <MapPin size={13} /> : <Wifi size={13} />
  const lvlLabel = (l: Course["level"]) => l === "avance" ? s.advanced : l === "intermediaire" ? s.intermediate : s.beginner

  return (
    <section style={{ background: "var(--ds-bg-sec)", padding: "64px 0 96px", minHeight: "70vh" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 var(--section-px)" }}>
        <Link to="/" style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "var(--ds-text-muted)", fontSize: 14, fontFamily: "'Outfit', sans-serif", textDecoration: "none", marginBottom: 28 }}>
          <ArrowLeft size={16} /> {s.back}
        </Link>

        <div style={{ maxWidth: 720, marginBottom: 44 }}>
          <span style={{ ...badge, background: "var(--ds-accent-a12)", color: "var(--ds-accent)", marginBottom: 16 }}>
            <GraduationCap size={14} /> {s.eyebrow}
          </span>
          <h1 style={{ fontFamily: "'Outfit', sans-serif", fontSize: "clamp(30px, 5vw, 46px)", fontWeight: 800, lineHeight: 1.08, color: "var(--ds-text)", margin: "0 0 14px", letterSpacing: "-0.02em" }}>
            {s.title}
          </h1>
          <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: 17, lineHeight: 1.6, color: "var(--ds-text-muted)", margin: 0 }}>
            {s.intro}
          </p>
        </div>

        {courses === null ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 22 }}>
            {[0, 1, 2].map((i) => (
              <div key={i} style={{ ...card, height: 340, opacity: 0.5, background: "var(--ds-bg-card-hover)" }} />
            ))}
          </div>
        ) : courses.length === 0 ? (
          <div style={{ ...card, padding: "56px 24px", textAlign: "center", alignItems: "center" }}>
            <Sparkles size={30} style={{ color: "var(--ds-accent)", marginBottom: 12 }} />
            <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: 19, fontWeight: 700, color: "var(--ds-text)", margin: "0 0 6px" }}>{s.empty}</p>
            <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: 15, color: "var(--ds-text-muted)", margin: 0 }}>{s.emptyHint}</p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 22 }}>
            {courses.map((c) => (
              <article key={c.id} style={card}>
                {c.image && (
                  <div style={{ aspectRatio: "16/9", overflow: "hidden", background: "var(--ds-bg-card-hover)" }}>
                    <img src={c.image} alt={c.title} loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>
                )}
                <div style={{ padding: 20, display: "flex", flexDirection: "column", flex: 1 }}>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
                    <span style={{ ...badge, background: c.free ? "var(--ds-success-a12, rgba(22,163,74,0.12))" : "var(--ds-accent-a12)", color: c.free ? "var(--ds-success)" : "var(--ds-accent)" }}>
                      <BadgeCheck size={13} /> {c.free ? s.free : s.paid}
                    </span>
                    <span style={{ ...badge, background: "var(--ds-bg-card-hover)", color: "var(--ds-text-muted)" }}>{lvlLabel(c.level)}</span>
                  </div>
                  <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 20, fontWeight: 800, color: "var(--ds-text)", margin: "0 0 8px", lineHeight: 1.2 }}>{c.title}</h2>
                  <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: 14.5, lineHeight: 1.55, color: "var(--ds-text-muted)", margin: "0 0 16px", flex: 1 }}>{c.summary}</p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 14, fontSize: 13, color: "var(--ds-text-muted)", fontFamily: "'Outfit', sans-serif", marginBottom: 16 }}>
                    {c.durationHours > 0 && <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}><Clock size={13} /> {c.durationHours}{s.hours}</span>}
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>{fmtIcon(c.format)} {fmtLabel(c.format)}</span>
                    {c.seats ? <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}><Users size={13} /> {c.seats} {s.seats}</span> : null}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, borderTop: "1px solid var(--ds-border)", paddingTop: 16 }}>
                    <div style={{ fontFamily: "'Outfit', sans-serif" }}>
                      {c.free ? (
                        <span style={{ fontSize: 20, fontWeight: 800, color: "var(--ds-success)" }}>{s.free}</span>
                      ) : (
                        <span style={{ fontSize: 20, fontWeight: 800, color: "var(--ds-text)" }}>{fmt(c.price)}</span>
                      )}
                    </div>
                    <button className="btn-orange" onClick={() => { setActive(c); track("formation_open", { id: c.id }) }} style={{ display: "inline-flex", alignItems: "center", gap: 7, whiteSpace: "nowrap" }}>
                      <GraduationCap size={16} /> {s.enroll}
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {active && (
        <EnrollModal course={active} s={s} lang={lang} currency={currency} region={region} fmt={fmt}
          lvlLabel={lvlLabel} fmtLabel={fmtLabel} onClose={() => setActive(null)} />
      )}
    </section>
  )
}

function EnrollModal({
  course, s, lang, currency, region, fmt, lvlLabel, fmtLabel, onClose,
}: {
  course: Course; s: Str; lang: Lang; currency: string; region: string
  fmt: (usd: number) => string
  lvlLabel: (l: Course["level"]) => string; fmtLabel: (f: Course["format"]) => string
  onClose: () => void
}) {
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" })
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose() }
    document.addEventListener("keydown", onKey)
    document.body.style.overflow = "hidden"
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = "" }
  }, [onClose])

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    if (!form.name.trim() || !form.email.trim()) { setError(s.required); return }
    setBusy(true)
    try {
      await api.enrollFormation({
        formationId: course.id, name: form.name.trim(), email: form.email.trim(),
        phone: form.phone.trim(), message: form.message.trim(),
        lang, currency, region,
      })
      track("formation_enroll", { id: course.id, free: course.free })
      setDone(true)
    } catch {
      setError(s.error)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div role="dialog" aria-modal="true" aria-label={course.title}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
      style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)", display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "5vh 16px", overflow: "auto" }}>
      <div style={{ background: "var(--ds-bg-card)", border: "1px solid var(--ds-border)", borderRadius: "var(--r-xl)", maxWidth: 560, width: "100%", padding: 28, position: "relative" }}>
        <button onClick={onClose} aria-label="Fermer" style={{ position: "absolute", top: 16, insetInlineEnd: 16, background: "var(--ds-bg-card-hover)", border: "none", borderRadius: "var(--r-full)", width: 34, height: 34, display: "grid", placeItems: "center", cursor: "pointer", color: "var(--ds-text)" }}>
          <X size={18} />
        </button>

        {done ? (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <CheckCircle2 size={44} style={{ color: "var(--ds-success)", marginBottom: 14 }} />
            <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: 17, fontWeight: 700, color: "var(--ds-text)", lineHeight: 1.5, margin: "0 0 20px" }}>
              {course.free ? s.okFree : s.okPaid}
            </p>
            {!course.free && (
              <Link to="/paiement" className="btn-orange" style={{ display: "inline-flex", alignItems: "center", gap: 7 }} onClick={onClose}>
                {s.payCta}
              </Link>
            )}
          </div>
        ) : (
          <>
            <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 22, fontWeight: 800, color: "var(--ds-text)", margin: "0 8px 4px 0", lineHeight: 1.2 }}>{course.title}</h2>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 18, fontSize: 13, fontFamily: "'Outfit', sans-serif", color: "var(--ds-text-muted)" }}>
              <span style={{ ...badge, background: course.free ? "var(--ds-success-a12, rgba(22,163,74,0.12))" : "var(--ds-accent-a12)", color: course.free ? "var(--ds-success)" : "var(--ds-accent)" }}>
                {course.free ? s.free : fmt(course.price)}
              </span>
              <span style={{ ...badge, background: "var(--ds-bg-card-hover)", color: "var(--ds-text-muted)" }}>{lvlLabel(course.level)}</span>
              <span style={{ ...badge, background: "var(--ds-bg-card-hover)", color: "var(--ds-text-muted)" }}>{fmtLabel(course.format)}</span>
            </div>

            {course.description && (
              <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: 14.5, lineHeight: 1.6, color: "var(--ds-text-muted)", margin: "0 0 18px", whiteSpace: "pre-wrap" }}>{course.description}</p>
            )}

            {course.syllabus?.length > 0 && (
              <div style={{ marginBottom: 20 }}>
                <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: 13, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.04em", color: "var(--ds-text)", margin: "0 0 10px" }}>{s.program}</p>
                <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 8 }}>
                  {course.syllabus.map((m, i) => (
                    <li key={i} style={{ display: "flex", gap: 9, fontFamily: "'Outfit', sans-serif", fontSize: 14, color: "var(--ds-text-muted)" }}>
                      <CheckCircle2 size={16} style={{ color: "var(--ds-accent)", flexShrink: 0, marginTop: 2 }} /> {m}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {course.instructor && (
              <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: 13.5, color: "var(--ds-text-muted)", margin: "0 0 20px" }}>
                <strong style={{ color: "var(--ds-text)" }}>{s.instructor} :</strong> {course.instructor}
                {course.startDate ? ` · ${s.starts} ${course.startDate}` : ""}
              </p>
            )}

            <form onSubmit={submit} style={{ display: "grid", gap: 12 }}>
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
          </>
        )}
      </div>
    </div>
  )
}
