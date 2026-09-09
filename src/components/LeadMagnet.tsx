import { useState, useEffect, useRef } from "react"
import useModal from "../hooks/useModal"
import { useForm } from "@formspree/react"
import { X, Download, Gift, CheckCircle2, Loader2, Mail } from "lucide-react"
import { useSettings } from "../context/AppSettings"
import { track, CONSENT_KEY } from "../lib/analytics"
import { api } from "../lib/api"
import type { Lang } from "../i18n/translations"

const FORMSPREE_ID = "mjybprza"

// Static, pre-rendered PDFs hosted alongside the site (public/guides/).
// Same file the confirmation e-mail links to — instant download, no generation.
const guideUrl = (lang: string) => `/guides/guide-${lang}.pdf`

const MAX_SUBMISSIONS = 2
const SEEN_KEY = "inov-lead-seen"
const COUNT_KEY = "inov-lead-count"

function getSubmitCount(): number {
  try { return parseInt(localStorage.getItem(COUNT_KEY) ?? "0", 10) } catch { return 0 }
}
function incrementSubmitCount() {
  try { localStorage.setItem(COUNT_KEY, String(getSubmitCount() + 1)) } catch {}
}
function markSeen() {
  try { localStorage.setItem(SEEN_KEY, "1") } catch {}
}
function hasSeen(): boolean {
  try { return !!localStorage.getItem(SEEN_KEY) } catch { return false }
}

const CLOSE_LABEL: Record<string, string> = {
  fr: "Fermer", en: "Close", es: "Cerrar", ht: "Fèmen",
  pt: "Fechar", it: "Chiudi", de: "Schließen", ar: "إغلاق",
}

const COPY: Record<Lang, {
  badge: string; title: string; sub: string; cta: string; placeholder: string
  skip: string; done: string; download: string; downloading: string
  continueSite: string; privacy: string; limitReached: string; mailed: string
}> = {
  fr: { badge: "Guide gratuit", title: "7 erreurs de branding qui font fuir vos clients", sub: "Téléchargez le guide PDF gratuit et évitez les pièges qui coûtent des ventes à votre marque.", cta: "Télécharger le guide", placeholder: "Votre email", skip: "Non merci, continuer sans le guide", done: "Votre guide est prêt !", download: "Télécharger le PDF", downloading: "Génération en cours…", continueSite: "Continuer vers le site", privacy: "Votre email sert uniquement à vous envoyer le guide. Pas de spam.", limitReached: "Vous avez déjà reçu le guide. Téléchargez-le à nouveau ci-dessous.", mailed: "Nous venons aussi de vous l'envoyer par email (pensez à vérifier vos spams)." },
  en: { badge: "Free guide", title: "7 branding mistakes that scare your clients away", sub: "Download the free PDF guide and avoid the pitfalls that cost your brand sales.", cta: "Download the guide", placeholder: "Your email", skip: "No thanks, continue without the guide", done: "Your guide is ready!", download: "Download PDF", downloading: "Generating…", continueSite: "Continue to the site", privacy: "Your email is only used to send you the guide. No spam.", limitReached: "You already received the guide. Download it again below.", mailed: "We've also just emailed it to you (check your spam folder just in case)." },
  es: { badge: "Guía gratis", title: "7 errores de branding que ahuyentan a tus clientes", sub: "Descarga la guía PDF gratuita y evita los errores que le cuestan ventas a tu marca.", cta: "Descargar la guía", placeholder: "Tu email", skip: "No gracias, continuar sin la guía", done: "¡Tu guía está lista!", download: "Descargar PDF", downloading: "Generando…", continueSite: "Continuar al sitio", privacy: "Tu email solo se usa para enviarte la guía. Sin spam.", limitReached: "Ya recibiste la guía. Descárgala de nuevo abajo.", mailed: "También acabamos de enviártela por email (revisa tu carpeta de spam)." },
  ht: { badge: "Gid gratis", title: "7 erè branding ki fè kliyan ou yo sove", sub: "Telechaje gid PDF gratis la epi evite erè ki koute mak ou vant.", cta: "Telechaje gid la", placeholder: "Imel ou", skip: "Non mèsi, kontinye san gid la", done: "Gid ou a pare!", download: "Telechaje PDF", downloading: "Ap jenere…", continueSite: "Kontinye nan sit la", privacy: "Imel ou sèvi sèlman pou voye gid la ba ou. Pa gen spam.", limitReached: "Ou deja resevwa gid la. Telechaje l ankò anba.", mailed: "Nou fèk voye l ba ou pa imel tou (tcheke katab spam ou)." },
  pt: { badge: "Guia grátis", title: "7 erros de branding que afastam seus clientes", sub: "Baixe o guia PDF gratuito e evite as armadilhas que custam vendas à sua marca.", cta: "Baixar o guia", placeholder: "Seu email", skip: "Não obrigado, continuar sem o guia", done: "Seu guia está pronto!", download: "Baixar PDF", downloading: "Gerando…", continueSite: "Continuar para o site", privacy: "Seu email é usado apenas para enviar o guia. Sem spam.", limitReached: "Você já recebeu o guia. Baixe novamente abaixo.", mailed: "Também acabamos de enviá-lo por email (verifique sua caixa de spam)." },
  it: { badge: "Guida gratuita", title: "7 errori di branding che allontanano i tuoi clienti", sub: "Scarica la guida PDF gratuita ed evita gli errori che costano vendite al tuo brand.", cta: "Scarica la guida", placeholder: "La tua email", skip: "No grazie, continua senza la guida", done: "La tua guida è pronta!", download: "Scarica PDF", downloading: "Generazione in corso…", continueSite: "Continua al sito", privacy: "La tua email serve solo a inviarti la guida. Niente spam.", limitReached: "Hai già ricevuto la guida. Scaricala di nuovo qui sotto.", mailed: "Te l'abbiamo appena inviata anche via email (controlla lo spam)." },
  de: { badge: "Gratis-Guide", title: "7 Branding-Fehler, die Ihre Kunden vertreiben", sub: "Laden Sie den kostenlosen PDF-Guide herunter und vermeiden Sie Fehler, die Umsatz kosten.", cta: "Guide herunterladen", placeholder: "Ihre E-Mail", skip: "Nein danke, ohne Guide fortfahren", done: "Ihr Guide ist bereit!", download: "PDF herunterladen", downloading: "Wird generiert…", continueSite: "Zur Website", privacy: "Ihre E-Mail wird nur verwendet, um Ihnen den Guide zu senden. Kein Spam.", limitReached: "Sie haben den Guide bereits erhalten. Laden Sie ihn unten erneut herunter.", mailed: "Wir haben ihn Ihnen soeben auch per E-Mail geschickt (bitte Spam-Ordner prüfen)." },
  ar: { badge: "دليل مجاني", title: "٧ أخطاء في العلامة التجارية تُنفّر عملاءك", sub: "حمّل دليل PDF المجاني وتجنّب الأخطاء التي تكلّف علامتك مبيعات.", cta: "تحميل الدليل", placeholder: "بريدك الإلكتروني", skip: "لا شكراً، المتابعة بدون الدليل", done: "دليلك جاهز!", download: "تحميل PDF", downloading: "جارٍ الإنشاء…", continueSite: "متابعة إلى الموقع", privacy: "يُستخدم بريدك فقط لإرسال الدليل إليك. بلا رسائل مزعجة.", limitReached: "لقد استلمت الدليل بالفعل. حمّله مجدداً أدناه.", mailed: "لقد أرسلناه إليك أيضاً عبر البريد الإلكتروني (تحقق من مجلد الرسائل غير المرغوبة)." },
}

