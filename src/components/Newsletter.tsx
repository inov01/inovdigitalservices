import { useState } from "react"
import { Mail, Send, Check, Sparkles } from "lucide-react"
import { useSettings } from "../context/AppSettings"
import { track } from "../lib/analytics"
import { api } from "../lib/api"
import type { Lang } from "../i18n/translations"

/* ──────────────────────────────────────────────────────────────────────────
   PRÊT À BRANCHER — configuration de l'envoi
   ──────────────────────────────────────────────────────────────────────────
   Ce formulaire est fonctionnel côté UI. Pour connecter un vrai service
   d'e-mailing, renseigne UNE des options ci-dessous. Tant que tout est vide,
   le formulaire simule un succès (aucun e-mail n'est réellement enregistré).

   ── Option A · Brevo (recommandé, francophone) ────────────────────────────
   1. Crée un compte sur https://www.brevo.com puis une liste de contacts.
   2. Récupère : ta clé API (Settings → SMTP & API → API Keys) et l'ID de liste.
   3. NE mets JAMAIS la clé API en dur ici (elle serait publique dans le bundle).
      Crée une petite fonction serverless / Edge Function (Supabase dispo dans
      ce projet) qui reçoit { email, lang } et appelle l'API Brevo côté serveur,
      puis renseigne son URL dans NEWSLETTER_ENDPOINT.

   ── Option B · MailerLite / Buttondown ────────────────────────────────────
   Même principe : un endpoint serveur qui relaie vers leur API.

   ── Option C · Formulaire hébergé (le plus simple, zéro backend) ───────────
   Brevo & MailerLite fournissent une URL de formulaire "POST". Colle-la dans
   NEWSLETTER_ENDPOINT ; on postera { email, lang } dessus en x-www-form.
   ────────────────────────────────────────────────────────────────────────── */
