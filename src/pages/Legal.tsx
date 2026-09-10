import { useEffect } from "react"
import { Link } from "react-router"
import { ArrowLeft } from "lucide-react"
import { useSettings } from "../context/AppSettings"

type Section = { h: string; p: string[] }
type Doc = { title: string; updated: string; intro: string; sections: Section[] }

const BACK: Record<string, string> = {
  fr: "Retour à l'accueil", en: "Back to home", es: "Volver al inicio", ht: "Retounen lakay",
  pt: "Voltar ao início", it: "Torna alla home", de: "Zurück zur Startseite", ar: "العودة إلى الرئيسية",
}

const PRIVACY: Record<string, Doc> = {
  fr: {
    title: "Politique de confidentialité",
    updated: "Dernière mise à jour : septembre 2026",
    intro: "Chez INOV Digital Services, nous respectons votre vie privée. Cette politique explique quelles données nous collectons, pourquoi, avec quels outils, et quels sont vos droits. En utilisant ce site, vous acceptez les pratiques décrites ci-dessous.",
    sections: [
      { h: "Responsable du traitement", p: ["INOV Digital Services est responsable des données collectées sur ce site.", "Contact : inov01contact@gmail.com — +509 3625-5920."] },
      { h: "Nature de nos services", p: [
        "Pour éviter tout malentendu, nous précisons le périmètre exact de nos prestations : INOV Digital Services est un studio de communication visuelle et de conception graphique.",
        "Nous ne proposons pas de service de photographie : nous réalisons de la retouche photo (correction de la lumière et des couleurs, détourage, mise en scène, mockups) à partir de vos images existantes.",
        "Nous ne proposons pas de service de vidéographie : nous réalisons le montage (editing) de vos rushes — coupe, sous-titres, habillage, transitions et export optimisé.",
        "Nous ne proposons pas de service d'impression : nous réalisons la conception des fichiers prêts à imprimer, que vous confiez ensuite à l'imprimeur de votre choix.",
      ] },
      { h: "Données que nous collectons", p: [
        "Formulaires (devis, contact, guide gratuit) : nom, adresse e-mail, téléphone (facultatif) et le contenu de votre message.",
        "Compte client : lorsque vous créez un compte, votre e-mail et votre nom sont enregistrés de façon sécurisée pour vous authentifier et suivre vos demandes.",
        "Paiements : pour un paiement déclaré, nous conservons le moyen choisi, le montant, la référence de transaction que vous saisissez et les services sélectionnés. Aucune donnée bancaire complète ni numéro de carte n'est collecté ni stocké par le site.",
        "Programme ambassadeur : si vous l'activez, nous générons un code de parrainage et suivons les commandes rattachées à ce code afin de calculer votre crédit.",
        "Données techniques : pages visitées, type d'appareil et données d'usage anonymisées, ainsi que votre langue et devise préférées enregistrées sur votre appareil.",
      ] },
      { h: "Cookies et mesure d'audience", p: [
        "Avec votre consentement, nous utilisons Google Analytics 4 et le Pixel Meta (Facebook) pour comprendre l'audience du site et améliorer nos services et nos campagnes.",
        "Ces outils ne sont activés qu'après votre accord via la bannière de consentement. Vous pouvez refuser ou retirer votre consentement à tout moment, ce qui désactive ces mesures.",
        "Certains cookies strictement nécessaires au fonctionnement du site (préférences de langue, session de compte) sont toujours actifs.",
      ] },
      { h: "Utilisation des données", p: ["Vos données servent à répondre à vos demandes, vous envoyer le guide gratuit lorsque vous le demandez, gérer votre compte et le programme de parrainage, traiter vos paiements et vous recontacter au sujet de votre projet. Nous ne vendons ni ne louons jamais vos informations."] },
      { h: "Prestataires et hébergement", p: [
        "Nous nous appuyons sur des prestataires de confiance qui traitent des données pour notre compte : Supabase (comptes, base de données et fonctions serveur), et nos outils de mesure (Google, Meta). Vos formulaires peuvent aussi transiter par notre boîte e-mail.",
        "Ces prestataires peuvent héberger des données hors de votre pays ; ils sont tenus de les protéger conformément à leurs propres engagements.",
      ] },
      { h: "Conservation et sécurité", p: ["Nous conservons vos données uniquement le temps nécessaire au suivi de votre demande, à la gestion de votre compte ou au respect de nos obligations. Nous appliquons des mesures raisonnables pour protéger vos informations. Ce site n'est pas destiné à collecter des données sensibles."] },
      { h: "Vos droits", p: ["Vous pouvez à tout moment demander l'accès, la correction, la portabilité ou la suppression de vos données, retirer votre consentement, ou fermer votre compte, en nous écrivant à inov01contact@gmail.com. Nous répondons dans un délai raisonnable."] },
      { h: "Mineurs", p: ["Nos services s'adressent à des adultes. Nous ne collectons pas sciemment de données concernant des mineurs."] },
      { h: "Modifications", p: ["Nous pouvons mettre à jour cette politique. La date en haut de page indique la dernière révision."] },
    ],
  },
  en: {
    title: "Privacy Policy",
    updated: "Last updated: September 2026",
    intro: "At INOV Digital Services, we respect your privacy. This policy explains what data we collect, why, with which tools, and what your rights are. By using this site, you agree to the practices described below.",
    sections: [
      { h: "Data controller", p: ["INOV Digital Services is responsible for the data collected on this site.", "Contact: inov01contact@gmail.com — +509 3625-5920."] },
      { h: "Nature of our services", p: [
        "To avoid any misunderstanding, we state the exact scope of our work: INOV Digital Services is a visual communication and graphic design studio.",
        "We do not offer photography services: we do photo retouching (light and color correction, cut-outs, staging, mockups) from your existing images.",
        "We do not offer videography services: we do the editing of your footage — cuts, subtitles, graphics, transitions and optimized export.",
        "We do not offer printing services: we design the print-ready files, which you then send to the printer of your choice.",
      ] },
      { h: "Data we collect", p: [
        "Forms (quote, contact, free guide): name, email address, phone (optional) and the content of your message.",
        "Client account: when you create an account, your email and name are stored securely to authenticate you and track your requests.",
        "Payments: for a declared payment, we keep the chosen method, the amount, the transaction reference you enter and the selected services. No full banking details or card numbers are collected or stored by the site.",
        "Ambassador program: if you activate it, we generate a referral code and track orders tied to that code to calculate your credit.",
        "Technical data: pages visited, device type and anonymized usage data, plus your preferred language and currency stored on your device.",
      ] },
      { h: "Cookies and analytics", p: [
        "With your consent, we use Google Analytics 4 and the Meta (Facebook) Pixel to understand site traffic and improve our services and campaigns.",
        "These tools are only enabled after you agree via the consent banner. You can decline or withdraw consent at any time, which disables this measurement.",
        "Some cookies strictly necessary for the site to work (language preferences, account session) are always active.",
      ] },
      { h: "How we use data", p: ["Your data is used to answer your requests, send you the free guide when you ask for it, manage your account and the referral program, process your payments and follow up about your project. We never sell or rent your information."] },
      { h: "Processors and hosting", p: [
        "We rely on trusted providers that process data on our behalf: Supabase (accounts, database and server functions) and our analytics tools (Google, Meta). Your form submissions may also pass through our email inbox.",
        "These providers may host data outside your country; they are required to protect it in line with their own commitments.",
      ] },
      { h: "Retention and security", p: ["We keep your data only as long as needed to handle your request, manage your account or meet our obligations. We apply reasonable measures to protect your information. This site is not intended to collect sensitive data."] },
      { h: "Your rights", p: ["You may request access, correction, portability or deletion of your data, withdraw consent, or close your account at any time by writing to inov01contact@gmail.com. We respond within a reasonable time."] },
      { h: "Minors", p: ["Our services are intended for adults. We do not knowingly collect data about minors."] },
      { h: "Changes", p: ["We may update this policy. The date at the top of the page indicates the latest revision."] },
    ],
  },
}

