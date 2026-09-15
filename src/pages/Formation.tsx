import { useEffect, useMemo, useState } from "react"
import { Link } from "react-router"
import {
  ArrowLeft, GraduationCap, Clock, Wifi, MapPin, Users, CheckCircle2,
  Send, X, Sparkles, BadgeCheck, Radio, Mic2, PlayCircle, Download,
  CalendarPlus, ExternalLink, BookOpen,
} from "lucide-react"
import { useSettings } from "../context/AppSettings"
import type { Lang } from "../i18n/translations"
import { applyPageMeta } from "../lib/seo"
import { track } from "../lib/analytics"
import { api, type Formation as Course } from "../lib/api"
import ShareButtons from "../components/ShareButtons"

export type Str = {
  eyebrow: string; title: string; intro: string; back: string
  free: string; paid: string; hours: string; from: string
  online: string; presential: string; hybrid: string
  beginner: string; intermediate: string; advanced: string
  seats: string; program: string; enroll: string; enrolled: string
  instructor: string; empty: string; emptyHint: string; starts: string
  name: string; email: string; whatsapp: string; msg: string
  msgPh: string; submit: string; sending: string
  okFree: string; okPaid: string; payCta: string; required: string; error: string
  // types
  all: string; cours: string; live: string; conference: string; replay: string
  joinLive: string; watchReplay: string; downloadRes: string; addCalendar: string
  liveBadge: string; countdown: string; startsIn: string
  recordedOn: string; resources: string
}

export const TR: Record<Lang, Str> = {
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
    all: "Tout", cours: "Cours", live: "Lives", conference: "Conférences", replay: "Replays",
    joinLive: "Rejoindre le live", watchReplay: "Voir le replay", downloadRes: "Télécharger les ressources",
    addCalendar: "Ajouter au calendrier", liveBadge: "EN DIRECT", countdown: "Compte à rebours",
    startsIn: "Commence dans", recordedOn: "Enregistré le", resources: "Ressources",
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
    all: "All", cours: "Courses", live: "Lives", conference: "Conferences", replay: "Replays",
    joinLive: "Join the live", watchReplay: "Watch replay", downloadRes: "Download resources",
    addCalendar: "Add to calendar", liveBadge: "LIVE", countdown: "Countdown",
    startsIn: "Starts in", recordedOn: "Recorded on", resources: "Resources",
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
    all: "Todo", cours: "Cursos", live: "Lives", conference: "Conferencias", replay: "Replays",
    joinLive: "Unirse al live", watchReplay: "Ver replay", downloadRes: "Descargar recursos",
    addCalendar: "Añadir al calendario", liveBadge: "EN VIVO", countdown: "Cuenta atrás",
    startsIn: "Empieza en", recordedOn: "Grabado el", resources: "Recursos",
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
    all: "Tout", cours: "Kou", live: "Lives", conference: "Konferans", replay: "Replays",
    joinLive: "Rejwenn live a", watchReplay: "Gade replay a", downloadRes: "Telechaje resous yo",
    addCalendar: "Ajoute nan kalandriye", liveBadge: "AN DIRÈK", countdown: "Dekontwòl",
    startsIn: "Kòmanse nan", recordedOn: "Anrejistre", resources: "Resous",
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
    all: "Tudo", cours: "Cursos", live: "Lives", conference: "Conferências", replay: "Replays",
    joinLive: "Entrar no live", watchReplay: "Assistir replay", downloadRes: "Baixar recursos",
    addCalendar: "Adicionar ao calendário", liveBadge: "AO VIVO", countdown: "Contagem regressiva",
    startsIn: "Começa em", recordedOn: "Gravado em", resources: "Recursos",
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
    all: "Tutto", cours: "Corsi", live: "Live", conference: "Conferenze", replay: "Replay",
    joinLive: "Entra nel live", watchReplay: "Guarda il replay", downloadRes: "Scarica risorse",
    addCalendar: "Aggiungi al calendario", liveBadge: "IN DIRETTA", countdown: "Conto alla rovescia",
    startsIn: "Inizia tra", recordedOn: "Registrato il", resources: "Risorse",
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
    all: "Alle", cours: "Kurse", live: "Lives", conference: "Konferenzen", replay: "Replays",
    joinLive: "Live beitreten", watchReplay: "Replay ansehen", downloadRes: "Ressourcen herunterladen",
    addCalendar: "Zum Kalender hinzufügen", liveBadge: "LIVE", countdown: "Countdown",
    startsIn: "Beginnt in", recordedOn: "Aufgezeichnet am", resources: "Ressourcen",
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
    all: "الكل", cours: "دورات", live: "بث مباشر", conference: "مؤتمرات", replay: "إعادة",
    joinLive: "انضم للبث", watchReplay: "شاهد الإعادة", downloadRes: "تحميل الموارد",
    addCalendar: "أضف للتقويم", liveBadge: "مباشر", countdown: "عدّ تنازلي",
    startsIn: "يبدأ خلال", recordedOn: "سُجِّل في", resources: "الموارد",
  },
}