async function subscribe(email: string, lang: Lang): Promise<void> {
  // Enregistré dans Supabase ; consultable depuis /admin.
  await api.subscribeNewsletter(email, lang)
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

type Copy = {
  tag: string; title: string; sub: string
  placeholder: string; cta: string; sending: string
  success: string; successSub: string
  errorEmail: string; errorGeneric: string
  privacy: string
}

const COPY: Record<Lang, Copy> = {
  fr: {
    tag: "Newsletter", title: "Des conseils branding, deux fois par mois",
    sub: "Un conseil actionnable pour soigner votre image + une réalisation de notre portfolio. Rien de plus, jamais de spam.",
    placeholder: "votre@email.com", cta: "Je m'abonne", sending: "Envoi…",
    success: "C'est fait, bienvenue !", successSub: "Un e-mail de bienvenue vient de vous être envoyé. Pensez à vérifier vos spams.",
    errorEmail: "Entrez une adresse e-mail valide.", errorGeneric: "Une erreur est survenue. Réessayez.",
    privacy: "Désinscription en un clic. Vos données ne sont jamais partagées.",
  },
  en: {
    tag: "Newsletter", title: "Branding tips, twice a month",
    sub: "One actionable tip to sharpen your image + one project from our portfolio. Nothing more, never spam.",
    placeholder: "your@email.com", cta: "Subscribe", sending: "Sending…",
    success: "Done, welcome aboard!", successSub: "A welcome email is on its way. Check your spam folder just in case.",
    errorEmail: "Enter a valid email address.", errorGeneric: "Something went wrong. Please try again.",
    privacy: "One-click unsubscribe. Your data is never shared.",
  },
  es: {
    tag: "Newsletter", title: "Consejos de branding, dos veces al mes",
    sub: "Un consejo accionable para cuidar tu imagen + un trabajo de nuestro portafolio. Nada más, sin spam.",
    placeholder: "tu@email.com", cta: "Suscribirme", sending: "Enviando…",
    success: "¡Listo, bienvenido!", successSub: "Te acabamos de enviar un correo de bienvenida. Revisa también el spam.",
    errorEmail: "Introduce un correo válido.", errorGeneric: "Ocurrió un error. Inténtalo de nuevo.",
    privacy: "Cancela en un clic. Tus datos nunca se comparten.",
  },
  ht: {
    tag: "Newsletter", title: "Konsèy branding, de fwa pa mwa",
    sub: "Yon konsèy pratik pou swaye imaj ou + yon reyalizasyon nan pòtfolyo nou. Anyen plis, pa gen spam.",
    placeholder: "email@ou.com", cta: "Abòne mwen", sending: "Y ap voye…",
    success: "Fini, byenveni!", successSub: "Nou fèk voye yon imel byenveni ba ou. Tcheke spam ou tou.",
    errorEmail: "Antre yon adrès imel ki valab.", errorGeneric: "Yon erè rive. Eseye ankò.",
    privacy: "Dezabòne an yon klik. Done ou pa janm pataje.",
  },
  pt: {
    tag: "Newsletter", title: "Dicas de branding, duas vezes por mês",
    sub: "Uma dica prática para cuidar da sua imagem + um trabalho do nosso portfólio. Nada mais, sem spam.",
    placeholder: "seu@email.com", cta: "Inscrever-me", sending: "Enviando…",
    success: "Pronto, bem-vindo!", successSub: "Acabamos de enviar um e-mail de boas-vindas. Verifique também o spam.",
    errorEmail: "Insira um e-mail válido.", errorGeneric: "Algo deu errado. Tente novamente.",
    privacy: "Cancele com um clique. Seus dados nunca são compartilhados.",
  },
  it: {
    tag: "Newsletter", title: "Consigli di branding, due volte al mese",
    sub: "Un consiglio pratico per curare la tua immagine + un lavoro dal nostro portfolio. Niente di più, mai spam.",
    placeholder: "tua@email.com", cta: "Iscrivimi", sending: "Invio…",
    success: "Fatto, benvenuto!", successSub: "Ti abbiamo appena inviato un'email di benvenuto. Controlla anche lo spam.",
    errorEmail: "Inserisci un'email valida.", errorGeneric: "Si è verificato un errore. Riprova.",
    privacy: "Disiscrizione con un clic. I tuoi dati non sono mai condivisi.",
  },
  de: {
    tag: "Newsletter", title: "Branding-Tipps, zweimal im Monat",
    sub: "Ein umsetzbarer Tipp für Ihr Image + eine Arbeit aus unserem Portfolio. Mehr nicht, niemals Spam.",
    placeholder: "ihre@email.com", cta: "Abonnieren", sending: "Senden…",
    success: "Fertig, willkommen!", successSub: "Eine Willkommens-E-Mail ist unterwegs. Prüfen Sie auch den Spam-Ordner.",
    errorEmail: "Geben Sie eine gültige E-Mail ein.", errorGeneric: "Ein Fehler ist aufgetreten. Bitte erneut versuchen.",
    privacy: "Abmeldung mit einem Klick. Ihre Daten werden nie geteilt.",
  },
  ar: {
    tag: "النشرة البريدية", title: "نصائح في العلامات التجارية، مرتين شهرياً",
    sub: "نصيحة عملية للعناية بصورتك + عمل من معرض أعمالنا. لا شيء أكثر، بلا إزعاج.",
    placeholder: "بريدك@الإلكتروني.com", cta: "اشترك", sending: "جارٍ الإرسال…",
    success: "تم، مرحباً بك!", successSub: "أرسلنا إليك للتو بريد ترحيب. تحقّق من مجلد الرسائل غير المرغوبة أيضاً.",
    errorEmail: "أدخل بريداً إلكترونياً صحيحاً.", errorGeneric: "حدث خطأ. حاول مرة أخرى.",
    privacy: "إلغاء الاشتراك بنقرة واحدة. لا تتم مشاركة بياناتك أبداً.",
  },
}

type Status = "idle" | "loading" | "success" | "error"

export default function Newsletter() {
  const { lang } = useSettings()
  const c = COPY[lang] ?? COPY.fr
  const [email, setEmail] = useState("")
  const [status, setStatus] = useState<Status>("idle")
  const [errorMsg, setErrorMsg] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (status === "loading") return

    if (!EMAIL_RE.test(email.trim())) {
      setStatus("error")
      setErrorMsg(c.errorEmail)
      return
    }

    setStatus("loading")
    setErrorMsg("")
    try {
      await subscribe(email.trim(), lang)
      setStatus("success")
      track("newsletter_signup", { lang })
    } catch {
      setStatus("error")
      setErrorMsg(c.errorGeneric)
    }
  }

  return (
    <section id="newsletter" style={{ background: "var(--ds-bg-sec)", padding: "88px 0" }}>
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "0 var(--section-px)" }}>
        <div
          style={{
            background: "var(--ds-accent-tint-grad)",
            border: "1px solid var(--ds-accent-a15)", borderRadius: "var(--r-xl)",
            padding: "48px 44px", textAlign: "center", position: "relative", overflow: "hidden",
          }}
        >
          {/* ghost icon */}
          <div style={{ position: "absolute", top: -20, insetInlineEnd: -12, opacity: 0.06, pointerEvents: "none" }}>
            <Mail size={160} strokeWidth={1.2} />
          </div>

          <div style={{ position: "relative", zIndex: 1 }}>
            <div style={{ marginBottom: 20 }}>
              <span className="section-tag"><span className="dot-pulse" />{c.tag}</span>
            </div>

            {status === "success" ? (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14, padding: "12px 0" }}>
                <div
                  style={{
                    width: 60, height: 60, borderRadius: "var(--r-lg)",
                    background: "var(--ds-accent-grad)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    boxShadow: "0 8px 22px var(--ds-accent-a35)",
                  }}
                >
                  <Check size={30} color="#fff" strokeWidth={2.4} />
                </div>
                <h2 className="section-title" style={{ marginBottom: 4 }}>{c.success}</h2>
                <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: 15, color: "var(--ds-text-sec)", lineHeight: 1.6, maxWidth: 420 }}>
                  {c.successSub}
                </p>
              </div>
            ) : (
              <>
                <h2 className="section-title" style={{ marginBottom: 14, maxWidth: 520, margin: "0 auto 14px" }}>{c.title}</h2>
                <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: 16, color: "var(--ds-text-sec)", lineHeight: 1.65, maxWidth: 480, margin: "0 auto 28px" }}>
                  {c.sub}
                </p>

                <form
                  onSubmit={handleSubmit}
                  style={{ display: "flex", gap: 10, maxWidth: 460, margin: "0 auto", flexWrap: "wrap" }}
                >
                  <label htmlFor="newsletter-email" style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}>
                    {c.placeholder}
                  </label>
                  <input
                    id="newsletter-email"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); if (status === "error") setStatus("idle") }}
                    placeholder={c.placeholder}
                    aria-invalid={status === "error"}
                    style={{
                      flex: "1 1 220px", minWidth: 0, padding: "15px 18px", borderRadius: "var(--r-md)",
                      border: status === "error" ? "1.5px solid var(--ds-danger)" : "1.5px solid var(--ds-border)",
                      background: "var(--ds-bg)", fontFamily: "'Outfit', sans-serif", fontSize: 15,
                      color: "var(--ds-text)", outline: "none",
                    }}
                  />
                  <button
                    type="submit"
                    disabled={status === "loading"}
                    className="btn-orange"
                    style={{
                      display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 9,
                      padding: "15px 28px", borderRadius: "var(--r-md)", border: "none",
                      color: "#fff", fontFamily: "'Outfit', sans-serif", fontSize: 15.5, fontWeight: 700,
                      cursor: status === "loading" ? "wait" : "pointer",
                      opacity: status === "loading" ? 0.75 : 1, whiteSpace: "nowrap",
                    }}
                  >
                    {status === "loading" ? (
                      <><Sparkles size={17} /> {c.sending}</>
                    ) : (
                      <><Send size={17} /> {c.cta}</>
                    )}
                  </button>
                </form>

                {status === "error" && (
                  <p role="alert" style={{ fontFamily: "'Outfit', sans-serif", fontSize: 13.5, color: "var(--ds-danger)", marginTop: 12 }}>
                    {errorMsg}
                  </p>
                )}

                <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: 12.5, color: "var(--ds-text-faint)", marginTop: 18, lineHeight: 1.5 }}>
                  {c.privacy}
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
