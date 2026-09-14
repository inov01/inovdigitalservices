import { useEffect, useState } from "react"
import { Star, ArrowUpRight, Quote, PenSquare, X, Check } from "lucide-react"
import AutoCarousel from "./AutoCarousel"
import { testimonials, type Testimonial } from "../data/services"
import { albums } from "../data/portfolio"
import { useSettings } from "../context/AppSettings"
import { api, type PublicTestimonial } from "../lib/api"

// Map each testimonial's portfolio id → the company (client) name.
const COMPANY_MAP: Record<string, string> = Object.fromEntries(albums.map((a) => [a.id, a.client]))

// Client logo imports — one per portfolio album referenced in testimonials
import logoRosie   from "../imports/Rosie_logo.webp"
import logoPhysio  from "../imports/2.webp"
import logoParrots from "../imports/1_jpg.webp"
import logoRalines from "../imports/1-2.webp"
import logoMKB     from "../imports/5.webp"
import logoTdc     from "../imports/1-4_jpg.webp"

const LOGO_MAP: Record<string, { logo: string; logoBg: string; logoFit: "contain" | "cover" }> = {
  "rosie":              { logo: logoRosie,   logoBg: "#fff5f5", logoFit: "contain" },
  "physio":             { logo: logoPhysio,  logoBg: "#f0f8ff", logoFit: "contain" },
  "parrots":            { logo: logoParrots, logoBg: "#efe9e0", logoFit: "cover"   },
  "ralines-cosmetics":  { logo: logoRalines, logoBg: "#fdf3f8", logoFit: "contain" },
  "moni-k-boutik":      { logo: logoMKB,     logoBg: "#f0faf0", logoFit: "contain" },
  "the-doctor-company": { logo: logoTdc,     logoBg: "#f2f6fb", logoFit: "contain" },
}

type FullTestimonial = Testimonial & { company: string }

function enriched(t: typeof testimonials[0]): FullTestimonial {
  const m = LOGO_MAP[t.portfolioId] ?? { logo: "", logoBg: "#f6f6f9", logoFit: "contain" as const }
  const company = COMPANY_MAP[t.portfolioId] ?? t.name
  return { ...t, ...m, company }
}

