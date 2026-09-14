import { useState, useEffect } from "react"
import {
  Check, Send, Loader2, Copy as CopyIcon, CreditCard, Plus, Minus, ShoppingCart, ChevronDown, MapPin,
} from "lucide-react"
import { useSettings } from "../context/AppSettings"
import { CURRENCIES } from "../context/AppSettings"
import { pricingServices } from "../data/services"
import { api, type PaymentConfig } from "../lib/api"
import { track } from "../lib/analytics"
import type { Lang } from "../i18n/translations"

/* ──────────────────────────────────────────────────────────────────────────
   CONFIGURATION DES PAIEMENTS
   ──────────────────────────────────────────────────────────────────────────
   Coordonnées par défaut affichées sur la page de paiement. Elles peuvent être
   remplacées à tout moment depuis /admin → onglet « Paiements » (ces valeurs
   sont alors servies via GET /settings → settings.payments) ; toute valeur non
   renseignée côté admin retombe sur celles ci-dessous.
   Rien n'est encaissé automatiquement : le client paie via le moyen choisi,
   entre sa référence, et l'admin valide depuis /admin.
   ────────────────────────────────────────────────────────────────────────── */
const DEFAULT_PAY: PaymentConfig = {
  moncash: { number: "+509 3625-5920", holder: "Bruny Ben-vino Samson" },
  natcash: { number: "+509 4315-6835", holder: "Bruny Ben-vino Samson" },
  buh: {
    bank: "Banque de l'Union Haïtienne (BUH)",
    account: "1800-0053313",
    holder: "BRUNY Ben-vino Samson",
    type: "Épargne · USD",
  },
  upwork: { email: "benvinosamson@gmail.com" },
  whatsapp: "50936255920",
}

// Remplace un champ par la valeur admin uniquement si celle-ci est renseignée,
// sinon on garde la valeur par défaut ci-dessus.
function mergePay(base: PaymentConfig, over?: Partial<PaymentConfig>): PaymentConfig {
  if (!over) return base
  const pick = (b: string, o?: string) => (o && o.trim() ? o : b)
  return {
    moncash: { number: pick(base.moncash.number, over.moncash?.number), holder: pick(base.moncash.holder, over.moncash?.holder) },
    natcash: { number: pick(base.natcash.number, over.natcash?.number), holder: pick(base.natcash.holder, over.natcash?.holder) },
    buh: {
      bank: pick(base.buh.bank, over.buh?.bank),
      account: pick(base.buh.account, over.buh?.account),
      holder: pick(base.buh.holder, over.buh?.holder),
      type: pick(base.buh.type, over.buh?.type),
    },
    upwork: { email: pick(base.upwork.email, over.upwork?.email) },
    whatsapp: pick(base.whatsapp, over.whatsapp),
  }
}

type Method = "moncash" | "natcash" | "buh" | "upwork"

const HT_METHODS: Method[] = ["moncash", "natcash", "buh"]
const INTL_METHODS: Method[] = ["upwork"]

import moncashLogo from "@/imports/unnamed.webp"
import natcashLogo from "@/imports/d144965d8de439a0d8d6689b85fe4093.jpg"
import buhLogo from "@/imports/images__5_.webp"

// 44×44 rounded tile carrying an official provider logo. `scale` lets us crop
// out letterboxing on wordmark thumbnails (e.g. the NatCash image).
function logoTile(src: string, alt: string, bg: string, scale = 1): React.ReactNode {
  return (
    <span
      style={{
        display: "flex", alignItems: "center", justifyContent: "center",
        width: 44, height: 44, borderRadius: "var(--r-md)", flexShrink: 0,
        background: bg, overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.12)",
      }}
    >
      <img
        src={src}
        alt={alt}
        style={{ width: "100%", height: "100%", objectFit: "cover", transform: scale !== 1 ? `scale(${scale})` : undefined, display: "block" }}
      />
    </span>
  )
}

// Brand-colored fallback badge for methods without a logo image.
function badge(bg: string, children: React.ReactNode, ring?: string): React.ReactNode {
  return (
    <span
      aria-hidden="true"
      style={{
        display: "flex", alignItems: "center", justifyContent: "center",
        width: 44, height: 44, borderRadius: "var(--r-md)", flexShrink: 0,
        background: bg, color: "#fff",
        border: ring ? `1px solid ${ring}` : "1px solid transparent",
        boxShadow: "0 1px 3px rgba(0,0,0,0.12)",
      }}
    >
      {children}
    </span>
  )
}

// Official Upwork brandmark.
const UpworkMark = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="#14A800" aria-hidden="true">
    <path d="M18.561 13.158c-1.102 0-2.135-.467-3.074-1.227l.228-1.076.008-.042c.207-1.143.849-3.06 2.839-3.06 1.492 0 2.703 1.212 2.703 2.703-.001 1.489-1.212 2.702-2.704 2.702zm0-8.14c-2.539 0-4.51 1.649-5.31 4.366-1.22-1.834-2.148-4.036-2.687-5.892H7.828v7.112c-.002 1.406-1.141 2.546-2.547 2.548-1.405-.002-2.543-1.143-2.545-2.548V3.492H0v7.112c0 2.94 2.394 5.339 5.334 5.339 2.939 0 5.332-2.399 5.332-5.339v-1.19c.529 1.107 1.182 2.229 1.974 3.221l-1.673 7.873h2.797l1.213-5.71c1.063.679 2.285 1.109 3.686 1.109 3 0 5.439-2.452 5.439-5.45 0-3-2.439-5.439-5.439-5.439z" />
  </svg>
)

const METHOD_ICON: Record<Method, React.ReactNode> = {
  moncash: logoTile(moncashLogo, "MonCash", "#E30613"),
  natcash: logoTile(natcashLogo, "NatCash", "#F58220"),
  buh: logoTile(buhLogo, "Banque de l'Union Haïtienne (BUH)", "#0A3D7A"),
  upwork: badge("#fff", <UpworkMark size={26} />, "rgba(20,168,0,0.35)"),
}

type Copy = {
  tag: string; title: string; sub: string
  scope: string; scopeHT: string; scopeIntl: string
  choose: string; other: string; back: string
  amount: string; name: string; email: string; phone: string; phoneOpt: string
  ref: string; refHint: string; note: string; noteOpt: string
  submit: string; sending: string
  success: string; successSub: string; waProof: string
  errContact: string; errNet: string
  names: Record<Method, string>
  copyBtn: string; copied: string
  steps: (m: Method) => string[]
}