const TERMS: Record<string, Doc> = {
  fr: {
    title: "Mentions légales",
    updated: "Dernière mise à jour : août 2026",
    intro: "Informations légales relatives au site inovdigitalservices.com et à ses services.",
    sections: [
      { h: "Éditeur", p: ["Ce site est édité par INOV Digital Services.", "Contact : inov01contact@gmail.com — +509 3625-5920."] },
      { h: "Services", p: ["INOV Digital Services propose des prestations de branding, de design graphique et de communication visuelle. Les devis et tarifs affichés sont indicatifs et confirmés lors de la commande."] },
      { h: "Devis, commande et paiement", p: [
        "Les tarifs affichés sont indicatifs et peuvent varier selon la devise, la région et le périmètre final du projet. Ils sont confirmés dans le devis avant toute commande.",
        "Toute commande démarre après versement d'un acompte de 70 % du montant convenu ; le solde est réglé à la livraison. Les paiements (MonCash, NatCash, virement) sont déclarés par le client puis vérifiés manuellement avant le démarrage. Le client est responsable de l'exactitude de la référence de transaction fournie.",
      ] },
      { h: "Révisions et remboursement", p: [
        "Chaque prestation inclut le nombre de révisions précisé dans le devis. Des révisions supplémentaires peuvent faire l'objet d'un supplément convenu à l'avance.",
        "Avant le démarrage de la production, l'acompte est remboursable intégralement. Une fois le travail commencé (recherche, concepts, création), l'acompte couvre le temps déjà engagé et n'est pas remboursable.",
        "Si un livrable ne correspond pas au brief validé, nous le corrigeons dans le cadre des révisions prévues. Aucun remboursement n'est dû pour un travail déjà livré et conforme au brief. Tout litige se règle d'abord à l'amiable en nous écrivant à inov01contact@gmail.com.",
      ] },
      { h: "Propriété intellectuelle", p: [
        "Les visuels, logos et contenus créés restent la propriété d'INOV Digital Services jusqu'au paiement complet ; les droits sur le livrable final sont ensuite transférés au client. Toute reproduction de ce site sans autorisation est interdite.",
        "Les travaux clients présentés dans notre portfolio le sont avec l'accord des clients concernés. Un client peut demander le retrait de ses visuels à tout moment en nous écrivant.",
      ] },
      { h: "Responsabilité", p: ["Nous nous efforçons de fournir des informations exactes, sans garantie d'exhaustivité. Les liens externes ne relèvent pas de notre responsabilité."] },
    ],
  },
  en: {
    title: "Legal Notice",
    updated: "Last updated: August 2026",
    intro: "Legal information regarding the inovdigitalservices.com website and its services.",
    sections: [
      { h: "Publisher", p: ["This site is published by INOV Digital Services.", "Contact: inov01contact@gmail.com — +509 3625-5920."] },
      { h: "Services", p: ["INOV Digital Services provides branding, graphic design and visual communication services. Displayed quotes and prices are indicative and confirmed at order time."] },
      { h: "Quotes, orders and payment", p: [
        "Displayed prices are indicative and may vary with currency, region and the final scope of the project. They are confirmed in the quote before any order.",
        "Every order starts after a 70% deposit of the agreed amount; the balance is due on delivery. Payments (MonCash, NatCash, bank transfer) are declared by the client and manually verified before work begins. The client is responsible for the accuracy of the transaction reference provided.",
      ] },
      { h: "Revisions and refunds", p: [
        "Each service includes the number of revisions stated in the quote. Additional revisions may incur a surcharge agreed in advance.",
        "Before production begins, the deposit is fully refundable. Once work has started (research, concepts, creation), the deposit covers the time already spent and is non-refundable.",
        "If a deliverable does not match the approved brief, we correct it within the planned revisions. No refund is due for work already delivered that matches the brief. Any dispute is first resolved amicably by writing to inov01contact@gmail.com.",
      ] },
      { h: "Intellectual property", p: [
        "Visuals, logos and content we create remain the property of INOV Digital Services until full payment; rights to the final deliverable are then transferred to the client. Reproduction of this site without permission is prohibited.",
        "Client work shown in our portfolio is displayed with the consent of the clients concerned. A client may request removal of their visuals at any time by writing to us.",
      ] },
      { h: "Liability", p: ["We strive to provide accurate information without guarantee of completeness. External links are not our responsibility."] },
    ],
  },
}