type CourseType = "all" | "cours" | "live" | "conference" | "replay"

const card: React.CSSProperties = {
  background: "var(--ds-bg-card)", border: "1px solid var(--ds-border)",
  borderRadius: "var(--r-xl)", overflow: "hidden", display: "flex", flexDirection: "column",
}
export const badge: React.CSSProperties = {
  display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 10px",
  borderRadius: "var(--r-full)", fontSize: 12, fontWeight: 700, fontFamily: "'Outfit', sans-serif",
}
export const inputStyle: React.CSSProperties = {
  width: "100%", padding: "12px 14px", borderRadius: "var(--r-md)",
  border: "1px solid var(--ds-border)", background: "var(--ds-bg)",
  color: "var(--ds-text)", fontSize: 15, fontFamily: "'Outfit', sans-serif",
}

/** Format a duration until a future ISO date as "Xh Ym" or "Xm Ys". */
export function useCountdown(isoDate?: string) {
  const [diff, setDiff] = useState<number | null>(null)
  useEffect(() => {
    if (!isoDate) return
    function tick() {
      const ms = new Date(isoDate!).getTime() - Date.now()
      setDiff(ms > 0 ? ms : 0)
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [isoDate])
  if (diff === null || !isoDate) return null
  if (diff <= 0) return "0m"
  const totalSec = Math.floor(diff / 1000)
  const h = Math.floor(totalSec / 3600)
  const m = Math.floor((totalSec % 3600) / 60)
  const s = totalSec % 60
  if (h > 0) return `${h}h ${m}m`
  if (m > 0) return `${m}m ${s}s`
  return `${s}s`
}

/** Determine if a session is within the next 24 hours. */
export function isWithin24h(isoDate?: string) {
  if (!isoDate) return false
  const ms = new Date(isoDate).getTime() - Date.now()
  return ms > 0 && ms < 86_400_000
}

/** Build a Google Calendar add-event URL. */
export function gcalUrl(c: Course) {
  const start = c.startDateTime ? new Date(c.startDateTime).toISOString().replace(/[-:]/g, "").split(".")[0] + "Z" : ""
  const end = c.endDateTime ? new Date(c.endDateTime).toISOString().replace(/[-:]/g, "").split(".")[0] + "Z" :
    c.startDateTime ? new Date(new Date(c.startDateTime).getTime() + 60 * 60 * 1000).toISOString().replace(/[-:]/g, "").split(".")[0] + "Z" : ""
  if (!start) return ""
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: c.title,
    details: c.summary,
    dates: `${start}/${end}`,
    location: c.liveUrl || "",
  })
  return `https://calendar.google.com/calendar/render?${params.toString()}`
}

/** Detect YouTube URL and return an embeddable src. */
export function toYoutubeEmbed(url: string) {
  const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([A-Za-z0-9_-]+)/)
  if (m) return `https://www.youtube.com/embed/${m[1]}`
  return url
}

