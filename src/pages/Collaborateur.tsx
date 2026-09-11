import { useEffect, useRef, useState } from "react"
import { Link } from "react-router"
import {
  ArrowLeft, Handshake, Send, CheckCircle2, MessageCircle, AtSign, Globe,
  Camera, Sparkles, MapPin, Loader2,
} from "lucide-react"
import { useSettings } from "../context/AppSettings"
import type { Lang } from "../i18n/translations"
import { applyPageMeta } from "../lib/seo"
import { track } from "../lib/analytics"
import { api, type PublicCollaborateur, type CollaborateurInput } from "../lib/api"
import { supabase } from "../lib/supabaseClient"

type Str = {
  eyebrow: string; title: string; intro: string; back: string
  galleryTitle: string; empty: string; emptyHint: string
  applyTitle: string; applyIntro: string
  name: string; profession: string; professionPh: string; service: string; servicePh: string
  desc: string; descPh: string; price: string; pricePh: string; city: string
  whatsapp: string; instagram: string; website: string; email: string
  photo: string; photoHint: string; uploading: string; preview: string
  accent: string; submit: string; sending: string
  ok: string; okHint: string; required: string; contactReq: string; error: string
  contact: string; via: string
}
const TR: Record<Lang, Str> = {
  fr: {
    eyebrow: "Espace Collaborateur", title: "Rejoins le réseau INOV",
    intro: "Tu es un pro (photographe, monteur, développeur, community manager…) ? Propose tes services et obtiens une carte promo aux couleurs d'INOV, mise en avant après validation.",
    back: "Retour à l'accueil", galleryTitle: "Nos collaborateurs",
    empty: "Sois le premier collaborateur", emptyHint: "Remplis le formulaire ci-dessous — ta carte sera publiée après validation.",
    applyTitle: "Deviens collaborateur", applyIntro: "Remplis tes infos : on génère automatiquement ta carte promo. L'aperçu se met à jour en direct.",
    name: "Nom / marque", profession: "Métier", professionPh: "Ex. Photographe, Monteur vidéo…",
    service: "Service proposé", servicePh: "Ex. Shooting produit, montage réels…",
    desc: "Description", descPh: "Décris ton service en quelques mots percutants.",
    price: "Tarif", pricePh: "Ex. À partir de 1500 HTG", city: "Ville (optionnel)",
    whatsapp: "WhatsApp", instagram: "Instagram (@ ou lien)", website: "Site web (optionnel)",
    email: "E-mail (privé, pour te contacter)", photo: "Photo / logo",
    photoHint: "PNG, JPG ou WEBP — 8 Mo max.", uploading: "Téléversement…", preview: "Aperçu de ta carte",
    accent: "Couleur d'accent", submit: "Envoyer ma candidature", sending: "Envoi…",
    ok: "Candidature envoyée !", okHint: "On valide ta carte rapidement. Tu la verras apparaître dans la galerie une fois approuvée.",
    required: "Renseigne au moins ton nom, ton métier et ton service.",
    contactReq: "Ajoute au moins un moyen de contact (WhatsApp ou e-mail).",
    error: "Un souci est survenu. Réessaie ou écris-nous sur WhatsApp.",
    contact: "Contacter", via: "Proposé par",
  },
  en: {
    eyebrow: "Collaborator Space", title: "Join the INOV network",
    intro: "Are you a pro (photographer, editor, developer, community manager…)? Offer your services and get a promo card in INOV's colours, featured after review.",
    back: "Back to home", galleryTitle: "Our collaborators",
    empty: "Be the first collaborator", emptyHint: "Fill in the form below — your card is published after review.",
    applyTitle: "Become a collaborator", applyIntro: "Enter your info: we auto-generate your promo card. The preview updates live.",
    name: "Name / brand", profession: "Profession", professionPh: "e.g. Photographer, Video editor…",
    service: "Service offered", servicePh: "e.g. Product shoot, reels editing…",
    desc: "Description", descPh: "Describe your service in a few punchy words.",
    price: "Rate", pricePh: "e.g. From $25", city: "City (optional)",
    whatsapp: "WhatsApp", instagram: "Instagram (@ or link)", website: "Website (optional)",
    email: "Email (private, to reach you)", photo: "Photo / logo",
    photoHint: "PNG, JPG or WEBP — 8 MB max.", uploading: "Uploading…", preview: "Your card preview",
    accent: "Accent colour", submit: "Send my application", sending: "Sending…",
    ok: "Application sent!", okHint: "We'll review your card soon. It appears in the gallery once approved.",
    required: "Please add at least your name, profession and service.",
    contactReq: "Add at least one contact channel (WhatsApp or email).",
    error: "Something went wrong. Try again or message us on WhatsApp.",
    contact: "Contact", via: "Offered by",
  },
  es: {
    eyebrow: "Espacio Colaborador", title: "Únete a la red INOV",
    intro: "¿Eres un profesional (fotógrafo, editor, desarrollador, community manager…)? Ofrece tus servicios y obtén una tarjeta promo con los colores de INOV, destacada tras validación.",
    back: "Volver al inicio", galleryTitle: "Nuestros colaboradores",
    empty: "Sé el primer colaborador", emptyHint: "Rellena el formulario — tu tarjeta se publica tras validación.",
    applyTitle: "Hazte colaborador", applyIntro: "Ingresa tus datos: generamos tu tarjeta promo automáticamente. La vista previa se actualiza en vivo.",
    name: "Nombre / marca", profession: "Profesión", professionPh: "Ej. Fotógrafo, Editor…",
    service: "Servicio ofrecido", servicePh: "Ej. Sesión de producto, edición de reels…",
    desc: "Descripción", descPh: "Describe tu servicio en pocas palabras.",
    price: "Tarifa", pricePh: "Ej. Desde $25", city: "Ciudad (opcional)",
    whatsapp: "WhatsApp", instagram: "Instagram (@ o enlace)", website: "Sitio web (opcional)",
    email: "Correo (privado, para contactarte)", photo: "Foto / logo",
    photoHint: "PNG, JPG o WEBP — 8 MB máx.", uploading: "Subiendo…", preview: "Vista previa de tu tarjeta",
    accent: "Color de acento", submit: "Enviar candidatura", sending: "Enviando…",
    ok: "¡Candidatura enviada!", okHint: "Revisaremos tu tarjeta pronto. Aparecerá en la galería tras aprobarse.",
    required: "Añade al menos nombre, profesión y servicio.",
    contactReq: "Añade al menos un contacto (WhatsApp o correo).",
    error: "Algo salió mal. Inténtalo de nuevo o escríbenos por WhatsApp.",
    contact: "Contactar", via: "Ofrecido por",
  },
  ht: {
    eyebrow: "Espas Kolaboratè", title: "Antre nan rezo INOV la",
    intro: "Ou se yon pwofesyonèl (fotograf, montè, devlopè, jesyonè rezo sosyal…)? Pwopoze sèvis ou epi jwenn yon kat pwomosyon nan koulè INOV, ki parèt apre validasyon.",
    back: "Tounen nan akèy", galleryTitle: "Kolaboratè nou yo",
    empty: "Vin premye kolaboratè a", emptyHint: "Ranpli fòm nan anba a — kat ou ap pibliye apre validasyon.",
    applyTitle: "Vin yon kolaboratè", applyIntro: "Mete enfòmasyon ou : n ap kreye kat pwomosyon ou otomatikman. Apèsi a chanje an dirèk.",
    name: "Non / mak", profession: "Metye", professionPh: "Egz. Fotograf, Montè videyo…",
    service: "Sèvis ou pwopoze", servicePh: "Egz. Foto pwodwi, montaj reels…",
    desc: "Deskripsyon", descPh: "Dekri sèvis ou an kèk mo ki frape.",
    price: "Pri", pricePh: "Egz. Apati 1500 HTG", city: "Vil (opsyonèl)",
    whatsapp: "WhatsApp", instagram: "Instagram (@ oswa lyen)", website: "Sit entènèt (opsyonèl)",
    email: "Imèl (prive, pou kontakte w)", photo: "Foto / logo",
    photoHint: "PNG, JPG oswa WEBP — 8 Mo maks.", uploading: "N ap voye…", preview: "Apèsi kat ou",
    accent: "Koulè aksan", submit: "Voye kandidati m", sending: "N ap voye…",
    ok: "Kandidati ou voye!", okHint: "N ap valide kat ou byen vit. L ap parèt nan galri a lè l apwouve.",
    required: "Mete omwen non w, metye w ak sèvis ou.",
    contactReq: "Mete omwen yon fason pou kontakte w (WhatsApp oswa imèl).",
    error: "Gen yon pwoblèm. Eseye ankò oswa ekri nou sou WhatsApp.",
    contact: "Kontakte", via: "Pwopoze pa",
  },
  pt: {
    eyebrow: "Espaço Colaborador", title: "Junte-se à rede INOV",
    intro: "É um profissional (fotógrafo, editor, desenvolvedor, community manager…)? Ofereça seus serviços e ganhe um cartão promo nas cores da INOV, destacado após validação.",
    back: "Voltar ao início", galleryTitle: "Nossos colaboradores",
    empty: "Seja o primeiro colaborador", emptyHint: "Preencha o formulário — seu cartão é publicado após validação.",
    applyTitle: "Torne-se colaborador", applyIntro: "Insira seus dados: geramos seu cartão promo automaticamente. A prévia atualiza em tempo real.",
    name: "Nome / marca", profession: "Profissão", professionPh: "Ex. Fotógrafo, Editor…",
    service: "Serviço oferecido", servicePh: "Ex. Foto de produto, edição de reels…",
    desc: "Descrição", descPh: "Descreva seu serviço em poucas palavras.",
    price: "Preço", pricePh: "Ex. A partir de $25", city: "Cidade (opcional)",
    whatsapp: "WhatsApp", instagram: "Instagram (@ ou link)", website: "Site (opcional)",
    email: "E-mail (privado, para contato)", photo: "Foto / logo",
    photoHint: "PNG, JPG ou WEBP — 8 MB máx.", uploading: "Enviando…", preview: "Prévia do seu cartão",
    accent: "Cor de destaque", submit: "Enviar candidatura", sending: "Enviando…",
    ok: "Candidatura enviada!", okHint: "Revisaremos seu cartão em breve. Aparecerá na galeria após aprovação.",
    required: "Informe ao menos nome, profissão e serviço.",
    contactReq: "Adicione ao menos um contato (WhatsApp ou e-mail).",
    error: "Algo deu errado. Tente novamente ou fale no WhatsApp.",
    contact: "Contatar", via: "Oferecido por",
  },
  it: {
    eyebrow: "Spazio Collaboratore", title: "Entra nella rete INOV",
    intro: "Sei un professionista (fotografo, montatore, sviluppatore, community manager…)? Offri i tuoi servizi e ottieni una card promo nei colori INOV, in evidenza dopo la verifica.",
    back: "Torna alla home", galleryTitle: "I nostri collaboratori",
    empty: "Sii il primo collaboratore", emptyHint: "Compila il modulo — la tua card viene pubblicata dopo la verifica.",
    applyTitle: "Diventa collaboratore", applyIntro: "Inserisci i tuoi dati: generiamo la tua card promo automaticamente. L'anteprima si aggiorna dal vivo.",
    name: "Nome / brand", profession: "Professione", professionPh: "Es. Fotografo, Montatore…",
    service: "Servizio offerto", servicePh: "Es. Shooting prodotto, montaggio reels…",
    desc: "Descrizione", descPh: "Descrivi il tuo servizio in poche parole.",
    price: "Tariffa", pricePh: "Es. Da 25$", city: "Città (facoltativo)",
    whatsapp: "WhatsApp", instagram: "Instagram (@ o link)", website: "Sito web (facoltativo)",
    email: "E-mail (privata, per contattarti)", photo: "Foto / logo",
    photoHint: "PNG, JPG o WEBP — 8 MB max.", uploading: "Caricamento…", preview: "Anteprima della card",
    accent: "Colore accento", submit: "Invia candidatura", sending: "Invio…",
    ok: "Candidatura inviata!", okHint: "Verificheremo presto la tua card. Apparirà nella galleria dopo l'approvazione.",
    required: "Inserisci almeno nome, professione e servizio.",
    contactReq: "Aggiungi almeno un contatto (WhatsApp o e-mail).",
    error: "Qualcosa è andato storto. Riprova o scrivici su WhatsApp.",
    contact: "Contatta", via: "Offerto da",
  },
  de: {
    eyebrow: "Kollaborateur-Bereich", title: "Werde Teil des INOV-Netzwerks",
    intro: "Du bist ein Profi (Fotograf, Cutter, Entwickler, Community-Manager…)? Biete deine Dienste an und erhalte eine Promo-Karte in INOV-Farben, hervorgehoben nach Prüfung.",
    back: "Zur Startseite", galleryTitle: "Unsere Kollaborateure",
    empty: "Sei der erste Kollaborateur", emptyHint: "Fülle das Formular aus — deine Karte wird nach Prüfung veröffentlicht.",
    applyTitle: "Kollaborateur werden", applyIntro: "Gib deine Infos ein: Wir erstellen deine Promo-Karte automatisch. Die Vorschau aktualisiert sich live.",
    name: "Name / Marke", profession: "Beruf", professionPh: "z. B. Fotograf, Cutter…",
    service: "Angebotener Service", servicePh: "z. B. Produktshooting, Reels-Schnitt…",
    desc: "Beschreibung", descPh: "Beschreibe deinen Service in wenigen Worten.",
    price: "Preis", pricePh: "z. B. Ab 25 $", city: "Stadt (optional)",
    whatsapp: "WhatsApp", instagram: "Instagram (@ oder Link)", website: "Webseite (optional)",
    email: "E-Mail (privat, für Kontakt)", photo: "Foto / Logo",
    photoHint: "PNG, JPG oder WEBP — max. 8 MB.", uploading: "Hochladen…", preview: "Vorschau deiner Karte",
    accent: "Akzentfarbe", submit: "Bewerbung senden", sending: "Senden…",
    ok: "Bewerbung gesendet!", okHint: "Wir prüfen deine Karte bald. Sie erscheint nach Freigabe in der Galerie.",
    required: "Bitte mindestens Name, Beruf und Service angeben.",
    contactReq: "Füge mindestens einen Kontakt hinzu (WhatsApp oder E-Mail).",
    error: "Etwas ist schiefgelaufen. Versuche es erneut oder schreib uns per WhatsApp.",
    contact: "Kontakt", via: "Angeboten von",
  },
  ar: {
    eyebrow: "مساحة المتعاونين", title: "انضم إلى شبكة INOV",
    intro: "هل أنت محترف (مصوّر، مونتير، مطوّر، مدير مجتمع…)؟ اعرض خدماتك واحصل على بطاقة ترويجية بألوان INOV، تُبرَز بعد المراجعة.",
    back: "العودة للرئيسية", galleryTitle: "متعاونونا",
    empty: "كن أول متعاون", emptyHint: "املأ النموذج أدناه — تُنشر بطاقتك بعد المراجعة.",
    applyTitle: "كن متعاوناً", applyIntro: "أدخل بياناتك: ننشئ بطاقتك الترويجية تلقائياً. تتحدّث المعاينة مباشرة.",
    name: "الاسم / العلامة", profession: "المهنة", professionPh: "مثل مصوّر، مونتير…",
    service: "الخدمة المقدّمة", servicePh: "مثل تصوير منتجات، مونتاج ريلز…",
    desc: "الوصف", descPh: "صف خدمتك بكلمات موجزة ومؤثرة.",
    price: "السعر", pricePh: "مثل ابتداءً من 25$", city: "المدينة (اختياري)",
    whatsapp: "واتساب", instagram: "إنستغرام (@ أو رابط)", website: "الموقع (اختياري)",
    email: "البريد (خاص، للتواصل)", photo: "صورة / شعار",
    photoHint: "PNG أو JPG أو WEBP — 8 ميغابايت كحد أقصى.", uploading: "جارٍ الرفع…", preview: "معاينة بطاقتك",
    accent: "لون التمييز", submit: "إرسال الطلب", sending: "جارٍ الإرسال…",
    ok: "تم إرسال الطلب!", okHint: "سنراجع بطاقتك قريباً. ستظهر في المعرض بعد الموافقة.",
    required: "أضف على الأقل الاسم والمهنة والخدمة.",
    contactReq: "أضف وسيلة تواصل واحدة على الأقل (واتساب أو بريد).",
    error: "حدث خطأ. حاول مجدداً أو راسلنا على واتساب.",
    contact: "تواصل", via: "مقدَّم من",
  },
}

