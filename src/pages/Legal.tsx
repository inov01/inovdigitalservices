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
    intro: "Chez INOV Digital Services (« INOV », « nous », « notre » ou « nos »), la protection de votre vie privée n'est pas une formalité : c'est une condition de la confiance que vous nous accordez lorsque vous nous confiez votre marque, vos projets et vos informations. La présente Politique de confidentialité (la « Politique ») décrit de manière détaillée et transparente les catégories de données à caractère personnel que nous collectons, les finalités et les bases légales de leur traitement, les tiers avec lesquels nous pouvons être amenés à les partager, les durées pendant lesquelles nous les conservons, les mesures que nous mettons en œuvre pour les sécuriser, ainsi que l'ensemble des droits dont vous disposez et la manière concrète de les exercer. Elle s'applique au site inovdigitalservices.com, à ses sous-domaines, à l'espace client, aux formulaires, au programme ambassadeur, aux paiements déclarés et à toute interaction que vous avez avec nous par voie électronique. Nous vous invitons à la lire attentivement. En naviguant sur ce site, en créant un compte, en soumettant un formulaire ou en communiquant avec nous, vous reconnaissez avoir pris connaissance des pratiques décrites ci-dessous.",
    sections: [
      { h: "1. Responsable du traitement", p: [
        "Le responsable du traitement des données collectées via ce site est INOV Digital Services, studio de communication visuelle et de conception graphique. C'est l'entité qui détermine les finalités et les moyens du traitement de vos données à caractère personnel au sens de la réglementation applicable en matière de protection des données.",
        "Vous pouvez nous contacter pour toute question relative à cette Politique, à l'exercice de vos droits ou à la protection de vos données à l'adresse électronique inov01contact@gmail.com ou par téléphone au +509 3625-5920. Nous nous efforçons de traiter chaque demande avec sérieux, diligence et confidentialité.",
        "Pour toute demande spécifiquement liée à la vie privée, nous vous recommandons d'indiquer clairement en objet « Confidentialité » ou « Données personnelles » afin que votre message soit orienté et traité dans les meilleurs délais.",
      ] },
      { h: "2. Champ d'application", p: [
        "La présente Politique s'applique à toutes les données à caractère personnel que nous collectons, recevons ou traitons dans le cadre de la mise à disposition de notre site, de nos services et de nos communications, quel que soit le canal utilisé (site web, formulaires, e-mail, messagerie, espace client, programme ambassadeur).",
        "Elle ne s'applique pas aux sites, plateformes ou services tiers vers lesquels nous pouvons renvoyer par des liens hypertextes, ni aux réseaux sociaux sur lesquels nous sommes présents, lesquels disposent de leurs propres politiques de confidentialité que nous vous invitons à consulter séparément.",
        "En cas de contradiction entre la présente Politique et un accord contractuel spécifique signé avec un client, les stipulations de cet accord prévaudront pour ce qui concerne la relation contractuelle en question, sans jamais réduire le niveau de protection légale dont vous bénéficiez.",
      ] },
      { h: "3. Définitions", p: [
        "« Données à caractère personnel » désigne toute information se rapportant à une personne physique identifiée ou identifiable, directement ou indirectement, notamment par référence à un identifiant tel qu'un nom, un numéro de téléphone, une adresse e-mail ou un identifiant en ligne.",
        "« Traitement » désigne toute opération appliquée à des données, telle que la collecte, l'enregistrement, l'organisation, la conservation, la consultation, l'utilisation, la communication, l'effacement ou la destruction.",
        "« Responsable du traitement » désigne l'entité qui détermine les finalités et les moyens du traitement ; « sous-traitant » désigne l'entité qui traite les données pour le compte du responsable du traitement.",
        "« Vous » ou « l'utilisateur » désigne toute personne qui visite le site, soumet un formulaire, crée un compte, effectue un paiement déclaré ou participe au programme ambassadeur.",
      ] },
      { h: "4. Nature de nos services", p: [
        "Pour éviter tout malentendu et pour que vous compreniez exactement quelles données sont nécessaires à nos prestations, nous précisons le périmètre exact de notre activité : INOV Digital Services est un studio de communication visuelle et de conception graphique.",
        "Nous ne proposons pas de service de photographie : nous réalisons de la retouche photo (correction de la lumière et des couleurs, détourage, mise en scène, mockups) à partir de vos images existantes. Les fichiers que vous nous transmettez à cette fin sont traités uniquement pour l'exécution de la prestation.",
        "Nous ne proposons pas de service de vidéographie : nous réalisons le montage (editing) de vos rushes — coupe, sous-titres, habillage, transitions et export optimisé. Les médias que vous nous confiez ne sont pas exploités à d'autres fins que la réalisation de votre projet.",
        "Nous ne proposons pas de service d'impression : nous réalisons la conception des fichiers prêts à imprimer, que vous confiez ensuite à l'imprimeur de votre choix. Nous ne collectons donc aucune donnée logistique ou de livraison physique.",
      ] },
      { h: "5. Données que nous collectons", p: [
        "Données d'identification et de contact : lorsque vous remplissez un formulaire (devis, contact, guide gratuit) ou créez un compte, nous recueillons votre nom, votre adresse e-mail, votre numéro de téléphone (facultatif) ainsi que le contenu du message ou du brief que vous nous transmettez.",
        "Données de compte client : lorsque vous créez un compte, votre adresse e-mail et votre nom sont enregistrés de façon sécurisée afin de vous authentifier, de sécuriser votre session et de vous permettre de suivre vos demandes, devis et commandes.",
        "Données de projet : tout élément que vous nous communiquez pour l'exécution d'une prestation (textes, images, logos existants, éléments de marque, préférences créatives, fichiers sources) est traité strictement dans le cadre du projet concerné.",
        "Données de paiement déclaré : pour un paiement que vous déclarez, nous conservons le moyen choisi (par exemple MonCash, NatCash ou virement), le montant, la référence de transaction que vous saisissez vous-même et les services sélectionnés. Aucune donnée bancaire complète, aucun numéro de carte et aucun identifiant de connexion à un service de paiement ne sont collectés, traités ni stockés par le site.",
        "Données du programme ambassadeur : si vous activez ce programme, nous générons un code de parrainage unique et suivons les commandes rattachées à ce code afin de calculer et de créditer votre récompense.",
        "Données techniques et d'usage : pages visitées, durée de consultation, type d'appareil, navigateur, système d'exploitation, ainsi que des données d'usage agrégées et anonymisées. Vos préférences de langue et de devise sont enregistrées localement sur votre appareil pour améliorer votre confort de navigation.",
      ] },
      { h: "6. Comment et à partir de quelles sources nous collectons vos données", p: [
        "La très grande majorité des données que nous traitons provient directement de vous : ce sont les informations que vous choisissez de nous fournir en remplissant un formulaire, en créant un compte, en déclarant un paiement ou en échangeant avec notre équipe.",
        "Certaines données techniques sont collectées automatiquement lorsque vous naviguez sur le site, au moyen de cookies et de technologies similaires, et uniquement dans les limites de votre consentement lorsque celui-ci est requis.",
        "De façon limitée, nous pouvons recevoir des informations de nos prestataires techniques (par exemple des statistiques d'audience agrégées) ou d'une personne qui vous a parrainé dans le cadre du programme ambassadeur (le rattachement d'une commande à un code de parrainage).",
      ] },
      { h: "7. Finalités du traitement", p: [
        "Nous traitons vos données pour répondre à vos demandes de devis, de contact ou d'information et pour vous adresser le guide gratuit lorsque vous le sollicitez.",
        "Nous les traitons pour créer et gérer votre compte client, vous authentifier, sécuriser votre session et vous permettre de suivre vos demandes et commandes.",
        "Nous les traitons pour exécuter nos prestations, assurer le suivi de projet, échanger avec vous sur les livrables et gérer les révisions convenues.",
        "Nous les traitons pour enregistrer et vérifier les paiements déclarés, gérer le programme ambassadeur et calculer les crédits associés.",
        "Nous les traitons, dans la limite de votre consentement, pour mesurer l'audience du site, améliorer nos services, notre contenu et nos campagnes de communication.",
        "Nous les traitons enfin pour respecter nos obligations légales, prévenir la fraude et faire valoir ou défendre nos droits en cas de litige. Nous ne vendons ni ne louons jamais vos informations à des tiers.",
      ] },
      { h: "8. Cadre juridique et bases légales du traitement", p: [
        "En République d'Haïti, la protection de la vie privée et le secret de la correspondance et de toute forme de communication sont garantis par la Constitution de 1987 (notamment son article 49). À la date de la présente Politique, Haïti ne dispose pas encore d'une loi générale dédiée à la protection des données à caractère personnel ni d'une autorité de contrôle spécialisée ; en conséquence, nous nous engageons volontairement à respecter les standards internationaux reconnus en la matière.",
        "Pour nos clients et utilisateurs situés dans l'Union européenne, le Règlement (UE) 2016/679 (RGPD) peut s'appliquer de manière extraterritoriale ; nous alignons nos pratiques sur ses principes (licéité, minimisation, transparence, sécurité, respect des droits). D'autres régimes étrangers de protection des données peuvent s'appliquer selon votre lieu de résidence.",
        "Sur ce fondement, nous traitons vos données sur l'une des bases suivantes. L'exécution d'un contrat ou de mesures précontractuelles : lorsque le traitement est nécessaire pour répondre à votre demande, établir un devis, exécuter une prestation ou gérer votre compte.",
        "Votre consentement : notamment pour l'utilisation des cookies de mesure d'audience et de publicité, ou pour l'envoi de communications lorsque celui-ci est requis. Vous pouvez retirer votre consentement à tout moment.",
        "Notre intérêt légitime : pour sécuriser le site, prévenir la fraude, améliorer nos services et assurer le bon fonctionnement de notre activité, dans le respect de vos droits et libertés.",
        "Le respect d'une obligation légale : lorsque la conservation ou la communication de certaines données est imposée par la loi applicable.",
      ] },
      { h: "9. Cookies et technologies similaires", p: [
        "Un cookie est un petit fichier déposé sur votre appareil qui permet de reconnaître votre navigateur et de mémoriser certaines informations. Nous utilisons également des technologies similaires (pixels, stockage local) à des fins comparables.",
        "Cookies strictement nécessaires : indispensables au fonctionnement du site, ils gèrent notamment vos préférences de langue et de devise ainsi que votre session de compte. Ils sont toujours actifs car le site ne peut fonctionner correctement sans eux.",
        "Cookies de mesure d'audience et de performance : avec votre consentement, nous utilisons Google Analytics 4 pour comprendre comment le site est utilisé et l'améliorer.",
        "Cookies de marketing et de publicité : avec votre consentement, nous utilisons le Pixel Meta (Facebook) pour mesurer l'efficacité de nos campagnes et adresser des communications pertinentes.",
        "Ces outils non essentiels ne sont activés qu'après votre accord exprès via la bannière de consentement. Vous pouvez refuser, personnaliser ou retirer votre consentement à tout moment, ce qui désactive immédiatement ces mesures pour l'avenir. Vous pouvez également configurer votre navigateur pour bloquer ou supprimer les cookies.",
      ] },
      { h: "10. Partage des données et sous-traitants", p: [
        "Nous ne partageons vos données qu'avec des prestataires de confiance, uniquement dans la mesure nécessaire aux finalités décrites, et sur la base d'engagements contractuels appropriés qui les obligent à protéger vos données et à ne les traiter que pour notre compte.",
        "Supabase : héberge notre base de données, gère l'authentification des comptes clients et exécute nos fonctions serveur (comptes, commandes, programme ambassadeur, paiements déclarés).",
        "Google (Analytics) et Meta (Pixel Facebook) : fournissent nos outils de mesure d'audience et de performance publicitaire, activés uniquement avec votre consentement.",
        "Services de messagerie : vos formulaires et échanges peuvent transiter par notre boîte e-mail afin que nous puissions vous répondre et assurer le suivi.",
        "Nous pouvons également être amenés à divulguer des données lorsque la loi l'exige, pour répondre à une demande d'une autorité compétente, ou pour protéger nos droits, notre sécurité ou ceux d'autrui.",
      ] },
      { h: "11. Transferts internationaux de données", p: [
        "Certains de nos prestataires peuvent héberger ou traiter vos données en dehors de votre pays de résidence, y compris dans des juridictions dont la législation en matière de protection des données peut différer de la vôtre.",
        "Dans ces situations, nous veillons à ce que des garanties appropriées soient mises en place afin d'assurer un niveau de protection adéquat de vos données, conformément aux engagements et aux mécanismes de conformité de ces prestataires.",
      ] },
      { h: "12. Durées de conservation", p: [
        "Nous ne conservons vos données que le temps strictement nécessaire à la réalisation des finalités pour lesquelles elles ont été collectées, augmenté le cas échéant des durées imposées par nos obligations légales.",
        "Demandes de devis et de contact : conservées le temps du traitement de la demande et de la relation qui peut en découler, puis archivées ou supprimées.",
        "Compte client : conservé tant que votre compte est actif ; il est supprimé sur votre demande de fermeture, sous réserve des données que nous devons conserver pour des raisons légales.",
        "Paiements déclarés et données de facturation : conservés pendant la durée requise par nos obligations comptables et légales.",
        "Données du programme ambassadeur : conservées tant que le programme vous concerne et le temps nécessaire au calcul et au versement de vos crédits.",
        "Données de mesure d'audience : conservées pour des durées limitées conformément aux réglages de nos outils et à votre consentement.",
      ] },
      { h: "13. Sécurité des données", p: [
        "Nous mettons en œuvre des mesures techniques et organisationnelles raisonnables et adaptées pour protéger vos données contre la perte, l'accès non autorisé, la divulgation, l'altération ou la destruction, notamment le chiffrement des échanges, l'authentification sécurisée des comptes et la limitation des accès aux seules personnes habilitées.",
        "Aucune méthode de transmission ou de stockage n'étant sûre à 100 %, nous ne pouvons garantir une sécurité absolue ; nous nous engageons toutefois à agir avec diligence et à améliorer continuellement nos pratiques.",
        "Nous vous invitons de votre côté à protéger vos identifiants de compte, à utiliser un mot de passe robuste et à ne le partager avec personne.",
      ] },
      { h: "14. Vos droits", p: [
        "Sous réserve de la réglementation applicable, vous disposez d'un droit d'accès à vos données, afin de savoir si nous traitons des données vous concernant et d'en obtenir une copie.",
        "Vous disposez d'un droit de rectification des données inexactes ou incomplètes, et d'un droit à l'effacement (« droit à l'oubli ») dans les cas prévus par la loi.",
        "Vous disposez d'un droit à la limitation du traitement et d'un droit d'opposition, notamment au traitement à des fins de marketing direct.",
        "Vous disposez d'un droit à la portabilité, vous permettant de récupérer certaines de vos données dans un format structuré et couramment utilisé.",
        "Vous disposez du droit de retirer votre consentement à tout moment, sans que cela n'affecte la licéité des traitements effectués avant ce retrait, ainsi que du droit de fermer votre compte.",
      ] },
      { h: "15. Comment exercer vos droits", p: [
        "Pour exercer l'un de ces droits, il vous suffit de nous écrire à inov01contact@gmail.com en précisant l'objet de votre demande. Nous pourrons être amenés à vérifier votre identité afin de protéger la confidentialité de vos données et d'éviter toute demande frauduleuse.",
        "Nous nous efforçons de répondre à toute demande dans un délai raisonnable et, en tout état de cause, dans les délais prévus par la réglementation applicable. L'exercice de vos droits est gratuit, sauf demande manifestement infondée ou excessive.",
      ] },
      { h: "16. Réclamation auprès d'une autorité", p: [
        "Nous vous encourageons à nous contacter en premier lieu à inov01contact@gmail.com afin que nous puissions comprendre votre préoccupation et y remédier dans les meilleurs délais.",
        "Haïti ne disposant pas encore d'une autorité de contrôle spécialisée en protection des données, un recours peut, le cas échéant, être porté devant les juridictions haïtiennes compétentes sur le fondement des protections constitutionnelles et du droit commun.",
        "Si vous résidez dans un pays doté d'une autorité de protection des données (par exemple au sein de l'Union européenne), vous avez le droit d'introduire une réclamation auprès de l'autorité compétente de votre pays.",
      ] },
      { h: "17. Décisions automatisées et profilage", p: [
        "Nous ne prenons pas de décision produisant des effets juridiques vous concernant ou vous affectant de manière significative sur le seul fondement d'un traitement automatisé, y compris le profilage.",
        "Les outils de mesure d'audience que nous utilisons servent uniquement à des fins statistiques et d'amélioration, et non à prendre des décisions individuelles automatisées.",
      ] },
      { h: "18. Marketing et communications", p: [
        "Nous ne vous adressons de communications commerciales que lorsque vous y avez consenti ou lorsque la loi l'autorise dans le cadre de notre relation. Chaque communication vous offre la possibilité de vous désabonner facilement.",
        "Les messages strictement liés à l'exécution d'une prestation, au suivi d'une commande ou à la sécurité de votre compte ne constituent pas de la prospection commerciale et sont nécessaires à notre relation.",
      ] },
      { h: "19. Liens vers des sites tiers", p: [
        "Notre site peut contenir des liens vers des sites, plateformes ou réseaux sociaux exploités par des tiers. Nous n'exerçons aucun contrôle sur leurs pratiques et déclinons toute responsabilité quant à la manière dont ils traitent vos données.",
        "Nous vous invitons à consulter les politiques de confidentialité de ces tiers avant de leur communiquer des informations.",
      ] },
      { h: "20. Protection des mineurs", p: [
        "Nos services s'adressent à des adultes et à des professionnels. Nous ne collectons pas sciemment de données concernant des mineurs.",
        "Si nous apprenons que des données relatives à un mineur ont été collectées sans le consentement approprié, nous prendrons les mesures nécessaires pour les supprimer dans les meilleurs délais.",
      ] },
      { h: "21. Violation de données", p: [
        "En cas de violation de données susceptible d'engendrer un risque pour vos droits et libertés, nous nous engageons à réagir promptement, à en limiter les conséquences et à vous informer ainsi que, le cas échéant, les autorités compétentes, conformément à la réglementation applicable.",
      ] },
      { h: "22. Modifications de la présente Politique", p: [
        "Nous pouvons mettre à jour cette Politique afin de refléter l'évolution de nos pratiques, de nos outils ou du cadre légal. La date figurant en haut de page indique la dernière révision.",
        "En cas de modification substantielle, nous nous efforcerons de vous en informer par un moyen approprié. Nous vous encourageons à consulter régulièrement cette page.",
      ] },
      { h: "23. Contact", p: [
        "Pour toute question, demande ou préoccupation relative à cette Politique ou à vos données à caractère personnel, vous pouvez nous écrire à inov01contact@gmail.com ou nous appeler au +509 3625-5920. Nous accordons une importance sincère à chacune de vos demandes.",
      ] },
    ],
  },
  en: {
    title: "Privacy Policy",
    updated: "Last updated: September 2026",
    intro: "At INOV Digital Services (« INOV », « we », « us » or « our »), protecting your privacy is not a formality: it is a condition of the trust you place in us when you hand over your brand, your projects and your information. This Privacy Policy (the « Policy ») describes, in a detailed and transparent way, the categories of personal data we collect, the purposes and legal bases for processing them, the third parties with whom we may share them, how long we retain them, the measures we implement to keep them secure, as well as all the rights available to you and the concrete way to exercise them. It applies to the inovdigitalservices.com website, its subdomains, the client area, forms, the ambassador program, declared payments, and any electronic interaction you have with us. We encourage you to read it carefully. By browsing this site, creating an account, submitting a form or communicating with us, you acknowledge that you have read the practices described below.",
    sections: [
      { h: "1. Data controller", p: [
        "The controller of the data collected through this site is INOV Digital Services, a visual communication and graphic design studio. It is the entity that determines the purposes and means of processing your personal data within the meaning of applicable data protection law.",
        "You may contact us with any question about this Policy, the exercise of your rights, or the protection of your data at inov01contact@gmail.com or by phone at +509 3625-5920. We strive to handle every request with seriousness, diligence and confidentiality.",
        "For any request specifically related to privacy, we recommend clearly stating « Privacy » or « Personal data » in the subject line so that your message is routed and handled as quickly as possible.",
      ] },
      { h: "2. Scope", p: [
        "This Policy applies to all personal data we collect, receive or process in connection with providing our site, our services and our communications, regardless of the channel used (website, forms, email, messaging, client area, ambassador program).",
        "It does not apply to third-party sites, platforms or services we may link to, nor to the social networks on which we are present, which have their own privacy policies that we invite you to review separately.",
        "In the event of a conflict between this Policy and a specific contractual agreement signed with a client, the terms of that agreement will prevail for the relevant contractual relationship, without ever reducing the level of legal protection you enjoy.",
      ] },
      { h: "3. Definitions", p: [
        "« Personal data » means any information relating to an identified or identifiable natural person, directly or indirectly, in particular by reference to an identifier such as a name, phone number, email address or online identifier.",
        "« Processing » means any operation applied to data, such as collection, recording, organization, storage, consultation, use, disclosure, erasure or destruction.",
        "« Controller » means the entity that determines the purposes and means of processing; « processor » means the entity that processes data on behalf of the controller.",
        "« You » or « the user » means any person who visits the site, submits a form, creates an account, makes a declared payment or takes part in the ambassador program.",
      ] },
      { h: "4. Nature of our services", p: [
        "To avoid any misunderstanding and so you understand exactly what data our services require, we state the exact scope of our activity: INOV Digital Services is a visual communication and graphic design studio.",
        "We do not offer photography services: we do photo retouching (light and color correction, cut-outs, staging, mockups) from your existing images. The files you send us for this purpose are processed solely to perform the service.",
        "We do not offer videography services: we edit your footage — cuts, subtitles, graphics, transitions and optimized export. The media you entrust to us are not used for any purpose other than completing your project.",
        "We do not offer printing services: we design the print-ready files, which you then send to the printer of your choice. We therefore collect no logistics or physical delivery data.",
      ] },
      { h: "5. Data we collect", p: [
        "Identification and contact data: when you complete a form (quote, contact, free guide) or create an account, we collect your name, email address, phone number (optional) and the content of the message or brief you send us.",
        "Client account data: when you create an account, your email and name are stored securely to authenticate you, secure your session and let you track your requests, quotes and orders.",
        "Project data: anything you share with us to carry out a service (text, images, existing logos, brand assets, creative preferences, source files) is processed strictly within the relevant project.",
        "Declared payment data: for a payment you declare, we keep the chosen method (for example MonCash, NatCash or bank transfer), the amount, the transaction reference you enter yourself and the selected services. No full banking details, card numbers or payment-service login credentials are collected, processed or stored by the site.",
        "Ambassador program data: if you activate it, we generate a unique referral code and track orders tied to that code to calculate and credit your reward.",
        "Technical and usage data: pages visited, time spent, device type, browser, operating system, and aggregated, anonymized usage data. Your language and currency preferences are stored locally on your device to improve your browsing comfort.",
      ] },
      { h: "6. How and from which sources we collect your data", p: [
        "The vast majority of the data we process comes directly from you: the information you choose to provide by filling in a form, creating an account, declaring a payment or interacting with our team.",
        "Some technical data is collected automatically as you browse the site, through cookies and similar technologies, and only within the limits of your consent where it is required.",
        "To a limited extent, we may receive information from our technical providers (for example aggregated audience statistics) or from a person who referred you under the ambassador program (the association of an order with a referral code).",
      ] },
      { h: "7. Purposes of processing", p: [
        "We process your data to respond to your quote, contact or information requests and to send you the free guide when you ask for it.",
        "We process it to create and manage your client account, authenticate you, secure your session and let you track your requests and orders.",
        "We process it to deliver our services, follow up on projects, discuss deliverables with you and manage the agreed revisions.",
        "We process it to record and verify declared payments, manage the ambassador program and calculate the associated credits.",
        "Within the limits of your consent, we process it to measure site traffic and improve our services, content and communication campaigns.",
        "Finally, we process it to comply with our legal obligations, prevent fraud and assert or defend our rights in the event of a dispute. We never sell or rent your information to third parties.",
      ] },
      { h: "8. Legal framework and legal bases for processing", p: [
        "In the Republic of Haiti, privacy and the secrecy of correspondence and all forms of communication are guaranteed by the 1987 Constitution (in particular its article 49). As of the date of this Policy, Haiti does not yet have a general law dedicated to personal-data protection or a specialized supervisory authority; accordingly, we voluntarily commit to complying with recognized international standards in this field.",
        "For our clients and users located in the European Union, Regulation (EU) 2016/679 (GDPR) may apply extraterritorially; we align our practices with its principles (lawfulness, minimization, transparency, security, respect for rights). Other foreign data-protection regimes may apply depending on your place of residence.",
        "On this basis, we process your data on one of the following grounds. Performance of a contract or pre-contractual steps: where processing is necessary to respond to your request, prepare a quote, deliver a service or manage your account.",
        "Your consent: in particular for the use of analytics and advertising cookies, or for sending communications where consent is required. You may withdraw your consent at any time.",
        "Our legitimate interest: to secure the site, prevent fraud, improve our services and ensure the proper running of our business, while respecting your rights and freedoms.",
        "Compliance with a legal obligation: where retention or disclosure of certain data is required by applicable law.",
      ] },
      { h: "9. Cookies and similar technologies", p: [
        "A cookie is a small file placed on your device that allows your browser to be recognized and certain information to be remembered. We also use similar technologies (pixels, local storage) for comparable purposes.",
        "Strictly necessary cookies: essential for the site to function, they manage your language and currency preferences and your account session. They are always active because the site cannot work properly without them.",
        "Analytics and performance cookies: with your consent, we use Google Analytics 4 to understand how the site is used and improve it.",
        "Marketing and advertising cookies: with your consent, we use the Meta (Facebook) Pixel to measure the effectiveness of our campaigns and deliver relevant communications.",
        "These non-essential tools are only enabled after your express agreement via the consent banner. You can decline, customize or withdraw your consent at any time, which immediately disables this measurement going forward. You can also configure your browser to block or delete cookies.",
      ] },
      { h: "10. Data sharing and processors", p: [
        "We share your data only with trusted providers, only to the extent necessary for the purposes described, and on the basis of appropriate contractual commitments that require them to protect your data and process it solely on our behalf.",
        "Supabase: hosts our database, manages client-account authentication and runs our server functions (accounts, orders, ambassador program, declared payments).",
        "Google (Analytics) and Meta (Facebook Pixel): provide our audience-measurement and advertising-performance tools, enabled only with your consent.",
        "Email services: your forms and exchanges may pass through our email inbox so we can reply and follow up.",
        "We may also disclose data where required by law, to respond to a request from a competent authority, or to protect our rights, safety or those of others.",
      ] },
      { h: "11. International data transfers", p: [
        "Some of our providers may host or process your data outside your country of residence, including in jurisdictions whose data-protection laws may differ from yours.",
        "In such cases, we ensure that appropriate safeguards are in place to provide an adequate level of protection for your data, in line with those providers' commitments and compliance mechanisms.",
      ] },
      { h: "12. Retention periods", p: [
        "We keep your data only for as long as strictly necessary to achieve the purposes for which it was collected, plus any periods required by our legal obligations.",
        "Quote and contact requests: kept for the duration of handling the request and any resulting relationship, then archived or deleted.",
        "Client account: kept while your account is active; it is deleted at your request to close it, subject to data we must retain for legal reasons.",
        "Declared payments and billing data: kept for the period required by our accounting and legal obligations.",
        "Ambassador program data: kept while the program concerns you and for the time needed to calculate and pay your credits.",
        "Audience-measurement data: kept for limited periods in line with our tools' settings and your consent.",
      ] },
      { h: "13. Data security", p: [
        "We implement reasonable and appropriate technical and organizational measures to protect your data against loss, unauthorized access, disclosure, alteration or destruction, including encryption of exchanges, secure account authentication and access limited to authorized persons only.",
        "As no method of transmission or storage is 100% secure, we cannot guarantee absolute security; however, we commit to acting diligently and to continuously improving our practices.",
        "For your part, we encourage you to protect your account credentials, use a strong password and never share it with anyone.",
      ] },
      { h: "14. Your rights", p: [
        "Subject to applicable law, you have a right of access to your data, to know whether we process data about you and to obtain a copy of it.",
        "You have a right to rectification of inaccurate or incomplete data, and a right to erasure (« right to be forgotten ») in the cases provided for by law.",
        "You have a right to restriction of processing and a right to object, in particular to processing for direct-marketing purposes.",
        "You have a right to portability, allowing you to retrieve certain of your data in a structured, commonly used format.",
        "You have the right to withdraw your consent at any time, without affecting the lawfulness of processing carried out before withdrawal, as well as the right to close your account.",
      ] },
      { h: "15. How to exercise your rights", p: [
        "To exercise any of these rights, simply write to us at inov01contact@gmail.com stating the purpose of your request. We may need to verify your identity to protect the confidentiality of your data and prevent any fraudulent request.",
        "We strive to respond to any request within a reasonable time and, in any event, within the timeframes required by applicable law. Exercising your rights is free of charge, except for a manifestly unfounded or excessive request.",
      ] },
      { h: "16. Complaint to an authority", p: [
        "We encourage you to contact us first at inov01contact@gmail.com so we can understand your concern and address it as quickly as possible.",
        "As Haiti does not yet have a specialized data-protection supervisory authority, a claim may, where applicable, be brought before the competent Haitian courts on the basis of constitutional protections and general law.",
        "If you reside in a country with a data-protection authority (for example within the European Union), you have the right to lodge a complaint with the competent authority in your country.",
      ] },
      { h: "17. Automated decisions and profiling", p: [
        "We do not make decisions producing legal effects concerning you, or significantly affecting you, based solely on automated processing, including profiling.",
        "The audience-measurement tools we use serve statistical and improvement purposes only, not automated individual decision-making.",
      ] },
      { h: "18. Marketing and communications", p: [
        "We only send you commercial communications where you have consented or where the law allows it within our relationship. Every communication offers an easy way to unsubscribe.",
        "Messages strictly related to delivering a service, tracking an order or securing your account are not commercial solicitation and are necessary to our relationship.",
      ] },
      { h: "19. Links to third-party sites", p: [
        "Our site may contain links to sites, platforms or social networks operated by third parties. We have no control over their practices and disclaim any liability for how they handle your data.",
        "We invite you to review those third parties' privacy policies before sharing any information with them.",
      ] },
      { h: "20. Protection of minors", p: [
        "Our services are intended for adults and professionals. We do not knowingly collect data about minors.",
        "If we learn that data relating to a minor has been collected without appropriate consent, we will take the necessary steps to delete it as soon as possible.",
      ] },
      { h: "21. Data breach", p: [
        "In the event of a data breach likely to create a risk to your rights and freedoms, we commit to reacting promptly, limiting its consequences and informing you and, where applicable, the competent authorities, in accordance with applicable law.",
      ] },
      { h: "22. Changes to this Policy", p: [
        "We may update this Policy to reflect changes in our practices, tools or the legal framework. The date at the top of the page indicates the latest revision.",
        "In the event of a material change, we will endeavor to inform you by an appropriate means. We encourage you to review this page regularly.",
      ] },
      { h: "23. Contact", p: [
        "For any question, request or concern about this Policy or your personal data, you can write to us at inov01contact@gmail.com or call us at +509 3625-5920. We sincerely value every request you make.",
      ] },
    ],
  },
}