function TestimonialCard({ t, role, text }: { t: FullTestimonial; role: string; text: string }) {
  const { logo, logoFit } = t
  const initials = t.company.split(" ").filter(Boolean).slice(0, 2).map((w) => w.charAt(0)).join("")

  return (
    <a
      className="card testimonial-card"
      href="#portfolio"
      aria-label={`Voir le projet ${t.company}`}
      onClick={(e) => {
        e.preventDefault()
        const el = document.getElementById("portfolio")
        if (el) el.scrollIntoView({ behavior: "smooth" })
      }}
      style={{
        padding: 30,
        height: "100%",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        textDecoration: "none",
        position: "relative",
      }}
    >
      {/* Decorative quote mark */}
      <Quote
        size={40}
        aria-hidden="true"
        style={{ color: "var(--ds-accent)", opacity: 0.16, marginBottom: 6, flexShrink: 0 }}
        fill="var(--ds-accent)"
        strokeWidth={0}
      />

      {/* Quote text — natural, unquoted, not italic */}
      <p
        style={{
          fontFamily: "'Outfit', sans-serif",
          fontSize: 15.5,
          color: "var(--ds-text)",
          lineHeight: 1.75,
          flex: 1,
          margin: "0 0 22px",
          letterSpacing: "-0.005em",
        }}
      >
        {text}
      </p>

      {/* Stars */}
      <div style={{ marginBottom: 18, display: "flex", gap: 3 }}>
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            size={15}
            color="var(--ds-accent)"
            fill={i < t.stars ? "var(--ds-accent)" : "none"}
            strokeWidth={i < t.stars ? 0 : 1.5}
            style={{ opacity: i < t.stars ? 1 : 0.35 }}
          />
        ))}
      </div>

      {/* Client identity — person-led, uniform avatar treatment */}
      <div style={{ display: "flex", alignItems: "center", gap: 13, borderTop: "1px solid var(--ds-border)", paddingTop: 18 }}>
        {/* Avatar: brand logo on a uniform neutral ground for visual coherence */}
        <div
          style={{
            width: 46,
            height: 46,
            borderRadius: "50%",
            flexShrink: 0,
            background: "var(--ds-bg-sec)",
            border: "1px solid var(--ds-border)",
            overflow: "hidden",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {logo ? (
            <img
              src={logo}
              alt=""
              aria-hidden="true"
              loading="lazy"
              decoding="async"
              style={{ width: "100%", height: "100%", objectFit: logoFit }}
            />
          ) : (
            <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 16, fontWeight: 700, color: "var(--ds-accent)" }}>
              {initials}
            </span>
          )}
        </div>

        {/* Name (person) + role */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontFamily: "'Outfit', sans-serif",
              fontSize: 14.5,
              fontWeight: 700,
              color: "var(--ds-text)",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {t.company}
          </div>
          <div
            style={{
              fontFamily: "'Outfit', sans-serif",
              fontSize: 12.5,
              color: "var(--ds-text-muted)",
              marginTop: 2,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {role}
          </div>
        </div>

        {/* Subtle affordance toward the project */}
        <ArrowUpRight size={17} color="var(--ds-text-faint)" style={{ flexShrink: 0 }} className="testimonial-arrow" />
      </div>
    </a>
  )
}

// Client-review form + card copy, per language.
const RUI: Record<string, {
  cta: string; title: string; name: string; role: string; message: string;
  rating: string; submit: string; sending: string; success: string;
  namePh: string; rolePh: string; messagePh: string; required: string; failed: string;
  anon: string; anonHint: string; anonName: string; ratingLabels: [string, string, string, string, string];
}> = {
  fr: { cta: "Laisser un avis", title: "Partagez votre expérience", name: "Votre nom", role: "Entreprise / rôle (optionnel)", message: "Votre avis", rating: "Votre note", submit: "Envoyer mon avis", sending: "Envoi…", success: "Merci ! Votre avis sera publié après validation.", namePh: "Ex. Marie Joseph", rolePh: "Ex. Fondatrice, Rosie Cocktail", messagePh: "Racontez votre expérience avec INOV…", required: "Indiquez votre nom et un avis d'au moins 10 caractères.", failed: "Envoi impossible. Réessayez dans un instant.", anon: "Publier anonymement", anonHint: "Votre nom sera masqué ; ajoutez le nom de votre entreprise si vous le souhaitez.", anonName: "Client anonyme", ratingLabels: ["Décevant", "Passable", "Correct", "Très bien", "Excellent"] },
  en: { cta: "Leave a review", title: "Share your experience", name: "Your name", role: "Company / role (optional)", message: "Your review", rating: "Your rating", submit: "Send my review", sending: "Sending…", success: "Thank you! Your review will appear once approved.", namePh: "e.g. Marie Joseph", rolePh: "e.g. Founder, Rosie Cocktail", messagePh: "Tell us about your experience with INOV…", required: "Enter your name and a review of at least 10 characters.", failed: "Couldn't send. Please try again shortly.", anon: "Post anonymously", anonHint: "Your name will be hidden; add your company name if you like.", anonName: "Anonymous client", ratingLabels: ["Disappointing", "Fair", "Good", "Very good", "Excellent"] },
  es: { cta: "Dejar una opinión", title: "Comparte tu experiencia", name: "Tu nombre", role: "Empresa / cargo (opcional)", message: "Tu opinión", rating: "Tu valoración", submit: "Enviar mi opinión", sending: "Enviando…", success: "¡Gracias! Tu opinión se publicará tras la aprobación.", namePh: "Ej. Marie Joseph", rolePh: "Ej. Fundadora, Rosie Cocktail", messagePh: "Cuéntanos tu experiencia con INOV…", required: "Introduce tu nombre y una opinión de al menos 10 caracteres.", failed: "No se pudo enviar. Inténtalo de nuevo en un momento.", anon: "Publicar de forma anónima", anonHint: "Tu nombre se ocultará; añade el nombre de tu empresa si quieres.", anonName: "Cliente anónimo", ratingLabels: ["Decepcionante", "Regular", "Bien", "Muy bien", "Excelente"] },
  ht: { cta: "Kite yon avi", title: "Pataje eksperyans ou", name: "Non ou", role: "Antrepriz / wòl (opsyonèl)", message: "Avi ou", rating: "Nòt ou", submit: "Voye avi mwen", sending: "N ap voye…", success: "Mèsi! Avi ou ap parèt apre nou apwouve l.", namePh: "Egz. Marie Joseph", rolePh: "Egz. Fondatè, Rosie Cocktail", messagePh: "Rakonte eksperyans ou ak INOV…", required: "Mete non ou ak yon avi ki gen omwen 10 karaktè.", failed: "Nou pa ka voye l. Eseye ankò nan yon ti moman.", anon: "Pibliye anonim", anonHint: "N ap kache non ou ; ajoute non antrepriz ou si ou vle.", anonName: "Kliyan anonim", ratingLabels: ["Dezapwentan", "Mwayen", "Kòrèk", "Trè byen", "Ekselan"] },
  pt: { cta: "Deixar uma avaliação", title: "Partilhe a sua experiência", name: "O seu nome", role: "Empresa / cargo (opcional)", message: "A sua avaliação", rating: "A sua nota", submit: "Enviar a minha avaliação", sending: "A enviar…", success: "Obrigado! A sua avaliação será publicada após aprovação.", namePh: "Ex. Marie Joseph", rolePh: "Ex. Fundadora, Rosie Cocktail", messagePh: "Conte-nos a sua experiência com a INOV…", required: "Informe o seu nome e uma avaliação com pelo menos 10 caracteres.", failed: "Não foi possível enviar. Tente novamente daqui a pouco.", anon: "Publicar anonimamente", anonHint: "O seu nome ficará oculto; adicione o nome da sua empresa se quiser.", anonName: "Cliente anónimo", ratingLabels: ["Dececionante", "Razoável", "Bom", "Muito bom", "Excelente"] },
  it: { cta: "Lascia una recensione", title: "Condividi la tua esperienza", name: "Il tuo nome", role: "Azienda / ruolo (facoltativo)", message: "La tua recensione", rating: "La tua valutazione", submit: "Invia la mia recensione", sending: "Invio…", success: "Grazie! La tua recensione sarà pubblicata dopo l'approvazione.", namePh: "Es. Marie Joseph", rolePh: "Es. Fondatrice, Rosie Cocktail", messagePh: "Raccontaci la tua esperienza con INOV…", required: "Inserisci il tuo nome e una recensione di almeno 10 caratteri.", failed: "Invio non riuscito. Riprova tra poco.", anon: "Pubblica in modo anonimo", anonHint: "Il tuo nome sarà nascosto; aggiungi il nome della tua azienda se vuoi.", anonName: "Cliente anonimo", ratingLabels: ["Deludente", "Discreto", "Buono", "Molto buono", "Eccellente"] },
  de: { cta: "Bewertung abgeben", title: "Teilen Sie Ihre Erfahrung", name: "Ihr Name", role: "Firma / Rolle (optional)", message: "Ihre Bewertung", rating: "Ihre Bewertung", submit: "Bewertung senden", sending: "Wird gesendet…", success: "Danke! Ihre Bewertung erscheint nach der Freigabe.", namePh: "z. B. Marie Joseph", rolePh: "z. B. Gründerin, Rosie Cocktail", messagePh: "Erzählen Sie von Ihrer Erfahrung mit INOV…", required: "Bitte Namen und eine Bewertung mit mindestens 10 Zeichen angeben.", failed: "Senden fehlgeschlagen. Bitte gleich erneut versuchen.", anon: "Anonym veröffentlichen", anonHint: "Ihr Name wird ausgeblendet; fügen Sie bei Bedarf Ihren Firmennamen hinzu.", anonName: "Anonymer Kunde", ratingLabels: ["Enttäuschend", "Mäßig", "Gut", "Sehr gut", "Ausgezeichnet"] },
  ar: { cta: "أضف رأيك", title: "شاركنا تجربتك", name: "اسمك", role: "الشركة / الدور (اختياري)", message: "رأيك", rating: "تقييمك", submit: "إرسال رأيي", sending: "جارٍ الإرسال…", success: "شكرًا! سيظهر رأيك بعد الموافقة.", namePh: "مثال: ماري جوزيف", rolePh: "مثال: مؤسِّسة، Rosie Cocktail", messagePh: "أخبرنا عن تجربتك مع INOV…", required: "أدخل اسمك ورأيًا لا يقل عن 10 أحرف.", failed: "تعذّر الإرسال. حاول مرة أخرى بعد قليل.", anon: "النشر بشكل مجهول", anonHint: "سيتم إخفاء اسمك؛ أضف اسم شركتك إذا رغبت.", anonName: "عميل مجهول", ratingLabels: ["مخيّب", "مقبول", "جيد", "جيد جدًا", "ممتاز"] },
}

// Card for a client-submitted (approved) review. Uses initials since these have
// no portfolio project or brand logo attached.
function ReviewCard({ r, role }: { r: PublicTestimonial; role: string }) {
  const initials = r.name.split(" ").filter(Boolean).slice(0, 2).map((w) => w.charAt(0)).join("").toUpperCase()
  return (
    <div
      className="card testimonial-card"
      style={{ padding: 30, height: "100%", boxSizing: "border-box", display: "flex", flexDirection: "column", position: "relative" }}
    >
      <Quote size={40} aria-hidden="true" style={{ color: "var(--ds-accent)", opacity: 0.16, marginBottom: 6, flexShrink: 0 }} fill="var(--ds-accent)" strokeWidth={0} />
      <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: 15.5, color: "var(--ds-text)", lineHeight: 1.75, flex: 1, margin: "0 0 22px", letterSpacing: "-0.005em" }}>
        {r.text}
      </p>
      <div style={{ marginBottom: 18, display: "flex", gap: 3 }}>
        {Array.from({ length: 5 }).map((_, i) => (
          <Star key={i} size={15} color="var(--ds-accent)" fill={i < r.stars ? "var(--ds-accent)" : "none"} strokeWidth={i < r.stars ? 0 : 1.5} style={{ opacity: i < r.stars ? 1 : 0.35 }} />
        ))}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 13, borderTop: "1px solid var(--ds-border)", paddingTop: 18 }}>
        <div style={{ width: 46, height: 46, borderRadius: "50%", flexShrink: 0, background: "var(--ds-accent-a10)", border: "1px solid var(--ds-border)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 16, fontWeight: 700, color: "var(--ds-accent-text)" }}>{initials}</span>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 14.5, fontWeight: 700, color: "var(--ds-text)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{r.name}</div>
          {role && <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 12.5, color: "var(--ds-text-muted)", marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{role}</div>}
        </div>
      </div>
    </div>
  )
}

