import { useState, useEffect, useRef } from "react"
import { Star, Handshake, Award, UserPlus, ChevronLeft, ChevronRight } from "lucide-react"
import { Link } from "react-router"
import { SiWhatsapp } from "./SocialIcons"
import { useSettings } from "../context/AppSettings"
import useReducedMotion from "../hooks/useReducedMotion"
import { track } from "../lib/analytics"
import type { Lang } from "../i18n/translations"

const WA = "50936255920"

const COPY: Record<Lang, {
  tag: string; title: string; sub: string;
  step1t: string; step1d: string;
  step2t: string; step2d: string;
  step3t: string; step3d: string;
  badge: string;
  cta: string; wa: string; note: string;
}> = {
  fr: {
    tag: "Ambassadeurs",
    title: "Vous recommandez, ils découvrent, on vous remercie",
    sub: "Pas de système compliqué. Juste la confiance : vous partagez votre expérience, nous prenons soin de ceux qui vous font confiance.",
    step1t: "Partagez votre expérience",
    step1d: "Vous avez aimé travailler avec INOV ? Mentionnez-nous à un entrepreneur, un ami ou un collègue qui cherche à soigner son image.",
    step2t: "Votre contact est accueilli avec soin",
    step2d: "Il bénéficie d'un accueil personnalisé et d'une révision offerte sur sa première commande — pas un code promo, une vraie attention.",
    step3t: "Nous vous offrons un bonus",
    step3d: "À chaque client que vous nous présentez et qui commande, vous recevez un crédit de remerciement à valoir sur n'importe lequel de vos projets futurs.",
    badge: "Réservé à nos clients satisfaits",
    cta: "Devenir ambassadeur",
    wa: "Bonjour INOV Digital Services, je souhaite vous recommander un contact et rejoindre le programme Ambassadeurs.",
    note: "Aucune limite de recommandations. Fonctionnement transparent, sans conditions cachées.",
  },
  en: {
    tag: "Ambassadors",
    title: "You recommend, they discover, we thank you",
    sub: "No complex system. Just trust: you share your experience, we take care of everyone you send our way.",
    step1t: "Share your experience",
    step1d: "Enjoyed working with INOV? Mention us to an entrepreneur, a friend, or a colleague who wants to improve their brand image.",
    step2t: "Your contact gets personal attention",
    step2d: "They receive a warm onboarding and a complimentary revision on their first order — not a promo code, genuine care.",
    step3t: "We offer you a thank-you bonus",
    step3d: "For every client you introduce who places an order, you receive a credit to use on any future project of yours.",
    badge: "Reserved for satisfied clients",
    cta: "Become an ambassador",
    wa: "Hello INOV Digital Services, I'd like to recommend a contact and join the Ambassador programme.",
    note: "No limit on referrals. Transparent process, no hidden conditions.",
  },
  es: {
    tag: "Embajadores",
    title: "Recomiendas, ellos descubren, nosotros te agradecemos",
    sub: "Sin sistemas complicados. Solo confianza: compartes tu experiencia y nosotros cuidamos a quienes nos envías.",
    step1t: "Comparte tu experiencia",
    step1d: "¿Te gustó trabajar con INOV? Menciónanos a un emprendedor, amigo o colega que quiera mejorar su imagen de marca.",
    step2t: "Tu contacto recibe atención personalizada",
    step2d: "Recibe una bienvenida personalizada y una revisión gratuita en su primer pedido — no un código promo, atención real.",
    step3t: "Te ofrecemos un bono de agradecimiento",
    step3d: "Por cada cliente que nos presentes y que realice un pedido, recibes un crédito para cualquiera de tus proyectos futuros.",
    badge: "Reservado para clientes satisfechos",
    cta: "Convertirme en embajador",
    wa: "Hola INOV Digital Services, quiero recomendar un contacto y unirme al programa Embajadores.",
    note: "Sin límite de recomendaciones. Proceso transparente, sin condiciones ocultas.",
  },
  ht: {
    tag: "Anbasadè",
    title: "Ou rekòmande, yo dekouvri, nou remèsye ou",
    sub: "Pa gen sistèm konplike. Jis konfyans: ou pataje eksperyans ou, nou pran swen moun ou voye ban nou.",
    step1t: "Pataje eksperyans ou",
    step1d: "Ou te renmen travay ak INOV? Pale nou ak yon antreprenè, yon zanmi oswa yon kolèg ki vle amelyore imaj mak li.",
    step2t: "Kontак ou resevwa atansyon pèsonèl",
    step2d: "Li resevwa yon akèy pèsonalize ak yon retouche gratis sou premye kòmand li — pa yon kòd promo, yon vrè atansyon.",
    step3t: "Nou ofri ou yon bonis remèsiman",
    step3d: "Pou chak kliyan ou prezante ki fè yon kòmand, ou resevwa yon kredi pou nenpòt pwojè futur ou.",
    badge: "Rezève pou kliyan satisfè",
    cta: "Vin yon anbasadè",
    wa: "Bonjou INOV Digital Services, mwen vle rekòmande yon kontak epi rantre nan pwogram Anbasadè a.",
    note: "Pa gen limit sou rekòmandasyon. Pwosesis transparan, san kondisyon kache.",
  },
  pt: {
    tag: "Embaixadores",
    title: "Você indica, eles descobrem, nós agradecemos",
    sub: "Sem sistemas complicados. Apenas confiança: você compartilha sua experiência e nós cuidamos de quem você nos envia.",
    step1t: "Compartilhe sua experiência",
    step1d: "Gostou de trabalhar com a INOV? Fale de nós para um empreendedor, amigo ou colega que queira melhorar sua imagem de marca.",
    step2t: "Seu contato recebe atenção personalizada",
    step2d: "Ele recebe uma recepção personalizada e uma revisão gratuita no primeiro pedido — não um código promocional, cuidado verdadeiro.",
    step3t: "Oferecemos um bônus de agradecimento",
    step3d: "Para cada cliente que você nos apresentar e que fizer um pedido, você recebe um crédito para qualquer projeto futuro.",
    badge: "Reservado para clientes satisfeitos",
    cta: "Tornar-me embaixador",
    wa: "Olá INOV Digital Services, quero indicar um contato e entrar no programa Embaixadores.",
    note: "Sem limite de indicações. Processo transparente, sem condições ocultas.",
  },
  it: {
    tag: "Ambasciatori",
    title: "Consigli, scoprono, ti ringraziamo",
    sub: "Nessun sistema complicato. Solo fiducia: condividi la tua esperienza e noi ci prendiamo cura di chi ci mandi.",
    step1t: "Condividi la tua esperienza",
    step1d: "Ti è piaciuto lavorare con INOV? Parlaci a un imprenditore, un amico o un collega che vuole migliorare la sua immagine di marca.",
    step2t: "Il tuo contatto riceve attenzione personale",
    step2d: "Riceve un'accoglienza personalizzata e una revisione gratuita sul primo ordine — non un codice promo, vera attenzione.",
    step3t: "Ti offriamo un bonus di ringraziamento",
    step3d: "Per ogni cliente che ci presenti e che effettua un ordine, ricevi un credito da usare su qualsiasi tuo progetto futuro.",
    badge: "Riservato ai clienti soddisfatti",
    cta: "Diventare ambasciatore",
    wa: "Ciao INOV Digital Services, vorrei consigliare un contatto e unirmi al programma Ambasciatori.",
    note: "Nessun limite di segnalazioni. Processo trasparente, senza condizioni nascoste.",
  },
  de: {
    tag: "Botschafter",
    title: "Sie empfehlen, sie entdecken, wir danken Ihnen",
    sub: "Kein kompliziertes System. Nur Vertrauen: Sie teilen Ihre Erfahrung, wir kümmern uns um jeden, den Sie zu uns schicken.",
    step1t: "Teilen Sie Ihre Erfahrung",
    step1d: "Hat die Arbeit mit INOV Ihnen gefallen? Empfehlen Sie uns einem Unternehmer, Freund oder Kollegen, der sein Markenimage verbessern möchte.",
    step2t: "Ihr Kontakt erhält persönliche Betreuung",
    step2d: "Er erhält ein persönliches Onboarding und eine kostenlose Überarbeitung bei der ersten Bestellung — kein Promo-Code, echte Aufmerksamkeit.",
    step3t: "Wir bieten Ihnen einen Dankesbonus",
    step3d: "Für jeden Kunden, den Sie uns vorstellen und der bestellt, erhalten Sie ein Guthaben für beliebige künftige Projekte.",
    badge: "Nur für zufriedene Kunden",
    cta: "Botschafter werden",
    wa: "Hallo INOV Digital Services, ich möchte einen Kontakt empfehlen und dem Botschafter-Programm beitreten.",
    note: "Keine Begrenzung der Empfehlungen. Transparenter Ablauf, keine versteckten Bedingungen.",
  },
  ar: {
    tag: "السفراء",
    title: "توصي، يكتشفون، نشكرك",
    sub: "لا أنظمة معقدة. فقط ثقة: تشارك تجربتك ونحن نعتني بكل من ترسله إلينا.",
    step1t: "شارك تجربتك",
    step1d: "أعجبك العمل مع INOV؟ أخبر عنا رائد أعمال أو صديقاً أو زميلاً يريد تحسين صورة علامته التجارية.",
    step2t: "جهة اتصالك تحصل على اهتمام شخصي",
    step2d: "يحصل على ترحيب مخصص ومراجعة مجانية على أول طلب — ليس كوداً ترويجياً، بل اهتمام حقيقي.",
    step3t: "نقدم لك مكافأة شكر",
    step3d: "مقابل كل عميل تُعرّفنا به ويضع طلباً، تحصل على رصيد تستخدمه في أي مشروع مستقبلي.",
    badge: "حصري للعملاء الراضين",
    cta: "أصبح سفيراً",
    wa: "مرحباً INOV Digital Services، أريد التوصية بجهة اتصال والانضمام إلى برنامج السفراء.",
    note: "لا حد للتوصيات. عملية شفافة، بلا شروط مخفية.",
  },
}