/** Type icon mapping */
export function TypeIcon({ type }: { type?: Course["type"] }) {
  if (type === "live") return <Radio size={13} />
  if (type === "conference") return <Mic2 size={13} />
  if (type === "replay") return <PlayCircle size={13} />
  return <BookOpen size={13} />
}

export function typeColor(type?: Course["type"]) {
  if (type === "live") return { bg: "rgba(220,38,38,0.12)", color: "#DC2626" }
  if (type === "conference") return { bg: "rgba(109,40,217,0.12)", color: "#7C3AED" }
  if (type === "replay") return { bg: "rgba(14,165,233,0.12)", color: "#0EA5E9" }
  return { bg: "var(--ds-accent-a12)", color: "var(--ds-accent)" }
}

function LiveBadge({ label }: { label: string }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: "3px 10px", borderRadius: "var(--r-full)",
      background: "#DC2626", color: "#fff", fontSize: 11, fontWeight: 800,
      fontFamily: "'Outfit', sans-serif", letterSpacing: "0.06em",
      animation: "livePulse 1.6s ease-in-out infinite",
    }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#fff", display: "inline-block" }} />
      {label}
    </span>
  )
}

export default function Formation() {
  const { lang, fmt, currency, region } = useSettings()
  const s = TR[lang] ?? TR.fr
  const [courses, setCourses] = useState<Course[] | null>(null)
  const [active, setActive] = useState<Course | null>(null)
  const [filter, setFilter] = useState<CourseType>("all")

  useEffect(() => {
    applyPageMeta({ title: `${s.title} — INOV Digital Services`, description: s.intro, type: "website" })
    track("view_formation")
    window.scrollTo(0, 0)
    api.listFormations().then((r) => setCourses(r.formations)).catch(() => setCourses([]))
  }, [s.title, s.intro])

  const filtered = useMemo(() => {
    if (!courses) return null
    if (filter === "all") return courses
    return courses.filter((c) => (c.type ?? "cours") === filter)
  }, [courses, filter])

  const counts = useMemo(() => {
    if (!courses) return {} as Record<CourseType, number>
    return {
      all: courses.length,
      cours: courses.filter((c) => (c.type ?? "cours") === "cours").length,
      live: courses.filter((c) => c.type === "live").length,
      conference: courses.filter((c) => c.type === "conference").length,
      replay: courses.filter((c) => c.type === "replay").length,
    }
  }, [courses])

  const fmtLabel = (f: Course["format"]) => f === "presentiel" ? s.presential : f === "hybride" ? s.hybrid : s.online
  const fmtIcon = (f: Course["format"]) => f === "presentiel" ? <MapPin size={13} /> : <Wifi size={13} />
  const lvlLabel = (l: Course["level"]) => l === "avance" ? s.advanced : l === "intermediaire" ? s.intermediate : s.beginner

  const FILTERS: { key: CourseType; label: string; icon: React.ReactNode }[] = [
    { key: "all", label: s.all, icon: <Sparkles size={14} /> },
    { key: "cours", label: s.cours, icon: <BookOpen size={14} /> },
    { key: "live", label: s.live, icon: <Radio size={14} /> },
    { key: "conference", label: s.conference, icon: <Mic2 size={14} /> },
    { key: "replay", label: s.replay, icon: <PlayCircle size={14} /> },
  ]

  return (
    <section style={{ background: "var(--ds-bg-sec)", padding: "64px 0 96px", minHeight: "70vh" }}>
      <style>{`
        @keyframes livePulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        .formation-filter-btn { transition: background 0.15s, color 0.15s, box-shadow 0.15s; }
        .formation-filter-btn:hover { background: var(--ds-accent-a12) !important; color: var(--ds-accent) !important; }
      `}</style>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 var(--section-px)" }}>
        <Link to="/" style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "var(--ds-text-muted)", fontSize: 14, fontFamily: "'Outfit', sans-serif", textDecoration: "none", marginBottom: 28 }}>
          <ArrowLeft size={16} /> {s.back}
        </Link>

        <div style={{ maxWidth: 720, marginBottom: 36 }}>
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

        {/* Type filters */}
        {courses && courses.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 28 }}>
            {FILTERS.map(({ key, label, icon }) => {
              const isActive = filter === key
              const count = counts[key] ?? 0
              return (
                <button key={key} className="formation-filter-btn" onClick={() => setFilter(key)}
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 6,
                    padding: "8px 14px", borderRadius: "var(--r-full)", cursor: "pointer",
                    fontFamily: "'Outfit', sans-serif", fontSize: 13.5, fontWeight: 700,
                    border: isActive ? "1.5px solid var(--ds-accent)" : "1.5px solid var(--ds-border)",
                    background: isActive ? "var(--ds-accent-a12)" : "var(--ds-bg-card)",
                    color: isActive ? "var(--ds-accent)" : "var(--ds-text-muted)",
                    boxShadow: isActive ? "0 0 0 1px var(--ds-accent)" : "none",
                  }}>
                  {icon} {label}
                  {count > 0 && (
                    <span style={{ marginLeft: 2, fontFamily: "'Space Mono', monospace", fontSize: 11, fontWeight: 800, background: isActive ? "var(--ds-accent)" : "var(--ds-bg-sec)", color: isActive ? "#fff" : "var(--ds-text-faint)", borderRadius: "var(--r-full)", padding: "1px 7px" }}>
                      {count}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        )}

        {filtered === null ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 22 }}>
            {[0, 1, 2].map((i) => (
              <div key={i} style={{ ...card, height: 340, opacity: 0.5, background: "var(--ds-bg-card-hover)" }} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ ...card, padding: "56px 24px", textAlign: "center", alignItems: "center" }}>
            <Sparkles size={30} style={{ color: "var(--ds-accent)", marginBottom: 12 }} />
            <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: 19, fontWeight: 700, color: "var(--ds-text)", margin: "0 0 6px" }}>{s.empty}</p>
            <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: 15, color: "var(--ds-text-muted)", margin: 0 }}>{s.emptyHint}</p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 22 }}>
            {filtered.map((c) => (
              <CourseCard key={c.id} c={c} s={s} fmt={fmt} lang={lang} lvlLabel={lvlLabel} fmtLabel={fmtLabel} fmtIcon={fmtIcon}
                onEnroll={() => { setActive(c); track("formation_open", { id: c.id }) }} />
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

// ── Course Card ────────────────────────────────────────────────────────────────
function CourseCard({ c, s, fmt, lang, lvlLabel, fmtLabel, fmtIcon, onEnroll }: {
  c: Course; s: Str; fmt: (n: number) => string; lang: string
  lvlLabel: (l: Course["level"]) => string; fmtLabel: (f: Course["format"]) => string
  fmtIcon: (f: Course["format"]) => React.ReactNode
  onEnroll: () => void
}) {
  const { bg, color } = typeColor(c.type)
  const within24h = isWithin24h(c.startDateTime)
  const countdown = useCountdown(within24h ? c.startDateTime : undefined)
  const isLiveNow = c.isLive === true

  // For replay cards, extract a YouTube thumbnail if possible.
  const ytThumb = useMemo(() => {
    if (c.type !== "replay" || !c.replayUrl) return null
    const m = c.replayUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([A-Za-z0-9_-]+)/)
    return m ? `https://img.youtube.com/vi/${m[1]}/hqdefault.jpg` : null
  }, [c.type, c.replayUrl])

  const cover = c.image || (c.type === "replay" ? ytThumb : null)

  return (
    <article style={{ background: "var(--ds-bg-card)", border: "1px solid var(--ds-border)", borderRadius: "var(--r-xl)", overflow: "hidden", display: "flex", flexDirection: "column" }}>
      {cover && (
        <div style={{ aspectRatio: "16/9", overflow: "hidden", background: "var(--ds-bg-card-hover)", position: "relative" }}>
          <img src={cover} alt={c.title} loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          {(c.type === "replay") && (
            <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", background: "rgba(0,0,0,0.3)" }}>
              <PlayCircle size={44} style={{ color: "#fff", filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.5))" }} />
            </div>
          )}
          {isLiveNow && (
            <div style={{ position: "absolute", top: 10, left: 10 }}>
              <LiveBadge label={s.liveBadge} />
            </div>
          )}
        </div>
      )}
      <div style={{ padding: 20, display: "flex", flexDirection: "column", flex: 1 }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 10px", borderRadius: "var(--r-full)", fontSize: 12, fontWeight: 700, fontFamily: "'Outfit', sans-serif", background: bg, color }}>
            <TypeIcon type={c.type} />
            {c.type === "live" ? s.live : c.type === "conference" ? s.conference : c.type === "replay" ? s.replay : s.cours}
          </span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 10px", borderRadius: "var(--r-full)", fontSize: 12, fontWeight: 700, fontFamily: "'Outfit', sans-serif", background: c.free ? "rgba(22,163,74,0.12)" : "var(--ds-accent-a12)", color: c.free ? "#16A34A" : "var(--ds-accent)" }}>
            <BadgeCheck size={13} /> {c.free ? s.free : s.paid}
          </span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 10px", borderRadius: "var(--r-full)", fontSize: 12, fontWeight: 700, fontFamily: "'Outfit', sans-serif", background: "var(--ds-bg-card-hover)", color: "var(--ds-text-muted)" }}>
            {lvlLabel(c.level)}
          </span>
        </div>

        <h2 style={{ fontSize: 20, fontWeight: 800, margin: "0 0 8px", lineHeight: 1.2 }}>
          <Link to={`/formation/${c.slug ?? c.id}`} style={{ fontFamily: "'Outfit', sans-serif", color: "var(--ds-text)", textDecoration: "none" }}>
            {c.title}
          </Link>
        </h2>
        <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: 14.5, lineHeight: 1.55, color: "var(--ds-text-muted)", margin: "0 0 16px", flex: 1 }}>{c.summary}</p>

        {/* Countdown for upcoming lives within 24h */}
        {within24h && countdown && !isLiveNow && (
          <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 12, padding: "8px 12px", borderRadius: "var(--r-md)", background: "rgba(220,38,38,0.08)", border: "1px solid rgba(220,38,38,0.2)" }}>
            <Clock size={14} style={{ color: "#DC2626", flexShrink: 0 }} />
            <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 13, fontWeight: 700, color: "#DC2626" }}>
              {s.startsIn} {countdown}
            </span>
          </div>
        )}

        <div style={{ display: "flex", flexWrap: "wrap", gap: 14, fontSize: 13, color: "var(--ds-text-muted)", fontFamily: "'Outfit', sans-serif", marginBottom: 16 }}>
          {c.durationHours > 0 && <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}><Clock size={13} /> {c.durationHours}{s.hours}</span>}
          <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>{fmtIcon(c.format)} {fmtLabel(c.format)}</span>
          {c.seats ? <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}><Users size={13} /> {c.seats} {s.seats}</span> : null}
          {c.startDateTime && !isLiveNow && (
            <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
              <CalendarPlus size={13} />
              {new Date(c.startDateTime).toLocaleDateString(lang === "ar" ? "ar" : lang, { day: "numeric", month: "short" })}
            </span>
          )}
          {c.recordingDate && c.type === "replay" && (
            <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
              <PlayCircle size={13} /> {s.recordedOn} {new Date(c.recordingDate).toLocaleDateString()}
            </span>
          )}
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, borderTop: "1px solid var(--ds-border)", paddingTop: 16, flexWrap: "wrap" }}>
          <div style={{ fontFamily: "'Outfit', sans-serif" }}>
            {c.free ? (
              <span style={{ fontSize: 20, fontWeight: 800, color: "#16A34A" }}>{s.free}</span>
            ) : (
              <span style={{ fontSize: 20, fontWeight: 800, color: "var(--ds-text)" }}>{fmt(c.price)}</span>
            )}
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {/* Direct action for replay */}
            {c.type === "replay" && c.replayUrl && (
              <a href={toYoutubeEmbed(c.replayUrl).replace("/embed/", "/watch?v=")} target="_blank" rel="noopener noreferrer"
                style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "9px 14px", borderRadius: "var(--r-md)", background: "rgba(14,165,233,0.12)", color: "#0EA5E9", fontFamily: "'Outfit', sans-serif", fontSize: 13.5, fontWeight: 700, textDecoration: "none", whiteSpace: "nowrap" }}>
                <PlayCircle size={15} /> {s.watchReplay}
              </a>
            )}
            {/* Direct join for live/conference now */}
            {(c.type === "live" || c.type === "conference") && c.liveUrl && isLiveNow && (
              <a href={c.liveUrl} target="_blank" rel="noopener noreferrer"
                style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "9px 14px", borderRadius: "var(--r-md)", background: "#DC2626", color: "#fff", fontFamily: "'Outfit', sans-serif", fontSize: 13.5, fontWeight: 700, textDecoration: "none", whiteSpace: "nowrap" }}>
                <Radio size={15} /> {s.joinLive}
              </a>
            )}
            <button className="btn-orange" onClick={onEnroll} style={{ display: "inline-flex", alignItems: "center", gap: 7, whiteSpace: "nowrap" }}>
              <GraduationCap size={16} /> {s.enroll}
            </button>
          </div>
        </div>

        {/* Shareable link + social share for this specific formation */}
        <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid var(--ds-border)" }}>
          <ShareButtons url={`${window.location.origin}/formation/${c.slug ?? c.id}`} title={c.title} compact />
        </div>
      </div>
    </article>
  )
}