// INOV brand accent choices for the promo card.
const ACCENTS = ["#F7931E", "#FF6B35", "#7C3AED", "#0EA5E9", "#16A34A", "#E11D48"]

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "11px 13px", borderRadius: "var(--r-md)",
  border: "1px solid var(--ds-border)", background: "var(--ds-bg)",
  color: "var(--ds-text)", fontSize: 14.5, fontFamily: "'Outfit', sans-serif",
}
const label: React.CSSProperties = {
  display: "block", fontFamily: "'Outfit', sans-serif", fontSize: 12.5, fontWeight: 700,
  color: "var(--ds-text)", marginBottom: 6,
}

function waLink(v: string) {
  const d = v.replace(/[^\d]/g, "")
  return d ? `https://wa.me/${d}` : ""
}
function igLink(v: string) {
  const h = v.trim().replace(/^@/, "")
  if (!h) return ""
  return h.startsWith("http") ? h : `https://instagram.com/${h}`
}
function siteLink(v: string) {
  const u = v.trim()
  if (!u) return ""
  return u.startsWith("http") ? u : `https://${u}`
}

/** The branded promo card — used both live in the form preview and in the gallery. */
function PromoCard({ c, s }: { c: Partial<PublicCollaborateur>; s: Str }) {
  const accent = c.accent || "#F7931E"
  const initials = (c.name || "INOV").trim().split(/\s+/).slice(0, 2).map((w) => w[0]).join("").toUpperCase()
  const wa = waLink(c.whatsapp || "")
  const ig = igLink(c.instagram || "")
  const web = siteLink(c.website || "")
  return (
    <div style={{
      position: "relative", borderRadius: "var(--r-xl)", overflow: "hidden",
      background: "var(--ds-bg-card)", border: "1px solid var(--ds-border)",
      display: "flex", flexDirection: "column",
    }}>
      {/* Brand band */}
      <div style={{ height: 74, background: `linear-gradient(135deg, ${accent}, #FF6B35)`, position: "relative" }}>
        <span style={{ position: "absolute", top: 12, insetInlineEnd: 14, fontFamily: "'Outfit', sans-serif", fontSize: 11, fontWeight: 800, letterSpacing: "0.08em", color: "rgba(255,255,255,0.92)", textTransform: "uppercase" }}>
          INOV · {s.via.split(" ")[0]}
        </span>
      </div>
      {/* Avatar */}
      <div style={{ padding: "0 20px", marginTop: -34 }}>
        <div style={{
          width: 68, height: 68, borderRadius: "var(--r-full)", border: "3px solid var(--ds-bg-card)",
          background: c.photoUrl ? `center/cover no-repeat url(${c.photoUrl})` : `linear-gradient(135deg, ${accent}, #FF6B35)`,
          display: "grid", placeItems: "center", color: "#fff", fontFamily: "'Outfit', sans-serif",
          fontWeight: 800, fontSize: 24, overflow: "hidden",
        }}>
          {!c.photoUrl && initials}
        </div>
      </div>
      <div style={{ padding: "12px 20px 20px", display: "flex", flexDirection: "column", flex: 1 }}>
        <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 18, fontWeight: 800, color: "var(--ds-text)", margin: "0 0 2px" }}>
          {c.name || s.name}
        </h3>
        <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: 13.5, fontWeight: 700, color: accent, margin: "0 0 4px" }}>
          {c.profession || s.profession}
        </p>
        {c.city && (
          <p style={{ display: "inline-flex", alignItems: "center", gap: 4, fontFamily: "'Outfit', sans-serif", fontSize: 12.5, color: "var(--ds-text-muted)", margin: "0 0 8px" }}>
            <MapPin size={12} /> {c.city}
          </p>
        )}
        <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: 14, fontWeight: 700, color: "var(--ds-text)", margin: "8px 0 4px" }}>
          {c.service || s.service}
        </p>
        {c.description && (
          <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: 13.5, lineHeight: 1.5, color: "var(--ds-text-muted)", margin: "0 0 10px" }}>
            {c.description}
          </p>
        )}
        {c.price && (
          <span style={{ display: "inline-block", alignSelf: "flex-start", padding: "4px 12px", borderRadius: "var(--r-full)", background: "var(--ds-bg-card-hover)", fontFamily: "'Outfit', sans-serif", fontSize: 13, fontWeight: 800, color: "var(--ds-text)", marginBottom: 14 }}>
            {c.price}
          </span>
        )}
        <div style={{ marginTop: "auto", display: "flex", gap: 8, flexWrap: "wrap" }}>
          {wa && (
            <a href={wa} target="_blank" rel="noopener noreferrer" aria-label={`${s.contact} WhatsApp`}
              style={{ flex: 1, minWidth: 110, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "9px 12px", borderRadius: "var(--r-md)", background: "#25D366", color: "#fff", fontFamily: "'Outfit', sans-serif", fontSize: 13.5, fontWeight: 700, textDecoration: "none" }}>
              <MessageCircle size={15} /> {s.contact}
            </a>
          )}
          {ig && (
            <a href={ig} target="_blank" rel="noopener noreferrer" aria-label="Instagram"
              style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", padding: "9px 11px", borderRadius: "var(--r-md)", background: "var(--ds-bg-card-hover)", color: "var(--ds-text)", textDecoration: "none" }}>
              <AtSign size={16} />
            </a>
          )}
          {web && (
            <a href={web} target="_blank" rel="noopener noreferrer" aria-label="Site web"
              style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", padding: "9px 11px", borderRadius: "var(--r-md)", background: "var(--ds-bg-card-hover)", color: "var(--ds-text)", textDecoration: "none" }}>
              <Globe size={16} />
            </a>
          )}
        </div>
      </div>
    </div>
  )
}