function ReviewForm({ lang, onClose, onSubmitted }: { lang: string; onClose: () => void; onSubmitted: () => void }) {
  const u = RUI[lang] ?? RUI.fr
  const [name, setName] = useState("")
  const [role, setRole] = useState("")
  const [text, setText] = useState("")
  const [stars, setStars] = useState(5)
  const [anon, setAnon] = useState(false)
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle")
  const [err, setErr] = useState("")

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if ((!anon && name.trim().length < 2) || text.trim().length < 10) { setErr(u.required); return }
    setErr(""); setStatus("sending")
    try {
      await api.submitTestimonial({
        name: anon ? u.anonName : name.trim(),
        role: role.trim(),
        company: role.trim(),
        text: text.trim(),
        stars,
        lang,
      })
      setStatus("done")
      onSubmitted()
    } catch {
      setStatus("error"); setErr(u.failed)
    }
  }

  const inputStyle: React.CSSProperties = { width: "100%", padding: "11px 14px", borderRadius: 10, border: "1px solid var(--ds-border)", background: "var(--ds-bg)", fontFamily: "'Outfit', sans-serif", fontSize: 15, color: "var(--ds-text)", outline: "none", boxSizing: "border-box" }
  const labelStyle: React.CSSProperties = { fontFamily: "'Outfit', sans-serif", fontSize: 13.5, fontWeight: 700, color: "var(--ds-text)", display: "block", marginBottom: 6 }

  return (
    <div
      onClick={onClose}
      dir={lang === "ar" ? "rtl" : undefined}
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", zIndex: 80, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
    >
      <div onClick={(e) => e.stopPropagation()} style={{ width: 480, maxWidth: "100%", maxHeight: "90vh", overflowY: "auto", background: "var(--ds-bg)", borderRadius: "var(--r-lg)", padding: "26px 26px 28px", boxShadow: "0 24px 60px rgba(0,0,0,0.3)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
          <h3 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: 20, color: "var(--ds-text)", margin: 0 }}>{u.title}</h3>
          <button type="button" aria-label={u.cta} onClick={onClose} style={{ display: "inline-flex", padding: 6, border: "none", background: "transparent", color: "var(--ds-text-sec)", cursor: "pointer" }}><X size={20} aria-hidden="true" /></button>
        </div>

        {status === "done" ? (
          <div style={{ textAlign: "center", padding: "24px 8px" }}>
            <div style={{ width: 56, height: 56, borderRadius: "50%", background: "var(--ds-accent-a14)", display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
              <Check size={28} color="var(--ds-accent-text)" aria-hidden="true" />
            </div>
            <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: 15.5, fontWeight: 600, color: "var(--ds-text)", lineHeight: 1.6, margin: 0 }}>{u.success}</p>
          </div>
        ) : (
          <form onSubmit={submit} style={{ display: "grid", gap: 16 }}>
            <label style={{ display: "flex", alignItems: "flex-start", gap: 10, cursor: "pointer" }}>
              <input type="checkbox" checked={anon} onChange={(e) => setAnon(e.target.checked)} style={{ width: 17, height: 17, marginTop: 2, accentColor: "var(--ds-accent)", flexShrink: 0, cursor: "pointer" }} />
              <span>
                <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 14, fontWeight: 700, color: "var(--ds-text)", display: "block" }}>{u.anon}</span>
                <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 12.5, color: "var(--ds-text-muted)", lineHeight: 1.5 }}>{u.anonHint}</span>
              </span>
            </label>
            {!anon && (
              <div>
                <label htmlFor="rv-name" style={labelStyle}>{u.name}</label>
                <input id="rv-name" value={name} onChange={(e) => setName(e.target.value)} placeholder={u.namePh} autoComplete="name" style={inputStyle} />
              </div>
            )}
            <div>
              <label htmlFor="rv-role" style={labelStyle}>{u.role}</label>
              <input id="rv-role" value={role} onChange={(e) => setRole(e.target.value)} placeholder={u.rolePh} style={inputStyle} />
            </div>
            <div>
              <span style={labelStyle}>{u.rating}</span>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ display: "flex", gap: 6 }}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <button key={i} type="button" aria-label={`${i + 1} / 5 — ${u.ratingLabels[i]}`} aria-pressed={stars === i + 1} onClick={() => setStars(i + 1)} style={{ padding: 2, border: "none", background: "transparent", cursor: "pointer", lineHeight: 0 }}>
                      <Star size={26} color="var(--ds-accent)" fill={i < stars ? "var(--ds-accent)" : "none"} strokeWidth={i < stars ? 0 : 1.6} style={{ opacity: i < stars ? 1 : 0.4 }} />
                    </button>
                  ))}
                </div>
                <span aria-live="polite" style={{ fontFamily: "'Outfit', sans-serif", fontSize: 13.5, fontWeight: 700, color: "var(--ds-accent-text)" }}>{u.ratingLabels[stars - 1]}</span>
              </div>
            </div>
            <div>
              <label htmlFor="rv-text" style={labelStyle}>{u.message}</label>
              <textarea id="rv-text" value={text} onChange={(e) => setText(e.target.value)} placeholder={u.messagePh} rows={4} maxLength={600} style={{ ...inputStyle, resize: "vertical", lineHeight: 1.5 }} />
            </div>
            {err && <p role="alert" style={{ fontFamily: "'Outfit', sans-serif", fontSize: 13.5, fontWeight: 600, color: "#dc2626", margin: 0 }}>{err}</p>}
            <button type="submit" disabled={status === "sending"} className="btn-orange" style={{ opacity: status === "sending" ? 0.7 : 1, cursor: status === "sending" ? "wait" : "pointer" }}>
              {status === "sending" ? u.sending : u.submit}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