function build(lang: Lang, c: PaymentConfig): Copy {
  const dicts: Record<Lang, Omit<Copy, "steps">> = {
    fr: {
      tag: "Paiement", title: "Réglez votre commande", sub: "Choisissez le moyen le plus pratique selon votre localisation. Après paiement, indiquez votre référence — nous confirmons sous peu.",
      scope: "Vous payez depuis", scopeHT: "Haïti", scopeIntl: "Diaspora / International",
      choose: "Choisissez un moyen de paiement", other: "Autres moyens", back: "← Changer de moyen",
      amount: "Montant", name: "Nom complet", email: "E-mail", phone: "Téléphone", phoneOpt: "Téléphone (optionnel)",
      ref: "Référence de la transaction", refHint: "N° de transaction MonCash/NatCash, ou détails du virement.",
      note: "Note", noteOpt: "Note (optionnel)",
      submit: "J'ai payé — confirmer", sending: "Envoi…",
      success: "Paiement enregistré !", successSub: "Nous vérifions votre paiement et revenons vers vous très vite. Merci !", waProof: "Envoyer une preuve sur WhatsApp",
      errContact: "Indiquez au moins votre nom ou votre e-mail.", errNet: "Erreur réseau. Réessayez ou contactez-nous sur WhatsApp.",
      names: { moncash: "MonCash", natcash: "NatCash", buh: "Virement BUH", upwork: "Carte de crédit / débit" },
      copyBtn: "Copier", copied: "Copié !",
    },
    en: {
      tag: "Payment", title: "Pay for your order", sub: "Pick the most convenient method for your location. After paying, enter your reference — we confirm shortly.",
      scope: "You are paying from", scopeHT: "Haiti", scopeIntl: "Diaspora / International",
      choose: "Choose a payment method", other: "Other methods", back: "← Change method",
      amount: "Amount", name: "Full name", email: "Email", phone: "Phone", phoneOpt: "Phone (optional)",
      ref: "Transaction reference", refHint: "MonCash/NatCash transaction no., or transfer details.",
      note: "Note", noteOpt: "Note (optional)",
      submit: "I have paid — confirm", sending: "Sending…",
      success: "Payment recorded!", successSub: "We are verifying your payment and will get back to you very soon. Thank you!", waProof: "Send proof on WhatsApp",
      errContact: "Enter at least your name or email.", errNet: "Network error. Try again or reach us on WhatsApp.",
      names: { moncash: "MonCash", natcash: "NatCash", buh: "BUH transfer", upwork: "Credit / debit card" },
      copyBtn: "Copy", copied: "Copied!",
    },
    es: {
      tag: "Pago", title: "Paga tu pedido", sub: "Elige el método más cómodo según tu ubicación. Tras pagar, indica tu referencia — confirmamos en breve.",
      scope: "Pagas desde", scopeHT: "Haití", scopeIntl: "Diáspora / Internacional",
      choose: "Elige un método de pago", other: "Otros métodos", back: "← Cambiar método",
      amount: "Importe", name: "Nombre completo", email: "Correo", phone: "Teléfono", phoneOpt: "Teléfono (opcional)",
      ref: "Referencia de la transacción", refHint: "N.º de transacción MonCash/NatCash, o datos de la transferencia.",
      note: "Nota", noteOpt: "Nota (opcional)",
      submit: "He pagado — confirmar", sending: "Enviando…",
      success: "¡Pago registrado!", successSub: "Estamos verificando tu pago y te responderemos muy pronto. ¡Gracias!", waProof: "Enviar comprobante por WhatsApp",
      errContact: "Introduce al menos tu nombre o correo.", errNet: "Error de red. Inténtalo de nuevo o escríbenos por WhatsApp.",
      names: { moncash: "MonCash", natcash: "NatCash", buh: "Transferencia BUH", upwork: "Tarjeta de crédito / débito" },
      copyBtn: "Copiar", copied: "¡Copiado!",
    },
    ht: {
      tag: "Peman", title: "Peye kòmann ou", sub: "Chwazi mwayen ki pi pratik pou kote ou ye a. Apre ou peye, mete referans ou — n ap konfime talè.",
      scope: "W ap peye depi", scopeHT: "Ayiti", scopeIntl: "Dyaspora / Entènasyonal",
      choose: "Chwazi yon mwayen pou peye", other: "Lòt mwayen", back: "← Chanje mwayen",
      amount: "Montan", name: "Non konplè", email: "Imel", phone: "Telefòn", phoneOpt: "Telefòn (opsyonèl)",
      ref: "Referans tranzaksyon an", refHint: "Nimewo tranzaksyon MonCash/NatCash, oswa detay vireman an.",
      note: "Nòt", noteOpt: "Nòt (opsyonèl)",
      submit: "Mwen peye — konfime", sending: "Y ap voye…",
      success: "Peman anrejistre!", successSub: "N ap verifye peman ou epi n ap reponn ou byen vit. Mèsi!", waProof: "Voye yon prèv sou WhatsApp",
      errContact: "Mete omwen non ou oswa imel ou.", errNet: "Erè rezo. Eseye ankò oswa kontakte nou sou WhatsApp.",
      names: { moncash: "MonCash", natcash: "NatCash", buh: "Vireman BUH", upwork: "Kat kredi / debi" },
      copyBtn: "Kopye", copied: "Kopye!",
    },
    pt: {
      tag: "Pagamento", title: "Pague o seu pedido", sub: "Escolha o método mais prático para a sua localização. Após pagar, informe a sua referência — confirmamos em breve.",
      scope: "Você paga a partir de", scopeHT: "Haiti", scopeIntl: "Diáspora / Internacional",
      choose: "Escolha um método de pagamento", other: "Outros métodos", back: "← Mudar método",
      amount: "Valor", name: "Nome completo", email: "E-mail", phone: "Telefone", phoneOpt: "Telefone (opcional)",
      ref: "Referência da transação", refHint: "N.º da transação MonCash/NatCash, ou dados da transferência.",
      note: "Nota", noteOpt: "Nota (opcional)",
      submit: "Já paguei — confirmar", sending: "Enviando…",
      success: "Pagamento registado!", successSub: "Estamos a verificar o seu pagamento e retornaremos muito em breve. Obrigado!", waProof: "Enviar comprovativo no WhatsApp",
      errContact: "Informe pelo menos o seu nome ou e-mail.", errNet: "Erro de rede. Tente novamente ou fale connosco no WhatsApp.",
      names: { moncash: "MonCash", natcash: "NatCash", buh: "Transferência BUH", upwork: "Cartão de crédito / débito" },
      copyBtn: "Copiar", copied: "Copiado!",
    },
    it: {
      tag: "Pagamento", title: "Paga il tuo ordine", sub: "Scegli il metodo più comodo in base alla tua posizione. Dopo il pagamento, indica il riferimento — confermiamo a breve.",
      scope: "Stai pagando da", scopeHT: "Haiti", scopeIntl: "Diaspora / Internazionale",
      choose: "Scegli un metodo di pagamento", other: "Altri metodi", back: "← Cambia metodo",
      amount: "Importo", name: "Nome completo", email: "Email", phone: "Telefono", phoneOpt: "Telefono (facoltativo)",
      ref: "Riferimento della transazione", refHint: "N. transazione MonCash/NatCash, o dettagli del bonifico.",
      note: "Nota", noteOpt: "Nota (facoltativa)",
      submit: "Ho pagato — conferma", sending: "Invio…",
      success: "Pagamento registrato!", successSub: "Stiamo verificando il pagamento e ti ricontatteremo molto presto. Grazie!", waProof: "Invia una prova su WhatsApp",
      errContact: "Inserisci almeno il tuo nome o la tua email.", errNet: "Errore di rete. Riprova o scrivici su WhatsApp.",
      names: { moncash: "MonCash", natcash: "NatCash", buh: "Bonifico BUH", upwork: "Carta di credito / debito" },
      copyBtn: "Copia", copied: "Copiato!",
    },
    de: {
      tag: "Zahlung", title: "Bezahlen Sie Ihre Bestellung", sub: "Wählen Sie die für Ihren Standort passende Methode. Nach der Zahlung geben Sie Ihre Referenz an — wir bestätigen in Kürze.",
      scope: "Sie zahlen aus", scopeHT: "Haiti", scopeIntl: "Diaspora / International",
      choose: "Wählen Sie eine Zahlungsmethode", other: "Weitere Methoden", back: "← Methode ändern",
      amount: "Betrag", name: "Vollständiger Name", email: "E-Mail", phone: "Telefon", phoneOpt: "Telefon (optional)",
      ref: "Transaktionsreferenz", refHint: "MonCash/NatCash-Transaktionsnr. oder Überweisungsdetails.",
      note: "Notiz", noteOpt: "Notiz (optional)",
      submit: "Ich habe bezahlt — bestätigen", sending: "Senden…",
      success: "Zahlung erfasst!", successSub: "Wir prüfen Ihre Zahlung und melden uns sehr bald. Vielen Dank!", waProof: "Nachweis per WhatsApp senden",
      errContact: "Geben Sie mindestens Ihren Namen oder Ihre E-Mail an.", errNet: "Netzwerkfehler. Versuchen Sie es erneut oder kontaktieren Sie uns per WhatsApp.",
      names: { moncash: "MonCash", natcash: "NatCash", buh: "BUH-Überweisung", upwork: "Kredit- / Debitkarte" },
      copyBtn: "Kopieren", copied: "Kopiert!",
    },
    ar: {
      tag: "الدفع", title: "ادفع طلبك", sub: "اختر الوسيلة الأنسب حسب موقعك. بعد الدفع، أدخل مرجعك — سنؤكد قريباً.",
      scope: "تدفع من", scopeHT: "هايتي", scopeIntl: "الشتات / دولي",
      choose: "اختر وسيلة دفع", other: "وسائل أخرى", back: "← تغيير الوسيلة",
      amount: "المبلغ", name: "الاسم الكامل", email: "البريد الإلكتروني", phone: "الهاتف", phoneOpt: "الهاتف (اختياري)",
      ref: "مرجع المعاملة", refHint: "رقم معاملة MonCash/NatCash، أو تفاصيل التحويل.",
      note: "ملاحظة", noteOpt: "ملاحظة (اختياري)",
      submit: "لقد دفعت — تأكيد", sending: "جارٍ الإرسال…",
      success: "تم تسجيل الدفع!", successSub: "نتحقق من دفعتك وسنعود إليك قريباً جداً. شكراً!", waProof: "إرسال إثبات عبر واتساب",
      errContact: "أدخل على الأقل اسمك أو بريدك الإلكتروني.", errNet: "خطأ في الشبكة. حاول مرة أخرى أو تواصل معنا عبر واتساب.",
      names: { moncash: "MonCash", natcash: "NatCash", buh: "تحويل BUH", upwork: "بطاقة ائتمان / خصم" },
      copyBtn: "نسخ", copied: "تم النسخ!",
    },
  }

  const d = dicts[lang] ?? dicts.fr
  const stepsByLang: Partial<Record<Lang, (m: Method) => string[]>> = {
    fr: (m) => ({
      moncash: [`Ouvrez MonCash et envoyez le montant au ${c.moncash.number} (${c.moncash.holder}).`, "Notez le numéro de transaction reçu par SMS et prenez une capture d'écran.", "Entrez la référence ci-dessous puis confirmez."],
      natcash: [`Ouvrez NatCash et envoyez le montant au ${c.natcash.number} (${c.natcash.holder}).`, "Notez le numéro de transaction et prenez une capture d'écran.", "Entrez la référence ci-dessous puis confirmez."],
      buh: [`Virement vers ${c.buh.bank}.`, `Compte : ${c.buh.account} (${c.buh.type}) — ${c.buh.holder}.`, "Indiquez la référence du virement ci-dessous et gardez le reçu."],
      upwork: ["Choisissez vos services ci-dessus (ou saisissez le montant à régler).", "Soumettez la demande avec votre e-mail — inutile de vous reconnecter.", "Nous vous répondons sous 24 h avec votre lien de contrat direct Upwork sécurisé pour payer par carte."],
    }[m]),
    en: (m) => ({
      moncash: [`Open MonCash and send the amount to ${c.moncash.number} (${c.moncash.holder}).`, "Note the SMS transaction number and take a screenshot.", "Enter the reference below and confirm."],
      natcash: [`Open NatCash and send the amount to ${c.natcash.number} (${c.natcash.holder}).`, "Note the transaction number and take a screenshot.", "Enter the reference below and confirm."],
      buh: [`Transfer to ${c.buh.bank}.`, `Account: ${c.buh.account} (${c.buh.type}) — ${c.buh.holder}.`, "Enter the transfer reference below and keep the receipt."],
      upwork: ["Choose your services above (or enter the amount to pay).", "Submit the request with your email — no need to log back in.", "We reply within 24h with your secure Upwork direct-contract link to pay by card."],
    }[m]),
    ht: (m) => ({
      moncash: [`Ouvri MonCash epi voye montan an nan ${c.moncash.number} (${c.moncash.holder}).`, "Note nimewo tranzaksyon SMS a epi pran yon foto/screenshot.", "Mete referans lan anba a epi konfime."],
      natcash: [`Ouvri NatCash epi voye montan an nan ${c.natcash.number} (${c.natcash.holder}).`, "Note nimewo tranzaksyon an epi pran yon foto/screenshot.", "Mete referans lan anba a epi konfime."],
      buh: [`Vireman nan ${c.buh.bank}.`, `Kont : ${c.buh.account} (${c.buh.type}) — ${c.buh.holder}.`, "Mete referans vireman an anba a epi kenbe resi a."],
      upwork: ["Chwazi sèvis ou yo anwo a (oswa mete montan pou peye a).", "Voye demann lan ak imel ou — ou pa bezwen rekonekte.", "N ap reponn ou nan 24 è ak yon lyen kontra dirèk Upwork sekirize pou peye ak kat."],
    }[m]),
  }
  const steps = (m: Method) => (stepsByLang[lang] ?? stepsByLang.en!)(m)
  return { ...d, steps }
}