const TERMS: Record<string, Doc> = {
  fr: {
    title: "Mentions légales et conditions générales",
    updated: "Dernière mise à jour : août 2026",
    intro: "Les présentes mentions légales et conditions générales (les « Conditions ») encadrent l'accès et l'utilisation du site inovdigitalservices.com (le « Site ») ainsi que l'ensemble des prestations proposées par INOV Digital Services (le « Studio », « nous », « notre » ou « nos »). Elles constituent le socle contractuel de la relation entre le Studio et toute personne physique ou morale (le « Client » ou « vous ») qui consulte le Site, sollicite un devis, passe commande ou bénéficie de nos services. En naviguant sur le Site, en soumettant un formulaire ou en validant un devis, vous reconnaissez avoir pris connaissance des présentes Conditions, les comprendre et les accepter sans réserve. Nous vous invitons à les lire attentivement et à les conserver. Si vous n'acceptez pas tout ou partie de ces Conditions, nous vous remercions de ne pas utiliser le Site ni nos services.",
    sections: [
      { h: "1. Éditeur du Site et identification légale", p: [
        "Le présent Site est édité et exploité par INOV Digital Services, studio de communication visuelle et de conception graphique, établi en République d'Haïti.",
        "Forme juridique : [à compléter : entreprise individuelle / société]. Numéro d'Identification Fiscale (NIF) délivré par la Direction Générale des Impôts (DGI) : [à compléter]. Patente / immatriculation auprès du Ministère du Commerce et de l'Industrie (MCI) : [à compléter]. Siège / adresse professionnelle : [à compléter].",
        "Contact : inov01contact@gmail.com — +509 3625-5920. Toute correspondance relative au Site, aux commandes ou aux présentes Conditions peut être adressée à cette adresse électronique.",
        "Le directeur de la publication est le représentant légal du Studio.",
      ] },
      { h: "2. Hébergement et infrastructure technique", p: [
        "Le Site s'appuie sur des prestataires d'hébergement et d'infrastructure tiers, notamment pour l'hébergement de la base de données, l'authentification des comptes clients et l'exécution des fonctions serveur.",
        "Ces prestataires peuvent héberger des données sur des infrastructures situées en dehors du pays de résidence du Client, dans le respect de leurs propres engagements de sécurité et de conformité.",
      ] },
      { h: "3. Objet et acceptation", p: [
        "Les présentes Conditions ont pour objet de définir les règles d'accès et d'utilisation du Site ainsi que les modalités de commande, d'exécution, de livraison et de paiement de nos prestations.",
        "Toute commande implique l'acceptation pleine et entière des présentes Conditions, qui prévalent sur tout document contraire émanant du Client, sauf accord écrit et exprès du Studio.",
        "Le Studio se réserve le droit de modifier les présentes Conditions à tout moment ; les Conditions applicables sont celles en vigueur à la date de validation du devis par le Client.",
      ] },
      { h: "4. Description et périmètre des services", p: [
        "Le Studio propose des prestations de branding, d'identité visuelle, de design graphique, de conception de supports de communication et de communication visuelle, telles que détaillées dans chaque devis.",
        "Nous ne proposons pas de service de photographie : nous réalisons de la retouche photo à partir de vos images existantes (correction de la lumière et des couleurs, détourage, mise en scène, mockups).",
        "Nous ne proposons pas de service de vidéographie : nous réalisons le montage de vos rushes (coupe, sous-titres, habillage, transitions et export optimisé).",
        "Nous ne proposons pas de service d'impression : nous concevons des fichiers prêts à imprimer que vous confiez ensuite à l'imprimeur de votre choix. Le rendu final imprimé relève de la responsabilité de l'imprimeur.",
      ] },
      { h: "5. Devis, commande et formation du contrat", p: [
        "Toute prestation fait l'objet d'un devis précisant le périmètre, les livrables, le nombre de révisions incluses, les délais indicatifs et le prix.",
        "Le devis est valable pour la durée qui y est mentionnée. Le contrat est formé, et la commande devient ferme, à la double condition de la validation du devis par le Client et du versement de l'acompte prévu.",
        "Toute demande de modification du périmètre après validation (ajout de livrables, changement d'orientation créative majeur) fera l'objet d'un avenant et pourra entraîner un ajustement du prix et des délais.",
      ] },
      { h: "6. Tarifs, devises et taxes", p: [
        "Les tarifs affichés sur le Site sont indicatifs et peuvent varier selon la devise, la région et le périmètre final du projet. Seul le prix figurant sur le devis validé fait foi.",
        "Les prix peuvent être exprimés dans différentes devises ; le taux de conversion appliqué est celui en vigueur au moment de l'établissement du devis.",
        "Le cas échéant, les taxes applicables sont indiquées ou ajoutées conformément à la réglementation en vigueur.",
      ] },
      { h: "7. Modalités de paiement", p: [
        "Toute commande démarre après versement d'un acompte de 70 % du montant convenu ; le solde de 30 % est réglé à la livraison, avant la remise des fichiers sources définitifs.",
        "Les paiements (MonCash, NatCash, virement ou tout autre moyen convenu) sont déclarés par le Client puis vérifiés manuellement par le Studio avant le démarrage de la production. Les services de monnaie électronique et de paiement mobile utilisés (notamment MonCash et NatCash) sont opérés par des tiers agréés et supervisés par la Banque de la République d'Haïti (BRH) ; le Studio n'intervient pas dans le traitement bancaire de la transaction et n'accède à aucune donnée de compte du prestataire de paiement.",
        "Le Client est seul responsable de l'exactitude de la référence de transaction qu'il communique. Un paiement non vérifiable ou erroné peut retarder le démarrage de la prestation.",
        "En cas de retard de paiement du solde, le Studio se réserve le droit de suspendre la livraison des fichiers jusqu'au règlement complet.",
      ] },
      { h: "8. Délais, collaboration et livraison", p: [
        "Les délais annoncés sont indicatifs et courent à compter de la réception de l'acompte et de l'ensemble des éléments nécessaires à la réalisation du projet (brief validé, textes, images, éléments de marque).",
        "La bonne exécution de la prestation suppose une collaboration active du Client : réponses aux questions, validations dans des délais raisonnables et transmission d'éléments conformes. Tout retard imputable au Client prolonge d'autant les délais.",
        "Les livrables sont transmis par voie électronique dans les formats convenus. La livraison est réputée effectuée à la mise à disposition des fichiers.",
      ] },
      { h: "9. Obligations du Client", p: [
        "Le Client garantit détenir l'ensemble des droits et autorisations nécessaires sur les éléments qu'il transmet (textes, images, logos, marques, contenus) et garantit le Studio contre tout recours d'un tiers à ce titre.",
        "Le Client s'engage à fournir des informations exactes et à ne pas utiliser les livrables à des fins illicites, trompeuses ou contraires à l'ordre public.",
        "Le Client demeure responsable de la sauvegarde des fichiers qui lui sont remis.",
      ] },
      { h: "10. Révisions et modifications", p: [
        "Chaque prestation inclut le nombre de révisions précisé dans le devis. Une révision correspond à un ensemble de retours regroupés portant sur un même livrable.",
        "Des révisions supplémentaires, ou une réorientation créative allant au-delà du brief initialement validé, peuvent faire l'objet d'un supplément convenu à l'avance.",
        "Si un livrable ne correspond pas au brief validé, le Studio le corrige dans le cadre des révisions prévues, sans frais additionnels.",
      ] },
      { h: "11. Annulation et remboursement", p: [
        "Avant le démarrage de la production, l'acompte est remboursable intégralement sur simple demande écrite.",
        "Une fois le travail commencé (recherche, concepts, création), l'acompte couvre le temps et les ressources déjà engagés et n'est pas remboursable.",
        "Aucun remboursement n'est dû pour un travail déjà livré et conforme au brief validé. En cas d'annulation par le Client en cours de projet, les prestations déjà réalisées restent dues au prorata.",
        "Le Studio se réserve le droit de refuser ou d'interrompre une prestation en cas de manquement du Client à ses obligations, notamment de paiement.",
      ] },
      { h: "12. Propriété intellectuelle", p: [
        "Les visuels, concepts, maquettes, logos et contenus créés par le Studio restent sa propriété exclusive jusqu'au paiement intégral du prix convenu.",
        "Après paiement complet, les droits d'utilisation sur le livrable final validé sont transférés au Client selon l'étendue précisée au devis. Sauf mention contraire, les fichiers sources de travail, propositions non retenues et éléments intermédiaires restent la propriété du Studio.",
        "Le Studio conserve le droit de mentionner la réalisation à titre de référence et de la présenter dans son portfolio, sauf accord de confidentialité contraire.",
        "Toute reproduction, représentation ou exploitation du Site ou de ses contenus (textes, images, structure, code) sans autorisation écrite préalable est interdite.",
      ] },
      { h: "13. Portfolio, références et droit à l'image", p: [
        "Les travaux clients présentés dans notre portfolio le sont avec l'accord des clients concernés. Un Client peut demander le retrait de ses visuels à tout moment en nous écrivant.",
        "Le Client autorise, sauf refus exprès de sa part, le Studio à citer son nom et à présenter les réalisations effectuées à des fins de promotion et de démonstration de savoir-faire.",
      ] },
      { h: "14. Confidentialité", p: [
        "Chaque partie s'engage à préserver la confidentialité des informations non publiques échangées dans le cadre de la prestation et à ne pas les divulguer à des tiers sans autorisation, sauf obligation légale.",
        "Cet engagement demeure applicable pendant toute la durée de la relation et se poursuit après la fin de la prestation.",
      ] },
      { h: "15. Programme ambassadeur", p: [
        "Le Studio peut proposer un programme ambassadeur permettant au Client d'obtenir un crédit sur les commandes confirmées rattachées à son code de parrainage unique.",
        "Le montant, les conditions et les modalités de versement du crédit sont précisés dans l'espace client et peuvent évoluer. Tout usage frauduleux du programme (auto-parrainage abusif, création de faux comptes, manipulation des références) entraîne l'annulation des crédits et la fermeture du compte.",
      ] },
      { h: "16. Formations", p: [
        "Le Studio peut proposer des formations dont le contenu, la durée, le format et le prix sont précisés au moment de l'inscription.",
        "Les supports de formation sont protégés par le droit de la propriété intellectuelle et sont réservés à l'usage personnel du participant ; toute rediffusion ou revente est interdite.",
      ] },
      { h: "17. Garanties et limitation de responsabilité", p: [
        "Le Studio s'engage à exécuter ses prestations avec professionnalisme, dans le respect des règles de l'art et du brief validé. Il est tenu à une obligation de moyens et non de résultat quant aux performances commerciales, à la notoriété ou aux résultats économiques que le Client pourrait attendre des livrables.",
        "Le Studio ne saurait être tenu responsable des dommages indirects, tels qu'une perte de chiffre d'affaires, de clientèle, de données ou d'image, résultant de l'utilisation ou de l'impossibilité d'utiliser les livrables ou le Site.",
        "Dans toute la mesure permise par la loi, la responsabilité du Studio, si elle est engagée, est limitée au montant effectivement payé par le Client pour la prestation concernée.",
        "Le Studio ne garantit pas que le Site sera exempt d'interruptions ou d'erreurs et se réserve le droit d'en suspendre l'accès pour maintenance ou mise à jour.",
      ] },
      { h: "18. Force majeure", p: [
        "Le Studio ne saurait être tenu responsable d'un manquement à ses obligations résultant d'un cas de force majeure ou d'un événement échappant à son contrôle raisonnable (catastrophe naturelle, coupure d'électricité ou d'accès à internet prolongée, troubles, défaillance d'un prestataire tiers, entre autres).",
        "Les délais sont alors suspendus pour la durée de l'événement, et les parties se concertent de bonne foi pour la suite de la relation.",
      ] },
      { h: "19. Protection des données personnelles", p: [
        "Le traitement des données à caractère personnel dans le cadre de l'utilisation du Site et de nos services est décrit dans notre Politique de confidentialité, qui fait partie intégrante des présentes Conditions.",
        "Nous vous invitons à la consulter pour connaître vos droits et la manière dont nous protégeons vos informations.",
      ] },
      { h: "20. Liens externes", p: [
        "Le Site peut renvoyer vers des sites ou plateformes tiers. Le Studio n'exerce aucun contrôle sur ces ressources et décline toute responsabilité quant à leur contenu, leur disponibilité ou leurs pratiques.",
      ] },
      { h: "21. Nullité partielle et non-renonciation", p: [
        "Si une stipulation des présentes Conditions était déclarée nulle ou inapplicable, les autres stipulations conserveraient leur pleine force et valeur.",
        "Le fait pour le Studio de ne pas se prévaloir d'un droit ou d'une disposition ne saurait valoir renonciation à ce droit ou à cette disposition.",
      ] },
      { h: "22. Droit applicable et règlement des litiges", p: [
        "Les présentes Conditions, ainsi que la formation, l'interprétation et l'exécution du contrat, sont régies par le droit de la République d'Haïti, notamment le Code civil haïtien pour les obligations conventionnelles et le Code de commerce haïtien pour les actes de commerce.",
        "Lorsque le Client réside hors d'Haïti, les présentes Conditions s'appliquent sous réserve des dispositions impératives de protection du consommateur de son pays de résidence habituelle qui ne peuvent être écartées par contrat.",
        "En cas de différend, les parties s'engagent à rechercher prioritairement une solution amiable en nous écrivant à inov01contact@gmail.com. À défaut d'accord amiable dans un délai raisonnable, le litige sera porté devant les tribunaux compétents de la République d'Haïti, sans préjudice des règles impératives de compétence applicables au Client consommateur.",
      ] },
      { h: "23. Contact", p: [
        "Pour toute question relative aux présentes Conditions, à un devis ou à une commande, vous pouvez nous écrire à inov01contact@gmail.com ou nous appeler au +509 3625-5920.",
      ] },
    ],
  },
  en: {
    title: "Legal Notice and Terms",
    updated: "Last updated: August 2026",
    intro: "These legal notices and general terms (the « Terms ») govern access to and use of the inovdigitalservices.com website (the « Site ») and all services offered by INOV Digital Services (the « Studio », « we », « us » or « our »). They form the contractual basis of the relationship between the Studio and any individual or entity (the « Client » or « you ») who visits the Site, requests a quote, places an order or benefits from our services. By browsing the Site, submitting a form or approving a quote, you acknowledge that you have read, understood and unreservedly accepted these Terms. We encourage you to read them carefully and keep a copy. If you do not accept all or part of these Terms, please do not use the Site or our services.",
    sections: [
      { h: "1. Site publisher and legal identification", p: [
        "This Site is published and operated by INOV Digital Services, a visual communication and graphic design studio established in the Republic of Haiti.",
        "Legal form: [to be completed: sole proprietorship / company]. Tax Identification Number (NIF) issued by the Directorate General of Taxes (DGI): [to be completed]. Business license (patente) / registration with the Ministry of Commerce and Industry (MCI): [to be completed]. Registered / business address: [to be completed].",
        "Contact: inov01contact@gmail.com — +509 3625-5920. Any correspondence about the Site, orders or these Terms may be sent to this email address.",
        "The publication director is the Studio's legal representative.",
      ] },
      { h: "2. Hosting and technical infrastructure", p: [
        "The Site relies on third-party hosting and infrastructure providers, in particular for database hosting, client-account authentication and running server functions.",
        "These providers may host data on infrastructure located outside the Client's country of residence, in compliance with their own security and compliance commitments.",
      ] },
      { h: "3. Purpose and acceptance", p: [
        "These Terms set out the rules for accessing and using the Site as well as the conditions for ordering, delivering, providing and paying for our services.",
        "Any order implies full and unreserved acceptance of these Terms, which prevail over any conflicting document from the Client, unless expressly agreed in writing by the Studio.",
        "The Studio reserves the right to amend these Terms at any time; the applicable Terms are those in force on the date the Client approves the quote.",
      ] },
      { h: "4. Description and scope of services", p: [
        "The Studio provides branding, visual identity, graphic design, communication-material design and visual communication services, as detailed in each quote.",
        "We do not offer photography services: we do photo retouching from your existing images (light and color correction, cut-outs, staging, mockups).",
        "We do not offer videography services: we edit your footage (cuts, subtitles, graphics, transitions and optimized export).",
        "We do not offer printing services: we design print-ready files that you then send to the printer of your choice. The final printed result is the printer's responsibility.",
      ] },
      { h: "5. Quotes, orders and contract formation", p: [
        "Every service is the subject of a quote specifying the scope, deliverables, number of included revisions, indicative deadlines and price.",
        "The quote is valid for the period stated on it. The contract is formed, and the order becomes firm, subject to both the Client's approval of the quote and payment of the required deposit.",
        "Any request to change the scope after approval (adding deliverables, a major creative reorientation) will be the subject of an addendum and may lead to an adjustment of price and deadlines.",
      ] },
      { h: "6. Prices, currencies and taxes", p: [
        "Prices displayed on the Site are indicative and may vary with currency, region and the final scope of the project. Only the price on the approved quote is binding.",
        "Prices may be expressed in different currencies; the conversion rate applied is the one in force when the quote is prepared.",
        "Where applicable, taxes are indicated or added in accordance with the regulations in force.",
      ] },
      { h: "7. Payment terms", p: [
        "Every order starts after a 70% deposit of the agreed amount; the remaining 30% balance is due on delivery, before the final source files are handed over.",
        "Payments (MonCash, NatCash, bank transfer or any other agreed method) are declared by the Client and manually verified by the Studio before production begins. The electronic-money and mobile-payment services used (in particular MonCash and NatCash) are operated by licensed third parties supervised by the Bank of the Republic of Haiti (BRH); the Studio plays no part in the banking processing of the transaction and accesses no account data from the payment provider.",
        "The Client is solely responsible for the accuracy of the transaction reference provided. An unverifiable or incorrect payment may delay the start of the service.",
        "In the event of late payment of the balance, the Studio reserves the right to withhold delivery of the files until full settlement.",
      ] },
      { h: "8. Deadlines, collaboration and delivery", p: [
        "Stated deadlines are indicative and run from receipt of the deposit and of all elements needed to carry out the project (approved brief, text, images, brand assets).",
        "Proper performance requires the Client's active collaboration: answering questions, approving within reasonable timeframes and providing compliant materials. Any delay attributable to the Client extends the deadlines accordingly.",
        "Deliverables are sent electronically in the agreed formats. Delivery is deemed complete when the files are made available.",
      ] },
      { h: "9. Client obligations", p: [
        "The Client warrants that it holds all rights and authorizations over the elements it provides (text, images, logos, trademarks, content) and indemnifies the Studio against any third-party claim in this respect.",
        "The Client undertakes to provide accurate information and not to use the deliverables for unlawful, misleading or public-order-infringing purposes.",
        "The Client remains responsible for backing up the files delivered to it.",
      ] },
      { h: "10. Revisions and changes", p: [
        "Each service includes the number of revisions stated in the quote. A revision is a consolidated set of feedback on a single deliverable.",
        "Additional revisions, or a creative reorientation beyond the initially approved brief, may incur a surcharge agreed in advance.",
        "If a deliverable does not match the approved brief, the Studio corrects it within the planned revisions at no extra cost.",
      ] },
      { h: "11. Cancellation and refunds", p: [
        "Before production begins, the deposit is fully refundable upon simple written request.",
        "Once work has started (research, concepts, creation), the deposit covers the time and resources already committed and is non-refundable.",
        "No refund is due for work already delivered that matches the approved brief. If the Client cancels mid-project, the services already performed remain payable on a pro-rata basis.",
        "The Studio reserves the right to refuse or stop a service if the Client breaches its obligations, in particular payment.",
      ] },
      { h: "12. Intellectual property", p: [
        "The visuals, concepts, mockups, logos and content created by the Studio remain its exclusive property until full payment of the agreed price.",
        "After full payment, usage rights to the approved final deliverable are transferred to the Client to the extent specified in the quote. Unless otherwise stated, working source files, rejected proposals and intermediate elements remain the Studio's property.",
        "The Studio retains the right to reference the work and present it in its portfolio, unless a confidentiality agreement provides otherwise.",
        "Any reproduction, representation or use of the Site or its content (text, images, structure, code) without prior written authorization is prohibited.",
      ] },
      { h: "13. Portfolio, references and image rights", p: [
        "Client work shown in our portfolio is displayed with the consent of the clients concerned. A Client may request removal of their visuals at any time by writing to us.",
        "Unless the Client expressly objects, the Client authorizes the Studio to cite its name and present the completed work for promotion and demonstration of expertise.",
      ] },
      { h: "14. Confidentiality", p: [
        "Each party undertakes to keep confidential the non-public information exchanged during the service and not to disclose it to third parties without authorization, except where legally required.",
        "This commitment applies throughout the relationship and continues after the service ends.",
      ] },
      { h: "15. Ambassador program", p: [
        "The Studio may offer an ambassador program allowing the Client to earn a credit on confirmed orders tied to its unique referral code.",
        "The amount, conditions and payment terms of the credit are set out in the client area and may change. Any fraudulent use of the program (abusive self-referral, fake accounts, manipulation of references) results in cancellation of credits and closure of the account.",
      ] },
      { h: "16. Training", p: [
        "The Studio may offer training whose content, duration, format and price are specified at registration.",
        "Training materials are protected by intellectual property law and are reserved for the participant's personal use; any redistribution or resale is prohibited.",
      ] },
      { h: "17. Warranties and limitation of liability", p: [
        "The Studio undertakes to perform its services professionally, in line with industry standards and the approved brief. It has an obligation of means, not of result, as to the commercial performance, visibility or economic outcomes the Client may expect from the deliverables.",
        "The Studio cannot be held liable for indirect damages, such as loss of revenue, clientele, data or reputation, resulting from the use of, or inability to use, the deliverables or the Site.",
        "To the fullest extent permitted by law, the Studio's liability, if any, is limited to the amount actually paid by the Client for the relevant service.",
        "The Studio does not warrant that the Site will be free of interruptions or errors and reserves the right to suspend access for maintenance or updates.",
      ] },
      { h: "18. Force majeure", p: [
        "The Studio cannot be held liable for a failure to perform its obligations resulting from force majeure or an event beyond its reasonable control (natural disaster, prolonged loss of electricity or internet access, unrest, failure of a third-party provider, among others).",
        "Deadlines are then suspended for the duration of the event, and the parties consult in good faith on how to continue the relationship.",
      ] },
      { h: "19. Personal data protection", p: [
        "The processing of personal data in connection with the use of the Site and our services is described in our Privacy Policy, which forms an integral part of these Terms.",
        "We invite you to review it to learn about your rights and how we protect your information.",
      ] },
      { h: "20. External links", p: [
        "The Site may link to third-party sites or platforms. The Studio has no control over these resources and disclaims any liability for their content, availability or practices.",
      ] },
      { h: "21. Severability and non-waiver", p: [
        "If any provision of these Terms is declared void or unenforceable, the remaining provisions retain their full force and effect.",
        "The Studio's failure to enforce a right or provision shall not be deemed a waiver of that right or provision.",
      ] },
      { h: "22. Governing law and dispute resolution", p: [
        "These Terms, as well as the formation, interpretation and performance of the contract, are governed by the law of the Republic of Haiti, in particular the Haitian Civil Code for contractual obligations and the Haitian Commercial Code for commercial acts.",
        "Where the Client resides outside Haiti, these Terms apply subject to the mandatory consumer-protection provisions of the Client's country of habitual residence that cannot be waived by contract.",
        "In the event of a dispute, the parties undertake to seek an amicable solution first by writing to inov01contact@gmail.com. Failing an amicable agreement within a reasonable time, the dispute will be brought before the competent courts of the Republic of Haiti, without prejudice to the mandatory jurisdiction rules applicable to the consumer Client.",
      ] },
      { h: "23. Contact", p: [
        "For any question about these Terms, a quote or an order, you can write to us at inov01contact@gmail.com or call us at +509 3625-5920.",
      ] },
    ],
  },
}