// ── Enroll Modal ───────────────────────────────────────────────────────────────
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
  const { bg, color } = typeColor(course.type)
  const calUrl = gcalUrl(course)
  const within24h = isWithin24h(course.startDateTime)
  const countdown = useCountdown(within24h ? course.startDateTime : undefined)

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
      <div style={{ background: "var(--ds-bg-card)", border: "1px solid var(--ds-border)", borderRadius: "var(--r-xl)", maxWidth: 580, width: "100%", padding: 28, position: "relative" }}>
        <button onClick={onClose} aria-label="Fermer" style={{ position: "absolute", top: 16, insetInlineEnd: 16, background: "var(--ds-bg-card-hover)", border: "none", borderRadius: "var(--r-full)", width: 34, height: 34, display: "grid", placeItems: "center", cursor: "pointer", color: "var(--ds-text)" }}>
          <X size={18} />
        </button>

        {done ? (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <CheckCircle2 size={44} style={{ color: "var(--ds-success)", marginBottom: 14 }} />
            <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: 17, fontWeight: 700, color: "var(--ds-text)", lineHeight: 1.5, margin: "0 0 20px" }}>
              {course.free ? s.okFree : s.okPaid}
            </p>
            {/* Post-enrollment actions */}
            <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
              {(course.type === "live" || course.type === "conference") && course.liveUrl && (
                <a href={course.liveUrl} target="_blank" rel="noopener noreferrer"
                  style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "10px 16px", borderRadius: "var(--r-md)", background: "#DC2626", color: "#fff", fontFamily: "'Outfit', sans-serif", fontSize: 14, fontWeight: 700, textDecoration: "none" }}>
                  <ExternalLink size={15} /> {s.joinLive}
                </a>
              )}
              {calUrl && (course.type === "live" || course.type === "conference") && (
                <a href={calUrl} target="_blank" rel="noopener noreferrer"
                  style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "10px 16px", borderRadius: "var(--r-md)", background: "var(--ds-bg-sec)", border: "1px solid var(--ds-border)", color: "var(--ds-text)", fontFamily: "'Outfit', sans-serif", fontSize: 14, fontWeight: 700, textDecoration: "none" }}>
                  <CalendarPlus size={15} /> {s.addCalendar}
                </a>
              )}
              {course.type === "replay" && course.replayUrl && (
                <a href={course.replayUrl} target="_blank" rel="noopener noreferrer"
                  style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "10px 16px", borderRadius: "var(--r-md)", background: "rgba(14,165,233,0.12)", color: "#0EA5E9", fontFamily: "'Outfit', sans-serif", fontSize: 14, fontWeight: 700, textDecoration: "none" }}>
                  <PlayCircle size={15} /> {s.watchReplay}
                </a>
              )}
              {course.resourcesUrl && (
                <a href={course.resourcesUrl} target="_blank" rel="noopener noreferrer"
                  style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "10px 16px", borderRadius: "var(--r-md)", background: "var(--ds-bg-sec)", border: "1px solid var(--ds-border)", color: "var(--ds-text)", fontFamily: "'Outfit', sans-serif", fontSize: 14, fontWeight: 700, textDecoration: "none" }}>
                  <Download size={15} /> {s.downloadRes}
                </a>
              )}
              {!course.free && (
                <Link to="/paiement" className="btn-orange" style={{ display: "inline-flex", alignItems: "center", gap: 7 }} onClick={onClose}>
                  {s.payCta}
                </Link>
              )}
            </div>

            {/* Inline replay embed after enrollment */}
            {course.type === "replay" && course.replayUrl && (
              <div style={{ marginTop: 22, borderRadius: "var(--r-lg)", overflow: "hidden", aspectRatio: "16/9" }}>
                <iframe
                  src={toYoutubeEmbed(course.replayUrl)}
                  title={course.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  style={{ width: "100%", height: "100%", border: "none" }}
                />
              </div>
            )}
          </div>
        ) : (
          <>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 18 }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginBottom: 8 }}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 9px", borderRadius: "var(--r-full)", fontSize: 12, fontWeight: 700, fontFamily: "'Outfit', sans-serif", background: bg, color }}>
                    <TypeIcon type={course.type} />
                    {course.type === "live" ? s.live : course.type === "conference" ? s.conference : course.type === "replay" ? s.replay : s.cours}
                  </span>
                  {course.free ? (
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 9px", borderRadius: "var(--r-full)", fontSize: 12, fontWeight: 700, fontFamily: "'Outfit', sans-serif", background: "rgba(22,163,74,0.12)", color: "#16A34A" }}>
                      {s.free}
                    </span>
                  ) : (
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 9px", borderRadius: "var(--r-full)", fontSize: 12, fontWeight: 700, fontFamily: "'Outfit', sans-serif", background: "var(--ds-accent-a12)", color: "var(--ds-accent)" }}>
                      {fmt(course.price)}
                    </span>
                  )}
                  {lvlLabel(course.level) && (
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 9px", borderRadius: "var(--r-full)", fontSize: 12, fontWeight: 700, fontFamily: "'Outfit', sans-serif", background: "var(--ds-bg-card-hover)", color: "var(--ds-text-muted)" }}>
                      {lvlLabel(course.level)}
                    </span>
                  )}
                </div>
                <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 22, fontWeight: 800, color: "var(--ds-text)", margin: "0 0 4px", lineHeight: 1.2 }}>{course.title}</h2>
              </div>
            </div>

            {/* Countdown if upcoming */}
            {within24h && countdown && !course.isLive && (
              <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 14, padding: "8px 12px", borderRadius: "var(--r-md)", background: "rgba(220,38,38,0.08)", border: "1px solid rgba(220,38,38,0.2)" }}>
                <Clock size={14} style={{ color: "#DC2626", flexShrink: 0 }} />
                <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 13, fontWeight: 700, color: "#DC2626" }}>
                  {s.startsIn} {countdown}
                </span>
              </div>
            )}

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

            {/* Resources link before form */}
            {course.resourcesUrl && (
              <a href={course.resourcesUrl} target="_blank" rel="noopener noreferrer"
                style={{ display: "inline-flex", alignItems: "center", gap: 7, marginBottom: 20, padding: "9px 14px", borderRadius: "var(--r-md)", background: "var(--ds-bg-sec)", border: "1px solid var(--ds-border)", color: "var(--ds-text)", fontFamily: "'Outfit', sans-serif", fontSize: 13.5, fontWeight: 700, textDecoration: "none" }}>
                <Download size={14} /> {s.downloadRes}
              </a>
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