// Labels for the Upwork "contact us for a direct-contract link" CTAs.
const UPWORK_CTA: Record<Lang, { wa: string; email: string; msg: string; subject: string; optional: string; services: string; budget: string; onQuote: string }> = {
  fr: { wa: "Nous écrire sur WhatsApp", email: "Nous écrire par e-mail", msg: "Bonjour, je souhaite payer par carte via Upwork.", subject: "Paiement par carte via Upwork", optional: "Optionnel — contact direct", services: "Services choisis", budget: "Budget", onQuote: "à définir / sur devis" },
  en: { wa: "Message us on WhatsApp", email: "Email us", msg: "Hello, I would like to pay by card via Upwork.", subject: "Card payment via Upwork", optional: "Optional — direct contact", services: "Selected services", budget: "Budget", onQuote: "to be defined / on quote" },
  es: { wa: "Escríbenos por WhatsApp", email: "Escríbenos por correo", msg: "Hola, quiero pagar con tarjeta vía Upwork.", subject: "Pago con tarjeta vía Upwork", optional: "Opcional — contacto directo", services: "Servicios elegidos", budget: "Presupuesto", onQuote: "a definir / a presupuesto" },
  ht: { wa: "Ekri nou sou WhatsApp", email: "Ekri nou pa imel", msg: "Bonjou, mwen vle peye ak kat via Upwork.", subject: "Peman ak kat via Upwork", optional: "Opsyonèl — kontak dirèk", services: "Sèvis chwazi", budget: "Bidjè", onQuote: "pou defini / sou devi" },
  pt: { wa: "Fale connosco no WhatsApp", email: "Envie-nos um e-mail", msg: "Olá, gostaria de pagar com cartão via Upwork.", subject: "Pagamento com cartão via Upwork", optional: "Opcional — contacto direto", services: "Serviços escolhidos", budget: "Orçamento", onQuote: "a definir / sob orçamento" },
  it: { wa: "Scrivici su WhatsApp", email: "Scrivici via email", msg: "Salve, vorrei pagare con carta tramite Upwork.", subject: "Pagamento con carta tramite Upwork", optional: "Facoltativo — contatto diretto", services: "Servizi scelti", budget: "Budget", onQuote: "da definire / su preventivo" },
  de: { wa: "Auf WhatsApp schreiben", email: "E-Mail senden", msg: "Hallo, ich möchte per Karte über Upwork bezahlen.", subject: "Kartenzahlung über Upwork", optional: "Optional — direkter Kontakt", services: "Gewählte Leistungen", budget: "Budget", onQuote: "noch festzulegen / auf Anfrage" },
  ar: { wa: "راسلنا على واتساب", email: "راسلنا بالبريد", msg: "مرحباً، أرغب في الدفع بالبطاقة عبر Upwork.", subject: "الدفع بالبطاقة عبر Upwork", optional: "اختياري — تواصل مباشر", services: "الخدمات المختارة", budget: "الميزانية", onQuote: "يُحدد لاحقاً / حسب عرض السعر" },
}