type Status = "idle" | "submitting" | "done" | "limit"

export default function LeadMagnet() {
  const { lang } = useSettings()
  const c = COPY[lang] ?? COPY.fr
  const [open, setOpen] = useState(false)
  const [status, setStatus] = useState<Status>("idle")
  const [fsState, handleFsSubmit] = useForm(FORMSPREE_ID)
  const emailRef = useRef<HTMLInputElement>(null)
  const dialogRef = useModal<HTMLDivElement>(open, () => setOpen(false))

  useEffect(() => {
    if (hasSeen()) return
    let shown = false
    let timer: ReturnType<typeof setTimeout> | undefined
    const onExit = (e: MouseEvent) => { if (e.clientY <= 0) show() }

    function show() {
      if (shown) return
      shown = true
      setOpen(true)
      markSeen()
      window.removeEventListener("mouseout", onExit)
      if (timer) clearTimeout(timer)
    }

    function arm() {
      timer = setTimeout(show, 15000)
      window.addEventListener("mouseout", onExit)
    }

    const decided = (() => {
      try { const v = localStorage.getItem(CONSENT_KEY); return v === "accept" || v === "reject" || v === "custom" }
      catch { return false }
    })()

    let onDecided: (() => void) | undefined
    if (decided) { arm() }
    else {
      onDecided = () => setTimeout(arm, 600)
      window.addEventListener("inov-consent-decided", onDecided, { once: true })
    }

    return () => {
      if (timer) clearTimeout(timer)
      window.removeEventListener("mouseout", onExit)
      if (onDecided) window.removeEventListener("inov-consent-decided", onDecided)
    }
  }, [])

  // Trigger from email link (?guide=1)
  useEffect(() => {
    try {
      const requested = sessionStorage.getItem("inov-guide-requested")
      if (requested) {
        sessionStorage.removeItem("inov-guide-requested")
        setStatus("done")
        setOpen(true)
      }
    } catch {}
  }, [])

  // Once Formspree confirms, show the ready screen (guide is emailed + hosted).
  useEffect(() => {
    if (!fsState.succeeded) return
    incrementSubmitCount()
    track("lead_magnet_submit", { source: "lead_magnet", lang })
    setStatus("done")
  }, [fsState.succeeded])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (getSubmitCount() >= MAX_SUBMISSIONS) { setStatus("limit"); return }
    setStatus("submitting")
    // Actually email the guide to the visitor (Gmail via the Edge function).
    const emailVal = emailRef.current?.value?.trim()
    if (emailVal) api.sendGuide(emailVal, lang)
    handleFsSubmit(e as any)
  }

  if (!open) return null

  const isLimit = status === "limit" || getSubmitCount() >= MAX_SUBMISSIONS

  return (
    <div
      role="dialog" aria-modal="true" aria-label={c.title}
      onClick={() => setOpen(false)}
      style={{
        position: "fixed", inset: 0, zIndex: 6000, display: "flex", alignItems: "center", justifyContent: "center",
        background: "rgba(11,11,15,0.55)", backdropFilter: "blur(4px)", padding: 20,
      }}
    >
      <div
        ref={dialogRef}
        onClick={(e) => e.stopPropagation()}
        style={{
          position: "relative", width: "100%", maxWidth: 440, background: "#fff", borderRadius: "var(--r-xl)",
          padding: "40px 32px 32px", boxShadow: "0 30px 80px rgba(0,0,0,0.35)", boxSizing: "border-box",
        }}
      >
        <button
          onClick={() => setOpen(false)}
          aria-label={CLOSE_LABEL[lang] ?? "Close"}
          style={{
            position: "absolute", top: 14, right: 14, width: 34, height: 34, borderRadius: "50%",
            border: "none", background: "var(--ds-bg-sec)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--ds-text-muted)",
          }}
        >
          <X size={18} />
        </button>

        {status !== "done" && !isLimit ? (
          <>
            <span style={{
              display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 12px", borderRadius: "var(--r-full)", marginBottom: 16,
              background: "var(--ds-accent-a12)", color: "var(--ds-accent-text)", fontFamily: "'Outfit', sans-serif", fontSize: 12, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em",
            }}>
              <Gift size={13} /> {c.badge}
            </span>
            <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 22, fontWeight: 800, color: "#000", lineHeight: 1.2, marginBottom: 10 }}>{c.title}</h3>
            <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: 15, color: "var(--ds-text-sec)", lineHeight: 1.6, marginBottom: 22 }}>{c.sub}</p>
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <input type="hidden" name="_subject" value="Nouveau lead — Guide branding" />
              <input type="hidden" name="source" value="lead_magnet" />
              <input
                ref={emailRef} type="email" name="email" required placeholder={c.placeholder} aria-label={c.placeholder}
                style={{
                  width: "100%", boxSizing: "border-box", padding: "14px 18px", borderRadius: "var(--r-md)",
                  border: "1.5px solid rgba(0,0,0,0.12)", fontFamily: "'Outfit', sans-serif", fontSize: 15, outline: "none",
                }}
              />
              <button
                type="submit"
                disabled={status === "submitting"}
                className="btn-orange"
                style={{
                  width: "100%", padding: "14px 18px", borderRadius: "var(--r-md)", border: "none", cursor: "pointer", color: "#fff",
                  fontFamily: "'Outfit', sans-serif", fontSize: 15.5, fontWeight: 700,
                  opacity: status === "submitting" ? 0.7 : 1,
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                }}
              >
                {status === "submitting"
                  ? <><Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> {c.downloading}</>
                  : <><Download size={16} /> {c.cta}</>}
              </button>
              <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: 12, color: "var(--ds-text-faint)", textAlign: "center", margin: 0 }}>{c.privacy}</p>
              <button type="button" onClick={() => setOpen(false)} style={{
                background: "none", border: "none", cursor: "pointer", padding: "2px 0",
                fontFamily: "'Outfit', sans-serif", fontSize: 13, color: "var(--ds-text-faint)",
                textDecoration: "underline", textUnderlineOffset: 3, width: "100%", textAlign: "center",
              }}>
                {c.skip}
              </button>
            </form>
          </>
        ) : (
          <div style={{ textAlign: "center", padding: "8px 0" }}>
            <CheckCircle2 size={54} color="var(--ds-accent)" style={{ margin: "0 auto 16px" }} />
            <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: 17, fontWeight: 700, color: "#000", marginBottom: 8 }}>
              {isLimit && status !== "done" ? c.limitReached : c.done}
            </p>
            <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: 13.5, color: "var(--ds-text-sec)", lineHeight: 1.5, marginBottom: 22, display: "inline-flex", alignItems: "center", gap: 6, justifyContent: "center" }}>
              <Mail size={14} style={{ flexShrink: 0 }} /> {c.mailed}
            </p>
            <a
              href={guideUrl(lang)}
              download
              onClick={() => track("lead_magnet_download")}
              className="btn-orange"
              style={{
                display: "inline-flex", alignItems: "center", gap: 8, padding: "13px 26px", borderRadius: "var(--r-md)", color: "#fff",
                fontFamily: "'Outfit', sans-serif", fontSize: 15, fontWeight: 700, border: "none", cursor: "pointer",
                textDecoration: "none",
              }}
            >
              <Download size={18} /> {c.download}
            </a>
            <button onClick={() => setOpen(false)} style={{
              display: "block", margin: "12px auto 0", background: "none", border: "none", cursor: "pointer",
              fontFamily: "'Outfit', sans-serif", fontSize: 13, color: "var(--ds-text-faint)",
              textDecoration: "underline", textUnderlineOffset: 3,
            }}>
              {c.continueSite}
            </button>
          </div>
        )}
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