// ── Clauses spécifiques à la juridiction ──────────────────────────────────
// Le texte varie selon que l'utilisateur est situé en Haïti (« ht ») ou à
// l'étranger (« intl »). La version « intl » ajoute des protections renforcées
// (consentement au transfert vers Haïti, renonciation aux actions collectives,
// indemnisation, prescription contractuelle abrégée, « en l'état »).
type Scope = "ht" | "intl"
type Extra = { banner: string; sections: Section[] }

const PRIVACY_EXTRA: Record<Scope, Record<string, Extra>> = {
  ht: {
    fr: {
      banner: "Version applicable aux personnes situées en Haïti. Vos données sont traitées sous l'empire du droit haïtien.",
      sections: [
        { h: "Résidents en Haïti — droit applicable à vos données", p: [
          "Si vous êtes situé en Haïti, le traitement de vos données à caractère personnel est soumis au droit de la République d'Haïti et aux protections de la Constitution de 1987, notamment le secret de la correspondance et des communications (article 49).",
          "En l'absence, à ce jour, d'une loi haïtienne générale dédiée à la protection des données et d'une autorité de contrôle spécialisée, tout recours relatif à vos données relève des juridictions haïtiennes compétentes, sur le fondement des protections constitutionnelles et du droit commun.",
          "Nous nous engageons néanmoins à appliquer volontairement les standards internationaux de protection des données décrits dans la présente Politique, sans que cela ne crée d'obligation excédant le droit haïtien applicable.",
        ] },
      ],
    },
    en: {
      banner: "Version applicable to persons located in Haiti. Your data is processed under Haitian law.",
      sections: [
        { h: "Residents in Haiti — law applicable to your data", p: [
          "If you are located in Haiti, the processing of your personal data is subject to the law of the Republic of Haiti and to the protections of the 1987 Constitution, in particular the secrecy of correspondence and communications (article 49).",
          "In the absence, to date, of a general Haitian law dedicated to data protection and of a specialized supervisory authority, any claim relating to your data falls within the competent Haitian courts, on the basis of constitutional protections and general law.",
          "We nonetheless commit to voluntarily applying the international data-protection standards described in this Policy, without this creating any obligation exceeding applicable Haitian law.",
        ] },
      ],
    },
  },
  intl: {
    fr: {
      banner: "Version applicable aux personnes situées hors d'Haïti. Nos services sont fournis depuis la République d'Haïti.",
      sections: [
        { h: "Utilisateurs situés hors d'Haïti — transferts et lois étrangères", p: [
          "INOV Digital Services est établi en République d'Haïti et fournit ses services depuis Haïti. En utilisant le Site, en créant un compte ou en nous transmettant des données, vous comprenez et acceptez que vos données soient transférées, stockées et traitées en Haïti et auprès de nos sous-traitants, qui peuvent être situés dans d'autres pays dont la législation peut différer de celle de votre pays de résidence.",
          "Nous mettons en œuvre des garanties raisonnables pour protéger ces transferts. Dans la mesure permise par la loi, vous consentez expressément à ce transfert international lorsqu'un tel consentement est requis.",
          "Selon votre lieu de résidence, des régimes étrangers peuvent vous accorder des droits spécifiques : par exemple le Règlement (UE) 2016/679 (RGPD) pour les personnes situées dans l'Union européenne, ou des lois comparables ailleurs. Nous nous efforçons d'honorer ces droits lorsqu'ils s'appliquent, dans les limites de nos obligations légales.",
        ] },
        { h: "Limitation en matière de traitement des données", p: [
          "Dans toute la mesure permise par la loi applicable, et sans réduire les droits impératifs dont vous bénéficiez, notre responsabilité éventuelle liée au traitement de vos données est limitée aux dommages directs prouvés et ne saurait excéder les plafonds prévus par nos conditions ou, à défaut, un montant raisonnable correspondant aux sommes que vous nous avez versées.",
          "Vous reconnaissez que la transmission de données par internet comporte des risques inhérents que nous ne pouvons éliminer entièrement malgré nos mesures de sécurité.",
        ] },
      ],
    },
    en: {
      banner: "Version applicable to persons located outside Haiti. Our services are provided from the Republic of Haiti.",
      sections: [
        { h: "Users located outside Haiti — transfers and foreign laws", p: [
          "INOV Digital Services is established in the Republic of Haiti and provides its services from Haiti. By using the Site, creating an account or sending us data, you understand and agree that your data may be transferred to, stored and processed in Haiti and by our processors, which may be located in other countries whose laws may differ from those of your country of residence.",
          "We implement reasonable safeguards to protect these transfers. To the extent permitted by law, you expressly consent to this international transfer where such consent is required.",
          "Depending on your place of residence, foreign regimes may grant you specific rights: for example Regulation (EU) 2016/679 (GDPR) for persons located in the European Union, or comparable laws elsewhere. We strive to honor these rights where they apply, within the limits of our legal obligations.",
        ] },
        { h: "Limitation regarding data processing", p: [
          "To the fullest extent permitted by applicable law, and without reducing the mandatory rights you enjoy, our potential liability relating to the processing of your data is limited to proven direct damages and shall not exceed the caps set out in our terms or, failing that, a reasonable amount corresponding to the sums you have paid us.",
          "You acknowledge that transmitting data over the internet carries inherent risks that we cannot entirely eliminate despite our security measures.",
        ] },
      ],
    },
  },
}