// Accessible labels for the quantity steppers (icon-only buttons), per language.
const QTY_LABEL: Record<Lang, { dec: string; inc: string }> = {
  fr: { dec: "Retirer une unité", inc: "Ajouter une unité" },
  en: { dec: "Decrease quantity", inc: "Increase quantity" },
  es: { dec: "Quitar una unidad", inc: "Añadir una unidad" },
  ht: { dec: "Retire yon inite", inc: "Ajoute yon inite" },
  pt: { dec: "Remover uma unidade", inc: "Adicionar uma unidade" },
  it: { dec: "Rimuovi una unità", inc: "Aggiungi una unità" },
  de: { dec: "Menge verringern", inc: "Menge erhöhen" },
  ar: { dec: "إنقاص الكمية", inc: "زيادة الكمية" },
}

// Service picker + Upwork-request labels, per language.
const PICK: Record<Lang, {
  title: string; hint: string; total: string; quote: string;
  submitReq: string; reqSuccess: string; reqSuccessSub: string; needEmail: string;
  directTitle: string; directHint: string; messageLabel: string; messagePh: string; sendOnSite: string; needContact: string; sentTitle: string; sentSub: string;
}> = {
  fr: { title: "Choisir des services (optionnel)", hint: "Sélectionnez vos services : le montant se calcule automatiquement.", total: "Total", quote: "sur devis", submitReq: "Soumettre la demande", reqSuccess: "Demande reçue !", reqSuccessSub: "Nous vous répondons sous 24 h avec votre lien de contrat direct Upwork sécurisé. Votre e-mail est enregistré — inutile de vous reconnecter.", needEmail: "Indiquez votre e-mail pour recevoir le lien de contrat.", directTitle: "Ou soumettez votre demande sur le site", directHint: "Envoyez-nous vos services et votre message directement — sans passer par le paiement.", messageLabel: "Votre message", messagePh: "Décrivez votre projet, vos besoins ou vos questions…", sendOnSite: "Soumettre ma demande", needContact: "Indiquez votre nom et un e-mail valide.", sentTitle: "Demande envoyée !", sentSub: "Nous avons bien reçu votre demande et vos services sélectionnés. Nous revenons vers vous très vite. Merci !" },
  en: { title: "Choose services (optional)", hint: "Select your services: the amount is calculated automatically.", total: "Total", quote: "on quote", submitReq: "Submit request", reqSuccess: "Request received!", reqSuccessSub: "We reply within 24h with your secure Upwork direct-contract link. Your email is saved — no need to log back in.", needEmail: "Enter your email to receive the contract link.", directTitle: "Or submit your request on the site", directHint: "Send us your services and message directly — no payment needed.", messageLabel: "Your message", messagePh: "Describe your project, needs or questions…", sendOnSite: "Submit my request", needContact: "Enter your name and a valid email.", sentTitle: "Request sent!", sentSub: "We received your request and your selected services. We'll get back to you very soon. Thank you!" },
  es: { title: "Elegir servicios (opcional)", hint: "Selecciona tus servicios: el importe se calcula automáticamente.", total: "Total", quote: "a presupuesto", submitReq: "Enviar solicitud", reqSuccess: "¡Solicitud recibida!", reqSuccessSub: "Respondemos en 24 h con tu enlace de contrato directo de Upwork seguro. Tu correo queda guardado — no necesitas volver a iniciar sesión.", needEmail: "Introduce tu correo para recibir el enlace del contrato.", directTitle: "O envía tu solicitud en el sitio", directHint: "Envíanos tus servicios y tu mensaje directamente — sin pasar por el pago.", messageLabel: "Tu mensaje", messagePh: "Describe tu proyecto, necesidades o preguntas…", sendOnSite: "Enviar mi solicitud", needContact: "Introduce tu nombre y un correo válido.", sentTitle: "¡Solicitud enviada!", sentSub: "Hemos recibido tu solicitud y tus servicios seleccionados. Te responderemos muy pronto. ¡Gracias!" },
  ht: { title: "Chwazi sèvis (opsyonèl)", hint: "Chwazi sèvis ou yo : montan an ap kalkile otomatikman.", total: "Total", quote: "sou devi", submitReq: "Voye demann lan", reqSuccess: "Nou resevwa demann ou!", reqSuccessSub: "N ap reponn ou nan 24 è ak yon lyen kontra dirèk Upwork sekirize. Imel ou anrejistre — ou pa bezwen rekonekte.", needEmail: "Mete imel ou pou resevwa lyen kontra a.", directTitle: "Oswa soumèt demann ou sou sit la", directHint: "Voye ban nou sèvis ou yo ak mesaj ou dirèkteman — san ou pa peye.", messageLabel: "Mesaj ou", messagePh: "Dekri pwojè ou, bezwen ou oswa kesyon ou…", sendOnSite: "Voye demann mwen", needContact: "Mete non ou ak yon imel valab.", sentTitle: "Demann voye!", sentSub: "Nou resevwa demann ou ak sèvis ou chwazi yo. N ap reponn ou byen vit. Mèsi!" },
  pt: { title: "Escolher serviços (opcional)", hint: "Selecione os seus serviços: o valor é calculado automaticamente.", total: "Total", quote: "sob orçamento", submitReq: "Enviar pedido", reqSuccess: "Pedido recebido!", reqSuccessSub: "Respondemos em 24 h com o seu link de contrato direto Upwork seguro. O seu e-mail fica guardado — não precisa de voltar a entrar.", needEmail: "Informe o seu e-mail para receber o link do contrato.", directTitle: "Ou envie o seu pedido no site", directHint: "Envie-nos os seus serviços e a sua mensagem diretamente — sem passar pelo pagamento.", messageLabel: "A sua mensagem", messagePh: "Descreva o seu projeto, necessidades ou perguntas…", sendOnSite: "Enviar o meu pedido", needContact: "Informe o seu nome e um e-mail válido.", sentTitle: "Pedido enviado!", sentSub: "Recebemos o seu pedido e os serviços selecionados. Retornaremos muito em breve. Obrigado!" },
  it: { title: "Scegli i servizi (facoltativo)", hint: "Seleziona i tuoi servizi: l'importo si calcola automaticamente.", total: "Totale", quote: "su preventivo", submitReq: "Invia richiesta", reqSuccess: "Richiesta ricevuta!", reqSuccessSub: "Rispondiamo entro 24 h con il tuo link di contratto diretto Upwork sicuro. La tua email è salvata — non serve rifare l'accesso.", needEmail: "Inserisci la tua email per ricevere il link del contratto.", directTitle: "Oppure invia la richiesta sul sito", directHint: "Inviaci i tuoi servizi e il tuo messaggio direttamente — senza passare dal pagamento.", messageLabel: "Il tuo messaggio", messagePh: "Descrivi il tuo progetto, le esigenze o le domande…", sendOnSite: "Invia la mia richiesta", needContact: "Inserisci il tuo nome e un'email valida.", sentTitle: "Richiesta inviata!", sentSub: "Abbiamo ricevuto la tua richiesta e i servizi selezionati. Ti ricontatteremo molto presto. Grazie!" },
  de: { title: "Leistungen wählen (optional)", hint: "Wählen Sie Ihre Leistungen: der Betrag wird automatisch berechnet.", total: "Gesamt", quote: "auf Anfrage", submitReq: "Anfrage senden", reqSuccess: "Anfrage erhalten!", reqSuccessSub: "Wir antworten innerhalb von 24 Std. mit Ihrem sicheren Upwork-Direktvertragslink. Ihre E-Mail ist gespeichert — kein erneutes Anmelden nötig.", needEmail: "Geben Sie Ihre E-Mail an, um den Vertragslink zu erhalten.", directTitle: "Oder senden Sie Ihre Anfrage auf der Website", directHint: "Senden Sie uns Ihre Leistungen und Ihre Nachricht direkt — ohne Zahlung.", messageLabel: "Ihre Nachricht", messagePh: "Beschreiben Sie Ihr Projekt, Ihren Bedarf oder Ihre Fragen…", sendOnSite: "Meine Anfrage senden", needContact: "Geben Sie Ihren Namen und eine gültige E-Mail an.", sentTitle: "Anfrage gesendet!", sentSub: "Wir haben Ihre Anfrage und Ihre ausgewählten Leistungen erhalten. Wir melden uns sehr bald. Vielen Dank!" },
  ar: { title: "اختر الخدمات (اختياري)", hint: "اختر خدماتك: يُحتسب المبلغ تلقائياً.", total: "المجموع", quote: "حسب عرض السعر", submitReq: "إرسال الطلب", reqSuccess: "تم استلام الطلب!", reqSuccessSub: "نردّ خلال 24 ساعة برابط عقد Upwork المباشر الآمن. بريدك محفوظ — لا حاجة لإعادة تسجيل الدخول.", needEmail: "أدخل بريدك الإلكتروني لتصلك رابط العقد.", directTitle: "أو أرسل طلبك عبر الموقع", directHint: "أرسل لنا خدماتك ورسالتك مباشرةً — دون الحاجة للدفع.", messageLabel: "رسالتك", messagePh: "صف مشروعك أو احتياجاتك أو أسئلتك…", sendOnSite: "إرسال طلبي", needContact: "أدخل اسمك وبريداً إلكترونياً صالحاً.", sentTitle: "تم إرسال الطلب!", sentSub: "لقد استلمنا طلبك والخدمات التي اخترتها. سنعود إليك قريباً جداً. شكراً!" },
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
type Status = "idle" | "loading" | "success" | "error"

export default function Payer() {
  const { lang, region, currency, t, fmt, priceFor, rates } = useSettings()
  // Coordonnées par défaut (ci-dessus), remplacées par celles saisies dans
  // l'admin si elles existent.
  const [payCfg, setPayCfg] = useState<PaymentConfig>(DEFAULT_PAY)
  useEffect(() => {
    let alive = true
    api.getSettings().then((r) => {
      if (alive && r?.settings?.payments) setPayCfg(mergePay(DEFAULT_PAY, r.settings.payments))
    }).catch(() => {})
    return () => { alive = false }
  }, [])
  const c = build(lang, payCfg)
  const p = PICK[lang] ?? PICK.fr
  const params = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : new URLSearchParams()

  // Location is auto-detected (region), so there is no manual Haiti/Diaspora
  // toggle: we just surface the detected region and let "Other methods" reveal
  // the rest.
  const [scope] = useState<"HT" | "INTL">(region === "HT" ? "HT" : "INTL")
  const [showOther, setShowOther] = useState(false)
  const [method, setMethod] = useState<Method | null>(null)

  // Service picker — clients build a cart and the amount derives from it.
  const [cart, setCart] = useState<Record<number, number>>({})
  const [pickerOpen, setPickerOpen] = useState(true)
  const svcName = (s: (typeof pricingServices)[number]) => t.pricing.services[s.id]?.name ?? s.name
  const setQty = (id: number, delta: number) =>
    setCart((prev) => {
      const next = Math.max(0, (prev[id] ?? 0) + delta)
      const copy = { ...prev }
      if (next === 0) delete copy[id]
      else copy[id] = next
      return copy
    })
  const cartItems = pricingServices.filter((s) => (cart[s.id] ?? 0) > 0)
  const hasQuoteOnly = cartItems.some((s) => s.quoteOnly || s.price <= 0)
  const totalUsdAdj = cartItems.reduce((sum, s) => sum + (s.quoteOnly ? 0 : priceFor(s.price) * cart[s.id]), 0)
  const totalLocal = Math.round(totalUsdAdj * (rates[currency] ?? 1))

  const [amount, setAmount] = useState(params.get("amount") ?? "")
  const [name, setName] = useState(params.get("name") ?? "")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [reference, setReference] = useState(params.get("ref") ?? "")
  const [note, setNote] = useState("")
  const [status, setStatus] = useState<Status>("idle")
  const [errMsg, setErrMsg] = useState("")
  const [copied, setCopied] = useState<string | null>(null)

  // Direct on-site request: the client selects services + writes a message and
  // submits it straight to us, without having to pick a payment method first.
  const [submittedVia, setSubmittedVia] = useState<"payment" | "upwork" | "site">("payment")
  const [siteBusy, setSiteBusy] = useState(false)
  const [siteErr, setSiteErr] = useState("")

  const primary = scope === "HT" ? HT_METHODS : INTL_METHODS
  const secondary = (scope === "HT" ? INTL_METHODS : HT_METHODS)
  const visibleMethods = showOther ? [...primary, ...secondary] : primary

  // Keep the amount field in sync with the selected services.
  useEffect(() => {
    if (cartItems.length === 0) return
    setAmount(hasQuoteOnly && totalLocal === 0 ? "" : String(totalLocal))
  }, [totalLocal, hasQuoteOnly, cartItems.length])

  function copy(text: string, key: string) {
    try {
      navigator.clipboard?.writeText(text)
      setCopied(key)
      setTimeout(() => setCopied(null), 1600)
    } catch {}
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (status === "loading" || !method) return
    const isUpwork = method === "upwork"
    // Upwork requests capture the client's email so we can send the contract link.
    if (isUpwork && !EMAIL_RE.test(email.trim())) {
      setStatus("error"); setErrMsg(p.needEmail); return
    }
    if (!isUpwork && !name.trim() && !EMAIL_RE.test(email.trim())) {
      setStatus("error"); setErrMsg(c.errContact); return
    }
    setStatus("loading"); setErrMsg("")
    const amt = parseFloat(amount.replace(/[^\d.]/g, ""))
    const rate = rates[currency] ?? 1
    const services = cartItems.map((s) => ({
      id: s.id,
      name: svcName(s),
      qty: cart[s.id],
      usd: s.quoteOnly ? null : s.price,
      // Per-line amount in the client's own currency (region-adjusted then converted),
      // exactly like the proforma — so the receipt stays consistent with the total.
      local: s.quoteOnly ? null : Math.round(priceFor(s.price) * rate * cart[s.id]),
    }))
    const r = await api.submitLead({
      source: isUpwork ? "upwork_request" : "payment",
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      lang, currency, region,
      total: Number.isFinite(amt) ? amt : null,
      message: isUpwork ? [buildUpworkSummary(), note.trim()].filter(Boolean).join("\n\n") : note.trim(),
      meta: {
        paymentMethod: method,
        paymentMethodLabel: c.names[method],
        reference: isUpwork ? "" : reference.trim(),
        rate,
        services: services.length ? services : undefined,
      },
    })
    if (r) {
      setSubmittedVia(isUpwork ? "upwork" : "payment")
      setStatus("success")
      track("payment_declared", { method, value: Number.isFinite(amt) ? amt : 0, currency })
    } else {
      setStatus("error"); setErrMsg(c.errNet)
    }
  }

  // Direct on-site submission of the selected services + message — no payment
  // method required. Posts a lead with the cart summary as the message body.
  async function submitSiteRequest() {
    if (siteBusy) return
    if (!name.trim() || !EMAIL_RE.test(email.trim())) {
      setSiteErr(p.needContact); return
    }
    setSiteBusy(true); setSiteErr("")
    const rate = rates[currency] ?? 1
    const services = cartItems.map((s) => ({
      id: s.id,
      name: svcName(s),
      qty: cart[s.id],
      usd: s.quoteOnly ? null : s.price,
      local: s.quoteOnly ? null : Math.round(priceFor(s.price) * rate * cart[s.id]),
    }))
    const lines: string[] = []
    if (note.trim()) lines.push(note.trim())
    if (cartItems.length > 0) {
      lines.push("", `${u.services} :`)
      for (const s of cartItems) lines.push(`• ${svcName(s)} × ${cart[s.id]}${s.quoteOnly ? ` (${p.quote})` : ""}`)
      lines.push("", `${u.budget} : ${budgetText}`)
    }
    const amt = parseFloat(amount.replace(/[^\d.]/g, ""))
    const r = await api.submitLead({
      source: "site_request",
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      lang, currency, region,
      total: Number.isFinite(amt) ? amt : null,
      message: lines.join("\n").trim(),
      meta: { rate, services: services.length ? services : undefined },
    })
    if (r) {
      setSubmittedVia("site")
      setStatus("success")
      track("site_request", { services: services.length, currency })
    } else {
      setSiteErr(c.errNet)
    }
    setSiteBusy(false)
  }

  const waHref = `https://wa.me/${payCfg.whatsapp}?text=${encodeURIComponent(
    [
      `Bonjour l'équipe INOV Digital Services ! 👋${name ? ` Ici ${name}.` : ""}`,
      `Je viens d'effectuer un paiement via ${c.names[method ?? "moncash"]}${amount ? ` d'un montant de ${amount} ${CURRENCIES[currency].symbol}` : ""}.`,
      reference ? `Référence : ${reference}.` : "",
      "Pouvez-vous me confirmer la bonne réception ? Merci beaucoup ! 🙏",
    ].filter(Boolean).join("\n"),
  )}`

  // Upwork: route the client to us (WhatsApp / e-mail) so we can send a direct-contract
  // link. The message recaps the chosen services and the budget so we can prepare the
  // contract right away — whether the client sends it via WhatsApp, e-mail, or submits
  // it on the site.
  const u = UPWORK_CTA[lang]
  const budgetText =
    amount.trim()
      ? `${amount} ${CURRENCIES[currency].symbol}${hasQuoteOnly ? ` (+ ${p.quote})` : ""}`
      : (hasQuoteOnly || cartItems.length === 0 ? u.onQuote : `${totalLocal} ${CURRENCIES[currency].symbol}`)
  function buildUpworkSummary(): string {
    const lines = [u.msg]
    if (cartItems.length > 0) {
      lines.push("", `${u.services} :`)
      for (const s of cartItems) lines.push(`• ${svcName(s)} × ${cart[s.id]}${s.quoteOnly ? ` (${p.quote})` : ""}`)
    }
    lines.push("", `${u.budget} : ${budgetText}`)
    // Sign with the client's name so INOV Digital Services can prepare the contract.
    if (name.trim()) lines.push("", `— ${name.trim()}`)
    return lines.join("\n")
  }
  const upworkSummary = buildUpworkSummary()
  const upworkWa = `https://wa.me/${payCfg.whatsapp}?text=${encodeURIComponent(upworkSummary)}`
  const upworkMail = `mailto:${payCfg.upwork.email}?subject=${encodeURIComponent(u.subject)}&body=${encodeURIComponent(upworkSummary)}`

  return (
    <section style={{ background: "var(--ds-bg)", padding: "72px 0 96px" }}>
      <div style={{ maxWidth: 760, margin: "0 auto", padding: "0 var(--section-px)" }}>
        <div style={{ textAlign: "center", marginBottom: 34 }}>
          <span className="section-tag"><span className="dot-pulse" />{c.tag}</span>
          <h1 className="section-title" style={{ margin: "16px auto 12px", maxWidth: 560 }}>{c.title}</h1>
          <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: 16, color: "var(--ds-text-sec)", lineHeight: 1.65, maxWidth: 540, margin: "0 auto" }}>{c.sub}</p>
        </div>

        {status === "success" ? (
          <div style={{ ...cardStyle, textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 16, padding: "48px 40px" }}>
            <div style={{ width: 64, height: 64, borderRadius: "var(--r-xl)", background: "var(--ds-accent-grad)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 8px 22px var(--ds-accent-a35)" }}>
              <Check size={32} color="#fff" strokeWidth={2.4} />
            </div>
            <h2 className="section-title" style={{ margin: 0 }}>{submittedVia === "site" ? p.sentTitle : submittedVia === "upwork" ? p.reqSuccess : c.success}</h2>
            <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: 15, color: "var(--ds-text-sec)", lineHeight: 1.6, maxWidth: 440 }}>{submittedVia === "site" ? p.sentSub : submittedVia === "upwork" ? p.reqSuccessSub : c.successSub}</p>
            {submittedVia === "payment" && (
              <a href={waHref} target="_blank" rel="noreferrer" className="btn-orange" style={{ ...ctaStyle, textDecoration: "none", marginTop: 4 }}>
                <Send size={17} /> {c.waProof}
              </a>
            )}
          </div>
        ) : (
          <div style={cardStyle}>
            {/* Service picker — the amount derives from the selection */}
            <div style={{ marginBottom: 22, border: "1px solid var(--ds-border)", borderRadius: "var(--r-md)", background: "var(--ds-bg-sec)", overflow: "hidden" }}>
              <button
                type="button"
                onClick={() => setPickerOpen((o) => !o)}
                style={{ display: "flex", alignItems: "center", gap: 12, width: "100%", textAlign: "start", background: "none", border: "none", cursor: "pointer", padding: "14px 16px" }}
              >
                <ShoppingCart size={18} color="var(--ds-accent)" />
                <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 15, fontWeight: 700, color: "var(--ds-text)" }}>{p.title}</span>
                {cartItems.length > 0 && (
                  <span style={{ fontFamily: "var(--font-space), monospace", fontSize: 13, fontWeight: 700, color: "var(--ds-accent)", background: "var(--ds-accent-a08)", borderRadius: "var(--r-full)", padding: "2px 10px" }}>
                    {cartItems.length}
                  </span>
                )}
                <ChevronDown size={18} color="var(--ds-text-faint)" style={{ marginInlineStart: "auto", transform: pickerOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s ease" }} />
              </button>

              {pickerOpen && (
                <div style={{ borderTop: "1px solid var(--ds-border)", padding: "12px 16px 16px" }}>
                  <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: 12.5, color: "var(--ds-text-faint)", margin: "0 0 12px" }}>{p.hint}</p>
                  <div style={{ display: "grid", gap: 8 }}>
                    {pricingServices.map((s) => {
                      const qty = cart[s.id] ?? 0
                      const quote = s.quoteOnly || s.price <= 0
                      return (
                        // The whole row is clickable to add the service (qty 0 → 1);
                        // the +/- controls fine-tune the quantity without toggling.
                        <div
                          key={s.id}
                          role="button"
                          tabIndex={0}
                          aria-pressed={qty > 0}
                          onClick={() => { if (qty === 0) setQty(s.id, 1) }}
                          onKeyDown={(e) => { if ((e.key === "Enter" || e.key === " ") && qty === 0) { e.preventDefault(); setQty(s.id, 1) } }}
                          style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 10px", borderRadius: "var(--r-sm)", cursor: qty === 0 ? "pointer" : "default", background: qty > 0 ? "var(--ds-accent-a08)" : "transparent", border: qty > 0 ? "1px solid var(--ds-accent-a15)" : "1px solid transparent" }}
                        >
                          <div style={{ minWidth: 0, flex: 1 }}>
                            <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 14, fontWeight: 700, color: "var(--ds-text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{svcName(s)}</div>
                            <div style={{ fontFamily: "var(--font-space), monospace", fontSize: 12.5, color: "var(--ds-text-muted)" }}>{quote ? p.quote : fmt(priceFor(s.price))}</div>
                          </div>
                          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                            <button type="button" aria-label={`${QTY_LABEL[lang].dec} — ${svcName(s)}`} onClick={(e) => { e.stopPropagation(); setQty(s.id, -1) }} disabled={qty === 0} style={{ ...stepBtn, opacity: qty === 0 ? 0.4 : 1, cursor: qty === 0 ? "default" : "pointer" }}><Minus size={15} aria-hidden="true" /></button>
                            <span style={{ fontFamily: "var(--font-space), monospace", fontSize: 14, fontWeight: 700, color: "var(--ds-text)", minWidth: 16, textAlign: "center" }}>{qty}</span>
                            <button type="button" aria-label={`${QTY_LABEL[lang].inc} — ${svcName(s)}`} onClick={(e) => { e.stopPropagation(); setQty(s.id, 1) }} style={{ ...stepBtn, cursor: "pointer" }}><Plus size={15} aria-hidden="true" /></button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                  {cartItems.length > 0 && (
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 14, paddingTop: 12, borderTop: "1px solid var(--ds-border)" }}>
                      <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 14, fontWeight: 700, color: "var(--ds-text-sec)" }}>{p.total}</span>
                      <span style={{ fontFamily: "var(--font-space), monospace", fontSize: 18, fontWeight: 800, color: "var(--ds-accent)" }}>
                        {fmt(totalUsdAdj)}{hasQuoteOnly && <span style={{ fontSize: 12.5, fontWeight: 600, color: "var(--ds-text-faint)", marginInlineStart: 6 }}>+ {p.quote}</span>}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Direct on-site request — select services + message, submit straight to us */}
            <div style={{ marginBottom: 22, border: "1px solid var(--ds-accent-a30)", borderRadius: "var(--r-md)", background: "var(--ds-accent-a08)", padding: "16px 16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 4 }}>
                <Send size={18} color="var(--ds-accent)" style={{ flexShrink: 0 }} />
                <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 15, fontWeight: 700, color: "var(--ds-text)" }}>{p.directTitle}</span>
              </div>
              <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: 12.5, color: "var(--ds-text-muted)", margin: "0 0 14px 30px" }}>{p.directHint}</p>
              <div style={{ display: "grid", gap: 12 }}>
                <Fld label={p.messageLabel}>
                  <textarea
                    style={{ ...inputStyle, minHeight: 92, resize: "vertical", lineHeight: 1.55 }}
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder={p.messagePh}
                  />
                </Fld>
                <Row>
                  <Fld label={c.name}><input style={inputStyle} value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" /></Fld>
                  <Fld label={c.email}><input style={inputStyle} type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" /></Fld>
                </Row>
                {siteErr && <p role="alert" style={{ fontFamily: "'Outfit', sans-serif", fontSize: 13.5, color: "var(--ds-danger)", margin: 0 }}>{siteErr}</p>}
                <button type="button" onClick={submitSiteRequest} disabled={siteBusy} className="btn-orange" style={{ ...ctaStyle, opacity: siteBusy ? 0.75 : 1, cursor: siteBusy ? "wait" : "pointer" }}>
                  {siteBusy ? <><Loader2 size={17} style={{ animation: "spin 0.8s linear infinite" }} /> {c.sending}</> : <><Send size={17} /> {p.sendOnSite}</>}
                </button>
              </div>
            </div>

            {/* Detected region — location is auto-detected, no manual toggle */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 22, padding: "10px 14px", background: "var(--ds-bg-sec)", border: "1px solid var(--ds-border)", borderRadius: "var(--r-md)" }}>
              <MapPin size={16} color="var(--ds-accent)" style={{ flexShrink: 0 }} />
              <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 13.5, color: "var(--ds-text-sec)" }}>
                {c.scope} <strong style={{ color: "var(--ds-text)", fontWeight: 700 }}>{scope === "HT" ? c.scopeHT : c.scopeIntl}</strong>
              </span>
            </div>

            {!method ? (
              <>
                <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 14 }}>{c.choose}</div>
                <div style={{ display: "grid", gap: 12 }}>
                  {visibleMethods.map((m) => (
                    <button key={m} type="button" onClick={() => setMethod(m)} style={methodBtn}>
                      {METHOD_ICON[m]}
                      <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 15.5, fontWeight: 700, color: "var(--ds-text)" }}>{c.names[m]}</span>
                      <span style={{ marginInlineStart: "auto", color: "var(--ds-text-faint)" }}>→</span>
                    </button>
                  ))}
                </div>
                {!showOther && (
                  <button type="button" onClick={() => setShowOther(true)} style={{ ...linkBtn, marginTop: 16 }}>{c.other}</button>
                )}
              </>
            ) : (
              <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <button type="button" onClick={() => { setMethod(null); if (status === "error") setStatus("idle") }} style={linkBtn}>{c.back}</button>

                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  {METHOD_ICON[method]}
                  <span style={{ fontFamily: "var(--font-space), sans-serif", fontSize: 18, fontWeight: 800 }}>{c.names[method]}</span>
                </div>

                {/* Instructions */}
                <ol style={{ margin: 0, paddingInlineStart: 20, display: "grid", gap: 7 }}>
                  {c.steps(method).map((s, i) => (
                    <li key={i} style={{ fontFamily: "'Outfit', sans-serif", fontSize: 14.5, color: "var(--ds-text-sec)", lineHeight: 1.55 }}>{s}</li>
                  ))}
                </ol>

                {/* Copyable details / CTA */}
                {method === "moncash" && <CopyRow label="MonCash" value={payCfg.moncash.number} sub={payCfg.moncash.holder} onCopy={copy} copied={copied} c={c} />}
                {method === "natcash" && <CopyRow label="NatCash" value={payCfg.natcash.number} sub={payCfg.natcash.holder} onCopy={copy} copied={copied} c={c} />}
                {method === "buh" && <CopyRow label={payCfg.buh.bank} value={payCfg.buh.account} sub={`${payCfg.buh.holder} · ${payCfg.buh.type}`} onCopy={copy} copied={copied} c={c} />}
                {method === "upwork" && (
                  <div style={{ display: "grid", gap: 10 }}>
                    <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 12, fontWeight: 700, color: "var(--ds-text-faint)", textTransform: "uppercase", letterSpacing: "0.06em" }}>{UPWORK_CTA[lang].optional}</div>
                    <a href={upworkWa} target="_blank" rel="noreferrer" className="btn-order" style={{ ...ctaStyle, textDecoration: "none", background: "var(--ds-bg-sec)", color: "var(--ds-text)", border: "1px solid var(--ds-border)" }}>
                      <Send size={17} /> {UPWORK_CTA[lang].wa}
                    </a>
                    <a href={upworkMail} className="btn-order" style={{ ...ctaStyle, textDecoration: "none", background: "var(--ds-bg-sec)", color: "var(--ds-text)", border: "1px solid var(--ds-border)" }}>
                      <CreditCard size={17} /> {UPWORK_CTA[lang].email}
                    </a>
                  </div>
                )}

                <div style={dividerStyle} />

                {method === "upwork" ? (
                  <Fld label={c.amount}>
                    <input style={inputStyle} inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder={`0 ${CURRENCIES[currency].symbol}`} />
                  </Fld>
                ) : (
                  <>
                    <Row>
                      <Fld label={c.amount}>
                        <input style={inputStyle} inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder={`0 ${CURRENCIES[currency].symbol}`} />
                      </Fld>
                      <Fld label={c.ref}>
                        <input style={inputStyle} value={reference} onChange={(e) => setReference(e.target.value)} placeholder="—" />
                      </Fld>
                    </Row>
                    <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: 12.5, color: "var(--ds-text-faint)", margin: "-6px 0 0" }}>{c.refHint}</p>
                  </>
                )}

                <Row>
                  <Fld label={c.name}><input style={inputStyle} value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" /></Fld>
                  <Fld label={c.email}><input style={inputStyle} type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" /></Fld>
                </Row>
                <Fld label={c.phoneOpt}><input style={inputStyle} value={phone} onChange={(e) => setPhone(e.target.value)} autoComplete="tel" /></Fld>
                <Fld label={c.noteOpt}><input style={inputStyle} value={note} onChange={(e) => setNote(e.target.value)} /></Fld>

                {status === "error" && <p role="alert" style={{ fontFamily: "'Outfit', sans-serif", fontSize: 13.5, color: "var(--ds-danger)", margin: 0 }}>{errMsg}</p>}

                <button type="submit" disabled={status === "loading"} className="btn-orange" style={{ ...ctaStyle, opacity: status === "loading" ? 0.75 : 1, cursor: status === "loading" ? "wait" : "pointer" }}>
                  {status === "loading" ? <><Loader2 size={17} style={{ animation: "spin 0.8s linear infinite" }} /> {c.sending}</> : <><Check size={17} /> {method === "upwork" ? p.submitReq : c.submit}</>}
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </section>
  )
}