// Secondary CTA: create/manage a client account and get a personal referral link.
const ACCOUNT_CTA: Record<Lang, string> = {
  fr: "Créer mon compte & obtenir mon lien",
  en: "Create my account & get my link",
  es: "Crear mi cuenta y obtener mi enlace",
  ht: "Kreye kont mwen & jwenn lyen mwen",
  pt: "Criar minha conta e obter meu link",
  it: "Crea il mio account e ottieni il link",
  de: "Konto erstellen & meinen Link erhalten",
  ar: "إنشاء حسابي والحصول على رابطي",
}

const STEPS = (c: typeof COPY.fr) => [
  { Icon: Star, t: c.step1t, d: c.step1d, num: "01" },
  { Icon: Handshake, t: c.step2t, d: c.step2d, num: "02" },
  { Icon: Award, t: c.step3t, d: c.step3d, num: "03" },
]

const STEP_MS = 4500

export default function Referral() {
  const { lang } = useSettings()
  const reduced = useReducedMotion()
  const c = COPY[lang] ?? COPY.fr
  const steps = STEPS(c)

  const [active, setActive] = useState(0)
  const [animKey, setAnimKey] = useState(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  function restart() {
    if (timerRef.current) clearInterval(timerRef.current)
    if (!reduced) timerRef.current = setInterval(() => {
      setActive((a) => (a + 1) % steps.length)
      setAnimKey((k) => k + 1)
    }, STEP_MS)
  }

  useEffect(() => {
    restart()
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced, steps.length])

  function goTo(i: number) {
    setActive((i + steps.length) % steps.length)
    setAnimKey((k) => k + 1)
    restart()
  }

  return (
    <section id="referral" style={{ background: "var(--ds-bg-card)", padding: "96px 0" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 var(--section-px)" }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 60 }}>
          <div style={{ marginBottom: 20 }}>
            <span className="section-tag"><span className="dot-pulse" />{c.tag}</span>
          </div>
          <h2 className="section-title" style={{ marginBottom: 16, maxWidth: 680, margin: "0 auto 16px" }}>{c.title}</h2>
          <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: 17.6, color: "var(--ds-text-sec)", maxWidth: 560, margin: "0 auto", lineHeight: 1.7 }}>{c.sub}</p>
        </div>

        {/* Steps — carousel */}
        <style>{`
          @keyframes amb-fade-up {
            from { opacity: 0; transform: translateY(20px); }
            to   { opacity: 1; transform: translateY(0); }
          }
          @keyframes amb-progress { from { transform: scaleX(0) } to { transform: scaleX(1) } }
          .amb-slide-in { animation: amb-fade-up 0.55s cubic-bezier(0.22,1,0.36,1) both; }
          .amb-arrow {
            width: 44px; height: 44px; border-radius: 50%;
            display: inline-flex; align-items: center; justify-content: center;
            background: var(--ds-bg-card); border: 1px solid var(--ds-border);
            color: var(--ds-text); cursor: pointer; flex-shrink: 0;
            transition: transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease;
          }
          .amb-arrow:hover, .amb-arrow:focus-visible {
            transform: translateY(-2px); border-color: var(--ds-accent);
            box-shadow: 0 8px 22px rgba(var(--ds-accent-rgb),0.22);
          }
          .amb-arrow-mobile { display: none !important; }
          @media (max-width: 640px) {
            .amb-arrow-side { display: none !important; }
            .amb-arrow-mobile { display: inline-flex !important; }
          }
        `}</style>

        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
          <button className="amb-arrow amb-arrow-side" aria-label="Précédent" onClick={() => goTo(active - 1)}>
            <ChevronLeft size={20} />
          </button>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              key={animKey}
              className={reduced ? undefined : "amb-slide-in"}
              style={{ perspective: 1000 }}
            >
              {(() => {
                const { Icon, t, d, num } = steps[active]
                return (
                  <div className="card" style={{ padding: "44px clamp(28px, 5vw, 56px)", boxSizing: "border-box", position: "relative", overflow: "hidden", textAlign: "center" }}>
                    {/* ghost number */}
                    <div style={{
                      position: "absolute", bottom: -14, insetInlineEnd: 20,
                      fontFamily: "'Space Grotesk', sans-serif", fontSize: 120, fontWeight: 800,
                      color: "rgba(var(--ds-accent-rgb),0.06)", lineHeight: 1, userSelect: "none", pointerEvents: "none",
                    }}>{num}</div>
                    {/* icon */}
                    <div style={{
                      width: 64, height: 64, borderRadius: "var(--r-lg)", margin: "0 auto 22px",
                      background: "var(--ds-accent-grad)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      boxShadow: "0 12px 30px var(--ds-accent-a32)",
                    }}>
                      <Icon size={30} color="#fff" strokeWidth={1.8} />
                    </div>
                    {/* step badge */}
                    <div style={{
                      display: "inline-flex", alignItems: "center", gap: 7, marginBottom: 14,
                      fontFamily: "'Space Grotesk', sans-serif", fontSize: 11.5, fontWeight: 700, letterSpacing: 1,
                      textTransform: "uppercase", color: "var(--ds-accent-text)",
                    }}>
                      <span style={{ width: 18, height: 2, background: "var(--ds-accent)", borderRadius: 2, display: "inline-block" }} />
                      {num} / 0{steps.length}
                    </div>
                    <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 24, fontWeight: 800, color: "var(--ds-text)", marginBottom: 12, lineHeight: 1.25, position: "relative", zIndex: 1 }}>{t}</h3>
                    <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: 15.5, color: "var(--ds-text-sec)", lineHeight: 1.75, position: "relative", zIndex: 1, maxWidth: 520, margin: "0 auto" }}>{d}</p>
                  </div>
                )
              })()}
            </div>
          </div>

          <button className="amb-arrow amb-arrow-side" aria-label="Suivant" onClick={() => goTo(active + 1)}>
            <ChevronRight size={20} />
          </button>
        </div>

        {/* Indicators + mobile arrows */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 14, marginBottom: 52 }}>
          <button className="amb-arrow amb-arrow-mobile" aria-label="Précédent" onClick={() => goTo(active - 1)}>
            <ChevronLeft size={18} />
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {steps.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                aria-label={`Étape ${i + 1}`}
                style={{
                  position: "relative", height: 3, width: i === active ? 48 : 16, borderRadius: "var(--r-full)",
                  border: "none", padding: 0, cursor: "pointer", overflow: "hidden",
                  background: i === active ? "var(--ds-border-strong)" : "var(--ds-border)",
                  transition: "width 0.35s cubic-bezier(0.4,0,0.2,1)", flexShrink: 0,
                }}
              >
                {i === active && !reduced && (
                  <span key={animKey} style={{
                    position: "absolute", inset: 0, background: "var(--ds-accent)", borderRadius: "var(--r-full)",
                    transformOrigin: "left center", animation: `amb-progress ${STEP_MS}ms linear forwards`,
                  }} />
                )}
                {i === active && reduced && (
                  <span style={{ position: "absolute", inset: 0, background: "var(--ds-accent)", borderRadius: "var(--r-full)" }} />
                )}
              </button>
            ))}
          </div>
          <button className="amb-arrow amb-arrow-mobile" aria-label="Suivant" onClick={() => goTo(active + 1)}>
            <ChevronRight size={18} />
          </button>
        </div>

        {/* CTA block */}
        <div style={{
          background: "var(--ds-accent-tint-grad)",
          border: "1px solid var(--ds-accent-a15)", borderRadius: "var(--r-xl)",
          padding: "40px 44px", display: "flex", flexDirection: "column", alignItems: "center", gap: 20, textAlign: "center",
        }}>
          <span style={{
            fontFamily: "'Space Grotesk', sans-serif", fontSize: 11.5, fontWeight: 700, letterSpacing: 0.8,
            textTransform: "uppercase", color: "var(--ds-accent-text)", background: "var(--ds-accent-a10)", padding: "5px 14px", borderRadius: "var(--r-full)",
          }}>{c.badge}</span>
          <a
            href={`https://wa.me/${WA}?text=${encodeURIComponent(c.wa)}`}
            target="_blank" rel="noreferrer"
            onClick={() => track("ambassador_click", { source: "ambassador_section" })}
            className="btn-orange"
            style={{
              display: "inline-flex", alignItems: "center", gap: 10, padding: "15px 36px", borderRadius: "var(--r-md)",
              color: "#fff", fontFamily: "'Outfit', sans-serif", fontSize: 16, fontWeight: 700, textDecoration: "none",
            }}
          >
            <SiWhatsapp size={20} /> {c.cta}
          </a>
          <Link
            to="/compte"
            onClick={() => track("ambassador_account_click", { source: "ambassador_section" })}
            style={{
              display: "inline-flex", alignItems: "center", gap: 9, padding: "13px 30px", borderRadius: "var(--r-md)",
              border: "1px solid var(--ds-accent)", background: "transparent",
              color: "var(--ds-accent-text)", fontFamily: "'Outfit', sans-serif", fontSize: 15, fontWeight: 700, textDecoration: "none",
            }}
          >
            <UserPlus size={18} /> {ACCOUNT_CTA[lang] ?? ACCOUNT_CTA.fr}
          </Link>
          <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: 13, color: "var(--ds-text-faint)", maxWidth: 480, lineHeight: 1.6 }}>{c.note}</p>
        </div>

      </div>
    </section>
  )
}