const TERMS_EXTRA: Record<Scope, Record<string, Extra>> = {
  ht: {
    fr: {
      banner: "Version applicable aux clients résidant en Haïti. Le droit haïtien régit exclusivement la relation.",
      sections: [
        { h: "Clients résidant en Haïti — droit et juridiction", p: [
          "Pour les clients résidant en Haïti, les présentes Conditions et le contrat sont régis exclusivement par le droit de la République d'Haïti, notamment le Code civil et le Code de commerce haïtiens.",
          "Tout litige qui n'aurait pu être résolu à l'amiable sera porté devant les tribunaux compétents de la République d'Haïti, auxquels les parties attribuent compétence exclusive.",
          "La version française des présentes Conditions fait foi entre les parties.",
        ] },
      ],
    },
    en: {
      banner: "Version applicable to clients residing in Haiti. Haitian law exclusively governs the relationship.",
      sections: [
        { h: "Clients residing in Haiti — law and jurisdiction", p: [
          "For clients residing in Haiti, these Terms and the contract are governed exclusively by the law of the Republic of Haiti, in particular the Haitian Civil and Commercial Codes.",
          "Any dispute that could not be resolved amicably will be brought before the competent courts of the Republic of Haiti, to which the parties grant exclusive jurisdiction.",
          "The French version of these Terms prevails between the parties.",
        ] },
      ],
    },
  },
  intl: {
    fr: {
      banner: "Version applicable aux clients résidant hors d'Haïti. Des clauses de protection renforcées s'appliquent.",
      sections: [
        { h: "Clients résidant hors d'Haïti — loi applicable et compétence", p: [
          "Nos services sont fournis depuis la République d'Haïti ; le contrat est réputé formé et exécuté en Haïti. Il est régi par le droit haïtien, sous la seule réserve des dispositions impératives de protection du consommateur du pays de résidence habituelle du Client qui ne peuvent être écartées par contrat.",
          "Sauf disposition impérative contraire, les parties conviennent de soumettre tout litige aux tribunaux compétents de la République d'Haïti. Le Client renonce, dans la mesure permise par la loi applicable, à contester cette compétence pour cause d'inopportunité du for.",
        ] },
        { h: "Indemnisation", p: [
          "Le Client s'engage à garantir, défendre et indemniser INOV Digital Services, ses représentants et collaborateurs, contre toute réclamation, action, perte, dommage ou frais (y compris les frais de défense raisonnables) émanant d'un tiers et résultant : (i) des éléments qu'il nous a fournis (textes, images, logos, marques, contenus) ; (ii) d'une violation par lui des présentes Conditions ou de la loi ; ou (iii) de l'utilisation qu'il fait des livrables après leur remise.",
        ] },
        { h: "Renonciation aux actions collectives", p: [
          "Dans toute la mesure permise par la loi applicable, tout différend sera traité sur une base individuelle. Le Client renonce à participer à une action de groupe, une action collective ou une action représentative à l'encontre du Studio.",
          "Cette clause ne s'applique pas lorsque la loi impérative du pays de résidence du Client l'interdit.",
        ] },
        { h: "Absence de garantie étendue (« en l'état »)", p: [
          "Sauf garanties expressément accordées dans le devis et sous réserve des garanties impératives prévues par la loi, le Site et les livrables sont fournis « en l'état » et « selon disponibilité », sans garantie implicite d'adéquation à un usage particulier, de résultat commercial ou de performance déterminée.",
          "Le Studio ne garantit pas que les livrables produiront un chiffre d'affaires, une notoriété ou tout autre résultat économique donné.",
        ] },
        { h: "Prescription contractuelle", p: [
          "Dans la mesure permise par la loi applicable, toute action ou réclamation relative au contrat ou aux prestations doit être introduite dans un délai de douze (12) mois à compter de la survenance du fait générateur, à défaut de quoi elle sera réputée prescrite et irrecevable.",
        ] },
        { h: "Indépendance des parties et intégralité de l'accord", p: [
          "Les présentes Conditions, le devis validé et la Politique de confidentialité constituent l'intégralité de l'accord entre les parties et remplacent tout échange antérieur. Aucune des parties n'est l'agent, le partenaire ou le représentant de l'autre ; le contrat ne crée aucune société ni entreprise commune.",
        ] },
      ],
    },
    en: {
      banner: "Version applicable to clients residing outside Haiti. Enhanced protective clauses apply.",
      sections: [
        { h: "Clients residing outside Haiti — governing law and jurisdiction", p: [
          "Our services are provided from the Republic of Haiti; the contract is deemed formed and performed in Haiti. It is governed by Haitian law, subject only to the mandatory consumer-protection provisions of the Client's country of habitual residence that cannot be waived by contract.",
          "Unless a mandatory provision requires otherwise, the parties agree to submit any dispute to the competent courts of the Republic of Haiti. The Client waives, to the extent permitted by applicable law, any objection to that jurisdiction on grounds of inconvenient forum.",
        ] },
        { h: "Indemnification", p: [
          "The Client agrees to indemnify, defend and hold harmless INOV Digital Services, its representatives and staff, from any third-party claim, action, loss, damage or cost (including reasonable defense costs) arising from: (i) the elements it provided to us (text, images, logos, trademarks, content); (ii) its breach of these Terms or of the law; or (iii) its use of the deliverables after delivery.",
        ] },
        { h: "Class-action waiver", p: [
          "To the fullest extent permitted by applicable law, any dispute will be handled on an individual basis. The Client waives any right to participate in a class action, collective action or representative action against the Studio.",
          "This clause does not apply where the mandatory law of the Client's country of residence prohibits it.",
        ] },
        { h: "No extended warranty (« as is »)", p: [
          "Except for warranties expressly granted in the quote and subject to mandatory statutory warranties, the Site and deliverables are provided « as is » and « as available », without any implied warranty of fitness for a particular purpose, commercial outcome or specific performance.",
          "The Studio does not warrant that the deliverables will generate any given revenue, visibility or other economic result.",
        ] },
        { h: "Contractual limitation period", p: [
          "To the extent permitted by applicable law, any action or claim relating to the contract or the services must be brought within twelve (12) months of the triggering event, failing which it shall be deemed time-barred and inadmissible.",
        ] },
        { h: "Independence of the parties and entire agreement", p: [
          "These Terms, the approved quote and the Privacy Policy constitute the entire agreement between the parties and supersede any prior exchange. Neither party is the agent, partner or representative of the other; the contract creates no company or joint venture.",
        ] },
      ],
    },
  },
}