// ── Small presentational helpers ──────────────────────────────────────────────
function CopyRow({ label, value, sub, onCopy, copied, c }: { label: string; value: string; sub?: string; onCopy: (t: string, k: string) => void; copied: string | null; c: Copy }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, background: "var(--ds-bg-sec)", border: "1px solid var(--ds-border)", borderRadius: "var(--r-md)", padding: "12px 14px" }}>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 11.5, fontWeight: 700, color: "var(--ds-text-faint)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</div>
        <div style={{ fontFamily: "var(--font-space), monospace", fontSize: 15.5, fontWeight: 700, color: "var(--ds-text)", overflow: "hidden", textOverflow: "ellipsis" }}>{value}</div>
        {sub && <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 12.5, color: "var(--ds-text-muted)", marginTop: 2 }}>{sub}</div>}
      </div>
      <button type="button" onClick={() => onCopy(value, label)} style={{ ...linkBtn, display: "inline-flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
        <CopyIcon size={14} /> {copied === label ? c.copied : c.copyBtn}
      </button>
    </div>
  )
}

function Row({ children }: { children: React.ReactNode }) {
  return <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }} className="pay-row">{children}</div>
}
function Fld({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 13, fontWeight: 600, color: "var(--ds-text-sec)", fontFamily: "'Outfit', sans-serif" }}>
      {label}
      {children}
    </label>
  )
}