export default function Testimonials() {
  const { t, lang } = useSettings()
  const full = testimonials.map(enriched)
  const u = RUI[lang] ?? RUI.fr
  const [reviews, setReviews] = useState<PublicTestimonial[]>([])
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    let alive = true
    api.listTestimonials()
      .then((r) => { if (alive) setReviews(r.testimonials) })
      .catch(() => { /* non-blocking: the section still shows built-in testimonials */ })
    return () => { alive = false }
  }, [])

  return (
    <section id="testimonials" style={{ background: "var(--ds-bg-sec)", padding: "96px 0" }}>
      <style>{`
        .testimonial-card .testimonial-arrow { transition: color 0.2s ease, transform 0.2s ease; }
        .testimonial-card:hover .testimonial-arrow { color: var(--ds-accent); transform: translate(2px, -2px); }
      `}</style>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 var(--section-px)" }}>
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <div style={{ marginBottom: 20 }}>
            <span className="section-tag">
              <span className="dot-pulse" />
              {t.testimonials.tag}
            </span>
          </div>
          <h2 className="section-title" style={{ marginBottom: 16 }}>
            {t.testimonials.title}
          </h2>
          <p
            style={{
              fontFamily: "'Outfit', sans-serif",
              fontSize: 17.6,
              color: "var(--ds-text-sec)",
              maxWidth: 520,
              margin: "0 auto",
              lineHeight: 1.7,
            }}
          >
            {t.testimonials.subtitle}
          </p>
        </div>

        <AutoCarousel visibleCount={2} mobileVisibleCount={1} interval={5000}>
          {[
            ...full.map((item) => {
              const tr = t.testimonials.items[item.id]
              return (
                <TestimonialCard
                  key={item.id}
                  t={item}
                  role={tr?.role ?? item.role}
                  text={tr?.text ?? item.text}
                />
              )
            }),
            ...reviews.map((r) => (
              <ReviewCard key={`review-${r.id}`} r={r} role={r.role || r.company} />
            )),
          ]}
        </AutoCarousel>

        <div style={{ textAlign: "center", marginTop: 44 }}>
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="btn-orange"
            style={{ display: "inline-flex", alignItems: "center", gap: 8 }}
          >
            <PenSquare size={16} aria-hidden="true" /> {u.cta}
          </button>
        </div>
      </div>

      {showForm && (
        <ReviewForm
          lang={lang}
          onClose={() => setShowForm(false)}
          onSubmitted={() => { /* stays open to show the thank-you state */ }}
        />
      )}
    </section>
  )
}