export default function Legal({ kind }: { kind: "privacy" | "terms" }) {
  const { lang, region } = useSettings()
  const source = kind === "privacy" ? PRIVACY : TERMS
  const base = source[lang] ?? source.en

  // Haïti → clauses de droit haïtien ; toute autre région → version internationale.
  const scope: Scope = region === "HT" ? "ht" : "intl"
  const extraSrc = (kind === "privacy" ? PRIVACY_EXTRA : TERMS_EXTRA)[scope]
  const extra = extraSrc[lang] ?? extraSrc.en

  // Insère les clauses spécifiques à la juridiction juste avant la section
  // « Contact », qui reste toujours la dernière.
  const head = base.sections.slice(0, -1)
  const contact = base.sections[base.sections.length - 1]
  const sections: Section[] = [...head, ...extra.sections, contact]

  useEffect(() => {
    document.title = `${base.title} — INOV Digital Services`
    window.scrollTo(0, 0)
  }, [base.title])

  return (
    <section style={{ background: "#fff", padding: "40px 0 88px", minHeight: "70vh" }}>
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "0 var(--section-px)" }}>
        <Link
          to="/"
          style={{ display: "inline-flex", alignItems: "center", gap: 8, fontFamily: "'Outfit', sans-serif", fontSize: 14, fontWeight: 700, color: "var(--ds-text-faint)", textDecoration: "none", marginBottom: 32 }}
        >
          <ArrowLeft size={16} /> {BACK[lang] ?? BACK.fr}
        </Link>

        <h1 style={{ fontFamily: "'Outfit', sans-serif", fontSize: "clamp(1.9rem, 5vw, 2.6rem)", fontWeight: 800, color: "#000", lineHeight: 1.2, marginBottom: 8 }}>{base.title}</h1>
        <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: 13.5, color: "var(--ds-text-faint)", marginBottom: 16 }}>{base.updated}</p>

        {/* Bandeau indiquant la version juridictionnelle appliquée. */}
        <p style={{
          fontFamily: "'Outfit', sans-serif", fontSize: 13.5, color: "var(--ds-text-sec)",
          background: "var(--ds-bg-subtle, #f4f4f5)", border: "1px solid var(--ds-border, #e4e4e7)",
          borderRadius: "var(--r-md, 10px)", padding: "12px 16px", lineHeight: 1.6, marginBottom: 24,
        }}>
          {extra.banner}
        </p>

        <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: 16, color: "var(--ds-text-sec)", lineHeight: 1.75, marginBottom: 8 }}>{base.intro}</p>

        {sections.map((s, i) => {
          // Numérotation dynamique : on retire un éventuel préfixe « N. » du
          // libellé source, puis on renumérote selon la position finale.
          const label = s.h.replace(/^\d+\.\s*/, "")
          return (
            <div key={`${i}-${label}`}>
              <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 21, fontWeight: 800, color: "#000", margin: "28px 0 8px" }}>{`${i + 1}. ${label}`}</h2>
              {s.p.map((para, j) => (
                <p key={j} style={{ fontFamily: "'Outfit', sans-serif", fontSize: 16, color: "var(--ds-text-sec)", lineHeight: 1.75, marginBottom: 14 }}>{para}</p>
              ))}
            </div>
          )
        })}
      </div>
    </section>
  )
}