const cardStyle: React.CSSProperties = {
  background: "var(--ds-bg-card)", border: "1px solid var(--ds-border)", borderRadius: "var(--r-xl)", padding: "32px 32px",
}
const methodBtn: React.CSSProperties = {
  display: "flex", alignItems: "center", gap: 14, width: "100%", textAlign: "start",
  background: "var(--ds-bg-sec)", border: "1px solid var(--ds-border)", borderRadius: "var(--r-md)",
  padding: "14px 16px", cursor: "pointer",
}
const inputStyle: React.CSSProperties = {
  width: "100%", padding: "13px 15px", borderRadius: "var(--r-md)", border: "1.5px solid var(--ds-border)",
  background: "var(--ds-bg)", fontFamily: "'Outfit', sans-serif", fontSize: 15, color: "var(--ds-text)", outline: "none",
}
const ctaStyle: React.CSSProperties = {
  display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 9,
  padding: "15px 28px", borderRadius: "var(--r-md)", border: "none", color: "#fff",
  fontFamily: "'Outfit', sans-serif", fontSize: 15.5, fontWeight: 700, width: "100%",
}
const linkBtn: React.CSSProperties = {
  background: "none", border: "none", color: "var(--ds-accent)", cursor: "pointer",
  fontFamily: "'Outfit', sans-serif", fontSize: 14, fontWeight: 700, padding: 0, textAlign: "start",
}
const dividerStyle: React.CSSProperties = { height: 1, background: "var(--ds-border)", margin: "2px 0" }
const stepBtn: React.CSSProperties = {
  display: "inline-flex", alignItems: "center", justifyContent: "center", width: 30, height: 30,
  borderRadius: "var(--r-sm)", border: "1px solid var(--ds-border)", background: "var(--ds-bg-card)", color: "var(--ds-text)",
}