export default function Legal({ kind }: { kind: "privacy" | "terms" }) {
  const { lang } = useSettings()
  const source = kind === "privacy" ? PRIVACY : TERMS
  const doc = source[lang] ?? source.en

  useEffect(() => {
    document.title = `${doc.title} — INOV Digital Services`
    window.scrollTo(0, 0)
  }, [doc.title])

  return (
    <section style={{ background: "#fff", padding: "40px 0 88px", minHeight: "70vh" }}>
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "0 var(--section-px)" }}>
        <Link
          to="/"
          style={{ display: "inline-flex", alignItems: "center", gap: 8, fontFamily: "'Outfit', sans-serif", fontSize: 14, fontWeight: 700, color: "var(--ds-text-faint)", textDecoration: "none", marginBottom: 32 }}
        >
          <ArrowLeft size={16} /> {BACK[lang] ?? BACK.fr}
        </Link>

        <h1 style={{ fontFamily: "'Outfit', sans-serif", fontSize: "clamp(1.9rem, 5vw, 2.6rem)", fontWeight: 800, color: "#000", lineHeight: 1.2, marginBottom: 8 }}>{doc.title}</h1>
        <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: 13.5, color: "var(--ds-text-faint)", marginBottom: 28 }}>{doc.updated}</p>
        <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: 16, color: "var(--ds-text-sec)", lineHeight: 1.75, marginBottom: 8 }}>{doc.intro}</p>

        {doc.sections.map((s) => (
          <div key={s.h}>
            <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 21, fontWeight: 800, color: "#000", margin: "28px 0 8px" }}>{s.h}</h2>
            {s.p.map((para, i) => (
              <p key={i} style={{ fontFamily: "'Outfit', sans-serif", fontSize: 16, color: "var(--ds-text-sec)", lineHeight: 1.75, marginBottom: 14 }}>{para}</p>
            ))}
          </div>
        ))}
      </div>
    </section>
  )
}