const empty: CollaborateurInput = {
  name: "", profession: "", service: "", description: "", price: "", city: "",
  photoUrl: "", phone: "", email: "", whatsapp: "", instagram: "", website: "", accent: "#F7931E",
}

export default function Collaborateur() {
  const { lang } = useSettings()
  const s = TR[lang] ?? TR.fr
  const [gallery, setGallery] = useState<PublicCollaborateur[] | null>(null)
  const [form, setForm] = useState<CollaborateurInput>(empty)
  const [uploading, setUploading] = useState(false)
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState("")
  const fileInput = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    applyPageMeta({ title: `${s.title} — INOV Digital Services`, description: s.intro, type: "website" })
    track("view_collaborateur")
    window.scrollTo(0, 0)
    api.listCollaborateurs().then((r) => setGallery(r.collaborateurs)).catch(() => setGallery([]))
  }, [s.title, s.intro])

  const set = (k: keyof CollaborateurInput, v: string) => setForm((f) => ({ ...f, [k]: v }))

  async function onPhoto(file: File | null) {
    if (!file) return
    setError("")
    setUploading(true)
    try {
      const { path, token, bucket, publicUrl } = await api.collabUploadUrl({
        filename: file.name, contentType: file.type || "image/jpeg", size: file.size,
      })
      const { error: upErr } = await supabase.storage.from(bucket).uploadToSignedUrl(path, token, file)
      if (upErr) throw new Error("upload")
      set("photoUrl", publicUrl)
    } catch {
      setError(s.error)
    } finally {
      setUploading(false)
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    if (!form.name.trim() || !form.profession.trim() || form.service.trim().length < 3) { setError(s.required); return }
    if (!form.whatsapp?.trim() && !form.email?.trim()) { setError(s.contactReq); return }
    setBusy(true)
    try {
      await api.submitCollaborateur(form)
      track("collaborateur_submit")
      setDone(true)
      window.scrollTo({ top: 0, behavior: "smooth" })
    } catch {
      setError(s.error)
    } finally {
      setBusy(false)
    }
  }

  return (
    <section style={{ background: "var(--ds-bg-sec)", padding: "64px 0 96px", minHeight: "70vh" }}>
      <style>{`
        @media (max-width: 860px) {
          .collab-apply { grid-template-columns: 1fr !important; }
          .collab-apply .collab-preview { position: static !important; }
        }
        @media (max-width: 520px) {
          .collab-2 { grid-template-columns: 1fr !important; }
        }
      `}</style>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 var(--section-px)" }}>
        <Link to="/" style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "var(--ds-text-muted)", fontSize: 14, fontFamily: "'Outfit', sans-serif", textDecoration: "none", marginBottom: 28 }}>
          <ArrowLeft size={16} /> {s.back}
        </Link>

        <div style={{ maxWidth: 760, marginBottom: 44 }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 10px", borderRadius: "var(--r-full)", background: "var(--ds-accent-a12)", color: "var(--ds-accent)", fontFamily: "'Outfit', sans-serif", fontSize: 12, fontWeight: 700, marginBottom: 16 }}>
            <Handshake size={14} /> {s.eyebrow}
          </span>
          <h1 style={{ fontFamily: "'Outfit', sans-serif", fontSize: "clamp(30px, 5vw, 46px)", fontWeight: 800, lineHeight: 1.08, color: "var(--ds-text)", margin: "0 0 14px", letterSpacing: "-0.02em" }}>
            {s.title}
          </h1>
          <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: 17, lineHeight: 1.6, color: "var(--ds-text-muted)", margin: 0 }}>
            {s.intro}
          </p>
        </div>

        {/* Gallery */}
        {gallery && gallery.length > 0 && (
          <div style={{ marginBottom: 64 }}>
            <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 24, fontWeight: 800, color: "var(--ds-text)", margin: "0 0 22px" }}>{s.galleryTitle}</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 22 }}>
              {gallery.map((c) => <PromoCard key={c.id} c={c} s={s} />)}
            </div>
          </div>
        )}

        {/* Application form + live preview */}
        <div id="apply" className="collab-apply" style={{ display: "grid", gap: 32, gridTemplateColumns: "minmax(0, 1.2fr) minmax(0, 0.9fr)", alignItems: "start" }}>
          <div style={{ background: "var(--ds-bg-card)", border: "1px solid var(--ds-border)", borderRadius: "var(--r-xl)", padding: 28 }}>
            {done ? (
              <div style={{ textAlign: "center", padding: "28px 0" }}>
                <CheckCircle2 size={48} style={{ color: "var(--ds-success)", marginBottom: 16 }} />
                <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: 19, fontWeight: 800, color: "var(--ds-text)", margin: "0 0 8px" }}>{s.ok}</p>
                <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: 15, lineHeight: 1.55, color: "var(--ds-text-muted)", margin: 0 }}>{s.okHint}</p>
              </div>
            ) : (
              <>
                <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 22, fontWeight: 800, color: "var(--ds-text)", margin: "0 0 6px" }}>{s.applyTitle}</h2>
                <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: 14.5, lineHeight: 1.55, color: "var(--ds-text-muted)", margin: "0 0 22px" }}>{s.applyIntro}</p>
                <form onSubmit={submit} style={{ display: "grid", gap: 16 }}>
                  <div className="collab-2" style={{ display: "grid", gap: 16, gridTemplateColumns: "1fr 1fr" }}>
                    <div><label style={label} htmlFor="c-name">{s.name}</label><input id="c-name" style={inputStyle} value={form.name} onChange={(e) => set("name", e.target.value)} required /></div>
                    <div><label style={label} htmlFor="c-prof">{s.profession}</label><input id="c-prof" style={inputStyle} placeholder={s.professionPh} value={form.profession} onChange={(e) => set("profession", e.target.value)} required /></div>
                  </div>
                  <div><label style={label} htmlFor="c-svc">{s.service}</label><input id="c-svc" style={inputStyle} placeholder={s.servicePh} value={form.service} onChange={(e) => set("service", e.target.value)} required /></div>
                  <div><label style={label} htmlFor="c-desc">{s.desc}</label><textarea id="c-desc" style={{ ...inputStyle, minHeight: 74, resize: "vertical" }} placeholder={s.descPh} value={form.description} onChange={(e) => set("description", e.target.value)} /></div>
                  <div className="collab-2" style={{ display: "grid", gap: 16, gridTemplateColumns: "1fr 1fr" }}>
                    <div><label style={label} htmlFor="c-price">{s.price}</label><input id="c-price" style={inputStyle} placeholder={s.pricePh} value={form.price} onChange={(e) => set("price", e.target.value)} /></div>
                    <div><label style={label} htmlFor="c-city">{s.city}</label><input id="c-city" style={inputStyle} value={form.city} onChange={(e) => set("city", e.target.value)} /></div>
                  </div>
                  <div className="collab-2" style={{ display: "grid", gap: 16, gridTemplateColumns: "1fr 1fr" }}>
                    <div><label style={label} htmlFor="c-wa">{s.whatsapp}</label><input id="c-wa" style={inputStyle} value={form.whatsapp} onChange={(e) => set("whatsapp", e.target.value)} /></div>
                    <div><label style={label} htmlFor="c-ig">{s.instagram}</label><input id="c-ig" style={inputStyle} value={form.instagram} onChange={(e) => set("instagram", e.target.value)} /></div>
                  </div>
                  <div className="collab-2" style={{ display: "grid", gap: 16, gridTemplateColumns: "1fr 1fr" }}>
                    <div><label style={label} htmlFor="c-web">{s.website}</label><input id="c-web" style={inputStyle} value={form.website} onChange={(e) => set("website", e.target.value)} /></div>
                    <div><label style={label} htmlFor="c-mail">{s.email}</label><input id="c-mail" type="email" style={inputStyle} value={form.email} onChange={(e) => set("email", e.target.value)} /></div>
                  </div>

                  {/* Photo */}
                  <div>
                    <label style={label}>{s.photo}</label>
                    <input ref={fileInput} type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" hidden onChange={(e) => onPhoto(e.target.files?.[0] ?? null)} />
                    <button type="button" onClick={() => fileInput.current?.click()} disabled={uploading}
                      style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 14px", borderRadius: "var(--r-md)", border: "1px dashed var(--ds-border-strong)", background: "var(--ds-bg)", color: "var(--ds-text)", fontFamily: "'Outfit', sans-serif", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
                      {uploading ? <Loader2 size={16} className="spin" /> : <Camera size={16} />} {uploading ? s.uploading : (form.photoUrl ? "✓ " + s.photo : s.photo)}
                    </button>
                    <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: 12, color: "var(--ds-text-faint)", margin: "6px 0 0" }}>{s.photoHint}</p>
                  </div>

                  {/* Accent */}
                  <div>
                    <label style={label}>{s.accent}</label>
                    <div style={{ display: "flex", gap: 10 }}>
                      {ACCENTS.map((a) => (
                        <button key={a} type="button" aria-label={a} aria-pressed={form.accent === a} onClick={() => set("accent", a)}
                          style={{ width: 30, height: 30, borderRadius: "var(--r-full)", background: a, cursor: "pointer",
                            border: form.accent === a ? "3px solid var(--ds-text)" : "3px solid transparent",
                            outline: form.accent === a ? "1px solid var(--ds-border)" : "none" }} />
                      ))}
                    </div>
                  </div>

                  {error && <p role="alert" style={{ color: "var(--ds-danger)", fontSize: 13.5, fontFamily: "'Outfit', sans-serif", margin: 0 }}>{error}</p>}
                  <button type="submit" className="btn-orange" disabled={busy || uploading} style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, opacity: busy ? 0.7 : 1 }}>
                    <Send size={16} /> {busy ? s.sending : s.submit}
                  </button>
                </form>
              </>
            )}
          </div>

          {/* Live preview */}
          <div style={{ position: "sticky", top: 90 }}>
            <p style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: "'Outfit', sans-serif", fontSize: 12.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em", color: "var(--ds-text-muted)", margin: "0 0 12px" }}>
              <Sparkles size={14} style={{ color: "var(--ds-accent)" }} /> {s.preview}
            </p>
            <PromoCard c={form} s={s} />
          </div>
        </div>
      </div>
    </section>
  )
}
